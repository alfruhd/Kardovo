import { NextRequest, NextResponse } from 'next/server';

const takenSlugs = new Set(['thesacredgarden', 'demo', 'kew-gardens']);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug')?.toLowerCase().trim();

  if (!slug) {
    return NextResponse.json({ error: 'Slug parameter is required' }, { status: 400 });
  }

  const isAvailable = !takenSlugs.has(slug);

  return NextResponse.json({
    slug,
    available: isAvailable,
    message: isAvailable ? 'Slug is available' : 'Slug is already claimed',
  });
}
