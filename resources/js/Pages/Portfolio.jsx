import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import AdCircleGrid from '@/Components/AdCircleGrid';

export default function Portfolio({ auth, portfolios, categories, selectedCategory, advertisements = [], settings }) {
    return (
        <PublicLayout auth={auth} settings={settings}>
            <Head title="Portfolio">
                <meta name="description" content="Explore our portfolio of creative projects and digital solutions" />
                <meta name="keywords" content="portfolio, projects, web design, development" />
            </Head>
            
            <div className="py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <h1 className="font-display text-4xl sm:text-5xl font-semibold text-center mb-4 bg-gradient-to-r from-sky-200 to-indigo-200 bg-clip-text text-transparent">
                        Our Portfolio
                    </h1>
                    <p className="text-center text-white/70 text-base sm:text-lg font-semibold mb-10 max-w-2xl mx-auto">
                        Explore our portfolio of branding, design, and printing projects for businesses and organizations
                    </p>

                    {/* Category Filter */}
                    <div className="flex flex-wrap justify-center gap-4 mb-12">
                        <Link
                            href={route('portfolio')}
                            className={`px-6 py-2 rounded-xl font-semibold transition ${
                                !selectedCategory
                                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-xl'
                                    : 'glass-dark text-white/70 hover:text-white hover:shadow-xl'
                            }`}
                        >
                            All
                        </Link>
                        {categories.map((category) => (
                            <Link
                                key={category}
                                href={route('portfolio', { category })}
                                className={`px-6 py-2 rounded-xl font-semibold transition ${
                                    selectedCategory === category
                                        ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-xl'
                                        : 'glass-dark text-white/70 hover:text-white hover:shadow-xl'
                                }`}
                            >
                                {category}
                            </Link>
                        ))}
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {portfolios.map((item) => (
                            <div key={item.id} className="glass-dark rounded-2xl overflow-hidden hover:shadow-2xl hover:scale-105 transition-all">
                                {item.image && (
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        loading="lazy"
                                        className="w-full h-64 object-cover"
                                    />
                                )}
                                <div className="p-6">
                                    <span className="text-sm uppercase tracking-[0.2em] text-sky-200/80 font-semibold">{item.category}</span>
                                    <h3 className="text-2xl font-semibold bg-gradient-to-r from-sky-200 to-indigo-200 bg-clip-text text-transparent mt-2 mb-3">{item.title}</h3>
                                    <p className="text-base sm:text-lg text-white/70 font-semibold">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {advertisements.length > 0 && (
                        <div className="mt-16">
                            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-center mb-10 text-white/90">Our Partners</h2>
                            <AdCircleGrid advertisements={advertisements} />
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
