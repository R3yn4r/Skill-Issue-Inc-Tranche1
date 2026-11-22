/* Availability calendar and browser-persisted departure settings. */
(function () {
  "use strict";

  var STORAGE_KEY = "tt_admin_departures_v1";
  var WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var packages = [];
  var selectedNation = "";
  var selectedPackageId = "";
  var selectedDate = "";
  var visibleMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  var toastTimer = null;
  var isBound = false;

  function byId(id) {
    return document.getElementById(id);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function packageId(pkg) {
    return String(pkg.id !== undefined ? pkg.id : pkg.package_id);
  }

  function packageName(pkg) {
    return pkg.title || pkg.package_name || "Tour package";
  }

  function packageCode(pkg) {
    return pkg.packageCode || pkg.package_code || packageId(pkg);
  }

  function selectedPackage() {
    return packages.find(function (pkg) {
      return packageId(pkg) === selectedPackageId;
    }) || null;
  }

  function dateToISO(date) {
    return date.getFullYear() + "-" +
      String(date.getMonth() + 1).padStart(2, "0") + "-" +
      String(date.getDate()).padStart(2, "0");
  }

  function isValidISODate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false;
    }
    var parts = value.split("-").map(Number);
    var date = new Date(parts[0], parts[1] - 1, parts[2]);
    return date.getFullYear() === parts[0] &&
      date.getMonth() === parts[1] - 1 &&
      date.getDate() === parts[2];
  }

  function formatDate(value) {
    var parts = value.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  }

  function readDepartures() {
    var raw;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      throw new Error("Browser storage is unavailable. Saved availability could not be loaded.");
    }
    if (raw === null) {
      return [];
    }

    var records;
    try {
      records = JSON.parse(raw);
    } catch (error) {
      throw new Error("Saved availability data is invalid and could not be read.");
    }
    if (!Array.isArray(records)) {
      throw new Error("Saved availability data is invalid and could not be read.");
    }

    records.forEach(function (record) {
      if (!record || typeof record.packageId !== "string" ||
          !isValidISODate(record.date) ||
          !Number.isSafeInteger(record.maxCapacity) || record.maxCapacity < 1 ||
          typeof record.isUnavailable !== "boolean") {
        throw new Error("Saved availability data contains an invalid departure.");
      }
    });
    return records;
  }

  function getReservationsFor(packageKey, date) {
    if (!window.TTAdminBookingsData) {
      throw new Error("Booking data is unavailable.");
    }
    return window.TTAdminBookingsData.getForDate(packageKey, date);
  }

  function getDeparture(records, packageKey, date) {
    return records.find(function (record) {
      return record.packageId === packageKey && record.date === date;
    }) || null;
  }

  function guestCount(booking) {
    var count = Number(booking.guests || booking.num_guests || 0);
    return Number.isSafeInteger(count) && count > 0 ? count : 0;
  }

  function countsFor(bookings) {
    return bookings.reduce(function (counts, booking) {
      var status = booking.bookingStatus || booking.booking_status || booking.status;
      if (status === "Confirmed") {
        counts.confirmed += guestCount(booking);
      } else if (status === "Pending") {
        counts.pending += guestCount(booking);
      }
      return counts;
    }, { confirmed: 0, pending: 0 });
  }

  function showToast(message, isError) {
    var toast = byId("av-toast");
    if (!toast) {
      return;
    }
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.toggle("ad-toast--error", Boolean(isError));
    toast.classList.add("is-visible");
    toast.setAttribute("role", isError ? "alert" : "status");
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 3500);
  }

  function populatePackageFilter() {
    var packageSelect = byId("av-package");
    var nationPackages = packages.filter(function (pkg) {
      return pkg.nation === selectedNation;
    });
    if (!nationPackages.some(function (pkg) { return packageId(pkg) === selectedPackageId; })) {
      selectedPackageId = nationPackages.length ? packageId(nationPackages[0]) : "";
    }
    packageSelect.innerHTML = nationPackages.map(function (pkg) {
      return '<option value="' + escapeHtml(packageId(pkg)) + '">' +
        escapeHtml(packageName(pkg)) + '</option>';
    }).join("");
    packageSelect.value = selectedPackageId;
  }

  function populateFilters() {
    var nations = Array.from(new Set(packages.map(function (pkg) {
      return pkg.nation;
    })));
    if (!nations.includes(selectedNation)) {
      selectedNation = nations[0] || "";
    }

    byId("av-nation").innerHTML = nations.map(function (nation) {
      return '<option value="' + escapeHtml(nation) + '">' + escapeHtml(nation) + '</option>';
    }).join("");
    byId("av-nation").value = selectedNation;
    populatePackageFilter();
  }

  function renderCalendar(records, pkg) {
    var year = visibleMonth.getFullYear();
    var month = visibleMonth.getMonth();
    byId("av-month-title").textContent = visibleMonth.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric"
    });

    var firstDay = new Date(year, month, 1);
    var gridStart = new Date(year, month, 1 - firstDay.getDay());
    var html = WEEKDAYS.map(function (weekday) {
      return '<div class="av-weekday" role="columnheader">' + weekday + '</div>';
    }).join("");

    for (var index = 0; index < 42; index++) {
      var date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index);
      var iso = dateToISO(date);
      var isCurrentMonth = date.getMonth() === month;
      var number = date.getDate();
      if (!isCurrentMonth) {
        html += '<div class="av-day av-day--outside" role="gridcell" aria-disabled="true">' +
          '<span class="av-day__number">' + number + '</span></div>';
        continue;
      }

      var key = packageId(pkg);
      var departure = getDeparture(records, key, iso);
      var bookings = getReservationsFor(key, iso);
      var counts = countsFor(bookings);
      var maximum = departure ? departure.maxCapacity : 0;
      var slots = Math.max(0, maximum - counts.confirmed);
      var stateClass = !departure ? "av-day--unscheduled" :
        (departure.isUnavailable ? "av-day--unavailable" : "av-day--available");
      var status = !departure ? "Not scheduled" :
        (departure.isUnavailable ? "Unavailable" : slots + " slots left");
      var detail = !departure ? "—" :
        (departure.isUnavailable ? "Manually blocked" : counts.confirmed + " / " + maximum + " confirmed");
      var label = formatDate(iso) + ": " + status + (departure ? ", " + detail : ".");
      var selectedClass = iso === selectedDate ? " av-day--selected" : "";

      html += '<button class="av-day ' + stateClass + selectedClass + '" type="button" role="gridcell"' +
        ' data-date="' + iso + '" aria-label="' + escapeHtml(label) + '"' +
        ' aria-pressed="' + String(iso === selectedDate) + '">' +
        '<span class="av-day__number">' + number + '</span>' +
        '<span class="av-day__status">' + escapeHtml(status) + '</span>' +
        '<span class="av-day__detail">' + escapeHtml(detail) + '</span>' +
        '<span class="av-day__dot" aria-hidden="true"></span>' +
        '</button>';
    }
    byId("av-calendar").innerHTML = html;
  }

  function renderReservations(bookings, maximum, confirmed) {
    var list = byId("av-reservations");
    var empty = byId("av-no-reservations");
    var impact = byId("av-impact");
    var reservations = bookings.filter(function (booking) {
      var status = booking.bookingStatus || booking.booking_status || booking.status;
      return status === "Confirmed" || status === "Pending";
    });
    list.textContent = "";
    empty.hidden = reservations.length > 0;
    list.hidden = reservations.length === 0;
    impact.hidden = true;

    reservations.forEach(function (booking) {
      var status = booking.bookingStatus || booking.booking_status || booking.status || "Pending";
      var row = document.createElement("li");
      row.className = "av-reservation";
      var guest = document.createElement("div");
      var name = document.createElement("p");
      name.className = "av-reservation__guest";
      name.textContent = booking.client || booking.guestName || "Guest";
      var reference = document.createElement("p");
      reference.className = "av-reservation__reference";
      reference.textContent = booking.reference || "";
      guest.appendChild(name);
      guest.appendChild(reference);

      var statusLabel = document.createElement("span");
      statusLabel.className = "av-reservation__status av-reservation__status--" +
        (status === "Confirmed" ? "confirmed" : "pending");
      statusLabel.textContent = guestCount(booking) + " " + status.toLowerCase();
      row.appendChild(guest);
      row.appendChild(statusLabel);
      list.appendChild(row);
    });

    var pending = reservations.filter(function (booking) {
      return (booking.bookingStatus || booking.booking_status || booking.status) === "Pending";
    });
    if (pending.length) {
      var remaining = Math.max(0, maximum - confirmed);
      impact.textContent = pending.map(function (booking) {
        var guestName = booking.client || booking.guestName || "Guest";
        var placesAfterApproval = Math.max(0, remaining - guestCount(booking));
        return "Approving " + guestName + "'s request would leave " + placesAfterApproval +
          " of " + maximum + " places available.";
      }).join(" ") + " Confirmation must be blocked if a request exceeds the remaining slots.";
      impact.hidden = false;
    }
  }

  function updateSelectedPanel(records, pkg) {
    var departure = getDeparture(records, packageId(pkg), selectedDate);
    var bookings = getReservationsFor(packageId(pkg), selectedDate);
    var counts = countsFor(bookings);
    var maximum = departure ? departure.maxCapacity : 0;
    byId("av-selected-label").textContent = "Selected departure / " + packageCode(pkg);
    byId("av-selected-date").textContent = formatDate(selectedDate);
    byId("av-selected-package").textContent = packageName(pkg);
    byId("av-maximum").textContent = String(maximum);
    byId("av-confirmed").textContent = String(counts.confirmed);
    byId("av-slots-left").textContent = String(Math.max(0, maximum - counts.confirmed));
    byId("av-capacity").value = departure ? String(departure.maxCapacity) : "";
    byId("av-unavailable").checked = Boolean(departure && departure.isUnavailable);
    byId("av-confirmed-warning").hidden = !byId("av-unavailable").checked || counts.confirmed === 0;
    byId("av-capacity-error").hidden = true;
    byId("av-capacity").removeAttribute("aria-invalid");
    renderReservations(bookings, maximum, counts.confirmed);
  }

  function updateDraftCapacityStats() {
    var pkg = selectedPackage();
    if (!pkg) {
      return;
    }
    var records;
    try {
      records = readDepartures();
    } catch (error) {
      showToast(error.message, true);
      return;
    }
    var bookings = getReservationsFor(packageId(pkg), selectedDate);
    var confirmed = countsFor(bookings).confirmed;
    var departure = getDeparture(records, packageId(pkg), selectedDate);
    var baseline = departure ? departure.maxCapacity : 0;
    var inputValue = byId("av-capacity").value.trim();
    var draft = Number(inputValue);
    var maximum = inputValue && Number.isSafeInteger(draft) && draft >= 0 ? draft : baseline;
    byId("av-maximum").textContent = String(maximum);
    byId("av-slots-left").textContent = String(Math.max(0, maximum - confirmed));
  }

  function render() {
    var empty = packages.length === 0;
    byId("av-filters").hidden = empty;
    byId("av-no-packages").hidden = !empty;
    byId("av-content").hidden = empty;
    byId("av-storage-error").hidden = true;
    if (empty) {
      return;
    }

    populateFilters();
    if (!selectedDate) {
      selectedDate = dateToISO(new Date());
      visibleMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    }
    var parts = selectedDate.split("-").map(Number);
    if (parts[0] !== visibleMonth.getFullYear() || parts[1] - 1 !== visibleMonth.getMonth()) {
      selectedDate = dateToISO(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1));
    }

    var pkg = selectedPackage();
    if (!pkg) {
      return;
    }

    var records;
    try {
      records = readDepartures();
    } catch (error) {
      byId("av-content").hidden = true;
      byId("av-storage-error").textContent = error.message;
      byId("av-storage-error").hidden = false;
      return;
    }
    byId("av-content").hidden = false;
    renderCalendar(records, pkg);
    updateSelectedPanel(records, pkg);
  }

  function showCapacityError(message) {
    var error = byId("av-capacity-error");
    error.textContent = message;
    error.hidden = false;
    byId("av-capacity").setAttribute("aria-invalid", "true");
    byId("av-capacity").focus();
  }

  async function saveAvailability(event) {
    event.preventDefault();
    var pkg = selectedPackage();
    if (!pkg) {
      return;
    }

    var capacityInput = byId("av-capacity");
    var rawCapacity = capacityInput.value.trim();
    var capacity = Number(rawCapacity);
    var bookings = getReservationsFor(packageId(pkg), selectedDate);
    var confirmed = countsFor(bookings).confirmed;
    byId("av-capacity-error").hidden = true;
    capacityInput.removeAttribute("aria-invalid");

    if (!rawCapacity || !Number.isSafeInteger(capacity) || capacity < 1) {
      showCapacityError("Enter a whole number of at least 1.");
      return;
    }
    if (capacity < confirmed) {
      showCapacityError("Maximum guests cannot be lower than the " + confirmed + " confirmed guests.");
      return;
    }
    if (byId("av-unavailable").checked && confirmed > 0 &&
        !window.confirm("Confirmed bookings already exist for this date. Marking it unavailable will not remove them. Continue?")) {
      return;
    }

    var saveButton = byId("av-save");
    saveButton.disabled = true;
    try {
      await new Promise(function (resolve) {
        window.setTimeout(resolve, 0);
      });
      var records = readDepartures();
      var record = {
        packageId: packageId(pkg),
        date: selectedDate,
        maxCapacity: capacity,
        isUnavailable: byId("av-unavailable").checked
      };
      var index = records.findIndex(function (item) {
        return item.packageId === record.packageId && item.date === record.date;
      });
      if (index >= 0) {
        records[index] = record;
      } else {
        records.push(record);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      render();
      showToast("Availability saved.");
    } catch (error) {
      showToast(error.message || "Availability could not be saved.", true);
    } finally {
      saveButton.disabled = false;
    }
  }

  function changeMonth(offset) {
    var day = Number(selectedDate.split("-")[2]) || 1;
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1);
    var maxDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
    selectedDate = dateToISO(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), Math.min(day, maxDay)));
    render();
  }

  function bind() {
    if (isBound) {
      return;
    }
    isBound = true;

    byId("av-nation").addEventListener("change", function () {
      selectedNation = this.value;
      populatePackageFilter();
      render();
    });
    byId("av-package").addEventListener("change", function () {
      selectedPackageId = this.value;
      render();
    });
    byId("av-prev-month").addEventListener("click", function () {
      changeMonth(-1);
    });
    byId("av-next-month").addEventListener("click", function () {
      changeMonth(1);
    });
    byId("av-calendar").addEventListener("click", function (event) {
      var dayButton = event.target.closest("button[data-date]");
      if (!dayButton) {
        return;
      }
      selectedDate = dayButton.getAttribute("data-date");
      render();
    });
    byId("av-unavailable").addEventListener("change", function () {
      var counts = countsFor(getReservationsFor(packageId(selectedPackage()), selectedDate));
      byId("av-confirmed-warning").hidden = !this.checked || counts.confirmed === 0;
    });
    byId("av-capacity").addEventListener("input", updateDraftCapacityStats);
    byId("av-form").addEventListener("submit", saveAvailability);
  }

  function init(nextPackages) {
    packages = Array.isArray(nextPackages)
      ? nextPackages.filter(function (pkg) {
        return (pkg.status || "Active") === "Active";
      })
      : [];
    bind();
    render();
  }

  function checkCapacity(packageKey, date, guests, exceptReference) {
    var departure = getDeparture(readDepartures(), String(packageKey), date);
    if (!departure) {
      return { ok: false, message: "Set capacity for this date in Availability first." };
    }
    if (departure.isUnavailable) {
      return { ok: false, message: "This departure is marked unavailable in Availability." };
    }
    if (!window.TTAdminBookingsData) {
      throw new Error("Booking data is unavailable.");
    }
    var confirmed = window.TTAdminBookingsData.getConfirmedGuests(packageKey, date, exceptReference);
    var remaining = Math.max(0, departure.maxCapacity - confirmed);
    if (guests > remaining) {
      return {
        ok: false,
        message: "Only " + remaining + " slots remain for this date; this booking needs " + guests + "."
      };
    }
    return { ok: true, remaining: remaining, maximum: departure.maxCapacity, confirmed: confirmed };
  }

  window.TTAdminAvailability = {
    render: init,
    checkCapacity: checkCapacity
  };
})();
