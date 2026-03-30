const firebaseConfig = @json($firebaseConfig);

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
        const actionUrl = payload?.fcmOptions?.link || payload?.data?.action_url || '{{ $appUrl }}';

        notifyClients(payload);

        self.registration.showNotification(title, {
            body,
            icon: '/favicons/favicon.svg',
            badge: '/favicons/favicon.svg',
            image,
            data: {
                action_url: actionUrl,
                payload,
            },
        });
    });

    self.addEventListener('notificationclick', (event) => {
        event.notification.close();

        const actionUrl = event.notification?.data?.action_url || '{{ $appUrl }}';

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
