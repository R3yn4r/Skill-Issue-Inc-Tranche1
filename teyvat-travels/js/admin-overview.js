/* Overview page (dashboard.html): fills the four summary cards, the recent booking requests table,
   the "Needs your attention" list and the next departures from the shared demo data. */
(function () {
  "use strict";

  const data = window.TTAdmin.data;
  const el = window.TTAdmin.ui.el;

  const RECENT_LIMIT = 5;
  const DEPARTURE_LIMIT = 3;

  const bookings = data.getBookings();
  const inquiries = data.getInquiries();
  const packages = data.getPackages();

  /* Sets the text of an element by id, if it exists on the page. */
  function setText(id, value) {
    const node = document.getElementById(id);
    if (node) {
      node.textContent = value;
    }
  }

  /* Returns the CSS modifier class for a status pill. */
  function pillClass(status) {
    if (status === "Pending") {
      return "ad-pill ad-pill--pending";
    }
    if (status === "Rejected") {
      return "ad-pill ad-pill--bad";
    }
    return "ad-pill";
  }

  /* Counts bookings with a given booking status. */
  function countStatus(status) {
    return bookings.filter(function (booking) {
      return booking.booking_status === status;
    }).length;
  }

  /* Looks up the nation of a package code, such as MOND-01 giving Mondstadt. */
  function nationOf(code) {
    const pkg = packages.find(function (item) {
      return item.package_code === code;
    });
    return pkg ? pkg.nation : code;
  }

  /* ---------- Summary cards ---------- */
  function renderStats() {
    const pending = countStatus("Pending");
    const newInquiries = inquiries.filter(function (item) {
      return item.inquiry_status === "New";
    }).length;
    const paid = bookings.filter(function (booking) {
      return booking.payment_status === "Paid";
    });
    const total = paid.reduce(function (sum, booking) {
      return sum + booking.total_price;
    }, 0);
    /* A confirmed booking that has not been paid yet. */
    const awaitingPayment = bookings.filter(function (booking) {
      return booking.booking_status === "Confirmed" && booking.payment_status === "Pending";
    }).length;

    setText("ov-pending", pending);
    setText("ov-confirmed", countStatus("Confirmed"));
    setText("ov-inquiries", newInquiries);
    setText("ov-payments", data.formatPeso(total));
    setText("ov-payments-note", "Across " + paid.length + " paid " + (paid.length === 1 ? "booking" : "bookings"));

    setText("ov-attn-pending", pending);
    setText("ov-attn-inquiries", newInquiries);
    setText("ov-attn-payment", awaitingPayment);
  }

  /* ---------- Recent booking requests ---------- */
  function renderRecent() {
    const body = document.getElementById("ov-recent");
    if (!body) {
      return;
    }

    /* The newest reference number is the most recent request. */
    const recent = bookings.slice().sort(function (a, b) {
      return a.reference < b.reference ? 1 : -1;
    }).slice(0, RECENT_LIMIT);

    body.textContent = "";
    recent.forEach(function (booking) {
      const row = document.createElement("tr");

      const client = el("td", "ad-td-main");
      client.appendChild(el("p", "ad-cell-strong", booking.client));
      client.appendChild(el("p", "ad-cell-sub", booking.reference));
      row.appendChild(client);

      const nation = el("td", "", nationOf(booking.package_code));
      nation.dataset.label = "Nation";
      row.appendChild(nation);

      const date = el("td", "ad-cell-small", data.formatDate(booking.travel_date));
      date.dataset.label = "Travel date";
      row.appendChild(date);

      const status = el("td");
      status.dataset.label = "Status";
      status.appendChild(el("span", pillClass(booking.booking_status), booking.booking_status));
      row.appendChild(status);

      body.appendChild(row);
    });

    setText("ov-recent-note", "Showing " + recent.length + " of " + bookings.length + " booking requests · Sample operational data");
  }

  /* ---------- Next departures with capacity bars ---------- */
  function renderDepartures() {
    const list = document.getElementById("ov-departures");
    if (!list) {
      return;
    }

    /* Upcoming dates first. If every sample date is already in the past, show the earliest ones. */
    const all = data.getDepartures();
    const today = data.todayISO();
    const upcoming = all.filter(function (item) {
      return item.travel_date >= today;
    });
    const chosen = (upcoming.length > 0 ? upcoming : all).slice(0, DEPARTURE_LIMIT);

    list.textContent = "";
    chosen.forEach(function (item) {
      const pkg = packages.find(function (entry) {
        return entry.package_code === item.package_code;
      });
      if (!pkg) {
        return;
      }

      const percent = Math.min(100, Math.round((item.confirmed / pkg.max_group_size) * 100));
      const row = document.createElement("li");

      const meta = el("div", "ad-dep__meta");
      const left = el("div");
      left.appendChild(el("p", "ad-dep__date", data.formatDate(item.travel_date, false)));
      left.appendChild(el("p", "ad-dep__name", pkg.nation));
      meta.appendChild(left);
      meta.appendChild(el("p", "ad-dep__count", item.confirmed + " / " + pkg.max_group_size + " confirmed"));
      row.appendChild(meta);

      const bar = el("div", "ad-bar");
      bar.setAttribute("role", "img");
      bar.setAttribute("aria-label", percent + " percent of seats confirmed");
      const fill = el("span", "ad-bar__fill" + (percent >= 100 ? " ad-bar__fill--full" : ""));
      fill.style.width = percent + "%";
      bar.appendChild(fill);
      row.appendChild(bar);

      list.appendChild(row);
    });
  }

  /* ---------- Today's date in the page header ---------- */
  function renderDate() {
    const now = new Date();
    const text = String(now.getDate()).padStart(2, "0") + " " +
      now.toLocaleDateString("en-GB", { month: "short" }) + " " + now.getFullYear();
    setText("ov-today", "Today · " + text);
  }

  renderDate();
  renderStats();
  renderRecent();
  renderDepartures();
})();
