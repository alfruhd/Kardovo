-- Invitations table storing 100% config-driven JSON schemas
create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  config jsonb not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- RSVP responses table
create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid references public.invitations(id) on delete cascade,
  guest_name text not null,
  attending boolean not null,
  guest_count integer default 1,
  favorite_song text,
  children_note text,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.invitations enable row level security;
alter table public.rsvps enable row level security;

-- Public can view published invitations by slug
create policy "Public invitations are viewable by everyone"
  on public.invitations for select
  using (true);

-- Owners can edit their own invitations
create policy "Users can update own invitations"
  on public.invitations for all
  using (auth.uid() = user_id);

-- Public can submit RSVPs
create policy "Anyone can insert RSVP"
  on public.rsvps for insert
  with check (true);

-- Invitation owners can read RSVPs for their events
create policy "Invitation owners can view RSVPs"
  on public.rsvps for select
  using (
    exists (
      select 1 from public.invitations
      where invitations.id = rsvps.invitation_id
      and invitations.user_id = auth.uid()
    )
  );
