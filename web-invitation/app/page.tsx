'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Copy, Eye, Edit3, Sparkles, Plus, Check } from 'lucide-react';

export default function HomePage() {
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [newSlug, setNewSlug] = useState('summer-solstice');
  const [newTitle, setNewTitle] = useState('Alexander & Sophia — Summer Solstice');
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [duplicatedSlug, setDuplicatedSlug] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDuplicate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDuplicating(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'duplicate',
          sourceSlug: 'thesacredgarden',
          newSlug: newSlug.trim().toLowerCase(),
          title: newTitle.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to duplicate invitation');
      }

      setDuplicatedSlug(data.data.slug);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Duplication error';
      setErrorMessage(msg);
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <main className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 flex flex-col items-center">
      {/* Platform Header */}
      <div className="max-w-4xl w-full text-center space-y-3 mb-10">
        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold tracking-wider uppercase inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Kardovo Luxury Invitations
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
          Wedding Invitation Template Gallery
        </h1>
        <p className="text-stone-600 text-sm max-w-xl mx-auto">
          Explore production-ready wedding invitation designs or duplicate one to customize with our visual editor.
        </p>
      </div>

      {/* Template Gallery Grid */}
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Card 1: The Sacred Garden (Reference Template) */}
        <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition flex flex-col">
          {/* Card Visual Header */}
          <div className="h-48 bg-gradient-to-br from-[#5a0f1b] via-[#3a070f] to-[#1c0307] p-6 flex flex-col justify-between text-white relative">
            <span className="self-start px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold tracking-wider uppercase">
              Featured Reference
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#a67d2b] font-serif">
                Botanical Luxury
              </p>
              <h2 className="text-2xl font-serif font-bold mt-0.5">
                The Sacred Garden
              </h2>
              <p className="text-xs text-stone-300">
                Zohan & Rose • 27 . 09 . 2026
              </p>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-2 text-xs text-stone-600">
              <p className="leading-relaxed">
                Complete wedding experience with interactive wax seal envelope gate, Einaudi audio soundtrack, order of events timeline, Google Maps venue, dress code swatches, and conditional RSVP popup.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[11px]">8 Sections</span>
                <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[11px]">Procedural Wax Seal</span>
                <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[11px]">RSVP Form</span>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100">
              <Link
                href="/thesacredgarden"
                className="py-2.5 px-3 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Live</span>
              </Link>
              <button
                id="btn-duplicate-template"
                onClick={() => {
                  setDuplicatedSlug(null);
                  setErrorMessage(null);
                  setDuplicateModalOpen(true);
                }}
                className="py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Duplicate</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Visual Editor Custom Invitation */}
        <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition flex flex-col">
          <div className="h-48 bg-stone-100 border-b border-stone-200 p-6 flex flex-col justify-between text-stone-900 relative">
            <span className="self-start px-2.5 py-0.5 rounded-full bg-stone-200 text-[11px] font-semibold tracking-wider uppercase">
              No-Code Studio
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500 font-mono">
                WYSIWYG Workspace
              </p>
              <h2 className="text-2xl font-serif font-bold text-stone-800 mt-0.5">
                Visual Studio Editor
              </h2>
              <p className="text-xs text-stone-500">
                Responsive Mobile / Tablet / Desktop Canvas
              </p>
            </div>
          </div>

          <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-2 text-xs text-stone-600">
              <p className="leading-relaxed">
                Full visual editor with drag-and-drop layer hierarchy, live SVG wax seal configurator, asset pipeline manager, custom fonts, typography, color harmony generator, and undo/redo history.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[11px]">Undo/Redo (60 Steps)</span>
                <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[11px]">Zod Validation</span>
                <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[11px]">Mobile Preview</span>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100">
              <Link
                href="/editor"
                className="w-full py-2.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Launch Visual Editor</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Duplicate Invitation Modal */}
      {duplicateModalOpen && (
        <div
          id="duplicate-modal-overlay"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Copy className="w-4 h-4 text-stone-800" />
                <h3 className="text-base font-serif font-bold text-stone-900">
                  Duplicate &quot;The Sacred Garden&quot;
                </h3>
              </div>
              <button
                onClick={() => setDuplicateModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                {errorMessage}
              </div>
            )}

            {duplicatedSlug ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Invitation Cloned Successfully!</span>
                </div>
                <p className="text-xs text-emerald-700">
                  Your new invitation is live at <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-200">/{duplicatedSlug}</code>. You can now edit its names, colors, and wax seal without affecting the original.
                </p>
                <div className="flex gap-2 pt-2">
                  <Link
                    href={`/${duplicatedSlug}`}
                    className="flex-1 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold text-center transition"
                  >
                    View Invitation
                  </Link>
                  <Link
                    href="/editor"
                    className="flex-1 py-2 rounded-lg bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100/50 text-xs font-semibold text-center transition"
                  >
                    Customize in Editor
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleDuplicate} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">
                    New Invitation Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
                    placeholder="e.g. Liam & Olivia — Wedding Celebration"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">
                    URL Slug
                  </label>
                  <div className="flex items-center rounded-lg border border-stone-300 overflow-hidden focus-within:ring-2 focus-within:ring-stone-900">
                    <span className="px-3 py-2 bg-stone-50 text-stone-500 font-mono border-r border-stone-300">
                      kardovo.com/
                    </span>
                    <input
                      id="input-new-slug"
                      type="text"
                      required
                      value={newSlug}
                      onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className="w-full px-3 py-2 focus:outline-none font-mono"
                      placeholder="liam-and-olivia"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setDuplicateModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-confirm-duplicate"
                    type="submit"
                    disabled={isDuplicating}
                    className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-medium flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isDuplicating ? 'Duplicating...' : 'Create Copy'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
