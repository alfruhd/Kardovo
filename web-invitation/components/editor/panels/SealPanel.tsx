'use client';

import React from 'react';
import { useEditor } from '../EditorContext';
import { SealShape, SealAnimationIdle, SealAnimationClick } from '@/lib/schema';

export function SealPanel() {
  const { config, selectedElementId, updateSelectedElement } = useEditor();

  const selectedElement = config.sections
    .flatMap((s) => s.elements)
    .find((el) => el.id === selectedElementId && el.content.type === 'seal');

  if (!selectedElement || selectedElement.content.type !== 'seal') {
    return (
      <div className="text-center py-8 text-xs text-stone-400 italic">
        Select a Wax Seal element in the preview or layers to edit procedural SVG shaders, shapes, and monogram.
      </div>
    );
  }

  const seal = selectedElement.content.seal;

  const handleUpdateSeal = (updater: (prev: typeof seal) => typeof seal) => {
    updateSelectedElement((el) => {
      if (el.content.type !== 'seal') return el;
      return {
        ...el,
        content: {
          ...el.content,
          seal: updater(el.content.seal),
        },
      };
    });
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-stone-200 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">Procedural Wax Seal</h3>
        <p className="text-[11px] text-stone-400">SVG shaders, lighting & monograms</p>
      </div>

      <div className="space-y-3">
        {/* Initials & Font */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Initials / Monogram</label>
          <input
            id="input-seal-monogram"
            type="text"
            value={seal.content?.text || seal.initials || 'Z&R'}
            onChange={(e) =>
              handleUpdateSeal((prev) => ({
                ...prev,
                initials: e.target.value,
                content: { ...prev.content, type: 'monogram', text: e.target.value },
              }))
            }
            className="w-full text-xs p-2 border border-stone-200 rounded-lg"
          />
        </div>

        {/* Base Color Picker */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Base Wax Color</label>
          <div className="flex items-center gap-2">
            <input
              id="input-seal-base-color"
              type="color"
              value={seal.baseColor || '#5a0f1b'}
              onChange={(e) =>
                handleUpdateSeal((prev) => ({
                  ...prev,
                  baseColor: e.target.value,
                }))
              }
              className="w-9 h-9 p-0 border rounded cursor-pointer"
            />
            <input
              type="text"
              value={seal.baseColor}
              onChange={(e) =>
                handleUpdateSeal((prev) => ({
                  ...prev,
                  baseColor: e.target.value,
                }))
              }
              className="flex-1 text-xs p-2 border border-stone-200 rounded-lg font-mono"
            />
          </div>
        </div>

        {/* Shape Preset */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Perimeter Shape</label>
          <select
            id="select-seal-shape"
            value={seal.shape}
            onChange={(e) =>
              handleUpdateSeal((prev) => ({
                ...prev,
                shape: e.target.value as SealShape,
              }))
            }
            className="w-full text-xs p-2 border border-stone-200 rounded-lg capitalize"
          >
            <option value="round">Round</option>
            <option value="scalloped">Scalloped (12 Petals)</option>
            <option value="drip">Wax Drip Blobs</option>
            <option value="star">Royal Star</option>
            <option value="organic-rough">Organic Molten</option>
            <option value="oval">Oval</option>
          </select>
        </div>

        {/* Sliders: Roughness, Gloss, Emboss */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
            <span>Roughness (Displacement)</span>
            <span>{seal.edgeRoughness || seal.roughness || 35}%</span>
          </div>
          <input
            id="slider-seal-roughness"
            type="range"
            min="0"
            max="100"
            value={seal.edgeRoughness || seal.roughness || 35}
            onChange={(e) =>
              handleUpdateSeal((prev) => ({
                ...prev,
                edgeRoughness: parseInt(e.target.value, 10),
                roughness: parseInt(e.target.value, 10),
              }))
            }
            className="w-full"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
            <span>Specular Gloss (Lighting)</span>
            <span>{seal.gloss || 65}%</span>
          </div>
          <input
            id="slider-seal-gloss"
            type="range"
            min="0"
            max="100"
            value={seal.gloss || 65}
            onChange={(e) =>
              handleUpdateSeal((prev) => ({
                ...prev,
                gloss: parseInt(e.target.value, 10),
              }))
            }
            className="w-full"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
            <span>Emboss Depth</span>
            <span>{seal.emboss || seal.embossDepth || 45}%</span>
          </div>
          <input
            id="slider-seal-emboss"
            type="range"
            min="0"
            max="100"
            value={seal.emboss || seal.embossDepth || 45}
            onChange={(e) =>
              handleUpdateSeal((prev) => ({
                ...prev,
                emboss: parseInt(e.target.value, 10),
                embossDepth: parseInt(e.target.value, 10),
              }))
            }
            className="w-full"
          />
        </div>

        {/* Animation & Action */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-200">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Idle Motion</label>
            <select
              value={seal.animation?.idle || 'pulse'}
              onChange={(e) =>
                handleUpdateSeal((prev) => ({
                  ...prev,
                  animation: {
                    ...prev.animation,
                    idle: e.target.value as SealAnimationIdle,
                    onClick: prev.animation?.onClick || 'crack',
                  },
                }))
              }
              className="w-full text-xs p-2 border border-stone-200 rounded-lg"
            >
              <option value="none">None</option>
              <option value="pulse">Pulse</option>
              <option value="glow">Glow</option>
              <option value="float">Float</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Click Action</label>
            <select
              value={seal.animation?.onClick || 'crack'}
              onChange={(e) =>
                handleUpdateSeal((prev) => ({
                  ...prev,
                  animation: {
                    ...prev.animation,
                    idle: prev.animation?.idle || 'pulse',
                    onClick: e.target.value as SealAnimationClick,
                  },
                }))
              }
              className="w-full text-xs p-2 border border-stone-200 rounded-lg"
            >
              <option value="crack">Crack</option>
              <option value="melt">Melt</option>
              <option value="spin">Spin</option>
              <option value="fade">Fade</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
