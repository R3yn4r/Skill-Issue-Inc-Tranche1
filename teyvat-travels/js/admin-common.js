/* Shared behavior for every admin page: mobile menu, top bar search, toast messages and the confirm
   dialog. Each feature is optional: if its markup is missing on a page, it exits quietly.
   Load admin-data.js before this file. */
(function () {
  "use strict";

  const data = window.TTAdmin.data;
  const FLASH_KEY = "tt_admin_flash";
  const TOAST_TIME = 3200;

  /* Creates an element with an optional class and text. Text is set with textContent, never innerHTML. */
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (text !== undefined) {
      node.textContent = text;
    }
    return node;
  }

  /* ------------------------------------------------------------------
     1. Toast message (bottom right, announced politely to screen readers)
     ------------------------------------------------------------------ */
  let toastTimer = null;

  function toast(message, isError) {
    const box = document.getElementById("ad-toast");
    if (!box) {
      return;
    }
    window.clearTimeout(toastTimer);
    box.textContent = message;
    box.classList.toggle("ad-toast--error", Boolean(isError));
    box.classList.add("is-visible");
    toastTimer = window.setTimeout(function () {
      box.classList.remove("is-visible");
    }, TOAST_TIME);
  }

  /* Remembers a message for the next page, so a toast can survive a redirect. */
  function flash(message) {
    try {
      window.sessionStorage.setItem(FLASH_KEY, message);
    } catch (error) {
      /* Storage unavailable: the message is simply skipped. */
    }
  }

  /* Shows and clears a message left by the previous page. */
  function showFlash() {
    try {
      const message = window.sessionStorage.getItem(FLASH_KEY);
      if (message) {
        window.sessionStorage.removeItem(FLASH_KEY);
        toast(message);
      }
    } catch (error) {
      /* Nothing to show. */
    }
  }

  /* ------------------------------------------------------------------
     2. Confirm dialog (native <dialog>: focus trap and Escape come for free)
     ------------------------------------------------------------------ */
  /* Opens the page's #ad-confirm dialog and resolves true (confirmed) or false (cancelled). */
  function confirmDialog(options) {
    const dialog = document.getElementById("ad-confirm");
    if (!dialog || typeof dialog.showModal !== "function") {
      return Promise.resolve(window.confirm(options.message));
    }

    const confirmButton = dialog.querySelector("[data-confirm-ok]");
    dialog.querySelector("[data-confirm-title]").textContent = options.title;
    dialog.querySelector("[data-confirm-text]").textContent = options.message;
    confirmButton.textContent = options.confirmLabel || "Confirm";
    confirmButton.classList.toggle("ad-btn--danger", Boolean(options.danger));
    confirmButton.classList.toggle("ad-btn--primary", !options.danger);

    return new Promise(function (resolve) {
      function finish(result) {
        dialog.removeEventListener("close", onClose);
        confirmButton.removeEventListener("click", onOk);
        resolve(result);
      }
      function onOk() {
        dialog.returnValue = "ok";
        dialog.close();
      }
      function onClose() {
        finish(dialog.returnValue === "ok");
      }
      dialog.returnValue = "cancel";
      confirmButton.addEventListener("click", onOk);
      dialog.addEventListener("close", onClose);
      dialog.showModal();
    });
  }

  /* ------------------------------------------------------------------
     3. Mobile menu: the sidebar slides in under 961px
     ------------------------------------------------------------------ */
  function initMobileMenu() {
    const button = document.getElementById("ad-menu-btn");
    const sidebar = document.getElementById("ad-sidebar");
    const scrim = document.getElementById("ad-scrim");
    if (!button || !sidebar || !scrim) {
      return;
    }

    const mobile = window.matchMedia("(max-width: 960px)");

    /* Keeps the hidden sidebar out of the tab order on small screens. */
    function sync(open) {
      document.body.classList.toggle("ad-nav-open", open);
      button.setAttribute("aria-expanded", String(open));
      scrim.hidden = !open;
      sidebar.inert = mobile.matches && !open;
    }

    button.addEventListener("click", function () {
      sync(true);
      const first = sidebar.querySelector("a");
      if (first) {
        first.focus();
      }
    });
    scrim.addEventListener("click", function () {
      sync(false);
      button.focus();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && document.body.classList.contains("ad-nav-open")) {
        sync(false);
        button.focus();
      }
    });
    mobile.addEventListener("change", function () {
      sync(false);
    });
    sync(false);
  }

  /* ------------------------------------------------------------------
     4. Top bar search: packages, bookings and clients in one list
     ------------------------------------------------------------------ */
  function initSearch() {
    const input = document.getElementById("ad-search");
    const list = document.getElementById("ad-search-results");
    if (!input || !list) {
      return;
    }

    let items = [];
    let active = -1;

    /* Builds the matching rows. Packages link to their edit page; the rest link to their own pages. */
    function findMatches(query) {
      const text = query.toLowerCase();
      const matches = [];

      data.getPackages().forEach(function (pkg) {
        const haystack = (pkg.package_name + " " + pkg.package_code + " " + pkg.nation).toLowerCase();
        if (haystack.indexOf(text) !== -1) {
          matches.push({ label: pkg.package_name + " (" + pkg.package_code + ")", kind: "Package",
            href: "admin-package-edit.html?code=" + encodeURIComponent(pkg.package_code) });
        }
      });

      data.getBookings().forEach(function (booking) {
        const haystack = (booking.client + " " + booking.reference + " " + booking.email).toLowerCase();
        if (haystack.indexOf(text) !== -1) {
          matches.push({ label: booking.client + " · " + booking.reference, kind: "Booking",
            href: "bookings.html?ref=" + encodeURIComponent(booking.reference) });
        }
      });

      return matches.slice(0, 6);
    }

    /* Marks one row as the keyboard-selected option. */
    function setActive(index) {
      active = index;
      Array.from(list.children).forEach(function (row, position) {
        row.setAttribute("aria-selected", String(position === index));
      });
      if (index >= 0) {
        input.setAttribute("aria-activedescendant", list.children[index].id);
      } else {
        input.removeAttribute("aria-activedescendant");
      }
    }

    function close() {
      list.hidden = true;
      input.setAttribute("aria-expanded", "false");
      setActive(-1);
    }

    function render() {
      const query = input.value.trim();
      if (query.length < 2) {
        close();
        return;
      }

      items = findMatches(query);
      list.textContent = "";

      if (items.length === 0) {
        list.appendChild(el("li", "ad-search__empty", "No results for \"" + query + "\"."));
      } else {
        items.forEach(function (item, index) {
          const row = el("li", "ad-search__item");
          row.id = "ad-search-option-" + index;
          row.setAttribute("role", "option");
          row.setAttribute("aria-selected", "false");
          row.appendChild(el("span", "ad-search__label", item.label));
          row.appendChild(el("span", "ad-search__kind", item.kind));
          row.addEventListener("mousedown", function (event) {
            event.preventDefault();
            window.location.href = item.href;
          });
          list.appendChild(row);
        });
      }

      list.hidden = false;
      input.setAttribute("aria-expanded", "true");
      setActive(-1);
    }

    input.addEventListener("input", render);
    input.addEventListener("blur", close);
    input.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        close();
      } else if (event.key === "ArrowDown" && items.length > 0 && !list.hidden) {
        event.preventDefault();
        setActive((active + 1) % items.length);
      } else if (event.key === "ArrowUp" && items.length > 0 && !list.hidden) {
        event.preventDefault();
        setActive(active <= 0 ? items.length - 1 : active - 1);
      } else if (event.key === "Enter" && active >= 0) {
        event.preventDefault();
        window.location.href = items[active].href;
      }
    });
  }

  /* ------------------------------------------------------------------
     5. Public helpers for the page scripts, then start-up
     ------------------------------------------------------------------ */
  window.TTAdmin.ui = { el: el, toast: toast, flash: flash, confirm: confirmDialog };

  initMobileMenu();
  initSearch();
  showFlash();
})();
