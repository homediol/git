import { Head, Link } from '@inertiajs/react';
import Footer from '@/Components/Footer';
import AdSlider from '@/Components/AdSlider';
import PavonaLogo from '@/Components/PavonaLogo';

export default function Home({ auth, services, portfolios, teams = [], advertisements = [], settings = {} }) {
    const isVideo = (path) => path && path.match(/\.(mp4|webm|avi|mov)$/i);

    console.log('Home - Advertisements received:', advertisements);

    return (
        <>
            <Head title="Home - Graphic Design & Premium Printing">
                <meta name="description" content="Pavona Studios - Professional graphic design, branding, and high-quality printing services. Logo design, vehicle wraps, banners, apparel printing, and more." />
                <meta name="keywords" content="graphic design, printing services, branding, logo design, vehicle wraps, banners, business cards, t-shirt printing" />
            </Head>
            <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 relative" style={!isVideo(settings.main_bg) && settings.main_bg ? { backgroundImage: `url(/storage/${settings.main_bg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
                {isVideo(settings.main_bg) && (
                    <video autoPlay muted loop playsInline className="fixed inset-0 w-full h-full object-cover z-0">
                        <source src={`/storage/${settings.main_bg}`} type="video/mp4" />
                    </video>
                )}
                <div className="relative z-10">
                {/* Navigation */}
                <nav className="glass border-b border-white/20 relative overflow-hidden" style={!isVideo(settings.header_bg) && settings.header_bg ? { backgroundImage: `url(/storage/${settings.header_bg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
                    {isVideo(settings.header_bg) && (
                        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
                            <source src={`/storage/${settings.header_bg}`} type="video/mp4" />
                        </video>
                    )}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="flex justify-between h-28 items-center">
                            <Link href="/" className="flex items-center gap-3 hover:scale-105 transition-transform duration-300">
                                <PavonaLogo className="w-14 h-14" />
                                <span className="text-2xl font-bold text-white drop-shadow-lg">
                                    Pavona Studios
                                </span>
                            </Link>
                            <div className="hidden md:flex space-x-8">
                                <Link href={route('home')} className="text-white font-semibold drop-shadow-lg hover:text-yellow-300 transition">Home</Link>
                                <Link href={route('about')} className="text-white font-semibold drop-shadow-lg hover:text-yellow-300 transition">About</Link>
                                <Link href={route('services')} className="text-white font-semibold drop-shadow-lg hover:text-yellow-300 transition">Services</Link>
                                <Link href={route('portfolio')} className="text-white font-semibold drop-shadow-lg hover:text-yellow-300 transition">Portfolio</Link>
                                <Link href={route('blog')} className="text-white font-semibold drop-shadow-lg hover:text-yellow-300 transition">Blog</Link>
                                <Link href={route('contact')} className="text-white font-semibold drop-shadow-lg hover:text-yellow-300 transition">Contact</Link>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="py-20 px-4">
                    <div className="max-w-7xl mx-auto text-center">
                        <h1 className="text-7xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                            Pavona Studios
                        </h1>
                        <p className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg mb-4">
                            Graphic Design, Branding & Premium Printing
                        </p>
                        <p className="text-2xl md:text-3xl text-white drop-shadow-md mb-8 max-w-3xl mx-auto">
                            Transform your brand with professional design and high-quality printing services. 
                            From logos to vehicle wraps, we bring your vision to life with creativity and precision.
                        </p>
                        <div className="flex gap-4 justify-center flex-wrap">
                            <Link href={route('services')} className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl px-8 py-4 text-white font-bold text-lg hover:shadow-2xl hover:scale-105 transition">
                                View Our Services
                            </Link>
                            <Link href={route('portfolio')} className="glass rounded-xl px-8 py-4 text-white font-bold text-lg hover:shadow-2xl hover:scale-105 transition">
                                See Our Work
                            </Link>
                            <Link href={route('contact')} className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl px-8 py-4 text-white font-bold text-lg hover:shadow-2xl hover:scale-105 transition">
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
                        <h2 className="text-5xl md:text-6xl font-bold text-center mb-12 text-white drop-shadow-lg">Our Services</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {services.map((service) => (
                                <div key={service.id} className="glass rounded-2xl p-6 hover:shadow-2xl hover:scale-105 transition-all">
                                    {service.image && (
                                        <img src={service.image} alt={service.title} loading="lazy" className="w-full h-48 object-cover rounded-xl mb-4" />
                                    )}
                                    <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3" dangerouslySetInnerHTML={{ __html: service.title }} />
                                    <p className="text-xl text-gray-900 font-semibold" dangerouslySetInnerHTML={{ __html: service.description }} />
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-8">
                            <Link href={route('services')} className="text-purple-600 hover:text-purple-800 font-semibold">
                                View All Services →
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Portfolio Section */}
                <section className="py-16 px-4">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-5xl md:text-6xl font-bold text-center mb-12 text-white drop-shadow-lg">Our Portfolio</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {portfolios.map((item) => (
                                <div key={item.id} className="glass rounded-2xl overflow-hidden hover:shadow-2xl hover:scale-105 transition-all">
                                    {item.image && (
                                        <img src={item.image} alt={item.title} loading="lazy" className="w-full h-64 object-cover" />
                                    )}
                                    <div className="p-6">
                                        <span className="text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">{item.category}</span>
                                        <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-2 mb-3">{item.title}</h3>
                                        <p className="text-xl text-gray-900 font-semibold">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-8">
                            <Link href={route('portfolio')} className="text-purple-600 hover:text-purple-800 font-semibold">
                                View All Projects →
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                {teams.length > 0 && (
                    <section className="py-16 px-4">
                        <div className="max-w-7xl mx-auto">
                            <h2 className="text-5xl md:text-6xl font-bold text-center mb-12 text-white drop-shadow-lg">Our Team</h2>
                            <div className="grid md:grid-cols-3 gap-8">
                                {teams.map((member) => (
                                    <div key={member.id} className="glass rounded-2xl p-6 text-center hover:shadow-2xl hover:scale-105 transition-all">
                                        {member.image && (
                                            <img src={member.image} alt={member.name} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover" />
                                        )}
                                        <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">{member.name}</h3>
                                        <p className="text-xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent font-bold mb-4">{member.position}</p>
                                        {member.bio && <p className="text-lg text-gray-900 font-semibold">{member.bio}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                <Footer settings={settings} />
                </div>
            </div>
        </>
    );
}
