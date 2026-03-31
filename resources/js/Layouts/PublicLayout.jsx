import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Footer from '@/Components/Footer';
import AIChatbot from '@/Components/AIChatbot';
import PavonaLogo from '@/Components/PavonaLogo';
import PageHeader from '@/Components/PageHeader';
import NotificationBell from '@/Components/NotificationBell';
import PromotionModal from '@/Components/PromotionModal';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import BookingTrigger from '@/Components/BookingTrigger';
import ChatTrigger from '@/Components/ChatTrigger';
import ThemePickerButton from '@/Components/ThemePickerButton';
import PushNotificationManager from '@/Components/PushNotificationManager';
import { useLocale } from '@/Providers/LocaleProvider';

export default function PublicLayout({ auth, children, settings = {}, pageTitle, pageSubtitle, pageIcon }) {
    const { t } = useLocale();
    const page = usePage();
    const { siteSettings = {} } = page.props;
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const resolvedSettings = {
        ...siteSettings,
        ...settings,
    };

    const isVideo = (path) => path && path.match(/\.(mp4|webm|avi|mov)$/i);

    const navItems = [
        { label: t('nav.home'), href: route('home') },
        { label: t('nav.about'), href: route('about') },
        { label: t('nav.services'), href: route('services') },
        { label: t('nav.portfolio'), href: route('portfolio') },
        { label: t('nav.blog'), href: route('blog') },
        { label: t('nav.contact'), href: route('contact') },
    ];

    useEffect(() => {
        setMobileNavOpen(false);
    }, [page.url]);

    useEffect(() => {
        if (typeof document === 'undefined') {
            return undefined;
        }

        document.body.classList.toggle('nav-sheet-open', mobileNavOpen);

        return () => {
            document.body.classList.remove('nav-sheet-open');
        };
    }, [mobileNavOpen]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return undefined;
        }

        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setMobileNavOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className="min-h-screen relative overflow-hidden bg-transparent text-[color:var(--md-text)]">
            {isVideo(resolvedSettings.main_bg) && (
                <video autoPlay muted loop playsInline className="fixed inset-0 w-full h-full object-cover z-0 opacity-30">
                    <source src={`/storage/${resolvedSettings.main_bg}`} type="video/mp4" />
                </video>
            )}
            {!isVideo(resolvedSettings.main_bg) && resolvedSettings.main_bg && (
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-20"
                    style={{ backgroundImage: `url(/storage/${resolvedSettings.main_bg})` }}
                ></div>
            )}
            <div className="pointer-events-none absolute -top-32 -right-40 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(255,109,0,0.25),_transparent_70%)] blur-3xl"></div>
            <div className="pointer-events-none absolute top-24 -left-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(66,133,244,0.2),_transparent_70%)] blur-3xl"></div>
            <div className="relative z-10">
                <nav className="sticky top-0 z-50 border-b border-[color:var(--md-outline)] bg-[color:var(--md-shell-header-bg)] backdrop-blur-xl">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex min-h-[5rem] items-center justify-between gap-3 lg:min-h-[5.25rem]">
                            <Link href="/" className="min-w-0 flex items-center gap-3 transition-transform duration-300 hover:scale-[1.02]">
                                <PavonaLogo className="h-11 w-11 shrink-0 sm:h-12 sm:w-12" />
                                <span className="truncate text-lg font-bold text-[color:var(--md-text)] sm:text-2xl">
                                    Pavona Studios
                                </span>
                            </Link>

                            <div className="hidden lg:flex items-center gap-6">
                                <div className="flex items-center gap-5 xl:gap-6">
                                    {navItems.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className="text-sm font-semibold text-slate-600 hover:text-[color:var(--md-text)] transition"
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                    {auth?.user ? (
                                        <Link href={route('rewards.index')} className="text-sm font-semibold text-[color:var(--md-success)] hover:text-[color:var(--md-text)] transition">
                                            {t('nav.rewards')}
                                        </Link>
                                    ) : (
                                        <Link href={route('login')} className="text-sm font-semibold text-[color:var(--md-secondary)] hover:text-[color:var(--md-text)] transition">
                                            {t('nav.login')}
                                        </Link>
                                    )}
                                    {auth?.user && (
                                        <Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="text-sm font-semibold text-slate-500 hover:text-[color:var(--md-text)] transition"
                                        >
                                            {t('nav.logout')}
                                        </Link>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    <LanguageSwitcher />
                                    <NotificationBell />
                                    <ChatTrigger auth={auth} className="btn-secondary whitespace-nowrap px-4 py-2.5 text-sm">
                                        {t('nav.chat')}
                                    </ChatTrigger>
                                    <BookingTrigger auth={auth} className="btn-fire whitespace-nowrap">
                                        {t('nav.cta')}
                                    </BookingTrigger>
                                    <ThemePickerButton />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 lg:hidden">
                                <LanguageSwitcher />
                                <NotificationBell />
                                <ThemePickerButton compact className="!px-2.5 !py-2" />
                                <button
                                    type="button"
                                    onClick={() => setMobileNavOpen((current) => !current)}
                                    aria-expanded={mobileNavOpen}
                                    aria-controls="public-mobile-nav"
                                    className="icon-btn"
                                >
                                    <svg className="h-5 w-5 text-[color:var(--md-text)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        {mobileNavOpen ? (
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
                                        ) : (
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
                                        )}
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {mobileNavOpen && (
                            <div className="lg:hidden">
                                <div className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[2px]" onClick={() => setMobileNavOpen(false)} />
                                <div
                                    id="public-mobile-nav"
                                    className="absolute inset-x-4 top-full z-50 mt-3 max-h-[calc(100vh-6.5rem)] overflow-y-auto rounded-[28px] border border-[color:var(--md-outline)] bg-[color:var(--md-surface)] p-4 shadow-[0_24px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl"
                                >
                                    <div className="grid gap-2">
                                        {navItems.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className="rounded-2xl px-4 py-3 text-sm font-semibold text-[color:var(--md-text)] transition hover:bg-[color:var(--md-surface-alt)]"
                                            >
                                                {item.label}
                                            </Link>
                                        ))}
                                        {auth?.user ? (
                                            <Link
                                                href={route('rewards.index')}
                                                className="rounded-2xl px-4 py-3 text-sm font-semibold text-[color:var(--md-success)] transition hover:bg-[color:var(--md-surface-alt)]"
                                            >
                                                {t('nav.rewards')}
                                            </Link>
                                        ) : (
                                            <Link
                                                href={route('login')}
                                                className="rounded-2xl px-4 py-3 text-sm font-semibold text-[color:var(--md-secondary)] transition hover:bg-[color:var(--md-surface-alt)]"
                                            >
                                                {t('nav.login')}
                                            </Link>
                                        )}
                                    </div>

                                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                        <ChatTrigger auth={auth} className="btn-secondary w-full justify-center">
                                            {t('nav.chat')}
                                        </ChatTrigger>
                                        <BookingTrigger auth={auth} className="btn-fire w-full justify-center">
                                            {t('nav.cta')}
                                        </BookingTrigger>
                                    </div>

                                    {auth?.user && (
                                        <Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-[color:var(--md-outline)] bg-[color:var(--md-surface-alt)] px-4 py-3 text-sm font-semibold text-[color:var(--md-text)] transition hover:bg-[color:var(--md-surface)]"
                                        >
                                            {t('nav.logout')}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </nav>

                {pageTitle && <PageHeader title={pageTitle} subtitle={pageSubtitle} icon={pageIcon} />}

                <main>{children}</main>

                <Footer settings={resolvedSettings} />
                <AIChatbot />
                <PushNotificationManager />
                <PromotionModal />
            </div>
        </div>
    );
}
