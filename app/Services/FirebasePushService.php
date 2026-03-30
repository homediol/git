<?php

namespace App\Services;

use App\Models\FcmToken;
use App\Models\User;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FirebasePushService
{
    public function isConfigured(): bool
    {
        $config = config('services.firebase');
        $webConfig = $config['web'] ?? [];

        return !empty($config['project_id'])
            && !empty($config['client_email'])
            && !empty($config['private_key'])
            && !empty($webConfig['apiKey'])
            && !empty($webConfig['messagingSenderId'])
            && !empty($webConfig['appId'])
            && !empty($webConfig['vapidKey']);
    }

    public function webConfig(): array
    {
        return array_filter(config('services.firebase.web', []), fn ($value) => $value !== null && $value !== '');
    }

    public function sdkVersion(): string
    {
        return config('services.firebase.sdk_version', '10.13.2');
    }

    public function sendToUser(User $user, array $payload): array
    {
        if (!$this->isConfigured()) {
            return ['sent' => 0, 'failed' => 0, 'skipped' => 'firebase_not_configured'];
        }

        $category = $payload['notification_type'] ?? 'general';

        if (!$user->allowsNotificationChannel($category, 'push')) {
            return ['sent' => 0, 'failed' => 0, 'skipped' => 'push_disabled'];
        }

        $tokens = $user->fcmTokens()->get();
        if ($tokens->isEmpty()) {
            return ['sent' => 0, 'failed' => 0, 'skipped' => 'no_tokens'];
        }

        $accessToken = $this->fetchAccessToken();
        if (!$accessToken) {
            return ['sent' => 0, 'failed' => $tokens->count(), 'skipped' => 'access_token_missing'];
        }

        $localized = $this->localizedContent($user, $payload);
        $results = ['sent' => 0, 'failed' => 0];

        foreach ($tokens as $tokenModel) {
            $response = $this->sendMessage($accessToken, $tokenModel, $localized, $payload);

            if ($response?->successful()) {
                $tokenModel->forceFill(['last_used_at' => now()])->save();
                $results['sent']++;
                continue;
            }

            $results['failed']++;
            $this->handleFailedToken($tokenModel, $response);
        }

        return $results;
    }

    public function fetchAccessToken(): ?string
    {
        if (!$this->isConfigured()) {
            return null;
        }

        return Cache::remember('firebase_push_access_token', now()->addMinutes(50), function () {
            $jwt = $this->buildJwt();
            if (!$jwt) {
                return null;
            }

            $response = Http::retry(3, 750)
                ->connectTimeout(10)
                ->timeout(25)
                ->asForm()
                ->post('https://oauth2.googleapis.com/token', [
                    'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                    'assertion' => $jwt,
                ]);

            if (!$response->successful()) {
                Log::warning('firebase_access_token_failed', [
                    'status' => $response->status(),
                    'body' => $response->json() ?: $response->body(),
                ]);

                return null;
            }

            return $response->json('access_token');
        });
    }

    private function sendMessage(string $accessToken, FcmToken $tokenModel, array $localized, array $payload): ?Response
    {
        $projectId = config('services.firebase.project_id');
        $actionUrl = $payload['action_url'] ?? config('app.url');
        $image = $payload['media_type'] === 'image' ? ($payload['media_url'] ?? null) : null;

        $message = [
            'message' => [
                'token' => $tokenModel->token,
                'data' => array_filter([
                    'title' => $localized['title'],
                    'body' => $localized['message'],
                    'action_url' => $actionUrl,
                    'notification_id' => (string) ($payload['notification_id'] ?? ''),
                    'notification_type' => $payload['notification_type'] ?? 'general',
                    'severity' => $payload['type'] ?? 'info',
                    'image' => $image,
                ], fn ($value) => $value !== null && $value !== ''),
                'webpush' => [
                    'headers' => [
                        'Urgency' => 'high',
                    ],
                    'fcm_options' => [
                        'link' => $actionUrl,
                    ],
                ],
            ],
        ];

        return Http::retry(3, 750)
            ->connectTimeout(10)
            ->timeout(25)
            ->withToken($accessToken)
            ->acceptJson()
            ->post(
                "https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send",
                $message,
            );
    }

    private function handleFailedToken(FcmToken $tokenModel, ?Response $response): void
    {
        $error = $response?->json('error') ?? [];
        $details = Arr::get($error, 'details', []);
        $errorCode = Arr::get($error, 'status');

        foreach ($details as $detail) {
            if (Arr::get($detail, 'errorCode') === 'UNREGISTERED') {
                $tokenModel->delete();
                return;
            }
        }

        if (in_array($errorCode, ['NOT_FOUND', 'UNREGISTERED'], true)) {
            $tokenModel->delete();
            return;
        }

        Log::warning('firebase_push_send_failed', [
            'user_id' => $tokenModel->user_id,
            'token_id' => $tokenModel->id,
            'status' => $response?->status(),
            'body' => $response?->json() ?: $response?->body(),
        ]);
    }

    private function localizedContent(User $user, array $payload): array
    {
        $locale = in_array($user->language, ['rw', 'en', 'fr'], true) ? $user->language : 'rw';

        return [
            'title' => $payload["title_{$locale}"] ?? $payload['title'] ?? 'Pavona Studio',
            'message' => $payload["message_{$locale}"] ?? $payload['message'] ?? '',
        ];
    }

    private function buildJwt(): ?string
    {
        $clientEmail = config('services.firebase.client_email');
        $privateKey = $this->normalizedPrivateKey();

        if (!$clientEmail || !$privateKey) {
            return null;
        }

        $header = $this->base64UrlEncode(json_encode([
            'alg' => 'RS256',
            'typ' => 'JWT',
        ]));

        $now = time();
        $payload = $this->base64UrlEncode(json_encode([
            'iss' => $clientEmail,
            'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
            'aud' => 'https://oauth2.googleapis.com/token',
            'iat' => $now,
            'exp' => $now + 3600,
        ]));

        $unsigned = $header . '.' . $payload;
        $signature = '';
        $key = openssl_pkey_get_private($privateKey);

        if (!$key || !openssl_sign($unsigned, $signature, $key, OPENSSL_ALGO_SHA256)) {
            return null;
        }

        return $unsigned . '.' . $this->base64UrlEncode($signature);
    }

    private function normalizedPrivateKey(): ?string
    {
        $privateKey = config('services.firebase.private_key');

        if (!$privateKey) {
            return null;
        }

        return str_replace('\n', "\n", $privateKey);
    }

    private function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }
}
