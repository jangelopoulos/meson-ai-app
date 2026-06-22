# Meson AI — working rules
- Stack: pnpm + Turborepo monorepo, Next.js App Router, Supabase (@supabase/ssr).
- Schema boundary: this app owns the `meson_ai` schema only. NEVER touch `public.*`
  (that's the internal Ploutos app, same shared DB).
- DB safety: meson-database is PRODUCTION. Never run `supabase db push`, `link`,
  reset, or any destructive command. Write migrations locally and STOP — I run them.
- Every meson_ai table: RLS enabled + forced, default deny, scoped to account_id.
- Service-role key is server-only. Never expose it client-side.
