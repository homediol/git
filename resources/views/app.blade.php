<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" data-theme="light">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        
        <!-- SEO Meta Tags -->
        <meta name="description" content="Pavona Studios - Professional graphic design, branding, and premium printing services. Logo design, vehicle wraps, banners, business cards, and more.">
        <meta name="keywords" content="graphic design, printing services, branding, logo design, vehicle wraps, banners, business cards, t-shirt printing, pavona studios">
        <meta name="author" content="Pavona Studios">
        <meta name="robots" content="index, follow">
        
        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:title" content="{{ config('app.name', 'Pavona Studios') }} - Graphic Design & Premium Printing">
        <meta property="og:description" content="Professional graphic design, branding, and premium printing services that bring your vision to life.">
        <meta property="og:image" content="{{ asset('favicons/favicon.svg') }}">
        
        <!-- Twitter -->
        <meta property="twitter:card" content="summary_large_image">
        <meta property="twitter:url" content="{{ url()->current() }}">
        <meta property="twitter:title" content="{{ config('app.name', 'Pavona Studios') }} - Graphic Design & Premium Printing">
        <meta property="twitter:description" content="Professional graphic design, branding, and premium printing services that bring your vision to life.">
        <meta property="twitter:image" content="{{ asset('favicons/favicon.svg') }}">
        
        <!-- Favicons -->
        <link rel="icon" type="image/svg+xml" href="{{ asset('favicons/favicon.svg') }}">
        <link rel="apple-touch-icon" href="{{ asset('favicons/favicon.svg') }}">
        
        <!-- Theme Color -->
        <meta name="theme-color" content="#F8F9FA">

        <script>
            window.PAVONA_FIREBASE = {
                enabled: {{ app(\App\Services\FirebasePushService::class)->isConfigured() ? 'true' : 'false' }},
                config: @json(app(\App\Services\FirebasePushService::class)->webConfig()),
                sdkVersion: @json(app(\App\Services\FirebasePushService::class)->sdkVersion()),
            };
        </script>

        @if(app(\App\Services\FirebasePushService::class)->isConfigured())
            <script src="https://www.gstatic.com/firebasejs/{{ app(\App\Services\FirebasePushService::class)->sdkVersion() }}/firebase-app-compat.js"></script>
            <script src="https://www.gstatic.com/firebasejs/{{ app(\App\Services\FirebasePushService::class)->sdkVersion() }}/firebase-messaging-compat.js"></script>
        @endif

        <script>
            (() => {
                try {
                    const storedTheme = localStorage.getItem('pavona_theme');
                    const theme = storedTheme === 'dark' ? 'dark' : 'light';
                    document.documentElement.dataset.theme = theme;
                    document.documentElement.style.colorScheme = theme;
                    const themeMeta = document.querySelector('meta[name="theme-color"]');
                    if (themeMeta) {
                        themeMeta.setAttribute('content', theme === 'dark' ? '#07111F' : '#F8F9FA');
                    }
                } catch (error) {
                    document.documentElement.dataset.theme = 'light';
                    document.documentElement.style.colorScheme = 'light';
                }
            })();
        </script>

        <title inertia>{{ config('app.name', 'Pavona Studios') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=manrope:400,500,600,700&family=space-grotesk:400,500,600,700&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
        
        <!-- Optional: Live Chat (Uncomment to enable) -->
        {{-- <script>
            // Add your live chat script here (Tawk.to, Intercom, etc.)
        </script> --}}
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
