# Nostos Stays — Homestay Website

A warm, earthy single-page marketing website for **Nostos Stays**, a cozy
homestay in Ho Chi Minh City. *Nostos* (νόστος) is Greek for "homecoming" —
the site leans into that feeling of returning home.

🏡 **61 Rạch Bùng Binh, P. Nhiêu Lộc, TP. Hồ Chí Minh** · ☎ 0909 488 364

## Features

- **Hero** with animated organic "blobs" and a homecoming tagline
- **Câu chuyện** (About) — the meaning behind the Nostos name
- **Phòng** (Rooms) — Citrus Ocean / Pastel Beaver & Maroon Apple, with price lists
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
- **Colors** are CSS variables at the top of `css/styles.css` (`--forest`,
  `--terra`, `--cream`, …).
- **Contact info** (phone, address, map) is in the `#contact` section of
  `index.html` and the footer.
