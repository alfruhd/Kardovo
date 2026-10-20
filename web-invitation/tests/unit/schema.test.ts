import { describe, it, expect } from 'vitest';
import {
  InvitationConfigSchema,
  ThemeSchema,
  SectionSchema,
  ElementSchema,
  parseInvitation,
  resolveStyle,
  Theme,
  Section,
  Element,
} from '@/lib/schema';
import { sampleInvitationConfig } from '@/config/sample-invitation';

describe('DELIVERABLE B: Zod Schemas & Types', () => {
  describe('1. Valid Configuration Parsing', () => {
    it('successfully parses and validates the comprehensive sampleInvitationConfig', () => {
      const parsed = InvitationConfigSchema.safeParse(sampleInvitationConfig);
      expect(parsed.success).toBe(true);
      if (!parsed.success) {
        throw new Error(JSON.stringify(parsed.error.format()));
      }
      expect(parsed.data.version).toBe('1.0.0');
      expect(parsed.data.sections.length).toBe(8);
    });

    it('parseInvitation helper returns success with clean typed data', () => {
      const result = parseInvitation(sampleInvitationConfig);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.meta.slug).toBe('thesacredgarden');
        expect(result.data.theme.colors.primary).toBe('#a67d2b');
      }
    });
  });

  describe('2. Negative Tests: 10+ Invalid Configurations Fail with Clear Errors', () => {
    it('fails when slug contains uppercase characters or invalid characters', () => {
      const invalid = {
        ...sampleInvitationConfig,
        meta: { ...sampleInvitationConfig.meta, slug: 'Invalid_Slug_With_Upper!' },
      };
      const result = parseInvitation(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.formattedErrors.some((e) => e.includes('Slug must only contain lowercase'))).toBe(true);
      }
    });

    it('fails when title is empty', () => {
      const invalid = {
        ...sampleInvitationConfig,
        meta: { ...sampleInvitationConfig.meta, title: '' },
      };
      const result = parseInvitation(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.formattedErrors.some((e) => e.includes('Title is required'))).toBe(true);
      }
    });

    it('fails when required theme colors are missing', () => {
      const invalid = {
        ...sampleInvitationConfig,
        theme: {
          ...sampleInvitationConfig.theme,
          colors: { ...sampleInvitationConfig.theme.colors, primary: '' },
        },
      };
      const result = parseInvitation(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.formattedErrors.some((e) => e.includes('Primary color is required'))).toBe(true);
      }
    });

    it('fails when image element is missing an alt tag (strict accessibility requirement)', () => {
      const invalid = JSON.parse(JSON.stringify(sampleInvitationConfig));
      const closingSection = invalid.sections.find((s: { type: string }) => s.type === 'closing');
      const photoElement = closingSection.elements.find((e: { content: { type: string } }) => e.content.type === 'image');
      photoElement.content.alt = ''; // Empty alt violates schema

      const result = parseInvitation(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.formattedErrors.some((e) => e.includes('Alt text is required'))).toBe(true);
      }
    });

    it('fails when image element URL is invalid', () => {
      const invalid = JSON.parse(JSON.stringify(sampleInvitationConfig));
      const closingSection = invalid.sections.find((s: { type: string }) => s.type === 'closing');
      const photoElement = closingSection.elements.find((e: { content: { type: string } }) => e.content.type === 'image');
      photoElement.content.url = 'not-a-valid-url';

      const result = parseInvitation(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.formattedErrors.some((e) => e.includes('Image requires a valid URL'))).toBe(true);
      }
    });

    it('fails when countdown targetDate is not a valid ISO-8601 datetime', () => {
      const invalid = JSON.parse(JSON.stringify(sampleInvitationConfig));
      const countdownSection = invalid.sections.find((s: { type: string }) => s.type === 'countdown');
      countdownSection.elements[0].content.targetDate = '2026/09/27 tomorrow';

      const result = parseInvitation(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.formattedErrors.some((e) => e.includes('Target date must be a valid ISO-8601'))).toBe(true);
      }
    });

    it('fails when schedule has zero items', () => {
      const invalid = JSON.parse(JSON.stringify(sampleInvitationConfig));
      const schedSection = invalid.sections.find((s: { type: string }) => s.type === 'schedule');
      const schedElement = schedSection.elements.find((e: { content: { type: string } }) => e.content.type === 'schedule');
      schedElement.content.items = [];

      const result = parseInvitation(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.formattedErrors.some((e) => e.includes('Schedule requires at least one item'))).toBe(true);
      }
    });

    it('fails when map element embedUrl is invalid', () => {
      const invalid = JSON.parse(JSON.stringify(sampleInvitationConfig));
      const venueSection = invalid.sections.find((s: { type: string }) => s.type === 'venue');
      const mapElement = venueSection.elements.find((e: { content: { type: string } }) => e.content.type === 'map');
      mapElement.content.embedUrl = 'not-a-url';

      const result = parseInvitation(invalid);
      expect(result.success).toBe(false);
    });

    it('fails when button label is empty', () => {
      const invalid = JSON.parse(JSON.stringify(sampleInvitationConfig));
      invalid.sections[0].elements.push({
        id: 'bad-btn',
        content: {
          type: 'button',
          label: '',
          action: 'open-rsvp',
        },
      });

      const result = parseInvitation(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.formattedErrors.some((e) => e.includes('Button label is required'))).toBe(true);
      }
    });

    it('fails when section type is not an allowed SectionType', () => {
      const invalid = JSON.parse(JSON.stringify(sampleInvitationConfig));
      invalid.sections[0].type = 'unsupported-custom-widget';

      const result = parseInvitation(invalid);
      expect(result.success).toBe(false);
    });

    it('fails when sections array is completely empty', () => {
      const invalid = {
        ...sampleInvitationConfig,
        sections: [],
      };
      const result = parseInvitation(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.formattedErrors.some((e) => e.includes('Invitation must have at least one section'))).toBe(true);
      }
    });

    it('fails when seal roughness exceeds 100', () => {
      const invalid = JSON.parse(JSON.stringify(sampleInvitationConfig));
      invalid.sections[0].elements.push({
        id: 'test-seal-element',
        content: {
          type: 'seal',
          seal: {
            initials: 'Z&R',
            roughness: 150, // exceeds max 100
          },
        },
      });

      const result = parseInvitation(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('3. Style Cascade Tests (resolveStyle)', () => {
    const baseTheme: Theme = ThemeSchema.parse({
      colors: {
        background: '#f9f0e0',
        surface: '#ffffff',
        primary: '#a67d2b',
        secondary: '#6c513f',
        accent: '#5a0f1b',
        text: '#111111',
        muted: '#888888',
        border: '#cccccc',
      },
      fonts: {
        heading: 'Cinzel',
        body: 'Inter',
        accent: 'Cinzel Decorative',
      },
      spacingUnitPx: 4,
      defaultRadius: '16px',
      defaultContainerMaxWidth: '460px',
      typography: {
        fontSize: '16px',
        color: '#111111',
      },
      style: {
        padding: '20px',
        backgroundColor: '#ffffff',
      },
    });

    const section: Section = SectionSchema.parse({
      id: 'test-section',
      type: 'hero',
      name: 'Test Hero',
      visible: true,
      order: 1,
      backgroundMedia: {
        type: 'none',
        url: '',
        posterUrl: '',
        overlayColor: 'transparent',
        opacity: 1,
        blurPx: 0,
      },
      elements: [],
      typography: {
        color: '#222222',
        fontSize: '18px',
      },
      box: {
        padding: '30px',
      },
      responsive: {
        mobile: {
          typography: {
            fontSize: '17px',
          },
          box: {
            padding: '15px',
          },
        },
      },
    });

    const element: Element = ElementSchema.parse({
      id: 'test-el',
      name: 'Test Element',
      content: {
        type: 'text',
        text: 'Hello World',
        tag: 'h1',
      },
      visible: true,
      locked: false,
      transform: {
        rotateDeg: 0,
        scale: 1,
        translateX: '0px',
        translateY: '0px',
      },
      animation: {
        preset: 'fade-up',
        durationSec: 0.8,
        delaySec: 0,
        easing: 'power2.out',
        scrollTrigger: true,
        triggerOffset: 'top 85%',
        once: true,
      },
      typography: {
        color: '#333333', // overrides section and theme
      },
      box: {
        padding: '40px',
      },
      responsive: {
        mobile: {
          typography: {
            color: '#ff0000', // mobile element override
          },
          transform: {
            scale: 0.9,
          },
        },
      },
    });

    it('level 1: theme defaults apply when no section or element is given', () => {
      const style = resolveStyle(baseTheme, null, null);
      expect(style.typography.fontFamily).toBe('Inter');
      expect(style.typography.fontSize).toBe('16px');
      expect(style.typography.color).toBe('#111111');
      expect(style.box.padding).toBe('20px');
      expect(style.box.backgroundColor).toBe('#ffffff');
    });

    it('level 2: section overrides theme', () => {
      const style = resolveStyle(baseTheme, section, null);
      // Section overrides color and fontSize and padding
      expect(style.typography.color).toBe('#222222');
      expect(style.typography.fontSize).toBe('18px');
      expect(style.box.padding).toBe('30px');
      // Still inherits backgroundColor from theme
      expect(style.box.backgroundColor).toBe('#ffffff');
    });

    it('level 3: element overrides section and theme', () => {
      const style = resolveStyle(baseTheme, section, element);
      // Element explicitly set color: '#333333' and padding: '40px'
      expect(style.typography.color).toBe('#333333');
      expect(style.box.padding).toBe('40px');
      // Element did not set fontSize, so it inherits section fontSize ('18px')
      expect(style.typography.fontSize).toBe('18px');
      // Element and section did not set backgroundColor, so inherits theme ('#ffffff')
      expect(style.box.backgroundColor).toBe('#ffffff');
    });

    it('level 4: breakpoint overrides apply properly at mobile', () => {
      const style = resolveStyle(baseTheme, section, element, 'mobile');
      // Mobile element override sets color to #ff0000
      expect(style.typography.color).toBe('#ff0000');
      // Mobile element override sets scale to 0.9
      expect(style.transform.scale).toBe(0.9);
      // Section mobile set fontSize to 17px
      expect(style.typography.fontSize).toBe('17px');
      // Element padding ('40px') wins over section mobile padding ('15px')
      expect(style.box.padding).toBe('40px');
    });

    it('preserves visibility hierarchy (e.g. element hidden on mobile)', () => {
      const hiddenOnMobileElement: Element = {
        ...element,
        responsive: {
          mobile: {
            visible: false,
          },
        },
      };

      const desktopStyle = resolveStyle(baseTheme, section, hiddenOnMobileElement, 'desktop');
      expect(desktopStyle.visible).toBe(true);

      const mobileStyle = resolveStyle(baseTheme, section, hiddenOnMobileElement, 'mobile');
      expect(mobileStyle.visible).toBe(false);
    });
  });
});
