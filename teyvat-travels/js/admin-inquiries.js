/* Inquiry inbox for the admin SPA. Reads only saved records; it never creates sample inquiries. */
(function () {
  "use strict";

  var inquiries = [];
  var packages = [];
  var selectedReference = "";
  var isBound = false;
  var toastTimer = null;

  function byId(id) {
    return document.getElementById(id);
  }

  function data() {
    if (!window.TTAdminInquiriesData) {
      throw new Error("Inquiry data is unavailable.");
    }
    return window.TTAdminInquiriesData;
  }

  function packageId(pkg) {
    return String(pkg.id !== undefined ? pkg.id : pkg.package_id);
  }

  function packageFor(inquiry) {
    var id = inquiry.packageId || inquiry.package_id;
    return packages.find(function (pkg) {
      return packageId(pkg) === String(id);
    }) || null;
  }

  function packageLabel(inquiry) {
    var pkg = packageFor(inquiry);
    return pkg ? (pkg.title || pkg.package_name) :
      (inquiry.packageCode || inquiry.package_code || inquiry.packageId || "General inquiry");
  }

  function formatDate(value) {
    var date = new Date(value);
    return isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function showToast(message, isError) {
    var toast = byId("inquiries-toast");
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

  function statusClass(status) {
    if (status === "New") {
      return "ad-pill ad-pill--pending";
    }
    return status === "Closed" ? "ad-pill ad-pill--off" : "ad-pill";
  }

  function selectedInquiry() {
    return inquiries.find(function (inquiry) {
      return inquiry.reference === selectedReference;
    }) || null;
  }

  function filteredInquiries() {
    var query = byId("inquiries-search").value.trim().toLowerCase();
    var status = byId("inquiries-status").value;
    return inquiries.filter(function (inquiry) {
      var matchesStatus = status === "all" || inquiry.status === status;
      var haystack = [
        inquiry.reference,
        inquiry.client,
        inquiry.email || "",
        inquiry.phone || "",
        inquiry.message,
        packageLabel(inquiry)
      ].join(" ").toLowerCase();
      return matchesStatus && haystack.indexOf(query) !== -1;
    }).sort(function (a, b) {
      return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    });
  }

  function renderStats() {
    byId("inquiries-total").textContent = String(inquiries.length);
    byId("inquiries-new").textContent = String(inquiries.filter(function (item) {
      return item.status === "New";
    }).length);
    byId("inquiries-responded").textContent = String(inquiries.filter(function (item) {
      return item.status === "Responded";
    }).length);
  }

  function renderList(rows) {
    var list = byId("inquiries-list");
    var empty = byId("inquiries-empty");
    var filterEmpty = byId("inquiries-filter-empty");
    list.textContent = "";
    byId("inquiries-count").textContent = rows.length + " of " + inquiries.length + " inquiries";

    empty.hidden = inquiries.length !== 0;
    filterEmpty.hidden = inquiries.length === 0 || rows.length !== 0;

    rows.forEach(function (inquiry) {
      var button = document.createElement("button");
      button.className = "inquiry-list-item" +
        (inquiry.reference === selectedReference ? " is-selected" : "");
      button.type = "button";
      button.setAttribute("aria-current", inquiry.reference === selectedReference ? "true" : "false");
      button.dataset.reference = inquiry.reference;

      var top = document.createElement("span");
      top.className = "inquiry-list-item__top";
      top.appendChild(makeText("strong", "inquiry-list-item__client", inquiry.client));
      top.appendChild(makeText("span", statusClass(inquiry.status), inquiry.status));
      button.appendChild(top);
      button.appendChild(makeText("span", "inquiry-list-item__package", packageLabel(inquiry)));
      button.appendChild(makeText("span", "inquiry-list-item__message", inquiry.message));
      button.appendChild(makeText("span", "inquiry-list-item__date", formatDate(inquiry.createdAt)));
      list.appendChild(button);
    });
  }

  function setEmailDraft(inquiry, draft) {
    var link = byId("inquiry-email-draft");
    if (!inquiry.email) {
      link.removeAttribute("href");
      link.setAttribute("aria-disabled", "true");
      return;
    }
    var subject = "Re: " + inquiry.reference + " — Teyvat Travels";
    link.href = "mailto:" + encodeURIComponent(inquiry.email) +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(draft);
    link.removeAttribute("aria-disabled");
  }

  function renderDetail(inquiry) {
    var detail = byId("inquiry-detail");
    var context = byId("inquiry-context");
    var empty = byId("inquiry-detail-empty");
    detail.hidden = !inquiry;
    context.hidden = !inquiry;
    empty.hidden = Boolean(inquiry);
    if (!inquiry) {
      return;
    }

    byId("inquiry-client").textContent = inquiry.client;
    byId("inquiry-reference").textContent = inquiry.reference;
    byId("inquiry-email").textContent = inquiry.email || "Not provided";
    byId("inquiry-phone").textContent = inquiry.phone || "Not provided";
    byId("inquiry-created").textContent = formatDate(inquiry.createdAt);
    byId("inquiry-package").textContent = packageLabel(inquiry);
    byId("inquiry-message").textContent = inquiry.message;
    byId("inquiry-status").textContent = inquiry.status;
    byId("inquiry-status").className = statusClass(inquiry.status);
    byId("inquiry-reply").value = inquiry.replyDraft || "";

    var bookingLink = byId("inquiry-booking-link");
    if (inquiry.bookingReference) {
      bookingLink.href = "#/admin-bookings";
      bookingLink.hidden = false;
      byId("inquiry-booking-reference").textContent = inquiry.bookingReference;
      byId("inquiry-booking-context").hidden = false;
    } else {
      bookingLink.hidden = true;
      byId("inquiry-booking-context").hidden = true;
    }

    byId("inquiry-mark-responded").hidden = inquiry.status !== "New";
    byId("inquiry-close").hidden = inquiry.status === "Closed";
    byId("inquiry-reopen").hidden = inquiry.status !== "Closed";
    setEmailDraft(inquiry, inquiry.replyDraft || "");
    byId("inquiry-email-draft").setAttribute("aria-disabled", inquiry.email ? "false" : "true");
  }

  function render() {
    try {
      inquiries = data().getInquiries();
      byId("inquiries-storage-error").hidden = true;
      renderStats();
      var rows = filteredInquiries();
      if (!rows.some(function (item) { return item.reference === selectedReference; })) {
        selectedReference = rows.length ? rows[0].reference : "";
      }
      renderList(rows);
      renderDetail(selectedInquiry());
    } catch (error) {
      byId("inquiries-total").textContent = "—";
      byId("inquiries-new").textContent = "—";
      byId("inquiries-responded").textContent = "—";
      byId("inquiries-storage-error").textContent = error.message || "Inquiries could not be loaded.";
      byId("inquiries-storage-error").hidden = false;
      byId("inquiries-list").textContent = "";
      byId("inquiries-empty").hidden = true;
      byId("inquiries-filter-empty").hidden = true;
      byId("inquiries-count").textContent = "";
      renderDetail(null);
    }
  }

  function saveChanges(changes, message) {
    try {
      data().updateInquiry(selectedReference, changes);
      render();
      showToast(message, false);
    } catch (error) {
      showToast(error.message || "The inquiry could not be updated.", true);
    }
  }

  function bind() {
    if (isBound) {
      return;
    }
    isBound = true;
    byId("inquiries-search").addEventListener("input", render);
    byId("inquiries-status").addEventListener("change", render);
    byId("inquiries-list").addEventListener("click", function (event) {
      var button = event.target.closest("button[data-reference]");
      if (!button) {
        return;
      }
      selectedReference = button.dataset.reference;
      render();
    });
    byId("inquiry-suggestions").addEventListener("click", function (event) {
      var button = event.target.closest("button[data-reply-template]");
      if (!button) {
        return;
      }
      var inquiry = selectedInquiry();
      if (!inquiry) {
        return;
      }
      var templates = {
        pricing: "Thanks for your inquiry. Our current package prices are listed on the Teyvat Travels website. Please let us know which package you are interested in and we can share the relevant details.",
        group: "Thanks for reaching out. Please share your preferred package and group size so we can help with the details.",
        availability: "Thanks for your inquiry. Please share your preferred package and travel date so we can check the available options."
      };
      byId("inquiry-reply").value = templates[button.dataset.replyTemplate] || "";
      setEmailDraft(inquiry, byId("inquiry-reply").value);
    });
    byId("inquiry-reply").addEventListener("input", function () {
      var inquiry = selectedInquiry();
      if (inquiry) {
        setEmailDraft(inquiry, this.value);
      }
    });
    byId("inquiry-save-draft").addEventListener("click", function () {
      saveChanges({ replyDraft: byId("inquiry-reply").value }, "Reply draft saved.");
    });
    byId("inquiry-mark-responded").addEventListener("click", function () {
      saveChanges({
        status: "Responded",
        replyDraft: byId("inquiry-reply").value
      }, "Inquiry marked as responded. Open the email draft to send it.");
    });
    byId("inquiry-close").addEventListener("click", function () {
      saveChanges({ status: "Closed" }, "Inquiry closed.");
    });
    byId("inquiry-reopen").addEventListener("click", function () {
      saveChanges({ status: "New" }, "Inquiry reopened.");
    });
  }

  function init(nextPackages) {
    packages = Array.isArray(nextPackages) ? nextPackages.slice() : [];
    bind();
    render();
  }

  window.TTAdminInquiries = { render: init };
})();
