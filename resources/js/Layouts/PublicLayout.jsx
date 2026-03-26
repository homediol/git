import { Link } from '@inertiajs/react';
import Footer from '@/Components/Footer';
import AIChatbot from '@/Components/AIChatbot';
import PavonaLogo from '@/Components/PavonaLogo';
import PageHeader from '@/Components/PageHeader';
import NotificationBell from '@/Components/NotificationBell';
import PromotionModal from '@/Components/PromotionModal';
import LanguageSwitcher from '@/Components/LanguageSwitcher';

export default function PublicLayout({ auth, children, settings = {}, pageTitle, pageSubtitle, pageIcon }) {
    const isVideo = (path) => path && path.match(/\.(mp4|webm|avi|mov)$/i);

    return (
        <div
            className="min-h-screen relative overflow-hidden text-white sky-stars"
            style={!isVideo(settings.main_bg) && settings.main_bg ? { backgroundImage: `url(/storage/${settings.main_bg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
            {isVideo(settings.main_bg) && (
                <video autoPlay muted loop playsInline className="fixed inset-0 w-full h-full object-cover z-0">
                    <source src={`/storage/${settings.main_bg}`} type="video/mp4" />
                </video>
            )}
            <div className="relative z-10">
            <nav className="glass-dark border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl relative overflow-hidden" style={!isVideo(settings.header_bg) && settings.header_bg ? { backgroundImage: `url(/storage/${settings.header_bg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
                {isVideo(settings.header_bg) && (
                    <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
                        <source src={`/storage/${settings.header_bg}`} type="video/mp4" />
                    </video>
                )}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex justify-between h-20 items-center">
                        <Link href="/" className="flex items-center gap-3 hover:scale-105 transition-transform duration-300">
                            <PavonaLogo className="w-12 h-12" />
                            <span className="text-2xl font-bold bg-gradient-to-r from-violet-200 via-fuchsia-200 to-sky-200 bg-clip-text text-transparent">
                                Pavona Studios
                            </span>
                        </Link>
                        <div className="hidden md:flex items-center gap-6">
                            <Link href={route('home')} className="text-white/70 hover:text-white hover:scale-110 transition-all duration-300 font-semibold relative group">
                                Home
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-violet-400 to-fuchsia-400 group-hover:w-full transition-all duration-300"></span>
                            </Link>
                            <Link href={route('about')} className="text-white/70 hover:text-white hover:scale-110 transition-all duration-300 font-semibold relative group">
                                About
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-fuchsia-400 to-violet-400 group-hover:w-full transition-all duration-300"></span>
                            </Link>
                            <Link href={route('services')} className="text-white/70 hover:text-white hover:scale-110 transition-all duration-300 font-semibold relative group">
                                Services
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-sky-400 to-violet-400 group-hover:w-full transition-all duration-300"></span>
                            </Link>
                            <Link href={route('portfolio')} className="text-white/70 hover:text-white hover:scale-110 transition-all duration-300 font-semibold relative group">
                                Portfolio
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-violet-400 to-fuchsia-400 group-hover:w-full transition-all duration-300"></span>
                            </Link>
                            <Link href={route('blog')} className="text-white/70 hover:text-white hover:scale-110 transition-all duration-300 font-semibold relative group">
                                Blog
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-fuchsia-400 to-sky-400 group-hover:w-full transition-all duration-300"></span>
                            </Link>
                            <Link href={route('contact')} className="text-white/70 hover:text-white hover:scale-110 transition-all duration-300 font-semibold relative group">
                                Contact
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-sky-400 to-violet-400 group-hover:w-full transition-all duration-300"></span>
                            </Link>
                            {auth?.user && (
                                <Link href={route('rewards.index')} className="text-sky-200 hover:text-white font-semibold">
                                    Rewards
                                </Link>
                            )}
                            {!auth?.user && (
                                <Link href={route('login')} className="text-sky-200 hover:text-white font-semibold">
                                    Login
                                </Link>
                            )}
                            {auth?.user && (
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="text-white/70 hover:text-white font-semibold"
                                >
                                    Logout
                                </Link>
                            )}
                            <LanguageSwitcher />
                            <NotificationBell />
                        </div>
                        <div className="flex items-center gap-3 md:hidden">
                            {auth?.user && (
                                <Link href={route('rewards.index')} className="text-sky-200 text-sm font-semibold">
                                    Rewards
                                </Link>
                            )}
                            {!auth?.user && (
                                <Link href={route('login')} className="text-sky-200 text-sm font-semibold">
                                    Login
                                </Link>
                            )}
                            {auth?.user && (
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="text-white/80 text-sm font-semibold"
                                >
                                    Logout
                                </Link>
                            )}
                            <LanguageSwitcher />
                            <NotificationBell />
                        </div>
                    </div>
                </div>
            </nav>

            {pageTitle && <PageHeader title={pageTitle} subtitle={pageSubtitle} icon={pageIcon} />}

            <main>{children}</main>

            <Footer settings={settings} />
            <AIChatbot />
            <PromotionModal />
            </div>
        </div>
    );
}
