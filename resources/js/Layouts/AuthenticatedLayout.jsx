import Dropdown from '@/Components/Dropdown';
import AIChatbot from '@/Components/AIChatbot';
import PavonaLogo from '@/Components/PavonaLogo';
import FlashMessage from '@/Components/FlashMessage';
import NotificationBell from '@/Components/NotificationBell';
import PromotionModal from '@/Components/PromotionModal';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

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

    const renderNavLinks = (closeOnClick = false) =>
        navItems.map((item) => (
            <Link
                key={item.label}
                href={item.href}
                onClick={closeOnClick ? () => setSidebarOpen(false) : undefined}
                className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
                    item.active
                        ? 'bg-white/15 text-white shadow-lg shadow-slate-900/30'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                aria-current={item.active ? 'page' : undefined}
            >
                <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        item.active
                            ? 'bg-white/15 text-white'
                            : 'bg-white/5 text-white/70 group-hover:text-white'
                    }`}
                >
                    {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.active && <span className="h-2 w-2 rounded-full bg-sky-400" />}
            </Link>
        ));

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-white to-sky-100">
            <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-sky-300/30 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-20 h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl" />

            <div className="relative flex">
                <aside className="hidden lg:flex flex-col w-72 min-h-screen bg-slate-950 text-white px-6 py-8 border-r border-white/10">
                    <Link href="/" className="flex items-center gap-3">
                        <PavonaLogo className="w-10 h-10" />
                        <div>
                            <span className="text-lg font-bold">Pavona Studios</span>
                            <p className="text-xs text-white/50">Creative Agency</p>
                        </div>
                    </Link>

                    <div className="mt-10">
                        <p className="text-[11px] uppercase tracking-[0.35em] text-white/40">Navigation</p>
                        <div className="mt-4 space-y-2">{renderNavLinks()}</div>
                    </div>

                    <div className="mt-auto pt-8">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-500/20 text-sm font-semibold text-sky-200">
                                    {userInitials}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">{user.name}</p>
                                    <p className="text-xs text-white/50">{user.email}</p>
                                </div>
                            </div>
                        </div>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="mt-4 w-full rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white/90 hover:text-white"
                        >
                            Logout
                        </Link>
                    </div>
                </aside>

                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 flex lg:hidden">
                        <div className="flex-1 bg-slate-900/60" onClick={() => setSidebarOpen(false)}></div>
                        <aside className="w-72 bg-slate-950 text-white px-6 py-8">
                            <div className="flex items-center justify-between mb-8">
                                <Link href="/" className="flex items-center gap-3">
                                    <PavonaLogo className="w-9 h-9" />
                                    <span className="text-lg font-bold">Pavona Studios</span>
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => setSidebarOpen(false)}
                                    className="text-white/70 hover:text-white"
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
                                className="mt-6 w-full rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white/90 hover:text-white"
                            >
                                Logout
                            </Link>
                        </aside>
                    </div>
                )}

                <div className="flex-1 min-h-screen">
                    <header className="sticky top-0 z-40">
                        <div className="flex items-center justify-between px-6 py-4 glass-dark bg-slate-900/80 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSidebarOpen(true)}
                                    className="lg:hidden inline-flex items-center justify-center rounded-lg p-2 text-white/70 hover:text-white hover:bg-white/10"
                                >
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                                <p className="text-white/80 text-sm">Welcome back, {user.name}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <LanguageSwitcher />
                                <NotificationBell />
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition duration-150 ease-in-out hover:text-white focus:outline-none"
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
            <PromotionModal />
        </div>
    );
}
