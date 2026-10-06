-- Supabase Schema for Streamify Migration
-- Architecture: Clerk (Auth) -> Express Backend (Verification) -> Supabase (Data)
-- Because the Express backend uses the Service Role Key to bypass RLS after verifying Clerk tokens,
-- we will set RLS policies to DENY ALL for anon/public, ensuring data is only accessed via the secure backend.

create extension if not exists "uuid-ossp";

-- 1. Profiles
create table if not exists public.profiles (
    clerk_user_id text primary key,
    username text,
    display_name text,
    email text not null,
    avatar_url text,
    bio text,
    status text default 'offline',
    last_seen timestamp with time zone default timezone('utc'::text, now()),
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Calls
create table if not exists public.calls (
    id uuid default uuid_generate_v4() primary key,
    room_id text not null,
    caller_id text references public.profiles(clerk_user_id),
    call_type text default 'video', -- 'video', 'audio'
    status text default 'ongoing', -- 'ongoing', 'ended', 'missed', 'rejected'
    started_at timestamp with time zone default timezone('utc'::text, now()),
    ended_at timestamp with time zone,
    duration integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Call Participants
create table if not exists public.call_participants (
    id uuid default uuid_generate_v4() primary key,
    call_id uuid references public.calls(id) on delete cascade,
    clerk_user_id text references public.profiles(clerk_user_id),
    joined_at timestamp with time zone default timezone('utc'::text, now()),
    left_at timestamp with time zone
);

-- 4. Contacts
create table if not exists public.contacts (
    id uuid default uuid_generate_v4() primary key,
    user_id text references public.profiles(clerk_user_id),
    contact_user_id text references public.profiles(clerk_user_id),
    status text default 'accepted', -- 'pending', 'accepted', 'blocked'
    created_at timestamp with time zone default timezone('utc'::text, now()),
    unique(user_id, contact_user_id)
);

-- 5. Messages (Chat in Meetings)
create table if not exists public.messages (
    id uuid default uuid_generate_v4() primary key,
    room_id text not null,
    sender_id text references public.profiles(clerk_user_id),
    message text not null,
    message_type text default 'text', -- 'text', 'system'
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. Notifications
create table if not exists public.notifications (
    id uuid default uuid_generate_v4() primary key,
    user_id text references public.profiles(clerk_user_id),
    type text not null, -- 'incoming_call', 'missed_call', 'contact_request'
    title text not null,
    message text,
    read boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 7. Reports
create table if not exists public.reports (
    id uuid default uuid_generate_v4() primary key,
    reporter_id text references public.profiles(clerk_user_id),
    reported_user_id text references public.profiles(clerk_user_id),
    reason text not null,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 8. User Preferences
create table if not exists public.user_preferences (
    user_id text primary key references public.profiles(clerk_user_id),
    theme text default 'system',
    notification_preferences jsonb default '{"incoming_calls": true, "messages": true}'::jsonb,
    default_microphone text default 'default',
    default_camera text default 'default',
    privacy_preferences jsonb default '{"visibility": "public"}'::jsonb,
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Indexes for performance
create index if not exists idx_calls_room_id on public.calls(room_id);
create index if not exists idx_calls_caller_id on public.calls(caller_id);
create index if not exists idx_call_participants_call_id on public.call_participants(call_id);
create index if not exists idx_call_participants_user_id on public.call_participants(clerk_user_id);
create index if not exists idx_contacts_user_id on public.contacts(user_id);
create index if not exists idx_messages_room_id on public.messages(room_id);
create index if not exists idx_notifications_user_id on public.notifications(user_id);

-- Enable RLS and set DENY ALL for public (Access only via Service Role Key from Backend)
alter table public.profiles enable row level security;
alter table public.calls enable row level security;
alter table public.call_participants enable row level security;
alter table public.contacts enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;
alter table public.user_preferences enable row level security;

-- Storage Bucket for Recordings
insert into storage.buckets (id, name, public) values ('recordings', 'recordings', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict do nothing;
