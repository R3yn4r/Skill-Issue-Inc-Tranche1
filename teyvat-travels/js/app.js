/**
 * app.js — Teyvat Travels single-page routing, auth, data, and admin rendering.
 *
 * NOTE: No credentials are required — the sign-in form accepts any input.
 * This is a front-end demo only; there is no real authentication here.
 */
(function () {
  "use strict";

  /* =========================================================
     1. STORAGE KEYS
     ========================================================= */
  var SESSION_KEY  = "tt_admin_session";
  var PACKAGES_KEY = "tt_packages_v2";

  /* =========================================================
     3. DEFAULT PACKAGES DATA
     Mirrors the 7 cards that are hard-coded in index.html.
     The public slider is re-rendered from this array on every load.
     ========================================================= */
  var DEFAULT_PACKAGES = [
    {
      id: "pkg-1",
      packageCode: "MOND-01",
      nation: "Mondstadt",
      badge: "Most popular",
      title: "The City of Freedom Expedition",
      price: 12500,
      description: "Experience the romantic charm of windmills, rolling green hills, and historic stone architecture. Perfect for travelers looking for a relaxing nature getaway.",
      highlights: ["Cider Lake", "Windrise", "the grand Cathedral of Mondstadt"],
      duration: "3 Days / 2 Nights",
      durationDays: 3,
      durationNights: 2,
      maxGroup: 12,
      startingPrice: "From ₱12,500 per person",
      image: "assets/img/mondstadt.webp",
      imageAlt: "The green highlands and clear blue skies of Mondstadt",
      accent: "#82d7bd",
      nationLink: "mondstadt.html",
      status: "Active"
    },
    {
      id: "pkg-2",
      packageCode: "LIYU-02",
      nation: "Liyue",
      badge: "Harbor & heritage",
      title: "The Harbor of Stone and Commerce",
      price: 15000,
      description: "A bustling port city tour blending breathtaking mountain ranges, ancient folklore, and world-class culinary adventures.",
      highlights: ["Liyue Harbor", "Mt. Aocang", "Wangshu Inn"],
      duration: "4 Days / 3 Nights",
      durationDays: 4,
      durationNights: 3,
      maxGroup: 12,
      startingPrice: "From ₱15,000 per person",
      image: "assets/img/liyue.jpeg",
      imageAlt: "Warm sunset over the rocky peaks and valleys of Liyue",
      accent: "#e7bd69",
      nationLink: "liyue.html",
      status: "Active"
    },
    {
      id: "pkg-3",
      packageCode: "INAZ-03",
      nation: "Inazuma",
      badge: "Island escape",
      title: "The Realm of Eternal Thunder",
      price: 18000,
      description: "Discover a culturally rich archipelago featuring striking purple foliage, traditional shrines, and serene coastal views.",
      highlights: ["Narukami Island Grand Shrine", "Ritou Trading Port", "Tenshukaku"],
      duration: "4 Days / 3 Nights",
      durationDays: 4,
      durationNights: 3,
      maxGroup: 12,
      startingPrice: "From ₱18,000 per person",
      image: "assets/img/inazuma.webp",
      imageAlt: "Inazuma's island architecture framed by glowing cherry blossoms",
      accent: "#c59bed",
      nationLink: "inazuma.html",
      status: "Active"
    },
    {
      id: "pkg-4",
      packageCode: "SUME-04",
      nation: "Sumeru",
      badge: "Rainforest retreat",
      title: "The City of Wisdom & Rainforest Retreat",
      price: 14000,
      description: "A dual-environment journey taking you from the majestic halls of learning to the dense, mystical canopies of the rainforest.",
      highlights: ["Sumeru City Academy", "Gandharva Ville", "Caravan Ribat"],
      duration: "3 Days / 3 Nights",
      durationDays: 3,
      durationNights: 3,
      maxGroup: 12,
      startingPrice: "From ₱14,000 per person",
      image: "assets/img/sumeru.webp",
      imageAlt: "A great tree rises above Sumeru's green hills and waterfalls",
      accent: "#a6d46c",
      nationLink: "sumeru.html",
      status: "Active"
    },
    {
      id: "pkg-5",
      packageCode: "FONT-05",
      nation: "Fontaine",
      badge: "Arts & innovation",
      title: "The Capital of Justice, Steam, and Aquanics",
      price: 20000,
      description: "Step into a picturesque hub of art, fashion, and advanced clockwork engineering surrounded by pristine waters.",
      highlights: ["Court of Fontaine", "Opera Epiclese", "Lucine Fountain"],
      duration: "5 Days / 4 Nights",
      durationDays: 5,
      durationNights: 4,
      maxGroup: 12,
      startingPrice: "From ₱20,000 per person",
      image: "assets/img/fontaine.webp",
      imageAlt: "The luminous towers and blue waters of Fontaine",
      accent: "#7ed9e7",
      nationLink: "fontaine.html",
      status: "Active"
    },
    {
      id: "pkg-6",
      packageCode: "NATL-06",
      nation: "Natlan",
      badge: "Volcanic adventure",
      title: "The Land of Ash, Hot Springs, and Valor",
      price: 16500,
      description: "An energetic adventure featuring dramatic volcanic landscapes, therapeutic thermal springs, and vibrant tribal festivals.",
      highlights: ["Tepecac Stadium", "Children of the Echoes Canyon", "People of the Springs basin"],
      duration: "4 Days / 3 Nights",
      durationDays: 4,
      durationNights: 3,
      maxGroup: 12,
      startingPrice: "From ₱16,500 per person",
      image: "assets/img/natlan.webp",
      imageAlt: "Natlan's sunlit volcanic plains and distant mesas",
      accent: "#ff936d",
      nationLink: "natlan.html",
      status: "Active"
    },
    {
      id: "pkg-7",
      packageCode: "SNEZ-07",
      nation: "Snezhnaya",
      badge: "Winter expedition",
      title: "The Eternal White Tundra",
      price: 22000,
      description: "A majestic winter expedition exploring frosted architectural marvels, grand palaces, and cozy alpine chalets under the aurora.",
      highlights: ["Zapolyarny Palace outskirts", "Frost-bound Valleys", "Glacial Outposts"],
      duration: "5 Days / 4 Nights",
      durationDays: 5,
      durationNights: 4,
      maxGroup: 12,
      startingPrice: "From ₱22,000 per person",
      image: "assets/img/snezhnaya.webp",
      imageAlt: "A frozen Snezhnaya skyline beneath a deep blue, starry sky",
      accent: "#a6ddf3",
      nationLink: "snezhnaya.html",
      status: "Active"
    }
  ];

  /* =========================================================
     4. DATA HELPERS
     ========================================================= */

  /**
   * Returns the packages array from localStorage.
   * Falls back to DEFAULT_PACKAGES on first visit or if storage is corrupt.
   * Also restores any default packages that are missing from the stored list
   * (e.g. if localStorage was saved before all 7 packages were added).
   */
  function getPackages() {
    try {
      var raw = localStorage.getItem(PACKAGES_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Merge back any default packages not present in the stored list.
          var storedIds = parsed.map(function (p) { return p.id; });
          var missing = DEFAULT_PACKAGES.filter(function (p) {
            return storedIds.indexOf(p.id) < 0;
          });
          var list = missing.length ? parsed.concat(missing) : parsed;

          // Backfill packageCode for any package that doesn't have one yet
          var needsSave = missing.length > 0;
          list.forEach(function (p) {
            if (!p.packageCode) {
              var def = DEFAULT_PACKAGES.find(function (d) { return d.id === p.id; });
              if (def && def.packageCode) {
                p.packageCode = def.packageCode;
                needsSave = true;
              }
            }
          });

          if (needsSave) {
            savePackages(list);
          }
          return list;
        }
      }
    } catch (e) { /* ignore */ }
    savePackages(DEFAULT_PACKAGES);
    return DEFAULT_PACKAGES.slice();
  }

  /**
   * Persists the packages array to localStorage.
   * Called after every add, edit, or delete.
   */
  function savePackages(list) {
    try {
      localStorage.setItem(PACKAGES_KEY, JSON.stringify(list));
    } catch (e) { /* ignore */ }
  }

  /**
   * Resets localStorage to the original 7 packages.
   * Called by the "Reset to defaults" button on the admin packages list.
   */
  function resetPackages() {
    savePackages(DEFAULT_PACKAGES);
    return DEFAULT_PACKAGES.slice();
  }

  /**
   * Finds one package by id. Returns undefined if not found.
   */
  function findPackage(id) {
    return getPackages().find(function (p) { return p.id === id; });
  }

  /**
   * Saves (insert or update) a package object.
   * If a package with the same id exists it is replaced; otherwise appended.
   */
  function upsertPackage(pkg) {
    var list = getPackages();
    var idx = list.findIndex(function (p) { return p.id === pkg.id; });
    if (idx >= 0) {
      list[idx] = pkg;
    } else {
      list.push(pkg);
    }
    savePackages(list);
  }

  /**
   * Deletes a package by id.
   */
  function deletePackage(id) {
    var list = getPackages().filter(function (p) { return p.id !== id; });
    savePackages(list);
  }

  /**
   * Generates a unique id for a new package.
   */
  function generateId() {
    return "pkg-" + Date.now();
  }

  /* =========================================================
     5. AUTH HELPERS
     ========================================================= */

  /**
   * Returns true when a valid admin session flag is present in sessionStorage.
   */
  function isSignedIn() {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  }

  /**
   * Sets the session flag and updates the sign-in nav link to "Dashboard".
   */
  function signIn() {
    sessionStorage.setItem(SESSION_KEY, "1");
    updateAuthNavLink();
  }

  /**
   * Clears the session flag and updates the nav link back to "Sign in".
   */
  function signOut() {
    sessionStorage.removeItem(SESSION_KEY);
    updateAuthNavLink();
  }

  /**
   * Updates the public header's auth link text and href based on session state.
   * Shows "Dashboard" when signed in, "Sign in" when not.
   * Visible in the public site header (desktop and mobile).
   */
  function updateAuthNavLink() {
    var link = document.getElementById("nav-auth-link");
    if (!link) { return; }
    if (isSignedIn()) {
      link.textContent = "Dashboard";
      link.href = "#/dashboard";
    } else {
      link.textContent = "Sign in";
      link.href = "#/signin";
    }
  }

  /* =========================================================
     6. ROUTER
     ========================================================= */

  /**
   * Returns the current route object { path, params } based on window.location.hash.
   * Only hashes starting with "#/" are treated as SPA routes.
   * Everything else (e.g. #nations, #faq) is treated as a public anchor.
   */
  function parseRoute() {
    var hash = window.location.hash;
    if (!hash || hash === "#" || hash.indexOf("#/") !== 0) {
      return { path: "/", params: {} };
    }
    var withoutHash = hash.slice(2); // remove "#/"
    var parts = withoutHash.split("/");
    return {
      path: "/" + (parts[0] || ""),
      id: parts[1] || null
    };
  }

  /**
   * Navigates to a hash route and fires the router.
   */
  function navigate(hash) {
    window.location.hash = hash;
  }

  /**
   * All managed view ids, in the order they should be checked.
   */
  var VIEW_IDS = [
    "view-public",
    "view-signin",
    "view-dashboard",
    "view-admin-packages",
    "view-admin-availability",
    "view-admin-bookings",
    "view-admin-inquiries",
    "view-admin-payments",
    "view-admin-package-edit"
  ];

  /**
   * Hides all admin views and restores the public layout elements.
   * Called when routing to the public ("/") view.
   * Affects: public header, hero section, all hx-section and footer elements.
   */
  function showPublicView() {
    // Hide all admin views (view-public is a no-op span, always invisible)
    VIEW_IDS.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el || id === "view-public") { return; }
      el.hidden = true;
    });

    // Show public header + main content, hide admin shell
    setPublicVisible(true);
    document.title = "Skill Issue Inc. | Teyvat Travels";
    window.scrollTo(0, 0);

    // Focus the hero title for screen reader UX on view changes
    var heroTitle = document.getElementById("hero-title");
    if (heroTitle) {
      heroTitle.setAttribute("tabindex", "-1");
      heroTitle.focus({ preventScroll: true });
    }

    renderPublicSlider();
  }

  /**
   * Shows/hides the public site chrome (header, main content, footer).
   * When an admin view is active, the public chrome is hidden.
   */
  function setPublicVisible(visible) {
    var publicShell = document.getElementById("public-shell");
    if (publicShell) {
      publicShell.hidden = !visible;
    }
  }

  /**
   * Shows a named admin view, hides all others including the public shell.
   * Applies the sign-in, dashboard, package, availability, and booking views.
   */
  function showAdminView(viewId, title) {
    VIEW_IDS.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) { return; }
      el.hidden = id !== viewId;
    });
    setPublicVisible(false);
    document.title = (title || "Admin") + " | Teyvat Travels";
    focusViewHeading(viewId);
  }

  /**
   * Moves keyboard focus to the first heading (h1) inside a view.
   * Sets tabindex="-1" temporarily so it is programmatically focusable.
   * Improves screen reader UX on view changes.
   */
  function focusViewHeading(viewId) {
    var view = document.getElementById(viewId);
    if (!view) { return; }
    window.scrollTo(0, 0);
    var h = view.querySelector("h1, h2");
    if (!h) { return; }
    h.setAttribute("tabindex", "-1");
    h.focus({ preventScroll: true });
  }

  /**
   * Main router: reads the current hash, checks auth guards,
   * then activates the matching view and renders its content.
   * Listens to hashchange so the browser Back/Forward buttons work.
   * Refreshing keeps the user on the same view because the hash is in the URL.
   */
  function route() {
    var r = parseRoute();

    // Unauthenticated users trying to reach a protected route → sign-in page
    var protected_ = [
      "/dashboard",
      "/admin-packages",
      "/admin-package-edit",
      "/admin-availability",
      "/admin-bookings",
      "/admin-inquiries",
      "/admin-payments"
    ];
    if (protected_.indexOf(r.path) >= 0 && !isSignedIn()) {
      navigate("#/signin");
      return;
    }

    // Already signed in and hitting the sign-in page → dashboard
    if (r.path === "/signin" && isSignedIn()) {
      navigate("#/dashboard");
      return;
    }

    switch (r.path) {
      case "/signin":
        showAdminView("view-signin", "Sign in");
        renderSignIn();
        break;
      case "/dashboard":
        showAdminView("view-dashboard", "Dashboard");
        renderDashboard();
        break;
      case "/admin-packages":
        showAdminView("view-admin-packages", "Tour packages");
        renderAdminPackages();
        break;
      case "/admin-availability":
        showAdminView("view-admin-availability", "Availability");
        window.TTAdminAvailability.render(getPackages());
        break;
      case "/admin-bookings":
        showAdminView("view-admin-bookings", "Bookings");
        window.TTAdminBookings.render(getPackages());
        break;
      case "/admin-inquiries":
        showAdminView("view-admin-inquiries", "Inquiries");
        window.TTAdminInquiries.render(getPackages());
        break;
      case "/admin-payments":
        showAdminView("view-admin-payments", "Payments");
        window.TTAdminPayments.render(getPackages());
        break;
      case "/admin-package-edit":
        showAdminView("view-admin-package-edit", "Edit package");
        renderPackageEditForm(r.id);
        break;
      default:
        // Unknown routes and "/" both go to the public view.
        // Plain anchors (#nations, #faq, etc.) never reach here because
        // parseRoute() returns path "/" for anything not starting with "#/".
        showPublicView();
        break;
    }

    updateAuthNavLink();
    updateAdminNav(r.path);
  }

  /* =========================================================
     7. ADMIN NAV ACTIVE STATE
     ========================================================= */

  /**
   * Marks the matching admin sidebar navigation link as aria-current="page".
   * Updates links inside all admin views (they share the same sidebar markup).
   */
  function updateAdminNav(path) {
    var navLinks = document.querySelectorAll(".admin-nav__link");
    for (var i = 0; i < navLinks.length; i++) {
      var link = navLinks[i];
      var href = link.getAttribute("href") || "";
      var isActive = false;
      if (path === "/dashboard" && href.indexOf("dashboard") >= 0) { isActive = true; }
      if ((path === "/admin-packages" || path === "/admin-package-edit") && href.indexOf("admin-packages") >= 0) { isActive = true; }
      if (path === "/admin-availability" && href.indexOf("admin-availability") >= 0) { isActive = true; }
      if (path === "/admin-bookings" && href.indexOf("admin-bookings") >= 0) { isActive = true; }
      if (path === "/admin-inquiries" && href.indexOf("admin-inquiries") >= 0) { isActive = true; }
      if (path === "/admin-payments" && href.indexOf("admin-payments") >= 0) { isActive = true; }
      link.setAttribute("aria-current", isActive ? "page" : "false");
    }
  }

  /* =========================================================
     8. PUBLIC SLIDER RENDERING
     ========================================================= */

  /**
   * Returns a safe href for a nationLink value.
   * Allows relative .html paths, "#" anchors, and "/" paths.
   * Blocks "javascript:" and any other scheme by falling back to "#".
   */
  function safeLink(value) {
    var v = String(value || "").trim();
    // Allow: relative path (no scheme), starts with "#" or "/"
    if (/^(#|\/|[a-zA-Z0-9_./-])/i.test(v) && !/^[a-zA-Z][a-zA-Z0-9+.-]*:/i.test(v)) {
      return v;
    }
    return "#";
  }

  /**
   * Rebuilds the public package carousel track from the packages array in localStorage.
   * Shows only Active packages.
   * Replaces the static slide HTML so admin edits are immediately reflected.
   * After rendering, calls window.TT_initSlider() (exposed by packages-slider.js)
   * so the slider recalculates dot positions and maximum offsets.
   * Visible on the public home page, in the "Choose your kind of expedition" section.
   */
  function renderPublicSlider() {
    var track = document.querySelector(".home-page .pk-carousel__track");
    var dotsWrapper = document.querySelector(".home-page .pk-carousel__dots");
    if (!track || !dotsWrapper) { return; }

    // Only show Active packages on the public site
    var packages = getPackages().filter(function (p) {
      return (p.status || "Active") === "Active";
    });
    var total = packages.length;
    if (!total) { return; }

    // Build slides
    var slidesHtml = "";
    for (var i = 0; i < total; i++) {
      var p = packages[i];
      var num = String(i + 1).padStart(2, "0");
      var featuredClass = i === 0 ? " pk-card--featured" : "";
      var pHighlights  = Array.isArray(p.highlights) ? p.highlights : [];
      var pTitle       = p.title        || "";
      var pDescription = p.description  || "";
      var pAccent      = p.accent       || "#82d7bd";
      var pImage       = p.image        || "";
      var pNationLink  = safeLink(p.nationLink || "#");
      var pStartPrice  = p.startingPrice || "";
      var pDuration    = p.duration      || "";
      var pBadge       = p.badge         || "";
      var pNation      = p.nation        || "";
      var pImageAlt    = p.imageAlt      || (pNation + " landscape");
      var stopsHtml = pHighlights.map(function (h) {
        return "<li>" + escHtml(h) + "</li>";
      }).join("");
      slidesHtml +=
        '<div class="pk-carousel__slide' + (i === 0 ? " is-active" : "") + '"' +
        ' role="group" aria-roledescription="slide" aria-label="' + (i + 1) + ' of ' + total + '"' +
        ' data-slide-index="' + i + '">' +
        '<article class="pk-card' + featuredClass + '" style="--accent: ' + escHtml(pAccent) + ';">' +
          '<div class="pk-card__visual">' +
            '<a class="pk-card__image-link" href="' + escHtml(pNationLink) + '">' +
              '<img class="pk-card__image" src="' + escHtml(pImage) + '" alt="' + escHtml(pImageAlt) + '" loading="lazy" width="1600" height="900">' +
            '</a>' +
            '<span class="pk-card__shade" aria-hidden="true"></span>' +
            '<span class="pk-card__index" aria-hidden="true">' + num + '</span>' +
            '<span class="pk-card__badge">' + escHtml(pBadge) + '</span>' +
            '<div class="pk-card__overlay">' +
              '<a class="pk-region" href="' + escHtml(pNationLink) + '">' + escHtml(pNation) + '</a>' +
              '<h3 class="pk-title">' + escHtml(pTitle) + '</h3>' +
              '<p class="pk-card__price">' + escHtml(pStartPrice) + '</p>' +
            '</div>' +
          '</div>' +
          '<div class="pk-card__body">' +
            '<p class="pk-description">' + escHtml(pDescription) + '</p>' +
            '<ul class="pk-stops" aria-label="Featured stops">' + stopsHtml + '</ul>' +
            '<div class="pk-meta">' +
              '<div class="pk-stat"><p class="pk-stat-label">Duration</p><p class="pk-stat-value">' + escHtml(pDuration) + '</p></div>' +
              '<div class="pk-stat"><p class="pk-stat-label">Starting price</p><p class="pk-stat-value">' + escHtml(pStartPrice) + '</p></div>' +
            '</div>' +
            '<div class="pk-card__actions">' +
              '<a class="pk-link" href="' + escHtml(pNationLink) + '">View details <span aria-hidden="true">&#8594;</span></a>' +
            '</div>' +
          '</div>' +
        '</article>' +
        '</div>';
    }
    track.innerHTML = slidesHtml;

    // Build dots
    var dotsHtml = "";
    for (var d = 0; d < total; d++) {
      dotsHtml +=
        '<button class="pk-carousel__dot" type="button"' +
        ' aria-label="Go to slide ' + (d + 1) + '"' +
        ' aria-current="' + (d === 0 ? "true" : "false") + '"' +
        ' data-slide-to="' + d + '"></button>';
    }
    dotsWrapper.innerHTML = dotsHtml;

    // Re-run slider setup now that the DOM is rebuilt
    if (typeof window.TT_initSlider === "function") {
      window.TT_initSlider();
    }
  }

  /* =========================================================
     9. SIGN-IN VIEW RENDERING & LOGIC
     ========================================================= */

  /**
   * Wires up the sign-in form in view-signin.
   * On submit: validates email + password against the constants at the top of this file.
   * On success: sets session flag and navigates to #/dashboard.
   * On failure: shows an inline error message (no alert()).
   * Visible in the Sign In view (#/signin).
   */
  function renderSignIn() {
    var form = document.getElementById("admin-si-form");
    var statusEl = document.getElementById("admin-si-status");
    var revealBtn = document.getElementById("admin-si-reveal");
    var passwordInput = document.getElementById("admin-si-password");
    var capsHint = document.getElementById("admin-si-caps");

    if (!form) { return; }

    // Remove any old listener by cloning the form node
    var newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    form = newForm;

    // Re-query after clone
    statusEl = document.getElementById("admin-si-status");
    revealBtn = document.getElementById("admin-si-reveal");
    passwordInput = document.getElementById("admin-si-password");
    capsHint = document.getElementById("admin-si-caps");

    // Show/hide password toggle
    if (revealBtn && passwordInput) {
      revealBtn.addEventListener("click", function () {
        var showing = passwordInput.type === "text";
        passwordInput.type = showing ? "password" : "text";
        revealBtn.setAttribute("aria-pressed", String(!showing));
        revealBtn.setAttribute("aria-label", showing ? "Show password" : "Hide password");
      });
    }

    // Caps Lock hint
    if (passwordInput && capsHint) {
      passwordInput.addEventListener("keyup", function (e) {
        capsHint.hidden = !e.getModifierState("CapsLock");
      });
    }

    // Form submit — no credential check, any input proceeds
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      showStatus("", false);
      signIn();
      navigate("#/dashboard");
    });

    function showStatus(msg, isError) {
      if (!statusEl) { return; }
      statusEl.textContent = msg;
      statusEl.hidden = !msg;
      if (isError) {
        statusEl.setAttribute("role", "alert");
        statusEl.classList.add("is-error");
      } else {
        statusEl.removeAttribute("role");
        statusEl.classList.remove("is-error");
      }
    }
  }

  /* =========================================================
     10. DASHBOARD RENDERING
     ========================================================= */

  /**
   * Populates the admin dashboard overview with live counts from TTAdminBookingsData:
   *  - stat cards: pending, confirmed, recorded payments, packages count
   *  - attention sidebar counts
   *  - recent bookings table (newest 5)
   *  - today's date in the top bar
   * Visible in the Dashboard view (#/dashboard).
   */
  function renderDashboard() {
    var packages = getPackages();

    // Packages stat count
    var pkgCountEl = document.getElementById("ov-pkg-count");
    if (pkgCountEl) {
      pkgCountEl.textContent = packages.length;
    }

    // Today date
    var todayEl = document.getElementById("ov-today");
    if (todayEl) {
      todayEl.textContent = new Date().toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
      });
    }

    // Live booking stats from TTAdminBookingsData (guard: may not be loaded yet)
    if (!window.TTAdminBookingsData) { return; }
    var bookings;
    try {
      bookings = window.TTAdminBookingsData.getBookings();
    } catch (e) { return; }

    var pending = 0;
    var confirmed = 0;
    var paidTotal = 0;
    var paidCount = 0;
    bookings.forEach(function (booking) {
      if (booking.bookingStatus === "Pending")   { pending += 1; }
      if (booking.bookingStatus === "Confirmed") {
        confirmed += 1;
      }
      if ((booking.bookingStatus === "Confirmed" || booking.bookingStatus === "Completed") &&
          booking.paymentStatus === "Paid") {
        paidCount += 1;
        paidTotal += Number(booking.total) || 0;
      }
    });

    function setText(id, value) {
      var el = document.getElementById(id);
      if (el) { el.textContent = value; }
    }
    function formatPesoDash(amount) {
      return "₱" + Number(amount).toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }

    setText("ov-pending",   String(pending));
    setText("ov-confirmed", String(confirmed));
    setText("ov-payments", formatPesoDash(paidTotal));
    setText("ov-payments-note", "Across " + paidCount + " paid " + (paidCount === 1 ? "booking" : "bookings"));
    if (window.TTAdminInquiriesData) {
      try {
        var newInquiries = window.TTAdminInquiriesData.getInquiries().filter(function (inquiry) {
          return inquiry.status === "New";
        }).length;
        setText("ov-inquiries", String(newInquiries));
        setText("ov-attn-inquiries", String(newInquiries));
      } catch (error) {
        console.error("Inquiry summary could not be loaded.", error);
        setText("ov-inquiries", "—");
        setText("ov-attn-inquiries", "—");
      }
    }
    // Attention sidebar
    setText("ov-attn-pending",   String(pending));
    var awaitingPayment = bookings.filter(function (b) {
      return b.bookingStatus === "Confirmed" && b.paymentStatus === "Pending";
    }).length;
    setText("ov-attn-payment", String(awaitingPayment));

    // Recent bookings table
    var tbody = document.getElementById("ov-recent");
    if (tbody) {
      var recent = bookings.slice().sort(function (a, b) {
        return Date.parse(b.createdAt) - Date.parse(a.createdAt);
      }).slice(0, 5);
      tbody.textContent = "";
      recent.forEach(function (booking) {
        var pkg = packages.find(function (p) { return String(p.id) === String(booking.packageId); });
        var nation = pkg ? (pkg.nation || pkg.title || booking.packageId) : booking.packageId;
        var statusPillClass = booking.bookingStatus === "Pending" ? "ad-pill ad-pill--pending" :
                              booking.bookingStatus === "Rejected" ? "ad-pill ad-pill--bad" : "ad-pill";
        var row = document.createElement("tr");
        var isoDate = booking.travelDate || "";
        var parts   = isoDate.split("-").map(Number);
        var dateStr = isoDate
          ? new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString("en-GB", {
              day: "2-digit", month: "short", year: "numeric"
            })
          : "—";
        var clientTd = document.createElement("td");
        clientTd.className = "ad-td-main";
        var clientName = document.createElement("p");
        clientName.className = "ad-cell-strong";
        clientName.textContent = booking.client;
        var refCode = document.createElement("p");
        refCode.className = "ad-cell-sub";
        refCode.textContent = booking.reference;
        clientTd.appendChild(clientName);
        clientTd.appendChild(refCode);
        row.appendChild(clientTd);

        var nationTd = document.createElement("td");
        nationTd.textContent = nation;
        nationTd.dataset.label = "Nation";
        row.appendChild(nationTd);

        var dateTd = document.createElement("td");
        dateTd.textContent = dateStr;
        dateTd.className   = "ad-cell-small";
        dateTd.dataset.label = "Travel date";
        row.appendChild(dateTd);

        var statusTd = document.createElement("td");
        statusTd.dataset.label = "Status";
        var pill = document.createElement("span");
        pill.className = statusPillClass;
        pill.textContent = booking.bookingStatus;
        statusTd.appendChild(pill);
        row.appendChild(statusTd);

        tbody.appendChild(row);
      });
      var noteEl = document.getElementById("ov-recent-note");
      if (noteEl) {
        noteEl.textContent = "Showing " + recent.length + " of " + bookings.length +
          " booking" + (bookings.length !== 1 ? "s" : "");
      }
    }
  }

  /* =========================================================
     11. ADMIN PACKAGES LIST RENDERING
     ========================================================= */

  /** Nation prefix map — shared between package list and edit form */
  var EP_PREFIX = {
    "Mondstadt": "MOND", "Liyue": "LIYU", "Inazuma": "INAZ", "Sumeru": "SUME",
    "Fontaine": "FONT", "Natlan": "NATL", "Snezhnaya": "SNEZ"
  };

  /**
   * Renders the admin tour-packages table from the packages array.
   * Each row gets Edit and Delete buttons.
   * Also populates the nation filter <select>.
   * Wires up search/filter, Reset-to-default, and Add-package buttons.
   * Visible in the Admin Packages view (#/admin-packages).
   */
  function renderAdminPackages() {
    var packages = getPackages();
    var tbody = document.getElementById("admin-pk-body");
    var emptyEl = document.getElementById("admin-pk-empty");
    var countEl = document.getElementById("admin-pk-count");
    var footEl  = document.getElementById("admin-pk-foot");
    var searchInput = document.getElementById("admin-pk-search");
    var nationSel   = document.getElementById("admin-pk-nation");
    var statusSel   = document.getElementById("admin-pk-status");
    var successEl   = document.getElementById("admin-pkg-success");

    if (!tbody) { return; }

    // Show saved-success message if present
    var savedMsg = sessionStorage.getItem("tt_pkg_saved");
    if (savedMsg && successEl) {
      sessionStorage.removeItem("tt_pkg_saved");
      successEl.textContent = savedMsg;
      successEl.hidden = false;
      window.setTimeout(function () { successEl.hidden = true; }, 4000);
    }

    // Populate nation filter
    if (nationSel) {
      var nations = Array.from(new Set(packages.map(function (p) { return p.nation; }))).sort();
      nationSel.innerHTML = '<option value="all">All nations</option>' +
        nations.map(function (n) {
          return '<option value="' + escHtml(n) + '">' + escHtml(n) + '</option>';
        }).join("");
    }

    function getCurrentFilters() {
      return {
        search: searchInput ? searchInput.value.trim().toLowerCase() : "",
        nation: nationSel ? nationSel.value : "all",
        status: statusSel ? statusSel.value : "all"
      };
    }

    function applyFilters(all) {
      var f = getCurrentFilters();
      return all.filter(function (p) {
        if (f.nation !== "all" && p.nation !== f.nation) { return false; }
        if (f.status !== "all" && (p.status || "Active") !== f.status) { return false; }
        if (f.search) {
          var searchable = (p.title + " " + p.nation + " " + (p.id || "")).toLowerCase();
          if (searchable.indexOf(f.search) < 0) { return false; }
        }
        return true;
      });
    }

    function renderRows() {
      var allPackages = getPackages();
      var filtered = applyFilters(allPackages);
      tbody.innerHTML = "";

      if (!filtered.length) {
        if (emptyEl) { emptyEl.hidden = false; }
        if (countEl) { countEl.textContent = "0 packages"; }
        if (footEl)  { footEl.textContent = ""; }
        return;
      }

      if (emptyEl) { emptyEl.hidden = true; }
      var total = filtered.length;
      if (countEl) { countEl.textContent = total + " package" + (total !== 1 ? "s" : ""); }
      if (footEl)  { footEl.textContent = total + " of " + allPackages.length + " packages shown"; }

      filtered.forEach(function (p) {
        var packageNumber = allPackages.findIndex(function (pkg) { return pkg.id === p.id; }) + 1;
        var num = String(packageNumber).padStart(2, "0");
        var statusPillClass = (p.status === "Inactive")
          ? "admin-pill admin-pill--off"
          : "admin-pill";
        var tr = document.createElement("tr");
        if (p.status === "Inactive") { tr.className = "admin-pkg-row--inactive"; }
        var pkgCode = p.packageCode || (EP_PREFIX[p.nation] || "XXXX") + "-" + num;
        tr.innerHTML =
          '<td class="ad-td-main" data-label="Package">' +
            '<div class="ad-pkg">' +
              '<img class="ad-pkg__thumb" src="' + p.image + '" alt="" width="56" height="38">' +
              '<div>' +
                '<span class="ad-pkg__name">' + escHtml(p.title) + '</span>' +
                '<span class="ad-pkg__code">' + escHtml(pkgCode) + ' &middot; ' + escHtml(p.nation) + '</span>' +
              '</div>' +
            '</div>' +
          '</td>' +
          '<td data-label="Nation">' + escHtml(p.nation) + '</td>' +
          '<td data-label="Base price">₱' + Number(p.price).toLocaleString() + '</td>' +
          '<td data-label="Duration">' + escHtml(p.duration) + '</td>' +
          '<td data-label="Max group">' + escHtml(String(p.maxGroup || "—")) + '</td>' +
          '<td data-label="Status"><span class="' + statusPillClass + '">' + escHtml(p.status || "Active") + '</span></td>' +
          '<td data-label="Action">' +
            '<div class="admin-pk-actions">' +
              '<a class="ad-link admin-pkg-edit-btn" href="#/admin-package-edit/' + p.id + '">' +
                '<svg class="ad-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>' +
                '<span>Edit</span>' +
              '</a>' +
              '<button class="ad-link admin-pkg-delete-btn" type="button" data-pkg-id="' + p.id + '" style="background:none;border:none;cursor:pointer;color:var(--ad-danger);">' +
                '<svg class="ad-icon" viewBox="0 0 24 24" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>' +
                '<span>Delete</span>' +
              '</button>' +
            '</div>' +
          '</td>';
        tbody.appendChild(tr);
      });

      // Bind delete buttons
      tbody.querySelectorAll(".admin-pkg-delete-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.getAttribute("data-pkg-id");
          var pkg = findPackage(id);
          if (!pkg) { return; }
          if (!window.confirm('Delete "' + pkg.title + '"? This cannot be undone.')) { return; }
          deletePackage(id);
          renderRows();
        });
      });
    }

    renderRows();

    // Filters — use property assignment so each field fires renderRows exactly
    // once per event, even if renderAdminPackages() is called multiple times.
    if (searchInput) { searchInput.oninput  = renderRows; }
    if (nationSel)   { nationSel.onchange   = renderRows; }
    if (statusSel)   { statusSel.onchange   = renderRows; }

    // Reset to defaults
    var resetBtn = document.getElementById("admin-pk-reset");
    if (resetBtn) {
      resetBtn.onclick = function () {
        if (!window.confirm("Reset all packages to the original 7 defaults? This will discard any changes.")) { return; }
        resetPackages();
        renderRows();
        if (nationSel) {
          var nations2 = Array.from(new Set(getPackages().map(function (pp) { return pp.nation; }))).sort();
          nationSel.innerHTML = '<option value="all">All nations</option>' +
            nations2.map(function (n) {
              return '<option value="' + escHtml(n) + '">' + escHtml(n) + '</option>';
            }).join("");
        }
      };
    }
  }

  /* =========================================================
     12. PACKAGE EDIT FORM RENDERING & SAVING
     ========================================================= */

  /**
   * Pre-fills or clears the edit form for a package.
   * When id is null/"new", opens a blank form for a new package.
   * When id matches a stored package, pre-fills all fields.
   * Wires up Save and Cancel.
   * Validates required fields before saving.
   * On success: saves to localStorage, sets a session flash message,
   * and navigates back to #/admin-packages.
   * Visible in the Edit Package view (#/admin-package-edit/<id>).
   */
  function renderPackageEditForm(id) {
    var missingCard = document.getElementById("admin-ep-missing");
    var layout      = document.getElementById("admin-ep-layout");
    var titleEl     = document.getElementById("admin-ep-title");
    var crumbCode   = document.getElementById("admin-ep-crumb-code");
    var saveBtn     = document.getElementById("admin-ep-save");
    var cancelBtn   = document.getElementById("admin-ep-cancel");
    var actionsBar  = document.getElementById("admin-ep-actions");

    if (!layout || !titleEl) { return; }

    var isNew = (!id || id === "new");
    var pkg = isNew ? null : findPackage(id);

    if (!isNew && !pkg) {
      if (missingCard) { missingCard.hidden = false; }
      layout.hidden = true;
      if (actionsBar) { actionsBar.hidden = true; }
      titleEl.textContent = "Package not found";
      return;
    }

    if (missingCard) { missingCard.hidden = true; }
    layout.hidden = false;
    if (actionsBar) { actionsBar.hidden = false; }

    titleEl.textContent = isNew ? "Add tour package" : "Edit tour package";
    if (crumbCode) {
      crumbCode.textContent = isNew ? "NEW" : epGenerateCode(pkg);
    }

    // Populate nation <select>
    var nationSel = document.getElementById("admin-ep-nation");
    var NATIONS = ["Mondstadt", "Liyue", "Inazuma", "Sumeru", "Fontaine", "Natlan", "Snezhnaya"];
    if (nationSel) {
      nationSel.innerHTML = '<option value="">Select a nation</option>' +
        NATIONS.map(function (n) {
          var sel = pkg && pkg.nation === n ? " selected" : "";
          return '<option value="' + escHtml(n) + '"' + sel + '>' + escHtml(n) + '</option>';
        }).join("");
    }

    // Generate/fill the package code field
    var codeField = document.getElementById("admin-ep-code");
    if (codeField) {
      var existingCode = pkg ? (pkg.packageCode || epGenerateCode(pkg)) : "";
      codeField.value = existingCode;
      // Lock the code if the package already has bookings
      var hasBookings = pkg ? epHasBookings(pkg.id) : false;
      codeField.readOnly = !isNew && hasBookings;
      var codeHint = document.getElementById("admin-ep-code-hint");
      if (codeHint) {
        codeHint.textContent = hasBookings
          ? "Locked — this package already has bookings."
          : "Four-letter nation prefix and two digits, like MOND-01.";
      }
    }

    // Fill fields
    setVal("admin-ep-name",    pkg ? pkg.title : "");
    setVal("admin-ep-desc",    pkg ? pkg.description : "");
    setVal("admin-ep-stops",   pkg ? (pkg.highlights || []).join(", ") : "");
    setVal("admin-ep-days",    pkg ? String(pkg.durationDays || "") : "3");
    setVal("admin-ep-nights",  pkg ? String(pkg.durationNights || "") : "2");
    setVal("admin-ep-price",   pkg ? epFormatPrice(pkg.price) : "");
    setVal("admin-ep-max",     pkg ? String(pkg.maxGroup || "") : "");
    setVal("admin-ep-badge",   pkg ? (pkg.badge || "") : "");
    setVal("admin-ep-accent",  pkg ? (pkg.accent || "#82d7bd") : "#82d7bd");
    setVal("admin-ep-link",    pkg ? (pkg.nationLink || "") : "");
    setVal("admin-ep-image",   pkg ? (pkg.image || "") : "");

    // Status hidden field + publication card
    var currentStatus = pkg ? (pkg.status || "Active") : "Active";
    setVal("admin-ep-status", currentStatus);
    epRenderPublication(pkg, currentStatus);

    // Update accent swatch
    epUpdateSwatch();

    // Render available dates
    epRenderDates(pkg);

    // Live preview
    epUpdatePreview();

    // Clear errors
    var errorIds = [
      "admin-ep-nation-error", "admin-ep-code-error", "admin-ep-name-error",
      "admin-ep-desc-error", "admin-ep-stops-error", "admin-ep-days-error",
      "admin-ep-nights-error", "admin-ep-price-error", "admin-ep-max-error",
      "admin-ep-form-error"
    ];
    errorIds.forEach(function (eid) {
      var errEl = document.getElementById(eid);
      if (errEl) { errEl.textContent = ""; errEl.hidden = true; }
    });

    // Cancel button: go back without saving
    if (cancelBtn) {
      cancelBtn.onclick = function (e) {
        e.preventDefault();
        navigate("#/admin-packages");
      };
    }

    // Wire live preview on input changes
    var liveFields = ["admin-ep-nation", "admin-ep-name", "admin-ep-price",
                      "admin-ep-days", "admin-ep-nights", "admin-ep-max",
                      "admin-ep-stops", "admin-ep-image", "admin-ep-accent"];
    liveFields.forEach(function (fid) {
      var fEl = document.getElementById(fid);
      if (fEl) {
        fEl.oninput = function () {
          epUpdatePreview();
          if (fid === "admin-ep-accent") { epUpdateSwatch(); }
          // Auto-generate code from nation if code is empty and this is a new package
          if (fid === "admin-ep-nation" && isNew && codeField && !codeField.value.trim()) {
            codeField.value = epSuggestCode(fEl.value, getPackages(), null);
          }
        };
      }
    });

    // Format price on blur
    var priceEl = document.getElementById("admin-ep-price");
    if (priceEl) {
      priceEl.onblur = function () {
        var raw = priceEl.value.replace(/,/g, "");
        var num = parseFloat(raw);
        if (!isNaN(num) && num > 0) {
          priceEl.value = epFormatPrice(num);
        }
      };
    }

    // Also auto-generate code when nation changes (new pkg, code not yet touched)
    if (nationSel && isNew && codeField) {
      var codeManuallySet = false;
      codeField.addEventListener("input", function () { codeManuallySet = true; }, { once: false });
      nationSel.addEventListener("change", function () {
        if (!codeManuallySet && nationSel.value) {
          codeField.value = epSuggestCode(nationSel.value, getPackages(), null);
        }
        epUpdatePreview();
      });
    }

    // Publication card: toggle & delete
    var toggleBtn = document.getElementById("admin-ep-toggle");
    var deleteBtn = document.getElementById("admin-ep-delete");
    if (toggleBtn) {
      toggleBtn.onclick = function () {
        currentStatus = currentStatus === "Active" ? "Inactive" : "Active";
        setVal("admin-ep-status", currentStatus);
        epRenderPublication(pkg, currentStatus);
      };
    }
    if (deleteBtn) {
      deleteBtn.onclick = function () {
        if (!pkg) { return; }
        if (!window.confirm('Delete "' + (pkg.title || "this package") + '"? This cannot be undone.')) { return; }
        deletePackage(pkg.id);
        sessionStorage.setItem("tt_pkg_saved", "Package deleted.");
        navigate("#/admin-packages");
      };
    }

    // Save button (top of page) — clone to remove old listener
    if (saveBtn) {
      var newSave = saveBtn.cloneNode(true);
      saveBtn.parentNode.replaceChild(newSave, saveBtn);
      newSave.addEventListener("click", function () {
        handleSave(isNew, pkg, nationSel, function (saved) {
          pkg = saved;
          currentStatus = saved.status || "Active";
          epRenderPublication(saved, currentStatus);
          epRenderDates(saved);
          if (crumbCode) {
            crumbCode.textContent = saved.packageCode || epGenerateCode(saved);
          }
          isNew = false;
        });
      });
    }
  }

  /* ---------- Edit-form helpers ---------- */

  /** Formats a price number as "12,500.00" */
  function epFormatPrice(amount) {
    var num = Number(amount);
    if (isNaN(num) || num <= 0) { return ""; }
    return num.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /** Returns true if any bookings exist for the given pkg id */
  function epHasBookings(pkgId) {
    if (!window.TTAdminBookingsData) { return false; }
    try {
      return window.TTAdminBookingsData.getBookings().some(function (b) {
        return String(b.packageId) === String(pkgId);
      });
    } catch (e) { return false; }
  }

  /** Generates a code from the pkg object (uses pkg.packageCode or derives from nation+id) */
  function epGenerateCode(pkg) {
    if (pkg.packageCode) { return pkg.packageCode; }
    var prefix = EP_PREFIX[pkg.nation] || "XXXX";
    var num = String(pkg.id || "").replace(/\D/g, "").slice(-2).padStart(2, "0");
    if (!num || num === "00") {
      num = String(getPackages().findIndex(function (p) { return p.id === pkg.id; }) + 1).padStart(2, "0");
    }
    return prefix + "-" + num;
  }

  /** Suggests the next available code for a nation */
  function epSuggestCode(nation, packages, excludeId) {
    var prefix = EP_PREFIX[nation] || "XXXX";
    var codes = packages
      .filter(function (p) { return p.id !== excludeId; })
      .map(function (p) {
        var c = p.packageCode || "";
        return parseInt(c.split("-")[1], 10) || 0;
      });
    var highest = codes.reduce(function (m, v) { return Math.max(m, v); }, 0);
    return prefix + "-" + String(highest + 1).padStart(2, "0");
  }

  /** Checks if a code is unique (case-insensitive) among all packages except the current one */
  function epCodeUnique(code, currentId) {
    return !getPackages().some(function (p) {
      return String(p.packageCode || "").toUpperCase() === code.toUpperCase() &&
             p.id !== currentId;
    });
  }

  /** Updates the accent color swatch */
  function epUpdateSwatch() {
    var swatch = document.getElementById("admin-ep-swatch");
    var accentVal = getVal("admin-ep-accent").trim();
    if (swatch) {
      swatch.style.background = accentVal || "#82d7bd";
    }
  }

  /** Updates the live preview card */
  function epUpdatePreview() {
    var nation = getVal("admin-ep-nation");
    var name   = getVal("admin-ep-name").trim() || "Untitled package";
    var priceRaw = parseFloat(getVal("admin-ep-price").replace(/,/g, "")) || 0;
    var days   = parseInt(getVal("admin-ep-days"), 10);
    var nights = parseInt(getVal("admin-ep-nights"), 10);
    var max    = parseInt(getVal("admin-ep-max"), 10);
    var stopsRaw = getVal("admin-ep-stops");
    var imgSrc = getVal("admin-ep-image").trim();

    // Nation defaults for image
    var NATION_IMAGES = {
      "Mondstadt": "assets/img/mondstadt.webp", "Liyue": "assets/img/liyue.jpeg",
      "Inazuma": "assets/img/inazuma.webp", "Sumeru": "assets/img/sumeru.webp",
      "Fontaine": "assets/img/fontaine.webp", "Natlan": "assets/img/natlan.webp",
      "Snezhnaya": "assets/img/snezhnaya.webp"
    };
    var resolvedImg = imgSrc || (nation ? NATION_IMAGES[nation] : "");

    var imgEl = document.getElementById("admin-ep-img");
    var gradEl = document.getElementById("admin-ep-img-gradient");
    if (imgEl) {
      if (resolvedImg) {
        imgEl.src = resolvedImg;
        imgEl.alt = nation ? "Preview for " + nation : "";
        imgEl.hidden = false;
        if (gradEl) { gradEl.style.opacity = "0"; }
      } else {
        imgEl.hidden = true;
        if (gradEl) { gradEl.style.opacity = "1"; }
      }
    }

    var kickerEl = document.getElementById("admin-ep-kicker");
    if (kickerEl) {
      kickerEl.textContent = (nation || "—") + " \u2022 PUBLIC PREVIEW";
    }

    var ptitleEl = document.getElementById("admin-ep-ptitle");
    if (ptitleEl) { ptitleEl.textContent = name; }

    var ppriceEl = document.getElementById("admin-ep-pprice");
    if (ppriceEl) {
      ppriceEl.textContent = priceRaw > 0
        ? "\u20B1" + priceRaw.toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " / person"
        : "\u20B1\u2014 / person";
    }

    var pmetaEl = document.getElementById("admin-ep-pmeta");
    if (pmetaEl) {
      pmetaEl.textContent =
        (isNaN(days) ? "\u2013" : days) + " Days / " +
        (isNaN(nights) ? "\u2013" : nights) + " Nights \u00b7 Up to " +
        (isNaN(max) ? "\u2013" : max) + " guests";
    }

    var pstopsEl = document.getElementById("admin-ep-pstops");
    if (pstopsEl) {
      pstopsEl.textContent = "";
      var stops = stopsRaw.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
      stops.forEach(function (stop) {
        var li = document.createElement("li");
        li.textContent = stop;
        pstopsEl.appendChild(li);
      });
    }
  }

  /** Renders the available dates card */
  function epRenderDates(pkg) {
    var datesEl   = document.getElementById("admin-ep-dates");
    var noteEl    = document.getElementById("admin-ep-dates-note");
    var manageEl  = document.getElementById("admin-ep-manage");
    if (!datesEl) { return; }
    datesEl.textContent = "";

    if (!pkg) {
      if (noteEl) { noteEl.textContent = "Save the package first, then schedule departure dates."; }
      if (manageEl) { manageEl.hidden = true; }
      return;
    }

    if (noteEl) { noteEl.textContent = "Schedule departures and manage date-specific closures."; }
    if (manageEl) {
      manageEl.hidden = false;
      manageEl.href = "#/admin-availability";
    }

    // Pull departures from TTAdmin.data (admin-data.js) if available.
    // getDepartures() matches by package_code, so use pkg.packageCode.
    var departures = [];
    if (window.TTAdmin && window.TTAdmin.data && window.TTAdmin.data.getDepartures) {
      var lookupCode = pkg.packageCode || epGenerateCode(pkg);
      departures = window.TTAdmin.data.getDepartures(lookupCode);
    }

    // Filter to future, non-unavailable departures
    var today = new Date().toISOString().slice(0, 10);
    var future = departures.filter(function (d) {
      return d.travel_date >= today && !d.unavailable;
    }).slice(0, 7);

    if (future.length === 0) {
      var noDateP = document.createElement("p");
      noDateP.className = "ad-hint";
      noDateP.style.marginTop = "0";
      noDateP.textContent = "No dates scheduled yet.";
      datesEl.appendChild(noDateP);
      return;
    }

    var shown = future.slice(0, 6);
    var extra = future.length - shown.length;
    shown.forEach(function (d) {
      var chip = document.createElement("span");
      chip.className = "ad-date-chip";
      var parts = d.travel_date.split("-").map(Number);
      var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      chip.textContent = String(parts[2]).padStart(2, "0") + " " + months[parts[1] - 1];
      datesEl.appendChild(chip);
    });
    if (extra > 0) {
      var moreChip = document.createElement("span");
      moreChip.className = "ad-date-chip";
      moreChip.style.opacity = "0.7";
      moreChip.textContent = "+" + extra + " more";
      datesEl.appendChild(moreChip);
    }
  }

  /** Renders the publication card UI: pill, text, button labels */
  function epRenderPublication(pkg, status) {
    var pill     = document.getElementById("admin-ep-status-pill");
    var pubText  = document.getElementById("admin-ep-pub-text");
    var toggleBtn = document.getElementById("admin-ep-toggle");
    var deleteBtn = document.getElementById("admin-ep-delete");
    var active   = status === "Active";

    if (pill) {
      pill.textContent = status;
      pill.className = "ad-pill" + (active ? "" : " ad-pill--off");
    }
    if (pubText) {
      pubText.textContent = active
        ? "Active packages appear on the public website."
        : "Inactive packages are hidden from the public website.";
    }
    if (toggleBtn) {
      toggleBtn.textContent = active ? "Deactivate" : "Activate";
      toggleBtn.disabled = !pkg;
    }
    if (deleteBtn) {
      deleteBtn.disabled = !pkg;
      deleteBtn.hidden = !pkg;  // hide delete for new (unsaved) packages
    }
  }

  /**
   * Reads and validates the edit form, then saves the package.
   * Required: nation, code, title, description, stops, days, nights, price, max.
   * On success: flashes a message on the packages list page.
   * callback(savedPkg) is called on success instead of navigating away.
   */
  function handleSave(isNew, existing, nationSel, callback) {
    var valid = true;

    function require(fieldId, errorId, msg) {
      var el = document.getElementById(fieldId);
      var errEl = document.getElementById(errorId);
      if (!el || !el.value.trim()) {
        if (errEl) { errEl.textContent = msg; errEl.hidden = false; }
        if (el) { el.setAttribute("aria-invalid", "true"); }
        valid = false;
      } else {
        if (errEl) { errEl.hidden = true; errEl.textContent = ""; }
        if (el) { el.removeAttribute("aria-invalid"); }
      }
    }

    require("admin-ep-nation", "admin-ep-nation-error",   "Please select a nation.");
    require("admin-ep-code",   "admin-ep-code-error",     "Package code is required.");
    require("admin-ep-name",   "admin-ep-name-error",     "Package name is required.");
    require("admin-ep-desc",   "admin-ep-desc-error",     "Description is required.");
    require("admin-ep-stops",  "admin-ep-stops-error",    "At least one featured stop is required.");
    require("admin-ep-days",   "admin-ep-days-error",     "Duration (days) is required.");
    require("admin-ep-nights", "admin-ep-nights-error",   "Duration (nights) is required.");
    require("admin-ep-price",  "admin-ep-price-error",    "Base price is required.");
    require("admin-ep-max",    "admin-ep-max-error",      "Maximum group size is required.");

    // Validate package code format
    var codeVal = getVal("admin-ep-code").trim().toUpperCase();
    var codeErrEl = document.getElementById("admin-ep-code-error");
    if (valid && !/^[A-Z]{4}-\d{2}$/.test(codeVal)) {
      if (codeErrEl) { codeErrEl.textContent = "Use four letters, a dash and two digits, like MOND-01."; codeErrEl.hidden = false; }
      var codeEl = document.getElementById("admin-ep-code");
      if (codeEl) { codeEl.setAttribute("aria-invalid", "true"); }
      valid = false;
    } else if (valid) {
      var currentId = existing ? existing.id : null;
      if (!epCodeUnique(codeVal, currentId)) {
        if (codeErrEl) { codeErrEl.textContent = "That package code is already used."; codeErrEl.hidden = false; }
        var codeEl2 = document.getElementById("admin-ep-code");
        if (codeEl2) { codeEl2.setAttribute("aria-invalid", "true"); }
        valid = false;
      }
    }

    if (!valid) {
      var formErr = document.getElementById("admin-ep-form-error");
      if (formErr) { formErr.textContent = "Please fix the highlighted fields."; formErr.hidden = false; }
      return;
    }

    var days   = parseInt(getVal("admin-ep-days"), 10)   || 0;
    var nights = parseInt(getVal("admin-ep-nights"), 10) || 0;
    var price  = parseFloat(getVal("admin-ep-price").replace(/,/g, "")) || 0;
    var nation = nationSel ? nationSel.value : (existing ? existing.nation : "Mondstadt");
    var nationLinkMap = {
      "Mondstadt": "mondstadt.html", "Liyue": "liyue.html", "Inazuma": "inazuma.html",
      "Sumeru": "sumeru.html", "Fontaine": "fontaine.html", "Natlan": "natlan.html",
      "Snezhnaya": "snezhnaya.html"
    };

    var stopsRaw = getVal("admin-ep-stops");
    var highlights = stopsRaw ? stopsRaw.split(",").map(function (s) { return s.trim(); }).filter(Boolean) : [];

    var statusVal = getVal("admin-ep-status");
    var updated = {
      id:            isNew ? generateId() : existing.id,
      packageCode:   codeVal,
      nation:        nation,
      badge:         getVal("admin-ep-badge") || (existing ? existing.badge : nation),
      title:         getVal("admin-ep-name").trim(),
      price:         price,
      description:   getVal("admin-ep-desc").trim(),
      highlights:    highlights,
      duration:      days + " Days / " + nights + " Nights",
      durationDays:  days,
      durationNights:nights,
      maxGroup:      parseInt(getVal("admin-ep-max"), 10) || (existing ? existing.maxGroup : 12),
      startingPrice: "From \u20B1" + price.toLocaleString() + " per person",
      image:         getVal("admin-ep-image").trim() || (existing ? existing.image : ""),
      imageAlt:      existing ? existing.imageAlt : nation + " landscape",
      accent:        getVal("admin-ep-accent").trim() || (existing ? existing.accent : "#82d7bd"),
      nationLink:    safeLink(getVal("admin-ep-link").trim() || nationLinkMap[nation] || (existing ? existing.nationLink : "index.html")),
      status:        (statusVal === "Active" || statusVal === "Inactive") ? statusVal : "Active"
    };

    upsertPackage(updated);

    // Update the crumb code display
    var crumbCode = document.getElementById("admin-ep-crumb-code");
    if (crumbCode) { crumbCode.textContent = codeVal; }

    // Update the price field to formatted value
    setVal("admin-ep-price", epFormatPrice(price));

    // Update the browser URL to reflect the saved id (stays on the edit page)
    window.history.replaceState(null, "", "#/admin-package-edit/" + encodeURIComponent(updated.id));

    // Show success toast via sessionStorage flash (shown on packages list)
    // but also stay on the page and show inline confirmation
    var titleEl = document.getElementById("admin-ep-title");
    if (titleEl) { titleEl.textContent = "Edit tour package"; }

    if (typeof callback === "function") {
      callback(updated);
    }

    // Flash the message for when the user navigates to packages
    sessionStorage.setItem("tt_pkg_saved",
      isNew ? "Package \u201c" + updated.title + "\u201d added." : "Changes saved.");

    // Show a toast-style confirmation inline
    var formErr = document.getElementById("admin-ep-form-error");
    if (formErr) { formErr.hidden = true; }

    // Re-render the public slider immediately
    renderPublicSlider();

    // Show save confirmation on the packages list when navigating away
    // but stay on this page for further edits — only navigate away on Cancel
    // For the "saved" state, show a brief status in the page header
    var actionsBar = document.getElementById("admin-ep-actions");
    if (actionsBar) {
      var oldMsg = actionsBar.querySelector(".admin-ep-saved-msg");
      if (oldMsg) { oldMsg.remove(); }
      var msg = document.createElement("p");
      msg.className = "admin-ep-saved-msg ad-hint";
      msg.style.cssText = "color:var(--ad-accent);font-size:12px;margin-top:4px;";
      msg.textContent = isNew ? "Package saved successfully." : "Changes saved successfully.";
      var headDiv = actionsBar.querySelector("div");
      if (headDiv) { headDiv.appendChild(msg); }
      setTimeout(function () { if (msg.parentNode) { msg.remove(); } }, 3500);
    }
  }

  /* =========================================================
     13. ADMIN LOG OUT
     ========================================================= */

  /**
   * Wires up all "Log out" / "Sign out" buttons in the admin views.
   * Clears the session and returns to the public home page (#/).
   */
  function bindLogoutButtons() {
    document.querySelectorAll(".admin-logout-btn").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        signOut();
        navigate("#/");
      });
    });
  }

  /* =========================================================
     14. ADMIN MOBILE SIDEBAR TOGGLE
     ========================================================= */

  /**
   * Wires up the hamburger menu button inside the admin top bar.
   * Toggles the .admin-nav-open class on the admin view container,
   * which slides the sidebar in/out on small screens (≤ 960px).
   */
  function bindAdminMenuToggle() {
    document.querySelectorAll(".admin-menu-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var view = btn.closest(".admin-view");
        if (!view) { return; }
        var isOpen = view.classList.toggle("admin-nav-open");
        btn.setAttribute("aria-expanded", String(isOpen));
        var scrim = view.querySelector(".admin-scrim");
        if (scrim) { scrim.hidden = !isOpen; }
      });
    });

    // Close sidebar when scrim is clicked
    document.querySelectorAll(".admin-scrim").forEach(function (scrim) {
      scrim.addEventListener("click", function () {
        var view = scrim.closest(".admin-view");
        if (!view) { return; }
        view.classList.remove("admin-nav-open");
        scrim.hidden = true;
        var btn = view.querySelector(".admin-menu-btn");
        if (btn) { btn.setAttribute("aria-expanded", "false"); }
      });
    });
  }

  /* =========================================================
     15. UTILITIES
     ========================================================= */

  /**
   * Escapes a string for safe insertion into HTML attributes and text nodes.
   */
  function escHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /**
   * Sets the value of a form field by id.
   */
  function setVal(id, value) {
    var el = document.getElementById(id);
    if (el) { el.value = value; }
  }

  /**
   * Gets the trimmed value of a form field by id.
   */
  function getVal(id) {
    var el = document.getElementById(id);
    return el ? el.value : "";
  }

  /* =========================================================
     16. BOOTSTRAP
     ========================================================= */

  /**
   * Entry point: runs once after the DOM is ready (script has defer).
   * Sets up routing, binds global controls, and routes to the initial hash.
   */
  function init() {
    // Initialize packages in localStorage on first visit
    getPackages();

    // Bind persistent UI
    bindLogoutButtons();
    bindAdminMenuToggle();
    updateAuthNavLink();

    // Listen for hash changes (Back/Forward buttons, navigate() calls)
    window.addEventListener("hashchange", route);

    // Route to current hash on page load
    route();
  }

  init();

})();
