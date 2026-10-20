'use client';

import React from 'react';
import { useEditor } from '../EditorContext';

export function LayoutTransformPanel() {
  const { config, selectedElementId, updateSelectedElement } = useEditor();

  const selectedElement = config.sections
    .flatMap((s) => s.elements)
    .find((el) => el.id === selectedElementId);

  if (!selectedElement) {
    return (
      <div className="text-center py-8 text-xs text-stone-400 italic">
        Select an element to adjust position, rotation, and scale.
      </div>
    );
  }

  const { transform = { translateX: '0px', translateY: '0px', rotateDeg: 0, scale: 1 }, box = {} } = selectedElement;

  return (
    <div className="space-y-4">
      <div className="border-b border-stone-200 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">Position & Transform</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Translate X</label>
          <input
            id="input-transform-x"
            type="text"
            value={transform.translateX}
            onChange={(e) =>
              updateSelectedElement((el) => ({
                ...el,
                transform: { ...el.transform, translateX: e.target.value },
              }))
            }
            className="w-full text-xs p-2 border border-stone-200 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Translate Y</label>
          <input
            id="input-transform-y"
            type="text"
            value={transform.translateY}
            onChange={(e) =>
              updateSelectedElement((el) => ({
                ...el,
                transform: { ...el.transform, translateY: e.target.value },
              }))
            }
            className="w-full text-xs p-2 border border-stone-200 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Rotation (°)</label>
          <input
            id="input-transform-rotate"
            type="number"
            value={transform.rotateDeg}
            onChange={(e) =>
              updateSelectedElement((el) => ({
                ...el,
                transform: { ...el.transform, rotateDeg: parseFloat(e.target.value) || 0 },
              }))
            }
            className="w-full text-xs p-2 border border-stone-200 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Scale</label>
          <input
            id="input-transform-scale"
            type="number"
            step="0.05"
            value={transform.scale}
            onChange={(e) =>
              updateSelectedElement((el) => ({
                ...el,
                transform: { ...el.transform, scale: parseFloat(e.target.value) || 1 },
              }))
            }
            className="w-full text-xs p-2 border border-stone-200 rounded-lg"
          />
        </div>
      </div>

      <div className="pt-2 border-t border-stone-200 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Width</label>
          <input
            type="text"
            placeholder="auto / 100% / 320px"
            value={box.width || ''}
            onChange={(e) =>
              updateSelectedElement((el) => ({
                ...el,
                box: { ...el.box, width: e.target.value },
              }))
            }
            className="w-full text-xs p-2 border border-stone-200 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Height</label>
          <input
            type="text"
            placeholder="auto / 200px"
            value={box.height || ''}
            onChange={(e) =>
              updateSelectedElement((el) => ({
                ...el,
                box: { ...el.box, height: e.target.value },
              }))
            }
            className="w-full text-xs p-2 border border-stone-200 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
