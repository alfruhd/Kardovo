import { Theme, ThemeInput, ThemeSchema, ThemeColors } from '@/lib/schema';

// ============================================================================
// 1. Color Math & Palette Generation (HSL)
// ============================================================================

export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

/**
 * Parses 3 or 6 hex digits into RGB values
 */
export function hexToRgb(hexInput: string): RGB {
  let hex = hexInput.replace(/^#/, '').trim();
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (hex.length < 6) {
    return { r: 0, g: 0, b: 0 };
  }
  const num = parseInt(hex.slice(0, 6), 16);
  if (isNaN(num)) {
    return { r: 0, g: 0, b: 0 };
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Converts RGB [0-255] to HSL [h: 0-360, s: 0-100, l: 0-100]
 */
export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: h * 360,
    s: s * 100,
    l: l * 100,
  };
}

/**
 * Converts HSL [h: 0-360, s: 0-100, l: 0-100] to Hex string (#rrggbb)
 */
export function hslToHex(hsl: HSL): string {
  const h = (hsl.h % 360 + 360) % 360 / 360;
  const s = Math.max(0, Math.min(100, hsl.s)) / 100;
  const l = Math.max(0, Math.min(100, hsl.l)) / 100;

  let r: number;
  let g: number;
  let b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      let tAdj = t;
      if (tAdj < 0) tAdj += 1;
      if (tAdj > 1) tAdj -= 1;
      if (tAdj < 1 / 6) return p + (q - p) * 6 * tAdj;
      if (tAdj < 1 / 2) return q;
      if (tAdj < 2 / 3) return p + (q - p) * (2 / 3 - tAdj) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (n: number) => {
    const hex = Math.round(n * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Calculates WCAG 2.1 relative luminance
 */
export function getLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const transform = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const lr = transform(r);
  const lg = transform(g);
  const lb = transform(b);
  return lr * 0.2126 + lg * 0.7152 + lb * 0.0722;
}

/**
 * Calculates contrast ratio between two hex colors (1 to 21)
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Generates a complete harmonious palette from a single base color using HSL theory.
 * Ensures high contrast for text/background.
 */
export function generatePalette(baseHex: string): ThemeColors {
  const rgb = hexToRgb(baseHex);
  const hsl = rgbToHsl(rgb);

  // Background: Warm ivory/off-white keeping subtle warm hue
  const background = hslToHex({
    h: hsl.h,
    s: Math.min(25, Math.max(8, hsl.s * 0.25)),
    l: 96,
  });

  const surface = '#ffffff';

  // Primary: Preserves original base color hex
  const primary = baseHex.startsWith('#') ? baseHex : `#${baseHex}`;

  // Secondary: Analogous or complementary warm earth tone
  const secondary = hslToHex({
    h: (hsl.h + 20) % 360,
    s: Math.max(20, Math.min(50, hsl.s * 0.6)),
    l: 30,
  });

  // Accent: Rich jewel tone (e.g., deep burgundy / emerald / royal navy shift)
  const accent = hslToHex({
    h: (hsl.h + 340) % 360, // Slight rotation towards rose/burgundy
    s: Math.max(65, Math.min(90, hsl.s + 20)),
    l: 22,
  });

  // Text: Very dark tone with high contrast against ivory/white background
  const text = hslToHex({
    h: hsl.h,
    s: Math.min(30, Math.max(10, hsl.s * 0.3)),
    l: 16,
  });

  // Muted: Mid-level soft tone for metadata and subtle descriptions
  const muted = hslToHex({
    h: hsl.h,
    s: Math.min(25, Math.max(10, hsl.s * 0.25)),
    l: 45,
  });

  // Border: Soft translucent or light border
  const border = `${baseHex}33`;

  const ring = primary;

  return {
    background,
    surface,
    primary,
    secondary,
    accent,
    text,
    muted,
    border,
    ring,
  };
}

// Backward compatible alias
export const derivePaletteFromBase = generatePalette;

// ============================================================================
// 2. CSS Variable Generator (Colors, Typography Scale, Spacing, Radius, Motion)
// ============================================================================

export function themeToCssVariables(rawTheme: Theme | ThemeInput): Record<string, string> {
  const theme = ThemeSchema.parse(rawTheme);
  const vars: Record<string, string> = {
    // Colors
    '--color-bg': theme.colors.background,
    '--color-surface': theme.colors.surface || '#ffffff',
    '--color-primary': theme.colors.primary,
    '--color-secondary': theme.colors.secondary,
    '--color-accent': theme.colors.accent,
    '--color-text': theme.colors.text,
    '--color-muted': theme.colors.muted,
    '--color-border': theme.colors.border,
    '--color-ring': theme.colors.ring || theme.colors.primary,

    // Fonts
    '--font-display': theme.fonts.display || theme.fonts.heading,
    '--font-script': theme.fonts.script || theme.fonts.accent,
    '--font-heading': theme.fonts.heading,
    '--font-body': theme.fonts.body,
    '--font-accent': theme.fonts.accent,

    // Typography Scale (Fluid clamp values)
    '--font-size-xs': '0.75rem',
    '--font-size-sm': '0.875rem',
    '--font-size-base': '1rem',
    '--font-size-lg': '1.125rem',
    '--font-size-xl': '1.25rem',
    '--font-size-2xl': '1.5rem',
    '--font-size-3xl': '1.875rem',
    '--font-size-4xl': '2.25rem',
    '--font-size-5xl': '3rem',

    // Spacing scale
    '--spacing-unit': `${theme.spacingUnitPx || 4}px`,
    '--spacing-xs': `${(theme.spacingUnitPx || 4) * 1}px`,
    '--spacing-sm': `${(theme.spacingUnitPx || 4) * 2}px`,
    '--spacing-md': `${(theme.spacingUnitPx || 4) * 4}px`,
    '--spacing-lg': `${(theme.spacingUnitPx || 4) * 6}px`,
    '--spacing-xl': `${(theme.spacingUnitPx || 4) * 8}px`,
    '--spacing-2xl': `${(theme.spacingUnitPx || 4) * 12}px`,

    // Border Radius
    '--radius-default': theme.defaultRadius || '16px',
    '--radius-sm': '6px',
    '--radius-md': '10px',
    '--radius-lg': '16px',
    '--radius-full': '9999px',

    // Shadows
    '--shadow-sm': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
    '--shadow-md': '0 4px 14px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
    '--shadow-lg': '0 12px 28px -4px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.06)',
    '--shadow-seal': '0 8px 24px -4px rgba(90, 15, 27, 0.35)',

    // Motion timing tokens
    '--motion-fast': '150ms ease-out',
    '--motion-normal': '300ms ease-out',
    '--motion-slow': '600ms cubic-bezier(0.16, 1, 0.3, 1)',
    '--motion-wax-stamp': '800ms cubic-bezier(0.34, 1.56, 0.64, 1)',

    // Max Container Width
    '--container-max-width': theme.defaultContainerMaxWidth || '460px',
  };

  return vars;
}

export function themeColorsToCssVariables(colors: ThemeColors): Record<string, string> {
  return {
    '--color-bg': colors.background,
    '--color-surface': colors.surface || '#ffffff',
    '--color-primary': colors.primary,
    '--color-secondary': colors.secondary,
    '--color-accent': colors.accent,
    '--color-text': colors.text,
    '--color-muted': colors.muted,
    '--color-border': colors.border,
    '--color-ring': colors.ring || colors.primary,
  };
}
