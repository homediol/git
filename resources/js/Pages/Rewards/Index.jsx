import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { useLocale } from '@/Providers/LocaleProvider';
import { getLocalizedValue } from '@/lib/i18n';

export default function RewardsIndex({ auth, rewards = [], settings }) {
    const { locale, t } = useLocale();

    return (
        <PublicLayout auth={auth} settings={settings}>
            <Head title="Your Rewards" />

            <div className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col items-center gap-4 mb-4">
                        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-center bg-gradient-to-r from-sky-200 to-indigo-200 bg-clip-text text-transparent">
                        {t('rewards.title')}
                        </h1>
                        {auth?.user && (
                            <Link
                                href={route('dashboard')}
                                className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white/80 hover:text-white hover:border-white/40"
                            >
                                {t('rewards.go_dashboard')}
                            </Link>
                        )}
                    </div>
                    <p className="text-center text-white/70 text-base sm:text-lg font-semibold mb-10 max-w-2xl mx-auto">
                        {t('rewards.subtitle')}
                    </p>

                    {rewards.length === 0 ? (
                        <p className="text-center text-white/70">{t('rewards.none')}</p>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2">
                            {rewards.map((item) => (
                                <div key={item.id} className="glass-dark rounded-2xl p-6">
                                    {item.reward?.image && (
                                        <img
                                            src={item.reward.image}
                                            alt={getLocalizedValue(locale, item.reward, 'name')}
                                            className="mb-4 h-48 w-full rounded-xl object-cover"
                                        />
                                    )}
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-semibold text-cyan-300">{getLocalizedValue(locale, item.reward, 'name')}</h3>
                                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${item.status === 'used' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-sky-500/20 text-sky-200'}`}>
                                            {item.status === 'used' ? t('rewards.status.used') : t('rewards.status.unused')}
                                        </span>
                                    </div>
                                    {getLocalizedValue(locale, item.reward, 'description') && (
                                        <p className="mt-2 text-white/70 text-sm sm:text-base">{getLocalizedValue(locale, item.reward, 'description')}</p>
                                    )}
                                    {item.expires_at && (
                                        <p className="mt-4 text-xs text-white/60">
                                            {t('rewards.expires')} {new Date(item.expires_at).toLocaleDateString()}
                                        </p>
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
