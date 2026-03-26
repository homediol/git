import { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useLocale } from '@/Providers/LocaleProvider';
import { getLocalizedValue } from '@/lib/i18n';

const PROMO_COOLDOWN_DAYS = 5;

export default function PromotionModal() {
    const { promotion, flash } = usePage().props;
    const { locale, t } = useLocale();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!promotion) return;
        if (typeof window === 'undefined') return;

        const lastSeen = localStorage.getItem('promo_seen_at');
        const now = Date.now();
        const cooldownMs = PROMO_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
        const showByTime = !lastSeen || now - Number(lastSeen) > cooldownMs;
        const showByFlash = Boolean(flash?.show_promo);

        if (showByFlash || showByTime) {
            setOpen(true);
        }
    }, [promotion, flash]);

    const dismiss = () => {
        setOpen(false);
        if (typeof window !== 'undefined') {
            localStorage.setItem('promo_seen_at', Date.now().toString());
        }
    };

    if (!promotion || !open) return null;

    const title = getLocalizedValue(locale, promotion, 'title');
    const message = getLocalizedValue(locale, promotion, 'message');
    const ctaText = getLocalizedValue(locale, promotion, 'cta_text') || t('promo.claim_offer');

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="relative max-w-2xl w-full glass-dark rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                <button
                    type="button"
                    onClick={dismiss}
                    className="absolute top-4 right-4 text-white/70 hover:text-white"
                >
                    X
                </button>
                {promotion.image && (
                    <img
                        src={promotion.image}
                        alt={title}
                        className="h-56 w-full object-cover"
                    />
                )}
                <div className="p-8 text-center">
                    <p className="text-sm uppercase tracking-[0.35em] text-sky-200/80 font-semibold mb-3">{t('promo.special_offer')}</p>
                    <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4">{title}</h2>
                    <p className="text-white/80 text-base sm:text-lg mb-6">{message}</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        {promotion.cta_url && (
                            <Link
                                href={promotion.cta_url}
                                className="rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-6 py-3 text-white font-semibold hover:shadow-xl hover:scale-[1.02] transition"
                                onClick={dismiss}
                            >
                                {ctaText}
                            </Link>
                        )}
                        <button
                            type="button"
                            onClick={dismiss}
                            className="rounded-xl border border-white/20 px-6 py-3 text-white/80 font-semibold hover:text-white"
                        >
                            {t('promo.maybe_later')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
