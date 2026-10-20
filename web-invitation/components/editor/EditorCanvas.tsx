'use client';

import React, { useRef, useEffect } from 'react';
import { useEditor } from './EditorContext';
import { SectionRenderer } from '@/components/sections';
import { ThemeProvider } from '@/lib/theme';
import { Smartphone, Tablet, Monitor, Eye } from 'lucide-react';

export function EditorCanvas() {
  const {
    config,
    activeBreakpoint,
    setActiveBreakpoint,
    selectedElementId,
    setSelectedElementId,
    updateSelectedElement,
  } = useEditor();

  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard nudge & arrow navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedElementId) return;
      // Do not nudge if typing inside an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const step = e.shiftKey ? 10 : 1;
      let dx = 0;
      let dy = 0;

      if (e.key === 'ArrowLeft') dx = -step;
      else if (e.key === 'ArrowRight') dx = step;
      else if (e.key === 'ArrowUp') dy = -step;
      else if (e.key === 'ArrowDown') dy = step;
      else return;

      e.preventDefault();

      updateSelectedElement((el) => {
        const currentX = parseInt(el.transform?.translateX || '0px', 10) || 0;
        const currentY = parseInt(el.transform?.translateY || '0px', 10) || 0;
        return {
          ...el,
          transform: {
            ...el.transform,
            translateX: `${currentX + dx}px`,
            translateY: `${currentY + dy}px`,
          },
        };
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, updateSelectedElement]);

  // Click on canvas background to deselect
  const handleCanvasClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const elementNode = target.closest('[data-element-id]');
    if (elementNode) {
      const id = elementNode.getAttribute('data-element-id');
      if (id) {
        e.stopPropagation();
        setSelectedElementId(id);
      }
    } else {
      setSelectedElementId(null);
    }
  };

  const deviceFrameWidth =
    activeBreakpoint === 'mobile'
      ? 'w-[380px]'
      : activeBreakpoint === 'tablet'
      ? 'w-[768px]'
      : 'w-[1024px]';

  return (
    <div className="flex-1 flex flex-col h-full bg-stone-100/80 overflow-hidden relative">
      {/* Viewport Toolbar */}
      <header className="h-12 border-b border-stone-200 bg-white/90 backdrop-blur px-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-lg border border-stone-200 text-xs">
          <button
            id="btn-device-mobile"
            onClick={() => setActiveBreakpoint('mobile')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
              activeBreakpoint === 'mobile' ? 'bg-white font-medium shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile (380px)</span>
          </button>
          <button
            id="btn-device-tablet"
            onClick={() => setActiveBreakpoint('tablet')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
              activeBreakpoint === 'tablet' ? 'bg-white font-medium shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet (768px)</span>
          </button>
          <button
            id="btn-device-desktop"
            onClick={() => setActiveBreakpoint('desktop')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
              activeBreakpoint === 'desktop' ? 'bg-white font-medium shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-stone-500">
          <a
            href="/preview"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-stone-600 hover:text-brand-primary"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Mode</span>
          </a>
        </div>
      </header>

      {/* Interactive Frame & Scroll Area */}
      <div
        ref={containerRef}
        onClick={handleCanvasClick}
        className="flex-1 overflow-y-auto p-8 flex items-start justify-center relative cursor-default"
      >
        <div
          id="editor-frame"
          className={`${deviceFrameWidth} transition-all duration-300 min-h-[820px] bg-brand-bg text-brand-text shadow-2xl rounded-2xl border-4 border-stone-800/20 overflow-hidden relative flex flex-col`}
        >
          <ThemeProvider initialTheme={config.theme}>
            <div id="editor-page-render" className="w-full flex flex-col relative">
              {config.sections.map((section) => (
                <div key={section.id} className="relative group/sec">
                  <SectionRenderer
                    section={section}
                    theme={config.theme}
                    breakpoint={activeBreakpoint}
                  />
                </div>
              ))}
            </div>
          </ThemeProvider>
        </div>
      </div>
    </div>
  );
}
