/* Bookings page (#/admin-bookings): summary strip, filters, table, detail dialog, and booking creation.
   Rendered inside view-admin-bookings in index.html.
   Depends on: window.TTAdminBookingsData (admin-bookings-data.js),
               window.TTAdminAvailability (admin-availability.js). */
(function () {
  "use strict";

  /* Module-level state. */
  var packages = [];           // current packages array passed in by app.js
  var filteredBookings = [];   // the last filtered + sorted list, used by CSV export
  var selectedReference = "";  // reference of the booking open in the detail dialog
  var sortKey = "createdAt";   // current sort column
  var sortAsc = false;         // true = ascending
  var toastTimer = null;
  var isBound = false;

  /* =========================================================
     Helpers
     ========================================================= */

  /* Returns document.getElementById(id). Used throughout this file. */
  function byId(id) {
    return document.getElementById(id);
  }

  /* Returns the shared bookings-data API, throwing if unavailable. */
  function data() {
    if (!window.TTAdminBookingsData) {
      throw new Error("Booking data is unavailable.");
    }
    return window.TTAdminBookingsData;
  }

  /* Escapes a value for safe insertion into HTML. Used wherever innerHTML is built. */
  function escHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /* =========================================================
     Package helpers
     ========================================================= */

  /* Canonical id string for a package object. Handles both app.js (id) and admin-data.js (package_id) shapes. */
  function packageId(pkg) {
    return String(pkg.id !== undefined ? pkg.id : pkg.package_id);
  }

  /* Finds a package object by its id string, or returns null. Called when rendering rows and the detail dialog. */
  function packageFor(id) {
    return packages.find(function (pkg) {
      return packageId(pkg) === String(id);
    }) || null;
  }

  /* Returns a readable title for a package, falling back gracefully. */
  function packageName(pkg) {
    return pkg ? (pkg.title || pkg.package_name || "Package unavailable") : "Package unavailable";
  }

  /* Returns the nation name for a package. */
  function packageNation(pkg) {
    return pkg ? (pkg.nation || "") : "";
  }

  /* Returns the package code, falling back to the id if no code is stored. */
  function packageCode(pkg, fallback) {
    return pkg ? (pkg.packageCode || pkg.package_code || packageId(pkg)) : fallback;
  }

  /* Returns the per-person base price as a number, or null if unavailable. */
  function packagePrice(pkg) {
    if (!pkg) { return null; }
    var rawPrice = pkg.price !== undefined ? pkg.price : pkg.base_price;
    if (rawPrice === null || rawPrice === "") { return null; }
    var price = Number(rawPrice);
    return Number.isFinite(price) && price >= 0 ? price : null;
  }

  /* =========================================================
     Booking helpers
     ========================================================= */

  /* Calculates the total for a booking, using the live package price when available. */
  function totalFor(booking, pkg) {
    var price = packagePrice(pkg);
    return price === null ? booking.total : price * booking.guests;
  }

  /* Formats a number as Philippine peso, e.g. ₱25,000. */
  function formatPeso(amount) {
    return "₱" + Number(amount).toLocaleString("en-PH", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }

  /* Formats a YYYY-MM-DD string as a readable date without time zone shifting.
     longMonth=true gives "December", false gives "Dec". */
  function formatDate(value, longMonth) {
    if (!value) { return "—"; }
    var parts = value.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: longMonth ? "long" : "short",
      year: "numeric"
    });
  }

  /* Formats an ISO-8601 timestamp (createdAt) as a short readable date. */
  function formatCreatedAt(iso) {
    if (!iso) { return "—"; }
    var d = new Date(iso);
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric"
    });
  }

  /* =========================================================
     Summary strip (above filters)
     Renders total, pending, confirmed counts and confirmed revenue.
     Visible at the top of the Bookings view (#/admin-bookings).
     ========================================================= */

  /* Updates the four stat cells in the summary strip from the full (unfiltered) bookings list. */
  function renderStrip(bookings) {
    var pending = 0;
    var confirmed = 0;
    var revenue = 0;
    bookings.forEach(function (booking) {
      var status = booking.bookingStatus;
      if (status === "Pending") { pending += 1; }
      if (status === "Confirmed") {
        confirmed += 1;
        var pkg = packageFor(booking.packageId);
        revenue += totalFor(booking, pkg);
      }
    });
    var totalEl = byId("strip-total");
    var pendingEl = byId("strip-pending");
    var confirmedEl = byId("strip-confirmed");
    var revenueEl = byId("strip-revenue");
    if (totalEl) { totalEl.textContent = String(bookings.length); }
    if (pendingEl) { pendingEl.textContent = String(pending); }
    if (confirmedEl) { confirmedEl.textContent = String(confirmed); }
    if (revenueEl) { revenueEl.textContent = formatPeso(revenue); }
  }

  /* =========================================================
     Sorting
     ========================================================= */

  /* Comparator for a single column value; falls back to string comparison. */
  function compareValues(a, b) {
    if (typeof a === "number" && typeof b === "number") { return a - b; }
    return String(a).localeCompare(String(b));
  }

  /* Sorts the bookings array by the current sortKey / sortAsc combination.
     Default: newest first (sortKey="createdAt", sortAsc=false). */
  function sortedBookings(bookings) {
    return bookings.slice().sort(function (a, b) {
      var aVal, bVal;
      if (sortKey === "createdAt") {
        aVal = Date.parse(a.createdAt);
        bVal = Date.parse(b.createdAt);
      } else if (sortKey === "total") {
        var aPkg = packageFor(a.packageId);
        var bPkg = packageFor(b.packageId);
        aVal = totalFor(a, aPkg);
        bVal = totalFor(b, bPkg);
      } else if (sortKey === "guests") {
        aVal = a.guests;
        bVal = b.guests;
      } else if (sortKey === "travelDate") {
        aVal = a.travelDate;
        bVal = b.travelDate;
      } else if (sortKey === "client") {
        aVal = a.client;
        bVal = b.client;
      } else {
        aVal = a[sortKey] || "";
        bVal = b[sortKey] || "";
      }
      var cmp = compareValues(aVal, bVal);
      return sortAsc ? cmp : -cmp;
    });
  }

  /* =========================================================
     Filters
     ========================================================= */

  /* Reads all current filter control values and returns a plain object. */
  function currentFilters() {
    return {
      search:    byId("bookings-search") ? byId("bookings-search").value.trim().toLowerCase() : "",
      status:    byId("bookings-status") ? byId("bookings-status").value : "all",
      packageId: byId("bookings-package") ? byId("bookings-package").value : "all",
      date:      byId("bookings-date")    ? byId("bookings-date").value : "all",
      dateFrom:  byId("bookings-date-from") ? byId("bookings-date-from").value : "",
      dateTo:    byId("bookings-date-to")   ? byId("bookings-date-to").value : ""
    };
  }

  /* Applies all active filters to the full bookings list and returns the matching subset. */
  function filteredRows(bookings) {
    var f = currentFilters();
    return sortedBookings(bookings).filter(function (booking) {
      if (f.status !== "all" && booking.bookingStatus !== f.status) { return false; }
      if (f.packageId !== "all" && booking.packageId !== f.packageId) { return false; }
      if (f.date !== "all" && booking.travelDate !== f.date) { return false; }
      if (f.dateFrom && booking.travelDate < f.dateFrom) { return false; }
      if (f.dateTo   && booking.travelDate > f.dateTo)   { return false; }
      if (f.search) {
        var target = (booking.client + " " + (booking.email || "") + " " + booking.reference).toLowerCase();
        if (target.indexOf(f.search) < 0) { return false; }
      }
      return true;
    });
  }

  /* Rebuilds the travel-date <select> grouped by month, preserving the current selection if still valid. */
  function renderDateOptions(bookings) {
    var select = byId("bookings-date");
    if (!select) { return; }
    var previous = select.value;
    var dates = Array.from(new Set(bookings.map(function (b) { return b.travelDate; }))).sort();
    var groups = [];
    dates.forEach(function (date) {
      var parts = date.split("-").map(Number);
      var monthDate = new Date(parts[0], parts[1] - 1, 1);
      var key = date.slice(0, 7);
      var group = groups.find(function (g) { return g.key === key; });
      if (!group) {
        group = {
          key: key,
          label: monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
          dates: []
        };
        groups.push(group);
      }
      group.dates.push(date);
    });
    select.innerHTML = '<option value="all">All travel dates</option>' +
      groups.map(function (group) {
        return '<optgroup label="' + escHtml(group.label) + '">' +
          group.dates.map(function (date) {
            return '<option value="' + escHtml(date) + '">' + formatDate(date, false) + '</option>';
          }).join("") + '</optgroup>';
      }).join("");
    if (dates.indexOf(previous) >= 0) { select.value = previous; }
  }

  /* Rebuilds the package <select> from the current packages array.
     Visible in the filter bar on the Bookings view (#/admin-bookings). */
  function renderPackageOptions() {
    var select = byId("bookings-package");
    if (!select) { return; }
    var previous = select.value;
    select.innerHTML = '<option value="all">All packages</option>' +
      packages.map(function (pkg) {
        return '<option value="' + escHtml(packageId(pkg)) + '">' +
          escHtml(packageNation(pkg) || packageName(pkg)) + '</option>';
      }).join("");
    var ids = packages.map(packageId);
    if (ids.indexOf(previous) >= 0) { select.value = previous; }
  }

  /* =========================================================
     Table row rendering
     ========================================================= */

  /* Creates a <td> with text content and an optional CSS class. */
  function createTextCell(text, className) {
    var cell = document.createElement("td");
    if (className) { cell.className = className; }
    cell.textContent = text;
    return cell;
  }

  /* Returns the CSS class string for a booking status pill. */
  function statusClass(status) {
    if (status === "Pending")   { return "ad-pill ad-pill--pending"; }
    if (status === "Rejected")  { return "ad-pill ad-pill--bad"; }
    if (status === "Cancelled") { return "ad-pill ad-pill--off"; }
    return "ad-pill";
  }

  /* Builds and returns a <tr> element for one booking.
     Columns: client/reference, package, travel date, guests, total, booking status, payment, action.
     Visible in the bookings table on the Bookings view (#/admin-bookings). */
  function renderRow(booking) {
    var pkg = packageFor(booking.packageId);
    var row = document.createElement("tr");

    var clientCell = document.createElement("td");
    clientCell.setAttribute("data-label", "Client");
    var client = document.createElement("p");
    client.className = "ad-cell-strong";
    client.textContent = booking.client;
    var reference = document.createElement("p");
    reference.className = "ad-cell-sub";
    reference.textContent = booking.reference;
    clientCell.appendChild(client);
    clientCell.appendChild(reference);
    row.appendChild(clientCell);

    var packageCell = document.createElement("td");
    packageCell.setAttribute("data-label", "Package");
    var nation = document.createElement("p");
    nation.className = "ad-cell-strong bookings-package-nation";
    nation.textContent = packageNation(pkg) || packageName(pkg);
    var code = document.createElement("p");
    code.className = "ad-cell-sub";
    code.textContent = packageCode(pkg, booking.packageId);
    packageCell.appendChild(nation);
    packageCell.appendChild(code);
    row.appendChild(packageCell);

    var dateCell = createTextCell(formatDate(booking.travelDate, false), "ad-cell-small");
    dateCell.setAttribute("data-label", "Travel date");
    row.appendChild(dateCell);

    var guestsCell = createTextCell(String(booking.guests));
    guestsCell.setAttribute("data-label", "Guests");
    row.appendChild(guestsCell);

    var totalCell = createTextCell(formatPeso(totalFor(booking, pkg)), "bookings-total");
    totalCell.setAttribute("data-label", "Total");
    row.appendChild(totalCell);

    var bookingStatusCell = document.createElement("td");
    bookingStatusCell.setAttribute("data-label", "Booking");
    var pill = document.createElement("span");
    pill.className = statusClass(booking.bookingStatus);
    pill.textContent = booking.bookingStatus;
    bookingStatusCell.appendChild(pill);
    row.appendChild(bookingStatusCell);

    var paymentCell = document.createElement("td");
    paymentCell.setAttribute("data-label", "Payment");
    var isTerminal = booking.bookingStatus === "Rejected" ||
                     booking.bookingStatus === "Cancelled";
    if (isTerminal) {
      paymentCell.textContent = "—";
      paymentCell.className = "ad-cell-small";
    } else {
      paymentCell.textContent = booking.paymentStatus;
      paymentCell.className = booking.paymentStatus === "Paid"
        ? "bookings-payment bookings-payment--paid"
        : "bookings-payment bookings-payment--pending";
    }
    row.appendChild(paymentCell);

    var actionCell = document.createElement("td");
    actionCell.setAttribute("data-label", "Action");
    var viewButton = document.createElement("button");
    viewButton.className = "ad-link bookings-view-button";
    viewButton.type = "button";
    viewButton.dataset.reference = booking.reference;
    viewButton.textContent = "View →";
    actionCell.appendChild(viewButton);
    row.appendChild(actionCell);
    return row;
  }

  /* =========================================================
     Sort headers
     ========================================================= */

  /* Updates aria-sort on all sortable <th> elements to reflect the current sort state.
     Called from render() after the sort key or direction changes. */
  function updateSortHeaders() {
    var headers = document.querySelectorAll("#view-admin-bookings .bookings-table th[data-sort]");
    for (var i = 0; i < headers.length; i++) {
      var th = headers[i];
      var key = th.getAttribute("data-sort");
      if (key === sortKey) {
        th.setAttribute("aria-sort", sortAsc ? "ascending" : "descending");
      } else {
        th.setAttribute("aria-sort", "none");
      }
    }
  }

  /* =========================================================
     Main render
     ========================================================= */

  /* Reads all bookings from storage, applies filters, and re-renders the full bookings view.
     Visible on the Bookings view (#/admin-bookings). */
  function render() {
    var bookings;
    try {
      bookings = data().getBookings();
    } catch (error) {
      byId("bookings-table-wrap").hidden = true;
      byId("bookings-empty").hidden = true;
      byId("bookings-filter-empty").hidden = true;
      var errEl = byId("bookings-storage-error");
      if (errEl) { errEl.textContent = error.message; errEl.hidden = false; }
      byId("bookings-search").disabled = true;
      byId("bookings-status").disabled = true;
      byId("bookings-date").disabled = true;
      byId("bookings-export").disabled = true;
      return;
    }

    var errEl2 = byId("bookings-storage-error");
    if (errEl2) { errEl2.hidden = true; }

    renderStrip(bookings);
    renderDateOptions(bookings);
    renderPackageOptions();
    updateSortHeaders();

    var current = filteredRows(bookings);
    filteredBookings = current;
    var noBookings = bookings.length === 0;
    var noMatches = !noBookings && current.length === 0;

    var rows = byId("bookings-rows");
    rows.textContent = "";
    current.forEach(function (booking) {
      rows.appendChild(renderRow(booking));
    });

    var hasFilters = byId("bookings-search").value.trim() ||
                     byId("bookings-status").value !== "all" ||
                     (byId("bookings-package") && byId("bookings-package").value !== "all") ||
                     byId("bookings-date").value !== "all" ||
                     (byId("bookings-date-from") && byId("bookings-date-from").value) ||
                     (byId("bookings-date-to") && byId("bookings-date-to").value);

    byId("bookings-search").disabled = noBookings;
    byId("bookings-status").disabled = noBookings;
    byId("bookings-date").disabled   = noBookings;
    if (byId("bookings-package")) { byId("bookings-package").disabled = noBookings; }
    if (byId("bookings-date-from")) { byId("bookings-date-from").disabled = noBookings; }
    if (byId("bookings-date-to"))   { byId("bookings-date-to").disabled   = noBookings; }
    byId("bookings-export").disabled = current.length === 0;
    byId("bookings-add").disabled    = packages.length === 0;
    byId("bookings-table-wrap").hidden = noBookings || noMatches;

    var emptyEl = byId("bookings-empty");
    if (emptyEl) {
      emptyEl.hidden = !noBookings;
      if (noBookings) {
        emptyEl.innerHTML = 'No bookings yet. <a class="ad-link" href="index.html#packages">View packages ↗</a>';
      }
    }
    byId("bookings-filter-empty").hidden = !noMatches;

    var countEl = byId("bookings-count");
    if (countEl) {
      countEl.textContent = current.length === bookings.length
        ? "Showing " + current.length + " booking" + (current.length !== 1 ? "s" : "")
        : "Showing " + current.length + " of " + bookings.length + " bookings";
    }

    var summaryEl = byId("bookings-summary");
    if (summaryEl) {
      var pending = bookings.filter(function (b) { return b.bookingStatus === "Pending"; }).length;
      var confirmed = bookings.filter(function (b) { return b.bookingStatus === "Confirmed"; }).length;
      summaryEl.textContent = hasFilters
        ? current.length + " of " + bookings.length + " shown"
        : bookings.length + " total · " + pending + " pending · " + confirmed + " confirmed";
    }
  }

  /* =========================================================
     Toast
     ========================================================= */

  /* Shows a temporary notification at the bottom right of the screen.
     isError=true applies error styling. Visible on the Bookings view (#/admin-bookings). */
  function showToast(message, isError) {
    var toast = byId("bookings-toast");
    if (!toast) { return; }
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.toggle("ad-toast--error", Boolean(isError));
    toast.classList.add("is-visible");
    toast.setAttribute("role", isError ? "alert" : "status");
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 3500);
  }

  /* =========================================================
     CSV export
     ========================================================= */

  /* Wraps a CSV cell value in quotes and escapes internal quotes. */
  function csvField(value) {
    return '"' + String(value).replace(/"/g, '""') + '"';
  }

  /* Exports the currently filtered bookings list as a UTF-8 CSV file.
     Visible via the "Export list" button on the Bookings view (#/admin-bookings). */
  function exportRows() {
    if (!filteredBookings.length) { return; }
    var headers = [
      "Reference", "Client", "Package", "Package code",
      "Travel date", "Guests", "Total", "Booking status", "Payment status", "Created"
    ];
    var lines = [headers.map(csvField).join(",")];
    filteredBookings.forEach(function (booking) {
      var pkg = packageFor(booking.packageId);
      lines.push([
        booking.reference,
        booking.client,
        packageNation(pkg) || packageName(pkg),
        packageCode(pkg, booking.packageId),
        formatDate(booking.travelDate, false),
        booking.guests,
        totalFor(booking, pkg),
        booking.bookingStatus,
        (booking.bookingStatus === "Rejected" || booking.bookingStatus === "Cancelled") ? "—" : booking.paymentStatus,
        formatCreatedAt(booking.createdAt)
      ].map(csvField).join(","));
    });
    var blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "teyvat-travels-bookings.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 0);
  }

  /* =========================================================
     Add booking dialog
     ========================================================= */

  /* Populates the package <select> inside the Add Booking dialog with active packages.
     Visible inside the Add Booking dialog on the Bookings view (#/admin-bookings). */
  function populateAddPackages() {
    var select = byId("booking-add-package");
    if (!select) { return; }
    select.textContent = "";
    var activePackages = packages.filter(function (pkg) {
      return (pkg.status || "Active") === "Active";
    });
    activePackages.forEach(function (pkg) {
      var option = document.createElement("option");
      option.value = packageId(pkg);
      option.textContent = packageName(pkg) + " · " + (packageNation(pkg) || packageId(pkg));
      select.appendChild(option);
    });
    select.disabled = activePackages.length === 0;
  }

  /* Handles the Add Booking form submission.
     Validates required fields, writes a new booking via TTAdminBookingsData.createBooking,
     then closes the dialog and refreshes the view. */
  function addBooking(event) {
    event.preventDefault();
    var client = byId("booking-add-client").value.trim();
    var pkg = packageFor(byId("booking-add-package").value);
    var travelDate = byId("booking-add-date").value;
    var guestsValue = byId("booking-add-guests").value.trim();
    var guests = Number(guestsValue);
    var errorBox = byId("booking-add-error");
    errorBox.hidden = true;
    errorBox.textContent = "";

    if (!client) {
      errorBox.textContent = "Enter the client name.";
    } else if (!pkg) {
      errorBox.textContent = "Select a tour package first.";
    } else if (!travelDate) {
      errorBox.textContent = "Select a travel date.";
    } else if (travelDate <= new Date().toISOString().slice(0, 10)) {
      errorBox.textContent = "Travel date must be in the future.";
    } else if (!guestsValue || !Number.isSafeInteger(guests) || guests < 1) {
      errorBox.textContent = "Guests must be a whole number of at least 1.";
    }
    if (errorBox.textContent) {
      errorBox.hidden = false;
      return;
    }

    var price = packagePrice(pkg);
    var total = price === null ? 0 : price * guests;
    var submit = byId("booking-add-submit");
    submit.disabled = true;
    try {
      data().createBooking({
        client: client,
        packageId: packageId(pkg),
        travelDate: travelDate,
        guests: guests,
        total: total
      });
      byId("booking-add-dialog").close();
      byId("booking-add-form").reset();
      render();
      showToast("Booking added.");
    } catch (error) {
      errorBox.textContent = error.message || "Booking could not be saved.";
      errorBox.hidden = false;
    } finally {
      submit.disabled = false;
    }
  }

  /* =========================================================
     Detail dialog
     ========================================================= */

  /* Clears the inline error message in the detail dialog. */
  function clearDetailMessage() {
    var box = byId("booking-detail-message");
    if (box) { box.hidden = true; box.textContent = ""; }
  }

  /* Shows an inline error inside the detail dialog. */
  function showDetailMessage(message) {
    var box = byId("booking-detail-message");
    if (box) { box.textContent = message; box.hidden = false; }
  }

  /* Opens the booking detail dialog and populates every field for the given reference.
     Enables/disables action buttons to reflect the current status.
     Visible in the Booking Detail dialog on the Bookings view (#/admin-bookings). */
  function openDetail(reference) {
    var booking;
    try {
      booking = data().getBookings().find(function (item) {
        return item.reference === reference;
      });
    } catch (error) {
      showToast("Bookings could not be loaded.", true);
      return;
    }
    if (!booking) {
      showToast("This booking could not be found.", true);
      return;
    }
    selectedReference = reference;
    clearDetailMessage();

    var pkg = packageFor(booking.packageId);
    byId("detail-client").textContent = booking.client;
    byId("detail-reference").textContent = booking.reference;
    byId("detail-package").textContent =
      packageName(pkg) + " · " + (packageNation(pkg) || "—") + " · " + packageCode(pkg, booking.packageId);
    byId("detail-date").textContent = formatDate(booking.travelDate, true);
    byId("detail-guests").textContent = String(booking.guests);
    byId("detail-total").textContent = formatPeso(totalFor(booking, pkg));
    byId("detail-booking-status").textContent = booking.bookingStatus;
    byId("detail-payment-status").textContent =
      (booking.bookingStatus === "Rejected" || booking.bookingStatus === "Cancelled") ? "—" : booking.paymentStatus;
    var createdEl = byId("detail-created");
    if (createdEl) { createdEl.textContent = formatCreatedAt(booking.createdAt); }

    var isTerminal = booking.bookingStatus === "Rejected" ||
                     booking.bookingStatus === "Cancelled" ||
                     booking.bookingStatus === "Completed";
    byId("detail-reject").disabled    = isTerminal;
    byId("detail-confirm").disabled   = booking.bookingStatus === "Confirmed" || isTerminal;
    byId("detail-paid").disabled      = booking.bookingStatus !== "Confirmed" || booking.paymentStatus === "Paid";
    var cancelBtn = byId("detail-cancel-booking");
    var completeBtn = byId("detail-complete");
    if (cancelBtn)  { cancelBtn.disabled  = isTerminal; }
    if (completeBtn){ completeBtn.disabled = booking.bookingStatus !== "Confirmed"; }

    if (!byId("booking-detail-dialog").open) {
      byId("booking-detail-dialog").showModal();
    }
  }

  /* Saves a partial update to the currently open booking and refreshes the view.
     changes is a plain object merged into the stored booking record. */
  function updateSelected(changes) {
    try {
      data().updateBooking(selectedReference, changes);
      render();
      openDetail(selectedReference);
      showToast("Booking updated.");
    } catch (error) {
      showDetailMessage(error.message || "Booking could not be updated.");
    }
  }

  /* Confirms the selected booking after checking availability capacity.
     If TTAdminAvailability is not loaded, the confirmation falls back to a plain status update.
     Visible via the "Confirm" button in the booking detail dialog. */
  function confirmSelected() {
    var booking;
    try {
      booking = data().getBookings().find(function (item) { return item.reference === selectedReference; });
    } catch (error) {
      showDetailMessage("Booking could not be loaded.");
      return;
    }
    if (!booking) {
      showDetailMessage("This booking could not be found.");
      return;
    }
    if (window.TTAdminAvailability) {
      var capacity;
      try {
        capacity = window.TTAdminAvailability.checkCapacity(
          booking.packageId, booking.travelDate, booking.guests, booking.reference
        );
      } catch (error) {
        showDetailMessage(error.message || "Capacity could not be checked.");
        return;
      }
      if (!capacity.ok) {
        showDetailMessage(capacity.message);
        return;
      }
    }
    updateSelected({ bookingStatus: "Confirmed" });
  }

  /* Asks for confirmation before cancelling or deleting a booking.
     Used for Reject, Cancel, and Delete actions to prevent accidental changes. */
  function confirmAction(message, onConfirm) {
    if (!window.confirm(message)) { return; }
    onConfirm();
  }

  /* Deletes the currently open booking after user confirmation.
     Closes the dialog and re-renders the table. */
  function deleteSelected() {
    confirmAction(
      "Delete this booking? This cannot be undone.",
      function () {
        try {
          data().deleteBooking(selectedReference);
          byId("booking-detail-dialog").close();
          render();
          showToast("Booking deleted.");
        } catch (error) {
          showDetailMessage(error.message || "Booking could not be deleted.");
        }
      }
    );
  }

  /* =========================================================
     Event binding
     ========================================================= */

  /* Wires up all interactive controls in the Bookings view.
     Uses isBound to prevent duplicate listeners if init() is called more than once.
     Visible on the Bookings view (#/admin-bookings). */
  function bind() {
    if (isBound) { return; }
    isBound = true;

    /* Filter inputs — re-render on every change. */
    byId("bookings-search").addEventListener("input", render);
    byId("bookings-status").addEventListener("change", render);
    byId("bookings-date").addEventListener("change", render);
    if (byId("bookings-package")) { byId("bookings-package").addEventListener("change", render); }
    if (byId("bookings-date-from")) { byId("bookings-date-from").addEventListener("change", render); }
    if (byId("bookings-date-to"))   { byId("bookings-date-to").addEventListener("change", render); }

    /* Clear filters button. */
    byId("bookings-clear-filters").addEventListener("click", function () {
      byId("bookings-search").value = "";
      byId("bookings-status").value = "all";
      byId("bookings-date").value   = "all";
      if (byId("bookings-package")) { byId("bookings-package").value = "all"; }
      if (byId("bookings-date-from")) { byId("bookings-date-from").value = ""; }
      if (byId("bookings-date-to"))   { byId("bookings-date-to").value   = ""; }
      render();
    });

    /* Column header sort clicks. */
    var sortHeaders = document.querySelectorAll("#view-admin-bookings .bookings-table th[data-sort]");
    for (var i = 0; i < sortHeaders.length; i++) {
      (function (th) {
        th.style.cursor = "pointer";
        th.addEventListener("click", function () {
          var key = th.getAttribute("data-sort");
          if (sortKey === key) {
            sortAsc = !sortAsc;
          } else {
            sortKey = key;
            sortAsc = true;
          }
          render();
        });
      })(sortHeaders[i]);
    }

    /* Export CSV. */
    byId("bookings-export").addEventListener("click", exportRows);

    /* Open add-booking dialog. */
    byId("bookings-add").addEventListener("click", function () {
      byId("booking-add-error").hidden = true;
      byId("booking-add-form").reset();
      populateAddPackages();
      byId("booking-add-dialog").showModal();
    });

    /* Open detail dialog when a View button is clicked in the table. */
    byId("bookings-rows").addEventListener("click", function (event) {
      var viewButton = event.target.closest("button[data-reference]");
      if (viewButton) { openDetail(viewButton.dataset.reference); }
    });

    /* Detail dialog action buttons. */
    byId("booking-detail-close").addEventListener("click", function () {
      byId("booking-detail-dialog").close();
    });
    byId("detail-confirm").addEventListener("click", confirmSelected);
    byId("detail-reject").addEventListener("click", function () {
      confirmAction("Reject this booking?", function () {
        updateSelected({ bookingStatus: "Rejected" });
      });
    });
    var cancelBtn = byId("detail-cancel-booking");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", function () {
        confirmAction("Cancel this booking?", function () {
          updateSelected({ bookingStatus: "Cancelled" });
        });
      });
    }
    var completeBtn = byId("detail-complete");
    if (completeBtn) {
      completeBtn.addEventListener("click", function () {
        updateSelected({ bookingStatus: "Completed" });
      });
    }
    byId("detail-paid").addEventListener("click", function () {
      updateSelected({ paymentStatus: "Paid" });
    });
    var deleteBtn = byId("detail-delete");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", deleteSelected);
    }

    /* Add-booking dialog buttons. */
    byId("booking-add-close").addEventListener("click", function () {
      byId("booking-add-dialog").close();
    });
    byId("booking-add-cancel").addEventListener("click", function () {
      byId("booking-add-dialog").close();
    });
    byId("booking-add-form").addEventListener("submit", addBooking);
  }

  /* =========================================================
     Public API
     ========================================================= */

  /* Entry point called by app.js whenever the route changes to #/admin-bookings.
     nextPackages is the current packages array from localStorage. */
  function init(nextPackages) {
    packages = Array.isArray(nextPackages) ? nextPackages.slice() : [];
    bind();
    render();
  }

  /* Expose to app.js and admin-availability.js. */
  window.TTAdminBookings = { render: init };
})();
