import { useEffect, useRef, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useLocale } from '@/Providers/LocaleProvider';
import { getLocalizedValue } from '@/lib/i18n';

export default function NotificationBell() {
    const { auth, notifications: initialNotifications, publicAnnouncements = [] } = usePage().props;
    const { locale, t } = useLocale();
    const isGuest = !auth?.user;
    const guestItems = publicAnnouncements.map((item) => ({
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
    }));
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
        const interval = setInterval(fetchNotifications, 30000);

        return () => {
            isMounted = false;
            clearInterval(interval);
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
        return new Date(value).toLocaleString();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition"
            >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4a2 2 0 01-.6-1.4V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-rose-500 text-xs font-bold text-white flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-3 w-80 rounded-2xl glass-dark border border-white/10 shadow-2xl p-4 z-50">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-white">{t('notifications.title')}</span>
                        {items.length > 0 && !isGuest && (
                            <button
                                type="button"
                                onClick={markAllRead}
                                className="text-xs text-sky-200 hover:text-white"
                            >
                                {t('notifications.mark_all')}
                            </button>
                        )}
                    </div>

                    {items.length === 0 ? (
                        <p className="text-sm text-white/70">
                            {isGuest ? t('notifications.none_guest') : t('notifications.none_user')}
                        </p>
                    ) : (
                        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                            {items.map((item) => (
                                (() => {
                                    const title = getLocalizedValue(locale, item, 'title');
                                    const message = getLocalizedValue(locale, item, 'message');
                                    const actionText = getLocalizedValue(locale, item, 'action_text') || t('notifications.view');
                                    return (
                                <div
                                    key={item.id}
                                    className={`rounded-xl p-3 border ${item.read_at ? 'border-white/5 bg-white/5' : 'border-sky-400/40 bg-sky-400/10'}`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h4 className="text-sm font-semibold text-white">{title}</h4>
                                            <p className="text-xs text-white/70 mt-1">{message}</p>
                                            {item.action_url && (
                                                <Link
                                                    href={item.action_url}
                                                    className="inline-flex mt-2 text-xs text-sky-200 hover:text-white"
                                                >
                                                    {actionText}
                                                </Link>
                                            )}
                                            {isGuest && (
                                                <p className="mt-2 text-xs text-white/50">{t('notifications.signin_hint')}</p>
                                            )}
                                        </div>
                                        {!item.read_at && !isGuest ? (
                                            <button
                                                type="button"
                                                onClick={() => markRead(item.id)}
                                                className="text-xs text-sky-200 hover:text-white"
                                            >
                                                {t('notifications.mark_read')}
                                            </button>
                                        ) : !isGuest ? (
                                            <button
                                                type="button"
                                                onClick={() => markUnread(item.id)}
                                                className="text-xs text-white/60 hover:text-white"
                                            >
                                                {t('notifications.mark_unread')}
                                            </button>
                                        ) : null}
                                    </div>
                                    <p className="text-[10px] text-white/50 mt-2">{formatDate(item.created_at)}</p>
                                </div>
                                    );
                                })()
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
