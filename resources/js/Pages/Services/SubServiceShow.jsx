import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import AdCircleGrid from '@/Components/AdCircleGrid';
import BookingTrigger from '@/Components/BookingTrigger';
import BookingContactActions from '@/Components/BookingContactActions';
import MediaPreview from '@/Components/MediaPreview';
import { useLocale } from '@/Providers/LocaleProvider';
import { getLocalizedValue } from '@/lib/i18n';

export default function SubServiceShow({ auth, service, subService, advertisements = [], settings }) {
    const { locale, t } = useLocale();
    const serviceTitle = getLocalizedValue(locale, service, 'title') || service.title;
    const subTitle = getLocalizedValue(locale, subService, 'title') || subService.title;
    const subDescription = getLocalizedValue(locale, subService, 'description') || subService.description;

    return (
        <PublicLayout auth={auth} settings={settings}>
            <Head title={`${subTitle} - ${serviceTitle}`}>
                <meta name="description" content={subDescription || t('services.sub.meta_description')} />
            </Head>

            <div className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-500 font-semibold">
                                {serviceTitle}
                            </p>
                            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[color:var(--md-text)]">
                                {subTitle}
                            </h1>
                            {subDescription && (
                                <p className="mt-3 text-slate-600 text-base sm:text-lg max-w-3xl">
                                    {subDescription}
                                </p>
                            )}
                        </div>
                        <div className="grid gap-3 sm:flex sm:flex-wrap">
                            <Link
                                href={route('services.show', service.id)}
                                className="btn-outline w-full sm:w-auto"
                            >
                                {t('services.sub.back_to')} {serviceTitle}
                            </Link>
                            <Link
                                href={route('services')}
                                className="btn-outline w-full sm:w-auto"
                            >
                                {t('services.sub.all')}
                            </Link>
                        </div>
                    </div>

                    {subService.image && (
                        <div className="surface p-4 mb-12">
                            <MediaPreview
                                src={subService.image}
                                alt={subTitle}
                                className="h-64 w-full rounded-xl object-cover sm:h-72"
                                videoProps={{ autoPlay: true, loop: true, muted: true, playsInline: true, preload: 'metadata' }}
                            />
                        </div>
                    )}

                    <div className="surface p-6 sm:p-8">
                        <h2 className="text-xl sm:text-2xl font-semibold text-[color:var(--md-text)]">{t('services.sub.what_you_get')}</h2>
                        <p className="mt-3 text-slate-600 text-base sm:text-lg">
                            {t('services.sub.description')} {subTitle.toLowerCase()}.
                        </p>
                        <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
                            <BookingTrigger auth={auth} serviceId={service.id} className="btn-fire w-full sm:w-auto">
                                {t('booking.cta', 'Book now')}
                            </BookingTrigger>
                            <BookingContactActions />
                            <Link
                                href={route('services.show', service.id)}
                                className="btn-outline w-full sm:w-auto"
                            >
                                {t('services.sub.cta_secondary')} {serviceTitle}
                            </Link>
                        </div>
                    </div>

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
