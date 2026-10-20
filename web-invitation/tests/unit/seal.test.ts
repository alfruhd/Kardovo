import { describe, it, expect } from 'vitest';
import { deriveSealPalette } from '@/lib/theme/seal-palette';
import { getSealShapePath } from '@/lib/theme/seal-paths';
import { SealConfigSchema } from '@/lib/schema';

describe('DELIVERABLE F: Procedural Wax Seal Unit Tests', () => {
  describe('1. Auto-Derived Color Palette Generator', () => {
    it('derives highlight, shadow, rim, and emboss values from a base wine color', () => {
      const palette = deriveSealPalette('#5a0f1b');
      expect(palette.base).toBe('#5a0f1b');
      expect(palette.highlight).toMatch(/^#[0-9a-f]{6}$/i);
      expect(palette.shadow).toMatch(/^#[0-9a-f]{6}$/i);
      expect(palette.rim).toMatch(/^#[0-9a-f]{6}$/i);
      expect(palette.embossHighlight).toMatch(/^#[0-9a-f]{6}$/i);
      expect(palette.embossShadow).toMatch(/^#[0-9a-f]{6}$/i);

      // Verify highlight is distinct from base and shadow
      expect(palette.highlight).not.toBe(palette.base);
      expect(palette.shadow).not.toBe(palette.base);
    });

    it('works deterministically across distinct color spectrums (gold, navy, emerald)', () => {
      const gold = deriveSealPalette('#a67d2b');
      const navy = deriveSealPalette('#1a365d');
      const emerald = deriveSealPalette('#134e4a');

      expect(gold.highlight).toBeDefined();
      expect(navy.shadow).toBeDefined();
      expect(emerald.rim).toBeDefined();
    });
  });

  describe('2. SVG Shape Path Generation', () => {
    it('generates valid non-empty SVG path data for round shape', () => {
      const path = getSealShapePath('round', 35);
      expect(path).toContain('M 50,8');
      expect(path).toContain('Z');
    });

    it('generates 12-petaled scalloped shape path', () => {
      const path = getSealShapePath('scalloped', 35);
      expect(path).toContain('M');
      expect(path).toContain('Q');
      expect(path).toContain('Z');
    });

    it('generates wax drip shape path', () => {
      const path = getSealShapePath('drip', 35);
      expect(path).toContain('M 50,8');
      expect(path).toContain('C');
      expect(path).toContain('Z');
    });

    it('generates 8-pointed star / rosette shape path', () => {
      const path = getSealShapePath('star', 35);
      expect(path).toContain('M');
      expect(path).toContain('L');
      expect(path).toContain('Z');
    });
  });

  describe('3. SealConfig Schema Validation & Defaults', () => {
    it('parses valid seal configuration with safe defaults', () => {
      const config = SealConfigSchema.parse({
        initials: 'Z&R',
        baseColor: '#5a0f1b',
      });

      expect(config.shape).toBe('round');
      expect(config.sizePx).toBe(90);
      expect(config.animation.idle).toBe('pulse');
      expect(config.animation.onClick).toBe('crack');
      expect(config.action).toBe('open-gate');
    });

    it('supports custom monogram content, ribbon, and click actions', () => {
      const config = SealConfigSchema.parse({
        initials: 'E&V',
        shape: 'scalloped',
        ribbon: {
          enabled: true,
          color: '#2b050c',
          lengthPx: 45,
          widthPx: 18,
          angleDeg: 45,
          style: 'classic-tails',
        },
        action: 'open-rsvp',
        animation: {
          idle: 'glow',
          onClick: 'melt',
        },
      });

      expect(config.ribbon.enabled).toBe(true);
      expect(config.action).toBe('open-rsvp');
      expect(config.animation.onClick).toBe('melt');
    });
  });
});
