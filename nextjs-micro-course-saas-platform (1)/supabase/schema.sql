-- Run this in the Supabase SQL editor when using Supabase PostgreSQL.
-- The application also uses Drizzle for its server-side database access.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  role text not null default 'student' check (role in ('student','instructor')),
  avatar_url text,
  created_at timestamptz not null default now()
);
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.profiles(id),
  title text not null,
  description text not null,
  category text not null default 'تطوير الذات',
  price numeric(10,2) not null default 0,
  thumbnail_url text not null,
  level text not null default 'جميع المستويات',
  rating numeric(3,1) not null default 4.8,
  reviews integer not null default 0,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  video_url text,
  attachment_url text,
  order_index integer not null default 0,
  duration integer not null default 10
);
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id),
  course_id uuid not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  unique(student_id, course_id)
);
create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique(student_id, lesson_id)
);

-- Automatically provision a profile when a Supabase Auth user signs up.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email,''),'@',1)),
    case when new.raw_user_meta_data->>'role' = 'instructor' then 'instructor' else 'student' end)
  on conflict (id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- A user may update their name/avatar, but never promote their own role.
create or replace function public.protect_profile_role() returns trigger language plpgsql as $$
begin
  if new.role is distinct from old.role then raise exception 'Profile role cannot be changed'; end if;
  return new;
end; $$;
drop trigger if exists protect_profile_role_trigger on public.profiles;
create trigger protect_profile_role_trigger before update on public.profiles for each row execute function public.protect_profile_role();

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;

create policy "Profiles are readable" on public.profiles for select using (true);
create policy "Users create their own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "Users update their own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create policy "Courses are public" on public.courses for select using (true);
create policy "Instructors create own courses" on public.courses for insert to authenticated with check (
  auth.uid() = instructor_id and exists(select 1 from public.profiles where id = auth.uid() and role = 'instructor')
);
create policy "Instructors update own courses" on public.courses for update to authenticated using (auth.uid() = instructor_id) with check (auth.uid() = instructor_id);
create policy "Instructors delete own courses" on public.courses for delete to authenticated using (auth.uid() = instructor_id);

create policy "Lesson outlines are public" on public.lessons for select using (true);
create policy "Instructors create lessons for own courses" on public.lessons for insert to authenticated with check (
  exists(select 1 from public.courses where id = course_id and instructor_id = auth.uid())
);
create policy "Instructors update own lessons" on public.lessons for update to authenticated using (
  exists(select 1 from public.courses where id = course_id and instructor_id = auth.uid())
);
create policy "Instructors delete own lessons" on public.lessons for delete to authenticated using (
  exists(select 1 from public.courses where id = course_id and instructor_id = auth.uid())
);

create policy "Students and course instructors see enrollments" on public.enrollments for select to authenticated using (
  student_id = auth.uid() or exists(select 1 from public.courses where id = course_id and instructor_id = auth.uid())
);
create policy "Students enroll themselves" on public.enrollments for insert to authenticated with check (
  student_id = auth.uid() and exists(select 1 from public.profiles where id = auth.uid() and role = 'student')
);
create policy "Students see their progress" on public.lesson_progress for select to authenticated using (student_id = auth.uid());
create policy "Students record their progress" on public.lesson_progress for insert to authenticated with check (
  student_id = auth.uid() and exists (
    select 1 from public.lessons l join public.enrollments e on e.course_id = l.course_id
    where l.id = lesson_id and e.student_id = auth.uid()
  )
);
create policy "Students remove their progress" on public.lesson_progress for delete to authenticated using (student_id = auth.uid());
