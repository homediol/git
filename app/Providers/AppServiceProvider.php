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

        Vite::prefetch(concurrency: 3);
    }
}
