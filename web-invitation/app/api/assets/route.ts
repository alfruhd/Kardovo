import { NextRequest, NextResponse } from 'next/server';
import { assetStore, AssetRecord } from '@/lib/supabase/asset-store';
import {
  processImageBuffer,
  generateVideoPosterBuffer,
  sanitizeSvgContent,
  validateAssetSize,
} from '@/lib/utils/asset-pipeline';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const invitationId = searchParams.get('invitationId') || 'inv-sacred-garden';
  const assets = assetStore.getByInvitation(invitationId);
  return NextResponse.json({ success: true, data: assets });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const invitationId = (formData.get('invitationId') as string) || 'inv-sacred-garden';
    const replaceAssetId = formData.get('replaceAssetId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name;
    const mimeType = file.type;

    // Detect asset type
    let assetType: 'image' | 'video' | 'audio' | 'svg' | 'font' = 'image';
    if (mimeType.includes('svg') || fileName.endsWith('.svg')) {
      assetType = 'svg';
    } else if (mimeType.startsWith('video/')) {
      assetType = 'video';
    } else if (mimeType.startsWith('audio/')) {
      assetType = 'audio';
    } else if (
      mimeType.includes('font') ||
      fileName.endsWith('.ttf') ||
      fileName.endsWith('.otf') ||
      fileName.endsWith('.woff') ||
      fileName.endsWith('.woff2')
    ) {
      assetType = 'font';
    }

    // Size validation
    const sizeCheck = validateAssetSize(fileBuffer.length, assetType);
    if (!sizeCheck.valid) {
      return NextResponse.json({ error: sizeCheck.error }, { status: 400 });
    }

    let finalUrl = `https://mock-storage.supabase.co/${invitationId}/${Date.now()}-${fileName}`;
    let width: number | undefined;
    let height: number | undefined;
    let posterUrl: string | undefined;
    const variants: Array<{ format: string; width: number; height: number; url: string; sizeBytes: number }> = [];

    // Pipeline processing per asset type
    if (assetType === 'svg') {
      const sanitizedSvg = sanitizeSvgContent(fileBuffer.toString('utf-8'));
      finalUrl = `data:image/svg+xml;utf8,${encodeURIComponent(sanitizedSvg)}`;
    } else if (assetType === 'image') {
      const processed = await processImageBuffer(fileBuffer);
      width = processed.width;
      height = processed.height;

      // Add responsive WebP / AVIF variants
      processed.variants.forEach((v) => {
        variants.push({
          format: v.format,
          width: v.width,
          height: v.height,
          url: `${finalUrl}.${v.format}?w=${v.width}`,
          sizeBytes: v.sizeBytes,
        });
      });
    } else if (assetType === 'video') {
      // Auto-generate video poster
      const poster = await generateVideoPosterBuffer(fileName.replace(/\.[^/.]+$/, ''));
      posterUrl = `data:${poster.mimeType};base64,${poster.buffer.toString('base64')}`;
    }

    const assetId = replaceAssetId || `asset-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const newRecord: AssetRecord = {
      id: assetId,
      invitation_id: invitationId,
      name: fileName,
      url: finalUrl,
      type: assetType,
      mimeType,
      sizeBytes: fileBuffer.length,
      width,
      height,
      poster_url: posterUrl,
      variants,
      created_at: new Date().toISOString(),
    };

    if (replaceAssetId) {
      assetStore.update(replaceAssetId, newRecord);
    } else {
      assetStore.create(newRecord);
    }

    return NextResponse.json({
      success: true,
      message: replaceAssetId ? 'Asset replaced successfully' : 'Asset uploaded successfully',
      data: newRecord,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Upload failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const inUse = searchParams.get('inUse') === 'true';

  if (!id) {
    return NextResponse.json({ error: 'Asset ID is required' }, { status: 400 });
  }

  // Block deletion if asset is currently in use across sections
  if (inUse) {
    return NextResponse.json(
      { error: 'Cannot delete asset: it is currently in use in this invitation.' },
      { status: 409 }
    );
  }

  const ok = assetStore.delete(id);
  return NextResponse.json({ success: ok });
}
