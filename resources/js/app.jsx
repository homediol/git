import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import { LocaleProvider } from '@/Providers/LocaleProvider';
import { ThemeProvider } from '@/Providers/ThemeProvider';
import { bootstrapPwaInstall } from '@/lib/pwaInstall';

// Use Laravel's XSRF cookie so auth/session refreshes after login or register
// do not leave the SPA sending a stale CSRF token header.
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;
delete axios.defaults.headers.common['X-CSRF-TOKEN'];

bootstrapPwaInstall();

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <App {...props}>
                {({ Component, props: pageProps, key }) => (
                    <ThemeProvider>
                        <LocaleProvider>
                            <Component key={key} {...pageProps} />
                        </LocaleProvider>
                    </ThemeProvider>
                )}
            </App>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
