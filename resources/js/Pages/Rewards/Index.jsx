import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import MediaPreview from '@/Components/MediaPreview';
import BookingTrigger from '@/Components/BookingTrigger';
import SupportWhatsAppButton from '@/Components/SupportWhatsAppButton';
import WelcomeOfferShowcase from '@/Components/WelcomeOfferShowcase';
import { useLocale } from '@/Providers/LocaleProvider';
import { getLocalizedValue } from '@/lib/i18n';

const offerToneClasses = {
    reward_reminder: 'bg-amber-100 text-amber-700',
    discount: 'bg-emerald-100 text-emerald-700',
    discount_rewind: 'bg-sky-100 text-sky-700',
};

function offerLabel(strategy) {
    return {
        reward_reminder: 'Reward reminder',
        discount: 'Discount offer',
        discount_rewind: 'Discount rewind',
    }[strategy] || 'Offer';
}

function formatFrw(value) {
    return `${Number(value).toLocaleString()} FRW`;
}

function translateByLocale(locale, messages) {
    return messages[locale] || messages.rw;
}

export default function RewardsIndex({ auth, rewards = [], campaignOffers = [], welcomeOffer = {}, settings }) {
    const { locale, t } = useLocale();
    const hasRewards = rewards.length > 0;
    const hasOffers = campaignOffers.length > 0;
    const showWelcomeOffer = Boolean(welcomeOffer?.eligible && welcomeOffer?.has_offer);
    const pageTitle = showWelcomeOffer
        ? translateByLocale(locale, {
            rw: 'Discounts n Impano',
            en: 'Discounts and Rewards',
            fr: 'Remises et recompenses',
        })
        : t('rewards.title');

    return (
        <PublicLayout auth={auth} settings={settings}>
            <Head title={pageTitle} />

            <div className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col items-center gap-4 mb-4">
                        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-center text-[color:var(--md-text)]">
                            {pageTitle}
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
                        {showWelcomeOffer
                            ? translateByLocale(locale, {
                                rw: 'Reba welcome discount yawe, free services zatoranyijwe na admin, n izindi offers zose ziri kuri konti yawe.',
                                en: 'View your welcome discount, admin-selected free services, and every other active offer on your account.',
                                fr: 'Consultez votre remise de bienvenue, les services gratuits choisis par l admin, et toutes vos autres offres actives.',
                            })
                            : t('rewards.subtitle')}
                    </p>
                    <div className="mb-10 flex justify-center">
                        <SupportWhatsAppButton
                            message="Hello Pavona admin, I need help with rewards or reward rewinds."
                            showPhone
                        />
                    </div>

                    {!hasRewards && !hasOffers && !showWelcomeOffer ? (
                        <p className="text-center text-slate-500">{t('rewards.none')}</p>
                    ) : (
                        <div className="space-y-12">
                            {showWelcomeOffer && (
                                <section className="surface p-6 sm:p-7">
                                    <div className="flex flex-col gap-6">
                                        <div>
                                            <h2 className="text-2xl font-semibold text-[color:var(--md-text)]">
                                                {translateByLocale(locale, {
                                                    rw: 'Welcome discount cards zawe',
                                                    en: 'Your welcome discount cards',
                                                    fr: 'Vos cartes de remise de bienvenue',
                                                })}
                                            </h2>
                                            <p className="mt-2 max-w-3xl text-sm text-slate-500">
                                                {translateByLocale(locale, {
                                                    rw: 'Abakiriya bashya ntibagihabwa za free services 4 za default. Ubu ubona discount cards zitandukanye, hanyuma free services zatoranyijwe na admin zikagaragara mu block yazo.',
                                                    en: 'New customers no longer receive the old fixed 4 free services. You now get separate discount cards, then admin-selected free services in their own block.',
                                                    fr: 'Les nouveaux clients ne recoivent plus les 4 services gratuits par defaut. Vous avez maintenant des cartes de remise distinctes, puis les services gratuits choisis par l admin dans leur propre bloc.',
                                                })}
                                            </p>

                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {welcomeOffer.discount_card_count > 0 && (
                                                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                                        {translateByLocale(locale, {
                                                            rw: `${welcomeOffer.discount_card_count} discount cards`,
                                                            en: `${welcomeOffer.discount_card_count} discount cards`,
                                                            fr: `${welcomeOffer.discount_card_count} cartes de remise`,
                                                        })}
                                                    </span>
                                                )}
                                                {welcomeOffer.selected_reward_count > 0 && (
                                                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                                                        {translateByLocale(locale, {
                                                            rw: `${welcomeOffer.selected_reward_count} free services zatoranyijwe`,
                                                            en: `${welcomeOffer.selected_reward_count} selected free services`,
                                                            fr: `${welcomeOffer.selected_reward_count} services gratuits choisis`,
                                                        })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <WelcomeOfferShowcase locale={locale} welcomeOffer={welcomeOffer} />
                                    </div>

                                    <div className="mt-6">
                                        <Link href={route('bookings.index')} className="btn-fire inline-flex">
                                            {translateByLocale(locale, {
                                                rw: 'Kora booking',
                                                en: 'Book now',
                                                fr: 'Reserver maintenant',
                                            })}
                                        </Link>
                                    </div>
                                </section>
                            )}

                            {hasRewards && (
                                <section>
                                    <div className="mb-5 flex items-center justify-between gap-4">
                                        <div>
                                            <h2 className="text-2xl font-semibold text-[color:var(--md-text)]">
                                                {t('rewards.free_services_title', 'Free rewards')}
                                            </h2>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {t('rewards.free_services_subtitle', 'Service-linked free rewards ready to use or rewinded back to your account.')}
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-orange-100 px-3 py-1.5 text-xs font-semibold text-orange-700">
                                            {rewards.length} {t('nav.rewards', 'Rewards')}
                                        </span>
                                    </div>

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
                                                <div className="flex items-center justify-between gap-3">
                                                    <h3 className="text-xl font-semibold text-[color:var(--md-text)]">{getLocalizedValue(locale, item.reward, 'name')}</h3>
                                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${item.status === 'used' ? 'bg-[rgba(234,67,53,0.12)] text-[color:var(--md-danger)]' : 'bg-[rgba(52,168,83,0.12)] text-[color:var(--md-success)]'}`}>
                                                        {item.status === 'used' ? t('rewards.status.used') : t('rewards.status.unused')}
                                                    </span>
                                                </div>
                                                {item.reward?.service && (
                                                    <p className="mt-3 inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                                                        {getLocalizedValue(locale, item.reward.service, 'title')}
                                                    </p>
                                                )}
                                                {getLocalizedValue(locale, item.reward, 'description') && (
                                                    <p className="mt-3 text-slate-600 text-sm sm:text-base">{getLocalizedValue(locale, item.reward, 'description')}</p>
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
                                </section>
                            )}

                            {hasOffers && (
                                <section>
                                    <div className="mb-5">
                                        <h2 className="text-2xl font-semibold text-[color:var(--md-text)]">
                                            {t('rewards.offers.title', 'Discount rewinds and active offers')}
                                        </h2>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {t('rewards.offers.subtitle', 'These offers were sent to you based on your reward history, booking activity, or current service campaigns.')}
                                        </p>
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        {campaignOffers.map((offer) => (
                                            <div key={offer.id} className="surface p-6 transition-all duration-300 hover:shadow-elevated hover:-translate-y-1">
                                                {offer.image && (
                                                    <MediaPreview
                                                        src={offer.image}
                                                        alt={getLocalizedValue(locale, offer, 'title')}
                                                        className="mb-4 h-48 w-full rounded-xl object-cover"
                                                        videoProps={{ controls: true, playsInline: true, preload: 'metadata' }}
                                                    />
                                                )}
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <h3 className="text-xl font-semibold text-[color:var(--md-text)]">
                                                            {getLocalizedValue(locale, offer, 'title')}
                                                        </h3>
                                                        {offer.service && (
                                                            <p className="mt-3 inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                                                                {getLocalizedValue(locale, offer.service, 'title')}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${offerToneClasses[offer.delivery_strategy] || 'bg-slate-100 text-slate-700'}`}>
                                                        {offerLabel(offer.delivery_strategy)}
                                                    </span>
                                                </div>

                                                <p className="mt-3 text-slate-600 text-sm sm:text-base">
                                                    {getLocalizedValue(locale, offer, 'message')}
                                                </p>

                                                {(offer.discount_percent || offer.discount_code) && (
                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        {offer.discount_percent && (
                                                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                                                {offer.discount_percent}% OFF
                                                            </span>
                                                        )}
                                                        {offer.discount_code && (
                                                            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                                                                Code: {offer.discount_code}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {offer.original_price_rwf && offer.discounted_price_rwf && (
                                                    <div className="mt-4 flex flex-wrap items-center gap-3">
                                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 line-through">
                                                            {formatFrw(offer.original_price_rwf)}
                                                        </span>
                                                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                                                            {formatFrw(offer.discounted_price_rwf)}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="mt-5">
                                                    <Link href={offer.action_url || route('rewards.index')} className="btn-fire inline-flex">
                                                        {getLocalizedValue(locale, offer, 'action_text') || t('rewards.open_offer', 'Open offer')}
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
