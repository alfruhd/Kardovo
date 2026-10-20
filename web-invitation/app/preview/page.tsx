'use client';

import React, { useState } from 'react';
import { SectionRenderer } from '@/components/sections';
import { ThemeProvider, AudioManagerProvider } from '@/lib/theme';
import { InvitationConfig, InvitationConfigSchema, Section } from '@/lib/schema';
import { sampleInvitationConfig } from '@/config/sample-invitation';

function InvitationView({ initialConfig }: { initialConfig: InvitationConfig }) {
  const [config, setConfig] = useState<InvitationConfig>(initialConfig);
  const [activeBreakpoint, setActiveBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  // Support section hide, reorder, duplicate dynamically
  const toggleSectionVisibility = (sectionId: string) => {
    setConfig((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) =>
        sec.id === sectionId ? { ...sec, visible: !sec.visible } : sec
      ),
    }));
  };

  const reorderSection = (index: number, direction: 'up' | 'down') => {
    setConfig((prev) => {
      const newSecs = [...prev.sections];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newSecs.length) return prev;
      const [moved] = newSecs.splice(index, 1);
      if (moved) {
        newSecs.splice(targetIndex, 0, moved);
      }
      return {
        ...prev,
        sections: newSecs,
      };
    });
  };

  const duplicateSection = (section: Section) => {
    setConfig((prev) => {
      const copy: Section = {
        ...section,
        id: `${section.id}-copy-${Date.now()}`,
        name: `${section.name} (Copy)`,
      };
      return {
        ...prev,
        sections: [...prev.sections, copy],
      };
    });
  };

  const [gateOpened, setGateOpened] = useState(false);

  return (
    <ThemeProvider initialTheme={config.theme}>
      <AudioManagerProvider config={config.audio}>
        <div id="invitation-container" className="min-h-screen bg-brand-bg text-brand-text flex flex-col items-center">
          {/* Editor / Test Action Bar */}
          <header className="w-full max-w-[500px] p-4 my-4 rounded-2xl border border-brand-border bg-white/80 backdrop-blur-md shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-brand-primary uppercase tracking-wider">
              Sections ({config.sections.filter((s) => s.visible).length} visible)
            </span>

            <div className="flex gap-2">
              <button
                id="btn-toggle-hero"
                onClick={() => toggleSectionVisibility('sec-hero')}
                className="px-2.5 py-1 rounded border border-brand-border hover:bg-black/5"
              >
                Toggle Hero
              </button>
              <button
                id="btn-reorder-schedule-up"
                onClick={() => {
                  const idx = config.sections.findIndex((s) => s.id === 'sec-schedule');
                  if (idx !== -1) reorderSection(idx, 'up');
                }}
                className="px-2.5 py-1 rounded border border-brand-border hover:bg-black/5"
              >
                Move Schedule Up
              </button>
              <button
                id="btn-duplicate-hero"
                onClick={() => {
                  const hero = config.sections.find((s) => s.type === 'hero');
                  if (hero) duplicateSection(hero);
                }}
                className="px-2.5 py-1 rounded border border-brand-border hover:bg-black/5"
              >
                Duplicate Hero
              </button>
              <button
                id="btn-bp-toggle-mobile"
                onClick={() => setActiveBreakpoint((prev) => (prev === 'mobile' ? 'desktop' : 'mobile'))}
                className="px-2.5 py-1 rounded bg-brand-primary text-white font-medium"
              >
                Breakpoint: {activeBreakpoint}
              </button>
            </div>
          </header>

          {/* Render Sections in Config Order */}
          <main
            id="invitation-main"
            className="w-full max-w-[460px] mx-auto flex flex-col overflow-x-hidden shadow-2xl bg-brand-bg rounded-t-3xl"
          >
            {config.sections.map((section) => {
              // In production / preview mode: gate section shows first; once opened, subsequent sections reveal
              if (section.type === 'gate' && gateOpened) {
                return null;
              }
              return (
                <SectionRenderer
                  key={section.id}
                  section={section}
                  theme={config.theme}
                  breakpoint={activeBreakpoint}
                  onOpenGate={() => setGateOpened(true)}
                />
              );
            })}
          </main>
        </div>
      </AudioManagerProvider>
    </ThemeProvider>
  );
}

export default function InvitationPreviewPage() {
  const config = InvitationConfigSchema.parse(sampleInvitationConfig);

  return <InvitationView initialConfig={config} />;
}
