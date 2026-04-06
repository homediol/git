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

function getMatchingDiscountCards(welcomeOffer, serviceId) {
    const normalizedServiceId = Number(serviceId || 0);

    if (!normalizedServiceId || welcomeOffer?.eligible === false) {
        return [];
    }

    return (welcomeOffer?.discount_cards ?? []).filter((card) => Number(card.service_id || 0) === normalizedServiceId);
}

export default function ServiceDiscountCards({ locale, welcomeOffer = {}, serviceId, className = '' }) {
    const matchingCards = getMatchingDiscountCards(welcomeOffer, serviceId);

    if (matchingCards.length === 0) {
        return null;
    }

    return (
        <div className={`space-y-3 ${className}`.trim()}>
            {matchingCards.map((card, index) => (
                <article
                    key={`${getDiscountCardTitle(locale, card, index)}-${card.service_id || 'global'}-${index}`}
                    className={`theme-static-ink overflow-hidden rounded-[26px] bg-gradient-to-br p-4 shadow-[0_18px_40px_rgba(15,23,42,0.12)] ${cardThemes[index % cardThemes.length]}`}
                >
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-900/65">
                                {translateByLocale(locale, {
                                    rw: 'Welcome card',
                                    en: 'Welcome card',
                                    fr: 'Carte bienvenue',
                                })}
                            </p>
                            <h4 className="mt-2 text-lg font-black text-slate-950">
                                {getDiscountCardTitle(locale, card, index)}
                            </h4>
                        </div>
                        <span className="rounded-full bg-white/85 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-900">
                            {hasValue(card.discount_percent) ? `${card.discount_percent}% OFF` : translateByLocale(locale, {
                                rw: 'Offer',
                                en: 'Offer',
                                fr: 'Offre',
                            })}
                        </span>
                    </div>

                    <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-900/65">
                        {translateByLocale(locale, {
                            rw: 'Price now',
                            en: 'Price now',
                            fr: 'Prix actuel',
                        })}
                    </p>
                    <div className="mt-2 flex flex-wrap items-end gap-2">
                        <p className="text-2xl font-black text-slate-950">
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

                    <div className="mt-3 flex flex-wrap gap-2">
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

                    <p className="mt-4 text-sm font-medium text-slate-900/75">
                        {translateByLocale(locale, {
                            rw: 'Iyi discount igaragara kuri home page gusa, kuri card ya service ihuye na yo, kugira ngo umukiriya ayibone ako kanya.',
                            en: 'This discount appears only on the home page, on the matching service card, so customers notice it right away.',
                            fr: 'Cette remise apparait uniquement sur la page d accueil, sur la carte du service correspondant, pour etre remarque tout de suite.',
                        })}
                    </p>
                </article>
            ))}
        </div>
    );
}
