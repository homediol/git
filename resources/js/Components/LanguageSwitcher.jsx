import { useLocale } from '@/Providers/LocaleProvider';

export default function LanguageSwitcher({ className = '', variant = 'light' }) {
    const { locale, setLocale, t } = useLocale();
    const labelClass = variant === 'dark' ? 'text-white/70' : 'text-slate-600';
    const selectClass = variant === 'dark'
        ? 'bg-white/10 text-white border-white/20 hover:border-white/40'
        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300';

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <span className={`hidden sm:inline text-xs font-semibold ${labelClass}`}>
                {t('language.label')}
            </span>
            <div className="relative">
                <select
                    value={locale}
                    onChange={(e) => setLocale(e.target.value)}
                    className={`appearance-none rounded-xl pl-3 pr-8 py-2 text-xs font-semibold outline-none border shadow-sm ${selectClass}`}
                    aria-label={t('language.label')}
                >
                    <option value="rw" className="text-slate-900">
                        {t('language.rw')}
                    </option>
                    <option value="en" className="text-slate-900">
                        {t('language.en')}
                    </option>
                    <option value="fr" className="text-slate-900">
                        {t('language.fr')}
                    </option>
                </select>
                <svg
                    className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.7a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z"
                        clipRule="evenodd"
                    />
                </svg>
            </div>
        </div>
    );
}
