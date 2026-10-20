/**
 * Seed Script: Populates the full sample reference wedding invitation
 * "The Sacred Garden" at slug /thesacredgarden
 *
 * Usage:
 *   npx ts-node scripts/seed.ts  (or npm run seed)
 */

import { sampleInvitationConfig } from '../config/sample-invitation';
import { InvitationConfigSchema, InvitationConfig } from '../lib/schema';
import { invitationStore } from '../lib/supabase/invitation-store';

export function runSeed(): InvitationConfig {
  const parsed = InvitationConfigSchema.parse(sampleInvitationConfig) as InvitationConfig;

  invitationStore.set('thesacredgarden', {
    id: 'inv-sacred-garden',
    slug: 'thesacredgarden',
    title: parsed.meta.title,
    is_published: true,
    published_at: new Date().toISOString(),
    config: parsed,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  console.log('✅ Successfully seeded reference invitation:');
  console.log(`   Slug:        /${parsed.meta.slug}`);
  console.log(`   Title:       ${parsed.meta.title}`);
  console.log(`   Couple:      Zohan & Rose`);
  console.log(`   Date:        27 . 09 . 2026`);
  console.log(`   Sections:    ${parsed.sections.length} sections`);
  console.log(`   Audio:       ${parsed.audio?.title}`);
  console.log(`   Schedule:    5:00 PM - 9:00 PM`);

  return parsed;
}

if (require.main === module) {
  runSeed();
}
