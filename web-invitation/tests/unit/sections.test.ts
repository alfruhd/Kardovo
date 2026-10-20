import { describe, it, expect } from 'vitest';
import { calculateTimeRemaining, buildMapEmbedUrl, buildDirectionsUrl } from '@/lib/utils/section-helpers';
import { InvitationConfigSchema, SectionSchema } from '@/lib/schema';
import { sampleInvitationConfig } from '@/config/sample-invitation';

describe('DELIVERABLE E: Section Utilities & Configuration Logic', () => {
  describe('1. Countdown Timezone Math & Post-Event State', () => {
    it('accurately calculates remaining time before target date', () => {
      // 1 day, 2 hours, 3 minutes, 4 seconds into the future
      const targetDate = '2026-09-27T17:00:00Z';
      const fakeNow = new Date('2026-09-26T14:56:56Z'); // Exactly 26 hours, 3 minutes, 4 seconds earlier

      const remaining = calculateTimeRemaining(targetDate, fakeNow);

      expect(remaining.isCompleted).toBe(false);
      expect(remaining.days).toBe(1);
      expect(remaining.hours).toBe(2);
      expect(remaining.minutes).toBe(3);
      expect(remaining.seconds).toBe(4);
    });

    it('identifies post-event completed state when target date has passed', () => {
      const targetDate = '2026-09-27T17:00:00Z';
      const fakeNow = new Date('2026-09-28T12:00:00Z'); // 19 hours after event

      const remaining = calculateTimeRemaining(targetDate, fakeNow);

      expect(remaining.isCompleted).toBe(true);
      expect(remaining.days).toBe(0);
      expect(remaining.hours).toBe(0);
      expect(remaining.minutes).toBe(0);
      expect(remaining.seconds).toBe(0);
    });

    it('handles explicit timezone offsets consistently across UTC epochs', () => {
      // 5:00 PM London BST (UTC+1) is 2026-09-27T16:00:00Z
      const targetBst = '2026-09-27T17:00:00+01:00';
      const nowUtc = new Date('2026-09-27T15:00:00Z'); // 1 hour remaining before BST target

      const remaining = calculateTimeRemaining(targetBst, nowUtc);
      expect(remaining.isCompleted).toBe(false);
      expect(remaining.hours).toBe(1);
    });
  });

  describe('2. Map Embed & Navigation URL Generation', () => {
    it('generates valid Google Maps embed URL from address string', () => {
      const url = buildMapEmbedUrl({ address: 'Kew Gardens, London' });
      expect(url).toContain('maps.google.com/maps?q=');
      expect(url).toContain('output=embed');
    });

    it('generates valid Google Maps embed URL from lat/lng coordinates', () => {
      const url = buildMapEmbedUrl({ lat: 51.478, lng: -0.295 });
      expect(url).toBe('https://maps.google.com/maps?q=51.478,-0.295&hl=en&z=15&output=embed');
    });

    it('generates valid Google Maps directions URL from address and coordinates', () => {
      const dirAddress = buildDirectionsUrl({ address: 'Kew Gardens, London' });
      expect(dirAddress).toContain('destination=Kew%20Gardens');

      const dirCoords = buildDirectionsUrl({ lat: 51.478, lng: -0.295 });
      expect(dirCoords).toBe('https://www.google.com/maps/dir/?api=1&destination=51.478,-0.295');
    });
  });

  describe('3. Reordering, Hiding & Duplicating Sections', () => {
    it('reordering sections preserves valid schema structure without breaking layout', () => {
      const config = InvitationConfigSchema.parse(sampleInvitationConfig);
      const originalOrder = config.sections.map((s) => s.id);

      // Reorder: swap countdown and schedule
      const reordered = [...config.sections];
      const countdownIdx = reordered.findIndex((s) => s.type === 'countdown');
      const scheduleIdx = reordered.findIndex((s) => s.type === 'schedule');
      const temp = reordered[countdownIdx];
      reordered[countdownIdx] = reordered[scheduleIdx]!;
      reordered[scheduleIdx] = temp!;

      const parsedReordered = InvitationConfigSchema.safeParse({
        ...config,
        sections: reordered,
      });

      expect(parsedReordered.success).toBe(true);
      expect(reordered.map((s) => s.id)).not.toEqual(originalOrder);
    });

    it('hiding sections does not violate schema validation constraints', () => {
      const config = InvitationConfigSchema.parse(sampleInvitationConfig);

      // Hide all except 1 section
      const partiallyHidden = config.sections.map((s, idx) => ({
        ...s,
        visible: idx === 0,
      }));

      const parsed = InvitationConfigSchema.safeParse({
        ...config,
        sections: partiallyHidden,
      });

      expect(parsed.success).toBe(true);
    });

    it('duplicating a section generates a valid section entity', () => {
      const config = InvitationConfigSchema.parse(sampleInvitationConfig);
      const heroSection = config.sections.find((s) => s.type === 'hero');
      expect(heroSection).toBeDefined();
      if (!heroSection) return;

      const duplicate = SectionSchema.parse({
        ...heroSection,
        id: 'sec-hero-duplicate-1',
        name: 'Hero Section (Copy)',
      });

      expect(duplicate.id).toBe('sec-hero-duplicate-1');
      expect(duplicate.elements.length).toBe(heroSection.elements.length);
    });
  });
});
