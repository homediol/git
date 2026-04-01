import { Link } from '@inertiajs/react';
import { useLocale } from '@/Providers/LocaleProvider';
import GoogleIcon from '@/Components/GoogleIcon';

export default function AuthRequiredModal({ open, onClose }) {
    const { t } = useLocale();

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-elevated border border-[color:var(--md-outline)]">
                <div className="fire-gradient px-6 py-5 sm:px-8 sm:py-6 text-white">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
                                {t('auth.required.badge')}
                            </p>
                            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold">
                                {t('auth.required.title')}
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-9 w-9 rounded-full bg-white/20 text-white text-sm font-semibold transition hover:bg-white/30"
                            aria-label={t('auth.required.close')}
                        >
                            X
                        </button>
                    </div>
                    <p className="mt-3 text-sm text-white/90">
                        {t('auth.required.message')}
                    </p>
                </div>
                <div className="p-6 sm:p-8">
                    <p className="text-sm text-slate-600 text-center">
                        {t('auth.required.helper')}
                    </p>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <Link href={route('register')} className="btn-primary text-center" onClick={onClose}>
                            {t('auth.required.register')}
                        </Link>
                        <Link href={route('login')} className="btn-secondary text-center" onClick={onClose}>
                            {t('auth.required.login')}
                        </Link>
                    </div>
                    <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
                        <span className="h-px flex-1 bg-slate-200"></span>
                        {t('auth.required.or')}
                        <span className="h-px flex-1 bg-slate-200"></span>
                    </div>
                    <Link
                        href={route('auth.google')}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[color:var(--md-outline)] bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        onClick={onClose}
                    >
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
                            <GoogleIcon className="h-5 w-5" />
                        </span>
                        {t('auth.required.google')}
                    </Link>
                    <button
                        type="button"
                        onClick={onClose}
                        className="mt-5 w-full text-center text-sm font-semibold text-slate-500 hover:text-slate-700"
                    >
                        {t('auth.required.dismiss')}
                    </button>
                </div>
            </div>
        </div>
    );
}
