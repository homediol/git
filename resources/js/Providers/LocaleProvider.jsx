import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { getTranslation, localeStorageKey, supportedLocales } from '@/lib/i18n';

const LocaleContext = createContext({
    locale: 'rw',
    setLocale: () => {},
    t: (key) => key,
});

export function LocaleProvider({ children }) {
    const { auth, locale: serverLocale } = usePage().props;
    const fallbackLocale = supportedLocales.includes(serverLocale) ? serverLocale : 'rw';

    const [locale, setLocaleState] = useState(() => {
        if (typeof window === 'undefined') {
            return fallbackLocale;
        }
        const stored = localStorage.getItem(localeStorageKey);
        return supportedLocales.includes(stored) ? stored : fallbackLocale;
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const stored = localStorage.getItem(localeStorageKey);
        if (!stored || !supportedLocales.includes(stored)) {
            localStorage.setItem(localeStorageKey, fallbackLocale);
            setLocaleState(fallbackLocale);
        }
    }, [fallbackLocale]);

    const setLocale = (nextLocale) => {
        if (!supportedLocales.includes(nextLocale)) return;
        setLocaleState(nextLocale);
        if (typeof window !== 'undefined') {
            localStorage.setItem(localeStorageKey, nextLocale);
        }
        if (auth?.user) {
            axios.post(route('locale.update'), { locale: nextLocale }).catch(() => {});
        }
    };

    const t = (key, fallback) => getTranslation(locale, key, fallback);

    const value = useMemo(() => ({ locale, setLocale, t }), [locale]);

    useEffect(() => {
        if (!auth?.user) return;
        if (auth.user.language === locale) return;
        axios.post(route('locale.update'), { locale }).catch(() => {});
    }, [auth?.user, locale]);

    return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export const useLocale = () => useContext(LocaleContext);
