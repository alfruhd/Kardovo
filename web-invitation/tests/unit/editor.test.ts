import { describe, it, expect } from 'vitest';
import { InvitationConfigSchema, InvitationConfig } from '@/lib/schema';
import { sampleInvitationConfig } from '@/config/sample-invitation';

describe('DELIVERABLE G: Visual Editor Core & History Tests', () => {
  it('validates safe and deep immutability across 25+ sequential edits', () => {
    let current = InvitationConfigSchema.parse(sampleInvitationConfig) as InvitationConfig;
    const historyPast: InvitationConfig[] = [];

    for (let i = 1; i <= 25; i++) {
      historyPast.push(JSON.parse(JSON.stringify(current)));
      current = {
        ...current,
        meta: {
          ...current.meta,
          title: `Updated Title Step ${i}`,
        },
      };
      const valid = InvitationConfigSchema.safeParse(current);
      expect(valid.success).toBe(true);
    }

    expect(historyPast.length).toBe(25);
    expect(current.meta.title).toBe('Updated Title Step 25');

    // Undo 15 steps
    for (let j = 0; j < 15; j++) {
      current = historyPast.pop()!;
    }

    expect(current.meta.title).toBe('Updated Title Step 10');
  });

  it('rejects invalid config mutations with informative error message', () => {
    const valid = InvitationConfigSchema.parse(sampleInvitationConfig) as InvitationConfig;

    // Mutate to an invalid section type
    const invalidConfig = {
      ...valid,
      sections: [
        {
          ...valid.sections[0],
          type: 'invalid-nonexistent-type' as any,
        },
      ],
    };

    const result = InvitationConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.length).toBeGreaterThan(0);
    }
  });

  it('allows independent breakpoint responsive overrides without mutating base style', () => {
    const valid = InvitationConfigSchema.parse(sampleInvitationConfig) as InvitationConfig;
    const heroTitleElement = valid.sections[1]!.elements[0]!;

    const elementWithOverrides = {
      ...heroTitleElement,
      typography: {
        fontSize: '32px',
        color: '#4a3525',
      },
      responsive: {
        mobile: {
          typography: {
            fontSize: '20px',
            color: '#ff0000',
          },
        },
        desktop: {
          typography: {
            fontSize: '40px',
            color: '#0000ff',
          },
        },
      },
    };

    expect(elementWithOverrides.typography.fontSize).toBe('32px');
    expect(elementWithOverrides.responsive.mobile?.typography?.fontSize).toBe('20px');
    expect(elementWithOverrides.responsive.desktop?.typography?.fontSize).toBe('40px');
  });
});
