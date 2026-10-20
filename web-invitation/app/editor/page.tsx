'use client';

import React from 'react';
import { EditorProvider, EditorHeader, EditorCanvas, EditorSidebar } from '@/components/editor';
import { sampleInvitationConfig } from '@/config/sample-invitation';
import { InvitationConfigSchema, InvitationConfig } from '@/lib/schema';

export default function VisualEditorPage() {
  const initialConfig = InvitationConfigSchema.parse(sampleInvitationConfig) as InvitationConfig;

  return (
    <EditorProvider initialConfig={initialConfig}>
      <div id="visual-editor-root" className="h-screen w-screen flex flex-col bg-stone-100 overflow-hidden text-stone-900">
        <EditorHeader />
        <div className="flex-1 flex overflow-hidden relative">
          <EditorCanvas />
          <EditorSidebar />
        </div>
      </div>
    </EditorProvider>
  );
}
