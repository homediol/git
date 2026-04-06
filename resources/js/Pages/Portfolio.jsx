import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import AdCircleGrid from '@/Components/AdCircleGrid';
import MediaPreview from '@/Components/MediaPreview';
import { useLocale } from '@/Providers/LocaleProvider';
import { getLocalizedValue } from '@/lib/i18n';

export default function Portfolio({ auth, portfolios = [], categories = [], selectedCategory, advertisements = [], settings }) {
    const { locale, t } = useLocale();
    const dateLocale = locale === 'fr' ? 'fr-FR' : locale === 'rw' ? 'rw-RW' : 'en-US';
    const formatDate = (value) => {
        if (!value) return '';

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return '';
        }

        return date.toLocaleDateString(dateLocale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };
    const normalizedCategories = categories.map((category) => (
        typeof category === 'string'
            ? { category, category_rw: '', category_en: category, category_fr: '' }
            : category
    ));
    const featuredItem = portfolios[0] ?? null;
    const remainingPortfolios = featuredItem ? portfolios.slice(1) : [];
    const filteredCategoryCount = new Set(portfolios.map((item) => item.category).filter(Boolean)).size;
    const selectedCategoryOption = normalizedCategories.find((item) => item.category === selectedCategory);
    const selectedCategoryLabel = selectedCategoryOption
        ? (getLocalizedValue(locale, selectedCategoryOption, 'category') || selectedCategoryOption.category)
        : (selectedCategory || t('portfolio.stats.focus_all'));
    const summaryCards = [
        { value: portfolios.length, label: t('portfolio.stats.projects') },
        { value: filteredCategoryCount, label: t('portfolio.stats.categories') },
        { value: selectedCategoryLabel, label: t('portfolio.stats.focus') },
    ];

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

                    <div className="grid gap-4 mb-10 sm:grid-cols-3">
                        {summaryCards.map((item) => (
                            <div key={item.label} className="surface-soft p-5 text-center">
                                <p className="text-xl sm:text-2xl font-semibold text-[color:var(--md-text)]">{item.value}</p>
                                <p className="mt-2 text-xs uppercase tracking-[0.18em] font-semibold text-slate-500">
                                    {item.label}
                                </p>
                            </div>
                        ))}
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
                        {normalizedCategories.map((categoryItem) => (
                            <Link
                                key={categoryItem.category}
                                href={route('portfolio', { category: categoryItem.category })}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                                    selectedCategory === categoryItem.category
                                        ? 'btn-primary'
                                        : 'btn-outline'
                                }`}
                            >
                                {getLocalizedValue(locale, categoryItem, 'category') || categoryItem.category}
                            </Link>
                        ))}
                    </div>

                    {featuredItem ? (
                        <>
                            <div className="surface overflow-hidden mb-12 grid lg:grid-cols-[1.15fr,0.85fr]">
                                <MediaPreview
                                    src={featuredItem.image}
                                    alt={getLocalizedValue(locale, featuredItem, 'title') || featuredItem.title}
                                    className="h-72 w-full object-cover sm:h-80 lg:h-full"
                                    imgProps={{ loading: 'lazy' }}
                                    videoProps={{ autoPlay: true, loop: true, muted: true, playsInline: true, preload: 'metadata' }}
                                />
                                <div className="p-6 sm:p-8 flex flex-col justify-center">
                                    <span className="chip mb-4">{t('portfolio.featured.eyebrow')}</span>
                                    <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold">
                                        <span>{getLocalizedValue(locale, featuredItem, 'category') || featuredItem.category}</span>
                                        {formatDate(featuredItem.created_at) && <span>{formatDate(featuredItem.created_at)}</span>}
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl font-semibold text-[color:var(--md-text)] mt-3">
                                        {getLocalizedValue(locale, featuredItem, 'title') || featuredItem.title}
                                    </h2>
                                    <p className="text-slate-600 mt-4 leading-7">
                                        {getLocalizedValue(locale, featuredItem, 'description') || featuredItem.description}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-5">
                                        {t('portfolio.featured.description')}
                                    </p>
                                    <div className="mt-6 flex flex-wrap gap-3">
                                        {featuredItem.category && (
                                            <Link href={route('portfolio', { category: featuredItem.category })} className="btn-outline">
                                                {t('portfolio.cta.filter')}
                                            </Link>
                                        )}
                                        <Link href={route('contact')} className="btn-primary">
                                            {t('portfolio.cta.contact')}
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {remainingPortfolios.length > 0 && (
                                <>
                                    <div className="text-center max-w-3xl mx-auto mb-10">
                                        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[color:var(--md-text)]">
                                            {t('portfolio.collection.title')}
                                        </h2>
                                        <p className="text-slate-600 mt-3">
                                            {t('portfolio.collection.subtitle')}
                                        </p>
                                    </div>

                                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                        {remainingPortfolios.map((item) => (
                                            <div key={item.id} className="surface overflow-hidden transition-all duration-300 hover:shadow-elevated hover:-translate-y-1">
                                                {item.image && (
                                                    <MediaPreview
                                                        src={item.image}
                                                        alt={getLocalizedValue(locale, item, 'title') || item.title}
                                                        className="w-full h-56 object-cover"
                                                        imgProps={{ loading: 'lazy' }}
                                                        videoProps={{ autoPlay: true, loop: true, muted: true, playsInline: true, preload: 'metadata' }}
                                                    />
                                                )}
                                                <div className="p-6">
                                                    <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">
                                                        <span>{getLocalizedValue(locale, item, 'category') || item.category}</span>
                                                        {formatDate(item.created_at) && <span>{formatDate(item.created_at)}</span>}
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-[color:var(--md-text)] mt-2">{getLocalizedValue(locale, item, 'title') || item.title}</h3>
                                                    <p className="text-sm text-slate-600 mt-3">{getLocalizedValue(locale, item, 'description') || item.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="surface p-8 sm:p-10 text-center">
                            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[color:var(--md-text)]">
                                {t('portfolio.empty.title')}
                            </h2>
                            <p className="text-slate-600 mt-3 max-w-2xl mx-auto">
                                {t('portfolio.empty.body')}
                            </p>
                            <Link href={route('portfolio')} className="btn-primary mt-6">
                                {t('portfolio.empty.reset')}
                            </Link>
                        </div>
                    )}

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
