/* Booking panel for the nation pages. Concept bookings are stored locally; nothing is sent or charged. */
(function () {
  "use strict";

  const triggers = Array.from(document.querySelectorAll("[data-booking-open]"));
  if (triggers.length === 0) {
    return;
  }

  const MIN_TRAVELLERS = 1;
  const MAX_TRAVELLERS = 12;
  const DEFAULT_TRAVELLERS = 2;
  const CLOSE_DELAY = 220;
  const BOOKINGS_STORAGE_KEY = "tt_bookings";
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const NAME_PATTERN = /^\p{L}+$/u;
  const PHONE_PATTERN = /^(?:09\d{9}|\+639\d{9})$/;

  /* Package data mirrors the cards on index.html. Update prices and durations in both places. */
  const PACKAGES = {
    mondstadt: {
      name: "Mondstadt",
      code: "MOND-01",
      accent: "#82d7bd",
      image: "assets/img/mondstadt.webp",
      imageAlt: "The green highlands and clear blue skies of Mondstadt",
      title: "The City of Freedom Expedition",
      duration: "3 Days / 2 Nights",
      price: 12500,
      description: "Experience the romantic charm of windmills, rolling green hills, and historic stone architecture. Perfect for travelers looking for a relaxing nature getaway.",
      stops: ["Cider Lake", "Windrise", "The Grand Cathedral of Mondstadt"]
    },
    liyue: {
      name: "Liyue",
      code: "LIYU-02",
      accent: "#e7bd69",
      image: "assets/img/liyue.jpeg",
      imageAlt: "Warm sunset over the rocky peaks and valleys of Liyue",
      title: "The Harbor of Stone and Commerce",
      duration: "4 Days / 3 Nights",
      price: 15000,
      description: "A bustling port city tour blending breathtaking mountain ranges, ancient folklore, and world-class culinary adventures.",
      stops: ["Liyue Harbor", "Mt. Aocang", "Wangshu Inn"]
    },
    inazuma: {
      name: "Inazuma",
      code: "INAZ-03",
      accent: "#c59bed",
      image: "assets/img/inazuma.webp",
      imageAlt: "Inazuma's island architecture framed by glowing cherry blossoms",
      title: "The Realm of Eternal Thunder",
      duration: "4 Days / 3 Nights",
      price: 18000,
      description: "Discover a culturally rich archipelago featuring striking purple foliage, traditional shrines, and serene coastal views.",
      stops: ["Narukami Island Grand Shrine", "Ritou Trading Port", "Tenshukaku"]
    },
    sumeru: {
      name: "Sumeru",
      code: "SUME-04",
      accent: "#a6d46c",
      image: "assets/img/sumeru.webp",
      imageAlt: "A great tree rises above Sumeru's green hills and waterfalls",
      title: "The City of Wisdom & Rainforest Retreat",
      duration: "3 Days / 3 Nights",
      price: 14000,
      description: "A dual-environment journey taking you from the majestic halls of learning to the dense, mystical canopies of the rainforest.",
      stops: ["Sumeru City Academy", "Gandharva Ville", "Caravan Ribat"]
    },
    fontaine: {
      name: "Fontaine",
      code: "FONT-05",
      accent: "#7ed9e7",
      image: "assets/img/fontaine.webp",
      imageAlt: "The luminous towers and blue waters of Fontaine",
      title: "The Capital of Justice, Steam, and Aquanics",
      duration: "5 Days / 4 Nights",
      price: 20000,
      description: "Step into a picturesque hub of art, fashion, and advanced clockwork engineering surrounded by pristine waters.",
      stops: ["Court of Fontaine", "Opera Epiclese", "Lucine Fountain"]
    },
    natlan: {
      name: "Natlan",
      code: "NATL-06",
      accent: "#ff936d",
      image: "assets/img/natlan.webp",
      imageAlt: "Natlan's sunlit volcanic plains and distant mesas",
      title: "The Land of Ash, Hot Springs, and Valor",
      duration: "4 Days / 3 Nights",
      price: 16500,
      description: "An energetic adventure featuring dramatic volcanic landscapes, therapeutic thermal springs, and vibrant tribal festivals.",
      stops: ["Tepecac Stadium", "Children of the Echoes Canyon", "People of the Springs basin"]
    },
    snezhnaya: {
      name: "Snezhnaya",
      code: "SNEZ-07",
      accent: "#a6ddf3",
      image: "assets/img/snezhnaya.webp",
      imageAlt: "A frozen Snezhnaya skyline beneath a deep blue, starry sky",
      title: "The Eternal White Tundra",
      duration: "5 Days / 4 Nights",
      price: 22000,
      description: "A majestic winter expedition exploring frosted architectural marvels, grand palaces, and cozy alpine chalets under the aurora.",
      stops: ["Zapolyarny Palace outskirts", "Frost-bound Valleys", "Glacial Outposts"]
    }
  };

  const ORDER = ["mondstadt", "liyue", "inazuma", "sumeru", "fontaine", "natlan", "snezhnaya"];

  const VIEW_TEXT = {
    form: {
      title: "Plan your expedition",
      subtitle: "Choose your travel details and review your selected package."
    },
    review: {
      title: "Review your booking",
      subtitle: "Check the details below. This is a fan-made concept, so nothing is sent or charged."
    },
    done: {
      title: "Booking concept complete",
      subtitle: "Thanks for planning an expedition with us."
    }
  };

  const state = {
    key: "mondstadt",
    travellers: DEFAULT_TRAVELLERS,
    view: "form"
  };

  let lastTrigger = null;
  let closeTimer = null;
  let inertElements = [];

  /* Builds the static markup. All text here is trusted; user input is only ever set with textContent. */
  function buildMarkup() {
    const options = ORDER.map(function (key) {
      return '<option value="' + key + '">' + PACKAGES[key].name + "</option>";
    }).join("");

    return `
      <div class="bk-backdrop" data-bk-close></div>
      <div class="bk-dialog" role="dialog" aria-modal="true" aria-labelledby="bk-title" aria-describedby="bk-subtitle" tabindex="-1" data-view="form">
        <button class="bk-close" type="button" data-bk-close aria-label="Close booking panel">&#10005;</button>

        <header class="bk-head">
          <p class="bk-kicker">Teyvat Travels / Booking</p>
          <h2 class="bk-title" id="bk-title" tabindex="-1">Plan your expedition</h2>
          <p class="bk-subtitle" id="bk-subtitle">Choose your travel details and review your selected package.</p>
        </header>

        <form class="bk-form" id="bk-form" novalidate>
          <div class="bk-grid">
            <div class="bk-col">

              <div data-bk-views="form">
                <section class="bk-section" aria-labelledby="bk-trip-title">
                  <div class="bk-section-head">
                    <h3 class="bk-h3" id="bk-trip-title">Your trip</h3>
                    <p class="bk-required-note">* Required fields</p>
                  </div>

                  <div class="bk-field">
                    <label class="bk-label" for="bk-destination">Destination <span aria-hidden="true">*</span></label>
                    <select class="bk-select" id="bk-destination" name="destination" required>${options}</select>
                  </div>

                  <div class="bk-row">
                    <div class="bk-field">
                      <label class="bk-label" for="bk-date">Departure date <span aria-hidden="true">*</span></label>
                      <input class="bk-input" type="date" id="bk-date" name="date" required autocomplete="off">
                      <p class="bk-error" id="bk-date-error" hidden></p>
                    </div>
                    <div class="bk-field">
                      <span class="bk-label" id="bk-travellers-label">Travellers <span aria-hidden="true">*</span></span>
                      <div class="bk-stepper" role="group" aria-labelledby="bk-travellers-label">
                        <button class="bk-stepper__btn" type="button" data-bk-step="-1" aria-label="Remove a traveller">&minus;</button>
                        <output class="bk-stepper__value" id="bk-travellers">2</output>
                        <button class="bk-stepper__btn" type="button" data-bk-step="1" aria-label="Add a traveller">+</button>
                      </div>
                      <p class="bk-error" id="bk-travellers-control-error" hidden></p>
                    </div>
                  </div>
                </section>

                <section class="bk-section" aria-labelledby="bk-details-title">
                  <h3 class="bk-h3" id="bk-details-title">Traveller details</h3>
                  <p class="bk-section-note">Contact information for the lead traveller.</p>

                  <div class="bk-row">
                    <div class="bk-field">
                      <label class="bk-label" for="bk-first">First name <span aria-hidden="true">*</span></label>
                      <input class="bk-input" type="text" id="bk-first" name="first" required maxlength="60" autocomplete="given-name" placeholder="Enter first name">
                      <p class="bk-error" id="bk-first-error" hidden></p>
                    </div>
                    <div class="bk-field">
                      <label class="bk-label" for="bk-last">Last name <span aria-hidden="true">*</span></label>
                      <input class="bk-input" type="text" id="bk-last" name="last" required maxlength="60" autocomplete="family-name" placeholder="Enter last name">
                      <p class="bk-error" id="bk-last-error" hidden></p>
                    </div>
                  </div>

                  <div class="bk-row">
                    <div class="bk-field">
                      <label class="bk-label" for="bk-email">Email address <span aria-hidden="true">*</span></label>
                      <input class="bk-input" type="email" id="bk-email" name="email" required maxlength="120" autocomplete="email" placeholder="you@example.com">
                      <p class="bk-error" id="bk-email-error" hidden></p>
                    </div>
                    <div class="bk-field">
                      <label class="bk-label" for="bk-phone">Phone number <span aria-hidden="true">*</span></label>
                      <input class="bk-input" type="tel" id="bk-phone" name="phone" required maxlength="24" autocomplete="tel" placeholder="Enter phone number">
                      <p class="bk-error" id="bk-phone-error" hidden></p>
                    </div>
                  </div>

                  <div class="bk-field">
                    <label class="bk-label" for="bk-notes">Special requests (optional)</label>
                    <textarea class="bk-textarea" id="bk-notes" name="notes" maxlength="500" placeholder="Accessibility needs, dietary preferences, or anything else we should know."></textarea>
                  </div>

                  <div class="bk-field">
                    <label class="bk-check">
                      <input type="checkbox" id="bk-ack" name="ack" required>
                      <span>I understand this is a fan-made booking concept and no real booking or payment will be made.</span>
                    </label>
                    <p class="bk-error" id="bk-ack-error" hidden></p>
                  </div>
                </section>
              </div>

              <div data-bk-views="review">
                <h3 class="bk-h3">Your details</h3>
                <dl class="bk-review" id="bk-review-list"></dl>
                <p class="bk-error" id="bk-save-error" aria-live="polite" hidden></p>
              </div>

              <div class="bk-done" data-bk-views="done">
                <span class="bk-done__icon" aria-hidden="true">&#10003;</span>
                <div class="bk-done__copy">
                  <p id="bk-done-message"></p>
                  <p class="bk-done__reference" id="bk-reference"></p>
                </div>
              </div>
            </div>

            <aside class="bk-summary" data-bk-views="form review" aria-label="Selected package">
              <img class="bk-summary__img" id="bk-img" src="" alt="" decoding="async">
              <div class="bk-summary__body">
                <p class="bk-summary__region" id="bk-region"></p>
                <h3 class="bk-summary__title" id="bk-package-title"></h3>
                <p class="bk-summary__duration">
                  <svg class="bk-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M3 10h18M8 3v4M16 3v4"></path></svg>
                  <span id="bk-duration"></span>
                </p>
                <p class="bk-summary__desc" id="bk-desc"></p>
                <div class="bk-stops-block">
                  <h4 class="bk-stops-title">Featured stops</h4>
                  <ul class="bk-stops" id="bk-stops"></ul>
                </div>
                <dl class="bk-prices">
                  <div><dt>Price per traveller</dt><dd id="bk-price"></dd></div>
                  <div><dt>Travellers</dt><dd id="bk-summary-travellers"></dd></div>
                </dl>
                <div class="bk-total">
                  <span>Estimated total</span>
                  <strong id="bk-total" aria-live="polite"></strong>
                </div>
                <p class="bk-total-note" id="bk-total-note"></p>
              </div>
            </aside>
          </div>

          <footer class="bk-foot">
            <div class="bk-foot__note" data-bk-views="form review">
              <p class="bk-foot__label">Fan-made booking concept</p>
              <p>No real booking or payment will be made.</p>
            </div>
            <div class="bk-foot__actions" data-bk-views="form">
              <button class="bk-btn bk-btn--ghost" type="button" data-bk-cancel>Cancel</button>
              <button class="bk-btn bk-btn--primary" type="submit">Review booking <span aria-hidden="true">&#8594;</span></button>
            </div>
            <div class="bk-foot__actions" data-bk-views="review">
              <button class="bk-btn bk-btn--ghost" type="button" data-bk-edit>Edit details</button>
              <button class="bk-btn bk-btn--primary" type="button" data-bk-confirm>Confirm booking concept</button>
            </div>
            <div class="bk-foot__actions" data-bk-views="done">
              <button class="bk-btn bk-btn--primary" type="button" data-bk-done>Close</button>
            </div>
          </footer>
        </form>
      </div>
    `;
  }

  const overlay = document.createElement("div");
  overlay.className = "bk-overlay";
  overlay.id = "bk-overlay";
  overlay.hidden = true;
  overlay.innerHTML = buildMarkup();
  document.body.appendChild(overlay);

  /* Looks up an element inside the dialog by id. */
  function byId(id) {
    return overlay.querySelector("#" + id);
  }

  const dialog = overlay.querySelector(".bk-dialog");
  const form = byId("bk-form");
  const els = {
    title: byId("bk-title"),
    subtitle: byId("bk-subtitle"),
    destination: byId("bk-destination"),
    date: byId("bk-date"),
    travellers: byId("bk-travellers"),
    first: byId("bk-first"),
    last: byId("bk-last"),
    email: byId("bk-email"),
    phone: byId("bk-phone"),
    notes: byId("bk-notes"),
    ack: byId("bk-ack"),
    img: byId("bk-img"),
    region: byId("bk-region"),
    packageTitle: byId("bk-package-title"),
    duration: byId("bk-duration"),
    desc: byId("bk-desc"),
    stops: byId("bk-stops"),
    price: byId("bk-price"),
    summaryTravellers: byId("bk-summary-travellers"),
    total: byId("bk-total"),
    totalNote: byId("bk-total-note"),
    reviewList: byId("bk-review-list"),
    doneMessage: byId("bk-done-message"),
    reference: byId("bk-reference"),
    saveError: byId("bk-save-error"),
    travellersControl: overlay.querySelector(".bk-stepper")
  };
  const stepButtons = Array.from(overlay.querySelectorAll("[data-bk-step]"));
  els.travellersControl.id = "bk-travellers-control";
  els.travellersControl.tabIndex = -1;
  const validatedFields = [
    els.date,
    els.first,
    els.last,
    els.email,
    els.phone,
    els.travellersControl,
    els.ack
  ];

  /* Formats a number as pesos, such as 25000 to a peso sign and 25,000. */
  function formatPeso(amount) {
    return "₱" + amount.toLocaleString("en-PH");
  }

  /* Returns "traveller" or "travellers" for the given count. */
  function travellerWord(count) {
    return count === 1 ? "traveller" : "travellers";
  }

  /* Builds a YYYY-MM-DD string from a local date, which is the format date inputs use. */
  function toISODate(date) {
    return date.getFullYear() + "-" +
      String(date.getMonth() + 1).padStart(2, "0") + "-" +
      String(date.getDate()).padStart(2, "0");
  }

  /* Returns today in local time so a departure date cannot be set in the past. */
  function todayISO() {
    return toISODate(new Date());
  }

  /* Turns a YYYY-MM-DD value into a readable date without a time zone shift. */
  function formatDate(value) {
    const parts = value.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString("en-PH", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  /* Refreshes the package card, traveller count, and estimated total from the current choices. */
  function updateSummary() {
    const pkg = PACKAGES[state.key];

    dialog.style.setProperty("--bk-accent", pkg.accent);
    els.img.src = pkg.image;
    els.img.alt = pkg.imageAlt;
    els.region.textContent = pkg.name;
    els.packageTitle.textContent = pkg.title;
    els.duration.textContent = pkg.duration;
    els.desc.textContent = pkg.description;
    els.price.textContent = formatPeso(pkg.price);
    els.total.textContent = formatPeso(pkg.price * state.travellers);
    els.travellers.textContent = state.travellers;
    els.summaryTravellers.textContent = state.travellers;
    els.totalNote.textContent = "Package price for " + state.travellers + " " +
      travellerWord(state.travellers) + ". No payment is collected.";

    els.stops.textContent = "";
    pkg.stops.forEach(function (stop) {
      const item = document.createElement("li");
      item.textContent = stop;
      els.stops.appendChild(item);
    });

    stepButtons.forEach(function (button) {
      const step = Number(button.dataset.bkStep);
      const atLimit = step < 0 ? state.travellers <= MIN_TRAVELLERS : state.travellers >= MAX_TRAVELLERS;
      button.setAttribute("aria-disabled", String(atLimit));
    });
  }

  /* Shows only the parts of the dialog that belong to the current step. */
  function setView(name) {
    state.view = name;
    dialog.dataset.view = name;

    overlay.querySelectorAll("[data-bk-views]").forEach(function (element) {
      element.hidden = element.dataset.bkViews.split(" ").indexOf(name) === -1;
    });

    els.title.textContent = VIEW_TEXT[name].title;
    els.subtitle.textContent = VIEW_TEXT[name].subtitle;
    dialog.scrollTop = 0;
  }

  /* Returns an error message for one field, or an empty string when it is valid. */
  function getError(field) {
    const value = typeof field.value === "string" ? field.value.trim() : "";

    if (field === els.date) {
      if (!field.value) {
        return "Choose a departure date.";
      }
      return field.value < todayISO() ? "Choose today or a later departure date." : "";
    }
    if (field === els.first) {
      if (!value) {
        return "Enter your first name.";
      }
      return NAME_PATTERN.test(value) ? "" : "Use letters only for your first name.";
    }
    if (field === els.last) {
      if (!value) {
        return "Enter your last name.";
      }
      return NAME_PATTERN.test(value) ? "" : "Use letters only for your last name.";
    }
    if (field === els.email) {
      if (!value) {
        return "Enter your email address.";
      }
      return EMAIL_PATTERN.test(value) ? "" : "Enter a valid email address, like you@example.com.";
    }
    if (field === els.phone) {
      if (!value) {
        return "Enter your phone number.";
      }
      return PHONE_PATTERN.test(value) ? "" : "Use 09XXXXXXXXX or +639XXXXXXXXX format.";
    }
    if (field === els.travellersControl) {
      return state.travellers >= MIN_TRAVELLERS && state.travellers <= MAX_TRAVELLERS
        ? ""
        : "Choose between 1 and 12 travellers.";
    }
    if (field === els.ack) {
      return field.checked ? "" : "Please tick this box to continue.";
    }
    return "";
  }

  /* Shows or clears the inline error under a field and keeps aria attributes in sync. */
  function setFieldError(field, message) {
    const errorElement = byId(field.id + "-error");
    if (!errorElement) {
      return;
    }

    if (message) {
      errorElement.textContent = message;
      errorElement.hidden = false;
      field.setAttribute("aria-invalid", "true");
      field.setAttribute("aria-describedby", errorElement.id);
    } else {
      errorElement.textContent = "";
      errorElement.hidden = true;
      field.removeAttribute("aria-invalid");
      field.removeAttribute("aria-describedby");
    }
  }

  /* Re-checks a field the visitor is fixing, but only after it has been flagged. */
  function handleFieldEdit(event) {
    const field = event.currentTarget;
    if (field.getAttribute("aria-invalid") === "true") {
      setFieldError(field, getError(field));
    }
  }

  /* Adds one label and value row to the review list. */
  function addReviewRow(label, value, multiline) {
    const row = document.createElement("div");
    const term = document.createElement("dt");
    const description = document.createElement("dd");

    row.className = "bk-review__row";
    term.textContent = label;
    description.textContent = value;
    if (multiline) {
      description.className = "bk-review__multiline";
    }

    row.appendChild(term);
    row.appendChild(description);
    els.reviewList.appendChild(row);
  }

  /* Fills the review step with what the visitor entered. */
  function renderReview() {
    const pkg = PACKAGES[state.key];
    const notes = els.notes.value.trim();

    els.reviewList.textContent = "";
    addReviewRow("Destination", pkg.name);
    addReviewRow("Package", pkg.title);
    addReviewRow("Duration", pkg.duration);
    addReviewRow("Departure", formatDate(els.date.value));
    addReviewRow("Travellers", state.travellers + " " + travellerWord(state.travellers));
    addReviewRow("Lead traveller", els.first.value.trim() + " " + els.last.value.trim());
    addReviewRow("Email", els.email.value.trim());
    addReviewRow("Phone", els.phone.value.trim());
    addReviewRow("Special requests", notes || "None", true);
    addReviewRow("Estimated total", formatPeso(pkg.price * state.travellers));
  }

  /* Reads existing concept bookings and reports storage or data errors in the review step. */
  function readBookings() {
    let storedValue;
    try {
      storedValue = window.localStorage.getItem(BOOKINGS_STORAGE_KEY);
    } catch (error) {
      return {
        bookings: null,
        error: "This browser could not access local storage. No booking was saved."
      };
    }

    if (storedValue === null) {
      return { bookings: [], error: "" };
    }

    let bookings;
    try {
      bookings = JSON.parse(storedValue);
    } catch (error) {
      return {
        bookings: null,
        error: "Saved booking data could not be read. No booking was saved."
      };
    }

    if (!Array.isArray(bookings)) {
      return {
        bookings: null,
        error: "Saved booking data has an unexpected format. No booking was saved."
      };
    }

    return { bookings: bookings, error: "" };
  }

  /* Builds a year-specific reference using the highest matching stored sequence. */
  function createReferenceNumber(bookings, year) {
    const prefix = "TT-" + year + "-";
    const referencePattern = new RegExp("^TT-" + year + "-(\\d+)$");
    let highestNumber = 0;

    bookings.forEach(function (booking) {
      const reference = booking && typeof booking.reference_no === "string"
        ? booking.reference_no
        : "";
      const match = referencePattern.exec(reference);

      if (match) {
        highestNumber = Math.max(highestNumber, Number(match[1]));
      }
    });

    return prefix + String(highestNumber + 1).padStart(4, "0");
  }

  /* Validates the form, then moves to the review step or focuses the first problem. */
  function handleSubmit(event) {
    event.preventDefault();
    if (state.view !== "form") {
      return;
    }

    let firstInvalid = null;
    validatedFields.forEach(function (field) {
      const message = getError(field);
      setFieldError(field, message);
      if (message && !firstInvalid) {
        firstInvalid = field;
      }
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    renderReview();
    els.saveError.textContent = "";
    els.saveError.hidden = true;
    setView("review");
    els.title.focus({ preventScroll: true });
  }

  /* Saves the concept booking locally before displaying its reference number. */
  function handleConfirm() {
    if (state.view !== "review") {
      return;
    }

    const pkg = PACKAGES[state.key];
    const stored = readBookings();
    if (stored.error) {
      els.saveError.textContent = stored.error;
      els.saveError.hidden = false;
      return;
    }

    const createdAt = new Date();
    const referenceNumber = createReferenceNumber(stored.bookings, createdAt.getFullYear());
    const booking = {
      reference_no: referenceNumber,
      package_code: pkg.code,
      nation: pkg.name,
      full_name: els.first.value.trim() + " " + els.last.value.trim(),
      email: els.email.value.trim(),
      contact_number: els.phone.value.trim(),
      travel_date: els.date.value,
      num_guests: state.travellers,
      total_price: pkg.price * state.travellers,
      booking_status: "Pending",
      payment_status: "Unpaid",
      created_at: createdAt.toISOString()
    };

    try {
      window.localStorage.setItem(
        BOOKINGS_STORAGE_KEY,
        JSON.stringify(stored.bookings.concat(booking))
      );
    } catch (error) {
      els.saveError.textContent = "This browser could not save the booking. Please try again.";
      els.saveError.hidden = false;
      return;
    }

    els.saveError.textContent = "";
    els.saveError.hidden = true;
    els.doneMessage.textContent = "Thank you, " + els.first.value.trim() + "! Your " + pkg.name +
      " expedition for " + state.travellers + " " + travellerWord(state.travellers) +
      ", departing " + formatDate(els.date.value) + ", is complete as a concept. " +
      "Nothing was booked, charged, or sent anywhere, because Teyvat Travels is a fan-made project.";
    els.reference.textContent = "Reference number: " + referenceNumber;
    setView("done");
    els.title.focus({ preventScroll: true });
  }

  /* Clears every field and returns the dialog to its first step. */
  function resetForm() {
    form.reset();
    state.travellers = DEFAULT_TRAVELLERS;
    validatedFields.forEach(function (field) {
      setFieldError(field, "");
    });
    els.saveError.textContent = "";
    els.saveError.hidden = true;
    els.reference.textContent = "";
    els.destination.value = state.key;
    updateSummary();
    setView("form");
  }

  /* Makes everything behind the dialog unreachable by keyboard and screen readers. */
  function setBackgroundInert(on) {
    if (on) {
      inertElements = Array.from(document.body.children).filter(function (element) {
        return element !== overlay && element.tagName !== "SCRIPT" && !element.inert;
      });
      inertElements.forEach(function (element) {
        element.inert = true;
      });
    } else {
      inertElements.forEach(function (element) {
        element.inert = false;
      });
      inertElements = [];
    }
  }

  /* Opens the dialog for the destination named on the button that was pressed. */
  function openPanel(trigger) {
    const requested = String(trigger.dataset.bookingDestination || "").toLowerCase();

    lastTrigger = trigger;
    window.clearTimeout(closeTimer);

    if (state.view === "form" && PACKAGES[requested]) {
      state.key = requested;
      els.destination.value = requested;
    }

    els.date.min = todayISO();
    updateSummary();

    setBackgroundInert(true);
    document.documentElement.classList.add("bk-lock");
    overlay.hidden = false;
    window.requestAnimationFrame(function () {
      overlay.classList.add("is-open");
      (state.view === "form" ? els.destination : els.title).focus({ preventScroll: true });
    });
  }

  /* Closes the dialog and returns focus to the button that opened it. */
  function closePanel(reset) {
    overlay.classList.remove("is-open");
    setBackgroundInert(false);
    document.documentElement.classList.remove("bk-lock");

    if (reset) {
      resetForm();
    }

    if (lastTrigger) {
      lastTrigger.focus();
    }

    closeTimer = window.setTimeout(function () {
      overlay.hidden = true;
    }, CLOSE_DELAY);
  }

  /* Lists the focusable controls that are currently visible inside the dialog. */
  function getFocusable() {
    const selector = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return Array.from(dialog.querySelectorAll(selector)).filter(function (element) {
      return element.getClientRects().length > 0;
    });
  }

  /* Handles Escape, and keeps Tab cycling inside the open dialog. */
  function handleKeyDown(event) {
    if (overlay.hidden || !overlay.classList.contains("is-open")) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closePanel(state.view === "done");
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusable = getFocusable();
    if (focusable.length === 0) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (!dialog.contains(active)) {
      event.preventDefault();
      first.focus();
    } else if (event.shiftKey && (active === first || active === dialog || active === els.title)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* Routes clicks on the dialog's buttons by their data attributes. */
  function handleOverlayClick(event) {
    const stepButton = event.target.closest("[data-bk-step]");

    if (stepButton) {
      const next = state.travellers + Number(stepButton.dataset.bkStep);
      if (next >= MIN_TRAVELLERS && next <= MAX_TRAVELLERS) {
        state.travellers = next;
        updateSummary();
        if (els.travellersControl.getAttribute("aria-invalid") === "true") {
          setFieldError(els.travellersControl, getError(els.travellersControl));
        }
      }
      return;
    }

    if (event.target.closest("[data-bk-cancel], [data-bk-done]")) {
      closePanel(true);
    } else if (event.target.closest("[data-bk-close]")) {
      closePanel(state.view === "done");
    } else if (event.target.closest("[data-bk-edit]")) {
      setView("form");
      els.destination.focus();
    } else if (event.target.closest("[data-bk-confirm]")) {
      handleConfirm();
    }
  }

  /* Switches the package card when another destination is chosen. */
  function handleDestinationChange() {
    state.key = els.destination.value;
    updateSummary();
  }

  /* Wires everything up. */
  function initialize() {
    const firstRequested = String(triggers[0].dataset.bookingDestination || "").toLowerCase();
    if (PACKAGES[firstRequested]) {
      state.key = firstRequested;
    }

    els.destination.value = state.key;
    els.date.min = todayISO();
    updateSummary();
    setView("form");

    triggers.forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        openPanel(trigger);
      });
    });

    overlay.addEventListener("click", handleOverlayClick);
    els.destination.addEventListener("change", handleDestinationChange);
    form.addEventListener("submit", handleSubmit);
    document.addEventListener("keydown", handleKeyDown);

    validatedFields.forEach(function (field) {
      field.addEventListener("input", handleFieldEdit);
      field.addEventListener("change", handleFieldEdit);
    });
  }

  /* Runs after the deferred document has been parsed. */
  initialize();
})();