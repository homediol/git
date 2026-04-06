import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import AdCircleGrid from '@/Components/AdCircleGrid';
import MediaPreview from '@/Components/MediaPreview';
import { useLocale } from '@/Providers/LocaleProvider';
import { getLocalizedValue } from '@/lib/i18n';

export default function About({ auth, featuredWork = [], studioStats = {}, advertisements = [], settings }) {
    const { locale, t } = useLocale();
    const heroProject = featuredWork[0] ?? null;
    const showcaseProjects = heroProject ? featuredWork.slice(1) : featuredWork;
    const valueCards = [
        { title: t('about.values.one.title'), body: t('about.values.one.body') },
        { title: t('about.values.two.title'), body: t('about.values.two.body') },
        { title: t('about.values.three.title'), body: t('about.values.three.body') },
    ];
    const stats = [
        { value: studioStats.projects ?? 0, label: t('about.stats.projects') },
        { value: studioStats.services ?? 0, label: t('about.stats.services') },
        { value: studioStats.team ?? 0, label: t('about.stats.team') },
    ];

    return (
        <PublicLayout auth={auth} settings={settings}>
            <Head title={t('about.meta.title')}>
                <meta name="description" content={t('about.meta.description')} />
                <meta name="keywords" content={t('about.meta.keywords')} />
            </Head>

            <div className="py-16 px-4">
                <div className="max-w-7xl mx-auto space-y-16">
                    <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
                        <div className="surface p-6 sm:p-8 lg:p-10">
                            <span className="chip mb-4">{t('about.story.eyebrow')}</span>
                            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[color:var(--md-text)] leading-tight">
                                {t('about.story.title')}
                            </h2>
                            <p className="mt-4 text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl">
                                {t('about.story.body')}
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <span className="chip">{t('about.story.chip_one')}</span>
                                <span className="chip">{t('about.story.chip_two')}</span>
                                <span className="chip">{t('about.story.chip_three')}</span>
                            </div>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link href={route('portfolio')} className="btn-primary">
                                    {t('about.cta.primary')}
                                </Link>
                                <Link href={route('contact')} className="btn-outline">
                                    {t('about.cta.secondary')}
                                </Link>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            {heroProject && (
                                <div className="surface overflow-hidden">
                                        <MediaPreview
                                            src={heroProject.image}
                                            alt={getLocalizedValue(locale, heroProject, 'title') || heroProject.title}
                                            className="h-64 w-full object-cover sm:h-72"
                                            imgProps={{ loading: 'lazy' }}
                                            videoProps={{ autoPlay: true, loop: true, muted: true, playsInline: true, preload: 'metadata' }}
                                    />
                                    <div className="p-6">
                                        <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--md-secondary)] font-semibold">
                                            {t('about.showcase.featured_label')}
                                        </p>
                                        <h3 className="mt-2 text-xl font-semibold text-[color:var(--md-text)]">{getLocalizedValue(locale, heroProject, 'title') || heroProject.title}</h3>
                                        <p className="text-sm text-slate-600 mt-3">{getLocalizedValue(locale, heroProject, 'description') || heroProject.description}</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-4 sm:grid-cols-3">
                                {stats.map((stat) => (
                                    <div key={stat.label} className="surface-soft p-5 text-center">
                                        <p className="text-2xl font-semibold text-[color:var(--md-text)]">{stat.value}</p>
                                        <p className="mt-2 text-xs uppercase tracking-[0.18em] font-semibold text-slate-500">
                                            {stat.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="surface p-6 sm:p-8">
                            <span className="chip mb-4">{t('about.story.chip_one')}</span>
                            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[color:var(--md-text)] mb-4">
                                {t('about.mission.title')}
                            </h2>
                            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                                {t('about.mission.body')}
                            </p>
                        </div>
                        <div className="surface p-6 sm:p-8">
                            <span className="chip mb-4">{t('about.story.chip_two')}</span>
                            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[color:var(--md-text)] mb-4">
                                {t('about.vision.title')}
                            </h2>
                            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                                {t('about.vision.body')}
                            </p>
                        </div>
                    </div>

                    <div>
                        <div className="text-center max-w-3xl mx-auto mb-10">
                            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[color:var(--md-text)]">
                                {t('about.values.title')}
                            </h2>
                            <p className="text-slate-600 mt-3">
                                {t('about.values.subtitle')}
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            {valueCards.map((item, index) => (
                                <div key={item.title} className="surface p-6">
                                    <div className="w-10 h-10 rounded-xl bg-[color:var(--md-accent)]/20 text-[color:var(--md-text)] flex items-center justify-center font-semibold">
                                        {index + 1}
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold text-[color:var(--md-text)]">{item.title}</h3>
                                    <p className="mt-2 text-sm text-slate-600 leading-7">{item.body}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {showcaseProjects.length > 0 && (
                        <div>
                            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--md-secondary)]">
                                        {t('about.showcase.eyebrow')}
                                    </p>
                                    <h2 className="font-display text-3xl sm:text-4xl font-semibold mt-2 text-[color:var(--md-text)]">
                                        {t('about.showcase.title')}
                                    </h2>
                                    <p className="text-slate-600 mt-3 max-w-2xl">
                                        {t('about.showcase.subtitle')}
                                    </p>
                                </div>
                                <Link href={route('portfolio')} className="btn-outline">
                                    {t('about.showcase.view_all')}
                                </Link>
                            </div>

                            <div className="grid gap-6 md:grid-cols-3">
                                {showcaseProjects.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={route('portfolio', { category: item.category })}
                                        className="surface overflow-hidden transition-all duration-300 hover:shadow-elevated hover:-translate-y-1"
                                    >
                                        <MediaPreview
                                            src={item.image}
                                            alt={getLocalizedValue(locale, item, 'title') || item.title}
                                            className="h-52 w-full object-cover"
                                            imgProps={{ loading: 'lazy' }}
                                            videoProps={{ autoPlay: true, loop: true, muted: true, playsInline: true, preload: 'metadata' }}
                                        />
                                        <div className="p-6">
                                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">{getLocalizedValue(locale, item, 'category') || item.category}</p>
                                            <h3 className="text-lg font-semibold text-[color:var(--md-text)] mt-2">{getLocalizedValue(locale, item, 'title') || item.title}</h3>
                                            <p className="text-sm text-slate-600 mt-3">{getLocalizedValue(locale, item, 'description') || item.description}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {advertisements.length > 0 && (
                        <div className="mt-16">
                            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-center mb-6 text-[color:var(--md-text)]">
                                {t('about.partners')}
                            </h2>
                            <AdCircleGrid advertisements={advertisements} />
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
