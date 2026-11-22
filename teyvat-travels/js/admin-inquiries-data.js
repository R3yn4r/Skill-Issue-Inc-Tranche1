/* Browser-persisted inquiry records for the admin inbox. No sample records are seeded. */
(function () {
  "use strict";

  var STORAGE_KEY = "tt_admin_inquiries_v1";
  var STATUSES = ["New", "Responded", "Closed"];

  function validateInquiry(inquiry) {
    if (!inquiry || typeof inquiry.reference !== "string" || !inquiry.reference.trim() ||
        typeof inquiry.client !== "string" || !inquiry.client.trim() ||
        typeof inquiry.message !== "string" || !inquiry.message.trim() ||
        !STATUSES.includes(inquiry.status) ||
        typeof inquiry.createdAt !== "string" || !Number.isFinite(Date.parse(inquiry.createdAt)) ||
        (inquiry.email !== undefined && typeof inquiry.email !== "string") ||
        (inquiry.phone !== undefined && typeof inquiry.phone !== "string") ||
        (inquiry.replyDraft !== undefined && typeof inquiry.replyDraft !== "string")) {
      throw new Error("Saved inquiry data contains an invalid inquiry.");
    }
  }

  function getInquiries() {
    var raw;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      throw new Error("Browser storage is unavailable. Inquiries could not be loaded.");
    }
    if (raw === null) {
      return [];
    }

    var inquiries;
    try {
      inquiries = JSON.parse(raw);
    } catch (error) {
      throw new Error("Saved inquiry data is invalid and could not be read.");
    }
    if (!Array.isArray(inquiries)) {
      throw new Error("Saved inquiry data is invalid and could not be read.");
    }
    inquiries.forEach(validateInquiry);
    return inquiries;
  }

  function updateInquiry(reference, changes) {
    var inquiries = getInquiries();
    var index = inquiries.findIndex(function (inquiry) {
      return inquiry.reference === reference;
    });
    if (index < 0) {
      throw new Error("This inquiry could not be found.");
    }
    if (changes.status !== undefined && !STATUSES.includes(changes.status)) {
      throw new Error("The requested inquiry status is invalid.");
    }
    if (changes.replyDraft !== undefined && typeof changes.replyDraft !== "string") {
      throw new Error("The reply draft must be text.");
    }

    var updated = Object.assign({}, inquiries[index], changes, {
      updatedAt: new Date().toISOString()
    });
    validateInquiry(updated);
    inquiries[index] = updated;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inquiries));
    } catch (error) {
      throw new Error("The inquiry could not be saved in browser storage.");
    }
    return updated;
  }

  window.TTAdminInquiriesData = {
    getInquiries: getInquiries,
    updateInquiry: updateInquiry
  };
})();
