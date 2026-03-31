import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import AdCircleGrid from '@/Components/AdCircleGrid';
import BookingTrigger from '@/Components/BookingTrigger';
import BookingContactActions from '@/Components/BookingContactActions';
import MediaPreview from '@/Components/MediaPreview';
import { useLocale } from '@/Providers/LocaleProvider';
import { getLocalizedValue } from '@/lib/i18n';

export default function ServiceShow({ auth, service, subServices = [], advertisements = [], settings }) {
    const { locale, t } = useLocale();

    return (
        <PublicLayout auth={auth} settings={settings}>
            <Head title={`${getLocalizedValue(locale, service, 'title')} - ${t('services.title')}`}>
                <meta name="description" content={getLocalizedValue(locale, service, 'description') || t('services.show.meta_description')} />
            </Head>

            <div className="py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[color:var(--md-text)]">
                                {getLocalizedValue(locale, service, 'title')}
                            </h1>
                            {service.description && (
                                <p className="mt-3 text-slate-600 text-base sm:text-lg max-w-2xl" dangerouslySetInnerHTML={{ __html: getLocalizedValue(locale, service, 'description') }} />
                            )}
                        </div>
                        <div className="grid gap-3 sm:flex sm:flex-wrap">
                            <BookingTrigger auth={auth} serviceId={service.id} className="btn-fire w-full sm:w-auto">
                                {t('booking.cta', 'Book now')}
                            </BookingTrigger>
                            <BookingContactActions />
                            <Link
                                href={route('services')}
                                className="btn-outline w-full sm:w-auto"
                            >
                                {t('services.show.back')}
                            </Link>
                        </div>
                    </div>

                    {service.image && (
                        <div className="surface p-4 mb-10">
                            <MediaPreview
                                src={service.image}
                                alt={getLocalizedValue(locale, service, 'title')}
                                className="h-56 w-full rounded-xl object-cover sm:h-64"
                                videoProps={{ autoPlay: true, loop: true, muted: true, playsInline: true, preload: 'metadata' }}
                            />
                        </div>
                    )}

                    <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[color:var(--md-text)] mb-6">
                        {t('services.show.subservices')}
                    </h2>

                    {subServices.length === 0 ? (
                        <p className="text-slate-500">{t('services.show.empty')}</p>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2">
                            {subServices.map((subService) => (
                                <Link
                                    key={subService.id}
                                    href={route('services.subservices.show', [service.id, subService.id])}
                                    className="surface p-6 transition-all duration-300 hover:shadow-elevated hover:-translate-y-1"
                                >
                                    {subService.image && (
                                        <MediaPreview
                                            src={subService.image}
                                            alt={getLocalizedValue(locale, subService, 'title') || subService.title}
                                            className="mb-4 h-48 w-full rounded-xl object-cover"
                                            videoProps={{ autoPlay: true, loop: true, muted: true, playsInline: true, preload: 'metadata' }}
                                        />
                                    )}
                                    <h3 className="text-lg font-semibold text-[color:var(--md-text)]">{getLocalizedValue(locale, subService, 'title') || subService.title}</h3>
                                    {subService.description && (
                                        <p className="mt-2 text-slate-600 text-sm sm:text-base">{getLocalizedValue(locale, subService, 'description') || subService.description}</p>
                                    )}
                                    <span className="mt-4 inline-flex text-sm font-semibold text-[color:var(--md-secondary)]">
                                        {t('services.show.view_details')}
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
