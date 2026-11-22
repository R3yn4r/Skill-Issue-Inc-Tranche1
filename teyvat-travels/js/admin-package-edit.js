/* Edit package page (admin-package-edit.html).
   Open it as admin-package-edit.html?code=MOND-01 to edit a package, or ?new=1 to add one.
   Validation mirrors the tour_packages data dictionary, so a value that passes here also fits the
   database column. The server has to repeat every check, because JavaScript can be bypassed. */
(function () {
  "use strict";

  const data = window.TTAdmin.data;
  const ui = window.TTAdmin.ui;
  const el = ui.el;

  const form = document.getElementById("ep-form");
  if (!form) {
    return;
  }

  /* Limits taken from the data dictionary. */
  const LIMITS = {
    code: /^[A-Z]{4}-\d{2}$/,   /* package_code VARCHAR(10), such as MOND-01 */
    nameMax: 100,                /* package_name VARCHAR(100) */
    descMax: 2000,               /* description TEXT: capped so one package stays readable */
    stopsMax: 500,               /* featured_stops TEXT, comma-separated */
    daysMax: 30,
    groupMax: 100,
    priceMax: 99999999.99        /* base_price DECIMAL(10,2) */
  };

  const params = new URLSearchParams(window.location.search);
  const requestedCode = params.get("code") || "";
  const isNewRequest = params.has("new") || !requestedCode;

  let original = isNewRequest ? null : data.getPackage(requestedCode);
  let currentStatus = original ? original.status : "Active";
  let codeEdited = false;
  let dirty = false;

  const els = {
    nation: document.getElementById("ep-nation"),
    code: document.getElementById("ep-code"),
    name: document.getElementById("ep-name"),
    desc: document.getElementById("ep-desc"),
    stops: document.getElementById("ep-stops"),
    days: document.getElementById("ep-days"),
    nights: document.getElementById("ep-nights"),
    price: document.getElementById("ep-price"),
    max: document.getElementById("ep-max"),
    codeHint: document.getElementById("ep-code-hint"),
    title: document.getElementById("ep-title"),
    crumb: document.getElementById("ep-crumb-code"),
    layout: document.getElementById("ep-layout"),
    missing: document.getElementById("ep-missing"),
    save: document.getElementById("ep-save"),
    cancel: document.getElementById("ep-cancel"),
    img: document.getElementById("ep-img"),
    kicker: document.getElementById("ep-kicker"),
    ptitle: document.getElementById("ep-ptitle"),
    pprice: document.getElementById("ep-pprice"),
    pmeta: document.getElementById("ep-pmeta"),
    pstops: document.getElementById("ep-pstops"),
    dates: document.getElementById("ep-dates"),
    datesNote: document.getElementById("ep-dates-note"),
    manage: document.getElementById("ep-manage"),
    pill: document.getElementById("ep-status-pill"),
    pubText: document.getElementById("ep-pub-text"),
    toggle: document.getElementById("ep-toggle"),
    remove: document.getElementById("ep-delete"),
    pubMsg: document.getElementById("ep-pub-msg")
  };
  const fields = [els.nation, els.code, els.name, els.desc, els.stops, els.days, els.nights, els.price, els.max];

  /* ------------------------------------------------------------------
     Reading and checking the form
     ------------------------------------------------------------------ */

  /* Splits the featured stops text into a clean list. */
  function parseStops(text) {
    return text.split(",").map(function (stop) {
      return stop.trim();
    }).filter(Boolean);
  }

  /* Reads a whole number from text, or returns NaN. */
  function parseWhole(text) {
    const value = text.trim();
    return /^\d+$/.test(value) ? parseInt(value, 10) : NaN;
  }

  /* Reads a price such as "12,500.00", or returns NaN. Allows at most two decimals. */
  function parsePrice(text) {
    const value = text.replace(/[,\s]/g, "");
    return /^\d+(\.\d{1,2})?$/.test(value) ? parseFloat(value) : NaN;
  }

  /* Returns an error message for one field, or an empty string when it is valid. */
  function getError(field) {
    const value = field.value.trim();

    if (field === els.nation) {
      return data.NATIONS.indexOf(field.value) === -1 ? "Choose a nation." : "";
    }
    if (field === els.code) {
      const code = value.toUpperCase();
      if (!code) {
        return "Enter a package code.";
      }
      if (!LIMITS.code.test(code)) {
        return "Use four letters, a dash and two digits, like MOND-01.";
      }
      const prefix = data.PREFIX[els.nation.value];
      if (prefix && code.slice(0, 4) !== prefix) {
        return "The code for " + els.nation.value + " starts with " + prefix + ".";
      }
      const other = data.getPackage(code);
      if (other && (!original || other.package_id !== original.package_id)) {
        return "That package code is already used by another package.";
      }
      return "";
    }
    if (field === els.name) {
      if (!value) {
        return "Enter the package name.";
      }
      return value.length > LIMITS.nameMax ? "Keep the name to " + LIMITS.nameMax + " characters or fewer." : "";
    }
    if (field === els.desc) {
      if (!value) {
        return "Enter a short description.";
      }
      return value.length > LIMITS.descMax ? "Keep the description to " + LIMITS.descMax + " characters or fewer." : "";
    }
    if (field === els.stops) {
      if (parseStops(field.value).length === 0) {
        return "List at least one featured stop, separated by commas.";
      }
      return value.length > LIMITS.stopsMax ? "Keep the stops to " + LIMITS.stopsMax + " characters or fewer." : "";
    }
    if (field === els.days) {
      const days = parseWhole(field.value);
      if (isNaN(days) || days < 1 || days > LIMITS.daysMax) {
        return "Enter the number of days, from 1 to " + LIMITS.daysMax + ".";
      }
      return "";
    }
    if (field === els.nights) {
      const nights = parseWhole(field.value);
      const days = parseWhole(els.days.value);
      if (isNaN(nights) || nights > LIMITS.daysMax) {
        return "Enter the number of nights, from 0 to " + LIMITS.daysMax + ".";
      }
      if (!isNaN(days) && nights > days) {
        return "Nights cannot be more than days.";
      }
      return "";
    }
    if (field === els.price) {
      const price = parsePrice(field.value);
      if (isNaN(price) || price <= 0) {
        return "Enter a price above zero, like 12,500.00.";
      }
      return price > LIMITS.priceMax ? "That price is too large." : "";
    }
    if (field === els.max) {
      const max = parseWhole(field.value);
      if (isNaN(max) || max < 1 || max > LIMITS.groupMax) {
        return "Enter a group size from 1 to " + LIMITS.groupMax + ".";
      }
      return "";
    }
    return "";
  }

  /* Shows or clears the inline error under a field and keeps the aria attributes in sync. */
  function setFieldError(field, message) {
    const errorElement = document.getElementById(field.id + "-error");
    if (!errorElement) {
      return;
    }
    const describedBy = field === els.code ? field.id + "-hint " + errorElement.id : errorElement.id;

    if (message) {
      errorElement.textContent = message;
      errorElement.hidden = false;
      field.setAttribute("aria-invalid", "true");
      field.setAttribute("aria-describedby", describedBy);
    } else {
      errorElement.textContent = "";
      errorElement.hidden = true;
      field.removeAttribute("aria-invalid");
      if (field === els.code) {
        field.setAttribute("aria-describedby", field.id + "-hint");
      } else {
        field.removeAttribute("aria-describedby");
      }
    }
  }

  /* ------------------------------------------------------------------
     Filling the form and the live preview
     ------------------------------------------------------------------ */

  /* Adds the seven nations to the select. A new package also gets a "Select a nation" first option. */
  function fillNations() {
    if (!original) {
      const placeholder = el("option", "", "Select a nation");
      placeholder.value = "";
      els.nation.appendChild(placeholder);
    }
    data.NATIONS.forEach(function (nation) {
      const option = el("option", "", nation);
      option.value = nation;
      els.nation.appendChild(option);
    });
  }

  /* Puts a saved package into the form fields. */
  function fillForm(pkg) {
    els.nation.value = pkg.nation;
    els.code.value = pkg.package_code;
    els.name.value = pkg.package_name;
    els.desc.value = pkg.description;
    els.stops.value = pkg.featured_stops;
    els.days.value = pkg.duration_days;
    els.nights.value = pkg.duration_nights;
    els.price.value = pkg.base_price.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    els.max.value = pkg.max_group_size;
  }

  /* Redraws the preview card from whatever is typed right now. Invalid numbers show a dash. */
  function updatePreview() {
    const nation = els.nation.value;
    const price = parsePrice(els.price.value);
    const days = parseWhole(els.days.value);
    const nights = parseWhole(els.nights.value);
    const max = parseWhole(els.max.value);

    els.img.src = data.IMAGES[nation] || "";
    els.img.alt = nation ? "Preview image for " + nation : "";
    els.img.hidden = !nation;
    els.kicker.textContent = (nation || "No nation selected") + " • Public preview";
    els.ptitle.textContent = els.name.value.trim() || "Untitled package";
    els.pprice.textContent = (isNaN(price) ? "₱—" : data.formatPeso(price)) + " / person";
    els.pmeta.textContent = (isNaN(days) ? "–" : days) + " Days / " + (isNaN(nights) ? "–" : nights) + " Nights · Up to " +
      (isNaN(max) ? "–" : max) + " guests";

    els.pstops.textContent = "";
    parseStops(els.stops.value).forEach(function (stop) {
      els.pstops.appendChild(el("li", "", stop));
    });
  }

  /* Shows the scheduled departure dates for a saved package. */
  function renderDates() {
    els.dates.textContent = "";

    if (!original) {
      els.datesNote.textContent = "Save the package first, then schedule its departure dates.";
      els.manage.hidden = true;
      return;
    }

    els.manage.hidden = false;
    els.manage.href = "availability.html?code=" + encodeURIComponent(original.package_code);
    els.datesNote.textContent = "Schedule departures and manage date-specific closures.";

    const departures = data.getDepartures(original.package_code);
    if (departures.length === 0) {
      els.dates.appendChild(el("p", "ad-hint", "No departures scheduled yet."));
      return;
    }
    departures.forEach(function (item) {
      els.dates.appendChild(el("span", "ad-date-chip", data.formatDate(item.travel_date, false)));
    });
  }

  /* Updates the heading, breadcrumb and cancel link for new versus saved packages. */
  function renderHeading() {
    els.title.textContent = original ? "Edit tour package" : "Add tour package";
    els.crumb.textContent = original ? original.package_code : "New";
    document.title = (original ? "Edit " + original.package_code : "Add package") + " | Teyvat Travels Admin";
  }

  /* Updates the Publication card: status pill, button labels and which buttons work. */
  function renderPublication() {
    const active = currentStatus === "Active";
    els.pill.textContent = currentStatus;
    els.pill.className = "ad-pill" + (active ? "" : " ad-pill--off");
    els.pubText.textContent = active
      ? "Active packages appear on the public website."
      : "Inactive packages are hidden from the public website.";
    els.toggle.textContent = active ? "Deactivate" : "Activate";
    els.toggle.disabled = !original;
    els.remove.disabled = !original;

    /* The code cannot change once bookings point at it, so booking records stay linked. */
    const locked = Boolean(original) && data.countBookingsFor(original.package_code) > 0;
    els.code.readOnly = locked;
    els.codeHint.textContent = locked
      ? "Locked because this package already has bookings."
      : "Four-letter nation prefix and a number, like MOND-01.";
  }

  /* ------------------------------------------------------------------
     Events
     ------------------------------------------------------------------ */

  /* Re-checks a field the admin is fixing, but only once it has been flagged. */
  function handleInput(event) {
    const field = event.currentTarget;
    dirty = true;

    if (field === els.code) {
      codeEdited = true;
    }
    if (field === els.nation && !original && !codeEdited && field.value) {
      els.code.value = data.nextPackageCode(field.value);
    }
    if (field.getAttribute("aria-invalid") === "true") {
      setFieldError(field, getError(field));
    }
    /* The nation, code and nights rules depend on each other. */
    if (field === els.nation && els.code.getAttribute("aria-invalid") === "true") {
      setFieldError(els.code, getError(els.code));
    }
    if (field === els.days && els.nights.getAttribute("aria-invalid") === "true") {
      setFieldError(els.nights, getError(els.nights));
    }
    updatePreview();
  }

  /* Tidies the price into 12,500.00 form when the admin leaves the field. */
  function handlePriceBlur() {
    const price = parsePrice(els.price.value);
    if (!isNaN(price)) {
      els.price.value = price.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  }

  /* Validates everything, saves, and stays on the page with a confirmation. */
  function handleSubmit(event) {
    event.preventDefault();

    let firstInvalid = null;
    fields.forEach(function (field) {
      const message = getError(field);
      setFieldError(field, message);
      if (message && !firstInvalid) {
        firstInvalid = field;
      }
    });

    if (firstInvalid) {
      firstInvalid.focus();
      ui.toast("Please fix the highlighted fields.", true);
      return;
    }

    const pkg = {
      package_code: els.code.value.trim().toUpperCase(),
      nation: els.nation.value,
      package_name: els.name.value.trim(),
      description: els.desc.value.trim(),
      featured_stops: parseStops(els.stops.value).join(", "),
      duration_days: parseWhole(els.days.value),
      duration_nights: parseWhole(els.nights.value),
      base_price: Math.round(parsePrice(els.price.value) * 100) / 100,
      max_group_size: parseWhole(els.max.value),
      status: currentStatus
    };

    const result = data.savePackage(pkg, original ? original.package_code : "");
    if (!result.ok) {
      setFieldError(els.code, result.error);
      els.code.focus();
      return;
    }

    const wasNew = !original;
    original = result.package;
    dirty = false;
    els.code.value = original.package_code;
    handlePriceBlur();
    renderHeading();
    renderPublication();
    renderDates();
    updatePreview();
    window.history.replaceState(null, "", "admin-package-edit.html?code=" + encodeURIComponent(original.package_code));
    ui.toast(wasNew ? "Package added." : "Changes saved.");
  }

  /* Cancel goes back to the list, asking first if there are unsaved changes. */
  function handleCancel(event) {
    if (!dirty) {
      return;
    }
    event.preventDefault();
    ui.confirm({
      title: "Discard changes?",
      message: "You have unsaved changes. If you leave now they will be lost.",
      confirmLabel: "Discard changes",
      danger: true
    }).then(function (ok) {
      if (ok) {
        dirty = false;
        window.location.href = els.cancel.href;
      }
    });
  }

  /* Deactivate hides the package from the website. Activate shows it again. */
  function handleToggle() {
    if (!original) {
      return;
    }
    const goingInactive = currentStatus === "Active";

    function apply() {
      currentStatus = goingInactive ? "Inactive" : "Active";
      data.setPackageStatus(original.package_code, currentStatus);
      original.status = currentStatus;
      renderPublication();
      ui.toast(goingInactive ? "Package deactivated." : "Package activated.");
    }

    if (!goingInactive) {
      apply();
      return;
    }
    ui.confirm({
      title: "Deactivate this package?",
      message: "It will be hidden from the public website. Existing bookings are not affected, and you can activate it again at any time.",
      confirmLabel: "Deactivate"
    }).then(function (ok) {
      if (ok) {
        apply();
      }
    });
  }

  /* Delete removes the package for good, but never one that already has bookings. */
  function handleDelete() {
    if (!original) {
      return;
    }
    const bookings = data.countBookingsFor(original.package_code);
    els.pubMsg.hidden = true;

    if (bookings > 0) {
      els.pubMsg.textContent = "This package has " + bookings + (bookings === 1 ? " booking" : " bookings") +
        " and cannot be deleted. Deactivate it instead.";
      els.pubMsg.hidden = false;
      return;
    }

    ui.confirm({
      title: "Delete this package?",
      message: "\"" + original.package_name + "\" will be removed permanently. This cannot be undone.",
      confirmLabel: "Delete package",
      danger: true
    }).then(function (ok) {
      if (!ok) {
        return;
      }
      const result = data.deletePackage(original.package_code);
      if (result.ok) {
        dirty = false;
        ui.flash("Package deleted.");
        window.location.href = "admin-packages.html";
      }
    });
  }

  /* ------------------------------------------------------------------
     Start-up
     ------------------------------------------------------------------ */
  if (!isNewRequest && !original) {
    /* The link pointed at a code that does not exist. */
    els.layout.hidden = true;
    els.missing.hidden = false;
    document.getElementById("ep-actions").hidden = true;
    els.title.textContent = "Package not found";
    return;
  }

  fillNations();
  if (original) {
    fillForm(original);
  } else {
    els.days.value = 3;
    els.nights.value = 2;
  }
  renderHeading();
  renderPublication();
  renderDates();
  updatePreview();

  fields.forEach(function (field) {
    field.addEventListener("input", handleInput);
    field.addEventListener("change", handleInput);
  });
  els.price.addEventListener("blur", handlePriceBlur);
  form.addEventListener("submit", handleSubmit);
  els.save.addEventListener("click", function () {
    form.requestSubmit();
  });
  els.cancel.addEventListener("click", handleCancel);
  els.toggle.addEventListener("click", handleToggle);
  els.remove.addEventListener("click", handleDelete);

  /* Browser warning if the tab is closed with unsaved edits. */
  window.addEventListener("beforeunload", function (event) {
    if (dirty) {
      event.preventDefault();
      event.returnValue = "";
    }
  });
})();
