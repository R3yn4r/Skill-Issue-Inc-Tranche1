/* Shared behavior for every Teyvat Travels page. Each feature is optional: if its markup is missing, it exits quietly. */
(function () {
  "use strict";

  const isHome = document.body.classList.contains("home-page");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const supportsViewTimeline = Boolean(window.CSS && CSS.supports && CSS.supports("animation-timeline: view()"));
  const supportsScrollTimeline = Boolean(window.CSS && CSS.supports && CSS.supports("animation-timeline: scroll()"));

  /* ------------------------------------------------------------------
     1. Mobile menu: close on link tap, Escape, outside click, or resize
     ------------------------------------------------------------------ */
  function initMobileMenu() {
    const toggle = document.getElementById("menu-toggle");
    const header = document.querySelector(".site-header");
    const nav = document.querySelector(".site-nav");
    if (!toggle || !header || !nav) {
      return;
    }

    const details = nav.querySelector(".site-nav__details");
    const desktopQuery = window.matchMedia("(min-width: 961px)");

    /* Unchecks the hamburger and collapses the Destinations list so it reopens clean. */
    function closeMenu(returnFocus) {
      if (!toggle.checked) {
        return;
      }

      toggle.checked = false;
      if (details) {
        details.open = false;
      }
      if (returnFocus) {
        toggle.focus();
      }
    }

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a[href]")) {
        closeMenu(false);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMenu(true);
      }
    });

    document.addEventListener("click", function (event) {
      if (!header.contains(event.target)) {
        closeMenu(false);
      }
    });

    desktopQuery.addEventListener("change", function () {
      if (desktopQuery.matches) {
        closeMenu(false);
      }
    });
  }

  /* ------------------------------------------------------------------
     2. Landmark lightbox (radio + label markup): keyboard support
     ------------------------------------------------------------------ */
  function initLightbox() {
    const closedRadio = document.getElementById("mv-closed");
    if (!closedRadio) {
      return;
    }

    const radios = Array.from(document.querySelectorAll('input[type="radio"][id^="mv-"]'));
    const controlSelector = '[class*="overlay__close"], [class*="overlay__btn"]';
    let currentId = null;
    let lastAction = "close";

    /* Returns the landmark radio that is currently open, or null when the viewer is closed. */
    function getOpenRadio() {
      for (let index = 0; index < radios.length; index += 1) {
        if (radios[index].checked && radios[index] !== closedRadio) {
          return radios[index];
        }
      }
      return null;
    }

    /* Finds the dialog that belongs to a radio, such as mv-2 to *-overlay-2. */
    function getDialog(radio) {
      return document.querySelector('[role="dialog"][id$="-overlay-' + radio.id.replace("mv-", "") + '"]');
    }

    /* Triggers a radio through a click so the browser also fires its change event. */
    function selectRadio(id) {
      const radio = document.getElementById(id);
      if (radio) {
        radio.click();
      }
    }

    /* Makes the viewer buttons real keyboard targets, since plain labels are not focusable. */
    document.querySelectorAll('[role="dialog"] ' + controlSelector.split(", ").join(', [role="dialog"] ')).forEach(function (control) {
      control.setAttribute("tabindex", "0");
      control.setAttribute("role", "button");
    });

    /* Remembers which control was used so focus can stay on the same kind of control afterward. */
    document.addEventListener("click", function (event) {
      const label = event.target.closest("label");
      if (!label) {
        return;
      }

      if (label.className.indexOf("btn--next") !== -1) {
        lastAction = "next";
      } else if (label.className.indexOf("btn--prev") !== -1) {
        lastAction = "prev";
      } else {
        lastAction = "close";
      }
    });

    /* Moves focus into the opened dialog, or back to its gallery card when the viewer closes. */
    radios.forEach(function (radio) {
      radio.addEventListener("change", function () {
        if (!radio.checked) {
          return;
        }

        if (radio === closedRadio) {
          const card = currentId && document.querySelector('label[role="button"][for="' + currentId + '"]');
          currentId = null;
          if (card) {
            card.focus();
          }
          return;
        }

        currentId = radio.id;
        const dialog = getDialog(radio);
        if (!dialog) {
          return;
        }

        window.setTimeout(function () {
          const target = dialog.querySelector('[class*="btn--' + lastAction + '"]') ||
            dialog.querySelector('[class*="overlay__close"]');
          if (target) {
            target.focus();
          }
        }, 50);
      });
    });

    document.addEventListener("keydown", function (event) {
      /* Enter and Space activate the gallery cards and viewer buttons like real buttons. */
      const target = event.target;
      if ((event.key === "Enter" || event.key === " ") &&
          target.tagName === "LABEL" && target.getAttribute("role") === "button") {
        event.preventDefault();
        target.click();
        return;
      }

      const openRadio = getOpenRadio();
      if (!openRadio) {
        return;
      }

      const dialog = getDialog(openRadio);

      if (event.key === "Escape") {
        event.preventDefault();
        lastAction = "close";
        closedRadio.click();
      } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        const direction = event.key === "ArrowRight" ? "next" : "prev";
        const button = dialog && dialog.querySelector('[class*="btn--' + direction + '"]');
        if (button) {
          event.preventDefault();
          lastAction = direction;
          selectRadio(button.getAttribute("for"));
        }
      } else if (event.key === "Tab" && dialog) {
        /* Keeps Tab inside the open dialog. */
        const controls = Array.from(dialog.querySelectorAll(controlSelector));
        if (controls.length === 0) {
          return;
        }

        const first = controls[0];
        const last = controls[controls.length - 1];
        const active = document.activeElement;

        if (!dialog.contains(active)) {
          event.preventDefault();
          first.focus();
        } else if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  /* ------------------------------------------------------------------
     3. Home page: highlight the nav link for the section in view
     ------------------------------------------------------------------ */
  function initScrollSpy() {
    if (!isHome || !("IntersectionObserver" in window)) {
      return;
    }

    const nav = document.querySelector(".site-nav");
    if (!nav) {
      return;
    }

    const links = Array.from(nav.querySelectorAll(":scope > .site-nav__link"));
    const sectionMap = [
      [".hx-hero", "#top"],
      [".hx-packages, .hx-offerings", "#packages"],
      [".hx-who, .hx-director, .hx-purpose", "#who-we-are"],
      [".hx-faq", "#faq"],
      [".hx-contact", "#contact"]
    ];

    /* Marks one nav link as the current page position and clears the rest. */
    function setActive(href) {
      for (let index = 0; index < links.length; index += 1) {
        const isMatch = links[index].getAttribute("href") === href;
        links[index].classList.toggle("is-active", isMatch);
        if (isMatch) {
          links[index].setAttribute("aria-current", "page");
        } else {
          links[index].removeAttribute("aria-current");
        }
      }
    }

    /* A thin band across the middle of the screen decides which section is "current". */
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setActive(entry.target.dataset.spyHref);
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    sectionMap.forEach(function (pair) {
      document.querySelectorAll(pair[0]).forEach(function (section) {
        section.dataset.spyHref = pair[1];
        observer.observe(section);
      });
    });
  }

  /* ------------------------------------------------------------------
     4. Fallbacks for browsers without scroll-driven CSS animations
     ------------------------------------------------------------------ */

  /* Fades .reveal blocks in as they enter the screen when animation-timeline: view() is missing. */
  function initRevealFallback() {
    if (supportsViewTimeline || reducedMotionQuery.matches || !("IntersectionObserver" in window)) {
      return;
    }

    const items = document.querySelectorAll(".reveal");

    items.forEach(function (item) {
      item.style.animation = "none";
      item.style.opacity = "0";
      item.style.transform = "translateY(18px)";
    });

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }

        const item = entry.target;
        observer.unobserve(item);
        item.style.transition = "opacity 800ms ease, transform 800ms ease";
        item.style.opacity = "1";
        item.style.transform = "none";

        /* Clear the inline values afterward so the card hover lift from the stylesheet works again. */
        window.setTimeout(function () {
          item.style.opacity = "";
          item.style.transform = "";
          item.style.transition = "";
        }, 900);
      });
    }, { threshold: 0.12 });

    items.forEach(function (item) {
      observer.observe(item);
    });
  }

  /* Darkens the header over the first 140px of scroll when animation-timeline: scroll() is missing. */
  function initHeaderGlassFallback() {
    const header = document.querySelector(".site-header");
    if (!header || supportsScrollTimeline) {
      return;
    }

    let ticking = false;

    function update() {
      const progress = Math.min(window.scrollY / 140, 1);
      const mix = function (from, to) {
        return Math.round(from + (to - from) * progress);
      };

      header.style.backgroundColor =
        "rgba(" + mix(16, 10) + ", " + mix(28, 22) + ", " + mix(27, 23) + ", " + (0.82 + 0.1 * progress).toFixed(2) + ")";
      header.style.borderBottomColor = "rgba(255, 255, 255, " + (0.14 - 0.06 * progress).toFixed(2) + ")";
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });

    update();
  }

  /* ------------------------------------------------------------------
     5. FAQ: keep one answer open at a time
     ------------------------------------------------------------------ */
  function initFaqAccordion() {
    const items = Array.from(document.querySelectorAll(".hx-faq-item"));

    items.forEach(function (item) {
      item.addEventListener("toggle", function () {
        if (!item.open) {
          return;
        }

        items.forEach(function (other) {
          if (other !== item) {
            other.open = false;
          }
        });
      });
    });
  }

  /* Runs every feature after the deferred document has been parsed. */
  initMobileMenu();
  initLightbox();
  initScrollSpy();
  initRevealFallback();
  initHeaderGlassFallback();
  initFaqAccordion();
})();