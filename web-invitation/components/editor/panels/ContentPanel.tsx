'use client';

import React from 'react';
import { useEditor } from '../EditorContext';

export function ContentPanel() {
  const { config, selectedElementId, updateSelectedElement } = useEditor();

  const selectedElement = config.sections
    .flatMap((s) => s.elements)
    .find((el) => el.id === selectedElementId);

  if (!selectedElement) {
    return (
      <div className="text-center py-8 text-xs text-stone-400 italic">
        Select an element in the preview or layers to edit its content.
      </div>
    );
  }

  const { content } = selectedElement;

  return (
    <div className="space-y-4">
      <div className="border-b border-stone-200 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">Content</h3>
        <p className="text-[11px] text-stone-400 capitalize">{content.type} Element</p>
      </div>

      {content.type === 'text' && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Text String</label>
            <textarea
              id="input-content-text"
              rows={3}
              value={content.text}
              onChange={(e) =>
                updateSelectedElement((el) => {
                  if (el.content.type !== 'text') return el;
                  return {
                    ...el,
                    content: { ...el.content, text: e.target.value },
                  };
                })
              }
              className="w-full text-xs p-2 border border-stone-200 rounded-lg focus:ring-1 focus:ring-stone-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">HTML Tag</label>
            <select
              value={content.tag}
              onChange={(e) =>
                updateSelectedElement((el) => {
                  if (el.content.type !== 'text') return el;
                  return {
                    ...el,
                    content: {
                      ...el.content,
                      tag: e.target.value as 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'quote',
                    },
                  };
                })
              }
              className="w-full text-xs p-2 border border-stone-200 rounded-lg"
            >
              <option value="h1">Heading 1 (h1)</option>
              <option value="h2">Heading 2 (h2)</option>
              <option value="h3">Heading 3 (h3)</option>
              <option value="p">Paragraph (p)</option>
              <option value="span">Inline Span</option>
              <option value="quote">Blockquote</option>
            </select>
          </div>
        </div>
      )}

      {content.type === 'image' && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Image URL</label>
            <input
              type="text"
              value={content.url}
              onChange={(e) =>
                updateSelectedElement((el) => {
                  if (el.content.type !== 'image') return el;
                  return {
                    ...el,
                    content: { ...el.content, url: e.target.value },
                  };
                })
              }
              className="w-full text-xs p-2 border border-stone-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Alt Text (Accessibility)</label>
            <input
              type="text"
              value={content.alt}
              onChange={(e) =>
                updateSelectedElement((el) => {
                  if (el.content.type !== 'image') return el;
                  return {
                    ...el,
                    content: { ...el.content, alt: e.target.value },
                  };
                })
              }
              className="w-full text-xs p-2 border border-stone-200 rounded-lg"
            />
          </div>
        </div>
      )}

      {content.type === 'button' && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Button Label</label>
            <input
              type="text"
              value={content.label}
              onChange={(e) =>
                updateSelectedElement((el) => {
                  if (el.content.type !== 'button') return el;
                  return {
                    ...el,
                    content: { ...el.content, label: e.target.value },
                  };
                })
              }
              className="w-full text-xs p-2 border border-stone-200 rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
