import { HSL, hexToRgb, rgbToHsl, hslToHex } from '@/lib/theme/palette';

export interface DerivedSealPalette {
  base: string;
  highlight: string;
  shadow: string;
  rim: string;
  deepShadow: string;
  embossHighlight: string;
  embossShadow: string;
}

/**
 * Derives a realistic wax seal color palette from any base hex color.
 * Uses HSL color math to shift lightness, saturation, and subtle hue angles.
 */
export function deriveSealPalette(baseHex: string): DerivedSealPalette {
  const rgb = hexToRgb(baseHex);
  const hsl = rgbToHsl(rgb);

  // 1. Highlight: brighter and slightly warm-shifted for specular reflection
  const highlightHsl: HSL = {
    h: hsl.h,
    s: Math.min(100, Math.max(20, hsl.s * 1.1)),
    l: Math.min(92, hsl.l + 28),
  };

  // 2. Shadow: deeper, richer, slightly saturated
  const shadowHsl: HSL = {
    h: hsl.h,
    s: Math.min(100, hsl.s * 1.05),
    l: Math.max(6, hsl.l - 18),
  };

  // 3. Rim: elevated outer rim catch-light
  const rimHsl: HSL = {
    h: hsl.h,
    s: Math.max(15, hsl.s * 0.95),
    l: Math.min(85, hsl.l + 14),
  };

  // 4. Deep Shadow: contact drop shadow beneath seal puddle
  const deepShadowHsl: HSL = {
    h: hsl.h,
    s: Math.min(100, hsl.s * 1.2),
    l: Math.max(3, hsl.l - 30),
  };

  // 5. Emboss bevel highlights and shadows
  const embossHighlightHsl: HSL = {
    h: hsl.h,
    s: Math.max(10, hsl.s * 0.85),
    l: Math.min(95, hsl.l + 35),
  };

  const embossShadowHsl: HSL = {
    h: hsl.h,
    s: Math.min(100, hsl.s * 1.15),
    l: Math.max(4, hsl.l - 22),
  };

  return {
    base: baseHex,
    highlight: hslToHex(highlightHsl),
    shadow: hslToHex(shadowHsl),
    rim: hslToHex(rimHsl),
    deepShadow: hslToHex(deepShadowHsl),
    embossHighlight: hslToHex(embossHighlightHsl),
    embossShadow: hslToHex(embossShadowHsl),
  };
}
