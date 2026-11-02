# نَوَى — Micro-course platform

An Arabic-first, RTL micro-course platform built with Next.js App Router, TypeScript, Tailwind CSS, Drizzle ORM, PostgreSQL and Supabase Auth.

## Local setup

1. Run `npm install` and copy `.env.example` to `.env`.
2. Set `DATABASE_URL` to a PostgreSQL connection string. For local development, Supabase keys can be left unset; the app then offers demo student/instructor accounts and seeds sample courses.
3. Run `npx drizzle-kit push` to create the tables, then `npm run dev`.

## Supabase setup

1. Create a Supabase project and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env`. Set `DATABASE_URL` to the project's PostgreSQL connection string (use the connection pooler when required by your environment). `SUPABASE_SERVICE_ROLE_KEY` is included in `.env.example` for future server-only integrations; this application does not require or expose it.
2. Run `supabase/schema.sql` once in the Supabase SQL editor to create the schema, Auth profile trigger and row-level security policies. If you use this SQL setup, you do not need to also run Drizzle push against the same database.
3. Enable Email authentication in Supabase Auth. Configure your site's URL and add `https://your-domain/auth` to the allowed redirect URLs for magic-link confirmation.
4. For production, configure your email provider and HTTPS. Supabase Auth handles password sign-in, registration, session refresh, and magic links. The API verifies bearer tokens with `auth.getUser()` and enforces student/instructor permissions server-side. Database RLS also protects direct Supabase access.

## Features

- Searchable course catalog, categories, course pages and lesson outlines.
- Student enrollment, lesson viewer, attachments, completion tracking and dashboard.
- Instructor course creation wizard with lesson video/attachment URLs and analytics.
- Arabic RTL layout, light/dark theme, skeleton loading, errors and toast messages.

**Payments:** Enrollment currently happens immediately. Displayed course prices and instructor revenue are informational enrollment totals, not processed payments. Add a payment provider and verify its webhook before treating enrollments as paid purchases.

**Video hosting:** The wizard accepts direct public MP4/WebM URLs. For private production content, use a protected video service or signed URLs rather than public links.
