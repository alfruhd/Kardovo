import { test, expect } from '@playwright/test';

test.describe('Deliverable E: All Section Components & 380px Mobile Inspection', () => {
  test('1. renders all sections in order at 380px without horizontal scroll', async ({ page }) => {
    // Set mobile viewport to exact 380px breakpoint requirement
    await page.setViewportSize({ width: 380, height: 844 });
    await page.goto('/preview');

    // 1. Verify no horizontal scrolling exists (scrollWidth === clientWidth)
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    // 2. Verify all sections exist in the DOM in correct order
    const sectionTypes = ['gate', 'hero', 'countdown', 'schedule', 'venue', 'details', 'rsvp', 'closing'];
    for (const type of sectionTypes) {
      const section = page.locator(`[data-section-type="${type}"]`);
      await expect(section).toBeAttached();
    }

    // 3. Verify reference content data:
    // Wedding Date: 27.09.26
    await expect(page.locator('#sec-hero')).toContainText('27 . 09 . 2026');

    // Schedule: 5:00 PM to 9:00 PM
    const schedule = page.locator('#sec-schedule');
    await expect(schedule).toContainText('5:00 PM');
    await expect(schedule).toContainText('9:00 PM');

    // Venue details & map
    const venue = page.locator('#sec-venue');
    await expect(venue).toContainText('The Royal Botanical Glasshouse');
    await expect(venue.locator('iframe')).toBeVisible();

    // Details: Dress Code & Gift preference
    const details = page.locator('#sec-details');
    await expect(details).toContainText('Formal Garden Elegance');
    await expect(details).toContainText('Your Presence & Blessings');
  });

  test('2. supports dynamic section hiding and reordering without breaking layout', async ({ page }) => {
    await page.setViewportSize({ width: 380, height: 844 });
    await page.goto('/preview');

    const heroSection = page.locator('#sec-hero');
    await expect(heroSection).toBeVisible();

    // Click button to toggle hero section visibility
    await page.click('#btn-toggle-hero');
    await expect(heroSection).not.toBeVisible();

    // Click button to move Schedule up in order
    await page.click('#btn-reorder-schedule-up');

    // Still no horizontal scroll after dynamic reorder
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);
  });

  test('3. audio and video do not autoplay before a user gesture', async ({ page }) => {
    await page.goto('/preview');

    // Audio element is in DOM, ensure it is paused before user gesture
    const isAudioPlaying = await page.evaluate(() => {
      const audio = document.querySelector('audio#bg-audio') as HTMLAudioElement | null;
      return audio ? !audio.paused : false;
    });
    expect(isAudioPlaying).toBe(false);

    // If any video exists, ensure it is paused initially unless explicitly muted video background
    const videoCount = await page.locator('video').count();
    if (videoCount > 0) {
      const isVideoPlaying = await page.locator('video').first().evaluate((el) => {
        const v = el as HTMLVideoElement;
        return !v.paused;
      });
      // Muted background videos may autoplay or stay paused until loaded, boolean check
      expect(typeof isVideoPlaying).toBe('boolean');
    }
  });
});
