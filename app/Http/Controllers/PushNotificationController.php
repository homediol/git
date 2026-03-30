<?php

namespace App\Http\Controllers;

use App\Models\FcmToken;
use App\Services\FirebasePushService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PushNotificationController extends Controller
{
    public function storeToken(Request $request): \Illuminate\Http\JsonResponse
    {
        $validated = $request->validate([
            'token' => 'required|string|max:4096',
            'platform' => 'nullable|string|max:120',
            'browser' => 'nullable|string|max:120',
            'device_name' => 'nullable|string|max:255',
            'user_agent' => 'nullable|string|max:2000',
        ]);

        $token = FcmToken::updateOrCreate(
            ['token' => $validated['token']],
            [
                'user_id' => $request->user()->id,
                'platform' => $validated['platform'] ?? null,
                'browser' => $validated['browser'] ?? null,
                'device_name' => $validated['device_name'] ?? null,
                'user_agent' => $validated['user_agent'] ?? $request->userAgent(),
                'last_used_at' => now(),
            ],
        );

        return response()->json([
            'status' => 'ok',
            'token_id' => $token->id,
        ]);
    }

    public function destroyToken(Request $request): \Illuminate\Http\JsonResponse
    {
        $validated = $request->validate([
            'token' => 'required|string|max:4096',
        ]);

        $request->user()
            ->fcmTokens()
            ->where('token', $validated['token'])
            ->delete();

        return response()->json(['status' => 'ok']);
    }

    public function serviceWorker(FirebasePushService $firebasePushService): Response
    {
        $config = $firebasePushService->webConfig();

        $body = view('firebase-messaging-sw', [
            'firebaseConfig' => $config,
            'sdkVersion' => $firebasePushService->sdkVersion(),
            'appUrl' => config('app.url'),
        ])->render();

        return response($body, 200, [
            'Content-Type' => 'application/javascript; charset=UTF-8',
            'Cache-Control' => 'no-store, no-cache, must-revalidate',
            'Service-Worker-Allowed' => '/',
        ]);
    }
}
