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
  var PACKAGES_KEY = "tt_packages";

  /* =========================================================
     3. DEFAULT PACKAGES DATA
     Mirrors the 7 cards that are hard-coded in index.html.
     The public slider is re-rendered from this array on every load.
     ========================================================= */
  var DEFAULT_PACKAGES = [
    {
      id: "pkg-1",
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
      status: "Inactive"
    },
    {
      id: "pkg-7",
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
      status: "Inactive"
    }
  ];

  /* =========================================================
     4. DATA HELPERS
     ========================================================= */

  /**
   * Returns the packages array from localStorage.
   * Falls back to DEFAULT_PACKAGES on first visit or if storage is corrupt.
   */
  function getPackages() {
    try {
      var raw = localStorage.getItem(PACKAGES_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
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
      "/admin-bookings"
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
   * Populates the admin dashboard overview:
   *  - stat cards (pending, confirmed, inquiries, payments — demo zeros)
   *  - packages count stat
   *  - recent bookings table (empty demo state)
   *  - attention sidebar (zero counts)
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
  }

  /* =========================================================
     11. ADMIN PACKAGES LIST RENDERING
     ========================================================= */

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
        tr.innerHTML =
          '<td class="ad-td-main" data-label="Package">' +
            '<div class="ad-pkg">' +
              '<img class="ad-pkg__thumb" src="' + p.image + '" alt="" width="56" height="38">' +
              '<div>' +
                '<span class="ad-pkg__name">' + escHtml(p.title) + '</span>' +
                '<span class="ad-pkg__code">' + num + ' &middot; ' + escHtml(p.nation) + '</span>' +
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

    if (!layout || !titleEl) { return; }

    var isNew = (!id || id === "new");
    var pkg = isNew ? null : findPackage(id);

    if (!isNew && !pkg) {
      if (missingCard) { missingCard.hidden = false; }
      layout.hidden = true;
      return;
    }

    if (missingCard) { missingCard.hidden = true; }
    layout.hidden = false;

    titleEl.textContent = isNew ? "Add tour package" : "Edit tour package";
    if (crumbCode) {
      crumbCode.textContent = isNew ? "New" : (pkg.id);
    }

    // Populate nation <select>
    var nationSel = document.getElementById("admin-ep-nation");
    var NATIONS = ["Mondstadt", "Liyue", "Inazuma", "Sumeru", "Fontaine", "Natlan", "Snezhnaya"];
    if (nationSel) {
      nationSel.innerHTML = NATIONS.map(function (n) {
        var sel = pkg && pkg.nation === n ? " selected" : "";
        return '<option value="' + n + '"' + sel + '>' + n + '</option>';
      }).join("");
    }

    // Fill fields
    setVal("admin-ep-name",    pkg ? pkg.title : "");
    setVal("admin-ep-desc",    pkg ? pkg.description : "");
    setVal("admin-ep-stops",   pkg ? (pkg.highlights || []).join(", ") : "");
    setVal("admin-ep-days",    pkg ? String(pkg.durationDays || "") : "");
    setVal("admin-ep-nights",  pkg ? String(pkg.durationNights || "") : "");
    setVal("admin-ep-price",   pkg ? String(pkg.price || "") : "");
    setVal("admin-ep-max",     pkg ? String(pkg.maxGroup || "") : "");
    setVal("admin-ep-badge",   pkg ? pkg.badge : "");
    setVal("admin-ep-accent",  pkg ? pkg.accent : "#82d7bd");
    setVal("admin-ep-link",    pkg ? pkg.nationLink : "");
    setVal("admin-ep-image",   pkg ? pkg.image : "");
    setVal("admin-ep-status",  pkg ? (pkg.status || "Active") : "Active");

    // Clear errors
    var errorIds = ["admin-ep-name-error", "admin-ep-desc-error", "admin-ep-days-error",
                    "admin-ep-nights-error", "admin-ep-price-error", "admin-ep-form-error"];
    errorIds.forEach(function (eid) {
      var el = document.getElementById(eid);
      if (el) { el.textContent = ""; el.hidden = true; }
    });

    // Cancel button
    if (cancelBtn) {
      cancelBtn.onclick = function (e) {
        e.preventDefault();
        navigate("#/admin-packages");
      };
    }

    // Save button (top of page) — clone to remove old listener
    if (saveBtn) {
      var newSave = saveBtn.cloneNode(true);
      saveBtn.parentNode.replaceChild(newSave, saveBtn);
      newSave.addEventListener("click", function () { handleSave(isNew, pkg, nationSel); });
    }

    // Sidebar save button — same action
    var saveSideBtn = document.getElementById("admin-ep-save-side");
    if (saveSideBtn) {
      var newSaveSide = saveSideBtn.cloneNode(true);
      saveSideBtn.parentNode.replaceChild(newSaveSide, saveSideBtn);
      newSaveSide.addEventListener("click", function () { handleSave(isNew, pkg, nationSel); });
    }
  }

  /**
   * Reads and validates the edit form, then saves the package.
   * Required: title, description, days, nights, price.
   * On success: flashes a message on the packages list page.
   */
  function handleSave(isNew, existing, nationSel) {
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

    require("admin-ep-name",   "admin-ep-name-error",   "Package name is required.");
    require("admin-ep-desc",   "admin-ep-desc-error",   "Description is required.");
    require("admin-ep-days",   "admin-ep-days-error",   "Duration (days) is required.");
    require("admin-ep-nights", "admin-ep-nights-error", "Duration (nights) is required.");
    require("admin-ep-price",  "admin-ep-price-error",  "Base price is required.");

    if (!valid) {
      var formErr = document.getElementById("admin-ep-form-error");
      if (formErr) { formErr.textContent = "Please fix the errors above."; formErr.hidden = false; }
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
      startingPrice: "From ₱" + price.toLocaleString() + " per person",
      image:         getVal("admin-ep-image").trim() || (existing ? existing.image : ""),
      imageAlt:      existing ? existing.imageAlt : nation + " landscape",
      accent:        getVal("admin-ep-accent").trim() || (existing ? existing.accent : "#82d7bd"),
      nationLink:    safeLink(getVal("admin-ep-link").trim() || nationLinkMap[nation] || (existing ? existing.nationLink : "index.html")),
      status:        (statusVal === "Active" || statusVal === "Inactive") ? statusVal : "Active"
    };

    upsertPackage(updated);
    sessionStorage.setItem("tt_pkg_saved",
      isNew ? "Package \u201c" + updated.title + "\u201d added." : "Changes saved.");
    navigate("#/admin-packages");
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
