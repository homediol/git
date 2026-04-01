const firebaseConfig = @json($firebaseConfig);
const appUrl = @json($appUrl);
const cacheName = 'pavona-shell-v1';
const offlineFallbackUrl = '/offline.html';
const precacheUrls = [
    offlineFallbackUrl,
    '/manifest.webmanifest',
    '/favicons/favicon.svg',
    '/pwa/apple-touch-icon.png',
    '/pwa/icon-192.png',
    '/pwa/icon-512.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(cacheName).then((cache) => cache.addAll(precacheUrls)).catch(() => undefined),
    );

    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys
                .filter((key) => key !== cacheName)
                .map((key) => caches.delete(key)),
        )).then(() => self.clients.claim()),
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') {
        return;
    }

    const requestUrl = new URL(event.request.url);

    if (requestUrl.origin !== self.location.origin) {
        return;
    }

    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(async () => {
                const cachedFallback = await caches.match(offlineFallbackUrl);
                return cachedFallback || Response.error();
            }),
        );

        return;
    }

    if (!['script', 'style', 'image', 'font'].includes(event.request.destination)) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const networkResponse = fetch(event.request)
                .then((response) => {
                    if (response && response.status === 200) {
                        const responseClone = response.clone();

                        caches.open(cacheName).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }

                    return response;
                })
                .catch(() => cachedResponse);

            return cachedResponse || networkResponse;
        }),
    );
});

if (firebaseConfig && firebaseConfig.apiKey && firebaseConfig.messagingSenderId && firebaseConfig.appId) {
    importScripts('https://www.gstatic.com/firebasejs/{{ $sdkVersion }}/firebase-app-compat.js');
    importScripts('https://www.gstatic.com/firebasejs/{{ $sdkVersion }}/firebase-messaging-compat.js');

    firebase.initializeApp(firebaseConfig);

    const messaging = firebase.messaging();

    const notifyClients = (payload) => {
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
            clients.forEach((client) => {
                client.postMessage({
                    type: 'PAVONA_PUSH_NOTIFICATION',
                    payload,
                });
            });
        });
    };

    messaging.onBackgroundMessage((payload) => {
        const title = payload?.notification?.title || payload?.data?.title || 'Pavona Studio';
        const body = payload?.notification?.body || payload?.data?.body || '';
        const image = payload?.notification?.image || payload?.data?.image || undefined;
        const actionUrl = payload?.fcmOptions?.link || payload?.data?.action_url || appUrl;

        notifyClients(payload);

        self.registration.showNotification(title, {
            body,
            icon: '/pwa/icon-192.png',
            badge: '/pwa/icon-192.png',
            image,
            data: {
                action_url: actionUrl,
                payload,
            },
        });
    });

    self.addEventListener('notificationclick', (event) => {
        event.notification.close();

        const actionUrl = event.notification?.data?.action_url || appUrl;

        event.waitUntil(
            self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
                for (const client of clients) {
                    if ('focus' in client) {
                        client.postMessage({
                            type: 'PAVONA_PUSH_NOTIFICATION_CLICK',
                            payload: event.notification?.data?.payload || null,
                        });
                        client.navigate(actionUrl);
                        return client.focus();
                    }
                }

                if (self.clients.openWindow) {
                    return self.clients.openWindow(actionUrl);
                }

                return undefined;
            }),
        );
    });
}
