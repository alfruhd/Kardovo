'use client';

import React from 'react';
import { useEditor } from '../EditorContext';
import { ElementAction } from '@/lib/schema';

export function ActionsPanel() {
  const { config, selectedElementId, updateSelectedElement } = useEditor();

  const selectedElement = config.sections
    .flatMap((s) => s.elements)
    .find((el) => el.id === selectedElementId);

  if (!selectedElement) {
    return (
      <div className="text-center py-8 text-xs text-stone-400 italic">
        Select an element to configure click actions and navigation links.
      </div>
    );
  }

  const action = selectedElement.action || { type: 'none', target: '' };

  return (
    <div className="space-y-4">
      <div className="border-b border-stone-200 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">Element Actions</h3>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Trigger Type</label>
          <select
            value={action.type}
            onChange={(e) =>
              updateSelectedElement((el) => ({
                ...el,
                action: { ...el.action, type: e.target.value as ElementAction['type'] },
              }))
            }
            className="w-full text-xs p-2 border border-stone-200 rounded-lg"
          >
            <option value="none">None</option>
            <option value="open-modal">Open RSVP Modal</option>
            <option value="navigate-section">Scroll to Section</option>
            <option value="open-link">Open External URL</option>
            <option value="trigger-audio">Play Audio</option>
          </select>
        </div>

        {action.type === 'open-link' && (
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Target URL</label>
            <input
              type="url"
              placeholder="https://..."
              value={action.target || ''}
              onChange={(e) =>
                updateSelectedElement((el) => ({
                  ...el,
                  action: { ...el.action, type: 'open-link', target: e.target.value },
                }))
              }
              className="w-full text-xs p-2 border border-stone-200 rounded-lg"
            />
          </div>
        )}

        {action.type === 'navigate-section' && (
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Target Section</label>
            <select
              value={action.target || ''}
              onChange={(e) =>
                updateSelectedElement((el) => ({
                  ...el,
                  action: { ...el.action, type: 'navigate-section', target: e.target.value },
                }))
              }
              className="w-full text-xs p-2 border border-stone-200 rounded-lg"
            >
              <option value="">Select section...</option>
              {config.sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.name} ({sec.id})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

export function AdvancedPanel() {
  const { config, selectedElementId, updateSelectedElement } = useEditor();

  const selectedElement = config.sections
    .flatMap((s) => s.elements)
    .find((el) => el.id === selectedElementId);

  if (!selectedElement) {
    return (
      <div className="text-center py-8 text-xs text-stone-400 italic">
        Select an element to edit custom CSS rules and grouping.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border-b border-stone-200 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">Advanced & Custom CSS</h3>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Element ID</label>
          <input
            type="text"
            disabled
            value={selectedElement.id}
            className="w-full text-xs p-2 border border-stone-200 rounded-lg bg-stone-50 font-mono text-stone-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Group Tag</label>
          <input
            type="text"
            placeholder="e.g. hero-names"
            value={selectedElement.group || ''}
            onChange={(e) =>
              updateSelectedElement((el) => ({
                ...el,
                group: e.target.value,
              }))
            }
            className="w-full text-xs p-2 border border-stone-200 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Custom CSS Rules</label>
          <textarea
            rows={5}
            placeholder="filter: drop-shadow(...); mix-blend-mode: multiply;"
            value={selectedElement.customCss || ''}
            onChange={(e) =>
              updateSelectedElement((el) => ({
                ...el,
                customCss: e.target.value,
              }))
            }
            className="w-full text-xs p-2 border border-stone-200 rounded-lg font-mono"
          />
        </div>
      </div>
    </div>
  );
}
