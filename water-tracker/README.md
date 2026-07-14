# Water Tracker

NFC-sticker hydration tracker. Design doc: [`docs/water-tracker/APPROACH.md`](../docs/water-tracker/APPROACH.md).

```
apps/mobile/    Expo React Native app (TypeScript)
apps/web/       Landing page + /t/{code} route + Universal/App Links files
supabase/       SQL schema + RPCs (migrations/) and edge functions
```

**Built to be fully testable before the NFC stickers arrive** — `NFC_MOCK_MODE`
in `apps/mobile/src/lib/nfc.ts` plus the in-app "Simulate sticker scan" button
exercise the exact same code path a real tag will (deep link → link/log →
confirm → sync).

## Setup

### 1. Supabase (~10 min)

1. Create a project at [supabase.com](https://supabase.com) (free tier).
2. SQL Editor → paste and run `supabase/migrations/0001_init.sql`.
3. Auth → Providers → enable **Email** (OTP). Later: Apple + Google.
4. Copy the project URL + anon key into `apps/mobile/.env`
   (see `.env.example`).

### 2. Mobile app

```bash
cd apps/mobile
cp .env.example .env       # fill in Supabase creds
npm install
npx expo install --fix     # aligns native deps with the Expo SDK
npx expo run:ios           # or: npx expo run:android
```

Needs a dev build (not Expo Go) because of `react-native-nfc-manager`.
While in mock mode the app runs fine in the iOS Simulator / Android emulator.

**Smoke test without hardware:** sign in → Register sticker (creates bottle
`code` + shows tag URL) → tap "🧪 Simulate sticker scan" → link the mock
bottle → simulate again → confirm screen logs a full bottle → adjust with
¾/½/¼ → Today total updates. Kill networking mid-scan to see the offline
queue hold and re-sync.

### 3. Daily summary push

```bash
supabase functions deploy daily-summary
supabase secrets set CRON_SECRET=$(openssl rand -hex 16)
```

Then schedule it (SQL editor, needs `pg_cron` + `pg_net` enabled):

```sql
select cron.schedule('daily-summary', '*/15 * * * *', $$
  select net.http_post(
    url := 'https://YOUR-PROJECT.supabase.co/functions/v1/daily-summary',
    headers := '{"Authorization": "Bearer YOUR_CRON_SECRET"}'::jsonb
  );
$$);
```

Push tokens require a physical device and an EAS project id — fine to defer.

### 4. Landing page (needed for real-tag deep links, not for mock mode)

Deploy `apps/web/` to Vercel/Cloudflare Pages behind your domain, after
filling in:
- `.well-known/apple-app-site-association` → your Apple **Team ID**
- `.well-known/assetlinks.json` → your Android signing cert **SHA-256**

The domain must match `EXPO_PUBLIC_TAG_DOMAIN` and `app.json`
(`associatedDomains` / `intentFilters`).

## Home-screen widgets 📱

Both platforms show today's total, goal progress, and a mood face; the app
pushes fresh numbers to them after every sip (`src/widgets/widget-sync.tsx`),
and both fall back to a cached value offline (stale days render as 0).

**Android** — `react-native-android-widget`. The widget UI is plain TSX
(`src/widgets/HydrationWidget.tsx`) rendered natively; the headless task in
`widgetTaskHandler.tsx` (registered in `index.ts`) handles adds/resizes and
the 30-min periodic refresh. Config lives in `app.json` under the plugin.
Nothing extra to do beyond `npx expo prebuild` + build: long-press the home
screen → Widgets → Water Tracker.

**iOS** — a real WidgetKit extension (`targets/widget/HydrationWidget.swift`,
home screen + lock-screen ring), generated into the Xcode project by the
`@bacons/apple-targets` plugin. Data flows through the App Group
`group.app.minitee.watertracker` (must match `app.json` entitlements,
`targets/widget/expo-target.config.js`, and `APP_GROUP` in
`src/widgets/widget-data.ts`). Requirements: `npx expo prebuild -p ios`, an
Apple team set in Xcode signing for BOTH targets, iOS 17+. Widgets don't run
in the simulator's Expo Go — use the dev build.

Widget packages are pinned to `latest` on purpose (they version independently
of the Expo SDK); after your first successful build, pin the resolved
versions in package.json.

## When the stickers arrive 📦

1. Flip `NFC_MOCK_MODE = false` in `apps/mobile/src/lib/nfc.ts`.
2. In the app: **Register sticker** → "Write to sticker" — writes
   `https://<domain>/t/<code>` and permanently locks the tag.
3. Stick it on the bottle, lock the phone, tap it: iOS shows the banner /
   Android opens the app → confirm screen. That's the whole loop.
4. Steel bottle and flaky reads? You need **on-metal (ferrite-backed)** tags.

## Sharing with friends

Nothing to configure. A friend scans your sticker → their phone opens the
app (or the install page) → they set their own name/fill amount for the same
bottle → their scans log to their account. Row-level security keeps
everyone's logs private.
