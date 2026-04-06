import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import AdSlider from '@/Components/AdSlider';
import AuthRequiredModal from '@/Components/AuthRequiredModal';
import MediaPreview from '@/Components/MediaPreview';
import ServiceDiscountCards from '@/Components/ServiceDiscountCards';
import WelcomeOfferShowcase from '@/Components/WelcomeOfferShowcase';
import { useLocale } from '@/Providers/LocaleProvider';
import { getLocalizedValue } from '@/lib/i18n';

function translateByLocale(locale, messages) {
    return messages[locale] || messages.rw;
}

export default function Home({ auth, services = [], portfolios = [], advertisements = [], promoRewards = [], welcomeOffer = {}, settings = {} }) {
    const { locale, t } = useLocale();
    const page = usePage();
    const { siteSettings = {} } = page.props;
    const heroImage = portfolios?.[0]?.image || services?.[0]?.image;
    const featuredBundleImage = siteSettings.featured_bundle_image
        ? `/storage/${siteSettings.featured_bundle_image}`
        : heroImage;
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const hasWelcomeDiscountCards = (welcomeOffer?.discount_cards ?? []).length > 0;
    const hasSelectedWelcomeRewards = (welcomeOffer?.rewards ?? []).length > 0;
    const showWelcomeOffer = Boolean(welcomeOffer?.has_offer);
    const featuredBundle = {
        badge_rw: siteSettings.featured_bundle_badge_rw,
        badge_en: siteSettings.featured_bundle_badge_en,
        badge_fr: siteSettings.featured_bundle_badge_fr,
        title_rw: siteSettings.featured_bundle_title_rw,
        title_en: siteSettings.featured_bundle_title_en,
        title_fr: siteSettings.featured_bundle_title_fr,
        description_rw: siteSettings.featured_bundle_description_rw,
        description_en: siteSettings.featured_bundle_description_en,
        description_fr: siteSettings.featured_bundle_description_fr,
    };

    const stats = [
        { value: '240+', label: t('home.stats.projects') },
        { value: '120+', label: t('home.stats.clients') },
        { value: '8+', label: t('home.stats.years') },
    ];

    const rewardHighlights = [
        {
            title: translateByLocale(locale, {
                rw: 'Discount igaragara ku booking ya mbere',
                en: 'Visible discount on the first booking',
                fr: 'Remise visible sur la premiere reservation',
            }),
            description: translateByLocale(locale, {
                rw: 'Umukiriya mushya abanza kubona igabanyirizwa ryateguwe neza kandi rihita rigaragara.',
                en: 'New customers see a clear welcome discount right away.',
                fr: 'Les nouveaux clients voient une remise de bienvenue claire des le depart.',
            }),
            image: null,
        },
        {
            title: translateByLocale(locale, {
                rw: 'Free services zitoranywa na admin',
                en: 'Free services chosen by admin',
                fr: 'Services gratuits choisis par l admin',
            }),
            description: translateByLocale(locale, {
                rw: 'Nta yindi reward ihabwa umuntu ku bwikora keretse izatoranyijwe na admin.',
                en: 'Only the free services selected by admin are granted automatically.',
                fr: 'Seuls les services gratuits choisis par l admin sont attribues automatiquement.',
            }),
            image: null,
        },
        {
            title: translateByLocale(locale, {
                rw: 'Booking ihita iba yoroshye',
                en: 'Smoother first booking',
                fr: 'Premiere reservation plus simple',
            }),
            description: translateByLocale(locale, {
                rw: 'Discount n impano zose zifitanye isano n serivisi bigaragara hamwe ku buryo bworoshye.',
                en: 'Discounts and service-linked offers stay visible in one place.',
                fr: 'Les remises et services lies restent visibles au meme endroit.',
            }),
            image: null,
        },
    ];

    const promoCards = promoRewards.length > 0
        ? promoRewards.map((reward) => ({
            id: reward.id ?? reward.slug,
            title: getLocalizedValue(locale, reward, 'name'),
            description: getLocalizedValue(locale, reward, 'description'),
            image: reward.image,
            isFreeReward: true,
        }))
        : rewardHighlights.map((reward) => ({
            id: reward.title,
            title: reward.title,
            description: reward.description,
            image: reward.image,
            isFreeReward: false,
        }));

    const processSteps = [
        { title: t('home.process.one.title'), description: t('home.process.one.description') },
        { title: t('home.process.two.title'), description: t('home.process.two.description') },
        { title: t('home.process.three.title'), description: t('home.process.three.description') },
    ];

    return (
        <PublicLayout auth={auth} settings={settings}>
            <Head title={t('home.meta.title')}>
                <meta name="description" content={t('home.meta.description')} />
                <meta name="keywords" content={t('home.meta.keywords')} />
            </Head>

            <section className="relative px-4 pb-12 pt-12 sm:pt-16">
                <div className="mx-auto grid max-w-7xl gap-10 items-center lg:grid-cols-2 lg:gap-12">
                    <div>
                        <span className="chip mb-4">{t('home.hero.badge')}</span>
                        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight text-[color:var(--md-text)]">
                            {t('home.hero.title')}
                            <span className="block text-[color:var(--md-primary)]">{t('home.hero.title_highlight')}</span>
                        </h1>
                        <p className="mt-4 text-lg sm:text-xl text-slate-600 max-w-xl">
                            {t('home.hero.description')}
                        </p>
                        <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
                            <Link href={route('contact')} className="btn-primary w-full sm:w-auto">
                                {t('home.hero.cta_primary')}
                            </Link>
                            <Link href={route('portfolio')} className="btn-secondary w-full sm:w-auto">
                                {t('home.hero.cta_secondary')}
                            </Link>
                            <Link href={route('services')} className="btn-success w-full sm:w-auto">
                                {t('home.hero.cta_success')}
                            </Link>
                        </div>
                        <p className="mt-4 text-xs text-slate-500 font-semibold">
                            {t('home.hero.helper')}
                        </p>
                    </div>
                    <div className="surface p-6 sm:p-8">
                        <div className="fire-gradient rounded-2xl p-5 text-white shadow-elevated">
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
                                {getLocalizedValue(locale, featuredBundle, 'badge') || t('home.hero.card.badge')}
                            </p>
                            <h3 className="mt-2 text-xl sm:text-2xl font-semibold">
                                {getLocalizedValue(locale, featuredBundle, 'title') || t('home.hero.card.title')}
                            </h3>
                            <p className="mt-2 text-sm text-white/85">
                                {getLocalizedValue(locale, featuredBundle, 'description') || t('home.hero.card.description')}
                            </p>
                        </div>
                        {featuredBundleImage && (
                            <MediaPreview
                                src={featuredBundleImage}
                                alt={t('home.hero.card.image_alt')}
                                className="mt-6 h-52 w-full rounded-2xl object-cover"
                                videoProps={{ autoPlay: true, loop: true, muted: true, playsInline: true, preload: 'metadata' }}
                            />
                        )}
                        <div className="mt-6 grid grid-cols-1 gap-3 text-center text-xs font-semibold text-slate-600 sm:grid-cols-3">
                            <div className="surface-soft px-2 py-3">{t('home.hero.card.pill_one')}</div>
                            <div className="surface-soft px-2 py-3">{t('home.hero.card.pill_two')}</div>
                            <div className="surface-soft px-2 py-3">{t('home.hero.card.pill_three')}</div>
                        </div>
                    </div>
                </div>
                <div className="max-w-6xl mx-auto mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {stats.map((stat) => (
                        <div key={stat.label} className="surface p-5 text-center">
                            <p className="text-2xl font-semibold text-[color:var(--md-text)]">{stat.value}</p>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mt-1">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {advertisements.length > 0 && (
                <section className="py-6 px-4">
                    <div className="max-w-7xl mx-auto">
                        <AdSlider advertisements={advertisements} />
                    </div>
                </section>
            )}

            <section className="py-14 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--md-secondary)]">
                                {t('home.services.eyebrow')}
                            </p>
                            <h2 className="font-display text-3xl sm:text-4xl font-semibold mt-2 text-[color:var(--md-text)]">
                                {t('home.services.title')}
                            </h2>
                            <p className="text-slate-600 mt-3 max-w-xl">
                                {t('home.services.subtitle')}
                            </p>
                        </div>
                        <Link href={route('services')} className="btn-outline">
                            {t('home.services.view_all')}
                        </Link>
                    </div>
                    <div className="grid items-stretch gap-6 sm:grid-cols-2 xl:grid-cols-4">
                        {services.slice(0, 6).map((service) => (
                            <Link
                                key={service.id}
                                href={route('services.show', service.id)}
                                className="surface flex h-full flex-col p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
                            >
                                {service.image && (
                                    <MediaPreview
                                        src={service.image}
                                        alt={getLocalizedValue(locale, service, 'title')}
                                        className="mb-4 h-40 w-full rounded-2xl object-cover"
                                        imgProps={{ loading: 'lazy' }}
                                        videoProps={{ autoPlay: true, loop: true, muted: true, playsInline: true, preload: 'metadata' }}
                                    />
                                )}
                                <h3 className="text-lg font-semibold text-[color:var(--md-text)]">
                                    {getLocalizedValue(locale, service, 'title')}
                                </h3>
                                <div
                                    className="mt-2 flex-1 text-sm text-slate-600"
                                    dangerouslySetInnerHTML={{ __html: getLocalizedValue(locale, service, 'description') }}
                                />
                                <ServiceDiscountCards
                                    locale={locale}
                                    welcomeOffer={welcomeOffer}
                                    serviceId={service.id}
                                    className="mt-5"
                                />
                                <span className="mt-4 inline-flex text-sm font-semibold text-[color:var(--md-secondary)]">
                                    {t('home.services.view_more')}
                                    {' ->'}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-14 px-4">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--md-success)]">
                            {showWelcomeOffer
                                ? translateByLocale(locale, {
                                    rw: 'Welcome Discount',
                                    en: 'Welcome Discount',
                                    fr: 'Remise de bienvenue',
                                })
                                : t('home.rewards.eyebrow')}
                        </p>
                        <h2 className="font-display text-3xl sm:text-4xl font-semibold mt-2 text-[color:var(--md-text)]">
                            {showWelcomeOffer
                                ? translateByLocale(locale, {
                                    rw: 'Welcome discount cards hamwe na free services zayo zitandukanye',
                                    en: 'Welcome discount cards with a separate free-service block',
                                    fr: 'Cartes de remise de bienvenue avec bloc separe pour les services gratuits',
                                })
                                : t('home.rewards.title')}
                        </h2>
                        <p className="text-slate-600 mt-3 max-w-xl">
                            {showWelcomeOffer
                                ? translateByLocale(locale, {
                                    rw: 'Abakiriya bashya babona cards zitandukanye za discount, buri imwe ifite izina n igiciro cyayo, hanyuma free services zatoranyijwe na admin zikaza mu yindi card yazo.',
                                    en: 'New customers now see separate discount cards, each with its own title and price, while admin-selected free services appear in a different block.',
                                    fr: 'Les nouveaux clients voient maintenant des cartes de remise distinctes avec leur propre titre et prix, tandis que les services gratuits choisis par l admin apparaissent dans un autre bloc.',
                                })
                                : t('home.rewards.subtitle')}
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            {hasWelcomeDiscountCards && (
                                <span className="chip chip-success">
                                    {translateByLocale(locale, {
                                        rw: `${welcomeOffer.discount_card_count} discount cards`,
                                        en: `${welcomeOffer.discount_card_count} discount cards`,
                                        fr: `${welcomeOffer.discount_card_count} cartes de remise`,
                                    })}
                                </span>
                            )}
                            <span className="chip chip-success">
                                {hasSelectedWelcomeRewards
                                    ? translateByLocale(locale, {
                                        rw: `${welcomeOffer.selected_reward_count} free services zatoranyijwe`,
                                        en: `${welcomeOffer.selected_reward_count} selected free services`,
                                        fr: `${welcomeOffer.selected_reward_count} services gratuits choisis`,
                                    })
                                    : translateByLocale(locale, {
                                        rw: 'Free services zitoranywa na admin',
                                        en: 'Admin-selected free services',
                                        fr: 'Services gratuits choisis par l admin',
                                    })}
                            </span>
                        </div>
                        <div className="mt-8 flex flex-wrap gap-4">
                            <Link href={auth?.user ? route('rewards.index') : route('services')} className="btn-success">
                                {auth?.user
                                    ? translateByLocale(locale, {
                                        rw: 'Reba offers zawe',
                                        en: 'View your offers',
                                        fr: 'Voir vos offres',
                                    })
                                    : translateByLocale(locale, {
                                        rw: 'Reba discount',
                                        en: 'See the discount',
                                        fr: 'Voir la remise',
                                    })}
                            </Link>
                            <Link href={route('contact')} className="btn-outline">
                                {t('home.rewards.cta_secondary')}
                            </Link>
                        </div>
                    </div>
                    <div>
                        {showWelcomeOffer ? (
                            <WelcomeOfferShowcase locale={locale} welcomeOffer={welcomeOffer} />
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {promoCards.map((reward) => (
                                    <div key={reward.id} className="surface p-5 flex flex-col">
                                        {reward.image && (
                                            <MediaPreview
                                                src={reward.image}
                                                alt={reward.title}
                                                className="mb-3 h-32 w-full rounded-2xl object-cover"
                                                videoProps={{ autoPlay: true, loop: true, muted: true, playsInline: true, preload: 'metadata' }}
                                            />
                                        )}
                                        <div className="flex items-center gap-2">
                                            <span className="chip chip-success">
                                                {reward.isFreeReward
                                                    ? t('home.rewards.free')
                                                    : translateByLocale(locale, {
                                                        rw: 'OFFER',
                                                        en: 'OFFER',
                                                        fr: 'OFFRE',
                                                    })}
                                            </span>
                                            <h3 className="text-base font-semibold text-[color:var(--md-text)]">{reward.title}</h3>
                                        </div>
                                        <p className="mt-2 text-sm text-slate-600">{reward.description}</p>
                                        {!auth?.user ? (
                                            <button
                                                type="button"
                                                onClick={() => setAuthModalOpen(true)}
                                                className="btn-success mt-4 w-full"
                                            >
                                                {reward.isFreeReward ? t('home.rewards.claim') : translateByLocale(locale, {
                                                    rw: 'Fungura offer',
                                                    en: 'Open offer',
                                                    fr: 'Ouvrir l offre',
                                                })}
                                            </button>
                                        ) : (
                                            <Link
                                                href={route('rewards.index')}
                                                className="btn-outline mt-4 w-full text-center"
                                            >
                                                {t('home.rewards.view')}
                                            </Link>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {portfolios.length > 0 && (
                <section className="py-14 px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--md-secondary)]">
                                    {t('home.portfolio.eyebrow')}
                                </p>
                                <h2 className="font-display text-3xl sm:text-4xl font-semibold mt-2 text-[color:var(--md-text)]">
                                    {t('home.portfolio.title')}
                                </h2>
                                <p className="text-slate-600 mt-3 max-w-xl">
                                    {t('home.portfolio.subtitle')}
                                </p>
                            </div>
                            <Link href={route('portfolio')} className="btn-outline">
                                {t('home.portfolio.view_all')}
                            </Link>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                            {portfolios.slice(0, 3).map((item) => (
                                <div key={item.id} className="surface overflow-hidden transition-all duration-300 hover:shadow-elevated hover:-translate-y-1">
                                    {item.image && (
                                        <MediaPreview
                                            src={item.image}
                                            alt={getLocalizedValue(locale, item, 'title') || item.title}
                                            className="w-full h-52 object-cover"
                                            imgProps={{ loading: 'lazy' }}
                                            videoProps={{ autoPlay: true, loop: true, muted: true, playsInline: true, preload: 'metadata' }}
                                        />
                                    )}
                                    <div className="p-5">
                                        <span className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">{getLocalizedValue(locale, item, 'category') || item.category}</span>
                                        <h3 className="text-lg font-semibold text-[color:var(--md-text)] mt-2">{getLocalizedValue(locale, item, 'title') || item.title}</h3>
                                        <p className="text-sm text-slate-600 mt-2">{getLocalizedValue(locale, item, 'description') || item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <section className="py-14 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--md-primary)]">
                            {t('home.process.eyebrow')}
                        </p>
                        <h2 className="font-display text-3xl sm:text-4xl font-semibold mt-2 text-[color:var(--md-text)]">
                            {t('home.process.title')}
                        </h2>
                        <p className="text-slate-600 mt-3">
                            {t('home.process.subtitle')}
                        </p>
                    </div>
                    <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {processSteps.map((step, index) => (
                            <div key={step.title} className="surface p-6">
                                <div className="w-10 h-10 rounded-xl bg-[color:var(--md-accent)]/20 text-[color:var(--md-text)] flex items-center justify-center font-semibold">
                                    {index + 1}
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-[color:var(--md-text)]">{step.title}</h3>
                                <p className="mt-2 text-sm text-slate-600">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-14 px-4">
                <div className="max-w-6xl mx-auto fire-gradient rounded-3xl text-white p-8 sm:p-12 shadow-elevated">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
                                {t('home.promo.eyebrow')}
                            </p>
                            <h2 className="font-display text-3xl sm:text-4xl font-semibold mt-2">
                                {t('home.promo.title')}
                            </h2>
                            <p className="text-white/85 mt-3 max-w-xl">
                                {t('home.promo.subtitle')}
                            </p>
                        </div>
                        <Link href={route('contact')} className="btn-outline bg-white/10 text-white border-white/30">
                            {t('home.promo.cta')}
                        </Link>
                    </div>
                </div>
            </section>

            <AuthRequiredModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
        </PublicLayout>
    );
}
