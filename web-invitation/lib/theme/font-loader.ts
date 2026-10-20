import { Theme, ThemeInput, ThemeSchema, CustomFont } from '@/lib/schema';

/**
 * Standard system and web-safe fonts that do not require external Google Fonts stylesheet requests.
 */
const SYSTEM_FONTS = new Set([
  'system-ui',
  '-apple-system',
  'blinkmacsystemfont',
  'segoe ui',
  'roboto',
  'helvetica',
  'helvetica neue',
  'arial',
  'sans-serif',
  'serif',
  'georgia',
  'times new roman',
  'times',
  'monospace',
  'courier new',
]);

/**
 * Builds Google Fonts stylesheet URL for all fonts referenced in ThemeFonts
 */
export function buildGoogleFontsUrl(rawTheme: Theme | ThemeInput): string | null {
  const theme = ThemeSchema.parse(rawTheme);
  const fontFamilies = new Set<string>();

  const checkAndAdd = (fontName?: string) => {
    if (!fontName) return;
    const clean = fontName.trim().replace(/^['"]|['"]$/g, '');
    if (clean && !SYSTEM_FONTS.has(clean.toLowerCase())) {
      fontFamilies.add(clean);
    }
  };

  checkAndAdd(theme.fonts.display);
  checkAndAdd(theme.fonts.script);
  checkAndAdd(theme.fonts.heading);
  checkAndAdd(theme.fonts.body);
  checkAndAdd(theme.fonts.accent);
  checkAndAdd(theme.fonts.quote);

  if (fontFamilies.size === 0) {
    return null;
  }

  // Google Fonts CSS2 API: family=Cinzel:ital,wght@0,400..700;1,400..700
  const familyParams = Array.from(fontFamilies)
    .map((name) => `family=${encodeURIComponent(name).replace(/%20/g, '+')}:ital,wght@0,400;0,600;0,700;1,400`)
    .join('&');

  return `https://fonts.googleapis.com/css2?${familyParams}&display=swap`;
}

/**
 * Generates @font-face CSS rules for uploaded custom fonts
 */
export function buildCustomFontFaceCss(customFonts: CustomFont[] = []): string {
  if (!customFonts || customFonts.length === 0) {
    return '';
  }

  return customFonts
    .map(
      (font) => `
@font-face {
  font-family: '${font.fontFamily.replace(/'/g, "\\'")}';
  src: url('${font.src}') format('${font.format}');
  font-weight: ${font.fontWeight};
  font-style: ${font.fontStyle};
  font-display: swap;
}
`
    )
    .join('\n');
}

