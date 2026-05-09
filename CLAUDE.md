# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start dev server (http://localhost:3000 → redirects to /en)
npm run build        # production build (also runs tsc)
npm run typecheck    # tsc --noEmit only
npm run lint         # next lint
npm test             # vitest run (all tests in tests/)
npm run test:watch   # vitest in watch mode
```

Run a single test file:
```bash
npx vitest run tests/validators.test.ts
```

## Architecture

**Next.js 15 App Router** with all routes under `app/[locale]/` — middleware redirects bare `/` to `/en`.

### Routing & i18n

`middleware.ts` chains two concerns: Supabase session refresh (`lib/supabase/middleware.ts`) then `next-intl` locale routing. The `[locale]` segment supports `en`, `fa` (RTL), `ro`. All UI strings live in `messages/{en,fa,ro}.json` and are accessed via `next-intl`'s `useTranslations` / `getTranslations`.

### Auth & protection

`lib/auth.ts` exposes `getCurrentUser()` (server, anon-safe) and `getAdminUser()` (throws if not in `ADMIN_EMAILS`). Middleware guards `/dashboard` and `/admin` at the route level; admin page enforces the email allowlist a second time server-side using the service-role Supabase client (`lib/supabase/admin.ts` — never imported client-side).

### Demo mode

`lib/env.ts` exports `isSupabaseConfigured`, `isAnthropicConfigured`, `isAdminConfigured`. API routes return `{ demo: true }` with HTTP 503 when the relevant keys are absent. Pages show `<DemoBanner>`. The site renders fully without any env vars.

### Database

Supabase (`@supabase/ssr`). Four client helpers:
- `lib/supabase/client.ts` — browser
- `lib/supabase/server.ts` — RSC / server actions (cookie-based)
- `lib/supabase/middleware.ts` — session refresh only
- `lib/supabase/admin.ts` — service-role, server-only, bypasses RLS

Schema + RLS + new-user trigger: `supabase/schema.sql`.

### AI chat

`app/api/chat/route.ts` proxies streaming requests to Anthropic using `claude-sonnet-4-6` (constant in `lib/anthropic.ts`). The UI (`components/chat/`) enforces a 10-message free-preview limit via `localStorage`. Rate-limited at 30 req/h per IP.

### Blog

`lib/blog.ts` reads `content/blog/{en,fa,ro}/*.{md,mdx}` using `gray-matter` (frontmatter) + `next-mdx-remote` + `rehype-highlight` + `remark-gfm`. Posts share slugs across locales. Custom MDX components are registered in `components/mdx/index.tsx`.

Blog post frontmatter fields: `title`, `excerpt`, `date`, `readingMinutes`, `imageSeed`, `tags` (optional).

### Rate limiting

`lib/rate-limit.ts` is an in-memory token-bucket per IP. Limits: contact 5/h, chat 30/h, booking 10/h. Set `RATE_LIMIT_DISABLED=true` to bypass. Returns 429 with `Retry-After` and `X-RateLimit-*` headers.

### Server actions

`lib/actions.ts` contains server actions for profile updates, sign-out, and booking status changes. Forms use `react-hook-form` + `zod` (client) or React 19 `useActionState` (server actions).

### Email

`lib/email.ts` wraps Resend. All calls are best-effort — missing `RESEND_API_KEY` silently no-ops.

### Tests

Vitest in Node environment (`vitest.config.ts`). Tests only exist for pure library code in `lib/` — no component or API route tests. `vite-tsconfig-paths` resolves `@/` aliases identically to the app.

## Key env vars

| Var | Effect when absent |
|-----|-------------------|
| `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Auth/DB features show banners, APIs return 503 |
| `ANTHROPIC_API_KEY` | Chat returns static demo strings |
| `SUPABASE_SERVICE_ROLE_KEY` + `ADMIN_EMAILS` | `/admin` page inaccessible |
| `RESEND_API_KEY` | Emails silently skipped |
| `NEXT_PUBLIC_SITE_URL` | OAuth redirects + sitemap use `http://localhost:3000` |
| `RATE_LIMIT_DISABLED=true` | Bypasses all rate limits |
