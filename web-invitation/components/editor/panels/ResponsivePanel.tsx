'use client';

import React from 'react';
import { useEditor } from '../EditorContext';
import { Breakpoint } from '@/lib/schema';

export function ResponsivePanel() {
  const { config, selectedElementId, updateSelectedElement, activeBreakpoint, setActiveBreakpoint } = useEditor();

  const selectedElement = config.sections
    .flatMap((s) => s.elements)
    .find((el) => el.id === selectedElementId);

  if (!selectedElement) {
    return (
      <div className="text-center py-8 text-xs text-stone-400 italic">
        Select an element to configure breakpoint overrides.
      </div>
    );
  }

  const overrides = selectedElement.responsive || {};
  const currentOverride = overrides[activeBreakpoint] || {};

  const handleUpdateCurrentOverride = (updater: (prev: typeof currentOverride) => typeof currentOverride) => {
    updateSelectedElement((el) => {
      const existingResp = el.responsive || {};
      const updatedCurr = updater(existingResp[activeBreakpoint] || {});
      return {
        ...el,
        responsive: {
          ...existingResp,
          [activeBreakpoint]: updatedCurr,
        },
      };
    });
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-stone-200 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">Responsive Overrides</h3>
        <p className="text-[11px] text-stone-400">
          Targeting: <strong className="capitalize text-stone-800">{activeBreakpoint}</strong>
        </p>
      </div>

      <div className="flex gap-1.5 p-1 bg-stone-100 rounded-lg text-xs">
        {(['mobile', 'tablet', 'desktop'] as Breakpoint[]).map((bp) => (
          <button
            key={bp}
            id={`btn-target-bp-${bp}`}
            onClick={() => setActiveBreakpoint(bp)}
            className={`flex-1 py-1 rounded capitalize transition ${
              activeBreakpoint === bp ? 'bg-white font-semibold text-stone-900 shadow-sm' : 'text-stone-500'
            }`}
          >
            {bp}
          </button>
        ))}
      </div>

      <div className="space-y-3 pt-2">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Override Font Size ({activeBreakpoint})
          </label>
          <input
            id="input-override-font-size"
            type="text"
            placeholder="e.g. 14px"
            value={currentOverride.typography?.fontSize || ''}
            onChange={(e) =>
              handleUpdateCurrentOverride((prev) => ({
                ...prev,
                typography: { ...prev.typography, fontSize: e.target.value },
              }))
            }
            className="w-full text-xs p-2 border border-stone-200 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Override Color ({activeBreakpoint})
          </label>
          <input
            id="input-override-color"
            type="text"
            placeholder="e.g. #ff0000"
            value={currentOverride.typography?.color || ''}
            onChange={(e) =>
              handleUpdateCurrentOverride((prev) => ({
                ...prev,
                typography: { ...prev.typography, color: e.target.value },
              }))
            }
            className="w-full text-xs p-2 border border-stone-200 rounded-lg font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Visibility on {activeBreakpoint}
          </label>
          <select
            id="select-override-visibility"
            value={currentOverride.visible === false ? 'hide' : 'show'}
            onChange={(e) =>
              handleUpdateCurrentOverride((prev) => ({
                ...prev,
                visible: e.target.value === 'show',
              }))
            }
            className="w-full text-xs p-2 border border-stone-200 rounded-lg"
          >
            <option value="show">Visible</option>
            <option value="hide">Hidden</option>
          </select>
        </div>
      </div>
    </div>
  );
}
