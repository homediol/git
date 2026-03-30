import { useEffect, useRef, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useLocale } from '@/Providers/LocaleProvider';
import { getLocalizedValue } from '@/lib/i18n';
import MediaPreview from '@/Components/MediaPreview';

export default function NotificationBell() {
    const { auth, notifications: initialNotifications, publicAnnouncements = [] } = usePage().props;
    const { locale, t } = useLocale();
    const isGuest = !auth?.user;
    const pushEnabled = Boolean(auth?.user?.push_notifications_enabled);
    const guestPrompt = { id: 'guest-prompt', kind: 'guest_prompt' };
    const guestItems = [
        guestPrompt,
        ...publicAnnouncements.map((item) => ({
            id: `announcement-${item.id}`,
            title: item.title,
            title_rw: item.title_rw,
            title_en: item.title_en,
            title_fr: item.title_fr,
            message: item.message,
            message_rw: item.message_rw,
            message_en: item.message_en,
            message_fr: item.message_fr,
            action_url: item.cta_url,
            action_text: item.cta_text,
            action_text_rw: item.cta_text_rw,
            action_text_en: item.cta_text_en,
            action_text_fr: item.cta_text_fr,
            read_at: null,
            created_at: item.created_at,
        })),
    ];
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState(isGuest ? guestItems : initialNotifications?.items ?? []);
    const [unreadCount, setUnreadCount] = useState(isGuest ? guestItems.length : initialNotifications?.unread_count ?? 0);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (isGuest) {
            setItems(guestItems);
            setUnreadCount(guestItems.length);
            return;
        }
        setItems(initialNotifications?.items ?? []);
        setUnreadCount(initialNotifications?.unread_count ?? 0);
    }, [initialNotifications, isGuest, publicAnnouncements]);

    useEffect(() => {
        if (!auth?.user) return;
        let isMounted = true;

        const fetchNotifications = async () => {
            try {
                const response = await axios.get(route('notifications.index'));
                if (!isMounted) return;
                setItems(response.data.notifications || []);
                setUnreadCount(response.data.unread_count || 0);
            } catch (error) {
                // silent fail
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 15000);
        const handleRefresh = () => fetchNotifications();
        const handleFocus = () => fetchNotifications();
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchNotifications();
            }
        };
        window.addEventListener('pavona-notification:refresh', handleRefresh);
        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            isMounted = false;
            clearInterval(interval);
            window.removeEventListener('pavona-notification:refresh', handleRefresh);
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [auth?.user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markRead = async (id) => {
        if (isGuest) return;
        try {
            await axios.post(route('notifications.read', id));
            setItems((prev) => prev.map((item) => (item.id === id ? { ...item, read_at: new Date().toISOString() } : item)));
            setUnreadCount((prev) => Math.max(prev - 1, 0));
        } catch (error) {
            // silent fail
        }
    };

    const markAllRead = async () => {
        if (isGuest) return;
        try {
            await axios.post(route('notifications.readall'));
            setItems((prev) => prev.map((item) => ({ ...item, read_at: new Date().toISOString() })));
            setUnreadCount(0);
        } catch (error) {
            // silent fail
        }
    };

    const markUnread = async (id) => {
        if (isGuest) return;
        try {
            await axios.post(route('notifications.unread', id));
            setItems((prev) => prev.map((item) => (item.id === id ? { ...item, read_at: null } : item)));
            setUnreadCount((prev) => prev + 1);
        } catch (error) {
            // silent fail
        }
    };

    const formatDate = (value) => {
        if (!value) return '';
        return new Date(value).toLocaleString(locale || 'rw');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="icon-btn relative"
                aria-label={t('notifications.title')}
            >
                <svg className="w-5 h-5 text-[color:var(--md-text)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4a2 2 0 01-.6-1.4V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-[color:var(--md-danger)] text-xs font-bold text-white flex items-center justify-center shadow">
                        {unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-white border border-[color:var(--md-outline)] shadow-elevated p-4 z-50">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-[color:var(--md-text)]">{t('notifications.title')}</span>
                        <div className="flex items-center gap-3">
                            {!isGuest && (
                                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                                    pushEnabled
                                        ? 'bg-[rgba(255,109,0,0.12)] text-[color:var(--md-primary)]'
                                        : 'bg-slate-100 text-slate-500'
                                }`}>
                                    {pushEnabled
                                        ? t('notifications.push_on', 'Push On')
                                        : t('notifications.push_off', 'Push Off')}
                                </span>
                            )}
                            {items.length > 0 && !isGuest && (
                                <button
                                    type="button"
                                    onClick={markAllRead}
                                    className="text-xs font-semibold text-[color:var(--md-secondary)] hover:underline"
                                >
                                    {t('notifications.mark_all')}
                                </button>
                            )}
                        </div>
                    </div>

                    {items.length === 0 ? (
                        <p className="text-sm text-slate-500">
                            {isGuest ? t('notifications.none_guest') : t('notifications.none_user')}
                        </p>
                    ) : (
                        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                            {items.map((item) => {
                                if (item.kind === 'guest_prompt') {
                                    return (
                                        <div key={item.id} className="rounded-xl border border-[color:var(--md-outline)] bg-white/95 p-4 shadow-sm">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="fire-gradient rounded-lg px-3 py-2 text-white text-[10px] font-semibold uppercase tracking-[0.25em]">
                                                    {t('notifications.guest_title')}
                                                </div>
                                                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--md-danger)]">
                                                    {t('notifications.new')}
                                                </span>
                                            </div>
                                            <p className="mt-3 text-sm text-slate-600">{t('notifications.guest_body')}</p>
                                            <div className="mt-4 grid gap-2">
                                                <Link href={route('login')} className="btn-secondary px-3 py-2 text-xs text-center">
                                                    {t('notifications.guest_login')}
                                                </Link>
                                                <Link href={route('register')} className="btn-primary px-3 py-2 text-xs text-center">
                                                    {t('notifications.guest_register')}
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                }
                                const title = getLocalizedValue(locale, item, 'title');
                                const message = getLocalizedValue(locale, item, 'message');
                                const actionText = getLocalizedValue(locale, item, 'action_text') || t('notifications.view');
                                const mediaUrl = item.media_url;
                                const mediaType = item.media_type;
                                return (
                                <div
                                    key={item.id}
                                    className={`rounded-xl p-3 border transition ${item.read_at ? 'border-[color:var(--md-outline)] bg-white' : 'border-[rgba(66,133,244,0.35)] bg-[rgba(66,133,244,0.08)]'}`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                {!item.read_at && (
                                                    <span className="h-2 w-2 rounded-full bg-[color:var(--md-secondary)]"></span>
                                                )}
                                                <h4 className="text-sm font-semibold text-[color:var(--md-text)]">{title}</h4>
                                            </div>
                                            {mediaUrl && (
                                                <MediaPreview
                                                    src={mediaUrl}
                                                    alt={title}
                                                    isVideo={mediaType === 'video'}
                                                    isAudio={mediaType === 'audio'}
                                                    className={mediaType === 'audio' ? 'mt-2 w-full' : 'mt-2 h-24 w-full rounded-lg object-cover'}
                                                    videoProps={{ controls: true }}
                                                    audioProps={{ controls: true }}
                                                />
                                            )}
                                            <p className="text-xs text-slate-600 mt-1">{message}</p>
                                            {item.action_url && (
                                                <Link
                                                    href={item.action_url}
                                                    className="inline-flex mt-2 text-xs font-semibold text-[color:var(--md-secondary)] hover:underline"
                                                >
                                                    {actionText}
                                                </Link>
                                            )}
                                            {isGuest && (
                                                <p className="mt-2 text-xs text-slate-500">{t('notifications.signin_hint')}</p>
                                            )}
                                        </div>
                                        {!item.read_at && !isGuest ? (
                                            <button
                                                type="button"
                                                onClick={() => markRead(item.id)}
                                                className="text-xs font-semibold text-[color:var(--md-secondary)] hover:underline"
                                            >
                                                {t('notifications.mark_read')}
                                            </button>
                                        ) : !isGuest ? (
                                            <button
                                                type="button"
                                                onClick={() => markUnread(item.id)}
                                                className="text-xs font-semibold text-slate-500 hover:text-[color:var(--md-text)]"
                                            >
                                                {t('notifications.mark_unread')}
                                            </button>
                                        ) : null}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2">{formatDate(item.created_at)}</p>
                                </div>
                                );
                            })}
                        </div>
                    )}

                    {!isGuest && (
                        <div className="mt-3 border-t border-[color:var(--md-outline)] pt-3">
                            <Link
                                href={route('profile.edit')}
                                className="inline-flex text-xs font-semibold text-[color:var(--md-secondary)] hover:underline"
                            >
                                Manage notification settings
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
