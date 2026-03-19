import { createContext, useContext, useMemo, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, ThemeMode, AppTheme } from './theme';

const THEME_STORAGE_KEY = '@smartlock_theme_mode';

type ThemeContextValue = {
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    theme: AppTheme;
    isDark: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const scheme = useColorScheme();
    const [mode, setModeState] = useState<ThemeMode>('system');
    const [loaded, setLoaded] = useState(false);

    // Load saved preference on mount
    useEffect(() => {
        AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
            if (saved === 'light' || saved === 'dark' || saved === 'system') {
                setModeState(saved);
            }
            setLoaded(true);
        });
    }, []);

    // Persist on change
    function setMode(newMode: ThemeMode) {
        setModeState(newMode);
        AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
    }

    const isDark = mode === 'system' ? scheme === 'dark' : mode === 'dark';
    const theme = isDark ? colors.dark : colors.light;

    const value = useMemo(
        () => ({ mode, setMode, theme, isDark }),
        [mode, theme, isDark]
    );

    // Don't render until preference is loaded to avoid flash
    if (!loaded) return null;

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
}