import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import MediaPreview from '@/Components/MediaPreview';
import BookingTrigger from '@/Components/BookingTrigger';
import { useLocale } from '@/Providers/LocaleProvider';
import { getLocalizedValue } from '@/lib/i18n';

export default function RewardsIndex({ auth, rewards = [], settings }) {
    const { locale, t } = useLocale();

    return (
        <PublicLayout auth={auth} settings={settings}>
            <Head title={t('rewards.title')} />

            <div className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col items-center gap-4 mb-4">
                        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-center text-[color:var(--md-text)]">
                            {t('rewards.title')}
                        </h1>
                        {auth?.user && (
                            <Link
                                href={route('dashboard')}
                                className="btn-outline"
                            >
                                {t('rewards.go_dashboard')}
                            </Link>
                        )}
                    </div>
                    <p className="text-center text-slate-600 text-base sm:text-lg font-semibold mb-10 max-w-2xl mx-auto">
                        {t('rewards.subtitle')}
                    </p>

                    {rewards.length === 0 ? (
                        <p className="text-center text-slate-500">{t('rewards.none')}</p>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2">
                            {rewards.map((item) => (
                                <div key={item.id} className="surface p-6 transition-all duration-300 hover:shadow-elevated hover:-translate-y-1">
                                    {item.reward?.image && (
                                        <MediaPreview
                                            src={item.reward.image}
                                            alt={getLocalizedValue(locale, item.reward, 'name')}
                                            className="mb-4 h-48 w-full rounded-xl object-cover"
                                            videoProps={{ controls: true, playsInline: true, preload: 'metadata' }}
                                        />
                                    )}
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-semibold text-[color:var(--md-text)]">{getLocalizedValue(locale, item.reward, 'name')}</h3>
                                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${item.status === 'used' ? 'bg-[rgba(234,67,53,0.12)] text-[color:var(--md-danger)]' : 'bg-[rgba(52,168,83,0.12)] text-[color:var(--md-success)]'}`}>
                                            {item.status === 'used' ? t('rewards.status.used') : t('rewards.status.unused')}
                                        </span>
                                    </div>
                                    {getLocalizedValue(locale, item.reward, 'description') && (
                                        <p className="mt-2 text-slate-600 text-sm sm:text-base">{getLocalizedValue(locale, item.reward, 'description')}</p>
                                    )}
                                    {item.expires_at && (
                                        <p className="mt-4 text-xs text-slate-500">
                                            {t('rewards.expires')} {new Date(item.expires_at).toLocaleDateString()}
                                        </p>
                                    )}
                                    {item.status !== 'used' && (
                                        <div className="mt-5">
                                            <BookingTrigger auth={auth} rewardId={item.id} className="btn-fire inline-flex">
                                                {t('booking.reward.cta', 'Book with this reward')}
                                            </BookingTrigger>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
