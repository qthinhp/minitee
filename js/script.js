/* ============================================================
   Nostos Stays — interactions + bilingual (VI / EN)
   ============================================================ */
(function () {
  "use strict";

  /* ------------------------------------------------------------
     i18n dictionary
  ------------------------------------------------------------ */
  var I18N = {
    vi: {
      "nav.about": "Câu chuyện", "nav.rooms": "Phòng", "nav.showroom": "Showroom",
      "nav.pricing": "Bảng giá", "nav.amenities": "Tiện nghi", "nav.rules": "Nội quy",
      "nav.policies": "Chính sách", "nav.book": "Đặt phòng", "nav.contact": "Liên hệ",

      "hero.eyebrow": "νόστος · sự trở về nhà",
      "hero.title": "Một nơi để <em>trở về</em>,<br />nghỉ ngơi và <em>thuộc về</em>.",
      "hero.sub": "Nostos Stays là homestay nhỏ ấm cúng giữa lòng Sài Gòn — nơi ánh nắng, cây xanh và sự mộc mạc cùng nhau kể một câu chuyện về cảm giác như ở nhà.",
      "hero.cta1": "Khám phá phòng", "hero.cta2": "Đặt phòng ngay",
      "hero.addr": "📍 61 Rạch Bùng Binh, Nhiêu Lộc",

      "about.kicker": "Câu chuyện của chúng mình",
      "about.title": "Nostos — tiếng Hy Lạp cho <em>“sự trở về nhà”</em>",
      "about.p1": "Sau những chuyến đi dài, ai cũng cần một nơi chốn để dừng chân. Nostos Stays ra đời từ mong muốn ấy — một không gian nhỏ, ấm áp và mộc mạc, nơi bạn có thể buông bỏ ồn ào phố thị và thực sự thở.",
      "about.p2": "Mỗi căn phòng được chăm chút bằng tông màu đất, ánh sáng dịu và những tiện nghi chu đáo, để dù bạn ở 3 giờ hay cả một đêm dài, bạn vẫn cảm thấy mình đang <strong>trở về</strong>, chứ không chỉ là ghé qua.",
      "about.quote": "“Nơi nào có sự bình yên,<br />nơi đó là nhà.”",
      "about.pt1": "Không gian mộc mạc, gần gũi thiên nhiên",
      "about.pt2": "Check-in / check-out tự động, riêng tư",
      "about.pt3": "Nước lọc, trà &amp; cà phê miễn phí mỗi ngày",

      "rooms.kicker": "Phòng nghỉ",
      "rooms.title": "Chọn một góc nhỏ <em>thuộc về bạn</em>",
      "rooms.lead": "Ba phong cách phòng, cùng một sự ấm áp. Tất cả đều được trang bị đầy đủ tiện nghi cho một kỳ nghỉ trọn vẹn.",
      "rooms.citrusDesc": "Tông màu tươi mát của biển và trái cây miền nắng — hình ảnh đang được cập nhật, hẹn bạn sớm nhé!",
      "rooms.pastelDesc": "Tông nâu gỗ ấm áp, mộc mạc — lựa chọn được yêu thích cho những kỳ nghỉ nhẹ nhàng, thư thái.",
      "rooms.maroonDesc": "Sắc đỏ rượu vang trầm ấm, lãng mạn — không gian dành cho những ai yêu sự sâu lắng và riêng tư.",
      "rooms.soonTag": "Sắp ra mắt", "rooms.popularTag": "Phổ biến", "rooms.warmTag": "Ấm áp",
      "rooms.view": "Xem không gian", "rooms.book": "Đặt phòng này", "rooms.photoSoon": "Hình sắp có",
      "rooms.note": "* Combo 6 giờ giờ tuỳ chọn, check-out trễ nhất là 21h. Extra giờ: 100k/giờ (báo trước ít nhất 2 giờ).",

      "showroom.kicker": "Showroom",
      "showroom.title": "Dạo một vòng <em>từng căn phòng</em>",
      "showroom.lead": "Mỗi góc nhỏ đều được chăm chút. Nhấn vào bất kỳ tấm hình nào để xem lớn hơn.",
      "showroom.soonTitle": "Hình đang được cập nhật",
      "showroom.soonText": "Phòng Citrus Ocean sắp có bộ ảnh riêng. Ghé lại sớm nhé — hoặc liên hệ để tụi mình gửi hình trực tiếp!",
      "showroom.soonCta": "Liên hệ xem phòng",

      "pricing.kicker": "Bảng giá &amp; ước tính",
      "pricing.title": "Tính nhanh chi phí <em>cho chuyến đi của bạn</em>",
      "pricing.lead": "Chọn phòng và gói lưu trú để xem mức giá tham khảo. Cuối tuần, ngày lễ và khách thứ 3 sẽ có phụ thu nhỏ.",
      "est.room": "Phòng", "est.pkg": "Gói lưu trú", "est.day": "Ngày nhận phòng", "est.guests": "Số khách",
      "est.optCitrus": "Citrus Ocean", "est.optPastel": "Pastel Beaver", "est.optMaroon": "Maroon Apple",
      "est.optC3": "Combo 3 giờ", "est.optC6": "Combo 6 giờ", "est.optNight": "Qua đêm (22h–10h)", "est.optDay": "Ngày đêm (14h–12h)",
      "est.optWeekday": "Ngày thường (T2–T6)", "est.optWeekend": "Cuối tuần (T7, CN) · +50k", "est.optHoliday": "Ngày lễ · +100k",
      "est.optG2": "1–2 khách", "est.optG3": "3 khách · +100k",
      "est.total": "Tổng tạm tính", "est.contact": "Liên hệ đặt phòng",
      "est.fine": "Giá tham khảo, chưa gồm dịch vụ phát sinh. Vui lòng liên hệ để xác nhận.",

      "pkg.c3": "Combo 3 giờ", "pkg.c6": "Combo 6 giờ",
      "pkg.night": "Qua đêm <em>(22h–10h)</em>", "pkg.day": "Ngày đêm <em>(14h–12h)</em>",
      "table.room": "Phòng", "table.night": "Qua đêm<br /><small>22h–10h</small>", "table.day": "Ngày đêm<br /><small>14h–12h</small>",

      "amen.kicker": "Tiện nghi",
      "amen.title": "Tất cả các phòng đều được <em>trang bị đầy đủ</em>",
      "amen.1t": "Check in/out tự động", "amen.1d": "Nhận &amp; trả phòng linh hoạt, riêng tư.",
      "amen.2t": "Camera an ninh", "amen.2d": "Check cam ẩn, an toàn cho mọi khách.",
      "amen.3t": "Giường nệm 1m6", "amen.3d": "Êm ái cho giấc ngủ trọn vẹn.",
      "amen.4t": "Sofa &amp; bàn", "amen.4d": "Góc thư giãn ấm cúng.",
      "amen.5t": "Tivi Google Play", "amen.5d": "Sẵn Netflix &amp; YouTube Premium.",
      "amen.6t": "Khu vực bếp", "amen.6d": "Vật dụng &amp; gia vị nấu ăn cơ bản.",
      "amen.7t": "Đồ dùng cá nhân", "amen.7d": "Bàn chải, lược, khăn, máy sấy tóc.",
      "amen.8t": "Nước, trà &amp; cà phê", "amen.8d": "Miễn phí mỗi ngày.",
      "amen.note1": "🪑 Chỉ nhận tối đa <strong>3 khách</strong> (phụ thu 100k cho khách thứ 3).",
      "amen.note2": "📅 T7, CN phụ thu 50k/phòng — Ngày lễ phụ thu 100k/phòng.",

      "rules.kicker": "Nội quy",
      "rules.title": "Một vài quy định nhỏ <em>tại Nostos Stays</em>",
      "rules.lead": "Để mỗi vị khách đều có những giây phút dễ chịu và an toàn nhất.",
      "rules.1": "Vui lòng đi nhẹ, nói khẽ và đi lại nhẹ nhàng sau 22h.",
      "rules.2": "Không hút thuốc trong phòng.",
      "rules.3": "Không mang thú cưng vào phòng.",
      "rules.4": "Không tự ý di chuyển đồ đạc trong phòng.",
      "rules.5": "Không mang thức ăn có mùi nồng vào phòng như sầu riêng, mắm, đồ nướng,…",
      "rules.6": "Vui lòng không tổ chức tiệc tùng hoặc lưu trú vượt quá số lượng khách đã đăng ký.",
      "rules.7": "Không tự ý trang trí nếu chưa báo trước. Khi có hư hỏng phát sinh, home sẽ tính phí sửa chữa phòng về hiện trạng cũ.",
      "rules.8": "Vui lòng rửa chén bát sau khi sử dụng. Nếu để lại số lượng lớn chưa rửa, home sẽ phụ thu 100.000đ.",
      "rules.9": "Không sử dụng chất cấm hoặc thực hiện các hành vi vi phạm pháp luật Việt Nam.",
      "rules.10": "Nếu chăn, ga, gối, nệm, sofa bị dính vết bẩn không thể xử lý, home sẽ thu phí tương đương giá trị khi mua mới.",
      "rules.11": "Home không chịu trách nhiệm với đồ đạc gửi trước khi check-in và đồ thất lạc ngoài thời gian lưu trú. Nếu để quên đồ, vui lòng chủ động liên hệ để lấy lại sớm nhất.",
      "rules.12": "Trường hợp đồ đạc trong phòng có vấn đề như hư hỏng/mất mát, home sẽ trao đổi cùng bạn để đưa ra phương án phù hợp nhất.",
      "rules.wish": "Hy vọng bạn sẽ có những giây phút dễ chịu tại <strong>nostos stays</strong> 🌿",

      "pol.kicker": "Chính sách",
      "pol.title": "Thanh toán, huỷ, đổi <em>&amp; phụ thu</em>",
      "pol.tabPay": "Thanh toán", "pol.tabCancel": "Huỷ &amp; đổi lịch", "pol.tabSur": "Phụ thu",
      "pol.pay1": "<b>Đặt theo khung giờ hoặc 1 ngày:</b> Thanh toán 100%.",
      "pol.pay2": "<b>Đặt từ 2 ngày:</b> Cọc 50% và thanh toán 50% còn lại trước lịch check-in 1 ngày.",
      "pol.cancel1": "Huỷ trước ngày check-in <b>10 ngày</b>: hoàn tiền 100%.",
      "pol.cancel2": "Trước check-in <b>7–9 ngày</b>: hoàn tiền 80%.",
      "pol.cancel3": "Trước check-in <b>4–6 ngày</b>: hoàn tiền 50%.",
      "pol.cancel4": "Trước check-in <b>dưới 4 ngày</b>: không hoàn tiền.",
      "pol.cancelFine": "* Đổi lịch booking trước ít nhất 3 ngày, hỗ trợ đổi lịch 2 lần. Từ lần thứ 2 thu phí 200k/lần đổi.",
      "pol.sur1": "<b>Trẻ em dưới 6 tuổi:</b> Không phụ thu.",
      "pol.sur2": "<b>Trẻ em 6–12 tuổi:</b> Phụ thu 50k / trẻ em / đêm.",
      "pol.sur3": "<b>Người lớn thứ 3 trở đi:</b> 100k / người lớn / đêm.",
      "pol.surFine": "** Lưu ý: Với trường hợp ở trên 2 người nhưng không khai báo, khi phát hiện home sẽ phụ thu 300k/khách.",

      "contact.kicker": "Đặt phòng &amp; liên hệ",
      "contact.title": "Sẵn sàng <em>trở về</em> chưa?",
      "contact.lead": "Nhắn cho tụi mình để giữ chỗ hoặc hỏi bất cứ điều gì — Nostos luôn ở đây chờ bạn.",
      "contact.addrLabel": "Địa chỉ", "contact.phoneLabel": "Điện thoại / Zalo",
      "contact.timeLabel": "Nhận / trả phòng", "contact.timeVal": "Ngày đêm 14h–12h · Qua đêm 22h–10h",
      "contact.call": "Gọi đặt phòng", "contact.zalo": "Nhắn Zalo",

      "footer.tag": "Một nơi để trở về.",

      /* dynamic (used by JS) */
      "dyn.roomPrice": "Giá phòng", "dyn.weekend": "Phụ thu cuối tuần", "dyn.holiday": "Phụ thu ngày lễ",
      "dyn.guest3": "Khách thứ 3",
      "dyn.pkg.c3": "Combo 3 giờ", "dyn.pkg.c6": "Combo 6 giờ", "dyn.pkg.night": "Qua đêm", "dyn.pkg.day": "Ngày đêm"
    },

    en: {
      "nav.about": "Our Story", "nav.rooms": "Rooms", "nav.showroom": "Showroom",
      "nav.pricing": "Pricing", "nav.amenities": "Amenities", "nav.rules": "House Rules",
      "nav.policies": "Policies", "nav.book": "Book Now", "nav.contact": "Contact",

      "hero.eyebrow": "νόστος · the homecoming",
      "hero.title": "A place to <em>return</em>,<br />to rest and to <em>belong</em>.",
      "hero.sub": "Nostos Stays is a cozy little homestay in the heart of Saigon — where sunlight, greenery and simplicity together tell a story about feeling right at home.",
      "hero.cta1": "Explore rooms", "hero.cta2": "Book now",
      "hero.addr": "📍 61 Rach Bung Binh, Nhieu Loc",

      "about.kicker": "Our story",
      "about.title": "Nostos — Greek for <em>“the return home”</em>",
      "about.p1": "After every long journey, we all need a place to pause. Nostos Stays was born from that wish — a small, warm and unpretentious space where you can let go of the city noise and truly breathe.",
      "about.p2": "Each room is cared for with earthy tones, soft light and thoughtful comforts, so whether you stay 3 hours or a whole night, you feel like you are <strong>coming home</strong>, not just passing through.",
      "about.quote": "“Where there is peace,<br />there is home.”",
      "about.pt1": "Rustic space, close to nature",
      "about.pt2": "Automatic, private check-in / check-out",
      "about.pt3": "Free water, tea &amp; coffee every day",

      "rooms.kicker": "Our rooms",
      "rooms.title": "Find a little corner <em>that's yours</em>",
      "rooms.lead": "Three room styles, one same warmth. All fully equipped for a complete getaway.",
      "rooms.citrusDesc": "The fresh tones of ocean and sun-kissed citrus — photos are being updated, see you soon!",
      "rooms.pastelDesc": "Warm, rustic wood-brown tones — a much-loved choice for gentle, relaxed getaways.",
      "rooms.maroonDesc": "Deep, romantic wine-red hues — a space for those who love calm and privacy.",
      "rooms.soonTag": "Coming soon", "rooms.popularTag": "Popular", "rooms.warmTag": "Cozy",
      "rooms.view": "View space", "rooms.book": "Book this room", "rooms.photoSoon": "Photos soon",
      "rooms.note": "* The 6-hour combo has flexible hours, check-out by 21:00 at the latest. Extra hour: 100k/hour (at least 2 hours' notice).",

      "showroom.kicker": "Showroom",
      "showroom.title": "Take a stroll <em>through each room</em>",
      "showroom.lead": "Every little corner is cared for. Tap any photo to see it larger.",
      "showroom.soonTitle": "Photos coming soon",
      "showroom.soonText": "The Citrus Ocean room will have its own photo set soon. Check back later — or contact us and we'll send photos directly!",
      "showroom.soonCta": "Contact to view",

      "pricing.kicker": "Pricing &amp; estimate",
      "pricing.title": "Quickly estimate the cost <em>of your stay</em>",
      "pricing.lead": "Pick a room and package to see an indicative price. Weekends, holidays and a 3rd guest carry a small surcharge.",
      "est.room": "Room", "est.pkg": "Package", "est.day": "Check-in day", "est.guests": "Guests",
      "est.optCitrus": "Citrus Ocean", "est.optPastel": "Pastel Beaver", "est.optMaroon": "Maroon Apple",
      "est.optC3": "3-hour combo", "est.optC6": "6-hour combo", "est.optNight": "Overnight (22:00–10:00)", "est.optDay": "Full day (14:00–12:00)",
      "est.optWeekday": "Weekday (Mon–Fri)", "est.optWeekend": "Weekend (Sat, Sun) · +50k", "est.optHoliday": "Holiday · +100k",
      "est.optG2": "1–2 guests", "est.optG3": "3 guests · +100k",
      "est.total": "Estimated total", "est.contact": "Contact to book",
      "est.fine": "Indicative price, extra services not included. Please contact us to confirm.",

      "pkg.c3": "3-hour combo", "pkg.c6": "6-hour combo",
      "pkg.night": "Overnight <em>(22:00–10:00)</em>", "pkg.day": "Full day <em>(14:00–12:00)</em>",
      "table.room": "Room", "table.night": "Overnight<br /><small>22:00–10:00</small>", "table.day": "Full day<br /><small>14:00–12:00</small>",

      "amen.kicker": "Amenities",
      "amen.title": "Every room comes <em>fully equipped</em>",
      "amen.1t": "Automatic check in/out", "amen.1d": "Flexible, private arrival &amp; departure.",
      "amen.2t": "Security camera", "amen.2d": "Discreet cameras, safe for every guest.",
      "amen.3t": "1.6m mattress bed", "amen.3d": "Soft and cozy for a full night's sleep.",
      "amen.4t": "Sofa &amp; table", "amen.4d": "A warm little relaxing nook.",
      "amen.5t": "Google Play TV", "amen.5d": "Netflix &amp; YouTube Premium ready.",
      "amen.6t": "Kitchen area", "amen.6d": "Basic cookware &amp; seasonings.",
      "amen.7t": "Personal toiletries", "amen.7d": "Toothbrush, comb, towel, hair dryer.",
      "amen.8t": "Water, tea &amp; coffee", "amen.8d": "Free every day.",
      "amen.note1": "🪑 Up to <strong>3 guests</strong> (100k surcharge for the 3rd guest).",
      "amen.note2": "📅 Sat &amp; Sun: +50k/room — Holidays: +100k/room.",

      "rules.kicker": "House Rules",
      "rules.title": "A few small rules <em>at Nostos Stays</em>",
      "rules.lead": "So every guest can have the most pleasant and safe moments.",
      "rules.1": "Please move softly and keep quiet after 22:00.",
      "rules.2": "No smoking inside the room.",
      "rules.3": "No pets in the room.",
      "rules.4": "Please do not rearrange the furniture on your own.",
      "rules.5": "No strong-smelling food in the room, such as durian, fermented fish sauce, grilled food, etc.",
      "rules.6": "Please do not host parties or stay beyond the registered number of guests.",
      "rules.7": "No decorating without prior notice. For any damage caused, the home will charge to restore the room to its original state.",
      "rules.8": "Please wash the dishes after use. If a large amount is left unwashed, the home will add a 100,000đ surcharge.",
      "rules.9": "No use of prohibited substances or any acts violating Vietnamese law.",
      "rules.10": "If blankets, sheets, pillows, mattress or sofa are stained beyond cleaning, the home will charge the equivalent of the replacement value.",
      "rules.11": "The home is not responsible for items sent before check-in or lost outside the stay period. If you forget something, please contact us proactively to retrieve it as soon as possible.",
      "rules.12": "If items in the room are damaged/lost, the home will discuss with you to find the most suitable solution.",
      "rules.wish": "We hope you'll have pleasant moments at <strong>nostos stays</strong> 🌿",

      "pol.kicker": "Policies",
      "pol.title": "Payment, cancellation <em>&amp; surcharges</em>",
      "pol.tabPay": "Payment", "pol.tabCancel": "Cancel &amp; reschedule", "pol.tabSur": "Surcharges",
      "pol.pay1": "<b>Hourly or 1-day booking:</b> Pay 100%.",
      "pol.pay2": "<b>2+ day booking:</b> 50% deposit, pay the remaining 50% one day before check-in.",
      "pol.cancel1": "Cancel <b>10+ days</b> before check-in: 100% refund.",
      "pol.cancel2": "<b>7–9 days</b> before check-in: 80% refund.",
      "pol.cancel3": "<b>4–6 days</b> before check-in: 50% refund.",
      "pol.cancel4": "<b>Under 4 days</b> before check-in: no refund.",
      "pol.cancelFine": "* Reschedule at least 3 days ahead; 2 free reschedules, then 200k per change from the 2nd time.",
      "pol.sur1": "<b>Children under 6:</b> No surcharge.",
      "pol.sur2": "<b>Children 6–12:</b> 50k / child / night.",
      "pol.sur3": "<b>From the 3rd adult:</b> 100k / adult / night.",
      "pol.surFine": "** Note: For more than 2 guests without declaration, once discovered the home will charge 300k/guest.",

      "contact.kicker": "Booking &amp; contact",
      "contact.title": "Ready to <em>come home</em>?",
      "contact.lead": "Message us to reserve or ask anything — Nostos is always here waiting for you.",
      "contact.addrLabel": "Address", "contact.phoneLabel": "Phone / Zalo",
      "contact.timeLabel": "Check-in / out", "contact.timeVal": "Full day 14:00–12:00 · Overnight 22:00–10:00",
      "contact.call": "Call to book", "contact.zalo": "Message on Zalo",

      "footer.tag": "A place to return.",

      "dyn.roomPrice": "Room price", "dyn.weekend": "Weekend surcharge", "dyn.holiday": "Holiday surcharge",
      "dyn.guest3": "3rd guest",
      "dyn.pkg.c3": "3-hour combo", "dyn.pkg.c6": "6-hour combo", "dyn.pkg.night": "Overnight", "dyn.pkg.day": "Full day"
    }
  };

  var lang = localStorage.getItem("nostos-lang") || "vi";
  function t(key) { return (I18N[lang] && I18N[lang][key] != null) ? I18N[lang][key] : key; }

  function applyLang(next) {
    lang = next;
    document.documentElement.lang = next;
    localStorage.setItem("nostos-lang", next);
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      if (I18N[next][k] != null) el.innerHTML = I18N[next][k];
    });
    // toggle button state
    document.querySelectorAll(".lang-switch button").forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-lang") === next);
    });
    // refresh dynamic UI
    if (typeof updateEstimate === "function") updateEstimate(false);
    if (typeof refreshLightboxCaption === "function") refreshLightboxCaption();
  }

  /* ---- Year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Sticky nav + back to top ---- */
  var nav = document.getElementById("nav");
  var toTop = document.getElementById("toTop");
  function onScroll() {
    var y = window.scrollY;
    if (nav) nav.classList.toggle("is-scrolled", y > 20);
    if (toTop) toTop.classList.toggle("is-visible", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

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
    links.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
  }

  /* ---- Language switch ---- */
  document.querySelectorAll(".lang-switch button").forEach(function (b) {
    b.addEventListener("click", function () { applyLang(b.getAttribute("data-lang")); });
  });

  /* ---- Policy tabs ---- */
  var pTabs = document.querySelectorAll(".policy-tab");
  var pPanels = document.querySelectorAll(".policy-panel");
  pTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var name = tab.getAttribute("data-tab");
      pTabs.forEach(function (t2) {
        var on = t2 === tab;
        t2.classList.toggle("is-active", on);
        t2.setAttribute("aria-selected", String(on));
      });
      pPanels.forEach(function (p) {
        var show = p.getAttribute("data-panel") === name;
        p.classList.toggle("is-active", show);
        p.hidden = !show;
      });
    });
  });

  /* ---- Price estimator ---- */
  var PRICES = {
    citrus: { c3: 400, c6: 550, night: 650, day: 900 },
    pastel: { c3: 400, c6: 550, night: 650, day: 900 },
    maroon: { c3: 420, c6: 570, night: 680, day: 950 }
  };
  var DAY_SURCHARGE = { weekday: 0, weekend: 50, holiday: 100 };

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
    var room = roomSel.value, pkg = pkgSel.value, day = daySel.value, guest = parseInt(guestSel.value, 10);
    var base = PRICES[room][pkg];
    var daySur = DAY_SURCHARGE[day];
    var guestSur = guest >= 3 ? 100 : 0;
    var total = base + daySur + guestSur;

    var rows = [[t("dyn.roomPrice") + " · " + t("dyn.pkg." + pkg), base]];
    if (daySur) rows.push([day === "weekend" ? t("dyn.weekend") : t("dyn.holiday"), daySur]);
    if (guestSur) rows.push([t("dyn.guest3"), guestSur]);

    if (breakdown) {
      breakdown.innerHTML = rows.map(function (r) {
        return "<li><span>" + r[0] + "</span><b>" + fmt(r[1]) + "k</b></li>";
      }).join("");
    }
    priceOut.textContent = fmt(total);
    if (animate && priceWrap) {
      priceWrap.classList.remove("bump");
      void priceWrap.offsetWidth;
      priceWrap.classList.add("bump");
    }
  }
  [roomSel, pkgSel, daySel, guestSel].forEach(function (el) {
    if (el) el.addEventListener("change", function () { updateEstimate(true); });
  });

  /* ---- Showroom / gallery ---- */
  var GALLERY = {
    pastel: {
      label: "Pastel Beaver", dir: "assets/rooms/pastel-beaver/", grid: "gridPastel",
      photos: [
        ["01-phong-tong-the.jpg", "Không gian tổng thể", "Overview"],
        ["02-giuong-sofa.jpg", "Góc giường & sofa", "Bed & sofa nook"],
        ["03-giuong-1.jpg", "Giường nệm êm ái", "Cozy bed"],
        ["04-giuong-2.jpg", "Giường & đèn quả lê", "Bed & pear lamp"],
        ["05-giuong-3.jpg", "Góc nghỉ ngơi", "Resting corner"],
        ["06-goi-den.jpg", "Gối & đèn ngủ", "Pillows & night lamp"],
        ["07-bep-1.jpg", "Khu vực bếp", "Kitchen area"],
        ["08-bep-2.jpg", "Bếp & tủ lạnh", "Kitchen & fridge"],
        ["09-sofa-hoa-cuc.jpg", "Sofa gối hoa cúc", "Daisy-cushion sofa"],
        ["10-tranh-tuong.jpg", "Tranh tường California", "California gallery wall"],
        ["11-goc-cay.jpg", "Góc cây xanh", "Green corner"],
        ["12-tivi.jpg", "Tivi & giải trí", "TV & entertainment"]
      ]
    },
    maroon: {
      label: "Maroon Apple", dir: "assets/rooms/maroon/", grid: "gridMaroon",
      photos: [
        ["01-giuong-hong.jpg", "Giường tông hồng", "Pink-toned bed"],
        ["02-goi-hong.jpg", "Gối hồng ấm áp", "Warm pink pillows"],
        ["03-den-nam-tulip.jpg", "Đèn nấm & hoa tulip", "Mushroom lamp & tulips"],
        ["04-giuong-cua-so.jpg", "Giường bên cửa sổ", "Bed by the window"],
        ["05-sofa-tranh.jpg", "Sofa & tranh phong cảnh", "Sofa & scenic art"],
        ["06-bep-1.jpg", "Khu vực bếp", "Kitchen area"],
        ["07-bep-2.jpg", "Bếp & bếp từ", "Kitchen & induction hob"],
        ["08-cua-so-ke.jpg", "Góc cửa sổ & kệ", "Window & shelf corner"]
      ]
    }
  };
  function caption(p) { return lang === "en" ? p[2] : p[1]; }

  var FEATURE = { 0: "gallery__item--wide gallery__item--tall", 5: "gallery__item--wide" };

  function buildGrid(roomKey) {
    var room = GALLERY[roomKey];
    var grid = document.getElementById(room.grid);
    if (!grid || grid.childElementCount) return;
    room.photos.forEach(function (p, i) {
      var fig = document.createElement("button");
      fig.className = "gallery__item" + (FEATURE[i] ? " " + FEATURE[i] : "");
      fig.setAttribute("data-room", roomKey);
      fig.setAttribute("data-index", i);
      fig.setAttribute("aria-label", caption(p));
      var img = document.createElement("img");
      img.src = room.dir + p[0];
      img.alt = room.label + " — " + caption(p);
      img.loading = "lazy";
      fig.appendChild(img);
      fig.addEventListener("click", function () { openLightbox(roomKey, i); });
      grid.appendChild(fig);
    });
  }
  buildGrid("pastel");
  buildGrid("maroon");

  // Showroom room tabs
  var gTabs = document.querySelectorAll(".gallery-tab");
  var gGroups = document.querySelectorAll(".gallery__group");
  function activateRoom(room) {
    gTabs.forEach(function (t2) {
      var on = t2.getAttribute("data-room") === room;
      t2.classList.toggle("is-active", on);
      t2.setAttribute("aria-selected", String(on));
    });
    gGroups.forEach(function (g) {
      var show = g.getAttribute("data-room") === room;
      g.classList.toggle("is-active", show);
      g.hidden = !show;
    });
  }
  gTabs.forEach(function (tab) {
    tab.addEventListener("click", function () { activateRoom(tab.getAttribute("data-room")); });
  });
  document.querySelectorAll('a[href="#showroom-maroon"]').forEach(function (a) {
    a.addEventListener("click", function () { activateRoom("maroon"); });
  });
  document.querySelectorAll('a[href="#showroom-pastel"]').forEach(function (a) {
    a.addEventListener("click", function () { activateRoom("pastel"); });
  });

  /* ---- Lightbox ---- */
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbCap = document.getElementById("lbCaption");
  var current = { room: "pastel", index: 0 };

  function refreshLightboxCaption() {
    if (!lb || !lb.classList.contains("is-open")) return;
    var data = GALLERY[current.room];
    if (!data) return;
    var p = data.photos[current.index];
    lbImg.alt = data.label + " — " + caption(p);
    lbCap.textContent = data.label + " · " + caption(p) + " (" + (current.index + 1) + "/" + data.photos.length + ")";
  }
  function showLightbox(room, index) {
    var data = GALLERY[room];
    var n = data.photos.length;
    index = (index + n) % n;
    current.room = room; current.index = index;
    var p = data.photos[index];
    lbImg.src = data.dir + p[0];
    lbImg.alt = data.label + " — " + caption(p);
    lbCap.textContent = data.label + " · " + caption(p) + " (" + (index + 1) + "/" + n + ")";
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
  var lbClose = document.getElementById("lbClose");
  var lbPrev = document.getElementById("lbPrev");
  var lbNext = document.getElementById("lbNext");
  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  if (lbPrev) lbPrev.addEventListener("click", function () { showLightbox(current.room, current.index - 1); });
  if (lbNext) lbNext.addEventListener("click", function () { showLightbox(current.room, current.index + 1); });
  if (lb) lb.addEventListener("click", function (e) { if (e.target === lb) closeLightbox(); });
  document.addEventListener("keydown", function (e) {
    if (!lb || !lb.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") showLightbox(current.room, current.index - 1);
    else if (e.key === "ArrowRight") showLightbox(current.room, current.index + 1);
  });

  /* ---- Boot ---- */
  applyLang(lang);
})();
