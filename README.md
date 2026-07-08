# Recovery Lab

An N-of-1 experimentation platform: pick one daily habit (no caffeine after 2 p.m., phone out of the
bedroom, etc.), get a randomized intervention/control assignment each day, check in, and see an honest,
uncertainty-aware analysis of whether it actually moved your WHOOP recovery score.

Recovery Lab is a general wellness experimentation tool. It does not diagnose, treat, or give medical advice.

## Status

The application code is complete for the MVP scope: auth, experiment creation, balanced randomized
assignment, daily check-ins, WHOOP OAuth + backfill + webhooks + reconciliation, and the difference-in-means
/ regression / uncertainty analysis pipeline. All of it type-checks, lints, builds (`next build`), and the
pure-logic unit tests pass (`npm test`).

What's **not** done yet, because it requires credentials only you can provide:

- A real Supabase project (for auth + Postgres).
- A WHOOP developer app (for OAuth + API access).
- Running it against a live database at least once, end to end.

Everything below walks through exactly that.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · shadcn/ui (Base UI) · Supabase Auth · Prisma 7 ·
Zod · Recharts · Vitest · Playwright.

Two things differ from older Next.js/Prisma tutorials you may find online — see `AGENTS.md` for the pointer
that led to these:

- **`src/proxy.ts`, not `middleware.ts`.** Next.js 16 renamed Middleware to Proxy. Same job (refreshing the
  Supabase session cookie on every request), new filename and a `proxy` export instead of `middleware`.
- **Prisma 7 requires a driver adapter.** The schema no longer takes a `datasource url`; `src/lib/db.ts`
  passes `@prisma/adapter-pg` (`PrismaPg`) explicitly to `new PrismaClient({ adapter })`.
- **shadcn/ui components here wrap Base UI, not Radix.** `asChild` doesn't exist — use `render={<Link .../>}`
  instead (see `src/components/experiment-card.tsx` for an example).

## Setup

### 1. Install

```bash
npm install
```

### 2. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Project Settings → API: copy the **Project URL**, **publishable key**, and **secret key** into
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SECRET_KEY`.
3. Project Settings → Database: copy the pooled connection string into `DATABASE_URL` and the direct
   connection string into `DIRECT_URL`.
4. Authentication → Providers: email/password is enabled by default. For local development, either disable
   "Confirm email" (Authentication → Sign In / Providers) so signup doesn't require clicking an email link,
   or use a real inbox.

Copy `.env.example` to `.env.local` and fill in everything above, plus:

```bash
openssl rand -base64 32   # -> TOKEN_ENCRYPTION_KEY
openssl rand -hex 32      # -> CRON_SECRET
```

### 3. Run the first migration

```bash
npx prisma migrate dev --name init
```

> Local dev note: `prisma dev` (Prisma's own local Postgres) needs Node 22+. If you're on an older Node,
> just point `DATABASE_URL`/`DIRECT_URL` at your real Supabase project from the start — `prisma migrate dev`
> works fine against it.

### 4. WHOOP developer app

1. Register an app at the [WHOOP developer dashboard](https://developer.whoop.com).
2. Add redirect URIs for both environments: `http://localhost:3000/api/whoop/callback` and your production
   URL's equivalent. WHOOP rejects any redirect that isn't registered exactly.
3. Request scopes: `offline read:profile read:recovery read:cycles read:sleep`.
4. Copy the Client ID / Client Secret into `WHOOP_CLIENT_ID` / `WHOOP_CLIENT_SECRET`.
5. Development apps support up to 10 WHOOP members before WHOOP approval is required — plenty for building
   and testing.
6. Webhooks: point WHOOP's webhook URL at `https://<your-domain>/api/webhooks/whoop` once deployed (WHOOP
   needs a public HTTPS URL — this can't be tested against `localhost` without a tunnel like ngrok).

### 5. Run it

```bash
npm run dev
```

Visit `http://localhost:3000` → create an account → connect WHOOP → start an experiment.

### 6. Background jobs

Two endpoints need to run on a schedule; both are already wired up as Vercel Cron jobs in `vercel.json`:

- `POST /api/jobs/process-webhooks` every 5 minutes — drains the `webhook_events` queue.
- `POST /api/jobs/reconcile` once a day — re-syncs the last 3 days for every connected user, in case a
  webhook was dropped or delayed.

Both require `Authorization: Bearer $CRON_SECRET`. Vercel adds that header automatically for Cron Jobs when
`CRON_SECRET` is set as an environment variable — nothing else to configure once deployed. If you'd rather
keep everything inside Supabase, `pg_cron` + `pg_net` can call the same two URLs on the same schedule instead.

## Testing

```bash
npm test          # vitest — assignment algorithm, date-linking, validity, analysis, crypto, webhook signatures
npm run test:e2e  # playwright — requires `npm run dev` running against a configured Supabase/WHOOP setup
```

The 46 Vitest tests cover everything that doesn't require a database or network: the seeded-shuffle balanced
randomization (and its streak-rejection rule), the timezone-aware sleep→assignment date-linking (including
the before/after-midnight and travel cases), the difference-in-means and adjusted regression math against
the spec's own worked example, and HMAC webhook signature verification.

## Project layout

See `src/lib/experiments/` (assignment generation, eligibility rules, date-linking, validity, check-ins) and
`src/lib/analysis/` (difference-in-means, uncertainty interval, adjusted regression, confidence labeling,
result narrative) for the parts worth reading first — every function there takes plain data in and returns
plain data out, with no direct database access, which is what makes them unit-testable without a live DB.

`src/lib/whoop/` holds the OAuth flow, token refresh (with the locking WHOOP's refresh-token rotation
requires), the paginated API client, and sync/backfill logic. `src/app/api/webhooks/whoop` +
`src/app/api/jobs/` implement the webhook-as-notification pattern: the webhook route only verifies the
signature and records the event; `process-webhooks` does the actual WHOOP API calls on a schedule.

## Known simplifications (documented, not accidental)

- A single-record WHOOP fetch endpoint for `recovery.updated` webhooks isn't documented with certainty, so
  that event triggers a 3-day reconciliation sync instead of fetching one exact object — slightly more API
  calls, no risk of hitting a made-up endpoint.
- "One active experiment per user" is enforced in application code (`eligibility.ts`), not a DB constraint.
