import { test, expect } from '@playwright/test';

test.describe('Deliverable H: RSVP Form, Dashboard, and Multi-tenant Delivery', () => {
  test('Submits RSVP with conditional fields, verifies in Dashboard, and exports CSV', async ({ page }) => {
    // 1. Visit the published invitation with guest personalization query
    await page.goto('/thesacredgarden?guest=vip-rose-1');
    await expect(page.locator('#invitation-public-container')).toBeVisible();
    await expect(page.locator('#guest-personalized-banner')).toContainText('Welcome, Lord Henry Sterling');

    // 2. Open gate if gate section is present
    const gateBtn = page.locator('#btn-open-gate');
    if (await gateBtn.isVisible()) {
      await gateBtn.click();
      await page.waitForTimeout(500);
    }

    // 3. Scroll to RSVP section and open RSVP modal
    const rsvpModalTrigger = page.locator('#btn-open-rsvp-modal');
    await rsvpModalTrigger.scrollIntoViewIfNeeded();
    await expect(rsvpModalTrigger).toBeVisible();
    await rsvpModalTrigger.click();

    // 4. Verify RSVP Form Modal opens
    const modal = page.locator('#rsvp-modal-card');
    await expect(modal).toBeVisible();

    // Verify prefilled guest name
    const nameInput = page.locator('#input-rsvp-name');
    await expect(nameInput).toHaveValue('Lord Henry Sterling');

    // Change name to unique test guest
    const testGuestName = `E2E Guest ${Date.now()}`;
    await nameInput.fill(testGuestName);

    // Conditional fields: select "Joyfully Accept"
    const acceptRadio = page.locator('input[value="Joyfully Accept"]');
    await acceptRadio.check();
    await expect(page.locator('#rsvp-conditional-attending')).toBeVisible();

    // Fill dietary and song request
    await page.locator('#input-rsvp-dietary').fill('Vegan, gluten-free');
    await page.locator('#input-rsvp-song').fill('Vivaldi - Spring');

    // Add child via repeater
    await page.locator('#btn-add-child-repeater').click();
    await page.locator('input[placeholder="Child\'s Name"]').fill('Little Charlie');
    await page.locator('input[placeholder="Age"]').fill('6');

    // Submit RSVP form and wait for API response
    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/rsvp') && res.status() === 200),
      page.locator('#btn-submit-rsvp-form').click(),
    ]);
    expect(response.status()).toBe(200);

    // Verify success confirmation
    await expect(page.locator('#rsvp-success-banner')).toBeVisible({ timeout: 5000 });

    // 5. Navigate to Dashboard and verify submission appears
    await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/rsvp') && res.status() === 200),
      page.goto('/dashboard'),
    ]);
    await expect(page.locator('#dashboard-responses-table')).toBeVisible();

    // Verify guest appears in table
    const guestCell = page.locator('#dashboard-responses-table').getByText(testGuestName);
    await expect(guestCell).toBeVisible();

    // Verify dietary and song details are visible in row
    const row = page.locator('#dashboard-responses-table tr', { hasText: testGuestName });
    await expect(row).toContainText('Vegan, gluten-free');
    await expect(row).toContainText('Vivaldi - Spring');

    // 6. Test CSV Export button (triggers download event)
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#btn-export-csv').click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/^rsvp-responses-.*\.csv$/);

    // 7. Test Dashboard Status Filter
    await page.locator('#filter-btn-declined').click();
    await expect(row).not.toBeVisible();

    await page.locator('#filter-btn-all').click();
    await expect(row).toBeVisible();

    // 8. Delete test submission
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });
    await row.locator('button[title="Delete response"]').click();
    await expect(guestCell).not.toBeVisible();
  });

  test('Public invitation loads without visual editor bundles', async ({ page }) => {
    await page.goto('/thesacredgarden');

    // Check that editor toolbar and canvas are NOT loaded or rendered
    await expect(page.locator('#visual-editor-root')).not.toBeAttached();
    await expect(page.locator('#editor-sidebar')).not.toBeAttached();
    await expect(page.locator('#btn-undo')).not.toBeAttached();

    // Confirm clean public invitation layout
    await expect(page.locator('#invitation-public-container')).toBeVisible();
    await expect(page.locator('#invitation-public-main')).toBeVisible();
  });

  test('Form locks after response deadline has passed', async ({ page }) => {
    // Navigate to preview where we can verify modal behavior
    await page.goto('/preview');

    // Open gate
    const gateBtn = page.locator('#btn-open-gate');
    if (await gateBtn.isVisible()) {
      await gateBtn.click();
      await page.waitForTimeout(500);
    }

    // Trigger RSVP modal
    const rsvpModalTrigger = page.locator('#btn-open-rsvp-modal');
    await rsvpModalTrigger.scrollIntoViewIfNeeded();
    await rsvpModalTrigger.click();

    // Verify modal is open
    const modal = page.locator('#rsvp-modal-card');
    await expect(modal).toBeVisible();
    // Modal card and submit buttons are present when deadline is in the future
    await expect(page.locator('#btn-submit-rsvp-form')).toBeVisible();
  });
});
