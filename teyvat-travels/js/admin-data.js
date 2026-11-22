/* Demo data layer for the admin pages (Overview, Tour packages, Edit package).
   There is no server yet, so tour packages are seeded here and saved in the browser's localStorage.
   Every package field uses the same name and size as the tour_packages table in the data dictionary,
   so swapping this file for fetch() calls to a PHP/MySQL API later does not change the pages.
   Bookings, inquiries and departures are read-only sample data for the demo. */
(function () {
  "use strict";

  const STORAGE_KEY = "tt_admin_packages_v1";

  /* The seven nations, in catalog order, with the four-letter prefix used by package_code. */
  const NATIONS = ["Mondstadt", "Liyue", "Inazuma", "Sumeru", "Fontaine", "Natlan", "Snezhnaya"];
  const PREFIX = {
    Mondstadt: "MOND", Liyue: "LIYU", Inazuma: "INAZ", Sumeru: "SUME",
    Fontaine: "FONT", Natlan: "NATL", Snezhnaya: "SNEZ"
  };

  /* Card image for each nation. These are front-end assets, not a database column. */
  const IMAGES = {
    Mondstadt: "assets/img/mondstadt.webp",
    Liyue: "assets/img/liyue.jpeg",
    Inazuma: "assets/img/inazuma.webp",
    Sumeru: "assets/img/sumeru.webp",
    Fontaine: "assets/img/fontaine.webp",
    Natlan: "assets/img/natlan.webp",
    Snezhnaya: "assets/img/snezhnaya.webp"
  };

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  /* Seed packages come from the Tranche 1 references. Sizes follow the data dictionary. */
  const SEED_PACKAGES = [
    { package_id: 1, package_code: "MOND-01", created_by: 1, nation: "Mondstadt", package_name: "The City of Freedom Expedition",
      description: "Experience the romantic charm of windmills, rolling green hills, and historic stone architecture. Perfect for travelers looking for a relaxing nature getaway.",
      featured_stops: "Cider Lake, Windrise, the grand Cathedral of Mondstadt",
      duration_days: 3, duration_nights: 2, base_price: 12500, max_group_size: 12, status: "Active" },
    { package_id: 2, package_code: "LIYU-02", created_by: 1, nation: "Liyue", package_name: "The Harbor of Stone and Commerce",
      description: "A bustling port city tour blending breathtaking mountain ranges, ancient folklore, and world-class culinary adventures.",
      featured_stops: "Liyue Harbor, Mt. Aocang, Wangshu Inn",
      duration_days: 4, duration_nights: 3, base_price: 15000, max_group_size: 16, status: "Active" },
    { package_id: 3, package_code: "INAZ-03", created_by: 1, nation: "Inazuma", package_name: "The Realm of Eternal Thunder",
      description: "Discover a culturally rich archipelago featuring striking purple foliage, traditional shrines, and serene coastal views.",
      featured_stops: "Narukami Island Grand Shrine, Ritou Trading Port, Tenshukaku",
      duration_days: 4, duration_nights: 3, base_price: 18000, max_group_size: 12, status: "Active" },
    { package_id: 4, package_code: "SUME-04", created_by: 1, nation: "Sumeru", package_name: "The City of Wisdom & Rainforest Retreat",
      description: "A dual-environment journey taking you from the majestic halls of learning to the dense, mystical canopies of the rainforest.",
      featured_stops: "Sumeru City Academy, Gandharva Ville, Caravan Ribat",
      duration_days: 3, duration_nights: 3, base_price: 14000, max_group_size: 10, status: "Active" },
    { package_id: 5, package_code: "FONT-05", created_by: 1, nation: "Fontaine", package_name: "The Capital of Justice, Steam, and Aquanics",
      description: "Step into a picturesque hub of art, fashion, and advanced clockwork engineering surrounded by pristine waters.",
      featured_stops: "Court of Fontaine, Opera Epiclese, Lucine Fountain",
      duration_days: 5, duration_nights: 4, base_price: 20000, max_group_size: 12, status: "Active" },
    { package_id: 6, package_code: "NATL-06", created_by: 1, nation: "Natlan", package_name: "The Land of Ash, Hot Springs, and Valor",
      description: "An energetic adventure featuring dramatic volcanic landscapes, therapeutic thermal springs, and vibrant tribal festivals.",
      featured_stops: "Tepecac Stadium, Children of the Echoes Canyon, People of the Springs basin",
      duration_days: 4, duration_nights: 3, base_price: 16500, max_group_size: 14, status: "Active" },
    { package_id: 7, package_code: "SNEZ-07", created_by: 1, nation: "Snezhnaya", package_name: "The Eternal White Tundra",
      description: "A majestic winter expedition exploring frosted architectural marvels, grand palaces, and cozy alpine chalets under the aurora.",
      featured_stops: "Zapolyarny Palace outskirts, Frost-bound Valleys, Glacial Outposts",
      duration_days: 5, duration_nights: 4, base_price: 22000, max_group_size: 10, status: "Active" }
  ];

  /* Sample bookings (bookings_reservations joined with the client name). Read-only in this demo. */
  const BOOKINGS = [
    { reference: "BK-2026-0148", client: "Aira Santos", email: "aira.santos@example.com", package_code: "MOND-01", travel_date: "2026-12-05", num_guests: 2, total_price: 25000, booking_status: "Pending", payment_status: "Pending" },
    { reference: "BK-2026-0147", client: "Miguel Reyes", email: "miguel.reyes@example.com", package_code: "LIYU-02", travel_date: "2026-12-08", num_guests: 4, total_price: 60000, booking_status: "Confirmed", payment_status: "Paid" },
    { reference: "BK-2026-0146", client: "Lea Cruz", email: "lea.cruz@example.com", package_code: "FONT-05", travel_date: "2026-12-12", num_guests: 3, total_price: 60000, booking_status: "Confirmed", payment_status: "Paid" },
    { reference: "BK-2026-0145", client: "Jules Mendoza", email: "jules.mendoza@example.com", package_code: "INAZ-03", travel_date: "2026-12-15", num_guests: 2, total_price: 36000, booking_status: "Pending", payment_status: "Pending" },
    { reference: "BK-2026-0144", client: "Erika Tan", email: "erika.tan@example.com", package_code: "SUME-04", travel_date: "2026-12-10", num_guests: 3, total_price: 42000, booking_status: "Confirmed", payment_status: "Paid" },
    { reference: "BK-2026-0143", client: "Noel Ramos", email: "noel.ramos@example.com", package_code: "LIYU-02", travel_date: "2026-12-20", num_guests: 3, total_price: 45000, booking_status: "Confirmed", payment_status: "Paid" },
    { reference: "BK-2026-0142", client: "Carla Dizon", email: "carla.dizon@example.com", package_code: "NATL-06", travel_date: "2027-01-09", num_guests: 2, total_price: 33000, booking_status: "Confirmed", payment_status: "Pending" },
    { reference: "BK-2026-0141", client: "Paolo Garcia", email: "paolo.garcia@example.com", package_code: "SNEZ-07", travel_date: "2027-01-18", num_guests: 2, total_price: 44000, booking_status: "Rejected", payment_status: "Pending" }
  ];

  /* Sample inquiries (clients_inquiries rows that have a message). */
  const INQUIRIES = [
    { reference: "IQ-0062", client: "Aira Santos", email: "aira.santos@example.com", package_code: "MOND-01", message: "A morning departure for two on 5 December?", inquiry_status: "New" },
    { reference: "IQ-0061", client: "Rico Bautista", email: "rico.bautista@example.com", package_code: "SNEZ-07", message: "How much for a group of 4?", inquiry_status: "New" },
    { reference: "IQ-0060", client: "Mara Lim", email: "mara.lim@example.com", package_code: "FONT-05", message: "Is the Opera Epiclese visit included?", inquiry_status: "New" },
    { reference: "IQ-0059", client: "Dan Flores", email: "dan.flores@example.com", package_code: "LIYU-02", message: "Is 8 December still available?", inquiry_status: "Responded" },
    { reference: "IQ-0058", client: "Ivy Navarro", email: "ivy.navarro@example.com", package_code: "", message: "Do you offer private tours?", inquiry_status: "Closed" }
  ];

  /* Sample departures. "confirmed" is the number of guests already confirmed for that date. It is
     illustrative: the Availability page will own these rows later. */
  const DEPARTURES = [
    { package_code: "MOND-01", travel_date: "2026-12-05", confirmed: 6 },
    { package_code: "LIYU-02", travel_date: "2026-12-08", confirmed: 4 },
    { package_code: "SUME-04", travel_date: "2026-12-10", confirmed: 2 },
    { package_code: "FONT-05", travel_date: "2026-12-12", confirmed: 3 },
    { package_code: "INAZ-03", travel_date: "2026-12-15", confirmed: 2 },
    { package_code: "MOND-01", travel_date: "2026-12-19", confirmed: 3 },
    { package_code: "LIYU-02", travel_date: "2026-12-20", confirmed: 3 },
    { package_code: "NATL-06", travel_date: "2027-01-09", confirmed: 2 },
    { package_code: "SNEZ-07", travel_date: "2027-01-18", confirmed: 0 }
  ];

  /* ------------------------------------------------------------------
     Storage helpers. localStorage can be blocked (private mode, file://
     restrictions), so every call is wrapped and falls back to memory.
     ------------------------------------------------------------------ */
  let memoryCopy = null;

  /* Returns a deep copy so callers can edit objects without changing the stored list by accident. */
  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  /* Loads the saved package list, or the seed list the first time. */
  function loadPackages() {
    if (memoryCopy) {
      return clone(memoryCopy);
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (error) {
      /* Storage unavailable or corrupted: fall through to the seed data. */
    }
    return clone(SEED_PACKAGES);
  }

  /* Saves the package list. If storage fails, keeps a copy in memory for this page visit. */
  function storePackages(list) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      memoryCopy = null;
    } catch (error) {
      memoryCopy = clone(list);
    }
  }

  /* ------------------------------------------------------------------
     Formatting
     ------------------------------------------------------------------ */

  /* 12500 becomes "₱12,500", and 12500.5 becomes "₱12,500.50". */
  function formatPeso(amount) {
    const hasCents = Math.round(amount * 100) % 100 !== 0;
    return "₱" + Number(amount).toLocaleString("en-PH", {
      minimumFractionDigits: hasCents ? 2 : 0,
      maximumFractionDigits: 2
    });
  }

  /* "2026-12-05" becomes "05 Dec 2026" (or "05 Dec" with withYear false). No time zone shift. */
  function formatDate(iso, withYear) {
    const parts = String(iso).split("-").map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) {
      return "";
    }
    const text = String(parts[2]).padStart(2, "0") + " " + MONTHS[parts[1] - 1];
    return withYear === false ? text : text + " " + parts[0];
  }

  /* Today as YYYY-MM-DD in the visitor's own time zone. */
  function todayISO() {
    const now = new Date();
    return now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
  }

  /* ------------------------------------------------------------------
     Package operations
     ------------------------------------------------------------------ */

  /* Every package, in package_id order. */
  function getPackages() {
    return loadPackages().sort(function (a, b) {
      return a.package_id - b.package_id;
    });
  }

  /* One package by its code (case-insensitive), or null. */
  function getPackage(code) {
    const wanted = String(code || "").toUpperCase();
    return getPackages().find(function (pkg) {
      return pkg.package_code.toUpperCase() === wanted;
    }) || null;
  }

  /* Suggests the next free code for a nation, such as NATL-08. The number continues the catalog sequence. */
  function nextPackageCode(nation) {
    const prefix = PREFIX[nation] || "XXXX";
    let highest = 0;
    getPackages().forEach(function (pkg) {
      const number = parseInt(pkg.package_code.split("-")[1], 10);
      if (number > highest) {
        highest = number;
      }
    });
    return prefix + "-" + String(highest + 1).padStart(2, "0");
  }

  /* Saves one package. originalCode is the code before editing, or "" for a new package.
     Returns { ok: true, package } or { ok: false, error }. The server must repeat these checks. */
  function savePackage(pkg, originalCode) {
    const list = loadPackages();
    const wanted = pkg.package_code.toUpperCase();
    const clash = list.some(function (item) {
      return item.package_code.toUpperCase() === wanted &&
        item.package_code.toUpperCase() !== String(originalCode || "").toUpperCase();
    });

    if (clash) {
      return { ok: false, error: "That package code is already used by another package." };
    }

    const index = list.findIndex(function (item) {
      return item.package_code.toUpperCase() === String(originalCode || "").toUpperCase();
    });

    if (index === -1) {
      const nextId = list.reduce(function (max, item) {
        return Math.max(max, item.package_id);
      }, 0) + 1;
      pkg.package_id = nextId;
      pkg.created_by = 1;
      list.push(pkg);
    } else {
      pkg.package_id = list[index].package_id;
      pkg.created_by = list[index].created_by;
      list[index] = pkg;
    }

    storePackages(list);
    return { ok: true, package: clone(pkg) };
  }

  /* Changes only the status of a stored package, so unsaved form edits are never written by accident. */
  function setPackageStatus(code, status) {
    const list = loadPackages();
    const item = list.find(function (entry) {
      return entry.package_code.toUpperCase() === String(code).toUpperCase();
    });
    if (!item) {
      return false;
    }
    item.status = status;
    storePackages(list);
    return true;
  }

  /* Number of bookings that point at a package. A package with bookings cannot be deleted
     (the bookings_reservations.package_id foreign key), only deactivated. */
  function countBookingsFor(code) {
    return BOOKINGS.filter(function (booking) {
      return booking.package_code.toUpperCase() === String(code).toUpperCase();
    }).length;
  }

  /* Deletes a package unless bookings reference it. Returns { ok } or { ok: false, bookings }. */
  function deletePackage(code) {
    const bookings = countBookingsFor(code);
    if (bookings > 0) {
      return { ok: false, bookings: bookings };
    }
    storePackages(loadPackages().filter(function (item) {
      return item.package_code.toUpperCase() !== String(code).toUpperCase();
    }));
    return { ok: true };
  }

  function getDepartures(code) {
    return DEPARTURES.filter(function (item) {
      return !code || item.package_code.toUpperCase() === String(code).toUpperCase();
    }).sort(function (a, b) {
      return a.travel_date < b.travel_date ? -1 : 1;
    });
  }

  window.TTAdmin = window.TTAdmin || {};
  window.TTAdmin.data = {
    NATIONS: NATIONS,
    PREFIX: PREFIX,
    IMAGES: IMAGES,
    getPackages: getPackages,
    getPackage: getPackage,
    nextPackageCode: nextPackageCode,
    savePackage: savePackage,
    setPackageStatus: setPackageStatus,
    deletePackage: deletePackage,
    countBookingsFor: countBookingsFor,
    getBookings: function () { return clone(BOOKINGS); },
    getInquiries: function () { return clone(INQUIRIES); },
    getDepartures: getDepartures,
    formatPeso: formatPeso,
    formatDate: formatDate,
    todayISO: todayISO
  };
})();
