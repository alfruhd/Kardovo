import { describe, it, expect } from 'vitest';
import {
  generatePalette,
  themeToCssVariables,
  getContrastRatio,
  hexToRgb,
  rgbToHsl,
  hslToHex,
  PRESET_THEMES,
  buildGoogleFontsUrl,
  buildCustomFontFaceCss,
} from '@/lib/theme';

describe('DELIVERABLE C: Theme Engine & CSS Variable Generator', () => {
  describe('1. Palette Generator Determinism & Completeness', () => {
    it('produces identical palette outputs when called multiple times with the same baseColor', () => {
      const baseColor = '#5a0f1b';
      const palette1 = generatePalette(baseColor);
      const palette2 = generatePalette(baseColor);

      expect(palette1).toEqual(palette2);
    });

    it('ensures all required ThemeColors tokens exist in generated palette', () => {
      const palette = generatePalette('#0b3d2e');

      expect(palette).toHaveProperty('background');
      expect(palette).toHaveProperty('surface');
      expect(palette).toHaveProperty('primary');
      expect(palette).toHaveProperty('secondary');
      expect(palette).toHaveProperty('accent');
      expect(palette).toHaveProperty('text');
      expect(palette).toHaveProperty('muted');
      expect(palette).toHaveProperty('border');
      expect(palette).toHaveProperty('ring');

      // Check format
      expect(palette.background).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(palette.primary).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(palette.text).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    it('converts correctly between Hex, RGB, and HSL', () => {
      const hex = '#5a0f1b';
      const rgb = hexToRgb(hex);
      expect(rgb).toEqual({ r: 90, g: 15, b: 27 });

      const hsl = rgbToHsl(rgb);
      const hexBack = hslToHex(hsl);
      expect(hexBack.toLowerCase()).toBe('#5a0f1b');
    });
  });

  describe('2. WCAG Contrast Ratio Checks', () => {
    it('achieves readable contrast between text and background on generated palettes', () => {
      const testBases = ['#5a0f1b', '#0b3d2e', '#a67d2b', '#1e3a8a', '#b76e79'];

      for (const base of testBases) {
        const palette = generatePalette(base);
        const textBgRatio = getContrastRatio(palette.text, palette.background);
        const textSurfaceRatio = getContrastRatio(palette.text, palette.surface);

        expect(textBgRatio).toBeGreaterThanOrEqual(4.5);
        expect(textSurfaceRatio).toBeGreaterThanOrEqual(4.5);
      }
    });

    it('achieves high contrast for all 5 preset themes', () => {
      for (const [name, preset] of Object.entries(PRESET_THEMES)) {
        const textBgRatio = getContrastRatio(preset.colors.text, preset.colors.background);
        expect(
          textBgRatio,
          `Preset ${name} text/bg contrast (${textBgRatio.toFixed(2)}) should be >= 4.5:1`
        ).toBeGreaterThanOrEqual(4.5);
      }
    });
  });

  describe('3. CSS Variable Generator & Scale Tokens', () => {
    it('generates all expected CSS variables including colors, fonts, spacing, radius, and shadows', () => {
      const theme = PRESET_THEMES.sacredGarden;
      expect(theme).toBeDefined();
      if (!theme) return;

      const vars = themeToCssVariables(theme);

      // Colors
      expect(vars['--color-bg']).toBe('#f9f0e0');
      expect(vars['--color-primary']).toBe('#a67d2b');
      expect(vars['--color-accent']).toBe('#5a0f1b');

      // Fonts
      expect(vars['--font-display']).toBe('Cinzel');
      expect(vars['--font-script']).toBe('Cinzel Decorative');
      expect(vars['--font-heading']).toBe('Cinzel');
      expect(vars['--font-body']).toBe('system-ui');

      // Scale & Spacing
      expect(vars['--font-size-base']).toBe('1rem');
      expect(vars['--spacing-unit']).toBe('4px');
      expect(vars['--radius-default']).toBe('16px');
      expect(vars['--shadow-seal']).toBeDefined();
      expect(vars['--motion-wax-stamp']).toBeDefined();
      expect(vars['--container-max-width']).toBe('460px');
    });
  });

  describe('4. Google Fonts & Custom Font Loader', () => {
    it('constructs a Google Fonts CSS2 URL excluding system fonts', () => {
      const theme = PRESET_THEMES.sacredGarden;
      expect(theme).toBeDefined();
      if (!theme) return;

      const url = buildGoogleFontsUrl(theme);

      expect(url).not.toBeNull();
      expect(url).toContain('fonts.googleapis.com/css2?');
      expect(url).toContain('family=Cinzel');
      expect(url).toContain('family=Cinzel+Decorative');
      expect(url).not.toContain('system-ui');
    });

    it('returns null when theme uses only system fonts', () => {
      const base = PRESET_THEMES.sacredGarden;
      expect(base).toBeDefined();
      if (!base) return;

      const theme = {
        ...base,
        fonts: {
          display: 'system-ui',
          script: 'system-ui',
          heading: 'system-ui',
          body: 'system-ui',
          accent: 'system-ui',
        },
      };
      const url = buildGoogleFontsUrl(theme);
      expect(url).toBeNull();
    });

    it('generates @font-face CSS rules for custom uploaded fonts', () => {
      const customFonts = [
        {
          fontFamily: 'Custom Monogram',
          src: 'https://example.com/fonts/custom.woff2',
          format: 'woff2' as const,
          fontWeight: '700',
          fontStyle: 'normal',
        },
      ];
      const css = buildCustomFontFaceCss(customFonts);

      expect(css).toContain('@font-face');
      expect(css).toContain("font-family: 'Custom Monogram'");
      expect(css).toContain("url('https://example.com/fonts/custom.woff2')");
      expect(css).toContain("format('woff2')");
    });
  });
});

