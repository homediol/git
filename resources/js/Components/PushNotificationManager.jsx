import { useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { useLocale } from '@/Providers/LocaleProvider';
import {
    deletePushToken,
    getPushToken,
    getPushPromptDismissed,
    getPushPromptReminderRemainingMs,
    isPushConfigured,
    isPushSupported,
    normalizePushPayload,
    onForegroundMessage,
    PUSH_PROMPT_REMINDER_MS,
    registerPushServiceWorker,
    setPushPromptDismissed,
    showForegroundNotification,
    subscribeToPushPromptState,
    syncPushToken,
} from '@/lib/pushNotifications';

function dispatchNotificationRefresh(detail = {}) {
    window.dispatchEvent(new CustomEvent('pavona-notification:refresh', { detail }));
}

function formatMessage(message, replacements = {}) {
    return Object.entries(replacements).reduce(
        (current, [token, value]) => current.split(`:${token}`).join(String(value)),
        message,
    );
}

function formatDuration(seconds) {
    if (seconds >= 60) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        if (remainingSeconds === 0) {
            return `${minutes} min`;
        }

        return `${minutes}m ${remainingSeconds}s`;
    }

    return `${seconds}s`;
}

export default function PushNotificationManager() {
    const { auth } = usePage().props;
    const { t } = useLocale();
    const user = auth?.user;
    const enabledByUser = Boolean(user?.push_notifications_enabled);
    const reminderDurationLabel = formatDuration(Math.ceil(PUSH_PROMPT_REMINDER_MS / 1000));
    const [permission, setPermission] = useState(() => (
        typeof Notification === 'undefined' ? 'default' : Notification.permission
    ));
    const [dismissed, setDismissed] = useState(() => getPushPromptDismissed());
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState('');
    const tokenRef = useRef(null);
    const previousEnabledRef = useRef(enabledByUser);

    useEffect(() => {
        if (!user || !isPushSupported()) {
            return undefined;
        }

        let unsubscribe = () => {};
        let active = true;

        const bootstrap = async () => {
            try {
                await registerPushServiceWorker();
                unsubscribe = await onForegroundMessage(async (payload) => {
                    if (!active) {
                        return;
                    }

                    dispatchNotificationRefresh({
                        source: 'foreground',
                        payload: normalizePushPayload(payload),
                    });

                    await showForegroundNotification(payload);
                });
            } catch (bootstrapError) {
                // Silent failure: app still works without push.
            }
        };

        const handleWorkerMessage = (event) => {
            if (event.data?.type !== 'PAVONA_PUSH_NOTIFICATION') {
                return;
            }

            dispatchNotificationRefresh({
                source: 'service_worker',
                payload: normalizePushPayload(event.data.payload),
            });
        };

        bootstrap();
        navigator.serviceWorker?.addEventListener('message', handleWorkerMessage);

        return () => {
            active = false;
            unsubscribe?.();
            navigator.serviceWorker?.removeEventListener('message', handleWorkerMessage);
        };
    }, [user?.id]);

    useEffect(() => {
        if (!user || !enabledByUser || permission !== 'granted' || !isPushSupported()) {
            return undefined;
        }

        let active = true;

        const sync = async () => {
            setSyncing(true);
            setError('');

            try {
                const token = await syncPushToken();
                if (active) {
                    tokenRef.current = token;
                }
            } catch (syncError) {
                if (active) {
                    setError('push_prompt.errors.enable_device');
                }
            } finally {
                if (active) {
                    setSyncing(false);
                }
            }
        };

        sync();

        return () => {
            active = false;
        };
    }, [user?.id, enabledByUser, permission]);

    useEffect(() => {
        if (!user || enabledByUser || permission !== 'granted' || !isPushSupported()) {
            return undefined;
        }

        let active = true;

        const disableRemote = async () => {
            try {
                const token = tokenRef.current || await getPushToken();
                if (token) {
                    await deletePushToken(token);
                }
                if (active) {
                    tokenRef.current = null;
                }
            } catch (disableError) {
                // Silent fail: user can retry from profile settings.
            }
        };

        disableRemote();

        return () => {
            active = false;
        };
    }, [user?.id, enabledByUser, permission]);

    useEffect(() => {
        if (!previousEnabledRef.current && enabledByUser && permission === 'default') {
            setPushPromptDismissed(false);
            setDismissed(false);
        }

        previousEnabledRef.current = enabledByUser;
    }, [enabledByUser, permission]);

    useEffect(() => {
        const unsubscribe = subscribeToPushPromptState((nextDismissed) => {
            setDismissed(nextDismissed);
        });

        const handleFocus = () => {
            if (typeof Notification !== 'undefined') {
                setPermission(Notification.permission);
            }
        };

        window.addEventListener('focus', handleFocus);

        return () => {
            unsubscribe();
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    useEffect(() => {
        if (!user || permission === 'granted' || !dismissed) {
            return undefined;
        }

        const remainingMs = getPushPromptReminderRemainingMs();

        if (remainingMs <= 0) {
            setPushPromptDismissed(false);
            setDismissed(false);
            return undefined;
        }

        const timeout = window.setTimeout(() => {
            setPushPromptDismissed(false);
            setDismissed(false);
        }, remainingMs);

        return () => {
            window.clearTimeout(timeout);
        };
    }, [user, permission, dismissed]);

    if (!user || !isPushConfigured() || !isPushSupported() || !enabledByUser) {
        return null;
    }

    const promptVisible = permission !== 'granted' && !dismissed;

    const enableNotifications = async () => {
        setSyncing(true);
        setError('');

        try {
            const nextPermission = await Notification.requestPermission();
            setPermission(nextPermission);

            if (nextPermission !== 'granted') {
                setError(
                    nextPermission === 'denied'
                        ? 'push_prompt.errors.blocked'
                        : 'push_prompt.errors.not_granted',
                );
                return;
            }

            const token = await syncPushToken();
            tokenRef.current = token;
            setPushPromptDismissed(true);
            setDismissed(true);
            dispatchNotificationRefresh({ source: 'permission_granted' });
        } catch (permissionError) {
            setError('push_prompt.errors.enable_failed');
        } finally {
            setSyncing(false);
        }
    };

    const dismissPrompt = () => {
        setPushPromptDismissed(true);
        setDismissed(true);
    };

    if (!promptVisible) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center px-4 py-6">
            <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]" />
            <div className="relative w-full max-w-xl overflow-hidden rounded-[32px] border border-[rgba(255,255,255,0.16)] bg-[linear-gradient(140deg,rgba(255,122,24,0.98),rgba(255,90,31,0.95)_42%,rgba(234,67,53,0.96)_100%)] p-7 text-white shadow-[0_36px_120px_rgba(7,17,31,0.34)]">
                <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.26),_transparent_70%)]" />
                <div className="pointer-events-none absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.14),_transparent_72%)]" />

                <div className="relative flex items-start justify-between gap-4">
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.32em] text-white/75">
                            {t('push_prompt.request', 'Request Browser Permission')}
                        </p>
                        <h3 className="mt-3 text-2xl font-black tracking-[-0.04em]">
                            {t('push_prompt.title', 'Enable notifications for every Pavona update')}
                        </h3>
                        <p className="mt-3 max-w-lg text-sm leading-6 text-white/84">
                            {t('push_prompt.body', 'Allow browser notifications so chat replies, bookings, rewards, and promotions can reach you immediately.')}
                        </p>
                        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white/82">
                            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                            {formatMessage(
                                t('push_prompt.every_until_allowed', 'Reminder every :seconds until allowed'),
                                { seconds: reminderDurationLabel },
                            )}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={dismissPrompt}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/18 bg-white/10 text-white transition hover:bg-white/18"
                        aria-label={t('push_prompt.dismiss_aria', 'Dismiss notification prompt')}
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
                        </svg>
                    </button>
                </div>

                <div className="relative mt-6 grid gap-3 rounded-[24px] bg-white/10 p-4 backdrop-blur-md sm:grid-cols-[1fr_auto] sm:items-center">
                    <div>
                        <p className="text-sm font-bold text-white">
                            {permission === 'denied'
                                ? t('push_prompt.blocked_title', 'Notifications are blocked')
                                : t('push_prompt.pending_title', 'Permission still not granted')}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-white/78">
                            {permission === 'denied'
                                ? t('push_prompt.blocked_body', 'Enable notifications in your browser settings, then come back and try again.')
                                : formatMessage(
                                    t('push_prompt.pending_body', 'If you close this reminder, it will return in :seconds until notifications are allowed.'),
                                    { seconds: reminderDurationLabel },
                                )}
                        </p>
                    </div>
                    <div className="text-left sm:text-right">
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/70">
                            {t('push_prompt.brand', 'Pavona Alerts')}
                        </p>
                        <p className="mt-1 text-lg font-black">
                            {t('push_prompt.live_updates', 'Live updates on')}
                            <br />
                            {t('push_prompt.mobile_desktop', 'mobile and desktop')}
                        </p>
                    </div>
                </div>

                <div className="relative mt-6 flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={enableNotifications}
                        disabled={syncing}
                        className="rounded-full bg-white px-5 py-3 text-sm font-black text-[#d94719] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {syncing
                            ? t('push_prompt.connecting', 'Connecting...')
                            : t('push_prompt.enable', 'Enable Notifications')}
                    </button>
                    <button
                        type="button"
                        onClick={dismissPrompt}
                        className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/16"
                    >
                        {formatMessage(
                            t('push_prompt.remind_later', 'Remind me in :seconds'),
                            { seconds: reminderDurationLabel },
                        )}
                    </button>
                </div>

                {error && (
                    <p className="relative mt-4 text-sm text-white/86">
                        {t(error, error)}
                    </p>
                )}
            </div>
        </div>
    );
}
