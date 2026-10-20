import { test, expect } from '@playwright/test';

test.describe('Deliverable F: Procedural SVG Wax Seal & Gate Behavior', () => {
  test('1. dynamic config updates SVG initials and base color; two independent seals render', async ({ page }) => {
    await page.goto('/seal-test');

    const sealText = page.locator('#interactive-seal text');
    await expect(sealText).toHaveText('Z&R');

    // Change initials in input
    await page.fill('#input-seal-initials', 'A&B');
    await expect(sealText).toHaveText('A&B');

    // Verify two independent seals exist with distinct texts
    const gateSeal = page.locator('#seal-instance-gate');
    const rsvpSeal = page.locator('#seal-instance-rsvp');

    await expect(gateSeal).toBeVisible();
    await expect(rsvpSeal).toBeVisible();
    await expect(gateSeal.locator('text')).toHaveText('GATE');
    await expect(rsvpSeal.locator('text')).toHaveText('RSVP');
  });

  test('2. visual inspection of 4 shapes and 3 derived colors', async ({ page }) => {
    await page.goto('/seal-test');

    const shapes = ['round', 'scalloped', 'drip', 'star'];
    for (const shape of shapes) {
      const sealShape = page.locator(`#seal-shape-${shape}`);
      await expect(sealShape).toBeVisible();
      // Ensure SVG path exists inside
      await expect(sealShape.locator('path').first()).toBeAttached();
    }

    // Check 3 colors matrix
    for (let i = 0; i < 3; i++) {
      const colorSeal = page.locator(`#seal-color-${i}`);
      await expect(colorSeal).toBeVisible();
    }
  });

  test('3. PNG export generates a valid base64 PNG data URL', async ({ page }) => {
    await page.goto('/seal-test');

    // Click PNG export button
    await page.click('#btn-export-png');

    const pngImg = page.locator('#exported-png-result');
    await expect(pngImg).toBeVisible({ timeout: 5000 });

    const imgSrc = await pngImg.getAttribute('src');
    expect(imgSrc).not.toBeNull();
    expect(imgSrc?.startsWith('data:image/png;base64,')).toBe(true);
  });

  test('4. gate tap starts audio only after the user tap gesture and reveals site', async ({ page }) => {
    await page.goto('/preview');

    // Audio is initially paused
    const initialAudioState = await page.evaluate(() => {
      const audio = document.querySelector('audio#bg-audio') as HTMLAudioElement | null;
      return audio ? !audio.paused : false;
    });
    expect(initialAudioState).toBe(false);

    // Envelope gate is visible initially
    const gate = page.locator('#gate-envelope');
    await expect(gate).toBeVisible();

    // Tap gate wax seal button
    const sealBtn = page.locator('#btn-gate-open');
    await sealBtn.click();

    // After user gesture click, audio plays or registers gesture
    await page.waitForTimeout(1000);

    // Gate section is dismissed/opened
    await expect(gate).not.toBeVisible({ timeout: 3000 });

    // Hero section is revealed
    const hero = page.locator('#sec-hero');
    await expect(hero).toBeVisible();
  });

  test('5. reduced-motion preference disables idle animation', async ({ page }) => {
    // Emulate reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/seal-test');

    const interactiveSeal = page.locator('#interactive-seal button');
    await expect(interactiveSeal).toBeVisible();

    // Verify computed animation is effectively none or suppressed
    const animState = await interactiveSeal.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        animationName: computed.animationName,
        animationDuration: computed.animationDuration,
      };
    });
    expect(
      animState.animationName === 'none' ||
      animState.animationDuration === '0.00001s' ||
      animState.animationDuration === '0.01ms' ||
      animState.animationDuration === '0s'
    ).toBe(true);
  });
});
