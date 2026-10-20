import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'Zohan & Rose — The Sacred Garden';
    const subtitle = searchParams.get('subtitle') || 'An evening of love, laughter, and lifelong memories';
    const date = searchParams.get('date') || '27 . 09 . 2026';
    const initials = searchParams.get('initials') || 'Z&R';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1b0307',
            backgroundImage:
              'radial-gradient(circle at 50% 40%, #5a0f1b 0%, #200408 65%, #0d0103 100%)',
            position: 'relative',
            fontFamily: 'serif',
            color: '#f9f0e0',
            padding: '60px 40px',
          }}
        >
          {/* Ornate Gold Border Frame */}
          <div
            style={{
              position: 'absolute',
              top: '24px',
              left: '24px',
              right: '24px',
              bottom: '24px',
              border: '2px solid rgba(166, 125, 43, 0.45)',
              borderRadius: '24px',
              display: 'flex',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '32px',
              left: '32px',
              right: '32px',
              bottom: '32px',
              border: '1px solid rgba(166, 125, 43, 0.25)',
              borderRadius: '18px',
              display: 'flex',
            }}
          />

          {/* Luxury Wax Seal Emblem Circle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '90px',
              height: '90px',
              borderRadius: '45px',
              backgroundColor: '#5a0f1b',
              border: '3px solid #a67d2b',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              marginBottom: '24px',
              color: '#f9f0e0',
              fontSize: '28px',
              fontWeight: 'bold',
              letterSpacing: '2px',
            }}
          >
            {initials}
          </div>

          {/* Invitation Pre-title */}
          <div
            style={{
              fontSize: '16px',
              letterSpacing: '6px',
              textTransform: 'uppercase',
              color: '#a67d2b',
              marginBottom: '12px',
              fontWeight: 600,
            }}
          >
            Wedding Celebration
          </div>

          {/* Couple Names / Title */}
          <div
            style={{
              fontSize: '44px',
              fontWeight: 700,
              letterSpacing: '1px',
              textAlign: 'center',
              color: '#f9f0e0',
              marginBottom: '16px',
              maxWidth: '900px',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            }}
          >
            {title}
          </div>

          {/* Subtitle Message */}
          <div
            style={{
              fontSize: '18px',
              color: '#d4af37',
              textAlign: 'center',
              marginBottom: '24px',
              maxWidth: '800px',
              fontStyle: 'italic',
            }}
          >
            {subtitle}
          </div>

          {/* Date Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 24px',
              borderRadius: '999px',
              border: '1px solid rgba(166, 125, 43, 0.4)',
              backgroundColor: 'rgba(90, 15, 27, 0.4)',
              color: '#f9f0e0',
              fontSize: '16px',
              letterSpacing: '4px',
              fontWeight: 600,
            }}
          >
            {date}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to generate OG image';
    return new Response(`Failed to generate image: ${message}`, { status: 500 });
  }
}
