# Meson AI — working rules

## Sibling apps (same shared Supabase DB)
- **app.mesonagency.com** — Ploutos, internal Meson team app. Owns `public.*`.
  Source of truth for `public.users`, `public.clients`, `auth.users`, edge functions
  like `client_portal_login`, `client_portal_session`, `client_portal_forgot_password`,
  `link_invited_user` (RPC).
- **portal.mesonagency.com** — existing client-facing portal (Vite SPA). Auth pattern
  reference: login posts to the `client_portal_login` edge function, response includes
  `{ authToken, refreshToken, expiresAt, user, client, campaignIds, projectIds }`,
  then `supabase.auth.setSession` plants the tokens. AppUser lives in `UserContext`,
  `AuthGuard` wraps the routed tree.
- **This app (Meson AI)** — Next.js App Router; same auth pattern as portal but adapted
  for SSR (cookie-based session via `@supabase/ssr`).

## Schema boundaries
- `public.*` is owned by Ploutos. This app may **read** from `public.users`,
  `public.clients`, `public.campaigns`, `public.projects`, and call existing
  `client_portal_*` edge functions / RPCs. **Never write** to `public.*` from this app.
- This app owns the `meson_ai` schema. All writes go there. Tables in `meson_ai` get
  RLS enabled + forced, default deny, scoped to `client_id` (matching the Ploutos
  client identity, not a separate account model).

## Stack
- pnpm + Turborepo monorepo
- Next.js App Router, React 19, Tailwind v4
- `@supabase/ssr` for cookie-based sessions; `@supabase/supabase-js` for the typed client
- Hanken Grotesk via `next/font`

## Auth model
- Identity lives in `auth.users` (Ploutos / shared). Sign-in posts email + password to
  the `client_portal_login` edge function. The edge function returns Supabase tokens
  plus the matching `public.users` row and `public.clients` row.
- After successful sign-in we call `supabase.auth.setSession({ access_token, refresh_token })`
  so subsequent table reads use the JWT for RLS. The Supabase session lives in HTTP-only
  cookies (App Router pattern).
- Per request, the server resolves three identities:
  1. `authUser` — from the Supabase session cookie (`supabase.auth.getUser()`)
  2. `user` — `public.users` row where `supabase_uid = authUser.id`
  3. `client` — `public.clients` row where `id = user.client_id`
- These three IDs (`auth_uid`, `user_id`, `client_id`) are the session's stored tokens.
  We don't duplicate them in extra cookies — the auth cookie + a server-side lookup
  per request is the single source of truth.
- `AuthGuard` lives in the `/app/*` route group layout. If any of the three resolutions
  fail, redirect to `/`.

## DB safety
- **meson-database is PRODUCTION.** Never run `supabase db push`, `link`, `reset`, or
  any destructive command. Write migrations locally to `supabase/migrations/` and STOP
  — the human operator runs them.
- Migrations only ever create/alter `meson_ai.*` objects. They never touch `public.*`,
  `auth.*`, or storage policies on Ploutos buckets.

## Secrets
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are safe to ship to
  the browser.
- Service-role key is server-only. Never import it from a client component, never put
  it in a `NEXT_PUBLIC_*` variable, never log it.
- `.env.local` is gitignored. `.env.example` documents the required vars without values.
