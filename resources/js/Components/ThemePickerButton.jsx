import { useTheme } from '@/Providers/ThemeProvider';

function SunIcon() {
    return (
        <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="4" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77" />
        </svg>
    );
}

function MoonIcon() {
    return (
        <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 15.2A8.7 8.7 0 118.8 4 7 7 0 0020 15.2z" />
        </svg>
    );
}

export default function ThemePickerButton({ compact = false, className = '' }) {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';
    const nextThemeLabel = isDark ? 'Light Mode' : 'Dark Mode';
    const nextThemeIsDark = !isDark;

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className={`inline-flex items-center justify-center gap-2 rounded-xl border border-[color:var(--md-outline)] bg-[color:var(--md-surface)] px-3.5 py-2.5 text-sm font-semibold text-[color:var(--md-text)] shadow-sm transition hover:bg-[color:var(--md-surface-alt)] ${className}`}
            aria-label={`Switch to ${nextThemeLabel}`}
            title={`Switch to ${nextThemeLabel}`}
        >
            <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${
                    nextThemeIsDark ? 'bg-sky-500/12 text-sky-300' : 'bg-amber-500/12 text-amber-600'
                }`}
            >
                {isDark ? <SunIcon /> : <MoonIcon />}
            </span>
            {!compact && (
                <span className="whitespace-nowrap">
                    {nextThemeLabel}
                </span>
            )}
        </button>
    );
}
