# Emad — AI Consultant & Software Developer (Portfolio)

A multilingual (English / فارسی / Română) Next.js 15 portfolio + booking + AI chat + blog site for an AI consultant based in Romania.

## Status

Every page from the original spec is implemented end-to-end, plus a markdown-driven blog and email notifications.

### Pages

- **Home** — hero, AI-future section with 4 image cards, services preview, stats, testimonials, blog preview pulling 3 latest posts, scroll animations
- **About** — hero with photo, 3-paragraph bio, skills grid (4 groups, 25+ tech badges), experience timeline (4 entries), education timeline (3 entries), documents gallery with modal viewer, resume download CTA
- **Services** — 6 service cards (hover effects, 3 bullets each, CTA), 3-tier pricing with "Most popular" badge
- **Blog** — index + post detail + per-tag pages reading markdown / MDX from `content/blog/{en,fa,ro}/*.{md,mdx}`. 3 seed posts × 3 locales, prose-styled rendering, tag chips, locale-aware tag URLs (Persian / Romanian preserved as Unicode slugs), client-side search + tag filter (Fuse.js)
- **Contact** — form (RHF + zod) → `/api/contact` → Supabase + email notification
- **Auth** — tabbed sign-in / sign-up forms, Google OAuth button, password reset page, OAuth callback route
- **AI Consultant** — streaming chat at `/api/chat`, topic chips, localStorage history, 10-message free-preview limit
- **Booking** — 3-step wizard (service → date/time → details), live availability, confirmation screen + confirmation email
- **Dashboard** (protected) — greet by name, upcoming + past bookings with cancel-with-confirm, profile edit form, **avatar upload to Supabase Storage**, sign-out, quick links
- **Admin** (allowlist-gated, `noindex`) — `/admin` page lists recent bookings with inline status updates and recent contact submissions; gated by `ADMIN_EMAILS` allowlist + service-role Supabase client (bypasses RLS server-side only)

### Foundations

- Locale shell with `en`, `fa` (RTL with Vazirmatn font), `ro` and language switcher
- Sticky glass navbar, footer, mobile menu, dark/light theme
- **Supabase schema** — `profiles`, `contacts`, `bookings` with RLS + new-user trigger in [supabase/schema.sql](supabase/schema.sql)
- **Email** — [lib/email.ts](lib/email.ts) wraps Resend; best-effort, no-ops when key absent. Sends admin notifications on contact + booking, plus a confirmation to the booker.
- **Blog** — [lib/blog.ts](lib/blog.ts) reads markdown / MDX from `content/blog/{locale}/*.{md,mdx}` via `gray-matter` (frontmatter) + `next-mdx-remote` (MDX compilation) + `remark-gfm` + `rehype-highlight`. Frontmatter schema: `title`, `excerpt`, `date`, `readingMinutes`, `imageSeed`. Posts share slugs across locales for clean linking. Custom MDX components live in [components/mdx/](components/mdx/) — currently `<Callout>`.
- **Rate limiting** — [lib/rate-limit.ts](lib/rate-limit.ts) is a token-bucket per-IP limiter (in-memory). Wired into `/api/contact` (5/h), `/api/chat` (30/h), `/api/booking` (10/h). Returns 429 with `Retry-After` + `X-RateLimit-*` headers; client toasts surface a localized "slow down" message. Set `RATE_LIMIT_DISABLED=true` to bypass for load tests.
- **Auth gating** — [middleware.ts](middleware.ts) refreshes the Supabase session on every request and redirects `/dashboard` and `/admin` to `/auth?next=...` for anonymous users. Sign-in honors `?next=` and strips locale prefixes so it works whether the link came from middleware or a hand-built URL.
- **User menu in navbar** — `<UserMenu>` subscribes to Supabase auth state, shows an avatar (or initial fallback) for signed-in users, with a dropdown linking to dashboard / admin / sign-out. Falls back to a "Sign In" link when anonymous.
- **RSS feeds** — `/{locale}/blog/feed.xml` per locale, RSS 2.0 with `<atom:link rel="self">` self-reference, hreflang autodiscovery via `<link rel="alternate">` in blog metadata. Cached for 1 hour.
- **MDX components** — [components/mdx/](components/mdx/) ships `<Callout>`, `<ConsultantCTA>`, `<Terminal>`, and `<Pricing>` (the same one used on the services page) — drop them into any post. Reach for `mdxComponents` in [components/mdx/index.tsx](components/mdx/index.tsx) to register more.
- **Tests** — [tests/](tests/) covers validators, utils, blog reader, tag slugs, and the locale-prefix stripper. Run with `npm test`. CI in [.github/workflows/ci.yml](.github/workflows/ci.yml) runs typecheck + lint + tests on PRs and pushes to `main`.
- **Demo mode** — site renders fully and APIs return friendly 503s if env vars are missing; banners on affected pages
- **SEO** — [app/sitemap.ts](app/sitemap.ts) (all static routes + blog posts × 3 locales with hreflang alternates), [app/robots.ts](app/robots.ts), [app/opengraph-image.tsx](app/opengraph-image.tsx) (programmatic OG), per-page `generateMetadata`
- **Loading skeletons** — tailored `loading.tsx` for every primary route (about, services, blog, blog/[slug], booking, consultant, contact, auth, dashboard) plus a generic `[locale]/loading.tsx` fallback

## Stack

| Layer | Tool |
| --- | --- |
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS, `@tailwindcss/typography`, custom design tokens, CVA, tailwind-merge |
| Animation | Framer Motion |
| i18n | next-intl (`[locale]` segment + middleware) |
| Auth & DB | Supabase (`@supabase/ssr`) |
| AI | Anthropic SDK — model `claude-sonnet-4-6` |
| Email | Resend (best-effort, gracefully no-ops without key) |
| Blog | gray-matter (frontmatter) + next-mdx-remote (MDX) + rehype-highlight + remark-gfm |
| Tests | Vitest (Node env) with vite-tsconfig-paths for `@/…` imports |
| CI | GitHub Actions (typecheck · lint · test) |
| Forms | react-hook-form + zod, React 19 `useActionState` for server actions |
| UI primitives | Radix (Tabs, Dialog, Label, Slot) + hand-rolled shadcn-style components |
| Toasts | sonner |
| Icons | lucide-react |

## Setup

```bash
# 1. Install deps. NOTE on Windows: install from inside WSL or another shell.
#    Windows PowerShell may block npm/npx .ps1 shims via execution policy.
npm install

# 2. Copy env template and fill in
cp .env.local.example .env.local

# 3. Run migrations against your Supabase project
#    Easiest: open the Supabase SQL editor and paste the contents of
#    supabase/schema.sql

# 4. Start dev
npm run dev
```

Open http://localhost:3000 — middleware will redirect to `/en`.

## Environment variables

| Var | Required for | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | auth, contact, booking, dashboard | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same | Anon/public key |
| `ANTHROPIC_API_KEY` | `/consultant` chat | Claude API key |
| `RESEND_API_KEY` | email notifications (optional) | Resend API key |
| `EMAIL_FROM` | email notifications | `From` address (e.g. `Emad <hi@emad.dev>`) |
| `EMAIL_TO_ADMIN` | admin notifications | Where contact + new-booking notifications go |
| `SUPABASE_SERVICE_ROLE_KEY` | `/admin` page (server-only, never expose) | Service-role key, bypasses RLS for admin reads/writes |
| `ADMIN_EMAILS` | `/admin` access | Comma-separated allowlist of admin emails |
| `NEXT_PUBLIC_SITE_URL` | OAuth redirects, SEO | Public site origin |

If keys are absent, the site still runs and shows a banner explaining what's disabled. APIs return `503` with a `demo: true` body.

## Google OAuth (optional)

1. In Supabase: **Authentication → Providers → Google → enable**.
2. In Google Cloud Console: create OAuth credentials with redirect URI `${NEXT_PUBLIC_SUPABASE_URL}/auth/v1/callback`.
3. Paste the client id/secret into Supabase.

The `/auth` page already wires the "Continue with Google" button to `signInWithOAuth({ provider: 'google' })`. A dedicated `/auth/callback` page is part of Pass 2.

## Project layout

```
app/
  [locale]/
    layout.tsx           ← <html lang dir>, theme provider, NextIntl provider, navbar, footer, toaster
    page.tsx             ← Home (hero + AI-future + services preview + stats + testimonials + blog)
    auth/                ← tabbed sign-in/up + Google OAuth button + reset-password + callback
    booking/             ← 3-step wizard
    consultant/          ← AI chat
    contact/             ← form + info + map
    blog/                ← index + [slug] post pages (MDX + syntax highlighting)
    about/               ← bio + skills + timelines + documents + resume
    services/            ← 6 service cards + 3-tier pricing
    dashboard/           ← protected: bookings + profile (server actions)
    admin/               ← allowlist-gated: bookings + contacts (service-role)
  api/
    chat/                ← Anthropic streaming proxy
    contact/             ← form → contacts table + admin email
    booking/             ← booking insert + confirmation + admin email
    booking/availability/← reads booked slots for a date
    resume/              ← placeholder CV download
middleware.ts            ← chains Supabase session refresh + next-intl routing
components/
  ui/                    ← button, card, input, label, textarea, tabs, dialog, badge, skeleton
  layout/                ← Navbar, Footer, LanguageSwitcher, ThemeToggle, MobileMenu, ThemeProvider
  sections/              ← Home, About, Services sections + ScrollReveal
  forms/                 ← ContactForm, SignInForm, SignUpForm
  chat/                  ← ChatWindow, Message, Composer, TopicChips, TypingIndicator
  booking/               ← BookingWizard + 3 step components + Confirmation
  dashboard/             ← BookingsList, ProfileForm, LogoutButton, NotSignedIn
  admin/                 ← AdminBookings, AdminContacts, StatusSelect, NotAdmin
  mdx/                   ← Callout (extend with your own MDX components)
  DemoBanner.tsx
lib/
  i18n.ts, i18n-routing.ts
  env.ts                 ← detects missing keys for demo mode + admin allowlist
  auth.ts                ← getCurrentUser, getAdminUser
  utils.ts, validators.ts, anthropic.ts
  email.ts               ← Resend wrapper (best-effort)
  blog.ts                ← MDX reader (gray-matter + next-mdx-remote)
  actions.ts             ← server actions (profile, sign-out, booking status)
  supabase/{client,server,middleware,admin}.ts
messages/{en,fa,ro}.json ← all UI strings
content/blog/{en,fa,ro}/ ← markdown posts (slug shared across locales)
supabase/schema.sql      ← tables + RLS + new-user trigger
```

## Demo mode behavior

| Page | Without keys | With keys |
| --- | --- | --- |
| Home / About / Services | Fully renders | Fully renders |
| Contact form | Banner shown; submit returns 503 toast | Saves to `contacts` |
| Auth | Banner shown; submit shows "Supabase required" | Sign-in/up + OAuth work |
| Consultant | Banner shown; replies are static demo strings | Streaming Claude responses |
| Booking | Banner shown; submit returns 503 toast | Saves to `bookings`, availability live |

## Adding a blog post

1. Create `content/blog/{locale}/{slug}.md` (or `.mdx`) — at minimum the English version. Add Persian / Romanian versions with the same slug for full coverage.
2. Frontmatter:
   ```yaml
   ---
   title: "..."
   excerpt: "..."
   date: "YYYY-MM-DD"
   readingMinutes: 6
   imageSeed: "unique-string-for-cover-image"
   tags:        # optional — drives /blog/tags/[tag] pages
     - AI
     - Engineering
   ---
   ```
3. Body is markdown plus optional MDX components. Available out of the box:
   - `<Callout tone="info|warn|success|tip" title="...">...</Callout>` — register more in [components/mdx/index.tsx](components/mdx/index.tsx)
   - GFM tables, strikethrough, task lists (via remark-gfm)
   - Fenced code blocks with auto-detected syntax highlighting (via rehype-highlight)
4. The home BlogPreview pulls the 3 most recent automatically.

## Setting up `/admin`

1. Generate / fetch your Supabase **service role** key (Project settings → API). Treat it like a password — never commit, never expose to clients.
2. Add it as `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.
3. Add admin emails as `ADMIN_EMAILS=alice@example.com,bob@example.com`.
4. Sign in with one of those emails, then visit `/en/admin`. The page is `noindex`, gated server-side, and only the service-role client (server-only) reads bookings + contacts.

## Verification checklist

- `npm run dev` boots without env vars; visit `/en`, `/fa` (RTL flips), `/ro`
- Toggle dark/light in navbar
- `/about` — hero, bio, skills, both timelines, documents gallery (click → modal), resume CTA
- `/services` — 6 cards with hover, pricing tiers, "Most popular" badge on Standard
- `/blog` — search box + topic-filter chips + cards; click one → post detail with MDX rendering, syntax-highlighted code, and Callout boxes
- `/blog/tags/{tag}` — per-tag listing with locale-aware Unicode slugs (e.g. `/fa/blog/tags/هوش-مصنوعی`)
- `/admin` (with `ADMIN_EMAILS` set and signed in as one) — bookings table with inline status update + contact submissions
- Dashboard: cancel an upcoming booking → confirmation dialog → status flips to "Cancelled" + slot frees up
- Profile: upload an avatar → appears on dashboard form + navbar dropdown after refresh
- `/{locale}/blog/feed.xml` returns valid RSS 2.0 (validate at https://validator.w3.org/feed/)
- `npm test` passes locally and in CI
- Hammer `/api/contact` from a single IP — 6th request in an hour returns 429
- Type into `/blog` search → cards filter live; click a topic chip → narrows further; combine search + filter for AND
- Home page BlogPreview shows the 3 latest posts in the current locale
- Submit contact form → toast (demo or success); with Resend keys set, admin email arrives
- Open `/consultant` → chat works in demo mode; with `ANTHROPIC_API_KEY`, replies stream
- Open `/booking` → step through wizard; with all keys set, booking confirmation email arrives
- Sign up at `/auth` (with Supabase configured) → profile row created
- Sign in → redirected to `/dashboard` showing bookings + profile (RLS-filtered)
- Click forgot password → `/auth/reset-password` → enter email → receive reset link
- `/sitemap.xml` lists all routes including blog posts × locales
- `/api/resume` returns a placeholder download
- `npm run build` type-checks

## Deployment

Vercel-compatible out of the box. Set the four env vars in the Vercel project settings.

```bash
vercel deploy
```

## License

Private project — all rights reserved.
