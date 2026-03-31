import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import AdCircleGrid from '@/Components/AdCircleGrid';
import MediaPreview from '@/Components/MediaPreview';
import { useLocale } from '@/Providers/LocaleProvider';

export default function Portfolio({ auth, portfolios = [], categories = [], selectedCategory, advertisements = [], settings }) {
    const { t } = useLocale();

    return (
        <PublicLayout auth={auth} settings={settings}>
            <Head title={t('portfolio.meta.title')}>
                <meta name="description" content={t('portfolio.meta.description')} />
                <meta name="keywords" content={t('portfolio.meta.keywords')} />
            </Head>

            <div className="py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-10">
                        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[color:var(--md-text)]">
                            {t('portfolio.title')}
                        </h1>
                        <p className="text-slate-600 mt-3">
                            {t('portfolio.subtitle')}
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3 mb-12">
                        <Link
                            href={route('portfolio')}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                                !selectedCategory
                                    ? 'btn-primary'
                                    : 'btn-outline'
                            }`}
                        >
                            {t('portfolio.filter_all')}
                        </Link>
                        {categories.map((category) => (
                            <Link
                                key={category}
                                href={route('portfolio', { category })}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                                    selectedCategory === category
                                        ? 'btn-primary'
                                        : 'btn-outline'
                                }`}
                            >
                                {category}
                            </Link>
                        ))}
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {portfolios.map((item) => (
                            <div key={item.id} className="surface overflow-hidden transition-all duration-300 hover:shadow-elevated hover:-translate-y-1">
                                {item.image && (
                                    <MediaPreview
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-56 object-cover"
                                        imgProps={{ loading: 'lazy' }}
                                        videoProps={{ autoPlay: true, loop: true, muted: true, playsInline: true, preload: 'metadata' }}
                                    />
                                )}
                                <div className="p-6">
                                    <span className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">{item.category}</span>
                                    <h3 className="text-lg font-semibold text-[color:var(--md-text)] mt-2">{item.title}</h3>
                                    <p className="text-sm text-slate-600 mt-2">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {advertisements.length > 0 && (
                        <div className="mt-16">
                            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-center mb-6 text-[color:var(--md-text)]">
                                {t('portfolio.partners')}
                            </h2>
                            <AdCircleGrid advertisements={advertisements} />
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
