import { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useLocale } from '@/Providers/LocaleProvider';
import { getLocalizedValue } from '@/lib/i18n';

const PROMO_COOLDOWN_DAYS = 5;

export default function PromotionModal() {
    const { promotion, flash, auth } = usePage().props;
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

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div className="relative max-w-2xl w-full overflow-hidden rounded-3xl bg-white shadow-elevated border border-[color:var(--md-outline)]">
                <div className="fire-gradient text-white px-6 py-5 sm:px-8 sm:py-6">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/90">
                                {t('promo.special_offer')}
                            </p>
                            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold">{title}</h2>
                        </div>
                        <button
                            type="button"
                            onClick={dismiss}
                            className="h-9 w-9 rounded-full bg-white/20 text-white text-sm font-semibold transition hover:bg-white/30"
                            aria-label={t('promo.close')}
                        >
                            X
                        </button>
                    </div>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                        <span className="h-2 w-2 rounded-full bg-[color:var(--md-success)]"></span>
                        {t('promo.free_services')}
                    </div>
                </div>
                {promotion.image && (
                    <img
                        src={promotion.image}
                        alt={title}
                        className="h-56 w-full object-cover"
                    />
                )}
                <div className="p-6 sm:p-8 text-center">
                    <p className="text-slate-600 text-base sm:text-lg mb-6">{message}</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            href={promotion.cta_url || route('services')}
                            className="btn-primary"
                            onClick={dismiss}
                        >
                            {t('promo.cta_continue')}
                        </Link>
                        {!auth?.user && (
                            <Link
                                href={route('login')}
                                className="btn-secondary"
                                onClick={dismiss}
                            >
                                {t('promo.cta_login')}
                            </Link>
                        )}
                        <button
                            type="button"
                            onClick={dismiss}
                            className="btn-outline"
                        >
                            {t('promo.maybe_later')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
