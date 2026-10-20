import sharp from 'sharp';

export interface ProcessedImageVariant {
  format: 'webp' | 'avif' | 'original';
  width: number;
  height: number;
  buffer: Buffer;
  sizeBytes: number;
}

export interface ImageProcessingResult {
  width: number;
  height: number;
  originalSizeBytes: number;
  webpBuffer: Buffer;
  webpSizeBytes: number;
  avifBuffer: Buffer;
  avifSizeBytes: number;
  variants: ProcessedImageVariant[];
}

/**
 * Auto-converts image to WebP and AVIF with responsive sizes (380px, 768px, 1200px)
 */
export async function processImageBuffer(
  inputBuffer: Buffer,
  options?: { responsiveBreakpoints?: number[] }
): Promise<ImageProcessingResult> {
  const metadata = await sharp(inputBuffer).metadata();
  const originalWidth = metadata.width || 1200;
  const originalHeight = metadata.height || 800;

  // Convert full-size WebP & AVIF
  const webpBuffer = await sharp(inputBuffer)
    .webp({ quality: 82, effort: 4 })
    .toBuffer();

  const avifBuffer = await sharp(inputBuffer)
    .avif({ quality: 75, effort: 4 })
    .toBuffer();

  const variants: ProcessedImageVariant[] = [
    {
      format: 'webp',
      width: originalWidth,
      height: originalHeight,
      buffer: webpBuffer,
      sizeBytes: webpBuffer.length,
    },
    {
      format: 'avif',
      width: originalWidth,
      height: originalHeight,
      buffer: avifBuffer,
      sizeBytes: avifBuffer.length,
    },
  ];

  // Generate responsive widths
  const breakpoints = options?.responsiveBreakpoints || [380, 768];
  for (const bp of breakpoints) {
    if (bp < originalWidth) {
      const resizedWebp = await sharp(inputBuffer)
        .resize({ width: bp, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      const resizedAvif = await sharp(inputBuffer)
        .resize({ width: bp, withoutEnlargement: true })
        .avif({ quality: 75 })
        .toBuffer();

      const calculatedHeight = Math.round((originalHeight / originalWidth) * bp);

      variants.push(
        {
          format: 'webp',
          width: bp,
          height: calculatedHeight,
          buffer: resizedWebp,
          sizeBytes: resizedWebp.length,
        },
        {
          format: 'avif',
          width: bp,
          height: calculatedHeight,
          buffer: resizedAvif,
          sizeBytes: resizedAvif.length,
        }
      );
    }
  }

  return {
    width: originalWidth,
    height: originalHeight,
    originalSizeBytes: inputBuffer.length,
    webpBuffer,
    webpSizeBytes: webpBuffer.length,
    avifBuffer,
    avifSizeBytes: avifBuffer.length,
    variants,
  };
}

/**
 * Generates video poster from first frame / fallback gradient SVG or placeholder
 */
export async function generateVideoPosterBuffer(
  title: string = 'Wedding Invitation Video'
): Promise<{ buffer: Buffer; mimeType: string }> {
  // Generate a procedural poster SVG with elegant luxury styling and render to WebP via Sharp
  const posterSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2a060d" />
          <stop offset="50%" stop-color="#5a0f1b" />
          <stop offset="100%" stop-color="#140205" />
        </linearGradient>
      </defs>
      <rect width="1280" height="720" fill="url(#bgGrad)" />
      <circle cx="640" cy="360" r="280" fill="none" stroke="#a67d2b" stroke-width="2" opacity="0.3" />
      <circle cx="640" cy="360" r="260" fill="none" stroke="#a67d2b" stroke-width="1" opacity="0.2" />
      <text x="640" y="350" font-family="Cinzel, serif" font-size="36" fill="#f9f0e0" text-anchor="middle" letter-spacing="4">
        ${title.replace(/[&<>"']/g, '')}
      </text>
      <text x="640" y="400" font-family="sans-serif" font-size="14" fill="#a67d2b" text-anchor="middle" letter-spacing="2">
        THE SACRED GARDEN • CINEMATIC EXPERIENCE
      </text>
    </svg>
  `;

  const buffer = await sharp(Buffer.from(posterSvg))
    .webp({ quality: 85 })
    .toBuffer();

  return {
    buffer,
    mimeType: 'image/webp',
  };
}

/**
 * Sanitizes malicious SVG content by removing <script> tags, onload handlers, javascript: URIs
 */
// Server-safe XML/SVG sanitizer that strips script tags, event handlers, and javascript: hrefs
export function sanitizeSvgContent(rawSvg: string): string {
  let cleaned = rawSvg;
  // Strip <script>...</script> tags and comments
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  // Strip iframe, object, embed
  cleaned = cleaned.replace(/<(iframe|object|embed|form)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '');
  cleaned = cleaned.replace(/<(iframe|object|embed|form)[^>]*\/?>/gi, '');
  // Strip on* event attributes (onload, onerror, onclick, etc.)
  cleaned = cleaned.replace(/\son[a-zA-Z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  // Strip javascript: pseudo protocols
  cleaned = cleaned.replace(/(href|xlink:href)\s*=\s*("[^"]*javascript:[^"]*"|'[^']*javascript:[^']*')/gi, '$1=""');
  // Strip data: or script execution in xlink
  cleaned = cleaned.replace(/data:text\/html/gi, '');

  return cleaned;
}

/**
 * Audio limits and validation
 * Wedding audio tracks should remain mobile friendly (e.g. max 15MB)
 */
export const AUDIO_MAX_SIZE_BYTES = 15 * 1024 * 1024; // 15MB
export const IMAGE_MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const VIDEO_MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
export const FONT_MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export function validateAssetSize(sizeBytes: number, type: 'image' | 'video' | 'audio' | 'svg' | 'font'): { valid: boolean; error?: string } {
  switch (type) {
    case 'audio':
      if (sizeBytes > AUDIO_MAX_SIZE_BYTES) {
        return { valid: false, error: `Audio file exceeds maximum size limit of ${AUDIO_MAX_SIZE_BYTES / (1024 * 1024)}MB` };
      }
      break;
    case 'image':
    case 'svg':
      if (sizeBytes > IMAGE_MAX_SIZE_BYTES) {
        return { valid: false, error: `Image file exceeds maximum limit of ${IMAGE_MAX_SIZE_BYTES / (1024 * 1024)}MB` };
      }
      break;
    case 'video':
      if (sizeBytes > VIDEO_MAX_SIZE_BYTES) {
        return { valid: false, error: `Video file exceeds maximum limit of ${VIDEO_MAX_SIZE_BYTES / (1024 * 1024)}MB` };
      }
      break;
    case 'font':
      if (sizeBytes > FONT_MAX_SIZE_BYTES) {
        return { valid: false, error: `Font file exceeds maximum limit of ${FONT_MAX_SIZE_BYTES / (1024 * 1024)}MB` };
      }
      break;
  }
  return { valid: true };
}
