'use client';

import React, { useState, useEffect } from 'react';
import { Section, Theme, Breakpoint } from '@/lib/schema';
import { SectionBackground } from './SectionBackground';
import { ElementRenderer } from '@/components/elements';
import { calculateTimeRemaining, buildMapEmbedUrl, buildDirectionsUrl } from '@/lib/utils/section-helpers';
import { Clock, MapPin, Navigation, Sparkles } from 'lucide-react';
import { RsvpFormModal } from './RsvpFormModal';

// ============================================================================
// 1. Gate Section (Envelope Gate Structure with Procedural Wax Seal & Reveal)
// ============================================================================
export function GateSection({
  section,
  theme,
  breakpoint,
  onOpenGate,
}: {
  section: Section;
  theme: Theme;
  breakpoint?: Breakpoint;
  onOpenGate?: () => void;
}) {
  const [isOpening, setIsOpening] = useState(false);
  const openAnimation = section.gateOpenAnimation || 'envelope-open';

  const handleOpen = () => {
    if (isOpening) return;
    setIsOpening(true);
    // Allow animation to play before calling onOpenGate callback
    setTimeout(() => {
      if (onOpenGate) {
        onOpenGate();
      }
    }, 750);
  };

  const animContainerClass = isOpening
    ? openAnimation === 'zoom'
      ? 'scale-125 opacity-0 duration-700 pointer-events-none'
      : openAnimation === 'curtain'
      ? 'translate-y-[-100%] opacity-0 duration-700 pointer-events-none'
      : openAnimation === 'split'
      ? 'scale-90 opacity-0 duration-700 pointer-events-none'
      : openAnimation === 'fade'
      ? 'opacity-0 duration-700 pointer-events-none'
      : 'scale-95 -translate-y-8 opacity-0 duration-700 pointer-events-none' // envelope-open
    : 'transition-all duration-700';

  return (
    <section
      id={section.id}
      data-section-id={section.id}
      data-section-type="gate"
      className="relative min-h-[92vh] flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden"
    >
      <SectionBackground background={section.backgroundMedia} />

      {/* Decorative Envelope Pocket / Enclosure */}
      <div
        id="gate-envelope"
        className={`relative z-10 max-w-[420px] w-full p-8 rounded-3xl border border-brand-border bg-white/75 backdrop-blur-md shadow-2xl flex flex-col items-center gap-6 ${animContainerClass}`}
      >
        {/* Ornate Envelope Triangular Flap Contour */}
        <div
          className={`w-full max-w-[340px] h-14 border-b border-brand-border/60 flex items-center justify-center transition-transform duration-500 origin-top ${
            isOpening ? '-rotate-180 opacity-40' : ''
          }`}
        >
          <svg viewBox="0 0 200 40" className="w-full h-full text-brand-border/40 fill-none stroke-current stroke-1">
            <path d="M 0,0 L 100,32 L 200,0" />
          </svg>
        </div>

        {/* Elements inside Gate (Title, Seal, Instructions) */}
        {section.elements.map((el) => (
          <div key={el.id} onClick={el.content.type === 'seal' ? handleOpen : undefined}>
            <ElementRenderer
              element={el}
              theme={theme}
              section={section}
              breakpoint={breakpoint}
            />
          </div>
        ))}

        {/* Direct Tap to Open Button (if not using seal alone) */}
        <button
          id="btn-gate-open"
          onClick={handleOpen}
          aria-label="Open Invitation"
          className="w-full py-3.5 px-6 rounded-2xl bg-brand-primary text-white text-xs font-semibold tracking-widest uppercase shadow-md hover:opacity-90 active:scale-95 transition-all mt-2"
        >
          Open Invitation
        </button>
      </div>
    </section>
  );
}

// ============================================================================
// 2. Hero Section
// ============================================================================
export function HeroSection({
  section,
  theme,
  breakpoint,
}: {
  section: Section;
  theme: Theme;
  breakpoint?: Breakpoint;
}) {
  return (
    <section
      id={section.id}
      data-section-id={section.id}
      data-section-type="hero"
      className="relative min-h-[75vh] flex flex-col items-center justify-center py-16 px-4 text-center overflow-hidden"
    >
      <SectionBackground background={section.backgroundMedia} />

      <div className="relative z-10 max-w-[460px] w-full flex flex-col items-center gap-4">
        {section.elements.map((el) => (
          <ElementRenderer
            key={el.id}
            element={el}
            theme={theme}
            section={section}
            breakpoint={breakpoint}
          />
        ))}
      </div>
    </section>
  );
}

// ============================================================================
// 3. Countdown Section (Timezone Aware + Post-Event State + Digit Styles)
// ============================================================================
export function CountdownSection({
  section,
  theme,
  breakpoint,
}: {
  section: Section;
  theme: Theme;
  breakpoint?: Breakpoint;
}) {
  const countdownEl = section.elements.find((el) => el.content.type === 'countdown');
  const countdownContent = countdownEl?.content.type === 'countdown' ? countdownEl.content : null;

  const targetDateIso = countdownContent?.targetDate || '2026-09-27T16:00:00Z';
  const [time, setTime] = useState(() => calculateTimeRemaining(targetDateIso));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(calculateTimeRemaining(targetDateIso));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDateIso]);

  const digitFontFamily =
    countdownContent?.digitStyle === 'modern-sans'
      ? 'var(--font-body)'
      : countdownContent?.digitStyle === 'calligraphic'
      ? 'var(--font-script)'
      : 'var(--font-heading)';

  return (
    <section
      id={section.id}
      data-section-id={section.id}
      data-section-type="countdown"
      className="relative py-14 px-4 flex flex-col items-center text-center overflow-hidden"
    >
      <SectionBackground background={section.backgroundMedia} />

      <div className="relative z-10 max-w-[460px] w-full space-y-6">
        {section.elements
          .filter((el) => el.content.type !== 'countdown')
          .map((el) => (
            <ElementRenderer
              key={el.id}
              element={el}
              theme={theme}
              section={section}
              breakpoint={breakpoint}
            />
          ))}

        {time.isCompleted ? (
          <div className="p-6 rounded-2xl border border-brand-border bg-white/70 backdrop-blur-sm shadow-md">
            <Sparkles className="w-6 h-6 mx-auto text-brand-primary mb-2 animate-bounce" />
            <p className="font-heading text-lg font-semibold text-brand-text">
              {countdownContent?.completedMessage || 'The celebration is underway!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2.5 sm:gap-3 p-4 rounded-2xl border border-brand-border bg-white/75 backdrop-blur-md shadow-lg">
            {[
              { val: time.days, label: countdownContent?.labels.days || 'Days' },
              { val: time.hours, label: countdownContent?.labels.hours || 'Hours' },
              { val: time.minutes, label: countdownContent?.labels.minutes || 'Minutes' },
              { val: time.seconds, label: countdownContent?.labels.seconds || 'Seconds' },
            ].map((unit, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-brand-border/60 bg-brand-surface/90 shadow-sm"
              >
                <span
                  style={{ fontFamily: digitFontFamily }}
                  className="text-2xl sm:text-3xl font-bold text-brand-primary tabular-nums leading-none"
                >
                  {String(unit.val).padStart(2, '0')}
                </span>
                <span className="text-[10px] tracking-wider uppercase text-brand-muted mt-1.5 font-medium">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================================
// 4. Schedule Section (Timeline / Two-Column / Alternating Layouts)
// ============================================================================
export function ScheduleSection({
  section,
  theme,
  breakpoint,
}: {
  section: Section;
  theme: Theme;
  breakpoint?: Breakpoint;
}) {
  const scheduleEl = section.elements.find((el) => el.content.type === 'schedule');
  const scheduleContent = scheduleEl?.content.type === 'schedule' ? scheduleEl.content : null;
  const items = scheduleContent?.items || [];
  const layout = scheduleContent?.layout || 'timeline';

  return (
    <section
      id={section.id}
      data-section-id={section.id}
      data-section-type="schedule"
      className="relative py-14 px-4 flex flex-col items-center overflow-hidden"
    >
      <SectionBackground background={section.backgroundMedia} />

      <div className="relative z-10 max-w-[460px] w-full space-y-6">
        {section.elements
          .filter((el) => el.content.type !== 'schedule')
          .map((el) => (
            <ElementRenderer
              key={el.id}
              element={el}
              theme={theme}
              section={section}
              breakpoint={breakpoint}
            />
          ))}

        {layout === 'two-column' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-brand-border bg-white/70 backdrop-blur-sm shadow-sm space-y-1"
              >
                <div className="flex items-center gap-1.5 text-brand-primary text-xs font-semibold uppercase">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{item.time}</span>
                </div>
                <h4 className="font-heading font-semibold text-sm text-brand-text">{item.title}</h4>
                {item.description && (
                  <p className="text-xs text-brand-muted">{item.description}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="relative border-l-2 border-brand-border/80 ml-4 pl-6 space-y-6 text-left">
            {items.map((item) => (
              <div key={item.id} className="relative group">
                <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full border-2 border-brand-surface bg-brand-primary shadow-sm" />
                <span className="text-xs uppercase tracking-wider font-semibold text-brand-primary">
                  {item.time}
                </span>
                <h4 className="font-heading font-bold text-base text-brand-text mt-0.5">
                  {item.title}
                </h4>
                {item.description && (
                  <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================================
// 5. Venue Section (Map Embed Generated From Address/Coords + Directions)
// ============================================================================
export function VenueSection({
  section,
  theme,
  breakpoint,
}: {
  section: Section;
  theme: Theme;
  breakpoint?: Breakpoint;
}) {
  const mapEl = section.elements.find((el) => el.content.type === 'map');
  const mapContent = mapEl?.content.type === 'map' ? mapEl.content : null;

  const embedUrl = mapContent ? buildMapEmbedUrl(mapContent) : '';
  const directionsUrl = mapContent ? buildDirectionsUrl(mapContent) : '';

  return (
    <section
      id={section.id}
      data-section-id={section.id}
      data-section-type="venue"
      className="relative py-14 px-4 flex flex-col items-center text-center overflow-hidden"
    >
      <SectionBackground background={section.backgroundMedia} />

      <div className="relative z-10 max-w-[460px] w-full space-y-5">
        {section.elements
          .filter((el) => el.content.type !== 'map')
          .map((el) => (
            <ElementRenderer
              key={el.id}
              element={el}
              theme={theme}
              section={section}
              breakpoint={breakpoint}
            />
          ))}

        {mapContent && (
          <div className="p-5 rounded-2xl border border-brand-border bg-white/75 backdrop-blur-md shadow-lg space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-primary">
                <MapPin className="w-3.5 h-3.5" />
                <span>{mapContent.venueName}</span>
              </div>
              <p className="text-xs text-brand-muted">{mapContent.address}</p>
            </div>

            {/* Map Iframe */}
            <div
              className="w-full rounded-xl overflow-hidden border border-brand-border/60 shadow-inner"
              style={{ aspectRatio: mapContent.aspectRatio || '16/9' }}
            >
              <iframe
                title={`Map location for ${mapContent.venueName}`}
                src={embedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {mapContent.showDirectionsButton && directionsUrl && (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-brand-primary text-white text-xs font-semibold tracking-wider uppercase shadow-md hover:opacity-90 active:scale-95 transition-all"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Get Driving Directions</span>
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================================
// 6. Details Section (Unlimited Cards, Color Swatches)
// ============================================================================
export function DetailsSection({
  section,
  theme,
  breakpoint,
}: {
  section: Section;
  theme: Theme;
  breakpoint?: Breakpoint;
}) {
  const detailsEl = section.elements.find((el) => el.content.type === 'details');
  const detailsContent = detailsEl?.content.type === 'details' ? detailsEl.content : null;

  return (
    <section
      id={section.id}
      data-section-id={section.id}
      data-section-type="details"
      className="relative py-14 px-4 flex flex-col items-center text-center overflow-hidden"
    >
      <SectionBackground background={section.backgroundMedia} />

      <div className="relative z-10 max-w-[460px] w-full space-y-5">
        {section.elements
          .filter((el) => el.content.type !== 'details')
          .map((el) => (
            <ElementRenderer
              key={el.id}
              element={el}
              theme={theme}
              section={section}
              breakpoint={breakpoint}
            />
          ))}

        {detailsContent?.cards && detailsContent.cards.length > 0 && (
          <div className="grid grid-cols-1 gap-3.5 text-left">
            {detailsContent.cards.map((card) => (
              <div
                key={card.id}
                className="p-5 rounded-2xl border border-brand-border bg-white/75 backdrop-blur-md shadow-md space-y-2.5"
              >
                <h4 className="font-heading font-bold text-sm text-brand-text flex items-center gap-2">
                  <span>{card.title}</span>
                </h4>
                <p className="text-xs text-brand-muted leading-relaxed">{card.description}</p>

                {/* Color swatches for dress code */}
                {card.colorSwatches && card.colorSwatches.length > 0 && (
                  <div className="pt-2 flex items-center gap-2">
                    <span className="text-[10px] uppercase font-semibold text-brand-muted">
                      Palette:
                    </span>
                    <div className="flex gap-1.5">
                      {card.colorSwatches.map((swatch, sIdx) => (
                        <span
                          key={sIdx}
                          style={{ backgroundColor: swatch }}
                          className="w-5 h-5 rounded-full border border-black/10 shadow-sm"
                          title={swatch}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================================
// 7. RSVP Section (with Interactive Modal Form)
// ============================================================================
export function RsvpSection({
  section,
  theme,
  breakpoint,
  guestToken,
  initialGuestName,
  initialSeats,
}: {
  section: Section;
  theme: Theme;
  breakpoint?: Breakpoint;
  guestToken?: string;
  initialGuestName?: string;
  initialSeats?: number;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  // Find form content configuration or fallback to defaults
  const formEl = section.elements.find((el) => el.content.type === 'form');
  const formContent = formEl?.content.type === 'form' ? formEl.content : null;

  return (
    <section
      id={section.id}
      data-section-id={section.id}
      data-section-type="rsvp"
      className="relative py-16 px-4 flex flex-col items-center text-center overflow-hidden"
    >
      <SectionBackground background={section.backgroundMedia} />

      <div className="relative z-10 max-w-[460px] w-full space-y-4">
        {section.elements.map((el) => (
          <div
            key={el.id}
            onClick={
              el.content.type === 'button' || el.content.type === 'seal'
                ? () => setModalOpen(true)
                : undefined
            }
          >
            <ElementRenderer
              element={el}
              theme={theme}
              section={section}
              breakpoint={breakpoint}
            />
          </div>
        ))}

        {/* Direct trigger button if elements don't have modal click */}
        <button
          id="btn-open-rsvp-modal"
          onClick={() => setModalOpen(true)}
          className="w-full py-3.5 px-6 rounded-2xl bg-brand-primary text-white font-semibold text-xs uppercase tracking-widest shadow-md hover:opacity-90 active:scale-95 transition"
        >
          {formContent?.headline || 'Respond to Invitation'}
        </button>
      </div>

      {formContent && (
        <RsvpFormModal
          content={formContent}
          invitationId="inv-sacred-garden"
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          guestToken={guestToken}
          initialGuestName={initialGuestName}
          initialSeats={initialSeats}
        />
      )}
    </section>
  );
}

// ============================================================================
// 8. Closing Section
// ============================================================================
export function ClosingSection({
  section,
  theme,
  breakpoint,
}: {
  section: Section;
  theme: Theme;
  breakpoint?: Breakpoint;
}) {
  return (
    <section
      id={section.id}
      data-section-id={section.id}
      data-section-type="closing"
      className="relative py-16 px-4 flex flex-col items-center text-center overflow-hidden"
    >
      <SectionBackground background={section.backgroundMedia} />

      <div className="relative z-10 max-w-[460px] w-full space-y-4 flex flex-col items-center">
        {section.elements.map((el) => (
          <ElementRenderer
            key={el.id}
            element={el}
            theme={theme}
            section={section}
            breakpoint={breakpoint}
          />
        ))}
      </div>
    </section>
  );
}

// ============================================================================
// Master <SectionRenderer> Dispatcher
// ============================================================================
export function SectionRenderer({
  section,
  theme,
  breakpoint,
  onOpenGate,
  guestToken,
  initialGuestName,
  initialSeats,
}: {
  section: Section;
  theme: Theme;
  breakpoint?: Breakpoint;
  onOpenGate?: () => void;
  guestToken?: string;
  initialGuestName?: string;
  initialSeats?: number;
}) {
  if (!section.visible) {
    return null;
  }

  switch (section.type) {
    case 'gate':
      return (
        <GateSection
          section={section}
          theme={theme}
          breakpoint={breakpoint}
          onOpenGate={onOpenGate}
        />
      );
    case 'hero':
      return <HeroSection section={section} theme={theme} breakpoint={breakpoint} />;
    case 'countdown':
      return <CountdownSection section={section} theme={theme} breakpoint={breakpoint} />;
    case 'schedule':
      return <ScheduleSection section={section} theme={theme} breakpoint={breakpoint} />;
    case 'venue':
      return <VenueSection section={section} theme={theme} breakpoint={breakpoint} />;
    case 'details':
      return <DetailsSection section={section} theme={theme} breakpoint={breakpoint} />;
    case 'rsvp':
      return (
        <RsvpSection
          section={section}
          theme={theme}
          breakpoint={breakpoint}
          guestToken={guestToken}
          initialGuestName={initialGuestName}
          initialSeats={initialSeats}
        />
      );
    case 'closing':
      return <ClosingSection section={section} theme={theme} breakpoint={breakpoint} />;
    default:
      return null;
  }
}
