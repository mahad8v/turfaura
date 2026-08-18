# TurfAura

A football pitch booking marketplace. Customers search pitches, pick a time, and request a booking — no account,
no payment, no deposit. The pitch owner confirms the booking on WhatsApp, approves it in their dashboard, and gets
paid cash at the pitch after the match. Pitch owners get a dashboard to list pitches, set pricing, block dates,
and manage bookings, with an optional Telegram notification the moment a new booking comes in.

Built with Next.js (App Router), React, TypeScript, Tailwind CSS, Prisma, and Supabase (Postgres, Auth, Storage).

## How it works

- **Customers never create an account.** A booking is identified by a short reference code (e.g. `TA-7K4QXP`),
  and `/receipt/[reference]` is the durable, account-free record of it.
- **No payment happens in the app.** A booking is created as `PENDING`; the owner reaches out on WhatsApp to
  confirm the customer is really coming, then approves it (`CONFIRMED`). If the owner never responds, it
  auto-expires after `APPROVAL_HOURS` (`lib/constants.ts`) so the slot frees back up. The customer pays cash at
  the pitch after playing — the platform never touches money, so there's nothing to refund either.
- **WhatsApp is just a `wa.me` button** with a pre-filled message — no Business API integration. Works for both
  the owner messaging the customer and the customer messaging the owner.
- **Telegram notifications are optional and off by default.** If `TELEGRAM_BOT_TOKEN` /`TELEGRAM_BOT_USERNAME`
  are configured, an owner can link their Telegram chat from Settings and gets an instant message for every new
  booking on their pitches — see `lib/telegram.ts` and the "Telegram bot (optional)" setup step below.
- **Pitch owners authenticate via Supabase Auth**; customers never do. `Owner.role` also has an `ADMIN` value —
  admins get a platform-wide read/manage view under `/admin` instead of just their own pitches.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

At [supabase.com](https://supabase.com), create a project, then from **Project Settings**:

- **API**: copy the Project URL, `anon` key, and `service_role` key.
- **Database → Connection string**: copy both the **pooled** (port 6543, `Transaction` mode) and **direct**
  (port 5432) connection strings.

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in the Supabase URL/keys and both database connection strings. `.env.local` is gitignored.

### 4. Create the photo storage bucket

In the Supabase SQL editor, run:

```sql
insert into storage.buckets (id, name, public)
values ('pitch-photos', 'pitch-photos', true);

create policy "Public read access for pitch photos"
on storage.objects for select
using ( bucket_id = 'pitch-photos' );

create policy "Owners can upload their own pitch photos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'pitch-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Owners can manage their own pitch photos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'pitch-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);
```

Photos are uploaded directly from the browser as `{supabaseUserId}/{pitchId}/{uuid}.{ext}`, which is what these
policies check against.

### 5. Run migrations and seed data

```bash
npx prisma migrate deploy
npm run db:seed
```

The seed script creates a super admin, three demo owners with real Supabase Auth logins, and ten pitches with
sample bookings across every status — printed login credentials at the end (password `TurfAura123!` for all).

### 6. Telegram bot (optional)

Skip this step to launch without it — the Settings page just shows a "not configured" note until you come back
to it.

1. In Telegram, message [@BotFather](https://t.me/BotFather), send `/newbot`, and follow the prompts. It gives
   you a **bot token** and confirms your **bot username** (e.g. `TurfAuraBot`).
2. Add to `.env.local`:
   ```bash
   TELEGRAM_BOT_TOKEN=123456:ABC-your-token
   TELEGRAM_BOT_USERNAME=TurfAuraBot
   TELEGRAM_WEBHOOK_SECRET=some-random-string   # optional but recommended, see below
   ```
3. Telegram delivers updates to `app/api/telegram/webhook/route.ts` via a webhook, which needs a public HTTPS
   URL — this only works once the app is deployed (or tunneled with something like `ngrok`/`cloudflared` for
   local testing), not on a bare `localhost`. Once you have that URL, register it once:
   ```bash
   curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
     -d "url=https://your-app-url/api/telegram/webhook" \
     -d "secret_token=$TELEGRAM_WEBHOOK_SECRET"
   ```
   (Omit `secret_token` if you didn't set `TELEGRAM_WEBHOOK_SECRET` — but without it, anyone who finds the
   webhook URL could send it fake updates, so it's worth setting.)
4. In the app, an owner clicks **Connect Telegram** in Settings, taps **Start** in the chat that opens, and every
   new booking on their pitches shows up there from then on.

### 7. Run it

```bash
npm run dev
```

## Development

- `npm run dev` — dev server
- `npm run build` — typecheck + production build (also regenerates the Prisma client)
- `npm run test` — unit tests
- `npm run lint` — ESLint
- `npx prisma studio` — browse the database
- `npx prisma migrate dev` — create a new migration after changing `prisma/schema.prisma`

Double-booking is prevented at the database level by a Postgres EXCLUDE constraint (see the
`booking_overlap_exclusion` migration), not just application logic.

## Deliberate v1 scope decisions

- **Currency** defaults to GMD (Gambian Dalasi), configurable per pitch (it's a plain string field, not hardcoded).
- **Single timezone**, no conversion — schedule times are plain local `HH:mm` values.
- **One price per pitch.** The schema has a `PriceOverride` table for day/time-based pricing, but no UI wires it
  up yet.
- **Maps** use the no-API-key Google Maps embed for the pin and the documented `google.com/maps/dir` link for
  navigation — no Google Cloud billing/API key needed for v1.
