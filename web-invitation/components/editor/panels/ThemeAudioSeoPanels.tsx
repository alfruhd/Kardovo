'use client';

import React from 'react';
import { useEditor } from '../EditorContext';
import { generatePalette } from '@/lib/theme';

export function ThemePanel() {
  const { config, updateConfig } = useEditor();
  const theme = config.theme;

  const handleBaseColorChange = (newBaseColor: string) => {
    try {
      const generated = generatePalette(newBaseColor);
      updateConfig((prev) => ({
        ...prev,
        theme: {
          ...prev.theme,
          baseColor: newBaseColor,
          colors: {
            ...prev.theme.colors,
            ...generated,
          },
        },
      }));
    } catch {
      updateConfig((prev) => ({
        ...prev,
        theme: {
          ...prev.theme,
          baseColor: newBaseColor,
        },
      }));
    }
  };

  const handleColorChange = (key: keyof typeof theme.colors, value: string) => {
    updateConfig((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        colors: {
          ...prev.theme.colors,
          [key]: value,
        },
      },
    }));
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-stone-200 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">Theme & Palette</h3>
        <p className="text-[11px] text-stone-400">Global CSS Variables & Tokens</p>
      </div>

      <div className="space-y-3">
        {/* Base Color Auto-generator */}
        <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
          <label className="block text-xs font-semibold text-stone-800">
            Base Color (Auto-Palette)
          </label>
          <div className="flex items-center gap-2">
            <input
              id="input-theme-base-color"
              type="color"
              value={theme.baseColor || '#5a0f1b'}
              onChange={(e) => handleBaseColorChange(e.target.value)}
              className="w-9 h-9 p-0 border rounded cursor-pointer"
            />
            <input
              type="text"
              value={theme.baseColor || ''}
              onChange={(e) => handleBaseColorChange(e.target.value)}
              placeholder="#5a0f1b"
              className="flex-1 text-xs p-2 border border-stone-200 rounded-lg font-mono"
            />
          </div>
          <span className="text-[10px] text-stone-400 block">
            Changing this regenerates the entire harmonious color palette automatically.
          </span>
        </div>

        {/* Individual Color Swatches */}
        <div className="space-y-2 pt-2">
          {(['primary', 'secondary', 'accent', 'background', 'text', 'border'] as const).map((key) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-600 capitalize">{key}</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={theme.colors[key]?.startsWith('#') ? theme.colors[key] : '#a67d2b'}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="w-6 h-6 p-0 border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={theme.colors[key]}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="w-24 text-xs p-1 border border-stone-200 rounded font-mono text-center"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AudioPanel() {
  const { config, updateConfig } = useEditor();
  const audio = config.audio || {
    enabled: true,
    url: '',
    title: 'Background Soundtrack',
    autoplayOnGesture: true,
    volume: 0.7,
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-stone-200 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">Audio Soundtrack</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-stone-700">Enable Background Audio</label>
          <input
            type="checkbox"
            checked={audio.enabled}
            onChange={(e) =>
              updateConfig((prev) => ({
                ...prev,
                audio: { ...prev.audio, enabled: e.target.checked },
              }))
            }
            className="rounded"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Audio Track URL</label>
          <input
            type="url"
            value={audio.url}
            onChange={(e) =>
              updateConfig((prev) => ({
                ...prev,
                audio: { ...prev.audio, url: e.target.value },
              }))
            }
            className="w-full text-xs p-2 border border-stone-200 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Track Title</label>
          <input
            type="text"
            value={audio.title}
            onChange={(e) =>
              updateConfig((prev) => ({
                ...prev,
                audio: { ...prev.audio, title: e.target.value },
              }))
            }
            className="w-full text-xs p-2 border border-stone-200 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}

export function SeoPanel() {
  const { config, updateConfig } = useEditor();
  const meta = config.meta;

  return (
    <div className="space-y-4">
      <div className="border-b border-stone-200 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">SEO & Metadata</h3>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Page Title</label>
          <input
            type="text"
            value={meta.title}
            onChange={(e) =>
              updateConfig((prev) => ({
                ...prev,
                meta: { ...prev.meta, title: e.target.value },
              }))
            }
            className="w-full text-xs p-2 border border-stone-200 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">URL Slug</label>
          <input
            type="text"
            value={meta.slug}
            onChange={(e) =>
              updateConfig((prev) => ({
                ...prev,
                meta: { ...prev.meta, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') },
              }))
            }
            className="w-full text-xs p-2 border border-stone-200 rounded-lg font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Description</label>
          <textarea
            rows={3}
            value={meta.description}
            onChange={(e) =>
              updateConfig((prev) => ({
                ...prev,
                meta: { ...prev.meta, description: e.target.value },
              }))
            }
            className="w-full text-xs p-2 border border-stone-200 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">OG Share Image URL</label>
          <input
            type="url"
            value={meta.ogImage}
            onChange={(e) =>
              updateConfig((prev) => ({
                ...prev,
                meta: { ...prev.meta, ogImage: e.target.value },
              }))
            }
            className="w-full text-xs p-2 border border-stone-200 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
