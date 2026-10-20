import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { sampleInvitationConfig } from '@/config/sample-invitation';
import { InvitationConfigSchema, InvitationConfig } from '@/lib/schema';
import { PublishedInvitationViewer } from '@/components/sections';
import { lookupGuestByToken } from '@/lib/supabase/rsvp-store';
import { invitationStore } from '@/lib/supabase/invitation-store';

interface PageProps {
  params: {
    slug: string;
  };
  searchParams?: {
    guest?: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = params;
  const normalized = slug?.toLowerCase().trim();
  const stored = invitationStore.getBySlug(normalized);
  const config = stored ? stored.config : (InvitationConfigSchema.parse(sampleInvitationConfig) as InvitationConfig);

  const title = config.meta.title;
  const description = config.meta.description || 'You are warmly invited to celebrate our wedding.';
  const ogImageUrl = `/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(description)}&date=27%20.%2009%20.%202026`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://kardovo.com/${slug}`,
      siteName: 'Kardovo Wedding Invitations',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
    other: {
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:locale': config.meta.lang === 'ar' ? 'ar_SA' : 'en_US',
    },
  };
}

export default async function InvitationSlugPage({ params, searchParams }: PageProps) {
  const { slug } = params;
  if (!slug) {
    notFound();
  }

  const normalized = slug.toLowerCase().trim();
  const stored = invitationStore.getBySlug(normalized);

  let invitationConfig: InvitationConfig;

  if (stored) {
    invitationConfig = stored.config;
  } else if (normalized === 'thesacredgarden' || normalized === 'demo' || normalized === 'test') {
    invitationConfig = InvitationConfigSchema.parse(sampleInvitationConfig) as InvitationConfig;
  } else {
    notFound();
  }

  // Guest personalization lookup (?guest=token)
  const guestToken = searchParams?.guest || '';
  const guestData = guestToken ? lookupGuestByToken(guestToken) : null;

  return (
    <PublishedInvitationViewer
      config={invitationConfig}
      guestToken={guestToken}
      initialGuestName={guestData?.name || ''}
      initialSeats={guestData?.seats ?? 1}
    />
  );
}
