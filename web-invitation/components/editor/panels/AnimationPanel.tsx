'use client';

import React from 'react';
import { useEditor } from '../EditorContext';
import { AnimationPreset } from '@/lib/schema';

export function AnimationPanel() {
  const { config, selectedElementId, updateSelectedElement } = useEditor();

  const selectedElement = config.sections
    .flatMap((s) => s.elements)
    .find((el) => el.id === selectedElementId);

  if (!selectedElement) {
    return (
      <div className="text-center py-8 text-xs text-stone-400 italic">
        Select an element to configure GSAP entrance animations.
      </div>
    );
  }

  const { animation = { preset: 'fade-up', durationSec: 0.8, delaySec: 0, easing: 'power2.out' } } = selectedElement;

  return (
    <div className="space-y-4">
      <div className="border-b border-stone-200 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">Entrance Animation</h3>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Preset Effect</label>
          <select
            id="input-animation-preset"
            value={animation.preset}
            onChange={(e) =>
              updateSelectedElement((el) => ({
                ...el,
                animation: { ...el.animation, preset: e.target.value as AnimationPreset },
              }))
            }
            className="w-full text-xs p-2 border border-stone-200 rounded-lg"
          >
            <option value="none">None</option>
            <option value="fade">Fade</option>
            <option value="fade-up">Fade Up</option>
            <option value="fade-down">Fade Down</option>
            <option value="zoom-in">Zoom In</option>
            <option value="zoom-out">Zoom Out</option>
            <option value="slide-left">Slide Left</option>
            <option value="slide-right">Slide Right</option>
            <option value="scale">Scale</option>
            <option value="blur">Blur In</option>
            <option value="pulse">Pulse</option>
            <option value="float">Float</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Duration (s)</label>
            <input
              id="input-animation-duration"
              type="number"
              step="0.1"
              value={animation.durationSec}
              onChange={(e) =>
                updateSelectedElement((el) => ({
                  ...el,
                  animation: { ...el.animation, durationSec: parseFloat(e.target.value) || 0.8 },
                }))
              }
              className="w-full text-xs p-2 border border-stone-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Delay (s)</label>
            <input
              id="input-animation-delay"
              type="number"
              step="0.1"
              value={animation.delaySec}
              onChange={(e) =>
                updateSelectedElement((el) => ({
                  ...el,
                  animation: { ...el.animation, delaySec: parseFloat(e.target.value) || 0 },
                }))
              }
              className="w-full text-xs p-2 border border-stone-200 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Easing</label>
          <select
            value={animation.easing}
            onChange={(e) =>
              updateSelectedElement((el) => ({
                ...el,
                animation: { ...el.animation, easing: e.target.value },
              }))
            }
            className="w-full text-xs p-2 border border-stone-200 rounded-lg"
          >
            <option value="power2.out">Smooth (power2.out)</option>
            <option value="power3.out">Strong (power3.out)</option>
            <option value="back.out(1.7)">Bounce / Overshoot</option>
            <option value="none">Linear</option>
          </select>
        </div>
      </div>
    </div>
  );
}
