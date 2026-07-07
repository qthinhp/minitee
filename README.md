# Nostos Stays — Homestay Website

A warm, earthy single-page marketing website for **Nostos Stays**, a cozy
homestay in Ho Chi Minh City. *Nostos* (νόστος) is Greek for "homecoming" —
the site leans into that feeling of returning home.

🏡 **61 Rạch Bùng Binh, P. Nhiêu Lộc, TP. Hồ Chí Minh** · ☎ 0909 488 364

## Features

- **Hero** with animated organic "blobs" and a homecoming tagline
- **Câu chuyện** (About) — the meaning behind the Nostos name
- **Bilingual** — a VI / EN language switch in the nav (choice saved to `localStorage`)
- **Phòng** (Rooms) — Citrus Ocean, Pastel Beaver & Maroon Apple, with price lists
- **Showroom** — per-room photo galleries with a room switcher and click-to-enlarge
  lightbox (Citrus Ocean shows a "coming soon" placeholder until photos arrive)
- **Bảng giá** — full price table **plus an interactive booking estimator**
  (room × package × weekday/weekend/holiday × guests → live total)
- **Tiện nghi** (Amenities) — full equipment grid
- **Nội quy** (House Rules) — all 12 rules
- **Chính sách** (Policies) — tabbed: payment, cancellation, surcharge
- **Liên hệ** (Contact) — address, phone/Zalo, embedded Google Map
- Sticky nav, mobile menu, scroll-reveal animations, back-to-top
- Fully responsive, `prefers-reduced-motion` aware, no build step

## Tech

Plain **HTML + CSS + vanilla JS**. No frameworks, no dependencies.
Fonts: *Fraunces* (display) + *Be Vietnam Pro* (body, full Vietnamese support).

```
.
├── index.html        # all sections
├── css/styles.css    # earthy theme + responsive
├── js/script.js      # nav, reveal, estimator, tabs
└── assets/           # logo
```

## Run locally

It's a static site — just open `index.html`, or serve it:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Customize

- **Prices** live in two places: the markup in `index.html` (room cards +
  table) and the `PRICES` object in `js/script.js` (estimator). Update both.
- **Text / translations** live in the `I18N` dictionary in `js/script.js`,
  keyed by the `data-i18n="..."` attributes on elements in `index.html`.
  Every visible string has a `vi` and an `en` entry — edit both.
- **Room photos** go in `assets/rooms/<room>/`; the `GALLERY` object in
  `js/script.js` lists each room's files + captions. To add Citrus Ocean
  photos, drop them in `assets/rooms/citrus-ocean/`, add a `citrus` entry to
  `GALLERY`, and swap the "coming soon" block for a `<div class="gallery__grid">`.
- **Colors** are CSS variables at the top of `css/styles.css` (`--forest`,
  `--terra`, `--cream`, …).
- **Contact info** (phone, address, map) is in the `#contact` section of
  `index.html` and the footer.
