import { Link } from '@inertiajs/react';
import Footer from '@/Components/Footer';
import AIChatbot from '@/Components/AIChatbot';
import PavonaLogo from '@/Components/PavonaLogo';
import PageHeader from '@/Components/PageHeader';

export default function PublicLayout({ auth, children, settings = {}, pageTitle, pageSubtitle, pageIcon }) {
    const isVideo = (path) => path && path.match(/\.(mp4|webm|avi|mov)$/i);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 relative" style={!isVideo(settings.main_bg) && settings.main_bg ? { backgroundImage: `url(/storage/${settings.main_bg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
            {isVideo(settings.main_bg) && (
                <video autoPlay muted loop playsInline className="fixed inset-0 w-full h-full object-cover z-0">
                    <source src={`/storage/${settings.main_bg}`} type="video/mp4" />
                </video>
            )}
            <div className="relative z-10">
            <nav className="glass border-b border-white/20 sticky top-0 z-50 backdrop-blur-xl relative overflow-hidden" style={!isVideo(settings.header_bg) && settings.header_bg ? { backgroundImage: `url(/storage/${settings.header_bg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
                {isVideo(settings.header_bg) && (
                    <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
                        <source src={`/storage/${settings.header_bg}`} type="video/mp4" />
                    </video>
                )}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex justify-between h-20 items-center">
                        <Link href="/" className="flex items-center gap-3 hover:scale-105 transition-transform duration-300">
                            <PavonaLogo className="w-12 h-12" />
                            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent">
                                Pavona Studios
                            </span>
                        </Link>
                        <div className="hidden md:flex space-x-8">
                            <Link href={route('home')} className="text-gray-700 hover:text-purple-600 hover:scale-110 transition-all duration-300 font-semibold relative group">
                                Home
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 group-hover:w-full transition-all duration-300"></span>
                            </Link>
                            <Link href={route('about')} className="text-gray-700 hover:text-pink-600 hover:scale-110 transition-all duration-300 font-semibold relative group">
                                About
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                            </Link>
                            <Link href={route('services')} className="text-gray-700 hover:text-blue-600 hover:scale-110 transition-all duration-300 font-semibold relative group">
                                Services
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                            </Link>
                            <Link href={route('portfolio')} className="text-gray-700 hover:text-purple-600 hover:scale-110 transition-all duration-300 font-semibold relative group">
                                Portfolio
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 group-hover:w-full transition-all duration-300"></span>
                            </Link>
                            <Link href={route('blog')} className="text-gray-700 hover:text-pink-600 hover:scale-110 transition-all duration-300 font-semibold relative group">
                                Blog
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-600 to-blue-600 group-hover:w-full transition-all duration-300"></span>
                            </Link>
                            <Link href={route('contact')} className="text-gray-700 hover:text-blue-600 hover:scale-110 transition-all duration-300 font-semibold relative group">
                                Contact
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {pageTitle && <PageHeader title={pageTitle} subtitle={pageSubtitle} icon={pageIcon} />}

            <main>{children}</main>

            <Footer settings={settings} />
            <AIChatbot />
            </div>
        </div>
    );
}
