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
                    <h1 className="text-5xl font-bold text-center mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Our Portfolio
                    </h1>
                    <p className="text-center text-gray-900 text-2xl font-semibold mb-8 max-w-2xl mx-auto">
                        Explore our portfolio of branding, design, and printing projects for businesses and organizations
                    </p>

                    {/* Category Filter */}
                    <div className="flex flex-wrap justify-center gap-4 mb-12">
                        <Link
                            href={route('portfolio')}
                            className={`px-6 py-2 rounded-xl font-semibold transition ${
                                !selectedCategory
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl'
                                    : 'glass text-gray-700 hover:shadow-xl'
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
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl'
                                        : 'glass text-gray-700 hover:shadow-xl'
                                }`}
                            >
                                {category}
                            </Link>
                        ))}
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {portfolios.map((item) => (
                            <div key={item.id} className="glass rounded-2xl overflow-hidden hover:shadow-2xl hover:scale-105 transition-all">
                                {item.image && (
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        loading="lazy"
                                        className="w-full h-64 object-cover"
                                    />
                                )}
                                <div className="p-6">
                                    <span className="text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold uppercase">{item.category}</span>
                                    <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-2 mb-3">{item.title}</h3>
                                    <p className="text-xl text-gray-900 font-semibold">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {advertisements.length > 0 && (
                        <div className="mt-16">
                            <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Our Partners</h2>
                            <AdCircleGrid advertisements={advertisements} />
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
