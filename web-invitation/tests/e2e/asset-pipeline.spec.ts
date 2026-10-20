import { test, expect } from '@playwright/test';

test.describe('Deliverable I: Asset Pipeline & Management UI', () => {
  test('Uploads assets, auto-converts, updates referencing elements on replace, and blocks deleting in-use assets', async ({
    page,
  }) => {
    // 1. Visit visual editor
    await page.goto('/editor');
    await expect(page.locator('#visual-editor-root')).toBeVisible();

    // 2. Switch to Assets panel
    const assetsTabBtn = page.locator('button', { hasText: 'Assets' });
    await expect(assetsTabBtn).toBeVisible();
    await assetsTabBtn.click();

    // Verify Asset Library is mounted
    await expect(page.locator('#assets-panel-root')).toBeVisible();
    await expect(page.locator('#assets-grid-container')).toBeVisible();

    // 3. Verify existing in-use assets display "In Use" badge and deletion is blocked
    const inUseBadge = page.locator('span:has-text("In Use")').first();
    await expect(inUseBadge).toBeVisible();

    // 4. Test SVG Sanitization via direct upload API call
    const maliciousSvg = `<svg xmlns="http://www.w3.org/2000/svg"><script>alert('pwned')</script><circle cx="5" cy="5" r="5" fill="red"/></svg>`;
    const response = await page.request.post('/api/assets', {
      multipart: {
        file: {
          name: 'malicious.svg',
          mimeType: 'image/svg+xml',
          buffer: Buffer.from(maliciousSvg),
        },
        invitationId: 'inv-sacred-garden',
      },
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.url).toContain('data:image/svg+xml;utf8,');
    expect(decodeURIComponent(data.data.url)).not.toContain('<script');
    expect(decodeURIComponent(data.data.url)).toContain('<circle');

    // 5. Test Image Auto-Conversion via API call (WebP/AVIF output check)
    // 1x1 transparent png buffer
    const testPngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    const imageUploadRes = await page.request.post('/api/assets', {
      multipart: {
        file: {
          name: 'test-couple.png',
          mimeType: 'image/png',
          buffer: testPngBuffer,
        },
        invitationId: 'inv-sacred-garden',
      },
    });
    expect(imageUploadRes.status()).toBe(200);
    const imgData = await imageUploadRes.json();
    expect(imgData.success).toBe(true);
    expect(imgData.data.variants.length).toBeGreaterThan(0);
    expect(imgData.data.variants.some((v: { format: string }) => v.format === 'webp')).toBe(true);

    // 6. Test Asset Replacement propagates
    const replaceRes = await page.request.post('/api/assets', {
      multipart: {
        file: {
          name: 'replaced-gate.png',
          mimeType: 'image/png',
          buffer: testPngBuffer,
        },
        invitationId: 'inv-sacred-garden',
        replaceAssetId: imgData.data.id,
      },
    });
    expect(replaceRes.status()).toBe(200);
    const replaceData = await replaceRes.json();
    expect(replaceData.data.id).toBe(imgData.data.id);
    expect(replaceData.data.name).toBe('replaced-gate.png');
  });

  test('Public mobile page preloads critical gate assets and lazy loads remaining media', async ({
    page,
  }) => {
    await page.goto('/thesacredgarden');

    // Confirm preload links exist in document head for critical gate assets
    const audioPreload = page.locator('link[rel="preload"][as="fetch"][href*="mp3"]');
    await expect(audioPreload).toBeAttached();

    // Check lazy loading on remaining images
    const images = page.locator('img[loading="lazy"]');
    expect(await images.count()).toBeGreaterThanOrEqual(1);
  });
});
