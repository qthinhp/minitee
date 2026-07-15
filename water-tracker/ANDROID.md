# Get the app on your Android phone 📱

No Android Studio needed — Expo's EAS service builds the APK in the cloud,
you download it straight to your phone. Total time: ~30 minutes, most of it
waiting for the cloud build.

## What you need

- A computer with **Node.js 20+** and **git**
- Two free accounts: [supabase.com](https://supabase.com) (database) and
  [expo.dev](https://expo.dev) (build service)
- An Android phone (Android 8+; NFC needed later for real stickers)

## Step 1 — Supabase backend (~10 min)

1. supabase.com → **New project** (free tier, any region near you).
2. Open **SQL Editor** → paste + run `supabase/migrations/0001_init.sql`,
   then `supabase/migrations/0002_history.sql` (in that order).
3. **Authentication → Sign In / Up → Email**: make sure Email is enabled.
4. **Project Settings → API**: copy the **Project URL** and the
   **anon public** key. (The anon key is designed to ship inside apps —
   row-level security is what protects the data, and ours is tested.)

## Step 2 — Configure the app (~2 min)

```bash
git clone <this repo> && cd water-tracker/apps/mobile
npm install
```

Open `eas.json` and replace the two `REPLACE-ME` values in **both** the
`development` and `preview` profiles with your Project URL and anon key.
(For local dev with a dev server, also copy them into `.env` — see
`.env.example`.)

## Step 3 — Build the APK in the cloud (~15 min, mostly waiting)

```bash
npm install -g eas-cli
eas login                      # your expo.dev account
eas init                       # links the project (accept the defaults)
eas build -p android --profile preview
```

When it finishes, EAS prints a link + QR code. Open it **on your phone**,
download the APK, and install it (Android will ask you to allow installs
from your browser — that's normal for apps outside the Play Store).

## Step 4 — First run 🎉

1. Sign in with your email → you'll get a 6-digit code in your inbox.
2. **Settings** → pick your daily goal and check-in time → Save.
3. **✨ New sticker** → create a bottle (your NFC stickers aren't here yet,
   so it stays in mock mode — the bottle works via the 🧪 button).
4. Tap **🧪 Pretend I tapped a sticker** → link the bottle → tap it again →
   watch Bubbles float. 🐱
5. Long-press your home screen → **Widgets** → **Water Tracker** → drop the
   widget. It updates after every sip.

## When your NFC stickers arrive

1. In `src/lib/nfc.ts` set `NFC_MOCK_MODE = false`.
2. Rebuild + reinstall: `eas build -p android --profile preview`.
3. In the app: **✨ New sticker → Write to sticker**, hold the phone on a
   blank sticker. It writes the bottle's link and permanently locks the tag.
4. From then on: refill → tap phone on bottle → logged. Friends who scan it
   get sent to install the app and link the same bottle to their own account.

Note for steel bottles: regular NFC stickers can't be read on bare metal —
you need "on-metal" (ferrite-backed) tags.

## Optional — end-of-day notification

Local "you've been quiet for 3h" nudges work out of the box. The nightly
"did you drink enough" push needs the edge function deployed once:
see "Daily summary push" in `README.md` (requires the Supabase CLI).

## Faster dev loop (optional)

For live-reload development instead of full rebuilds:

```bash
eas build -p android --profile development   # once
npx expo start --dev-client                  # then connect from the phone
```

## Troubleshooting

- **"Network request failed" at sign-in** → the URL/key in `eas.json` are
  wrong or still `REPLACE-ME`; fix and rebuild.
- **No email code arriving** → Supabase → Authentication → check the email
  provider is enabled; look in spam. Free tier email is rate-limited to a
  few per hour — fine for you + friends.
- **Widget shows 0.0L after midnight** → that's by design; it resets daily.
- **Build fails on the iOS widget plugin** → it shouldn't touch Android
  builds; if it ever does, remove `"@bacons/apple-targets"` from
  `app.json` plugins (it's only needed for the iPhone widget).
