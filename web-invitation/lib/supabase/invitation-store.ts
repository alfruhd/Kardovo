import { InvitationConfig, InvitationConfigSchema } from '@/lib/schema';
import { sampleInvitationConfig } from '@/config/sample-invitation';

export interface InvitationRecord {
  id: string;
  slug: string;
  title: string;
  is_published: boolean;
  published_at?: string;
  config: InvitationConfig;
  created_at: string;
  updated_at: string;
}

// Global in-memory storage for invitations across Next.js re-evaluations
const globalForInvitations = (typeof globalThis !== 'undefined' ? globalThis : global) as unknown as {
  __kardovo_invitations?: Map<string, InvitationRecord>;
};

if (!globalForInvitations.__kardovo_invitations) {
  const initialMap = new Map<string, InvitationRecord>();
  const parsed = InvitationConfigSchema.parse(sampleInvitationConfig) as InvitationConfig;
  
  initialMap.set('thesacredgarden', {
    id: 'inv-sacred-garden',
    slug: 'thesacredgarden',
    title: parsed.meta.title,
    is_published: true,
    published_at: new Date().toISOString(),
    config: parsed,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  globalForInvitations.__kardovo_invitations = initialMap;
}

class InvitationRepository {
  private get store(): Map<string, InvitationRecord> {
    return globalForInvitations.__kardovo_invitations!;
  }

  public getAll(): InvitationRecord[] {
    return Array.from(this.store.values());
  }

  public getBySlug(slug: string): InvitationRecord | null {
    const normalized = slug.toLowerCase().trim();
    return this.store.get(normalized) || null;
  }

  public getById(id: string): InvitationRecord | null {
    for (const record of this.store.values()) {
      if (record.id === id) return record;
    }
    return null;
  }

  public set(slug: string, record: InvitationRecord): void {
    const normalized = slug.toLowerCase().trim();
    this.store.set(normalized, record);
  }

  public isSlugAvailable(slug: string, excludeId?: string): boolean {
    const normalized = slug.toLowerCase().trim();
    const existing = this.store.get(normalized);
    if (!existing) return true;
    if (excludeId && existing.id === excludeId) return true;
    return false;
  }

  public duplicate(sourceSlug: string, newSlug: string, newTitle?: string): InvitationRecord {
    const normalizedSource = sourceSlug.toLowerCase().trim();
    const normalizedTarget = newSlug.toLowerCase().trim();
    
    const source = this.store.get(normalizedSource);
    if (!source) {
      throw new Error(`Source invitation "${sourceSlug}" not found`);
    }

    // Deep clone config
    const clonedConfig: InvitationConfig = JSON.parse(JSON.stringify(source.config));
    const newId = `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    
    clonedConfig.meta.id = newId;
    clonedConfig.meta.slug = normalizedTarget;
    if (newTitle) {
      clonedConfig.meta.title = newTitle;
    }

    const newRecord: InvitationRecord = {
      id: newId,
      slug: normalizedTarget,
      title: newTitle || `${source.title} (Copy)`,
      is_published: false,
      config: clonedConfig,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.store.set(normalizedTarget, newRecord);
    return newRecord;
  }
}

export const invitationStore = new InvitationRepository();
