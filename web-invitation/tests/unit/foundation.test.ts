import { describe, it, expect } from 'vitest';
import { InvitationConfigSchema } from '@/lib/schema/invitation.schema';
import { sampleInvitationConfig } from '@/config/sample-invitation';
import { derivePaletteFromBase } from '@/lib/theme/palette';

describe('Deliverable A Foundation Verification', () => {
  it('validates sample invitation against Zod schema', () => {
    const result = InvitationConfigSchema.safeParse(sampleInvitationConfig);
    expect(result.success).toBe(true);
  });

  it('generates consistent palette from base color', () => {
    const palette = derivePaletteFromBase('#B48C3D');
    expect(palette.primary).toBe('#B48C3D');
    expect(palette.background).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(palette.border).toContain('#B48C3D');
  });
});
