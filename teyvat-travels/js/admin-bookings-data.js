/* Browser-persisted booking records shared by Bookings and Availability. */
(function () {
  "use strict";

  var STORAGE_KEY = "tt_admin_bookings_v1";
  var BOOKING_STATUSES = ["Pending", "Confirmed", "Rejected"];
  var PAYMENT_STATUSES = ["Pending", "Paid"];

  function isValidDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false;
    }
    var parts = value.split("-").map(Number);
    var date = new Date(parts[0], parts[1] - 1, parts[2]);
    return date.getFullYear() === parts[0] &&
      date.getMonth() === parts[1] - 1 &&
      date.getDate() === parts[2];
  }

  function validateBooking(booking) {
    if (!booking || typeof booking.reference !== "string" ||
        typeof booking.client !== "string" || !booking.client.trim() ||
        typeof booking.packageId !== "string" || !booking.packageId ||
        !isValidDate(booking.travelDate) ||
        !Number.isSafeInteger(booking.guests) || booking.guests < 1 ||
        !BOOKING_STATUSES.includes(booking.bookingStatus) ||
        !PAYMENT_STATUSES.includes(booking.paymentStatus) ||
        !Number.isFinite(booking.total) || booking.total < 0 ||
        typeof booking.createdAt !== "string" || !Number.isFinite(Date.parse(booking.createdAt))) {
      throw new Error("Saved booking data contains an invalid booking.");
    }
  }

  function readBookings() {
    var raw;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      throw new Error("Browser storage is unavailable. Bookings could not be loaded.");
    }
    if (raw === null) {
      return [];
    }

    var bookings;
    try {
      bookings = JSON.parse(raw);
    } catch (error) {
      throw new Error("Saved booking data is invalid and could not be read.");
    }
    if (!Array.isArray(bookings)) {
      throw new Error("Saved booking data is invalid and could not be read.");
    }
    bookings.forEach(validateBooking);
    return bookings;
  }

  function writeBookings(bookings) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    } catch (error) {
      throw new Error("Bookings could not be saved in browser storage.");
    }
  }

  function makeReference(bookings, year) {
    var prefix = "BK-" + year + "-";
    var highest = bookings.reduce(function (max, booking) {
      if (booking.reference.indexOf(prefix) !== 0) {
        return max;
      }
      var sequence = Number(booking.reference.slice(prefix.length));
      return Number.isSafeInteger(sequence) ? Math.max(max, sequence) : max;
    }, 0);
    var reference;
    do {
      highest += 1;
      reference = prefix + String(highest).padStart(4, "0");
    } while (bookings.some(function (booking) { return booking.reference === reference; }));
    return reference;
  }

  function getBookings() {
    return readBookings();
  }

  function getForDate(packageId, date) {
    return readBookings().filter(function (booking) {
      return booking.packageId === String(packageId) && booking.travelDate === date;
    });
  }

  function getConfirmedGuests(packageId, date, exceptReference) {
    return getForDate(packageId, date).reduce(function (total, booking) {
      if (booking.bookingStatus !== "Confirmed" || booking.reference === exceptReference) {
        return total;
      }
      return total + booking.guests;
    }, 0);
  }

  function createBooking(input) {
    var bookings = readBookings();
    var now = new Date();
    var booking = {
      reference: makeReference(bookings, now.getFullYear()),
      client: input.client.trim(),
      packageId: String(input.packageId),
      travelDate: input.travelDate,
      guests: input.guests,
      total: input.total,
      bookingStatus: "Pending",
      paymentStatus: "Pending",
      createdAt: now.toISOString()
    };
    validateBooking(booking);
    bookings.push(booking);
    writeBookings(bookings);
    return booking;
  }

  function updateBooking(reference, changes) {
    var bookings = readBookings();
    var index = bookings.findIndex(function (booking) {
      return booking.reference === reference;
    });
    if (index < 0) {
      throw new Error("This booking could not be found.");
    }
    var updated = Object.assign({}, bookings[index], changes);
    validateBooking(updated);
    bookings[index] = updated;
    writeBookings(bookings);
    return updated;
  }

  window.TTAdminBookingsData = {
    getBookings: getBookings,
    getForDate: getForDate,
    getConfirmedGuests: getConfirmedGuests,
    createBooking: createBooking,
    updateBooking: updateBooking
  };
})();
