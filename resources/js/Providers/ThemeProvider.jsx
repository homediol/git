import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import ThemeSelectionModal from '@/Components/ThemeSelectionModal';

const ThemeContext = createContext({
    theme: 'light',
    setTheme: () => {},
    toggleTheme: () => {},
    openThemePicker: () => {},
    hasSelectedTheme: false,
});

export const themeStorageKey = 'pavona_theme';

const supportedThemes = ['light', 'dark'];
const themeColors = {
    light: '#F8F9FA',
    dark: '#07111F',
};

function readStoredTheme() {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const storedTheme = window.localStorage.getItem(themeStorageKey);
        return supportedThemes.includes(storedTheme) ? storedTheme : null;
    } catch (error) {
        return null;
    }
}

function applyTheme(theme) {
    if (typeof document === 'undefined') {
        return;
    }

    const nextTheme = supportedThemes.includes(theme) ? theme : 'light';
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;

    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
        themeColorMeta.setAttribute('content', themeColors[nextTheme]);
    }
}

export function ThemeProvider({ children }) {
    const initialTheme = readStoredTheme();
    const [theme, setThemeState] = useState(() => initialTheme ?? 'light');
    const [hasSelectedTheme, setHasSelectedTheme] = useState(() => Boolean(initialTheme));
    const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
    const isModalVisible = !hasSelectedTheme || isThemePickerOpen;

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    useEffect(() => {
        if (typeof document === 'undefined') {
            return undefined;
        }

        document.body.classList.toggle('theme-modal-open', isModalVisible);

        return () => {
            document.body.classList.remove('theme-modal-open');
        };
    }, [isModalVisible]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return undefined;
        }

        const syncTheme = (event) => {
            if (event.key !== themeStorageKey) {
                return;
            }

            const nextTheme = readStoredTheme();

            if (!nextTheme) {
                setThemeState('light');
                setHasSelectedTheme(false);
                setIsThemePickerOpen(false);
                applyTheme('light');
                return;
            }

            setThemeState(nextTheme);
            setHasSelectedTheme(true);
            setIsThemePickerOpen(false);
            applyTheme(nextTheme);
        };

        window.addEventListener('storage', syncTheme);

        return () => {
            window.removeEventListener('storage', syncTheme);
        };
    }, []);

    const setTheme = (nextTheme) => {
        if (!supportedThemes.includes(nextTheme)) {
            return;
        }

        setThemeState(nextTheme);
        setHasSelectedTheme(true);
        setIsThemePickerOpen(false);
        applyTheme(nextTheme);

        if (typeof window !== 'undefined') {
            try {
                window.localStorage.setItem(themeStorageKey, nextTheme);
            } catch (error) {
                // Ignore storage errors and still apply the theme for this session.
            }
        }
    };

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const openThemePicker = () => {
        setIsThemePickerOpen(true);
    };

    const closeThemePicker = () => {
        if (!hasSelectedTheme) {
            return;
        }

        setIsThemePickerOpen(false);
    };

    const value = useMemo(
        () => ({
            theme,
            setTheme,
            toggleTheme,
            openThemePicker,
            hasSelectedTheme,
        }),
        [theme, hasSelectedTheme],
    );

    return (
        <ThemeContext.Provider value={value}>
            {children}
            <ThemeSelectionModal
                isOpen={isModalVisible}
                selectedTheme={theme}
                onSelect={setTheme}
                closeable={hasSelectedTheme}
                onClose={closeThemePicker}
            />
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
