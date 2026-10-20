'use client';

import React from 'react';
import { ThemeProvider, useTheme, PRESET_THEMES } from '@/lib/theme';
import { sampleInvitationConfig } from '@/config/sample-invitation';
import { Theme } from '@/lib/schema';

function ThemeTestPlayground() {
  const { updateThemeColor, setTheme } = useTheme();

  return (
    <div className="max-w-xl mx-auto p-8 space-y-6">
      <h1
        id="theme-test-heading"
        className="text-3xl font-bold font-heading text-brand-primary transition-colors duration-200"
      >
        Live Theme Preview
      </h1>

      <div
        id="theme-test-card"
        className="p-6 rounded-2xl border border-brand-border bg-white shadow-lg space-y-4 transition-colors duration-200"
      >
        <p id="theme-test-body" className="text-brand-text text-base">
          This card reacts dynamically to theme color changes across CSS variables.
        </p>

        <div className="flex gap-3">
          <button
            id="btn-color-teal"
            onClick={() => updateThemeColor('primary', '#008080')}
            className="px-4 py-2 rounded-lg bg-teal-600 text-white font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Set Primary Teal (#008080)
          </button>

          <button
            id="btn-color-ruby"
            onClick={() => updateThemeColor('primary', '#990000')}
            className="px-4 py-2 rounded-lg bg-red-800 text-white font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Set Primary Ruby (#990000)
          </button>
        </div>

        <div className="pt-4 border-t border-brand-border">
          <p className="text-xs uppercase tracking-wider text-brand-muted mb-2 font-semibold">
            Theme Presets
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PRESET_THEMES).map(([name, preset]) => (
              <button
                key={name}
                id={`btn-preset-${name}`}
                onClick={() => setTheme(preset)}
                className="px-3 py-1.5 rounded-md border border-brand-border text-xs font-medium text-brand-text hover:bg-black/5"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ThemeTestPage() {
  const initialTheme = (sampleInvitationConfig.theme as Theme) || PRESET_THEMES.sacredGarden;

  return (
    <ThemeProvider initialTheme={initialTheme}>
      <main className="min-h-screen bg-brand-bg py-12 px-4 transition-colors duration-200">
        <ThemeTestPlayground />
      </main>
    </ThemeProvider>
  );
}

