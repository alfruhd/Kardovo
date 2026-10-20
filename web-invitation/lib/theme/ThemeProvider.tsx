'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Theme, ThemeInput, ThemeSchema } from '@/lib/schema';
import { themeToCssVariables } from './palette';
import { buildGoogleFontsUrl, buildCustomFontFaceCss } from './font-loader';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme | ThemeInput) => void;
  updateThemeColor: (key: keyof Theme['colors'], hex: string) => void;
  variables: Record<string, string>;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export interface ThemeProviderProps {
  initialTheme: Theme | ThemeInput;
  children: React.ReactNode;
}

export function ThemeProvider({ initialTheme, children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => ThemeSchema.parse(initialTheme));

  // Sync state if initialTheme prop changes externally
  useEffect(() => {
    setThemeState(ThemeSchema.parse(initialTheme));
  }, [initialTheme]);

  const setTheme = (newTheme: Theme | ThemeInput) => {
    setThemeState(ThemeSchema.parse(newTheme));
  };

  const variables = useMemo(() => themeToCssVariables(theme), [theme]);
  const googleFontsUrl = useMemo(() => buildGoogleFontsUrl(theme), [theme]);
  const customFontFaceCss = useMemo(
    () => buildCustomFontFaceCss(theme.customFonts || []),
    [theme.customFonts]
  );

  // Apply CSS variables dynamically to document root in browser
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [variables]);

  const updateThemeColor = (key: keyof Theme['colors'], hex: string) => {
    setThemeState((prev: Theme) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [key]: hex,
      },
    }));
  };

  const contextValue = useMemo(
    () => ({
      theme,
      setTheme,
      updateThemeColor,
      variables,
    }),
    [theme, variables]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {/* Dynamic Google Fonts Link */}
      {googleFontsUrl && (
        <link rel="stylesheet" href={googleFontsUrl} key="google-fonts-link" />
      )}

      {/* Dynamic Custom Fonts @font-face style tag */}
      {customFontFaceCss && (
        <style
          id="custom-fonts-style"
          dangerouslySetInnerHTML={{ __html: customFontFaceCss }}
        />
      )}

      {/* Server/hydration inline style fallback for root container */}
      <div
        id="theme-root"
        style={variables as React.CSSProperties}
        className="min-h-screen w-full transition-colors duration-300"
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

