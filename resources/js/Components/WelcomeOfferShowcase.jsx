import MediaPreview from '@/Components/MediaPreview';
import { getLocalizedValue } from '@/lib/i18n';

const cardThemes = [
    'from-orange-500 via-amber-400 to-yellow-300 text-slate-950',
    'from-emerald-500 via-teal-400 to-lime-300 text-slate-950',
    'from-sky-500 via-cyan-400 to-blue-300 text-slate-950',
    'from-rose-500 via-pink-400 to-orange-300 text-slate-950',
];

function translateByLocale(locale, messages) {
    return messages[locale] || messages.rw;
}

function formatFrw(value) {
    if (value === null || value === undefined || value === '') {
        return '';
    }

    return `${Number(value).toLocaleString()} FRW`;
}

function hasValue(value) {
    return value !== null && value !== undefined && value !== '';
}

function getCardTheme(index) {
    return cardThemes[index % cardThemes.length];
}

function getDiscountCardSavings(card) {
    const originalPrice = Number(card.original_price_rwf || 0);
    const discountedPrice = Number(card.discounted_price_rwf || 0);

    if (!originalPrice || !discountedPrice || discountedPrice >= originalPrice) {
        return '';
    }

    return `${(originalPrice - discountedPrice).toLocaleString()} FRW`;
}

function getDiscountCardTitle(locale, card, index) {
    return getLocalizedValue(locale, card, 'title') || translateByLocale(locale, {
        rw: `Discount card ${index + 1}`,
        en: `Discount card ${index + 1}`,
        fr: `Carte remise ${index + 1}`,
    });
}

export default function WelcomeOfferShowcase({ locale, welcomeOffer = {} }) {
    const discountCards = welcomeOffer.discount_cards ?? [];
    const rewards = welcomeOffer.rewards ?? [];

    if (discountCards.length === 0 && rewards.length === 0) {
        return null;
    }

    return (
        <div className="space-y-5">
            {discountCards.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {discountCards.map((card, index) => (
                        <article
                            key={`${getDiscountCardTitle(locale, card, index)}-${index}`}
                            className={`theme-static-ink overflow-hidden rounded-[30px] bg-gradient-to-br p-5 shadow-[0_22px_55px_rgba(15,23,42,0.12)] ${getCardTheme(index)}`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-900/65">
                                        {translateByLocale(locale, {
                                            rw: 'Welcome card',
                                            en: 'Welcome card',
                                            fr: 'Carte bienvenue',
                                        })}
                                    </p>
                                    <h3 className="mt-3 text-2xl font-black text-slate-950">
                                        {getDiscountCardTitle(locale, card, index)}
                                    </h3>
                                    {card.service && (
                                        <p className="mt-3 inline-flex rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-900">
                                            {getLocalizedValue(locale, card.service, 'title')}
                                        </p>
                                    )}
                                </div>
                                <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-slate-900">
                                    {hasValue(card.discount_percent) ? `${card.discount_percent}% OFF` : translateByLocale(locale, {
                                        rw: 'Offer',
                                        en: 'Offer',
                                        fr: 'Offre',
                                    })}
                                </span>
                            </div>

                            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-slate-900/65">
                                {translateByLocale(locale, {
                                    rw: 'Price now',
                                    en: 'Price now',
                                    fr: 'Prix actuel',
                                })}
                            </p>
                            <div className="mt-2 flex flex-wrap items-end gap-3">
                                <p className="text-3xl font-black text-slate-950">
                                    {hasValue(card.discounted_price_rwf) ? formatFrw(card.discounted_price_rwf) : translateByLocale(locale, {
                                        rw: 'Igiciro kirashyirwaho',
                                        en: 'Price coming',
                                        fr: 'Prix a definir',
                                    })}
                                </p>
                                {hasValue(card.original_price_rwf) && (
                                    <span className="rounded-full bg-slate-950/10 px-3 py-1 text-xs font-semibold text-slate-900/70 line-through">
                                        {formatFrw(card.original_price_rwf)}
                                    </span>
                                )}
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {card.discount_code && (
                                    <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-slate-900">
                                        Code: {card.discount_code}
                                    </span>
                                )}
                                {getDiscountCardSavings(card) && (
                                    <span className="rounded-full bg-slate-950/10 px-3 py-1 text-xs font-semibold text-slate-900">
                                        {translateByLocale(locale, {
                                            rw: `Uzigama ${getDiscountCardSavings(card)}`,
                                            en: `Save ${getDiscountCardSavings(card)}`,
                                            fr: `Economie ${getDiscountCardSavings(card)}`,
                                        })}
                                    </span>
                                )}
                            </div>

                            <p className="mt-6 text-sm font-medium text-slate-900/75">
                                {translateByLocale(locale, {
                                    rw: 'Card igaragara ukwacyo ku buryo umukiriya ahita amenya offer ye.',
                                    en: 'Each card stays visible on its own so customers instantly notice the offer.',
                                    fr: 'Chaque carte reste visible separement pour que le client remarque vite l offre.',
                                })}
                            </p>
                        </article>
                    ))}
                </div>
            )}

            <aside className="theme-surface-panel overflow-hidden rounded-[30px] border border-sky-200 bg-[linear-gradient(135deg,_rgba(239,246,255,1),_rgba(255,255,255,1),_rgba(240,253,250,0.95))] p-5 shadow-[0_22px_55px_rgba(14,165,233,0.12)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-600">
                            {translateByLocale(locale, {
                                rw: 'Free services',
                                en: 'Free services',
                                fr: 'Services gratuits',
                            })}
                        </p>
                        <h3 className="mt-3 text-2xl font-semibold text-slate-950">
                            {translateByLocale(locale, {
                                rw: 'Admin-selected free services',
                                en: 'Admin-selected free services',
                                fr: 'Services gratuits choisis par l admin',
                            })}
                        </h3>
                        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                            {rewards.length > 0
                                ? translateByLocale(locale, {
                                    rw: 'Izi free services zigaragara ukwazo munsi ya discount cards, kugira ngo umukiriya abone ibintu byombi bitandukanije kandi neza.',
                                    en: 'These free services appear in their own block under the discount cards so customers can understand both clearly at once.',
                                    fr: 'Ces services gratuits apparaissent dans leur propre bloc sous les cartes de remise pour que le client voie clairement les deux.',
                                })
                                : translateByLocale(locale, {
                                    rw: 'Nta free service yatoranyijwe kuri iyi moment. Discount cards ziracyagaragara ukwazo.',
                                    en: 'No free service has been selected right now. The discount cards still remain visible on their own.',
                                    fr: 'Aucun service gratuit n est selectionne pour le moment. Les cartes de remise restent visibles separement.',
                                })}
                        </p>
                    </div>

                    <div className="rounded-[24px] bg-white/85 px-4 py-3 text-right shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                            {translateByLocale(locale, {
                                rw: 'Selected',
                                en: 'Selected',
                                fr: 'Selectionnes',
                            })}
                        </p>
                        <p className="mt-2 text-3xl font-black text-slate-950">{rewards.length}</p>
                    </div>
                </div>

                {rewards.length > 0 && (
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                        {rewards.map((reward) => (
                            <article key={reward.id} className="rounded-[26px] border border-white bg-white/90 p-4 shadow-sm">
                                <div className="flex gap-4">
                                    {reward.image && (
                                        <MediaPreview
                                            src={reward.image}
                                            alt={getLocalizedValue(locale, reward, 'name')}
                                            className="h-20 w-20 rounded-2xl object-cover"
                                            imgProps={{ loading: 'lazy' }}
                                            videoProps={{ controls: true, playsInline: true, preload: 'metadata' }}
                                        />
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-base font-semibold text-slate-950">
                                            {getLocalizedValue(locale, reward, 'name')}
                                        </h4>
                                        {reward.service && (
                                            <p className="mt-2 inline-flex rounded-full bg-sky-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-700">
                                                {getLocalizedValue(locale, reward.service, 'title')}
                                            </p>
                                        )}
                                        {getLocalizedValue(locale, reward, 'description') && (
                                            <p className="mt-3 text-sm text-slate-600">
                                                {getLocalizedValue(locale, reward, 'description')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </aside>
        </div>
    );
}
