import { useState, useEffect } from 'react';

export function useTheme() {
    const [theme, setThemeState] = useState(() => {
        if (typeof window === 'undefined') return 'light';
        const saved = localStorage.getItem('kardovo_theme');
        if (saved) return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
            localStorage.setItem('kardovo_theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('kardovo_theme', 'light');
        }
    }, [theme]);

    const toggleTheme = () => {
        setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    const setTheme = (newTheme) => {
        if (newTheme === 'dark' || newTheme === 'light') {
            setThemeState(newTheme);
        }
    };

    return {
        theme,
        isDark: theme === 'dark',
        toggleTheme,
        setTheme,
    };
}

export default useTheme;

