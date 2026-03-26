import { useLocale } from '@/Providers/LocaleProvider';

const options = [
    { value: 'rw', label: 'RW', name: 'Kinyarwanda', flag: '🇷🇼' },
    { value: 'en', label: 'EN', name: 'English', flag: '🇬🇧' },
    { value: 'fr', label: 'FR', name: 'Francais', flag: '🇫🇷' },
];

export default function LanguageSwitcher({ className = '' }) {
    const { locale, setLocale, t } = useLocale();

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <span className="hidden sm:inline text-xs text-white/70">{t('language.label')}</span>
            <div className="relative">
                <select
                    value={locale}
                    onChange={(e) => setLocale(e.target.value)}
                    className="appearance-none rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white outline-none border border-white/10 hover:border-white/30"
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value} className="text-slate-900">
                            {option.flag} {option.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
