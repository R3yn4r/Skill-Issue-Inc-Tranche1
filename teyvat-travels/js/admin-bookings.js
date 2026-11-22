/* Bookings page: filters, CSV export, detail actions, and booking creation. */
(function () {
  "use strict";

  var packages = [];
  var filteredBookings = [];
  var selectedReference = "";
  var toastTimer = null;
  var isBound = false;

  function byId(id) {
    return document.getElementById(id);
  }

  function data() {
    if (!window.TTAdminBookingsData) {
      throw new Error("Booking data is unavailable.");
    }
    return window.TTAdminBookingsData;
  }

  function packageId(pkg) {
    return String(pkg.id !== undefined ? pkg.id : pkg.package_id);
  }

  function packageFor(id) {
    return packages.find(function (pkg) {
      return packageId(pkg) === String(id);
    }) || null;
  }

  function packageName(pkg) {
    return pkg ? (pkg.title || pkg.package_name || "Package unavailable") : "Package unavailable";
  }

  function packageNation(pkg) {
    return pkg ? (pkg.nation || "") : "";
  }

  function packageCode(pkg, fallback) {
    return pkg ? (pkg.packageCode || pkg.package_code || packageId(pkg)) : fallback;
  }

  function packagePrice(pkg) {
    if (!pkg) {
      return null;
    }
    var rawPrice = pkg.price !== undefined ? pkg.price : pkg.base_price;
    if (rawPrice === null || rawPrice === "") {
      return null;
    }
    var price = Number(rawPrice);
    return Number.isFinite(price) && price >= 0 ? price : null;
  }

  function totalFor(booking, pkg) {
    var price = packagePrice(pkg);
    return price === null ? booking.total : price * booking.guests;
  }

  function formatPeso(amount) {
    return "₱" + Number(amount).toLocaleString("en-PH", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }

  function formatDate(value, longMonth) {
    var parts = value.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: longMonth ? "long" : "short",
      year: "numeric"
    });
  }

  function sortNewestFirst(bookings) {
    return bookings.slice().sort(function (a, b) {
      return Date.parse(b.createdAt) - Date.parse(a.createdAt) ||
        b.reference.localeCompare(a.reference);
    });
  }

  function currentFilters() {
    return {
      search: byId("bookings-search").value.trim().toLowerCase(),
      status: byId("bookings-status").value,
      date: byId("bookings-date").value
    };
  }

  function filteredRows(bookings) {
    var filters = currentFilters();
    return sortNewestFirst(bookings).filter(function (booking) {
      if (filters.status !== "all" && booking.bookingStatus !== filters.status) {
        return false;
      }
      if (filters.date !== "all" && booking.travelDate !== filters.date) {
        return false;
      }
      if (filters.search) {
        var target = (booking.client + " " + booking.reference).toLowerCase();
        if (target.indexOf(filters.search) < 0) {
          return false;
        }
      }
      return true;
    });
  }

  function renderDateOptions(bookings) {
    var select = byId("bookings-date");
    var previous = select.value;
    var dates = Array.from(new Set(bookings.map(function (booking) {
      return booking.travelDate;
    }))).sort();
    var groups = [];
    dates.forEach(function (date) {
      var parts = date.split("-").map(Number);
      var monthDate = new Date(parts[0], parts[1] - 1, 1);
      var key = date.slice(0, 7);
      var group = groups.find(function (item) { return item.key === key; });
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
        return '<optgroup label="' + group.label + '">' +
          group.dates.map(function (date) {
            return '<option value="' + date + '">' + formatDate(date, false) + '</option>';
          }).join("") + '</optgroup>';
      }).join("");
    if (dates.includes(previous)) {
      select.value = previous;
    }
  }

  function createTextCell(text, className) {
    var cell = document.createElement("td");
    if (className) {
      cell.className = className;
    }
    cell.textContent = text;
    return cell;
  }

  function statusClass(status) {
    if (status === "Pending") {
      return "ad-pill ad-pill--pending";
    }
    if (status === "Rejected") {
      return "ad-pill ad-pill--bad";
    }
    return "ad-pill";
  }

  function renderRow(booking) {
    var pkg = packageFor(booking.packageId);
    var row = document.createElement("tr");

    var clientCell = document.createElement("td");
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
    var nation = document.createElement("p");
    nation.className = "ad-cell-strong bookings-package-nation";
    nation.textContent = packageNation(pkg) || packageName(pkg);
    var code = document.createElement("p");
    code.className = "ad-cell-sub";
    code.textContent = packageCode(pkg, booking.packageId);
    packageCell.appendChild(nation);
    packageCell.appendChild(code);
    row.appendChild(packageCell);

    row.appendChild(createTextCell(formatDate(booking.travelDate, false), "ad-cell-small"));
    row.appendChild(createTextCell(String(booking.guests)));
    row.appendChild(createTextCell(formatPeso(totalFor(booking, pkg)), "bookings-total"));

    var bookingStatusCell = document.createElement("td");
    var pill = document.createElement("span");
    pill.className = statusClass(booking.bookingStatus);
    pill.textContent = booking.bookingStatus;
    bookingStatusCell.appendChild(pill);
    row.appendChild(bookingStatusCell);

    var paymentCell = document.createElement("td");
    if (booking.bookingStatus === "Rejected") {
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
    var viewButton = document.createElement("button");
    viewButton.className = "ad-link bookings-view-button";
    viewButton.type = "button";
    viewButton.dataset.reference = booking.reference;
    viewButton.textContent = "View →";
    actionCell.appendChild(viewButton);
    row.appendChild(actionCell);
    return row;
  }

  function render() {
    var bookings;
    try {
      bookings = data().getBookings();
    } catch (error) {
      byId("bookings-table-wrap").hidden = true;
      byId("bookings-empty").hidden = true;
      byId("bookings-filter-empty").hidden = true;
      byId("bookings-storage-error").textContent = error.message;
      byId("bookings-storage-error").hidden = false;
      byId("bookings-search").disabled = true;
      byId("bookings-status").disabled = true;
      byId("bookings-date").disabled = true;
      byId("bookings-export").disabled = true;
      return;
    }

    byId("bookings-storage-error").hidden = true;
    renderDateOptions(bookings);
    var current = filteredRows(bookings);
    filteredBookings = current;
    var noBookings = bookings.length === 0;
    var noMatches = !noBookings && current.length === 0;
    var rows = byId("bookings-rows");
    rows.textContent = "";
    current.forEach(function (booking) {
      rows.appendChild(renderRow(booking));
    });

    byId("bookings-search").disabled = noBookings;
    byId("bookings-status").disabled = noBookings;
    byId("bookings-date").disabled = noBookings;
    byId("bookings-export").disabled = current.length === 0;
    byId("bookings-add").disabled = packages.length === 0;
    byId("bookings-table-wrap").hidden = noBookings || noMatches;
    byId("bookings-empty").hidden = !noBookings;
    byId("bookings-empty").textContent = "No bookings yet. Requests will appear here.";
    byId("bookings-filter-empty").hidden = !noMatches;

    var pending = bookings.filter(function (booking) {
      return booking.bookingStatus === "Pending";
    }).length;
    var confirmed = bookings.filter(function (booking) {
      return booking.bookingStatus === "Confirmed";
    }).length;
    byId("bookings-summary").textContent =
      bookings.length + " total · " + pending + " pending · " + confirmed + " confirmed";
    byId("bookings-count").textContent = current.length === bookings.length
      ? "Showing " + current.length + " bookings"
      : "Showing " + current.length + " of " + bookings.length + " bookings";
  }

  function showToast(message, isError) {
    var toast = byId("bookings-toast");
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.toggle("ad-toast--error", Boolean(isError));
    toast.classList.add("is-visible");
    toast.setAttribute("role", isError ? "alert" : "status");
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 3500);
  }

  function csvField(value) {
    return '"' + String(value).replace(/"/g, '""') + '"';
  }

  function exportRows() {
    if (!filteredBookings.length) {
      return;
    }
    var headers = ["Client", "Booking reference", "Package", "Package code", "Travel date", "Guests", "Total", "Booking status", "Payment status"];
    var lines = [headers.map(csvField).join(",")];
    filteredBookings.forEach(function (booking) {
      var pkg = packageFor(booking.packageId);
      lines.push([
        booking.client,
        booking.reference,
        packageNation(pkg) || packageName(pkg),
        packageCode(pkg, booking.packageId),
        formatDate(booking.travelDate, false),
        booking.guests,
        totalFor(booking, pkg),
        booking.bookingStatus,
        booking.bookingStatus === "Rejected" ? "—" : booking.paymentStatus
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

  function populateAddPackages() {
    var select = byId("booking-add-package");
    select.textContent = "";
    var activePackages = packages.filter(function (pkg) {
      return (pkg.status || "Active") === "Active";
    });
    activePackages.forEach(function (pkg) {
      var option = document.createElement("option");
      option.value = packageId(pkg);
      option.textContent = packageName(pkg) + " · " + packageNation(pkg);
      select.appendChild(option);
    });
    select.disabled = activePackages.length === 0;
  }

  function clearDetailMessage() {
    byId("booking-detail-message").hidden = true;
    byId("booking-detail-message").textContent = "";
  }

  function showDetailMessage(message) {
    var box = byId("booking-detail-message");
    box.textContent = message;
    box.hidden = false;
  }

  function openDetail(reference) {
    var booking = data().getBookings().find(function (item) {
      return item.reference === reference;
    });
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
    byId("detail-date").textContent = formatDate(booking.travelDate, false);
    byId("detail-guests").textContent = String(booking.guests);
    byId("detail-total").textContent = formatPeso(totalFor(booking, pkg));
    byId("detail-booking-status").textContent = booking.bookingStatus;
    byId("detail-payment-status").textContent =
      booking.bookingStatus === "Rejected" ? "—" : booking.paymentStatus;
    byId("detail-reject").disabled = booking.bookingStatus === "Rejected";
    byId("detail-confirm").disabled = booking.bookingStatus === "Confirmed";
    byId("detail-paid").disabled =
      booking.bookingStatus !== "Confirmed" || booking.paymentStatus === "Paid";
    if (!byId("booking-detail-dialog").open) {
      byId("booking-detail-dialog").showModal();
    }
  }

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

  function confirmSelected() {
    var booking = data().getBookings().find(function (item) {
      return item.reference === selectedReference;
    });
    if (!booking) {
      showDetailMessage("This booking could not be found.");
      return;
    }
    var capacity;
    try {
      capacity = window.TTAdminAvailability.checkCapacity(
        booking.packageId,
        booking.travelDate,
        booking.guests,
        booking.reference
      );
    } catch (error) {
      showDetailMessage(error.message || "Capacity could not be checked.");
      return;
    }
    if (!capacity.ok) {
      showDetailMessage(capacity.message);
      return;
    }
    updateSelected({ bookingStatus: "Confirmed" });
  }

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
      errorBox.textContent = "Enter the client's name.";
    } else if (!pkg) {
      errorBox.textContent = "Select a tour package first.";
    } else if (!travelDate) {
      errorBox.textContent = "Select a travel date.";
    } else if (!guestsValue || !Number.isSafeInteger(guests) || guests < 1) {
      errorBox.textContent = "Guests must be a whole number of at least 1.";
    }
    if (errorBox.textContent) {
      errorBox.hidden = false;
      return;
    }

    var price = packagePrice(pkg);
    var total = price === null ? Number(pkg.total) || 0 : price * guests;
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

  function bind() {
    if (isBound) {
      return;
    }
    isBound = true;

    byId("bookings-search").addEventListener("input", render);
    byId("bookings-status").addEventListener("change", render);
    byId("bookings-date").addEventListener("change", render);
    byId("bookings-clear-filters").addEventListener("click", function () {
      byId("bookings-search").value = "";
      byId("bookings-status").value = "all";
      byId("bookings-date").value = "all";
      render();
    });
    byId("bookings-export").addEventListener("click", exportRows);
    byId("bookings-add").addEventListener("click", function () {
      byId("booking-add-error").hidden = true;
      byId("booking-add-form").reset();
      populateAddPackages();
      if (!packages.length) {
        byId("booking-add-error").textContent = "Create a tour package first.";
        byId("booking-add-error").hidden = false;
      }
      byId("booking-add-dialog").showModal();
    });
    byId("bookings-rows").addEventListener("click", function (event) {
      var viewButton = event.target.closest("button[data-reference]");
      if (viewButton) {
        openDetail(viewButton.dataset.reference);
      }
    });
    byId("booking-detail-close").addEventListener("click", function () {
      byId("booking-detail-dialog").close();
    });
    byId("booking-add-close").addEventListener("click", function () {
      byId("booking-add-dialog").close();
    });
    byId("booking-add-cancel").addEventListener("click", function () {
      byId("booking-add-dialog").close();
    });
    byId("booking-add-form").addEventListener("submit", addBooking);
    byId("detail-confirm").addEventListener("click", confirmSelected);
    byId("detail-reject").addEventListener("click", function () {
      updateSelected({ bookingStatus: "Rejected" });
    });
    byId("detail-paid").addEventListener("click", function () {
      updateSelected({ paymentStatus: "Paid" });
    });
  }

  function init(nextPackages) {
    packages = Array.isArray(nextPackages) ? nextPackages.slice() : [];
    bind();
    render();
  }

  window.TTAdminBookings = { render: init };
})();
