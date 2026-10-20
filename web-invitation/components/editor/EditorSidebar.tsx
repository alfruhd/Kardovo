'use client';

import React from 'react';
import { useEditor } from './EditorContext';
import {
  Layers,
  Palette,
  Layout,
  Sparkles,
  Sliders,
  Type,
  Code,
  Music,
  Share2,
  FolderPlus,
  Stamp,
  Globe,
} from 'lucide-react';
import {
  LayersPanel,
  ElementsPanel,
  ContentPanel,
  StylePanel,
  LayoutTransformPanel,
  AnimationPanel,
  ResponsivePanel,
  ActionsPanel,
  AdvancedPanel,
  SealPanel,
  ThemePanel,
  AudioPanel,
  SeoPanel,
  AssetsPanel,
} from './panels';

export function EditorSidebar() {
  const { activeTab, setActiveTab, selectedElementId } = useEditor();

  const navItems = [
    { id: 'layers', label: 'Layers', icon: Layers },
    { id: 'elements', label: 'Add', icon: FolderPlus },
    { id: 'content', label: 'Content', icon: Type },
    { id: 'style', label: 'Style', icon: Palette },
    { id: 'layout', label: 'Layout', icon: Layout },
    { id: 'animation', label: 'Motion', icon: Sparkles },
    { id: 'responsive', label: 'Breakpoints', icon: Sliders },
    { id: 'seal', label: 'Seal', icon: Stamp },
    { id: 'actions', label: 'Actions', icon: Globe },
    { id: 'advanced', label: 'CSS', icon: Code },
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'assets', label: 'Assets', icon: FolderPlus },
    { id: 'audio', label: 'Audio', icon: Music },
    { id: 'seo', label: 'SEO', icon: Share2 },
  ] as const;

  return (
    <aside className="w-96 border-l border-stone-200 bg-white flex flex-col h-full z-20 shadow-lg select-none">
      {/* Tab Navigation Strip */}
      <div className="h-12 border-b border-stone-200 px-2 flex items-center gap-1 overflow-x-auto no-scrollbar bg-stone-50/50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`tab-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-white text-stone-900 font-semibold shadow-sm border border-stone-200'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Element Notice */}
      {selectedElementId && (
        <div className="px-4 py-2 bg-stone-100/70 border-b border-stone-200 text-[11px] text-stone-600 flex items-center justify-between">
          <span>
            Selected: <code className="font-mono text-stone-800">{selectedElementId}</code>
          </span>
        </div>
      )}

      {/* Active Panel Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeTab === 'layers' && <LayersPanel />}
        {activeTab === 'elements' && <ElementsPanel />}
        {activeTab === 'content' && <ContentPanel />}
        {activeTab === 'style' && <StylePanel />}
        {activeTab === 'layout' && <LayoutTransformPanel />}
        {activeTab === 'animation' && <AnimationPanel />}
        {activeTab === 'responsive' && <ResponsivePanel />}
        {activeTab === 'actions' && <ActionsPanel />}
        {activeTab === 'advanced' && <AdvancedPanel />}
        {activeTab === 'seal' && <SealPanel />}
        {activeTab === 'theme' && <ThemePanel />}
        {activeTab === 'assets' && <AssetsPanel />}
        {activeTab === 'audio' && <AudioPanel />}
        {activeTab === 'seo' && <SeoPanel />}
      </div>
    </aside>
  );
}
