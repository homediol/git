<?php

namespace App\Providers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(Request $request): void
    {
        $forwardedProto = $request->headers->get('x-forwarded-proto');
        $configuredScheme = parse_url((string) config('app.url'), PHP_URL_SCHEME);

        // Prefer the public proxy scheme when the app is behind Ngrok / another
        // reverse proxy. Keep local HTTP working in development while still
        // forcing HTTPS for proxied / production requests.
        $scheme = $forwardedProto;

        if (!$scheme && app()->environment('production')) {
            $scheme = $configuredScheme;
        }

        if (in_array($scheme, ['http', 'https'], true)) {
            URL::forceScheme($scheme);
        }

        // When the app is opened through a public tunnel like Cloudflare Tunnel,
        // the browser cannot reach the local Vite dev server directly. In that
        // case, force Laravel to serve the compiled assets from public/build.
        if ($this->shouldUseBuiltAssetsForRequest($request)) {
            Vite::useHotFile(storage_path('framework/vite.remote.hot'));
        }

        Vite::prefetch(concurrency: 3);
    }

    private function shouldUseBuiltAssetsForRequest(Request $request): bool
    {
        $forwardedHost = (string) $request->headers->get('x-forwarded-host', '');
        $requestHost = (string) $request->getHost();
        $host = $forwardedHost !== '' ? $forwardedHost : $requestHost;

        if ($host === '') {
            return false;
        }

        $firstHost = trim(explode(',', $host)[0]);
        $normalizedHost = parse_url('http://' . $firstHost, PHP_URL_HOST) ?: $firstHost;
        $normalizedHost = strtolower(trim($normalizedHost, '[]'));

        $localHosts = ['127.0.0.1', 'localhost', '::1'];
        $isTunnelLikeRequest = $request->headers->has('x-forwarded-host')
            || str_contains($normalizedHost, '.trycloudflare.com')
            || str_contains($normalizedHost, '.cfargotunnel.com');

        return $isTunnelLikeRequest && !in_array($normalizedHost, $localHosts, true);
    }
}
