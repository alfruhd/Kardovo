'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  InvitationConfig,
  InvitationConfigSchema,
  Breakpoint,
  Section,
  Element,
  SectionType,
} from '@/lib/schema';
import { sampleInvitationConfig } from '@/config/sample-invitation';

export interface EditorHistoryState {
  past: InvitationConfig[];
  present: InvitationConfig;
  future: InvitationConfig[];
}

export type SidebarTab =
  | 'layers'
  | 'elements'
  | 'content'
  | 'style'
  | 'layout'
  | 'animation'
  | 'responsive'
  | 'actions'
  | 'advanced'
  | 'seal'
  | 'theme'
  | 'audio'
  | 'seo'
  | 'assets';

export interface EditorContextType {
  config: InvitationConfig;
  selectedElementId: string | null;
  selectedSectionId: string | null;
  activeBreakpoint: Breakpoint;
  activeTab: SidebarTab;
  errorMessage: string | null;
  canUndo: boolean;
  canRedo: boolean;
  isDirty: boolean;
  lastSavedAt: Date | null;
  // Actions
  setSelectedElementId: (id: string | null) => void;
  setSelectedSectionId: (id: string | null) => void;
  setActiveBreakpoint: (bp: Breakpoint) => void;
  setActiveTab: (tab: SidebarTab) => void;
  setErrorMessage: (msg: string | null) => void;
  updateConfig: (updater: (prev: InvitationConfig) => InvitationConfig | Partial<InvitationConfig>) => boolean;
  undo: () => void;
  redo: () => void;
  saveConfig: () => void;
  exportJson: () => string;
  importJson: (jsonString: string) => boolean;
  // Element helpers
  updateElement: (elementId: string, updater: (el: Element) => Element) => boolean;
  updateSelectedElement: (updater: (el: Element) => Element) => boolean;
  deleteElement: (elementId: string) => boolean;
  duplicateElement: (elementId: string) => boolean;
  addElement: (sectionId: string, element: Element) => boolean;
  // Section helpers
  addSection: (type: SectionType, name?: string) => boolean;
  duplicateSection: (sectionId: string) => boolean;
  deleteSection: (sectionId: string) => boolean;
  reorderSection: (sectionId: string, direction: 'up' | 'down') => boolean;
}

const EditorContext = createContext<EditorContextType | null>(null);

const STORAGE_KEY = 'kardovo_editor_invitation_draft';
const MAX_HISTORY = 60;

export function EditorProvider({
  initialConfig,
  children,
}: {
  initialConfig?: InvitationConfig;
  children: React.ReactNode;
}) {
  const baseConfig = initialConfig || (InvitationConfigSchema.parse(sampleInvitationConfig) as InvitationConfig);

  const [history, setHistory] = useState<EditorHistoryState>({
    past: [],
    present: baseConfig,
    future: [],
  });

  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [activeBreakpoint, setActiveBreakpoint] = useState<Breakpoint>('desktop');
  const [activeTab, setActiveTab] = useState<SidebarTab>('layers');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const config = history.present;

  // Restore draft from localStorage if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const validated = InvitationConfigSchema.safeParse(parsed);
          if (validated.success) {
            setHistory({
              past: [],
              present: validated.data as InvitationConfig,
              future: [],
            });
            setLastSavedAt(new Date());
          }
        }
      } catch (err) {
        console.warn('Could not load stored draft', err);
      }
    }
  }, []);

  // Autosave when dirty (debounced)
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!isDirty) return;
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
          setLastSavedAt(new Date());
          setIsDirty(false);
        } catch (err) {
          console.warn('Autosave failed', err);
        }
      }
    }, 1200);

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [config, isDirty]);

  // Master Zod-validated updateConfig
  const updateConfig = useCallback(
    (updater: (prev: InvitationConfig) => InvitationConfig | Partial<InvitationConfig>): boolean => {
      const nextCandidate = updater(config);
      const fullCandidate = { ...config, ...nextCandidate };

      const validation = InvitationConfigSchema.safeParse(fullCandidate);
      if (!validation.success) {
        const msg = validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        setErrorMessage(`Invalid change rejected: ${msg}`);
        return false;
      }

      setErrorMessage(null);
      const validConfig = validation.data as InvitationConfig;

      setHistory((prev) => {
        const newPast = [...prev.past, prev.present];
        if (newPast.length > MAX_HISTORY) {
          newPast.shift();
        }
        return {
          past: newPast,
          present: validConfig,
          future: [],
        };
      });

      setIsDirty(true);
      return true;
    },
    [config]
  );

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;
      const previous = prev.past[prev.past.length - 1];
      if (!previous) return prev;
      const newPast = prev.past.slice(0, prev.past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future],
      };
    });
    setIsDirty(true);
  }, []);

  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;
      const next = prev.future[0];
      if (!next) return prev;
      const newFuture = prev.future.slice(1);
      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture,
      };
    });
    setIsDirty(true);
  }, []);

  const saveConfig = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      setLastSavedAt(new Date());
      setIsDirty(false);
    }
  }, [config]);

  const exportJson = useCallback((): string => {
    return JSON.stringify(config, null, 2);
  }, [config]);

  const importJson = useCallback(
    (jsonString: string): boolean => {
      try {
        const parsed = JSON.parse(jsonString);
        const result = InvitationConfigSchema.safeParse(parsed);
        if (!result.success) {
          setErrorMessage(`Invalid JSON schema: ${result.error.errors[0]?.message}`);
          return false;
        }
        setErrorMessage(null);
        setHistory((prev) => ({
          past: [...prev.past, prev.present],
          present: result.data as InvitationConfig,
          future: [],
        }));
        setIsDirty(true);
        return true;
      } catch (err: unknown) {
        setErrorMessage(`JSON Parse Error: ${err instanceof Error ? err.message : 'Invalid JSON'}`);
        return false;
      }
    },
    []
  );

  // Element actions
  const updateElement = useCallback(
    (elementId: string, updater: (el: Element) => Element): boolean => {
      return updateConfig((prev) => {
        return {
          ...prev,
          sections: prev.sections.map((sec) => ({
            ...sec,
            elements: sec.elements.map((el) => (el.id === elementId ? updater(el) : el)),
          })),
        };
      });
    },
    [updateConfig]
  );

  const updateSelectedElement = useCallback(
    (updater: (el: Element) => Element): boolean => {
      if (!selectedElementId) return false;
      return updateElement(selectedElementId, updater);
    },
    [selectedElementId, updateElement]
  );

  const deleteElement = useCallback(
    (elementId: string): boolean => {
      const ok = updateConfig((prev) => ({
        ...prev,
        sections: prev.sections.map((sec) => ({
          ...sec,
          elements: sec.elements.filter((el) => el.id !== elementId),
        })),
      }));
      if (ok && selectedElementId === elementId) {
        setSelectedElementId(null);
      }
      return ok;
    },
    [updateConfig, selectedElementId]
  );

  const duplicateElement = useCallback(
    (elementId: string): boolean => {
      let duplicated: Element | null = null;
      for (const sec of config.sections) {
        const found = sec.elements.find((el) => el.id === elementId);
        if (found) {
          duplicated = {
            ...found,
            id: `el-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            name: `${found.name} (Copy)`,
          };
          break;
        }
      }
      if (!duplicated) return false;
      const targetCopy = duplicated;

      return updateConfig((prev) => ({
        ...prev,
        sections: prev.sections.map((sec) => {
          const idx = sec.elements.findIndex((el) => el.id === elementId);
          if (idx === -1) return sec;
          const nextEls = [...sec.elements];
          nextEls.splice(idx + 1, 0, targetCopy);
          return { ...sec, elements: nextEls };
        }),
      }));
    },
    [config.sections, updateConfig]
  );

  const addElement = useCallback(
    (sectionId: string, element: Element): boolean => {
      const ok = updateConfig((prev) => ({
        ...prev,
        sections: prev.sections.map((sec) => {
          if (sec.id !== sectionId) return sec;
          return {
            ...sec,
            elements: [...sec.elements, element],
          };
        }),
      }));
      if (ok) {
        setSelectedElementId(element.id);
      }
      return ok;
    },
    [updateConfig]
  );

  // Section actions
  const addSection = useCallback(
    (type: SectionType, name?: string): boolean => {
      const newSec: Section = {
        id: `sec-${type}-${Date.now()}`,
        type,
        name: name || `${type.charAt(0).toUpperCase() + type.slice(1)} Section`,
        visible: true,
        order: config.sections.length + 1,
        backgroundMedia: {
          type: 'none',
          url: '',
          posterUrl: '',
          overlayColor: 'transparent',
          opacity: 1,
          blurPx: 0,
          parallaxSpeed: 0,
        },
        gateOpenAnimation: 'envelope-open',
        elements: [],
        responsive: {},
      };
      return updateConfig((prev) => ({
        ...prev,
        sections: [...prev.sections, newSec],
      }));
    },
    [config.sections.length, updateConfig]
  );

  const duplicateSection = useCallback(
    (sectionId: string): boolean => {
      const target = config.sections.find((s) => s.id === sectionId);
      if (!target) return false;
      const copy: Section = {
        ...target,
        id: `sec-${target.type}-${Date.now()}`,
        name: `${target.name} (Copy)`,
        elements: target.elements.map((el) => ({
          ...el,
          id: `el-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        })),
      };
      return updateConfig((prev) => ({
        ...prev,
        sections: [...prev.sections, copy],
      }));
    },
    [config.sections, updateConfig]
  );

  const deleteSection = useCallback(
    (sectionId: string): boolean => {
      if (config.sections.length <= 1) {
        setErrorMessage('Cannot delete the last remaining section');
        return false;
      }
      return updateConfig((prev) => ({
        ...prev,
        sections: prev.sections.filter((s) => s.id !== sectionId),
      }));
    },
    [config.sections.length, updateConfig]
  );

  const reorderSection = useCallback(
    (sectionId: string, direction: 'up' | 'down'): boolean => {
      return updateConfig((prev) => {
        const idx = prev.sections.findIndex((s) => s.id === sectionId);
        if (idx === -1) return prev;
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= prev.sections.length) return prev;
        const nextSecs = [...prev.sections];
        const [moved] = nextSecs.splice(idx, 1);
        if (moved) nextSecs.splice(targetIdx, 0, moved);
        return {
          ...prev,
          sections: nextSecs,
        };
      });
    },
    [updateConfig]
  );

  return (
    <EditorContext.Provider
      value={{
        config,
        selectedElementId,
        selectedSectionId,
        activeBreakpoint,
        activeTab,
        errorMessage,
        canUndo: history.past.length > 0,
        canRedo: history.future.length > 0,
        isDirty,
        lastSavedAt,
        setSelectedElementId,
        setSelectedSectionId,
        setActiveBreakpoint,
        setActiveTab,
        setErrorMessage,
        updateConfig,
        undo,
        redo,
        saveConfig,
        exportJson,
        importJson,
        updateElement,
        updateSelectedElement,
        deleteElement,
        duplicateElement,
        addElement,
        addSection,
        duplicateSection,
        deleteSection,
        reorderSection,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return ctx;
}
