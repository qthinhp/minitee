/* ============================================================
   Nostos Stays — interactions
   ============================================================ */
(function () {
  "use strict";

  /* ---- Year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Sticky nav shadow ---- */
  var nav = document.getElementById("nav");
  var toTop = document.getElementById("toTop");
  function onScroll() {
    var y = window.scrollY;
    if (nav) nav.classList.toggle("is-scrolled", y > 20);
    if (toTop) toTop.classList.toggle("is-visible", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---- Mobile menu ---- */
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  function closeMenu() {
    if (!toggle || !links) return;
    toggle.classList.remove("is-open");
    links.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
  }

  /* ---- Scroll reveal ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el, i) {
      // gentle stagger for grouped items
      el.style.transitionDelay = (i % 6) * 50 + "ms";
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---- Policy tabs ---- */
  var tabs = document.querySelectorAll(".policy-tab");
  var panels = document.querySelectorAll(".policy-panel");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var name = tab.getAttribute("data-tab");
      tabs.forEach(function (t) {
        var active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", String(active));
      });
      panels.forEach(function (p) {
        var show = p.getAttribute("data-panel") === name;
        p.classList.toggle("is-active", show);
        p.hidden = !show;
      });
    });
  });

  /* ---- Price estimator ---- */
  var PRICES = {
    citrus: { c3: 400, c6: 550, night: 650, day: 900 },
    maroon: { c3: 420, c6: 570, night: 680, day: 950 }
  };
  var PKG_LABEL = { c3: "Combo 3 giờ", c6: "Combo 6 giờ", night: "Qua đêm", day: "Ngày đêm" };
  var DAY_SURCHARGE = { weekday: 0, weekend: 50, holiday: 100 };
  var DAY_LABEL = { weekday: "", weekend: "Phụ thu cuối tuần", holiday: "Phụ thu ngày lễ" };

  var roomSel = document.getElementById("roomSel");
  var pkgSel = document.getElementById("pkgSel");
  var daySel = document.getElementById("daySel");
  var guestSel = document.getElementById("guestSel");
  var priceOut = document.getElementById("estPrice");
  var priceWrap = priceOut ? priceOut.parentElement : null;
  var breakdown = document.getElementById("estBreakdown");

  function fmt(n) { return n.toLocaleString("vi-VN"); }

  function updateEstimate(animate) {
    if (!roomSel || !priceOut) return;
    var room = roomSel.value;
    var pkg = pkgSel.value;
    var day = daySel.value;
    var guest = parseInt(guestSel.value, 10);

    var base = PRICES[room][pkg];
    var daySur = DAY_SURCHARGE[day];
    var guestSur = guest >= 3 ? 100 : 0;
    var total = base + daySur + guestSur;

    // Breakdown rows
    var rows = [
      ["Giá phòng · " + PKG_LABEL[pkg], base]
    ];
    if (daySur) rows.push([DAY_LABEL[day], daySur]);
    if (guestSur) rows.push(["Khách thứ 3", guestSur]);

    if (breakdown) {
      breakdown.innerHTML = rows
        .map(function (r) { return "<li><span>" + r[0] + "</span><b>" + fmt(r[1]) + "k</b></li>"; })
        .join("");
    }

    priceOut.textContent = fmt(total);
    if (animate && priceWrap) {
      priceWrap.classList.remove("bump");
      void priceWrap.offsetWidth; // reflow to restart animation
      priceWrap.classList.add("bump");
    }
  }

  [roomSel, pkgSel, daySel, guestSel].forEach(function (el) {
    if (el) el.addEventListener("change", function () { updateEstimate(true); });
  });
  updateEstimate(false);

  /* ---- Gallery / Showroom ---- */
  var GALLERY = {
    citrus: {
      label: "Citrus Ocean / Pastel Beaver",
      dir: "assets/rooms/citrus/",
      photos: [
        ["01-phong-tong-the.jpg", "Không gian tổng thể"],
        ["02-giuong-sofa.jpg", "Góc giường & sofa"],
        ["03-giuong-1.jpg", "Giường nệm êm ái"],
        ["04-giuong-2.jpg", "Giường & đèn quả lê"],
        ["05-giuong-3.jpg", "Góc nghỉ ngơi"],
        ["06-goi-den.jpg", "Gối & đèn ngủ"],
        ["07-bep-1.jpg", "Khu vực bếp"],
        ["08-bep-2.jpg", "Bếp & tủ lạnh"],
        ["09-sofa-hoa-cuc.jpg", "Sofa gối hoa cúc"],
        ["10-tranh-tuong.jpg", "Tranh tường California"],
        ["11-goc-cay.jpg", "Góc cây xanh"],
        ["12-tivi.jpg", "Tivi & giải trí"]
      ]
    },
    maroon: {
      label: "Maroon Apple",
      dir: "assets/rooms/maroon/",
      photos: [
        ["01-giuong-hong.jpg", "Giường tông hồng"],
        ["02-goi-hong.jpg", "Gối hồng ấm áp"],
        ["03-den-nam-tulip.jpg", "Đèn nấm & hoa tulip"],
        ["04-giuong-cua-so.jpg", "Giường bên cửa sổ"],
        ["05-sofa-tranh.jpg", "Sofa & tranh phong cảnh"],
        ["06-bep-1.jpg", "Khu vực bếp"],
        ["07-bep-2.jpg", "Bếp & bếp từ"],
        ["08-cua-so-ke.jpg", "Góc cửa sổ & kệ"]
      ]
    }
  };

  // Tiles that get a larger footprint in the mosaic (by index)
  var FEATURE = { 0: "gallery__item--wide gallery__item--tall", 5: "gallery__item--wide" };

  function buildGrid(roomKey) {
    var room = GALLERY[roomKey];
    var grid = document.getElementById(roomKey === "citrus" ? "gridCitrus" : "gridMaroon");
    if (!grid || grid.childElementCount) return; // build once
    room.photos.forEach(function (p, i) {
      var fig = document.createElement("button");
      fig.className = "gallery__item" + (FEATURE[i] ? " " + FEATURE[i] : "");
      fig.setAttribute("data-room", roomKey);
      fig.setAttribute("data-index", i);
      fig.setAttribute("aria-label", p[1]);
      var img = document.createElement("img");
      img.src = room.dir + p[0];
      img.alt = room.label + " — " + p[1];
      img.loading = "lazy";
      fig.appendChild(img);
      grid.appendChild(fig);
    });
  }
  buildGrid("citrus");
  buildGrid("maroon");

  // Gallery room tabs
  var gTabs = document.querySelectorAll(".gallery-tab");
  var gGroups = document.querySelectorAll(".gallery__group");
  gTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var room = tab.getAttribute("data-room");
      gTabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", String(on));
      });
      gGroups.forEach(function (g) {
        var show = g.getAttribute("data-room") === room;
        g.classList.toggle("is-active", show);
        g.hidden = !show;
      });
    });
  });

  // Deep-link: clicking "Xem không gian" for maroon should switch tab
  function activateRoom(room) {
    var tab = document.querySelector('.gallery-tab[data-room="' + room + '"]');
    if (tab) tab.click();
  }
  document.querySelectorAll('a[href="#gallery-maroon"]').forEach(function (a) {
    a.addEventListener("click", function () { activateRoom("maroon"); });
  });
  document.querySelectorAll('a[href="#gallery-citrus"]').forEach(function (a) {
    a.addEventListener("click", function () { activateRoom("citrus"); });
  });

  /* ---- Lightbox ---- */
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbCap = document.getElementById("lbCaption");
  var current = { room: "citrus", index: 0 };

  function showLightbox(room, index) {
    var data = GALLERY[room];
    var n = data.photos.length;
    index = (index + n) % n;
    current.room = room; current.index = index;
    var p = data.photos[index];
    lbImg.src = data.dir + p[0];
    lbImg.alt = data.label + " — " + p[1];
    lbCap.textContent = data.label + " · " + p[1] + " (" + (index + 1) + "/" + n + ")";
  }
  function openLightbox(room, index) {
    if (!lb) return;
    showLightbox(room, index);
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    if (!lb) return;
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".gallery__item").forEach(function (item) {
    item.addEventListener("click", function () {
      openLightbox(item.getAttribute("data-room"), parseInt(item.getAttribute("data-index"), 10));
    });
  });

  var lbClose = document.getElementById("lbClose");
  var lbPrev = document.getElementById("lbPrev");
  var lbNext = document.getElementById("lbNext");
  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  if (lbPrev) lbPrev.addEventListener("click", function () { showLightbox(current.room, current.index - 1); });
  if (lbNext) lbNext.addEventListener("click", function () { showLightbox(current.room, current.index + 1); });
  if (lb) {
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLightbox(); });
  }
  document.addEventListener("keydown", function (e) {
    if (!lb || !lb.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") showLightbox(current.room, current.index - 1);
    else if (e.key === "ArrowRight") showLightbox(current.room, current.index + 1);
  });
})();
