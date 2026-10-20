'use client';

import React, { useState } from 'react';
import { WaxSeal } from '@/components/seal';
import { SealShape } from '@/lib/schema';
import { exportSvgToPng } from '@/lib/utils/export-svg';

export default function SealTestPage() {
  const [baseColor, setBaseColor] = useState('#5a0f1b');
  const [initials, setInitials] = useState('Z&R');
  const [pngDataUrl, setPngDataUrl] = useState<string | null>(null);

  const shapes: SealShape[] = ['round', 'scalloped', 'drip', 'star'];
  const testColors = ['#5a0f1b', '#1a365d', '#285e61'];

  const handleExportPng = async () => {
    const svgEl = document.querySelector<SVGSVGElement>('#exportable-seal svg');
    if (svgEl) {
      try {
        const dataUrl = await exportSvgToPng(svgEl);
        setPngDataUrl(dataUrl);
      } catch (err) {
        console.error('PNG export failed', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f0e0] text-[#4a3525] p-8 flex flex-col items-center">
      <h1 className="text-2xl font-bold font-serif mb-6">Wax Seal Gallery & Test Suite</h1>

      {/* Dynamic Controls */}
      <div className="flex flex-wrap gap-4 mb-8 bg-white/70 p-4 rounded-xl border border-[#a67d2b]/30">
        <div>
          <label className="block text-xs font-semibold mb-1">Initials:</label>
          <input
            id="input-seal-initials"
            value={initials}
            onChange={(e) => setInitials(e.target.value)}
            className="px-3 py-1.5 border rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Base Color:</label>
          <input
            id="input-seal-color"
            type="color"
            value={baseColor}
            onChange={(e) => setBaseColor(e.target.value)}
            className="w-12 h-9 p-0 border rounded cursor-pointer"
          />
        </div>
        <div className="flex items-end">
          <button
            id="btn-export-png"
            onClick={handleExportPng}
            className="px-4 py-2 bg-[#a67d2b] text-white rounded text-xs font-bold uppercase tracking-wider shadow"
          >
            Export PNG
          </button>
        </div>
      </div>

      {/* 1. Dynamic Config Seal */}
      <section className="mb-10 text-center">
        <h2 className="text-sm uppercase tracking-widest font-semibold mb-3">Live Interactive Seal</h2>
        <div id="exportable-seal" className="p-6 bg-white/50 rounded-2xl border border-stone-200 inline-block shadow-sm">
          <WaxSeal
            id="interactive-seal"
            config={{
              initials,
              baseColor,
              shape: 'round',
              sizePx: 100,
              content: {
                type: 'monogram',
                text: initials,
                fontFamily: 'Cinzel Decorative',
                fontSize: 26,
                fontWeight: 'bold',
                letterSpacing: '0.05em',
                colorMode: 'auto',
              },
              ribbon: { enabled: true, color: '#3a070f', lengthPx: 40, widthPx: 16, angleDeg: 45, style: 'classic-tails' },
              label: 'Interactive Seal',
            }}
          />
        </div>
        {pngDataUrl && (
          <div className="mt-4">
            <span className="text-xs font-bold block mb-1">Exported PNG Preview:</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              id="exported-png-result"
              src={pngDataUrl}
              alt="Exported Wax Seal PNG"
              className="inline-block w-24 h-24 border border-stone-300 rounded shadow"
            />
          </div>
        )}
      </section>

      {/* 2. Visual Matrix: 4 Shapes */}
      <section className="mb-10 w-full max-w-2xl text-center">
        <h2 className="text-sm uppercase tracking-widest font-semibold mb-4">4 Distinct Seal Shapes</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6" id="shapes-matrix">
          {shapes.map((shape) => (
            <div key={shape} className="flex flex-col items-center p-4 bg-white/40 rounded-xl border border-stone-200">
              <span className="text-xs font-serif capitalize mb-3">{shape}</span>
              <WaxSeal
                id={`seal-shape-${shape}`}
                config={{
                  shape,
                  sizePx: 84,
                  baseColor: '#5a0f1b',
                  initials: 'Z&R',
                  content: { type: 'monogram', text: 'Z&R', fontFamily: 'Cinzel Decorative', fontSize: 22, fontWeight: 'bold', letterSpacing: '0.05em', colorMode: 'auto' },
                  label: '',
                  animation: { idle: 'none', onClick: 'crack' },
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* 3. Visual Matrix: 3 Derived Colors */}
      <section className="mb-10 w-full max-w-2xl text-center">
        <h2 className="text-sm uppercase tracking-widest font-semibold mb-4">3 Auto-Derived Color Palettes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6" id="colors-matrix">
          {testColors.map((color, idx) => (
            <div key={color} className="flex flex-col items-center p-4 bg-white/40 rounded-xl border border-stone-200">
              <span className="text-xs font-mono mb-3">{color}</span>
              <WaxSeal
                id={`seal-color-${idx}`}
                config={{
                  baseColor: color,
                  shape: 'scalloped',
                  sizePx: 84,
                  initials: 'M&K',
                  content: { type: 'monogram', text: 'M&K', fontFamily: 'Cinzel Decorative', fontSize: 22, fontWeight: 'bold', letterSpacing: '0.05em', colorMode: 'auto' },
                  label: '',
                  animation: { idle: 'none', onClick: 'crack' },
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* 4. Two Independent Seals with Distinct Configs */}
      <section className="text-center w-full max-w-xl">
        <h2 className="text-sm uppercase tracking-widest font-semibold mb-4">Two Independent Seals on Page</h2>
        <div className="flex justify-center gap-12 p-6 bg-white/50 rounded-2xl border border-stone-200" id="dual-seals">
          <div className="flex flex-col items-center">
            <span className="text-xs font-semibold mb-2">Gate Seal</span>
            <WaxSeal
              id="seal-instance-gate"
              config={{
                baseColor: '#5a0f1b',
                shape: 'round',
                sizePx: 90,
                initials: 'GATE',
                animation: { idle: 'pulse', onClick: 'crack' },
                label: 'Gate Seal',
              }}
            />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs font-semibold mb-2">RSVP Seal</span>
            <WaxSeal
              id="seal-instance-rsvp"
              config={{
                baseColor: '#a67d2b',
                shape: 'scalloped',
                sizePx: 80,
                initials: 'RSVP',
                animation: { idle: 'glow', onClick: 'melt' },
                label: 'RSVP Seal',
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
