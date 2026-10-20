'use client';

import React, { useState } from 'react';
import { ElementRenderer } from '@/components/elements';
import { ThemeProvider, PRESET_THEMES } from '@/lib/theme';
import { Element, ElementInput, ElementSchema, ThemeSchema } from '@/lib/schema';

// Test config containing EVERY requested element type:
// text, image, video, decor, divider, button, shape, spacer
const initialElements: ElementInput[] = [
  // 1. TEXT ELEMENT (with mobile override test target)
  {
    id: 'el-test-text',
    name: 'Main Title',
    content: {
      type: 'text',
      text: 'The Sacred Garden Wedding',
      tag: 'h1',
    },
    typography: {
      fontFamily: 'Cinzel',
      fontSize: '32px',
      color: '#5a0f1b',
      textAlign: 'center',
    },
    box: {
      padding: '16px',
    },
    transform: {
      rotateDeg: 0,
      scale: 1,
      translateX: '0px',
      translateY: '0px',
    },
    visible: true,
    locked: false,
    animation: {
      preset: 'fade-up',
      durationSec: 0.6,
      delaySec: 0.1,
      easing: 'power2.out',
      trigger: 'scroll',
      scrollTrigger: true,
      triggerOffset: 'top 90%',
      once: true,
      parallaxSpeed: 0,
      staggerSec: 0,
      loop: false,
    },
    responsive: {
      mobile: {
        typography: {
          fontSize: '24px',
        },
      },
    },
  },

  // 2. TEXT ELEMENT (Hidden on mobile test target)
  {
    id: 'el-desktop-only-text',
    name: 'Desktop Exclusive Banner',
    content: {
      type: 'text',
      text: 'Exclusively visible on tablet and desktop screens',
      tag: 'p',
    },
    typography: {
      fontSize: '14px',
      color: '#8c7666',
      textAlign: 'center',
    },
    box: {
      padding: '8px',
    },
    transform: {
      rotateDeg: 0,
      scale: 1,
      translateX: '0px',
      translateY: '0px',
    },
    visible: true,
    locked: false,
    animation: {
      preset: 'none',
      durationSec: 0.5,
      delaySec: 0,
      easing: 'power2.out',
      trigger: 'scroll',
      scrollTrigger: false,
      triggerOffset: 'top 85%',
      once: true,
      parallaxSpeed: 0,
      staggerSec: 0,
      loop: false,
    },
    responsive: {
      mobile: {
        visible: false, // Must be hidden at 380px
      },
    },
  },

  // 3. DECOR ELEMENT
  {
    id: 'el-test-decor',
    name: 'Floral Flourish',
    content: {
      type: 'decor',
      decorType: 'floral-header',
      alt: 'Botanical flourish divider',
      position: 'center',
    },
    transform: {
      rotateDeg: 0,
      scale: 1,
      translateX: '0px',
      translateY: '0px',
    },
    visible: true,
    locked: false,
    animation: {
      preset: 'scale',
      durationSec: 0.8,
      delaySec: 0.2,
      easing: 'power2.out',
      trigger: 'scroll',
      scrollTrigger: true,
      triggerOffset: 'top 85%',
      once: true,
      parallaxSpeed: 0,
      staggerSec: 0,
      loop: false,
    },
    responsive: {},
  },

  // 4. DIVIDER ELEMENT
  {
    id: 'el-test-divider',
    name: 'Monogram Knot Divider',
    content: {
      type: 'divider',
      style: 'floral-knot',
      thicknessPx: 1,
      ornamentText: '✦',
    },
    typography: {
      color: '#a67d2b',
    },
    transform: {
      rotateDeg: 0,
      scale: 1,
      translateX: '0px',
      translateY: '0px',
    },
    visible: true,
    locked: false,
    animation: {
      preset: 'fade',
      durationSec: 0.8,
      delaySec: 0.1,
      easing: 'power2.out',
      trigger: 'scroll',
      scrollTrigger: true,
      triggerOffset: 'top 85%',
      once: true,
      parallaxSpeed: 0,
      staggerSec: 0,
      loop: false,
    },
    responsive: {},
  },

  // 5. IMAGE ELEMENT
  {
    id: 'el-test-image',
    name: 'Portrait Image',
    content: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
      alt: 'Couple Portrait in Garden',
      aspectRatio: '4/3',
      objectFit: 'cover',
      caption: 'The Sacred Courtyard',
    },
    box: {
      borderRadius: '16px',
    },
    transform: {
      rotateDeg: 0,
      scale: 1,
      translateX: '0px',
      translateY: '0px',
    },
    visible: true,
    locked: false,
    animation: {
      preset: 'zoom-in',
      durationSec: 0.8,
      delaySec: 0.2,
      easing: 'power2.out',
      trigger: 'scroll',
      scrollTrigger: true,
      triggerOffset: 'top 85%',
      once: true,
      parallaxSpeed: 0,
      staggerSec: 0,
      loop: false,
    },
    responsive: {},
  },

  // 6. SHAPE ELEMENT
  {
    id: 'el-test-shape',
    name: 'Botanical Arch Shape',
    content: {
      type: 'shape',
      shapeType: 'arch',
      borderColor: '#a67d2b',
      backgroundColor: 'rgba(166, 125, 43, 0.08)',
    },
    box: {
      width: '180px',
      height: '140px',
    },
    transform: {
      rotateDeg: 0,
      scale: 1,
      translateX: '0px',
      translateY: '0px',
    },
    visible: true,
    locked: false,
    animation: {
      preset: 'slide-right',
      durationSec: 0.8,
      delaySec: 0.2,
      easing: 'power2.out',
      trigger: 'scroll',
      scrollTrigger: true,
      triggerOffset: 'top 85%',
      once: true,
      parallaxSpeed: 0,
      staggerSec: 0,
      loop: false,
    },
    responsive: {},
  },

  // 7. SPACER ELEMENT
  {
    id: 'el-test-spacer',
    name: 'Vertical Spacer',
    content: {
      type: 'spacer',
      heightPx: 32,
    },
    transform: {
      rotateDeg: 0,
      scale: 1,
      translateX: '0px',
      translateY: '0px',
    },
    visible: true,
    locked: false,
    responsive: {},
  },

  // 8. BUTTON ELEMENT
  {
    id: 'el-test-button',
    name: 'RSVP Call to Action',
    content: {
      type: 'button',
      label: 'Open RSVP Invitation',
      action: 'open-rsvp',
      variant: 'primary',
      target: '',
    },
    transform: {
      rotateDeg: 0,
      scale: 1,
      translateX: '0px',
      translateY: '0px',
    },
    visible: true,
    locked: false,
    animation: {
      preset: 'pulse',
      durationSec: 1.2,
      delaySec: 0.3,
      easing: 'power1.inOut',
      trigger: 'scroll',
      scrollTrigger: true,
      triggerOffset: 'top 85%',
      once: false,
      parallaxSpeed: 0,
      staggerSec: 0,
      loop: true,
    },
    responsive: {},
  },

  // 9. VIDEO ELEMENT
  {
    id: 'el-test-video',
    name: 'Looping Video Background',
    content: {
      type: 'video',
      url: 'https://pub-4dc8201144ca418fb604349c73e8c724.r2.dev/sacred-garden-loop.mp4',
      autoplay: true,
      loop: true,
      muted: true,
      controls: false,
      playsInline: true,
    },
    transform: {
      rotateDeg: 0,
      scale: 1,
      translateX: '0px',
      translateY: '0px',
    },
    visible: true,
    locked: false,
    animation: {
      preset: 'fade',
      durationSec: 1,
      delaySec: 0.2,
      easing: 'power2.out',
      trigger: 'scroll',
      scrollTrigger: true,
      triggerOffset: 'top 85%',
      once: true,
      parallaxSpeed: 0,
      staggerSec: 0,
      loop: false,
    },
    responsive: {},
  },
];

export default function ElementsTestPage() {
  const theme = ThemeSchema.parse(PRESET_THEMES.sacredGarden);
  const [elements, setElements] = useState<Element[]>(() =>
    initialElements.map((el) => ElementSchema.parse(el))
  );
  const [activeBreakpoint, setActiveBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  // Interactive config mutation triggers for Playwright e2e verification
  const mutateTextElement = () => {
    setElements((prev) =>
      prev.map((el) => {
        if (el.id === 'el-test-text') {
          return {
            ...el,
            content: {
              ...el.content,
              text: 'Customized Sacred Vows Title',
            } as Element['content'],
            typography: {
              ...el.typography,
              fontSize: '44px',
              color: '#008080',
            },
            transform: {
              rotateDeg: 5,
              scale: 1.05,
              translateX: '10px',
              translateY: '15px',
            },
          };
        }
        return el;
      })
    );
  };

  return (
    <ThemeProvider initialTheme={theme}>
      <main className="min-h-screen bg-brand-bg py-8 px-4 flex flex-col items-center">
        {/* Verification Controls Toolbar */}
        <div className="w-full max-w-lg mb-6 p-4 rounded-xl border border-brand-border bg-white shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              id="btn-mutate-text"
              onClick={mutateTextElement}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-primary text-white hover:opacity-90"
            >
              Mutate Text Config
            </button>
          </div>

          <div className="flex gap-2 text-xs">
            <button
              id="btn-bp-desktop"
              onClick={() => setActiveBreakpoint('desktop')}
              className={`px-2.5 py-1 rounded border ${activeBreakpoint === 'desktop' ? 'bg-black text-white' : 'border-gray-300'}`}
            >
              Desktop
            </button>
            <button
              id="btn-bp-mobile"
              onClick={() => setActiveBreakpoint('mobile')}
              className={`px-2.5 py-1 rounded border ${activeBreakpoint === 'mobile' ? 'bg-black text-white' : 'border-gray-300'}`}
            >
              Mobile 380px
            </button>
          </div>
        </div>

        {/* Renderer Canvas Container */}
        <div
          id="render-canvas"
          className="w-full max-w-[460px] p-6 rounded-3xl border border-brand-border bg-brand-surface shadow-xl space-y-4"
        >
          {elements.map((el) => (
            <ElementRenderer
              key={el.id}
              element={el}
              theme={theme}
              breakpoint={activeBreakpoint}
            />
          ))}
        </div>
      </main>
    </ThemeProvider>
  );
}
