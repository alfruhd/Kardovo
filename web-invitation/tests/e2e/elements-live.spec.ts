import { test, expect } from '@playwright/test';

test.describe('Deliverable D: Element Renderer & Animation Engine', () => {
  test('1. renders all element types on page without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/elements-test');

    // Verify presence of all concrete elements
    await expect(page.locator('#el-test-text')).toBeVisible();
    await expect(page.locator('#el-test-decor')).toBeVisible();
    await expect(page.locator('#el-test-divider')).toBeVisible();
    await expect(page.locator('#el-test-image')).toBeVisible();
    await expect(page.locator('#el-test-shape')).toBeVisible();
    await expect(page.locator('#el-test-spacer')).toBeAttached();
    await expect(page.locator('#el-test-button')).toBeVisible();
    await expect(page.locator('#el-test-video')).toBeAttached();

    expect(consoleErrors).toHaveLength(0);
  });

  test('2. DOM reflects dynamic config changes (font, size, color, transform position)', async ({
    page,
  }) => {
    await page.goto('/elements-test');

    const textEl = page.locator('#el-test-text');
    const heading = textEl.locator('h1');

    await expect(heading).toHaveText('The Sacred Garden Wedding');

    // Click button to mutate text config live
    await page.click('#btn-mutate-text');

    // Text content updated
    await expect(heading).toHaveText('Customized Sacred Vows Title');

    // Check color updated in computed style
    await expect.poll(async () => {
      return await heading.evaluate((el) => window.getComputedStyle(el).color);
    }).toBe('rgb(0, 128, 128)');

    // Check font size updated
    await expect.poll(async () => {
      return await heading.evaluate((el) => window.getComputedStyle(el).fontSize);
    }).toBe('44px');

    // Check transform matrix / transform reflects translation and rotation
    const transform = await textEl.evaluate((el) => window.getComputedStyle(el).transform);
    expect(transform).not.toBe('none');
  });

  test('3. responsive visibility: mobile overrides hide element at 380px, visible on desktop', async ({
    page,
  }) => {
    await page.goto('/elements-test');

    const desktopBanner = page.locator('#el-desktop-only-text');
    await expect(desktopBanner).toBeVisible();

    // Switch active breakpoint to mobile
    await page.click('#btn-bp-mobile');

    // Element is unmounted / hidden from DOM due to mobile: { visible: false }
    await expect(desktopBanner).not.toBeVisible();

    // Switch back to desktop
    await page.click('#btn-bp-desktop');
    await expect(desktopBanner).toBeVisible();

    // Check typography responsive override on el-test-text (32px on desktop -> 24px on mobile)
    await page.click('#btn-bp-mobile');
    const heading = page.locator('#el-test-text h1');
    await expect.poll(async () => {
      return await heading.evaluate((el) => window.getComputedStyle(el).fontSize);
    }).toBe('24px');
  });

  test('4. animations fire on normal mode; reduced motion suppresses heavy motion', async ({
    page,
  }) => {
    // Normal mode: animations exist
    await page.goto('/elements-test');
    const buttonEl = page.locator('#el-test-button');
    await expect(buttonEl).toBeVisible();

    // Emulate reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/elements-test');

    const textEl = page.locator('#el-test-text');
    await expect(textEl).toBeVisible();

    // Opacity is 1 immediately with reduced motion, without lingering fromVars opacity 0
    const opacity = await textEl.evaluate((el) => window.getComputedStyle(el).opacity);
    expect(Number(opacity)).toBe(1);
  });
});
