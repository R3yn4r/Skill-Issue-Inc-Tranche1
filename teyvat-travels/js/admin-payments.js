/* Payment tracking for the admin SPA. Uses saved booking records only; no payments are simulated. */
(function () {
  "use strict";

  var packages = [];
  var bookings = [];
  var filteredBookings = [];
  var selectedReference = "";
  var isBound = false;
  var toastTimer = null;

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

  function packageFor(booking) {
    return packages.find(function (pkg) {
      return packageId(pkg) === String(booking.packageId);
    }) || null;
  }

  function packageName(booking) {
    var pkg = packageFor(booking);
    if (!pkg) {
      return "Package unavailable";
    }
    return (pkg.title || pkg.package_name || "Tour package") +
      (pkg.nation ? " · " + pkg.nation : "");
  }

  function amount(booking) {
    var value = Number(booking.total);
    return Number.isFinite(value) && value >= 0 ? value : 0;
  }

  function formatPeso(value) {
    return "₱" + Number(value).toLocaleString("en-PH", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }

  function formatDate(value) {
    if (!value) {
      return "Not recorded";
    }
    var date = new Date(value);
    return isNaN(date.getTime()) ? "Not recorded" : date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  function showToast(message, isError) {
    var toast = byId("payments-toast");
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

  function makeText(tag, className, value) {
    var node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    node.textContent = value;
    return node;
  }

  function eligibleBookings() {
    return bookings.filter(function (booking) {
      return booking.bookingStatus === "Confirmed" || booking.bookingStatus === "Completed";
    }).sort(function (a, b) {
      return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    });
  }

  function filteredRows() {
    var query = byId("payments-search").value.trim().toLowerCase();
    var status = byId("payments-status").value;
    return eligibleBookings().filter(function (booking) {
      var matchesStatus = status === "all" || booking.paymentStatus === status;
      var haystack = [
        booking.client,
        booking.reference,
        packageName(booking),
        booking.travelDate
      ].join(" ").toLowerCase();
      return matchesStatus && haystack.indexOf(query) !== -1;
    });
  }

  function renderStats(records) {
    var paid = records.filter(function (booking) {
      return booking.paymentStatus === "Paid";
    });
    var outstanding = records.filter(function (booking) {
      return booking.bookingStatus === "Confirmed" && booking.paymentStatus === "Pending";
    });
    byId("payments-recorded").textContent = formatPeso(paid.reduce(function (total, booking) {
      return total + amount(booking);
    }, 0));
    byId("payments-outstanding").textContent = formatPeso(outstanding.reduce(function (total, booking) {
      return total + amount(booking);
    }, 0));
    byId("payments-paid-count").textContent = String(paid.length);
  }

  function renderRows(rows) {
    var body = byId("payments-rows");
    body.textContent = "";
    rows.forEach(function (booking) {
      var row = document.createElement("tr");
      var clientCell = document.createElement("td");
      clientCell.appendChild(makeText("p", "ad-cell-strong", booking.client));
      clientCell.appendChild(makeText("p", "ad-cell-sub", booking.reference));
      row.appendChild(clientCell);

      var packageCell = document.createElement("td");
      packageCell.textContent = packageName(booking);
      packageCell.dataset.label = "Package";
      row.appendChild(packageCell);

      var dateCell = makeText("td", "ad-cell-small", formatDate(booking.travelDate));
      dateCell.dataset.label = "Travel date";
      row.appendChild(dateCell);

      var amountCell = makeText("td", "payment-amount", formatPeso(amount(booking)));
      amountCell.dataset.label = "Amount";
      row.appendChild(amountCell);

      var statusCell = document.createElement("td");
      statusCell.dataset.label = "Status";
      statusCell.appendChild(makeText("span",
        booking.paymentStatus === "Paid" ? "ad-pill payment-status--paid" : "ad-pill ad-pill--pending",
        booking.paymentStatus));
      row.appendChild(statusCell);

      var actionCell = document.createElement("td");
      actionCell.dataset.label = "Action";
      var action = makeText("button", "ad-link payment-view-button",
        booking.paymentStatus === "Paid" ? "View record" : "Record payment");
      action.type = "button";
      action.dataset.reference = booking.reference;
      actionCell.appendChild(action);
      row.appendChild(actionCell);
      body.appendChild(row);
    });
  }

  function renderReceipt(booking) {
    byId("payment-receipt-empty").hidden = Boolean(booking);
    byId("payment-receipt").hidden = !booking;
    if (!booking) {
      return;
    }

    byId("payment-receipt-status").textContent = booking.paymentStatus;
    byId("payment-receipt-status").className = booking.paymentStatus === "Paid"
      ? "ad-pill payment-status--paid" : "ad-pill ad-pill--pending";
    byId("payment-receipt-reference").textContent = booking.reference;
    byId("payment-receipt-client").textContent = booking.client;
    byId("payment-receipt-package").textContent = packageName(booking);
    byId("payment-receipt-travel-date").textContent = formatDate(booking.travelDate);
    byId("payment-receipt-guests").textContent = String(booking.guests);
    byId("payment-receipt-amount").textContent = formatPeso(amount(booking));
    byId("payment-receipt-recorded").textContent = formatDate(booking.paymentRecordedAt);
    byId("payment-record-button").hidden = booking.paymentStatus === "Paid";
    byId("payment-download-button").disabled = booking.paymentStatus !== "Paid";
  }

  function render() {
    var storageError = byId("payments-storage-error");
    try {
      bookings = data().getBookings();
      storageError.hidden = true;
      var records = eligibleBookings();
      renderStats(records);
      filteredBookings = filteredRows();

      if (!filteredBookings.some(function (booking) {
        return booking.reference === selectedReference;
      })) {
        selectedReference = filteredBookings.length ? filteredBookings[0].reference : "";
      }

      renderRows(filteredBookings);
      byId("payments-count").textContent =
        filteredBookings.length + " of " + records.length + " confirmed or completed bookings";
      byId("payments-empty").hidden = records.length !== 0;
      byId("payments-filter-empty").hidden = records.length === 0 || filteredBookings.length !== 0;
      byId("payments-download-csv").disabled = filteredBookings.length === 0;
      renderReceipt(filteredBookings.find(function (booking) {
        return booking.reference === selectedReference;
      }) || null);
    } catch (error) {
      storageError.textContent = error.message || "Payment records could not be loaded.";
      storageError.hidden = false;
      byId("payments-recorded").textContent = "—";
      byId("payments-outstanding").textContent = "—";
      byId("payments-paid-count").textContent = "—";
      byId("payments-rows").textContent = "";
      byId("payments-empty").hidden = true;
      byId("payments-filter-empty").hidden = true;
      byId("payments-count").textContent = "";
      byId("payments-download-csv").disabled = true;
      renderReceipt(null);
    }
  }

  function csvCell(value) {
    var text = String(value == null ? "" : value);
    if (/^[=+\-@]/.test(text)) {
      text = "'" + text;
    }
    return '"' + text.replace(/"/g, '""') + '"';
  }

  function downloadCsv() {
    if (filteredBookings.length === 0) {
      return;
    }
    var rows = [["Booking reference", "Client", "Package", "Travel date", "Guests", "Amount", "Payment status"]];
    filteredBookings.forEach(function (booking) {
      rows.push([
        booking.reference,
        booking.client,
        packageName(booking),
        booking.travelDate,
        booking.guests,
        amount(booking),
        booking.paymentStatus
      ]);
    });
    var csv = rows.map(function (row) {
      return row.map(csvCell).join(",");
    }).join("\r\n");
    var url = window.URL.createObjectURL(new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8"
    }));
    var link = document.createElement("a");
    link.href = url;
    link.download = "teyvat-payment-records.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () {
      window.URL.revokeObjectURL(url);
    }, 0);
  }

  function downloadPaymentRecord(booking) {
    if (!booking || booking.paymentStatus !== "Paid") {
      return;
    }
    var lines = [
      "TEYVAT TRAVELS — PAYMENT STATUS RECORD",
      "",
      "Administrative record only. This demo does not process or verify payments.",
      "Booking reference: " + booking.reference,
      "Client: " + booking.client,
      "Package: " + packageName(booking),
      "Travel date: " + formatDate(booking.travelDate),
      "Guests: " + booking.guests,
      "Amount recorded: " + formatPeso(amount(booking)),
      "Payment status: " + booking.paymentStatus,
      "Status recorded: " + formatDate(booking.paymentRecordedAt)
    ];
    var url = window.URL.createObjectURL(new Blob([lines.join("\r\n")], {
      type: "text/plain;charset=utf-8"
    }));
    var link = document.createElement("a");
    link.href = url;
    link.download = "payment-record-" + booking.reference + ".txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () {
      window.URL.revokeObjectURL(url);
    }, 0);
  }

  function bind() {
    if (isBound) {
      return;
    }
    isBound = true;
    byId("payments-search").addEventListener("input", render);
    byId("payments-status").addEventListener("change", render);
    byId("payments-rows").addEventListener("click", function (event) {
      var button = event.target.closest("button[data-reference]");
      if (!button) {
        return;
      }
      selectedReference = button.dataset.reference;
      render();
    });
    byId("payments-download-csv").addEventListener("click", downloadCsv);
    byId("payment-record-button").addEventListener("click", function () {
      var booking = bookings.find(function (item) {
        return item.reference === selectedReference;
      });
      if (!booking ||
          (booking.bookingStatus !== "Confirmed" && booking.bookingStatus !== "Completed") ||
          booking.paymentStatus === "Paid") {
        return;
      }
      if (!window.confirm("Record this confirmed booking as paid? This updates a local status only; no payment is processed or verified.")) {
        return;
      }
      try {
        data().updateBooking(booking.reference, {
          paymentStatus: "Paid",
          paymentRecordedAt: new Date().toISOString()
        });
        render();
        showToast("Payment status recorded. No payment was processed.", false);
      } catch (error) {
        showToast(error.message || "Payment status could not be updated.", true);
      }
    });
    byId("payment-download-button").addEventListener("click", function () {
      var booking = bookings.find(function (item) {
        return item.reference === selectedReference;
      });
      downloadPaymentRecord(booking);
    });
  }

  function init(nextPackages) {
    packages = Array.isArray(nextPackages) ? nextPackages.slice() : [];
    bind();
    render();
  }

  window.TTAdminPayments = { render: init };
})();
