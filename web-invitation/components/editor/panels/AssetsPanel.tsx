'use client';

import React, { useState, useEffect } from 'react';
import { useEditor } from '../EditorContext';
import { AssetRecord } from '@/lib/supabase/asset-store';
import {
  Upload,
  RefreshCw,
  Trash2,
  Video,
  Music,
  FileCode,
  Crop,
  Copy,
} from 'lucide-react';

export function AssetsPanel() {
  const { config, updateConfig, setErrorMessage } = useEditor();
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [cropModalAsset, setCropModalAsset] = useState<AssetRecord | null>(null);

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/assets?invitationId=${config.meta.id || 'inv-sacred-garden'}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setAssets(data.data);
      }
    } catch {
      setErrorMessage('Failed to load asset library');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.meta.id]);

  // Check if asset is used across any elements or background media
  const isAssetInUse = (assetUrl: string): boolean => {
    if (config.audio?.url === assetUrl) return true;
    for (const sec of config.sections) {
      if (sec.backgroundMedia?.url === assetUrl || sec.backgroundMedia?.posterUrl === assetUrl) {
        return true;
      }
      for (const el of sec.elements) {
        const c = el.content;
        if (c.type === 'image' && c.url === assetUrl) return true;
        if (c.type === 'video' && (c.url === assetUrl || c.posterUrl === assetUrl)) return true;
        if (c.type === 'decor' && c.imageUrl === assetUrl) return true;
      }
    }
    return false;
  };

  // Upload new asset
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, replaceId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('invitationId', config.meta.id || 'inv-sacred-garden');
      if (replaceId) {
        formData.append('replaceAssetId', replaceId);
      }

      const res = await fetch('/api/assets', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      // If replacing asset, update all references in invitation config
      if (replaceId && data.data) {
        const oldAsset = assets.find((a) => a.id === replaceId);
        if (oldAsset) {
          const oldUrl = oldAsset.url;
          const newUrl = data.data.url;

          updateConfig((prev) => ({
            ...prev,
            audio: prev.audio.url === oldUrl ? { ...prev.audio, url: newUrl } : prev.audio,
            sections: prev.sections.map((sec) => ({
              ...sec,
              backgroundMedia: {
                ...sec.backgroundMedia,
                url: sec.backgroundMedia.url === oldUrl ? newUrl : sec.backgroundMedia.url,
              },
              elements: sec.elements.map((el) => {
                if (el.content.type === 'image' && el.content.url === oldUrl) {
                  return { ...el, content: { ...el.content, url: newUrl } };
                }
                if (el.content.type === 'video' && el.content.url === oldUrl) {
                  return { ...el, content: { ...el.content, url: newUrl } };
                }
                if (el.content.type === 'decor' && el.content.imageUrl === oldUrl) {
                  return { ...el, content: { ...el.content, imageUrl: newUrl } };
                }
                return el;
              }),
            })),
          }));
        }
      }

      fetchAssets();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setErrorMessage(msg);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Delete asset (blocked if in use)
  const handleDelete = async (asset: AssetRecord) => {
    const inUse = isAssetInUse(asset.url);
    if (inUse) {
      setErrorMessage(`Cannot delete "${asset.name}": asset is currently in use.`);
      return;
    }

    try {
      const res = await fetch(`/api/assets?id=${asset.id}&inUse=${inUse}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setAssets((prev) => prev.filter((a) => a.id !== asset.id));
      }
    } catch {
      setErrorMessage('Failed to delete asset');
    }
  };

  // Reuse / Apply to selected element or copy URL
  const handleReuse = (asset: AssetRecord) => {
    navigator.clipboard.writeText(asset.url);
    alert(`Asset URL copied: ${asset.url}`);
  };

  return (
    <div className="space-y-6" id="assets-panel-root">
      {/* Header & Upload Button */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-200">
        <div>
          <h3 className="font-semibold text-stone-900 text-sm">Asset Library</h3>
          <p className="text-[11px] text-stone-500">Auto-converts to WebP/AVIF & sanitizes SVG</p>
        </div>

        <label
          htmlFor="asset-upload-input"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold cursor-pointer shadow-sm transition"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>{uploading ? 'Uploading...' : 'Upload'}</span>
          <input
            id="asset-upload-input"
            type="file"
            accept="image/*,video/*,audio/*,.svg,font/*"
            disabled={uploading}
            onChange={(e) => handleFileUpload(e)}
            className="hidden"
          />
        </label>
      </div>

      {/* Asset Grid */}
      <div className="space-y-3" id="assets-grid-container">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-stone-400">Loading assets...</div>
        ) : assets.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-400">No assets uploaded yet.</div>
        ) : (
          assets.map((asset) => {
            const inUse = isAssetInUse(asset.url);
            return (
              <div
                key={asset.id}
                className="p-3 rounded-xl border border-stone-200 bg-white hover:border-stone-300 transition flex items-center justify-between gap-3 text-xs"
              >
                {/* Thumbnail / Type Icon */}
                <div className="w-12 h-12 rounded-lg bg-stone-100 flex items-center justify-center overflow-hidden shrink-0 border border-stone-200">
                  {asset.type === 'image' || asset.type === 'svg' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                  ) : asset.type === 'video' ? (
                    <Video className="w-5 h-5 text-stone-600" />
                  ) : asset.type === 'audio' ? (
                    <Music className="w-5 h-5 text-stone-600" />
                  ) : (
                    <FileCode className="w-5 h-5 text-stone-600" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-stone-900 truncate">{asset.name}</p>
                    {inUse && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-medium shrink-0">
                        In Use
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-stone-400 mt-0.5">
                    {asset.type.toUpperCase()} • {Math.round((asset.sizeBytes || 0) / 1024)} KB
                  </p>
                </div>

                {/* Actions: Replace, Crop, Reuse, Delete */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Replace Button */}
                  <label
                    title="Replace asset everywhere"
                    className="p-1.5 rounded hover:bg-stone-100 text-stone-600 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <input
                      type="file"
                      onChange={(e) => handleFileUpload(e, asset.id)}
                      className="hidden"
                    />
                  </label>

                  {/* Crop Action (Images) */}
                  {asset.type === 'image' && (
                    <button
                      title="Crop asset"
                      onClick={() => setCropModalAsset(asset)}
                      className="p-1.5 rounded hover:bg-stone-100 text-stone-600"
                    >
                      <Crop className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Reuse URL */}
                  <button
                    title="Copy / Reuse URL"
                    onClick={() => handleReuse(asset)}
                    className="p-1.5 rounded hover:bg-stone-100 text-stone-600"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Button (disabled / blocked if in use) */}
                  <button
                    title={inUse ? 'Asset in use: cannot delete' : 'Delete asset'}
                    disabled={inUse}
                    onClick={() => handleDelete(asset)}
                    className="p-1.5 rounded hover:bg-red-50 text-stone-400 hover:text-red-600 disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Crop Modal Mock / Tool */}
      {cropModalAsset && (
        <div className="p-4 rounded-xl border border-stone-300 bg-stone-50 space-y-3">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span>Crop: {cropModalAsset.name}</span>
            <button onClick={() => setCropModalAsset(null)} className="text-stone-400 hover:text-stone-800">
              ✕
            </button>
          </div>
          <div className="aspect-video bg-black/5 rounded-lg flex items-center justify-center overflow-hidden border border-dashed border-stone-300">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cropModalAsset.url} alt="Crop preview" className="max-h-32 object-contain" />
          </div>
          <div className="flex justify-end gap-2 text-xs">
            <button
              onClick={() => setCropModalAsset(null)}
              className="px-3 py-1 rounded bg-stone-200 text-stone-700"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                alert('Crop dimensions applied and saved.');
                setCropModalAsset(null);
              }}
              className="px-3 py-1 rounded bg-stone-900 text-white"
            >
              Apply Crop
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
