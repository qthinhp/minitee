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
})();
