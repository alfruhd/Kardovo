import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { pgTestPool, executeQuery } from '@/lib/supabase/db-test';
import { checkRateLimit } from '@/lib/utils/rate-limit';
import { rsvpStore } from '@/lib/supabase/rsvp-store';

describe('Deliverable H: Database Schema, RLS, and Backend Rules', () => {
  beforeAll(async () => {
    try {
      await executeQuery(`
        delete from public.rsvp_responses where invitation_id in ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002');
        delete from public.invitations where id in ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002');
        delete from auth.users where id in ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
      `);
    } catch (e) {
      console.warn('DB cleanup warning (safe to ignore if empty):', e);
    }
  });

  afterAll(async () => {
    try {
      await executeQuery(`
        delete from public.rsvp_responses where invitation_id in ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002');
        delete from public.invitations where id in ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002');
        delete from auth.users where id in ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
      `);
    } catch (e) {
      // ignore
    }
  });

  describe('PostgreSQL Schema & RLS Policies Verification', () => {
    it('verifies that tables (invitations, assets, guests, versions, rsvp_responses) exist in DB', async () => {
      const res = await executeQuery(`
        select table_name from information_schema.tables 
        where table_schema = 'public' and table_name in ('invitations', 'assets', 'guests', 'versions', 'rsvp_responses')
        order by table_name;
      `);
      const tableNames = res.rows.map((r: { table_name: string }) => r.table_name);
      expect(tableNames).toContain('invitations');
      expect(tableNames).toContain('assets');
      expect(tableNames).toContain('guests');
      expect(tableNames).toContain('versions');
      expect(tableNames).toContain('rsvp_responses');
    });

    it('enforces RLS: public can read published invitations, but cannot read unpublished invitations', async () => {
      const client = await pgTestPool.connect();
      try {
        await client.query('begin');
        // Insert Alice into auth.users
        await client.query(`
          insert into auth.users (id, email) values 
          ('11111111-1111-1111-1111-111111111111', 'alice@test.com');
        `);

        // Authenticate as Alice to insert her invitations
        await client.query('set role authenticated_user');
        await client.query("set request.jwt.claim.role = 'authenticated'");
        await client.query("set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111'");

        await client.query(`
          insert into public.invitations (id, slug, user_id, title, config, is_published) values 
          ('00000000-0000-0000-0000-000000000001', 'published-wedding', '11111111-1111-1111-1111-111111111111', 'Published Event', '{}'::jsonb, true),
          ('00000000-0000-0000-0000-000000000002', 'draft-wedding', '11111111-1111-1111-1111-111111111111', 'Draft Event', '{}'::jsonb, false);
        `);

        // Switch to anon role
        await client.query('set role anon_user');
        await client.query("set request.jwt.claim.role = 'anon'");
        await client.query("set request.jwt.claim.sub = ''");

        const anonRes = await client.query('select slug from public.invitations;');
        const anonSlugs = anonRes.rows.map((r: { slug: string }) => r.slug);

        // Anon should see published only
        expect(anonSlugs).toContain('published-wedding');
        expect(anonSlugs).not.toContain('draft-wedding');

        await client.query('rollback');
      } catch (e) {
        await client.query('rollback');
        throw e;
      } finally {
        client.release();
      }
    });

    it('enforces RLS: owners edit only their own invitations, blocking cross-user edits', async () => {
      const client = await pgTestPool.connect();
      try {
        await client.query('begin');
        await client.query(`
          insert into auth.users (id, email) values 
          ('11111111-1111-1111-1111-111111111111', 'alice@test.com'),
          ('22222222-2222-2222-2222-222222222222', 'bob@test.com');
        `);

        // Authenticate as Alice to insert her invitation
        await client.query('set role authenticated_user');
        await client.query("set request.jwt.claim.role = 'authenticated'");
        await client.query("set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111'");

        await client.query(`
          insert into public.invitations (id, slug, user_id, title, config, is_published) values 
          ('00000000-0000-0000-0000-000000000001', 'alice-wedding', '11111111-1111-1111-1111-111111111111', 'Alice Event', '{}'::jsonb, true);
        `);

        // Now simulate Bob logged in (user 2)
        await client.query("set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222'");

        // Bob attempts to update Alice's invitation title
        const updateRes = await client.query(`
          update public.invitations set title = 'Hacked by Bob' where id = '00000000-0000-0000-0000-000000000001';
        `);

        // RLS prevents rows from being affected
        expect(updateRes.rowCount).toBe(0);

        // Switch to Alice to verify title remained unchanged
        await client.query("set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111'");
        const checkRes = await client.query(`
          select title from public.invitations where id = '00000000-0000-0000-0000-000000000001';
        `);
        expect(checkRes.rows[0]?.title).toBe('Alice Event');

        await client.query('rollback');
      } catch (e) {
        await client.query('rollback');
        throw e;
      } finally {
        client.release();
      }
    });

    it('allows anonymous guests to insert RSVP responses via RLS', async () => {
      const client = await pgTestPool.connect();
      try {
        await client.query('begin');
        await client.query(`
          insert into auth.users (id, email) values ('11111111-1111-1111-1111-111111111111', 'alice@test.com');
        `);

        await client.query('set role authenticated_user');
        await client.query("set request.jwt.claim.role = 'authenticated'");
        await client.query("set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111'");

        await client.query(`
          insert into public.invitations (id, slug, user_id, title, config, is_published) values 
          ('00000000-0000-0000-0000-000000000001', 'public-wedding', '11111111-1111-1111-1111-111111111111', 'Public Event', '{}'::jsonb, true);
        `);

        // Switch to anonymous role
        await client.query('set role anon_user');
        await client.query("set request.jwt.claim.role = 'anon'");
        await client.query("set request.jwt.claim.sub = ''");

        // Anonymous RSVP insert succeeds under RLS
        const insertRes = await client.query(`
          insert into public.rsvp_responses (invitation_id, name, attending, guest_count)
          values ('00000000-0000-0000-0000-000000000001', 'Anonymous Guest', true, 2);
        `);

        expect(insertRes.rowCount).toBe(1);

        // Verify owner (Alice) can view the submitted response
        await client.query('set role authenticated_user');
        await client.query("set request.jwt.claim.role = 'authenticated'");
        await client.query("set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111'");

        const ownerSelect = await client.query(`
          select name from public.rsvp_responses where invitation_id = '00000000-0000-0000-0000-000000000001';
        `);
        expect(ownerSelect.rows[0].name).toBe('Anonymous Guest');

        await client.query('rollback');
      } catch (e) {
        await client.query('rollback');
        throw e;
      } finally {
        client.release();
      }
    });
  });

  describe('Rate Limiter & RSVP Submission Logic', () => {
    it('triggers sliding-window rate limit after max requests are exceeded', () => {
      const testIp = '192.168.1.100';

      // First 5 requests should pass
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(testIp, 5, 10000);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(4 - i);
      }

      // 6th request must be rejected
      const blocked = checkRateLimit(testIp, 5, 10000);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.resetInSec).toBeGreaterThan(0);
    });

    it('correctly creates, aggregates and deletes RSVP records in store', () => {
      const created = rsvpStore.create({
        invitationId: 'inv-test-event',
        name: 'Lady Violet Crawley',
        attending: true,
        guestCount: 2,
        dietary: 'Nut allergy',
        songRequest: 'Waltz in A minor',
      });

      expect(created.id).toBeDefined();
      expect(created.name).toBe('Lady Violet Crawley');
      expect(created.guest_count).toBe(2);

      const list = rsvpStore.getByInvitation('inv-test-event');
      expect(list.some((r) => r.id === created.id)).toBe(true);

      const deleted = rsvpStore.delete(created.id);
      expect(deleted).toBe(true);
    });
  });
});
