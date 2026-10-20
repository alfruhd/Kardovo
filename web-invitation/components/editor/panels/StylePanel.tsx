'use client';

import React from 'react';
import { useEditor } from '../EditorContext';

export function StylePanel() {
  const { config, selectedElementId, updateSelectedElement } = useEditor();

  const selectedElement = config.sections
    .flatMap((s) => s.elements)
    .find((el) => el.id === selectedElementId);

  if (!selectedElement) {
    return (
      <div className="text-center py-8 text-xs text-stone-400 italic">
        Select an element to edit typography, colors, and borders.
      </div>
    );
  }

  const { typography = {}, box = {} } = selectedElement;

  return (
    <div className="space-y-5">
      <div className="border-b border-stone-200 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">Typography & Style</h3>
      </div>

      {/* Font Family & Color */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Font Family</label>
          <select
            id="input-style-font-family"
            value={typography.fontFamily || 'Cinzel'}
            onChange={(e) =>
              updateSelectedElement((el) => ({
                ...el,
                typography: { ...el.typography, fontFamily: e.target.value },
              }))
            }
            className="w-full text-xs p-2 border border-stone-200 rounded-lg"
          >
            <option value="Cinzel">Cinzel</option>
            <option value="Cinzel Decorative">Cinzel Decorative</option>
            <option value="Cormorant Garamond">Cormorant Garamond</option>
            <option value="system-ui">System Sans</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Font Size</label>
            <input
              id="input-style-font-size"
              type="text"
              value={typography.fontSize || '16px'}
              onChange={(e) =>
                updateSelectedElement((el) => ({
                  ...el,
                  typography: { ...el.typography, fontSize: e.target.value },
                }))
              }
              className="w-full text-xs p-2 border border-stone-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Text Color</label>
            <div className="flex items-center gap-1.5">
              <input
                id="input-style-text-color"
                type="color"
                value={typography.color?.startsWith('#') ? typography.color : '#4a3525'}
                onChange={(e) =>
                  updateSelectedElement((el) => ({
                    ...el,
                    typography: { ...el.typography, color: e.target.value },
                  }))
                }
                className="w-8 h-8 p-0 border rounded cursor-pointer"
              />
              <input
                type="text"
                value={typography.color || '#4a3525'}
                onChange={(e) =>
                  updateSelectedElement((el) => ({
                    ...el,
                    typography: { ...el.typography, color: e.target.value },
                  }))
                }
                className="flex-1 text-xs p-2 border border-stone-200 rounded-lg font-mono"
              />
            </div>
          </div>
        </div>

        {/* Alignment & Transform */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Alignment</label>
            <select
              value={typography.textAlign || 'center'}
              onChange={(e) =>
                updateSelectedElement((el) => ({
                  ...el,
                  typography: {
                    ...el.typography,
                    textAlign: e.target.value as 'left' | 'center' | 'right' | 'justify',
                  },
                }))
              }
              className="w-full text-xs p-2 border border-stone-200 rounded-lg"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Case</label>
            <select
              value={typography.textTransform || 'none'}
              onChange={(e) =>
                updateSelectedElement((el) => ({
                  ...el,
                  typography: {
                    ...el.typography,
                    textTransform: e.target.value as 'none' | 'uppercase' | 'lowercase' | 'capitalize',
                  },
                }))
              }
              className="w-full text-xs p-2 border border-stone-200 rounded-lg"
            >
              <option value="none">None</option>
              <option value="uppercase">UPPERCASE</option>
              <option value="capitalize">Capitalize</option>
            </select>
          </div>
        </div>

        {/* Background & Padding */}
        <div className="pt-2 border-t border-stone-200">
          <label className="block text-xs font-semibold text-stone-700 mb-1">Padding</label>
          <input
            type="text"
            value={box.padding || '0px'}
            onChange={(e) =>
              updateSelectedElement((el) => ({
                ...el,
                box: { ...el.box, padding: e.target.value },
              }))
            }
            className="w-full text-xs p-2 border border-stone-200 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
