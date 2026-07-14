# NFC Water Bottle Tracker — Project Approach

A hydration-tracking app built around a cheap NFC sticker on your water bottle.
Scan the sticker every time you finish and refill the bottle → the app logs one
bottle's worth of water. At the end of the day you get a notification telling
you whether you hit your hydration goal. Stickers are shareable: one physical
bottle can be scanned by multiple people, each logging to their own account.

This document covers how the NFC mechanics actually work on iOS/Android, the
recommended stack, the data model (designed so steps/workouts/calories can be
added later without a rewrite), and a phased roadmap.

---

## 1. The core idea, restated as mechanics

The key realization that shapes everything else:

- **The sticker identifies the *bottle*, not the *person*.**
- **The phone identifies the *person*.**
- A scan event is therefore: `(user from phone session) drank (capacity of bottle from sticker) at (now)`.

This is what makes sharing trivial: when your friend scans the same sticker
with their phone, the same bottle ID arrives at the backend but with *their*
auth token, so the water is logged to *their* account. Nothing special needs
to be written to the tag per-user.

### What goes on the tag

NFC stickers (NTAG213/215/216 — ~$0.20–0.50 each, no battery, passive) store a
small NDEF payload. We write a **URL** to the tag, once, at registration time:

```
https://minitee.app/t/9f3ka2
```

where `9f3ka2` is a short bottle ID we generate. We do **not** store volume,
user info, or counts on the tag — the tag is a dumb pointer; all state lives
in the backend. This means:

- Reconfiguring the bottle (renaming, changing capacity) never requires
  re-writing the tag.
- The same tag works for every user who scans it.
- We can physically **lock** the tag after writing (NTAG chips support a
  one-way lock) so nobody can overwrite the URL with something malicious.

We also read the tag's factory-burned **UID** (7-byte serial) during
registration and store it alongside the bottle ID as a light anti-spoofing
measure (the URL can be copied; the UID can't, without special hardware).

### Why a URL and not a raw app-record

Because URLs give us the best scan UX on both platforms **even when the app
isn't open**:

| Platform | Behavior on tap (screen on, app closed) |
|----------|------------------------------------------|
| **iPhone XS and later** | Background tag reading: iOS reads the NDEF URL automatically and shows a banner. With **Universal Links** configured, tapping the banner opens our app directly to the "logged!" screen. With an **App Clip**, even people who never installed the app get a lightweight log/onboarding experience. |
| **Android** | The OS dispatches the NDEF URL. With **App Links** (verified domain), it opens our app directly, no chooser. If the app isn't installed, the URL opens in the browser → landing page with install links. |

So the happy path is: *finish bottle → refill → tap phone on sticker → banner
→ app opens on a confirmation screen → done in ~2 seconds.* No hunting for
the app, no button pressing inside the app.

Fallback for phones without NFC (or a worn-out sticker): a **QR code** printed
on the same sticker encoding the same URL, plus a manual "+1 bottle" button in
the app. Same endpoint, three input methods.

---

## 2. Recommended stack

**Mobile: React Native + Expo (custom dev build), TypeScript.**
One codebase for iOS and Android. NFC needs the `react-native-nfc-manager`
native module, which means an Expo *development build* (not Expo Go) — a
well-trodden path. Native Swift/Kotlin would be marginally nicer for App
Clips, but doubles the work; not worth it for an MVP.

**Backend: Supabase.**
- Postgres with **Row Level Security** — each user can only read/write their
  own logs, which matters once stickers are shared.
- Built-in auth (Apple/Google sign-in — required for a fast onboarding when a
  friend scans your sticker).
- **Edge Functions + pg_cron** for the end-of-day summary job.
- Realtime subscriptions later, if we want a shared "household hydration"
  screen.
- Generous free tier; nothing to operate.

(Firebase would also work; Supabase is preferred because a relational schema
with foreign keys fits this data shape better, and RLS policies are cleaner
than Firestore rules for the sharing model.)

**Push notifications: Expo Notifications** (wraps APNs + FCM), triggered from
the Edge Function. The "did you drink enough today?" summary is a *server*
push (it needs the day's sum), while simple time-based nudges ("you haven't
logged since 2pm") can start life as *local* scheduled notifications — zero
backend needed — and graduate to smart server pushes later.

**Landing page** at `minitee.app/t/{bottleId}`: static page (deployable on
Vercel/Cloudflare Pages) that hosts the `apple-app-site-association` and
`assetlinks.json` files (required for Universal/App Links) and shows
"Get the app" for uninstalled visitors.

---

## 3. Data model

Designed from day one so that water is just the *first* metric, not a
hardcoded one. Steps, workouts, and calories later become new rows in
`metric_types` + new event sources — no schema surgery.

```sql
-- People
users              (id, display_name, timezone, notify_at, created_at)

-- Physical stickers/bottles. One row per sticker.
bottles            (id, short_code UNIQUE,      -- what's in the URL
                    nfc_uid UNIQUE,             -- factory serial, anti-spoof
                    created_by REFERENCES users,
                    created_at)

-- A user's relationship to a bottle. THIS is what makes sharing work:
-- many users ↔ one bottle, each with their own settings.
user_bottles       (user_id, bottle_id,
                    nickname,                   -- "Blue Hydro Flask"
                    capacity_ml,                -- per-user! your friend may
                                                -- log a different fill level
                    is_active,
                    PRIMARY KEY (user_id, bottle_id))

-- Extensible metric registry. MVP seeds exactly one row: water.
metric_types       (id, slug,                   -- 'water' | later: 'steps',
                                                -- 'workout', 'calories'
                    unit,                       -- 'ml', 'count', 'kcal'
                    aggregation)                -- 'sum' (water/steps/kcal)

-- One row per logged event. The heart of the system.
events             (id, user_id, metric_type_id,
                    value,                      -- 500 (ml)
                    occurred_at,                -- client time, tz-aware
                    source,                     -- 'nfc' | 'qr' | 'manual' |
                                                -- later: 'healthkit', ...
                    bottle_id NULL,             -- set for nfc/qr scans
                    client_event_id UNIQUE,     -- idempotency key (offline
                                                -- sync + double-scan dedupe)
                    created_at)

-- Per-user, per-metric daily target.
goals              (user_id, metric_type_id, target_value, effective_from)
```

Notes:

- **`capacity_ml` lives on `user_bottles`, not `bottles`.** Two people sharing
  a sticker can disagree about how much a "fill" is (one fills to the brim,
  one to the line). Each scan logs the *scanner's* configured amount.
- **Double-scan protection**: the client debounces (ignore a second scan of
  the same bottle within ~90 seconds) and sends a `client_event_id`
  (UUID generated at scan time) so retries during flaky connectivity can't
  create duplicates. Server-side, a unique index enforces it.
- **Offline-first**: scans append to a local queue (SQLite/AsyncStorage) and
  sync when online. The scan UX must never depend on network availability —
  you're often at a gym or on a trail when you refill.
- **Timezone-aware days**: "did I drink enough *today*" is computed in the
  user's timezone (stored on `users`), not UTC. This is the classic
  hydration-app bug; we design for it up front.

### Post-scan adjustment

Scanning logs a full bottle by default, but the confirmation screen shows a
quick adjuster for the real world: "Full · ¾ · ½ · ¼" chips, editable for
~30 seconds after the scan. Fast path stays one-tap; honesty stays possible.

---

## 4. The sharing flow

1. Alice registers a sticker: app writes `https://minitee.app/t/9f3ka2` to the
   tag, locks it, creates `bottles` + her `user_bottles` row.
2. Alice hands the bottle to Bob (or Bob just scans it at the office).
3. Bob's phone reads the URL:
   - **App installed** → app opens, sees an unknown bottle for his account →
     "Link this bottle? Set your fill amount:" → creates his `user_bottles`
     row → subsequent scans are one-tap logs.
   - **App not installed** → landing page (or iOS App Clip later) → install /
     instant-log + sign in → same linking flow.
4. From then on, the same physical sticker logs to whichever account is on
   the scanning phone. No pairing, no permissions needed from Alice —
   the sticker is a public pointer, and privacy lives in RLS (Bob can never
   see Alice's logs; they only share the bottle row).

Optional later: a "hydration buddies" screen where linked users of the same
bottle *opt in* to seeing each other's daily totals for friendly competition.

---

## 5. Notifications

**End-of-day summary (the MVP requirement).**
A `pg_cron` job runs an Edge Function every 15 minutes; it selects users whose
local `notify_at` (default 21:00) falls in that window, sums today's water
events against their goal, and sends one push:

- Goal met: "💧 2.6L / 2.5L — goal hit. 4-day streak!"
- Goal missed: "You logged 1.5L of 2.5L today. Bottle before bed?"

**In-day nudges (cheap win, ships in MVP as local notifications).**
On each scan the app reschedules a local notification for +3h: "Nothing logged
since 2:15pm — time for a refill?" Every new scan pushes it back, so it only
fires when you've actually gone quiet. No server involvement.

**Quiet by design.** Max one nudge + one summary per day. Hydration apps die
by being annoying.

---

## 6. Hardware shopping list (for prototyping)

- **NTAG213 stickers, 25mm round** — 144 bytes user memory, plenty for our
  ~40-char URL. Buy a 10-pack (~$8). NTAG215/216 are fine too, just more
  memory than needed.
- Prefer **on-metal (ferrite-backed) variants** if the bottle is steel
  (Hydro Flask, etc.) — regular NFC stickers are unreadable on bare metal.
- A free tag-writer app (e.g. "NFC Tools") is handy to sanity-check tags
  before our in-app writer exists.

---

## 7. Roadmap

### Phase 0 — Spike (a weekend)
Prove the magic moment before building anything else:
- Write a URL to an NTAG213 with an off-the-shelf app.
- Bare Expo dev-build app with `react-native-nfc-manager`: read tag → show
  "+500ml" toast. Confirm iOS background-tag banner and Android App Link
  dispatch both open it. **If this feels great, everything else is worth
  building.**

### Phase 1 — MVP (the water bottle, end to end)
- Supabase project: schema above, RLS, Apple/Google auth.
- App: onboarding (goal + timezone), register-a-sticker flow (write + lock
  tag), scan-to-log with post-scan adjuster, Today screen (progress ring,
  today's events, manual +add), offline queue.
- Landing page + Universal/App Links config.
- End-of-day push + local 3h nudge.
- Bottle sharing (the linking flow in §4).

### Phase 2 — Retention
- History: week/month charts, streaks, best days.
- Buddy view for shared bottles (opt-in totals).
- iOS App Clip so a never-installed friend can log from a scan.
- Widgets / watch complication showing today's progress.

### Phase 3 — The platform ("track other things")
- Seed new `metric_types`: **steps** (import via HealthKit / Health Connect —
  no new hardware, `source='healthkit'`), **workouts**, **calories**
  (manual/photo entry). The Today screen becomes a ring per active metric;
  goals and the daily summary generalize automatically because the summary
  job already iterates `goals`, not "water".
- NFC stays a *water* input method; other metrics get their own sources.
  The event pipeline, goals, notifications, history, and sharing are already
  metric-agnostic.

---

## 8. Risks & gotchas (known up front)

| Risk | Mitigation |
|------|------------|
| iOS background scan only works on unlocked, screen-on phones; iPhone 8/X need the app open | Acceptable: users pull the phone out anyway. QR + manual button as fallbacks. |
| Metal bottles kill NFC reads | Ship/recommend on-metal tags; document it in onboarding. |
| Double scans / kids playing with the sticker | Client debounce + `client_event_id` idempotency + post-scan undo. |
| Someone rewrites the tag URL | Lock tags at registration (one-way NTAG lock bit). |
| "Scan = full bottle" over-reports | Post-scan ¾/½/¼ adjuster; per-user `capacity_ml`. |
| Timezone bugs in daily totals | All day-math in user's stored timezone; test DST boundaries. |
| Notification fatigue | Hard cap: 1 nudge + 1 summary/day. |

---

## 9. Suggested repo layout (when implementation starts)

```
apps/mobile/          # Expo React Native app (TypeScript)
apps/web/             # Landing page + AASA/assetlinks + /t/{code} route
packages/shared/      # Types, zod schemas shared between app and functions
supabase/
  migrations/         # SQL schema (source of truth = §3)
  functions/
    log-event/        # POST scan/manual events (idempotent)
    daily-summary/    # cron-driven push notifications
```
