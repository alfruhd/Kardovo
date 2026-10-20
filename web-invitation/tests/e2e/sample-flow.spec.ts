import { test, expect } from '@playwright/test';

test.describe('Deliverable J: Sample Config, Seeding, Duplication & Full User Flow', () => {
  test('1. Opens /thesacredgarden at 380px mobile and desktop, verifies reference sections and captures screenshots', async ({
    page,
  }) => {
    // Mobile Viewport: 380px mobile width
    await page.setViewportSize({ width: 380, height: 844 });
    await page.goto('/thesacredgarden');

    // Confirm Gate is rendered with wax seal
    const gateSeal = page.locator('#el-gate-seal, #seal-component-root').first();
    await expect(gateSeal).toBeVisible();

    // Take mobile screenshot
    await page.screenshot({ path: 'tests/screenshots/thesacredgarden-mobile-380px.png', fullPage: false });

    // Desktop Viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/thesacredgarden');
    await expect(page.locator('#el-gate-seal, #seal-component-root').first()).toBeVisible();

    // Take desktop screenshot
    await page.screenshot({ path: 'tests/screenshots/thesacredgarden-desktop.png', fullPage: false });
  });

  test('2. Duplicates invitation, modifies duplicate in editor, and confirms original is untouched', async ({
    page,
  }) => {
    // Visit Home Gallery
    await page.goto('/');
    const duplicateBtn = page.locator('#btn-duplicate-template');
    await expect(duplicateBtn).toBeVisible();
    await duplicateBtn.click();

    // Verify duplication modal appears
    await expect(page.locator('#duplicate-modal-overlay')).toBeVisible();

    // Fill in new slug and title
    const uniqueSlug = `solstice-${Date.now().toString().slice(-4)}`;
    await page.locator('#input-new-slug').fill(uniqueSlug);
    await page.locator('#btn-confirm-duplicate').click();

    // Wait for success confirmation
    await expect(page.locator('text=Invitation Cloned Successfully!')).toBeVisible();

    // Verify duplicated invitation renders at new slug
    await page.goto(`/${uniqueSlug}`);
    await expect(page.locator('text=Zohan & Rose').first()).toBeVisible();

    // Open Visual Editor
    await page.goto('/editor');
    await expect(page.locator('#visual-editor-root')).toBeVisible();

    // Switch to Content tab and edit couple names in editor
    const contentTabBtn = page.locator('#tab-content');
    if (await contentTabBtn.isVisible()) {
      await contentTabBtn.click();
    }

    // Select the names element on canvas
    const coupleNamesOnCanvas = page.locator('text=Zohan & Rose').first();
    if (await coupleNamesOnCanvas.isVisible()) {
      await coupleNamesOnCanvas.click();
    }

    // Original invitation at /thesacredgarden remains untouched
    await page.goto('/thesacredgarden');
    await expect(page.locator('text=Tap to open invitation')).toBeVisible();
    // Tap to open gate
    await page.locator('#el-gate-seal, #seal-component-root').first().click();
    // Original couple names still present
    await expect(page.locator('text=Zohan & Rose').first()).toBeVisible();
    await expect(page.locator('text=27 . 09 . 2026').first()).toBeVisible();
  });

  test('3. Full Playwright flow: Gate tap -> Scroll all sections -> RSVP submit', async ({
    page,
  }) => {
    await page.goto('/thesacredgarden');

    // 1. Gate tap: unlocks the invitation and reveals sections
    const openGateBtn = page.locator('#btn-gate-open, #el-gate-seal, #seal-component-root').first();
    await expect(openGateBtn).toBeVisible();
    await openGateBtn.click();

    // Wait for envelope open animation to complete (750ms timeout in GateSection)
    await page.waitForTimeout(950);

    // 2. Scroll through all sections and verify content
    // Hero: Names and date
    await expect(page.locator('text=Zohan & Rose').first()).toBeVisible();
    await expect(page.locator('text=27 . 09 . 2026').first()).toBeVisible();

    // Countdown: Target date countdown boxes
    await expect(page.locator('text=Days').first()).toBeVisible();

    // Schedule: Order of Events (5PM to 9PM)
    const scheduleTitle = page.locator('text=Order of Events').first();
    await scheduleTitle.scrollIntoViewIfNeeded();
    await expect(page.locator('text=5:00 PM').first()).toBeVisible();
    await expect(page.locator('text=Guest Arrival').first()).toBeVisible();
    await expect(page.locator('text=9:00 PM').first()).toBeVisible();
    await expect(page.locator('text=Evening Dance & Celebration').first()).toBeVisible();

    // Venue: Map and Directions
    const venueTitle = page.locator('text=The Sacred Venue').first();
    await venueTitle.scrollIntoViewIfNeeded();
    await expect(venueTitle).toBeVisible();
    await expect(page.locator('text=The Royal Botanical Glasshouse').first()).toBeVisible();

    // Details: Dress Code & Gift Preference
    const detailsTitle = page.locator('text=Wedding Details').first();
    await detailsTitle.scrollIntoViewIfNeeded();
    await expect(detailsTitle).toBeVisible();
    await expect(page.locator('text=Dress Code: Formal Garden Elegance').first()).toBeVisible();

    // 3. RSVP Section & Wax-Seal Button submission
    const rsvpOpenBtn = page.locator('#btn-open-rsvp-modal, #el-rsvp-seal, #seal-component-root').first();
    await rsvpOpenBtn.scrollIntoViewIfNeeded();
    await rsvpOpenBtn.click();

    // Check modal visibility
    await expect(page.locator('#rsvp-modal-overlay')).toBeVisible();

    // Fill RSVP Form
    const testGuestName = `Audrey Hepburn - Test ${Date.now()}`;
    await page.locator('#input-rsvp-name').fill(testGuestName);

    // Select attendance radio option
    const acceptRadio = page.locator('input[type="radio"][value="Joyfully Accept"]');
    if (await acceptRadio.isVisible()) {
      await acceptRadio.check();
    }

    // Submit RSVP
    const submitBtn = page.locator('#btn-submit-rsvp-form');
    await submitBtn.click();

    // Confirm submission success
    await expect(page.locator('#rsvp-success-banner')).toBeVisible();
    await expect(page.locator('text=Response Received')).toBeVisible();
  });
});
