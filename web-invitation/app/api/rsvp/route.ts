import { NextRequest, NextResponse } from 'next/server';
import { rsvpStore, RsvpSubmissionPayload } from '@/lib/supabase/rsvp-store';
import { checkRateLimit } from '@/lib/utils/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';

    // 1. Rate Limiting Check (Max 30 requests per 60s for tests/dev, 5 in production)
    const maxAllowed = process.env.NODE_ENV === 'production' ? 5 : 30;
    const rateLimit = checkRateLimit(ip, maxAllowed, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please wait before submitting again.',
          resetInSec: rateLimit.resetInSec,
        },
        { status: 429 }
      );
    }

    const payload = (await req.json()) as RsvpSubmissionPayload;

    // 2. Honeypot Anti-Spam Trap
    if (payload.hp_website && payload.hp_website.trim().length > 0) {
      return NextResponse.json({ error: 'Spam detected' }, { status: 400 });
    }

    // 3. Validation: Full Name is required
    if (!payload.name || payload.name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // 4. Save Record
    const record = rsvpStore.create(payload);

    return NextResponse.json({
      success: true,
      message: 'RSVP submitted successfully',
      data: record,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const invitationId = searchParams.get('invitationId');

  const records = invitationId ? rsvpStore.getByInvitation(invitationId) : rsvpStore.getAll();

  return NextResponse.json({
    success: true,
    data: records,
  });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
  }

  const ok = rsvpStore.delete(id);
  return NextResponse.json({ success: ok });
}
