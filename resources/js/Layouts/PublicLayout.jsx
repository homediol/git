import { Link } from '@inertiajs/react';
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
    const isVideo = (path) => path && path.match(/\.(mp4|webm|avi|mov)$/i);

    return (
        <div className="min-h-screen relative overflow-hidden bg-transparent text-[color:var(--md-text)]">
            {isVideo(settings.main_bg) && (
                <video autoPlay muted loop playsInline className="fixed inset-0 w-full h-full object-cover z-0 opacity-30">
                    <source src={`/storage/${settings.main_bg}`} type="video/mp4" />
                </video>
            )}
            {!isVideo(settings.main_bg) && settings.main_bg && (
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-20"
                    style={{ backgroundImage: `url(/storage/${settings.main_bg})` }}
                ></div>
            )}
            <div className="pointer-events-none absolute -top-32 -right-40 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(255,109,0,0.25),_transparent_70%)] blur-3xl"></div>
            <div className="pointer-events-none absolute top-24 -left-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(66,133,244,0.2),_transparent_70%)] blur-3xl"></div>
            <div className="relative z-10">
                <nav className="sticky top-0 z-50 border-b border-[color:var(--md-outline)] bg-white/80 backdrop-blur-xl">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-20 items-center">
                            <Link href="/" className="flex items-center gap-3 transition-transform duration-300 hover:scale-105">
                                <PavonaLogo className="w-12 h-12" />
                                <span className="text-xl sm:text-2xl font-bold text-[color:var(--md-text)]">
                                    Pavona Studios
                                </span>
                            </Link>
                            <div className="hidden md:flex items-center gap-6">
                                <div className="flex items-center gap-6">
                                    <Link href={route('home')} className="text-sm font-semibold text-slate-600 hover:text-[color:var(--md-text)] transition">
                                        {t('nav.home')}
                                    </Link>
                                    <Link href={route('about')} className="text-sm font-semibold text-slate-600 hover:text-[color:var(--md-text)] transition">
                                        {t('nav.about')}
                                    </Link>
                                    <Link href={route('services')} className="text-sm font-semibold text-slate-600 hover:text-[color:var(--md-text)] transition">
                                        {t('nav.services')}
                                    </Link>
                                    <Link href={route('portfolio')} className="text-sm font-semibold text-slate-600 hover:text-[color:var(--md-text)] transition">
                                        {t('nav.portfolio')}
                                    </Link>
                                    <Link href={route('blog')} className="text-sm font-semibold text-slate-600 hover:text-[color:var(--md-text)] transition">
                                        {t('nav.blog')}
                                    </Link>
                                    <Link href={route('contact')} className="text-sm font-semibold text-slate-600 hover:text-[color:var(--md-text)] transition">
                                        {t('nav.contact')}
                                    </Link>
                                    {auth?.user && (
                                        <Link href={route('rewards.index')} className="text-sm font-semibold text-[color:var(--md-success)] hover:text-[color:var(--md-text)] transition">
                                            {t('nav.rewards')}
                                        </Link>
                                    )}
                                    {!auth?.user && (
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
                                    <BookingTrigger auth={auth} className="btn-fire">
                                        {t('nav.cta')}
                                    </BookingTrigger>
                                    <ThemePickerButton />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 md:hidden">
                                {auth?.user && (
                                    <Link href={route('rewards.index')} className="text-xs font-semibold text-[color:var(--md-success)]">
                                        {t('nav.rewards')}
                                    </Link>
                                )}
                                {!auth?.user && (
                                    <Link href={route('login')} className="text-xs font-semibold text-[color:var(--md-secondary)]">
                                        {t('nav.login')}
                                    </Link>
                                )}
                                <div className="flex items-center gap-2">
                                    <LanguageSwitcher />
                                    <NotificationBell />
                                    <ChatTrigger auth={auth} className="btn-secondary px-4 py-2 text-xs whitespace-nowrap">
                                        {t('nav.chat')}
                                    </ChatTrigger>
                                    <BookingTrigger auth={auth} className="btn-fire px-4 py-2 text-xs">
                                        {t('nav.cta')}
                                    </BookingTrigger>
                                    <ThemePickerButton compact />
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                {pageTitle && <PageHeader title={pageTitle} subtitle={pageSubtitle} icon={pageIcon} />}

                <main>{children}</main>

                <Footer settings={settings} />
                <AIChatbot />
                <PushNotificationManager />
                <PromotionModal />
            </div>
        </div>
    );
}
