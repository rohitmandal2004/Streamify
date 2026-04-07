-- Supabase Schema for Streamify Migration

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Drop existing tables to start fresh
drop table if exists public.meeting_history cascade;
drop table if exists public.reports cascade;

-- 1. Create meeting_history table
create table if not exists public.meeting_history (
    id uuid default uuid_generate_v4() primary key,
    user_id text not null, -- Clerk User ID
    meeting_code text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for faster queries on user's meeting history
create index if not exists meeting_history_user_id_idx on public.meeting_history (user_id);

-- 2. Create reports table
create table if not exists public.reports (
    id uuid default uuid_generate_v4() primary key,
    user_id text not null, -- Clerk User ID (the person reporting)
    reported_user text not null, -- Can be username or ID
    reason text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for admin queries
create index if not exists reports_user_id_idx on public.reports (user_id);

-- Row Level Security (RLS) Setup
alter table public.meeting_history enable row level security;
alter table public.reports enable row level security;

-- Policies for meeting_history
-- Allow inserts for authenticated users (an application could pass the clerk ID natively, 
-- but since we are using Clerk for auth instead of Supabase Auth, we'll allow public inserts, 
-- or we can configure Supabase to use Clerk JWTs. 
-- Assuming standard usage where Clerk handles auth natively and Supabase expects an anon key, 
-- you'll need to set up a custom JWT integration OR disable RLS if you don't setup strict Clerk-Supabase JWT sync).

-- NOTE: If you haven't synced Clerk JWTs directly into Supabase Custom Claims, 
-- it's easiest to temporarily disable RLS for those specific tables, or only allow anon inserts.
-- FOR COMPLETE SECURITY, PLEASE SETUP CLERK <-> SUPABASE JWT INTEGRATION.
-- See: https://clerk.com/docs/integrations/databases/supabase

CREATE POLICY "Allow public select for now" ON public.meeting_history FOR SELECT USING (true);
CREATE POLICY "Allow public insert for now" ON public.meeting_history FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert for now" ON public.reports FOR INSERT WITH CHECK (true);
