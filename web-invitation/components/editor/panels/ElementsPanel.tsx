'use client';

import React from 'react';
import { useEditor } from '../EditorContext';
import { Plus, Type, Image as ImageIcon, Minus, Square, Clock, Stamp } from 'lucide-react';
import { Element, ElementContent, SealConfigSchema } from '@/lib/schema';

export function ElementsPanel() {
  const { config, addElement, selectedSectionId } = useEditor();
  const targetSectionId = selectedSectionId || config.sections[0]?.id;

  const handleAdd = (name: string, content: ElementContent) => {
    if (!targetSectionId) return;
    const newEl: Element = {
      id: `el-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name,
      content,
      typography: {
        fontSize: '16px',
        color: '#4a3525',
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
      animation: {
        preset: 'fade-up',
        durationSec: 0.8,
        delaySec: 0,
        easing: 'power2.out',
        trigger: 'scroll',
        scrollTrigger: true,
        triggerOffset: 'top 85%',
        once: true,
        parallaxSpeed: 0,
        staggerSec: 0,
        loop: false,
      },
      visible: true,
      locked: false,
      responsive: {},
    };
    addElement(targetSectionId, newEl);
  };

  const paletteItems = [
    {
      title: 'Heading Text',
      icon: Type,
      action: () => handleAdd('Heading', { type: 'text', text: 'Ceremony & Celebration', tag: 'h2' }),
    },
    {
      title: 'Body Text',
      icon: Type,
      action: () => handleAdd('Paragraph', { type: 'text', text: 'We warmly invite you to share this sacred moment.', tag: 'p' }),
    },
    {
      title: 'Decorative Image',
      icon: ImageIcon,
      action: () =>
        handleAdd('Image', {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
          alt: 'Wedding portrait',
          aspectRatio: '16/9',
          objectFit: 'cover',
        }),
    },
    {
      title: 'Ornamental Divider',
      icon: Minus,
      action: () =>
        handleAdd('Divider', {
          type: 'divider',
          style: 'floral-knot',
          thicknessPx: 1,
          ornamentText: '&',
        }),
    },
    {
      title: 'Action Button',
      icon: Square,
      action: () =>
        handleAdd('Button', {
          type: 'button',
          label: 'RSVP Now',
          action: 'open-rsvp',
          variant: 'primary',
          target: '',
        }),
    },
    {
      title: 'Procedural Wax Seal',
      icon: Stamp,
      action: () =>
        handleAdd('Wax Seal', {
          type: 'seal',
          action: 'open-rsvp',
          pulseHint: true,
          seal: SealConfigSchema.parse({
            initials: 'Z&R',
            baseColor: '#5a0f1b',
            shape: 'round',
            sizePx: 84,
            rotation: 0,
            edgeRoughness: 35,
            rings: 1,
            gloss: 65,
            emboss: 50,
            content: {
              type: 'monogram',
              text: 'Z&R',
              fontFamily: 'Cinzel Decorative',
              fontSize: 22,
              fontWeight: 'bold',
              letterSpacing: '0.05em',
              colorMode: 'auto',
            },
            ribbon: { enabled: false },
            animation: { idle: 'pulse', onClick: 'crack' },
            label: 'Seal',
            interactive: true,
          }),
        }),
    },
    {
      title: 'Countdown Timer',
      icon: Clock,
      action: () =>
        handleAdd('Countdown', {
          type: 'countdown',
          targetDate: '2026-09-27T17:00:00Z',
          timezone: 'Europe/London',
          completedMessage: 'The celebration has begun!',
          layout: 'ornate-boxes',
          digitStyle: 'classic-serif',
          showSeconds: true,
          labels: { days: 'Days', hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds' },
        }),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="border-b border-stone-200 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">Add Element</h3>
        <p className="text-[11px] text-stone-400">Click to append to current section</p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {paletteItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              id={`btn-add-element-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={item.action}
              className="flex items-center gap-3 p-2.5 rounded-xl border border-stone-200 hover:border-brand-primary/50 hover:bg-stone-50 text-left transition group"
            >
              <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600 group-hover:bg-brand-primary group-hover:text-white transition">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-semibold text-stone-800 block">{item.title}</span>
              </div>
              <Plus className="w-3.5 h-3.5 text-stone-400 group-hover:text-brand-primary" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
