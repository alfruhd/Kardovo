import { Asset } from '@/lib/schema';

export interface AssetRecord extends Asset {
  invitation_id: string;
  name: string;
  created_at: string;
  poster_url?: string;
  variants?: Array<{ format: string; width: number; height: number; url: string; sizeBytes: number }>;
}

// Global in-memory storage for assets across Next.js re-evaluations
const globalForAssets = (typeof globalThis !== 'undefined' ? globalThis : global) as unknown as {
  __kardovo_assets?: AssetRecord[];
};

if (!globalForAssets.__kardovo_assets) {
  globalForAssets.__kardovo_assets = [
    {
      id: 'asset-hero-video',
      invitation_id: 'inv-sacred-garden',
      name: 'Sacred Garden Video Loop',
      url: 'https://pub-4dc8201144ca418fb604349c73e8c724.r2.dev/sacred-garden-loop.mp4',
      poster_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      type: 'video',
      mimeType: 'video/mp4',
      sizeBytes: 14200000,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'asset-closing-photo',
      invitation_id: 'inv-sacred-garden',
      name: 'Couple Farewell Photo',
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      type: 'image',
      mimeType: 'image/jpeg',
      width: 800,
      height: 1000,
      sizeBytes: 345000,
      created_at: new Date(Date.now() - 21600000).toISOString(),
    },
    {
      id: 'asset-hero-audio',
      invitation_id: 'inv-sacred-garden',
      name: 'Einaudi - Divenire Theme',
      url: 'https://pub-4dc8201144ca418fb604349c73e8c724.r2.dev/Einaudi_%20Divenire%20(1)%20(1).mp3',
      type: 'audio',
      mimeType: 'audio/mp3',
      sizeBytes: 5400000,
      created_at: new Date(Date.now() - 43200000).toISOString(),
    },
  ];
}

class AssetRepository {
  private get assets(): AssetRecord[] {
    return globalForAssets.__kardovo_assets!;
  }

  private set assets(val: AssetRecord[]) {
    globalForAssets.__kardovo_assets = val;
  }

  public getAll(): AssetRecord[] {
    return [...this.assets];
  }

  public getByInvitation(invitationId: string): AssetRecord[] {
    return this.assets.filter((a) => a.invitation_id === invitationId);
  }

  public getById(id: string): AssetRecord | null {
    return this.assets.find((a) => a.id === id) || null;
  }

  public create(record: AssetRecord): AssetRecord {
    this.assets = [record, ...this.assets];
    return record;
  }

  public update(id: string, updates: Partial<AssetRecord>): AssetRecord | null {
    const idx = this.assets.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    const existing = this.assets[idx];
    if (!existing) return null;
    const updated: AssetRecord = {
      ...existing,
      ...updates,
      id: existing.id,
      invitation_id: existing.invitation_id,
    };
    this.assets[idx] = updated;
    return updated;
  }

  public delete(id: string): boolean {
    const initial = this.assets.length;
    this.assets = this.assets.filter((a) => a.id !== id);
    return this.assets.length < initial;
  }
}

export const assetStore = new AssetRepository();
