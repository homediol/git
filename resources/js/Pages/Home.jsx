import { Head, Link } from '@inertiajs/react';
import Footer from '@/Components/Footer';
import AdSlider from '@/Components/AdSlider';
import PavonaLogo from '@/Components/PavonaLogo';
import NotificationBell from '@/Components/NotificationBell';
import PromotionModal from '@/Components/PromotionModal';

export default function Home({ auth, services = [], portfolios, teams = [], advertisements = [], settings = {} }) {
    const isVideo = (path) => path && path.match(/\.(mp4|webm|avi|mov)$/i);

    console.log('Home - Advertisements received:', advertisements);

    return (
        <>
            <Head title="Home - Graphic Design & Premium Printing">
                <meta name="description" content="Pavona Studios - Professional graphic design, branding, and high-quality printing services. Logo design, vehicle wraps, banners, apparel printing, and more." />
                <meta name="keywords" content="graphic design, printing services, branding, logo design, vehicle wraps, banners, business cards, t-shirt printing" />
            </Head>
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
                {/* Navigation */}
                <nav className="glass-dark border-b border-white/10 relative overflow-hidden" style={!isVideo(settings.header_bg) && settings.header_bg ? { backgroundImage: `url(/storage/${settings.header_bg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
                    {isVideo(settings.header_bg) && (
                        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
                            <source src={`/storage/${settings.header_bg}`} type="video/mp4" />
                        </video>
                    )}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="flex justify-between h-28 items-center">
                            <Link href="/" className="flex items-center gap-3 hover:scale-105 transition-transform duration-300">
                                <PavonaLogo className="w-14 h-14" />
                                <span className="text-2xl font-bold text-white/90 drop-shadow-lg">
                                    Pavona Studios
                                </span>
                            </Link>
                            <div className="hidden md:flex items-center gap-6">
                                <Link href={route('home')} className="text-white/80 font-semibold drop-shadow-lg hover:text-white transition">Home</Link>
                                <Link href={route('about')} className="text-white/80 font-semibold drop-shadow-lg hover:text-white transition">About</Link>
                                <Link href={route('services')} className="text-white/80 font-semibold drop-shadow-lg hover:text-white transition">Services</Link>
                                <Link href={route('portfolio')} className="text-white/80 font-semibold drop-shadow-lg hover:text-white transition">Portfolio</Link>
                                <Link href={route('blog')} className="text-white/80 font-semibold drop-shadow-lg hover:text-white transition">Blog</Link>
                                <Link href={route('contact')} className="text-white/80 font-semibold drop-shadow-lg hover:text-white transition">Contact</Link>
                                {auth?.user && (
                                    <Link href={route('rewards.index')} className="text-sky-200 font-semibold hover:text-white transition">
                                        Rewards
                                    </Link>
                                )}
                                {!auth?.user && (
                                    <Link href={route('login')} className="text-sky-200 font-semibold hover:text-white transition">
                                        Login
                                    </Link>
                                )}
                                {auth?.user && (
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="text-white/80 font-semibold hover:text-white transition"
                                    >
                                        Logout
                                    </Link>
                                )}
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
                                <NotificationBell />
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="py-20 px-4">
                    <div className="max-w-7xl mx-auto text-center">
                        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight mb-6 bg-gradient-to-r from-sky-200 via-blue-100 to-indigo-200 bg-clip-text text-transparent">
                            Pavona Studios
                        </h1>
                        <p className="text-2xl md:text-3xl font-semibold text-white/90 drop-shadow-lg mb-4">
                            Graphic Design, Branding & Premium Printing
                        </p>
                        <p className="text-lg sm:text-xl md:text-2xl text-white/70 drop-shadow-md mb-8 max-w-3xl mx-auto">
                            Transform your brand with professional design and high-quality printing services. 
                            From logos to vehicle wraps, we bring your vision to life with creativity and precision.
                        </p>
                        <div className="flex gap-4 justify-center flex-wrap">
                            <Link href={route('services')} className="bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl px-8 py-4 text-white font-bold text-lg hover:shadow-2xl hover:scale-105 transition">
                                View Our Services
                            </Link>
                            <Link href={route('portfolio')} className="glass-dark rounded-xl px-8 py-4 text-white/90 font-bold text-lg hover:shadow-2xl hover:scale-105 transition">
                                See Our Work
                            </Link>
                            <Link href={route('contact')} className="bg-gradient-to-r from-sky-500 to-violet-500 rounded-xl px-8 py-4 text-white font-bold text-lg hover:shadow-2xl hover:scale-105 transition">
                                Work With Us
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Advertisement Slider */}
                {advertisements.length > 0 && (
                    <section className="py-8 px-4">
                        <div className="max-w-7xl mx-auto">
                            <AdSlider advertisements={advertisements} />
                        </div>
                    </section>
                )}

                {/* Services Section */}
                <section className="py-16 px-4">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="font-display text-4xl sm:text-5xl font-semibold text-center mb-10 bg-gradient-to-r from-sky-200 via-blue-100 to-indigo-200 bg-clip-text text-transparent">Our Services</h2>
                        <div className="flex gap-6 overflow-x-auto pb-2">
                            {services.map((service) => (
                                <Link
                                    key={service.id}
                                    href={route('services.show', service.id)}
                                    className="glass-dark min-w-[280px] max-w-[360px] flex-1 rounded-2xl p-6 transition-all hover:shadow-2xl hover:scale-105"
                                >
                                    {service.image && (
                                        <img
                                            src={service.image}
                                            alt={service.title}
                                            loading="lazy"
                                            className="mb-4 h-48 w-full rounded-xl object-cover"
                                        />
                                    )}
                                    <h3 className="text-2xl font-semibold text-cyan-300">{service.title}</h3>
                                    <p
                                        className="mt-2 text-sm text-white/70 line-clamp-3"
                                        dangerouslySetInnerHTML={{ __html: service.description }}
                                    />
                                    <span className="mt-4 inline-flex text-sm font-semibold text-sky-200">
                                        View Sub-services →
                                    </span>
                                </Link>
                            ))}
                        </div>
                        <div className="text-center mt-8">
                            <Link href={route('services')} className="text-white/70 hover:text-white font-semibold">
                                View All Services →
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Portfolio Section */}
                <section className="py-16 px-4">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="font-display text-4xl sm:text-5xl font-semibold text-center mb-10 bg-gradient-to-r from-sky-200 via-blue-100 to-indigo-200 bg-clip-text text-transparent">Our Portfolio</h2>
                        <div className="flex gap-6 overflow-x-auto pb-2">
                            {portfolios.map((item) => (
                                <div key={item.id} className="glass-dark min-w-[280px] max-w-[320px] flex-1 rounded-2xl overflow-hidden hover:shadow-2xl hover:scale-105 transition-all">
                                    {item.image && (
                                        <img src={item.image} alt={item.title} loading="lazy" className="w-full h-64 object-cover" />
                                    )}
                                    <div className="p-6">
                                        <span className="text-sm uppercase tracking-[0.2em] text-sky-200/80 font-semibold">{item.category}</span>
                                        <h3 className="text-2xl font-semibold bg-gradient-to-r from-sky-200 to-indigo-200 bg-clip-text text-transparent mt-2 mb-3">{item.title}</h3>
                                        <p className="text-base sm:text-lg text-white/70 font-semibold">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-8">
                            <Link href={route('portfolio')} className="text-white/70 hover:text-white font-semibold">
                                View All Projects →
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                {teams.length > 0 && (
                    <section className="py-16 px-4">
                        <div className="max-w-7xl mx-auto">
                            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-center mb-10 bg-gradient-to-r from-sky-200 via-blue-100 to-indigo-200 bg-clip-text text-transparent">Our Team</h2>
                            <div className="grid md:grid-cols-3 gap-8">
                                {teams.map((member) => (
                                    <div key={member.id} className="glass-dark rounded-2xl p-6 text-center hover:shadow-2xl hover:scale-105 transition-all">
                                        {member.image && (
                                            <img src={member.image} alt={member.name} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover" />
                                        )}
                                        <h3 className="text-2xl font-semibold bg-gradient-to-r from-sky-200 via-blue-100 to-indigo-200 bg-clip-text text-transparent mb-2">{member.name}</h3>
                                        <p className="text-base uppercase tracking-[0.2em] text-sky-200/80 font-semibold mb-4">{member.position}</p>
                                        {member.bio && <p className="text-base text-white/70 font-semibold">{member.bio}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                <Footer settings={settings} />
                <PromotionModal />
                </div>
            </div>
        </>
    );
}
