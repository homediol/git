import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import AdCircleGrid from '@/Components/AdCircleGrid';
import MediaPreview from '@/Components/MediaPreview';
import { useLocale } from '@/Providers/LocaleProvider';
import { getLocalizedValue } from '@/lib/i18n';

export default function Services({ auth, services = [], advertisements = [], settings }) {
    const { locale, t } = useLocale();

    return (
        <PublicLayout auth={auth} settings={settings}>
            <Head title={t('services.meta.title')}>
                <meta name="description" content={t('services.meta.description')} />
                <meta name="keywords" content={t('services.meta.keywords')} />
            </Head>

            <div className="py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-10">
                        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[color:var(--md-text)]">
                            {t('services.title')}
                        </h1>
                        <p className="text-slate-600 mt-3">
                            {t('services.subtitle')}
                        </p>
                    </div>

                    {services.length === 0 ? (
                        <p className="text-center text-slate-500">{t('services.empty')}</p>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2">
                            {services.map((service) => (
                                <Link
                                    key={service.id}
                                    href={route('services.show', service.id)}
                                    className="surface p-6 transition-all duration-300 hover:shadow-elevated hover:-translate-y-1"
                                >
                                    {service.image && (
                                        <MediaPreview
                                            src={service.image}
                                            alt={getLocalizedValue(locale, service, 'title')}
                                            className="mb-4 h-48 w-full rounded-xl object-cover"
                                            imgProps={{ loading: 'lazy' }}
                                            videoProps={{ autoPlay: true, loop: true, muted: true, playsInline: true, preload: 'metadata' }}
                                        />
                                    )}
                                    <h3 className="text-xl font-semibold text-[color:var(--md-text)]">{getLocalizedValue(locale, service, 'title')}</h3>
                                    <p
                                        className="mt-2 text-sm text-slate-600"
                                        dangerouslySetInnerHTML={{ __html: getLocalizedValue(locale, service, 'description') }}
                                    />
                                    <span className="mt-4 inline-flex text-sm font-semibold text-[color:var(--md-secondary)]">
                                        {t('services.view_more')}
                                        {' ->'}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}

                    {advertisements.length > 0 && (
                        <div className="mt-16">
                            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-center mb-6 text-[color:var(--md-text)]">
                                {t('services.partners')}
                            </h2>
                            <AdCircleGrid advertisements={advertisements} />
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
