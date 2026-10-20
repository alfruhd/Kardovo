import { test, expect } from '@playwright/test';

test('homepage renders wedding platform title', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Zohan & Rose');
});
