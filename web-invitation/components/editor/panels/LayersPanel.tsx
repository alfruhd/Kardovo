'use client';

import React from 'react';
import { useEditor } from '../EditorContext';
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  Plus,
} from 'lucide-react';

export function LayersPanel() {
  const {
    config,
    selectedElementId,
    setSelectedElementId,
    updateElement,
    deleteElement,
    duplicateElement,
    addSection,
    duplicateSection,
    deleteSection,
    reorderSection,
  } = useEditor();

  const handleToggleVisible = (elementId: string, current: boolean) => {
    updateElement(elementId, (el) => ({ ...el, visible: !current }));
  };

  const handleToggleLock = (elementId: string, current: boolean) => {
    updateElement(elementId, (el) => ({ ...el, locked: !current }));
  };

  const handleRename = (elementId: string, newName: string) => {
    updateElement(elementId, (el) => ({ ...el, name: newName }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-stone-200 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">Sections & Layers</h3>
        <button
          id="btn-add-section-quick"
          onClick={() => addSection('hero', 'New Hero Section')}
          className="flex items-center gap-1 text-[11px] font-semibold text-brand-primary hover:underline"
        >
          <Plus className="w-3 h-3" />
          <span>Add Section</span>
        </button>
      </div>

      <div className="space-y-4">
        {config.sections.map((section, secIdx) => (
          <div
            key={section.id}
            data-layer-section={section.id}
            className="rounded-xl border border-stone-200 bg-stone-50/70 overflow-hidden"
          >
            {/* Section Header Row */}
            <div className="px-3 py-2 bg-stone-100/90 flex items-center justify-between text-xs font-medium text-stone-800 border-b border-stone-200">
              <span className="truncate max-w-[140px] font-semibold">{section.name}</span>

              <div className="flex items-center gap-1 text-stone-500">
                <button
                  id={`btn-sec-up-${section.id}`}
                  onClick={() => reorderSection(section.id, 'up')}
                  disabled={secIdx === 0}
                  title="Move section up"
                  className="p-1 hover:text-stone-900 disabled:opacity-30"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  id={`btn-sec-down-${section.id}`}
                  onClick={() => reorderSection(section.id, 'down')}
                  disabled={secIdx === config.sections.length - 1}
                  title="Move section down"
                  className="p-1 hover:text-stone-900 disabled:opacity-30"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button
                  id={`btn-sec-duplicate-${section.id}`}
                  onClick={() => duplicateSection(section.id)}
                  title="Duplicate section"
                  className="p-1 hover:text-stone-900"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  id={`btn-sec-delete-${section.id}`}
                  onClick={() => deleteSection(section.id)}
                  title="Delete section"
                  className="p-1 hover:text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Elements under Section */}
            <div className="divide-y divide-stone-100">
              {section.elements.map((el) => {
                const isSelected = selectedElementId === el.id;
                return (
                  <div
                    key={el.id}
                    id={`layer-item-${el.id}`}
                    onClick={() => setSelectedElementId(el.id)}
                    className={`px-3 py-2 flex items-center justify-between text-xs cursor-pointer transition ${
                      isSelected
                        ? 'bg-amber-50/80 border-l-4 border-amber-600 font-semibold'
                        : 'hover:bg-white'
                    }`}
                  >
                    <input
                      value={el.name}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleRename(el.id, e.target.value)}
                      className="bg-transparent border-0 focus:ring-1 focus:ring-stone-300 rounded px-1 py-0.5 max-w-[120px] truncate"
                    />

                    <div className="flex items-center gap-1.5 text-stone-400">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleVisible(el.id, el.visible);
                        }}
                        className="hover:text-stone-700"
                      >
                        {el.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-stone-300" />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleLock(el.id, el.locked);
                        }}
                        className="hover:text-stone-700"
                      >
                        {el.locked ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateElement(el.id);
                        }}
                        className="hover:text-stone-700"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteElement(el.id);
                        }}
                        className="hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {section.elements.length === 0 && (
                <div className="px-3 py-2 text-[11px] text-stone-400 italic">No elements in section</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
