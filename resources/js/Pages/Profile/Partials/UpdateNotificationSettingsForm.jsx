import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SupportWhatsAppButton from '@/Components/SupportWhatsAppButton';
import { useLocale } from '@/Providers/LocaleProvider';
import { Transition } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import {
    getPushPromptDismissed,
    isPushSupported,
    setPushPromptDismissed,
    subscribeToPushPromptState,
    syncPushToken,
} from '@/lib/pushNotifications';

const categories = ['general', 'chat', 'booking', 'promotion', 'reward'];

export default function UpdateNotificationSettingsForm({
    notificationSettings,
    firebaseConfigured,
    className = '',
}) {
    const { t } = useLocale();
    const [browserPermission, setBrowserPermission] = useState('default');
    const [pushSupported, setPushSupported] = useState(false);
    const [promptDismissed, setPromptDismissedState] = useState(false);
    const [requestingPermission, setRequestingPermission] = useState(false);
    const [pushFeedback, setPushFeedback] = useState('');

    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        in_app_notifications_enabled: Boolean(notificationSettings?.in_app_notifications_enabled),
        push_notifications_enabled: Boolean(notificationSettings?.push_notifications_enabled),
        notification_preferences: notificationSettings?.notification_preferences || {},
    });

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        setBrowserPermission(typeof Notification === 'undefined' ? 'unsupported' : Notification.permission);
        setPushSupported(isPushSupported());
        setPromptDismissedState(getPushPromptDismissed());
    }, [firebaseConfigured]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return () => {};
        }

        const unsubscribe = subscribeToPushPromptState((nextDismissed) => {
            setPromptDismissedState(nextDismissed);
        });

        const syncRuntimeState = () => {
            setPromptDismissedState(getPushPromptDismissed());
            setBrowserPermission(typeof Notification === 'undefined' ? 'unsupported' : Notification.permission);
        };

        window.addEventListener('focus', syncRuntimeState);
        document.addEventListener('visibilitychange', syncRuntimeState);

        return () => {
            unsubscribe();
            window.removeEventListener('focus', syncRuntimeState);
            document.removeEventListener('visibilitychange', syncRuntimeState);
        };
    }, []);

    const setPreference = (category, channel, value) => {
        setData('notification_preferences', {
            ...data.notification_preferences,
            [category]: {
                ...(data.notification_preferences?.[category] || {}),
                [channel]: value,
            },
        });
    };

    const submit = (event) => {
        event.preventDefault();
        patch(route('profile.notifications.update'));
    };

    const resetPromptState = () => {
        setPushPromptDismissed(false);
        setPromptDismissedState(false);
        setPushFeedback('notification_settings.feedback.prompt_available');
    };

    const requestBrowserPermission = async () => {
        if (typeof Notification === 'undefined') {
            setPushFeedback('notification_settings.feedback.unsupported');
            return;
        }

        if (!data.push_notifications_enabled) {
            setPushFeedback('notification_settings.feedback.enable_push_first');
            return;
        }

        setRequestingPermission(true);
        setPushFeedback('');

        try {
            const nextPermission = await Notification.requestPermission();
            setBrowserPermission(nextPermission);

            if (nextPermission !== 'granted') {
                setPushFeedback('notification_settings.feedback.permission_not_granted');
                return;
            }

            const token = await syncPushToken();

            if (!token) {
                setPushFeedback('notification_settings.feedback.token_missing');
                return;
            }

            setPushPromptDismissed(true);
            setPromptDismissedState(true);
            setPushFeedback('notification_settings.feedback.permission_granted');
            router.reload({
                preserveScroll: true,
                only: ['notificationDebug', 'auth'],
            });
        } catch (error) {
            setPushFeedback('notification_settings.feedback.request_failed');
        } finally {
            setRequestingPermission(false);
        }
    };

    const statusClass = (active) => (
        active
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-rose-100 text-rose-700'
    );

    const permissionLabel = {
        default: t('notification_settings.permission.default', 'Default'),
        granted: t('notification_settings.permission.granted', 'Granted'),
        denied: t('notification_settings.permission.denied', 'Denied'),
        unsupported: t('notification_settings.permission.unsupported', 'Unsupported'),
    }[browserPermission] || browserPermission;

    const permissionDescription = browserPermission === 'default'
        ? t('notification_settings.permission.default_help', 'The browser has not been asked yet, or the prompt card was dismissed.')
        : browserPermission === 'granted'
            ? t('notification_settings.permission.granted_help', 'This browser already allowed notifications.')
            : browserPermission === 'denied'
                ? t('notification_settings.permission.denied_help', 'Notifications were blocked in browser settings.')
                : t('notification_settings.permission.unknown_help', 'Permission state is not available.');

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {t('notification_settings.title', 'Notification Settings')}
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {t('notification_settings.subtitle', 'Control what appears inside Pavona and what should also reach your phone or desktop.')}
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <label className="rounded-2xl border border-[color:var(--md-outline)] bg-[color:var(--md-surface-alt)] p-4">
                        <div className="flex items-start gap-3">
                            <Checkbox
                                checked={data.in_app_notifications_enabled}
                                onChange={(event) => setData('in_app_notifications_enabled', event.target.checked)}
                                className="mt-1"
                            />
                            <div>
                                <p className="text-sm font-semibold text-[color:var(--md-text)]">
                                    {t('notification_settings.channels.in_app.title', 'In-app notifications')}
                                </p>
                                <p className="mt-1 text-sm text-[color:var(--md-muted)]">
                                    {t('notification_settings.channels.in_app.description', 'Keep alerts in the notification bell with unread counts inside the website.')}
                                </p>
                            </div>
                        </div>
                    </label>

                    <label className="rounded-2xl border border-[color:var(--md-outline)] bg-[color:var(--md-surface-alt)] p-4">
                        <div className="flex items-start gap-3">
                            <Checkbox
                                checked={data.push_notifications_enabled}
                                onChange={(event) => setData('push_notifications_enabled', event.target.checked)}
                                className="mt-1"
                            />
                            <div>
                                <p className="text-sm font-semibold text-[color:var(--md-text)]">
                                    {t('notification_settings.channels.push.title', 'Push notifications')}
                                </p>
                                <p className="mt-1 text-sm text-[color:var(--md-muted)]">
                                    {t('notification_settings.channels.push.description', 'Send alerts to this device even when Pavona is not currently open.')}
                                </p>
                            </div>
                        </div>
                    </label>
                </div>

                <div className="rounded-2xl border border-[color:var(--md-outline)] bg-[color:var(--md-surface-alt)] p-4">
                    <div className="grid gap-3">
                        {categories.map((category) => (
                            <div
                                key={category}
                                className="rounded-2xl border border-[color:var(--md-outline)] bg-[color:var(--md-surface)] p-4"
                            >
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-[color:var(--md-text)]">
                                            {t(`notification_settings.categories.${category}.label`, category)}
                                        </p>
                                        <p className="mt-1 text-sm text-[color:var(--md-muted)]">
                                            {t(`notification_settings.categories.${category}.description`, '')}
                                        </p>
                                    </div>
                                    <div className="flex gap-5">
                                        <label className="flex items-center gap-2 text-sm text-[color:var(--md-text)]">
                                            <Checkbox
                                                checked={Boolean(data.notification_preferences?.[category]?.in_app)}
                                                onChange={(event) => setPreference(category, 'in_app', event.target.checked)}
                                            />
                                            {t('notification_settings.channel.in_app', 'In-app')}
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-[color:var(--md-text)]">
                                            <Checkbox
                                                checked={Boolean(data.notification_preferences?.[category]?.push)}
                                                onChange={(event) => setPreference(category, 'push', event.target.checked)}
                                            />
                                            {t('notification_settings.channel.push', 'Push')}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-dashed border-[color:var(--md-outline)] bg-[color:var(--md-surface-alt)] p-4 text-sm text-[color:var(--md-muted)]">
                    {firebaseConfigured
                        ? t('notification_settings.info.configured', 'Push is configured. After saving, allow browser permission when Pavona asks so this device can receive notifications.')
                        : t('notification_settings.info.missing', 'Firebase push is not configured yet. In-app notifications will still work until Firebase keys are added.')}
                </div>

                <div className="rounded-2xl border border-[color:var(--md-outline)] bg-[color:var(--md-surface-alt)] p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold text-[color:var(--md-text)]">
                                {t('notification_settings.runtime.title', 'Push Runtime Status')}
                            </p>
                            <p className="mt-1 text-sm text-[color:var(--md-muted)]">
                                {t('notification_settings.runtime.subtitle', 'This helps explain why the browser permission popup may not be appearing.')}
                            </p>
                        </div>
                        {promptDismissed && browserPermission === 'default' && (
                            <button
                                type="button"
                                onClick={resetPromptState}
                                className="rounded-full border border-[color:var(--md-outline)] bg-[color:var(--md-surface)] px-3 py-1.5 text-xs font-semibold text-[color:var(--md-secondary)] transition hover:border-[color:var(--md-secondary)]"
                            >
                                {t('notification_settings.runtime.show_prompt', 'Show prompt again')}
                            </button>
                        )}
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <div className="rounded-2xl bg-[color:var(--md-surface)] p-4">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--md-muted)]">
                                {t('notification_settings.firebase.title', 'Firebase')}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${statusClass(firebaseConfigured)}`}>
                                    {firebaseConfigured
                                        ? t('notification_settings.firebase.configured', 'Configured')
                                        : t('notification_settings.firebase.missing', 'Missing Config')}
                                </span>
                            </div>
                            {!firebaseConfigured && (
                                <p className="mt-3 text-sm text-[color:var(--md-muted)]">
                                    {t('notification_settings.firebase.missing_help', 'Add all `FIREBASE_*` values in `.env` first. Without that, Pavona hides the push prompt and FCM cannot start.')}
                                </p>
                            )}
                        </div>

                        <div className="rounded-2xl bg-[color:var(--md-surface)] p-4">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--md-muted)]">
                                {t('notification_settings.browser_support.title', 'Browser Support')}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${statusClass(pushSupported)}`}>
                                    {pushSupported
                                        ? t('notification_settings.browser_support.supported', 'Supported')
                                        : t('notification_settings.browser_support.not_ready', 'Not Ready')}
                                </span>
                            </div>
                            <p className="mt-3 text-sm text-[color:var(--md-muted)]">
                                {pushSupported
                                    ? t('notification_settings.browser_support.supported_help', 'This browser can handle service workers and push.')
                                    : t('notification_settings.browser_support.not_ready_help', 'Push support is unavailable until Firebase is configured, or the browser/device does not support it.')}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-[color:var(--md-surface)] p-4">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--md-muted)]">
                                {t('notification_settings.permission.title', 'Permission')}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                                    browserPermission === 'granted'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : browserPermission === 'denied'
                                            ? 'bg-rose-100 text-rose-700'
                                            : 'bg-amber-100 text-amber-700'
                                }`}>
                                    {permissionLabel}
                                </span>
                            </div>
                            <p className="mt-3 text-sm text-[color:var(--md-muted)]">
                                {permissionDescription}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-[color:var(--md-surface)] p-4">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--md-muted)]">
                                {t('notification_settings.prompt_state.title', 'Prompt State')}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${statusClass(!promptDismissed)}`}>
                                    {promptDismissed
                                        ? t('notification_settings.prompt_state.dismissed', 'Dismissed')
                                        : t('notification_settings.prompt_state.visible', 'Visible When Ready')}
                                </span>
                            </div>
                            <p className="mt-3 text-sm text-[color:var(--md-muted)]">
                                {promptDismissed
                                    ? t('notification_settings.prompt_state.dismissed_help', 'The in-app push card was hidden earlier in this browser. Use "Show prompt again" after Firebase is configured.')
                                    : t('notification_settings.prompt_state.visible_help', 'The push card can appear when Firebase is configured and push is enabled for your account.')}
                            </p>
                        </div>
                    </div>

                    {firebaseConfigured && pushSupported && browserPermission === 'default' && (
                        <div className="mt-4 flex flex-wrap gap-3">
                            <PrimaryButton
                                type="button"
                                onClick={requestBrowserPermission}
                                disabled={requestingPermission}
                            >
                                {requestingPermission
                                    ? t('notification_settings.actions.requesting', 'Requesting...')
                                    : t('notification_settings.actions.request', 'Request Browser Permission')}
                            </PrimaryButton>
                            {!data.push_notifications_enabled && (
                                <p className="text-sm text-[color:var(--md-muted)]">
                                    {t('notification_settings.actions.enable_push_first', 'Turn on the push toggle above and save before requesting permission.')}
                                </p>
                            )}
                        </div>
                    )}

                    {pushFeedback && (
                        <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                            {t(pushFeedback, pushFeedback)}
                        </p>
                    )}
                </div>

                <InputError className="mt-2" message={errors.in_app_notifications_enabled || errors.push_notifications_enabled} />

                <div className="rounded-2xl border border-[color:var(--md-outline)] bg-[color:var(--md-surface-alt)] p-4">
                    <p className="text-sm font-semibold text-[color:var(--md-text)]">
                        {t('support.whatsapp.helper', 'Need help? Talk to the admin on WhatsApp right away.')}
                    </p>
                    <div className="mt-3">
                        <SupportWhatsAppButton
                            message="Hello Pavona admin, I need help with notification settings."
                            showPhone
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>
                        {t('notification_settings.save', 'Save Notification Settings')}
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t('notification_settings.saved', 'Saved.')}
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
