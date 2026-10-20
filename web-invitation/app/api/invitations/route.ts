import { NextRequest, NextResponse } from 'next/server';
import { invitationStore } from '@/lib/supabase/invitation-store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  if (slug) {
    const inv = invitationStore.getBySlug(slug);
    if (!inv) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: inv });
  }

  const all = invitationStore.getAll();
  return NextResponse.json({ success: true, data: all });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, sourceSlug, newSlug, title } = body;

    if (action === 'duplicate') {
      if (!sourceSlug || !newSlug) {
        return NextResponse.json(
          { error: 'sourceSlug and newSlug are required for duplication' },
          { status: 400 }
        );
      }

      if (!invitationStore.isSlugAvailable(newSlug)) {
        return NextResponse.json(
          { error: `Slug "${newSlug}" is already taken.` },
          { status: 409 }
        );
      }

      const duplicated = invitationStore.duplicate(sourceSlug, newSlug, title);
      return NextResponse.json({
        success: true,
        message: `Invitation duplicated successfully to /${duplicated.slug}`,
        data: duplicated,
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Operation failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
