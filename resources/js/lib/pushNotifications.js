import axios from 'axios';
import { registerAppServiceWorker } from '@/lib/pwaInstall';

const promptDismissKey = 'pavona_push_prompt_dismissed';
const promptStateEventName = 'pavona:push-prompt-state-change';
export const PUSH_PROMPT_REMINDER_MS = 900000;

let messagingInstance = null;

function getPushPromptSnoozedUntil() {
    if (typeof window === 'undefined') {
        return 0;
    }

    const snoozedUntil = Number(window.localStorage.getItem(promptDismissKey) || 0);

    if (!Number.isFinite(snoozedUntil) || snoozedUntil <= 0) {
        return 0;
    }

    return snoozedUntil;
}

export function getPushPromptDismissed() {
    const snoozedUntil = getPushPromptSnoozedUntil();

    if (snoozedUntil <= 0) {
        return false;
    }

    if (Date.now() >= snoozedUntil) {
        window.localStorage.removeItem(promptDismissKey);
        return false;
    }

    return true;
}

export function getPushPromptReminderRemainingMs() {
    const snoozedUntil = getPushPromptSnoozedUntil();

    if (snoozedUntil <= 0) {
        return 0;
    }

    return Math.max(0, snoozedUntil - Date.now());
}

export function setPushPromptDismissed(value) {
    if (typeof window === 'undefined') {
        return;
    }

    if (value) {
        window.localStorage.setItem(
            promptDismissKey,
            String(Date.now() + PUSH_PROMPT_REMINDER_MS),
        );
    } else {
        window.localStorage.removeItem(promptDismissKey);
    }

    window.dispatchEvent(new CustomEvent(promptStateEventName, {
        detail: { dismissed: Boolean(value) },
    }));
}

export function subscribeToPushPromptState(callback) {
    if (typeof window === 'undefined') {
        return () => {};
    }

    const handler = (event) => {
        callback(Boolean(event.detail?.dismissed));
    };

    window.addEventListener(promptStateEventName, handler);

    return () => {
        window.removeEventListener(promptStateEventName, handler);
    };
}

export function getFirebaseConfig() {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.PAVONA_FIREBASE?.config || null;
}

export function isPushConfigured() {
    const config = getFirebaseConfig();

    return Boolean(
        config?.apiKey
        && config?.messagingSenderId
        && config?.appId
        && config?.vapidKey,
    );
}

export function isPushSupported() {
    if (typeof window === 'undefined') {
        return false;
    }

    return Boolean(
        isPushConfigured()
        && 'Notification' in window
        && 'serviceWorker' in navigator
        && 'PushManager' in window,
    );
}

export async function registerPushServiceWorker() {
    if (!isPushSupported()) {
        return null;
    }

    return registerAppServiceWorker();
}

async function getFirebaseMessaging() {
    if (!isPushSupported() || !window.firebase) {
        return null;
    }

    if (messagingInstance) {
        return messagingInstance;
    }

    const firebase = window.firebase;
    const config = getFirebaseConfig();

    if (!firebase.apps.length) {
        firebase.initializeApp(config);
    }

    if (firebase.messaging?.isSupported) {
        const supported = await firebase.messaging.isSupported();
        if (!supported) {
            return null;
        }
    }

    messagingInstance = firebase.messaging();

    return messagingInstance;
}

export async function getPushToken() {
    const messaging = await getFirebaseMessaging();
    const registration = await registerPushServiceWorker();
    const config = getFirebaseConfig();

    if (!messaging || !registration || !config?.vapidKey) {
        return null;
    }

    return messaging.getToken({
        vapidKey: config.vapidKey,
        serviceWorkerRegistration: registration,
    });
}

export async function deletePushToken(token) {
    const messaging = await getFirebaseMessaging();

    if (messaging) {
        try {
            await messaging.deleteToken();
        } catch (error) {
            // Ignore browser-side delete failures and still attempt server cleanup.
        }
    }

    if (token) {
        await axios.delete(route('notifications.push.destroy'), {
            data: { token },
        });
    }
}

export async function syncPushToken() {
    const token = await getPushToken();

    if (!token) {
        return null;
    }

    await axios.post(route('notifications.push.store'), {
        token,
        ...getDeviceMetadata(),
        user_agent: navigator.userAgent,
    });

    return token;
}

export async function onForegroundMessage(callback) {
    const messaging = await getFirebaseMessaging();

    if (!messaging) {
        return () => {};
    }

    return messaging.onMessage(callback);
}

export function normalizePushPayload(payload) {
    return {
        title: payload?.notification?.title || payload?.data?.title || 'Pavona Studio',
        body: payload?.notification?.body || payload?.data?.body || '',
        image: payload?.notification?.image || payload?.data?.image || undefined,
        actionUrl: payload?.fcmOptions?.link || payload?.data?.action_url || route('dashboard'),
        notificationType: payload?.data?.notification_type || 'general',
    };
}

export async function showForegroundNotification(payload) {
    if (Notification.permission !== 'granted') {
        return;
    }

    const registration = await registerPushServiceWorker();
    const normalized = normalizePushPayload(payload);

    if (!registration?.showNotification) {
        return;
    }

    await registration.showNotification(normalized.title, {
        body: normalized.body,
        icon: '/favicons/favicon.svg',
        badge: '/favicons/favicon.svg',
        image: normalized.image,
        data: {
            action_url: normalized.actionUrl,
            payload,
        },
    });
}

export function getDeviceMetadata() {
    if (typeof navigator === 'undefined') {
        return {
            platform: 'unknown',
            browser: 'unknown',
            device_name: 'Unknown device',
        };
    }

    const userAgent = navigator.userAgent || '';
    const browser = userAgent.includes('Edg/')
        ? 'Edge'
        : userAgent.includes('Chrome/')
            ? 'Chrome'
            : userAgent.includes('Firefox/')
                ? 'Firefox'
                : userAgent.includes('Safari/')
                    ? 'Safari'
                    : 'Unknown';
    const platform = /Android/i.test(userAgent)
        ? 'Android'
        : /iPhone|iPad|iPod/i.test(userAgent)
            ? 'iOS'
            : /Windows/i.test(userAgent)
                ? 'Windows'
                : /Mac OS X/i.test(userAgent)
                    ? 'macOS'
                    : /Linux/i.test(userAgent)
                        ? 'Linux'
                        : (navigator.platform || 'Unknown');

    return {
        platform,
        browser,
        device_name: `${browser} on ${platform}`,
    };
}
