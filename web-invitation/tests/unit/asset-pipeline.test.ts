import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import {
  processImageBuffer,
  generateVideoPosterBuffer,
  sanitizeSvgContent,
  validateAssetSize,
  AUDIO_MAX_SIZE_BYTES,
  IMAGE_MAX_SIZE_BYTES,
  VIDEO_MAX_SIZE_BYTES,
} from '@/lib/utils/asset-pipeline';
import { assetStore } from '@/lib/supabase/asset-store';

describe('Deliverable I: Asset Pipeline & Processing Engine', () => {
  describe('Image Auto-conversion & Responsive Variants', () => {
    it('auto-converts test image to WebP and AVIF with responsive sizes', async () => {
      // Create a test raw PNG image (800x600)
      const inputBuffer = await sharp({
        create: {
          width: 800,
          height: 600,
          channels: 4,
          background: { r: 90, g: 15, b: 27, alpha: 1 }, // Crimson
        },
      })
        .png()
        .toBuffer();

      const result = await processImageBuffer(inputBuffer);

      expect(result.width).toBe(800);
      expect(result.height).toBe(600);
      expect(result.originalSizeBytes).toBe(inputBuffer.length);

      // Verify WebP and AVIF buffers were generated
      expect(result.webpBuffer).toBeDefined();
      expect(result.webpSizeBytes).toBeGreaterThan(0);
      expect(result.avifBuffer).toBeDefined();
      expect(result.avifSizeBytes).toBeGreaterThan(0);

      // Verify sharp recognizes the output formats
      const webpMeta = await sharp(result.webpBuffer).metadata();
      expect(webpMeta.format).toBe('webp');

      const avifMeta = await sharp(result.avifBuffer).metadata();
      expect(['avif', 'heif']).toContain(avifMeta.format);

      // Verify responsive variants exist (380px, 768px)
      const variantWidths = result.variants.map((v) => v.width);
      expect(variantWidths).toContain(380);
      expect(variantWidths).toContain(768);
    });
  });

  describe('Video Poster Generation', () => {
    it('generates a branded cinematic poster image for video assets', async () => {
      const poster = await generateVideoPosterBuffer('The Sacred Garden');
      expect(poster.buffer).toBeDefined();
      expect(poster.mimeType).toBe('image/webp');

      const meta = await sharp(poster.buffer).metadata();
      expect(meta.format).toBe('webp');
      expect(meta.width).toBe(1280);
      expect(meta.height).toBe(720);
    });
  });

  describe('Malicious SVG Sanitization', () => {
    it('sanitizes malicious script tags, onerror handlers, and javascript URIs from SVG files', () => {
      const maliciousSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
          <circle cx="50" cy="50" r="40" fill="gold" onerror="alert('xss')" />
          <script type="text/javascript">alert('pwned');</script>
          <a href="javascript:alert('click')">
            <text x="10" y="20">Click me</text>
          </a>
        </svg>
      `;

      const sanitized = sanitizeSvgContent(maliciousSvg);

      // Verify script and event handlers were stripped completely
      expect(sanitized).not.toContain('<script');
      expect(sanitized).not.toContain('alert(');
      expect(sanitized).not.toContain('onerror');
      expect(sanitized).not.toContain('javascript:');

      // Verify safe SVG elements are preserved
      expect(sanitized).toContain('<svg');
      expect(sanitized).toContain('<circle');
      expect(sanitized).toContain('fill="gold"');
    });
  });

  describe('Audio & Asset Size Limits', () => {
    it('enforces maximum size limits on audio and media files', () => {
      // 5MB audio is valid
      const validAudio = validateAssetSize(5 * 1024 * 1024, 'audio');
      expect(validAudio.valid).toBe(true);

      // 20MB audio exceeds limit
      const oversizedAudio = validateAssetSize(AUDIO_MAX_SIZE_BYTES + 1024, 'audio');
      expect(oversizedAudio.valid).toBe(false);
      expect(oversizedAudio.error).toContain('Audio file exceeds maximum size limit');

      // 12MB image exceeds limit
      const oversizedImage = validateAssetSize(IMAGE_MAX_SIZE_BYTES + 1024, 'image');
      expect(oversizedImage.valid).toBe(false);

      // 60MB video exceeds limit
      const oversizedVideo = validateAssetSize(VIDEO_MAX_SIZE_BYTES + 1024, 'video');
      expect(oversizedVideo.valid).toBe(false);
    });
  });

  describe('Asset Store & Replacement', () => {
    it('supports creating, replacing, and checking asset usage in store', () => {
      const asset = assetStore.create({
        id: 'asset-test-replacement',
        invitation_id: 'inv-sacred-garden',
        name: 'Garden Gate Image',
        url: 'https://example.com/gate.jpg',
        type: 'image',
        mimeType: 'image/jpeg',
        sizeBytes: 150000,
        created_at: new Date().toISOString(),
      });

      expect(assetStore.getById(asset.id)).toBeDefined();

      // Replace asset
      const updated = assetStore.update('asset-test-replacement', {
        url: 'https://example.com/gate-v2.webp',
        sizeBytes: 95000,
      });

      expect(updated?.url).toBe('https://example.com/gate-v2.webp');
      expect(updated?.sizeBytes).toBe(95000);

      // Cleanup
      assetStore.delete('asset-test-replacement');
      expect(assetStore.getById('asset-test-replacement')).toBeNull();
    });
  });
});
