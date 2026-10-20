export interface ChildDetail {
  name: string;
  age?: number | string;
}

export interface RsvpSubmissionPayload {
  invitationId?: string;
  slug?: string;
  guestToken?: string;
  name: string;
  email?: string;
  phone?: string;
  attending: boolean;
  guestCount?: number;
  dietary?: string;
  songRequest?: string;
  childrenDetails?: ChildDetail[];
  answers?: Record<string, unknown>;
  hp_website?: string; // Honeypot trap field (must be empty)
}

export interface RsvpRecord {
  id: string;
  invitation_id: string;
  guest_token?: string;
  name: string;
  email?: string;
  phone?: string;
  attending: boolean;
  guest_count: number;
  dietary_restrictions?: string;
  song_request?: string;
  children_details: ChildDetail[];
  answers: Record<string, unknown>;
  created_at: string;
}

// In-memory storage across Next.js route re-evaluations
const globalForRsvp = (typeof globalThis !== 'undefined' ? globalThis : global) as unknown as {
  __kardovo_rsvps?: RsvpRecord[];
};

if (!globalForRsvp.__kardovo_rsvps) {
  globalForRsvp.__kardovo_rsvps = [
    {
      id: 'rsvp-1',
      invitation_id: 'inv-sacred-garden',
      guest_token: 'vip-rose-1',
      name: 'Lord Henry Sterling',
      email: 'henry@kewgardens.co.uk',
      attending: true,
      guest_count: 2,
      dietary_restrictions: 'Vegetarian',
      song_request: 'Clair de Lune',
      children_details: [],
      answers: {},
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'rsvp-2',
      invitation_id: 'inv-sacred-garden',
      guest_token: '',
      name: 'Lady Catherine de Bourgh',
      email: 'catherine@rosings.com',
      attending: false,
      guest_count: 0,
      dietary_restrictions: '',
      song_request: '',
      children_details: [],
      answers: {},
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
  ];
}

class RsvpRepository {
  private get rsvps(): RsvpRecord[] {
    return globalForRsvp.__kardovo_rsvps!;
  }

  private set rsvps(val: RsvpRecord[]) {
    globalForRsvp.__kardovo_rsvps = val;
  }

  public getAll(): RsvpRecord[] {
    return [...this.rsvps];
  }

  public getByInvitation(invitationId: string): RsvpRecord[] {
    return this.rsvps.filter((r) => r.invitation_id === invitationId);
  }

  public create(payload: RsvpSubmissionPayload): RsvpRecord {
    const record: RsvpRecord = {
      id: `rsvp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      invitation_id: payload.invitationId || 'inv-sacred-garden',
      guest_token: payload.guestToken || '',
      name: payload.name,
      email: payload.email || '',
      phone: payload.phone || '',
      attending: payload.attending,
      guest_count: payload.attending ? (payload.guestCount ?? 1) : 0,
      dietary_restrictions: payload.dietary || '',
      song_request: payload.songRequest || '',
      children_details: payload.childrenDetails || [],
      answers: payload.answers || {},
      created_at: new Date().toISOString(),
    };

    // Prepend to list
    this.rsvps = [record, ...this.rsvps];
    return record;
  }

  public delete(id: string): boolean {
    const initial = this.rsvps.length;
    this.rsvps = this.rsvps.filter((r) => r.id !== id);
    return this.rsvps.length < initial;
  }

  public update(id: string, updates: Partial<RsvpRecord>): RsvpRecord | null {
    const idx = this.rsvps.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    const existing = this.rsvps[idx];
    if (!existing) return null;
    const updated: RsvpRecord = { ...existing, ...updates, id: existing.id, invitation_id: existing.invitation_id };
    this.rsvps[idx] = updated;
    return updated;
  }
}

export interface GuestRecord {
  id: string;
  token: string;
  name: string;
  email?: string;
  seats: number;
}

const mockGuests: Record<string, GuestRecord> = {
  'vip-rose-1': {
    id: 'g-1',
    token: 'vip-rose-1',
    name: 'Lord Henry Sterling',
    email: 'henry@kewgardens.co.uk',
    seats: 2,
  },
  'duchess-clara': {
    id: 'g-2',
    token: 'duchess-clara',
    name: 'Duchess Clara of Sussex',
    email: 'clara@sussex.co.uk',
    seats: 3,
  },
};

export function lookupGuestByToken(token: string): GuestRecord | null {
  if (!token) return null;
  return mockGuests[token] || null;
}

export const rsvpStore = new RsvpRepository();
