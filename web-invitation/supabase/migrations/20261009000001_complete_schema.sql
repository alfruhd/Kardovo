-- ============================================================================
-- DELIVERABLE H: Complete Supabase Database Schema, Multi-tenant RLS, & Tables
-- ============================================================================

-- 1. Create auth schema if not present (to mimic Supabase auth.users & auth.uid())
create schema if not exists auth;

create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  created_at timestamp with time zone default now()
);

-- Mock or define auth.uid() function for RLS testing
create or replace function auth.uid() returns uuid as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$ language sql stable;

-- Mock or define auth.role() function for RLS testing
create or replace function auth.role() returns text as $$
  select coalesce(current_setting('request.jwt.claim.role', true), 'anon');
$$ language sql stable;

-- 2. Invitations Table (Multi-tenant, Draft/Published states)
create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  config jsonb not null,
  is_published boolean default false,
  published_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 3. Assets Table
create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid references public.invitations(id) on delete cascade,
  url text not null,
  type text not null,
  mime_type text not null,
  size_bytes bigint default 0,
  created_at timestamp with time zone default now()
);

-- 4. Guests Table (Personalized invite tokens, seat counts)
create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid references public.invitations(id) on delete cascade,
  token text unique not null,
  name text not null,
  email text,
  phone text,
  allocated_seats integer default 1,
  notes text,
  created_at timestamp with time zone default now()
);

-- 5. Versions Table (Audit history & rollback points)
create table if not exists public.versions (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid references public.invitations(id) on delete cascade,
  version_number integer not null,
  config jsonb not null,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

-- 6. RSVP Responses Table (Dynamic submissions, repeater, spam check)
create table if not exists public.rsvp_responses (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid references public.invitations(id) on delete cascade,
  guest_id uuid references public.guests(id) on delete set null,
  guest_token text,
  name text not null,
  email text,
  phone text,
  attending boolean not null,
  guest_count integer default 1,
  meal_preference text,
  dietary_restrictions text,
  song_request text,
  children_details jsonb default '[]'::jsonb,
  answers jsonb default '{}'::jsonb,
  ip_address text,
  created_at timestamp with time zone default now()
);

-- Indexing for fast lookups
create index if not exists idx_invitations_slug on public.invitations(slug);
create index if not exists idx_guests_token on public.guests(token);
create index if not exists idx_rsvp_invitation on public.rsvp_responses(invitation_id);
create index if not exists idx_rsvp_created on public.rsvp_responses(created_at);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

alter table public.invitations enable row level security;
alter table public.assets enable row level security;
alter table public.guests enable row level security;
alter table public.versions enable row level security;
alter table public.rsvp_responses enable row level security;

-- Invitations RLS:
-- 1. Public can only read published invitations
create policy "Public can read published invitations"
  on public.invitations for select
  using (is_published = true);

-- 2. Authenticated owners can manage their own invitations
create policy "Owners have full control over their invitations"
  on public.invitations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Assets RLS:
create policy "Public can view assets of published invitations"
  on public.assets for select
  using (
    exists (
      select 1 from public.invitations
      where invitations.id = assets.invitation_id
      and invitations.is_published = true
    )
  );

create policy "Owners can manage assets"
  on public.assets for all
  using (
    exists (
      select 1 from public.invitations
      where invitations.id = assets.invitation_id
      and invitations.user_id = auth.uid()
    )
  );

-- Guests RLS:
create policy "Owners can manage guests"
  on public.guests for all
  using (
    exists (
      select 1 from public.invitations
      where invitations.id = guests.invitation_id
      and invitations.user_id = auth.uid()
    )
  );

create policy "Public can lookup guest by token"
  on public.guests for select
  using (true);

-- Versions RLS:
create policy "Owners can manage versions"
  on public.versions for all
  using (
    exists (
      select 1 from public.invitations
      where invitations.id = versions.invitation_id
      and invitations.user_id = auth.uid()
    )
  );

-- RSVP Responses RLS:
-- 1. Public can insert RSVPs (anonymous inserts allowed)
create policy "Public can submit RSVP responses"
  on public.rsvp_responses for insert
  with check (true);

-- 2. Owners can view, update, delete RSVP responses for their invitations
create policy "Owners can view RSVP responses"
  on public.rsvp_responses for select
  using (
    exists (
      select 1 from public.invitations
      where invitations.id = rsvp_responses.invitation_id
      and invitations.user_id = auth.uid()
    )
  );

create policy "Owners can delete RSVP responses"
  on public.rsvp_responses for delete
  using (
    exists (
      select 1 from public.invitations
      where invitations.id = rsvp_responses.invitation_id
      and invitations.user_id = auth.uid()
    )
  );

create policy "Owners can update RSVP responses"
  on public.rsvp_responses for update
  using (
    exists (
      select 1 from public.invitations
      where invitations.id = rsvp_responses.invitation_id
      and invitations.user_id = auth.uid()
    )
  );
