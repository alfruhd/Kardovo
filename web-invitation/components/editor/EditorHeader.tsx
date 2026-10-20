'use client';

import React from 'react';
import { useEditor } from './EditorContext';
import {
  Undo2,
  Redo2,
  Save,
  Download,
  Upload,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export function EditorHeader() {
  const {
    config,
    canUndo,
    canRedo,
    undo,
    redo,
    saveConfig,
    exportJson,
    importJson,
    isDirty,
    lastSavedAt,
    errorMessage,
    setErrorMessage,
  } = useEditor();

  const handleExport = () => {
    const jsonStr = exportJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.meta.slug || 'invitation'}-config.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importJson(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="h-14 border-b border-stone-200 bg-white px-4 flex items-center justify-between z-30 select-none">
      {/* Brand & Document Name */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center text-white font-serif font-bold text-sm">
          K
        </div>
        <div>
          <h1 className="text-sm font-semibold text-stone-900 leading-tight">
            {config.meta.title}
          </h1>
          <p className="text-[11px] text-stone-400 font-mono">
            /{config.meta.slug} • v{config.version}
          </p>
        </div>
      </div>

      {/* Center Feedback Notice */}
      {errorMessage && (
        <div
          id="editor-error-banner"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs max-w-md truncate"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="ml-2 font-bold hover:text-red-900 text-xs"
          >
            ×
          </button>
        </div>
      )}

      {/* Action Controls */}
      <div className="flex items-center gap-2 text-xs">
        {/* Undo / Redo */}
        <div className="flex items-center rounded-lg border border-stone-200 bg-stone-50 p-0.5">
          <button
            id="btn-undo"
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent text-stone-700 transition"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            id="btn-redo"
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className="p-1.5 rounded hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent text-stone-700 transition"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* JSON Import / Export */}
        <label
          htmlFor="json-import-input"
          title="Import JSON config"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 cursor-pointer font-medium transition"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Import</span>
          <input
            id="json-import-input"
            type="file"
            accept=".json,application/json"
            onChange={handleImport}
            className="hidden"
          />
        </label>

        <button
          id="btn-export-json"
          onClick={handleExport}
          title="Export JSON config"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 font-medium transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>

        {/* Save Status & Button */}
        <div className="flex items-center gap-2 pl-2">
          {lastSavedAt && !isDirty && (
            <span className="flex items-center gap-1 text-[11px] text-emerald-600">
              <CheckCircle2 className="w-3 h-3" />
              <span>Saved</span>
            </span>
          )}
          {isDirty && (
            <span className="text-[11px] text-amber-600 font-medium">Unsaved</span>
          )}
          <button
            id="btn-save"
            onClick={saveConfig}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-medium transition shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
        </div>
      </div>
    </header>
  );
}
