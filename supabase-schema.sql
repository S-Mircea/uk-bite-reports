-- ==========================================
-- UK Bite Reports - Supabase Database Schema
-- Run this in Supabase SQL Editor
-- ==========================================

-- 1. Profiles table
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  display_name text not null,
  postcode text not null,
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- 2. Reports table
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  user_name text not null,
  user_avatar text,
  photo_url text not null,
  species text not null,
  weight_lb numeric,
  weight_oz numeric,
  length_inches numeric,
  location_name text not null,
  latitude double precision not null,
  longitude double precision not null,
  notes text default '',
  caught_at timestamptz default now(),
  created_at timestamptz default now(),
  likes_count integer default 0,
  comments_count integer default 0
);

alter table public.reports enable row level security;

create policy "Reports are viewable by authenticated users"
  on public.reports for select
  to authenticated
  using (true);

create policy "Users can insert their own reports"
  on public.reports for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own reports"
  on public.reports for update
  to authenticated
  using (auth.uid() = user_id);

-- Also allow likes/comments to update any report's counts
create policy "Authenticated users can increment report counts"
  on public.reports for update
  to authenticated
  using (true);

-- 3. Comments table
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  user_name text not null,
  user_avatar text,
  text text not null,
  created_at timestamptz default now()
);

alter table public.comments enable row level security;

create policy "Comments are viewable by authenticated users"
  on public.comments for select
  to authenticated
  using (true);

create policy "Users can insert their own comments"
  on public.comments for insert
  to authenticated
  with check (auth.uid() = user_id);

-- 4. Likes table
create table public.likes (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(report_id, user_id)
);

alter table public.likes enable row level security;

create policy "Likes are viewable by authenticated users"
  on public.likes for select
  to authenticated
  using (true);

create policy "Users can insert their own likes"
  on public.likes for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete their own likes"
  on public.likes for delete
  to authenticated
  using (auth.uid() = user_id);

-- 5. Storage bucket for report photos
insert into storage.buckets (id, name, public)
values ('report-photos', 'report-photos', true);

create policy "Authenticated users can upload photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'report-photos');

create policy "Anyone can view report photos"
  on storage.objects for select
  to public
  using (bucket_id = 'report-photos');

-- 6. RPC functions for atomic count updates
create or replace function increment_likes(report_id_input uuid)
returns void as $$
  update public.reports
  set likes_count = likes_count + 1
  where id = report_id_input;
$$ language sql security definer;

create or replace function decrement_likes(report_id_input uuid)
returns void as $$
  update public.reports
  set likes_count = greatest(likes_count - 1, 0)
  where id = report_id_input;
$$ language sql security definer;

create or replace function increment_comments(report_id_input uuid)
returns void as $$
  update public.reports
  set comments_count = comments_count + 1
  where id = report_id_input;
$$ language sql security definer;
