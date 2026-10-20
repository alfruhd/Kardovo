import { ThemeInput } from '@/lib/schema';

/**
 * 5 curated preset themes for luxury digital invitations.
 */
export const PRESET_THEMES: Record<string, ThemeInput> = {
  // 1. The Sacred Garden (Reference Design: Ivory, Antique Gold, Deep Burgundy & Warm Earth)
  sacredGarden: {
    baseColor: '#5a0f1b',
    colors: {
      background: '#f9f0e0',
      surface: '#ffffff',
      primary: '#a67d2b',
      secondary: '#6c513f',
      accent: '#5a0f1b',
      text: '#4a3525',
      muted: '#8c7666',
      border: 'rgba(166, 125, 43, 0.25)',
      ring: '#a67d2b',
    },
    fonts: {
      display: 'Cinzel',
      script: 'Cinzel Decorative',
      heading: 'Cinzel',
      body: 'system-ui',
      accent: 'Cinzel Decorative',
      quote: 'Cormorant Garamond',
    },
    spacingUnitPx: 4,
    defaultRadius: '16px',
    defaultContainerMaxWidth: '460px',
  },

  // 2. Midnight Celestial (Starlit Navy, Champange Gold & Silver Mist)
  midnightCelestial: {
    baseColor: '#0d1b2a',
    colors: {
      background: '#0b1320',
      surface: '#152238',
      primary: '#d4af37',
      secondary: '#8a9ba8',
      accent: '#e0c068',
      text: '#f0f4f8',
      muted: '#8a9ba8',
      border: 'rgba(212, 175, 55, 0.28)',
      ring: '#d4af37',
    },
    fonts: {
      display: 'Playfair Display',
      script: 'Great Vibes',
      heading: 'Playfair Display',
      body: 'system-ui',
      accent: 'Great Vibes',
      quote: 'Playfair Display',
    },
    spacingUnitPx: 4,
    defaultRadius: '20px',
    defaultContainerMaxWidth: '460px',
  },

  // 3. Tuscan Olive & Linen (Earthy Terracotta, Olive Green & Organic Linen)
  tuscanOlive: {
    baseColor: '#556b2f',
    colors: {
      background: '#f7f5f0',
      surface: '#ffffff',
      primary: '#556b2f',
      secondary: '#8c6239',
      accent: '#c05621',
      text: '#2e3828',
      muted: '#7a8372',
      border: 'rgba(85, 107, 47, 0.2)',
      ring: '#556b2f',
    },
    fonts: {
      display: 'Cormorant Garamond',
      script: 'Alex Brush',
      heading: 'Cormorant Garamond',
      body: 'system-ui',
      accent: 'Alex Brush',
      quote: 'Cormorant Garamond',
    },
    spacingUnitPx: 4,
    defaultRadius: '14px',
    defaultContainerMaxWidth: '460px',
  },

  // 4. Rose Quartz & Pearl (Blush Rose, Soft Copper & Pearl White)
  roseQuartz: {
    baseColor: '#b76e79',
    colors: {
      background: '#faf4f4',
      surface: '#ffffff',
      primary: '#b76e79',
      secondary: '#735055',
      accent: '#d47a88',
      text: '#4a3237',
      muted: '#9c8286',
      border: 'rgba(183, 110, 121, 0.25)',
      ring: '#b76e79',
    },
    fonts: {
      display: 'Bodoni Moda',
      script: 'Pinyon Script',
      heading: 'Bodoni Moda',
      body: 'system-ui',
      accent: 'Pinyon Script',
      quote: 'Bodoni Moda',
    },
    spacingUnitPx: 4,
    defaultRadius: '24px',
    defaultContainerMaxWidth: '460px',
  },

  // 5. Royal Emerald & Gold (Regal Dark Emerald, Gilded Brass & Crisp Cream)
  royalEmerald: {
    baseColor: '#0b3d2e',
    colors: {
      background: '#f4f7f5',
      surface: '#ffffff',
      primary: '#0b3d2e',
      secondary: '#b89758',
      accent: '#c5a059',
      text: '#142a22',
      muted: '#5c7268',
      border: 'rgba(184, 151, 88, 0.3)',
      ring: '#c5a059',
    },
    fonts: {
      display: 'Marcellus',
      script: 'Italianno',
      heading: 'Marcellus',
      body: 'system-ui',
      accent: 'Italianno',
      quote: 'Marcellus',
    },
    spacingUnitPx: 4,
    defaultRadius: '12px',
    defaultContainerMaxWidth: '460px',
  },
};

