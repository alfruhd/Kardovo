'use client';

import React, { useState } from 'react';
import { InvitationConfig, Section } from '@/lib/schema';
import { ThemeProvider, AudioManagerProvider } from '@/lib/theme';
import { SectionRenderer } from '@/components/sections';

interface PublishedInvitationViewerProps {
  config: InvitationConfig;
  initialGuestName?: string;
  initialSeats?: number;
  guestToken?: string;
}

export function PublishedInvitationViewer({
  config,
  initialGuestName = '',
  initialSeats = 1,
  guestToken,
}: PublishedInvitationViewerProps) {
  const [gateOpened, setGateOpened] = useState(false);

  // Identify critical gate assets to preload
  const gateSection = config.sections.find((s) => s.type === 'gate');
  const gateBgUrl = gateSection?.backgroundMedia?.type === 'image' ? gateSection.backgroundMedia.url : null;
  const audioUrl = config.audio?.enabled && config.audio?.url ? config.audio.url : null;

  return (
    <ThemeProvider initialTheme={config.theme}>
      <AudioManagerProvider config={config.audio}>
        {/* Preload critical gate assets */}
        {gateBgUrl && (
          <link rel="preload" as="image" href={gateBgUrl} fetchPriority="high" />
        )}
        {audioUrl && (
          <link rel="preload" as="fetch" href={audioUrl} crossOrigin="anonymous" />
        )}

        <div
          id="invitation-public-container"
          dir={config.meta.lang === 'ar' || config.meta.lang === 'he' ? 'rtl' : 'ltr'}
          lang={config.meta.lang || 'en'}
          className="min-h-screen bg-brand-bg text-brand-text flex flex-col items-center selection:bg-brand-primary/20"
        >
          {/* Guest Personalization Banner if guest token is present */}
          {guestToken && initialGuestName && (
            <div
              id="guest-personalized-banner"
              className="w-full max-w-[460px] bg-stone-900 text-[#d4af37] py-2 px-4 text-center text-xs tracking-wider uppercase font-semibold flex items-center justify-between"
            >
              <span>Welcome, {initialGuestName}</span>
              <span className="text-[10px] text-stone-400">Seats Reserved: {initialSeats}</span>
            </div>
          )}

          {/* Clean Public Mobile-first Container without any editor controls */}
          <main
            id="invitation-public-main"
            className="w-full max-w-[460px] mx-auto flex flex-col overflow-x-hidden shadow-2xl bg-brand-bg rounded-t-3xl min-h-screen"
          >
            {config.sections
              .filter((section) => section.visible)
              .map((section: Section) => {
                // If gate is open, do not render gate section
                if (section.type === 'gate' && gateOpened) {
                  return null;
                }
                return (
                  <SectionRenderer
                    key={section.id}
                    section={section}
                    theme={config.theme}
                    breakpoint="mobile"
                    onOpenGate={() => setGateOpened(true)}
                    guestToken={guestToken}
                    initialGuestName={initialGuestName}
                    initialSeats={initialSeats}
                  />
                );
              })}
          </main>
        </div>
      </AudioManagerProvider>
    </ThemeProvider>
  );
}
