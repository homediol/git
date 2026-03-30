import Dropdown from '@/Components/Dropdown';
import AIChatbot from '@/Components/AIChatbot';
import PavonaLogo from '@/Components/PavonaLogo';
import FlashMessage from '@/Components/FlashMessage';
import NotificationBell from '@/Components/NotificationBell';
import PromotionModal from '@/Components/PromotionModal';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import ThemePickerButton from '@/Components/ThemePickerButton';
import PushNotificationManager from '@/Components/PushNotificationManager';
import axios from 'axios';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, chatSummary: initialChatSummary } = usePage().props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [chatSummary, setChatSummary] = useState(initialChatSummary ?? null);

    useEffect(() => {
        setChatSummary(initialChatSummary ?? null);
    }, [initialChatSummary]);

    useEffect(() => {
        if (!user) {
            return undefined;
        }

        let isMounted = true;

        const fetchSummary = async () => {
            try {
                const response = await axios.get(route('messages.summary'));
                if (!isMounted) {
                    return;
                }

                setChatSummary(response.data);
            } catch (error) {
                // silent fail
            }
        };

        fetchSummary();
        const interval = setInterval(fetchSummary, 12000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [user?.id]);

    const navItems = [
        {
            label: 'Dashboard',
            href: route('dashboard'),
            active: route().current('dashboard'),
            icon: (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z" />
                </svg>
            ),
        },
        {
            label: 'Rewards',
            href: route('rewards.index'),
            active: route().current('rewards.index'),
            icon: (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9h12v11H6z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 9c-1.7 0-3-1.3-3-3s1.3-3 3-3c1.3 0 2.5.8 2.9 2M19 9c1.7 0 3-1.3 3-3s-1.3-3-3-3c-1.3 0-2.5.8-2.9 2" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 13l1.4 1.4L12 16l-1.4-1.6z" />
                </svg>
            ),
        },
        {
            label: 'Bookings',
            href: route('bookings.index'),
            active: route().current('bookings.*'),
            icon: (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 3v3M17 3v3M4 9h16M5 6h14a1 1 0 011 1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7a1 1 0 011-1z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l2 2 4-5" />
                </svg>
            ),
        },
        {
            label: user?.role === 'admin' ? 'Inbox' : 'Chat',
            href: user?.role === 'admin' ? route('admin.messages') : route('messages.index'),
            active: user?.role === 'admin' ? route().current('admin.messages*') : route().current('messages.*'),
            badge: chatSummary?.unread_count || 0,
            icon: (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h7m-7 4h4" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5h14a2 2 0 012 2v8a2 2 0 01-2 2H9l-4 3v-3H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
                </svg>
            ),
        },
        {
            label: 'Home',
            href: route('home'),
            active: route().current('home'),
            icon: (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 11.5L12 4l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" />
                </svg>
            ),
        },
    ];

    if (user?.role === 'admin') {
        navItems.push({
            label: 'Admin',
            href: route('admin.dashboard'),
            active: route().current('admin.*'),
            icon: (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v6c0 4.4-3 7.7-7 9-4-1.3-7-4.6-7-9V6l7-3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12.5l2 2 4-4" />
                </svg>
            ),
        });
    }

    const userInitials = user?.name
        ? user.name
              .split(' ')
              .map((part) => part.charAt(0))
              .join('')
              .slice(0, 2)
              .toUpperCase()
        : 'U';

    const navLinkBaseClass = 'group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition';
    const navLinkActiveClass = 'bg-[color:var(--md-nav-item-active)] text-[color:var(--md-nav-item-active-text)] shadow-[0_18px_36px_var(--md-nav-item-active-shadow)]';
    const navLinkIdleClass = 'text-[color:var(--md-nav-link)] hover:text-[color:var(--md-nav-link-hover)] hover:bg-[color:var(--md-nav-item-hover)]';
    const navIconBaseClass = 'flex h-9 w-9 items-center justify-center rounded-xl transition';
    const navIconActiveClass = 'bg-[color:var(--md-nav-icon-active-bg)] text-[color:var(--md-nav-item-active-text)]';
    const navIconIdleClass = 'bg-[color:var(--md-nav-icon-bg)] text-[color:var(--md-nav-link)] group-hover:text-[color:var(--md-nav-link-hover)]';

    const renderNavLinks = (closeOnClick = false) =>
        navItems.map((item) => (
            <Link
                key={item.label}
                href={item.href}
                onClick={closeOnClick ? () => setSidebarOpen(false) : undefined}
                className={`${navLinkBaseClass} ${item.active ? navLinkActiveClass : navLinkIdleClass}`}
                aria-current={item.active ? 'page' : undefined}
            >
                <span className={`${navIconBaseClass} ${item.active ? navIconActiveClass : navIconIdleClass}`}>
                    {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.badge > 0 && (
                    <span className="min-w-[1.5rem] rounded-full bg-orange-500 px-2 py-0.5 text-center text-[11px] font-semibold text-white">
                        {item.badge > 99 ? '99+' : item.badge}
                    </span>
                )}
                {item.active && <span className="h-2 w-2 rounded-full bg-sky-400" />}
            </Link>
        ));

    return (
        <div className="relative min-h-screen overflow-hidden bg-transparent">
            <div className="relative flex">
                <aside className="hidden min-h-screen w-72 flex-col border-r px-6 py-8 text-[color:var(--md-sidebar-text)] backdrop-blur-xl lg:flex bg-[color:var(--md-sidebar-bg)] border-[color:var(--md-sidebar-border)]">
                    <Link href="/" className="flex items-center gap-3">
                        <PavonaLogo className="w-10 h-10" />
                        <div>
                            <span className="text-lg font-bold">Pavona Studios</span>
                            <p className="text-xs text-[color:var(--md-sidebar-muted)]">Creative Agency</p>
                        </div>
                    </Link>

                    <div className="mt-10">
                        <p className="text-[11px] uppercase tracking-[0.35em] text-[color:var(--md-sidebar-muted)]">Navigation</p>
                        <div className="mt-4 space-y-2">{renderNavLinks()}</div>
                    </div>

                    <div className="mt-auto pt-8">
                        <div className="rounded-2xl border p-4 bg-[color:var(--md-nav-item-hover)] border-[color:var(--md-sidebar-border)]">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold bg-[color:var(--md-avatar-bg)] text-[color:var(--md-avatar-text)]">
                                    {userInitials}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-[color:var(--md-sidebar-text)]">{user.name}</p>
                                    <p className="text-xs text-[color:var(--md-sidebar-muted)]">{user.email}</p>
                                </div>
                            </div>
                        </div>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="mt-4 w-full rounded-xl px-4 py-3 text-sm font-semibold transition bg-[color:var(--md-nav-item-hover)] text-[color:var(--md-sidebar-text)] hover:bg-[color:var(--md-nav-item-active)]"
                        >
                            Logout
                        </Link>
                    </div>
                </aside>

                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 flex lg:hidden">
                        <div className="flex-1 bg-slate-900/60" onClick={() => setSidebarOpen(false)}></div>
                        <aside className="w-72 px-6 py-8 text-[color:var(--md-sidebar-text)] backdrop-blur-xl bg-[color:var(--md-sidebar-bg)] border-l border-[color:var(--md-sidebar-border)]">
                            <div className="flex items-center justify-between mb-8">
                                <Link href="/" className="flex items-center gap-3">
                                    <PavonaLogo className="w-9 h-9" />
                                    <span className="text-lg font-bold">Pavona Studios</span>
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => setSidebarOpen(false)}
                                    className="text-[color:var(--md-nav-link)] hover:text-[color:var(--md-nav-link-hover)]"
                                    aria-label="Close sidebar"
                                >
                                    X
                                </button>
                            </div>
                            <div className="space-y-2">{renderNavLinks(true)}</div>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="mt-6 w-full rounded-xl px-4 py-3 text-sm font-semibold transition bg-[color:var(--md-nav-item-hover)] text-[color:var(--md-sidebar-text)] hover:bg-[color:var(--md-nav-item-active)]"
                            >
                                Logout
                            </Link>
                        </aside>
                    </div>
                )}

                <div className="flex-1 min-h-screen">
                    <header className="sticky top-0 z-40">
                        <div className="glass-dark flex items-center justify-between border-b px-6 py-4 bg-[color:var(--md-shell-header-bg)] border-[color:var(--md-shell-header-border)]">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSidebarOpen(true)}
                                    className="inline-flex items-center justify-center rounded-lg p-2 lg:hidden text-[color:var(--md-nav-link)] hover:text-[color:var(--md-nav-link-hover)] hover:bg-[color:var(--md-nav-item-hover)]"
                                >
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                                <p className="text-sm text-[color:var(--md-muted)]">Welcome back, {user.name}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <LanguageSwitcher />
                                <NotificationBell />
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition duration-150 ease-in-out text-[color:var(--md-nav-link)] hover:text-[color:var(--md-nav-link-hover)] focus:outline-none"
                                            >
                                                {user.name}
                                                <svg className="-me-0.5 ms-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">Log Out</Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                                <ThemePickerButton compact />
                            </div>
                        </div>
                    </header>

                    {header && (
                        <div className="mx-6 mt-6 rounded-2xl glass p-6">
                            {header}
                        </div>
                    )}

                    <FlashMessage />

                    <main className="px-6 py-8">{children}</main>
                </div>
            </div>

            <AIChatbot />
            <PushNotificationManager />
            <PromotionModal />
        </div>
    );
}
