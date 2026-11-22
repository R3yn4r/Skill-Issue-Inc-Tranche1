/* Sign-in page behavior: validation, show/hide password, Caps Lock notice, and the submit flow.
   This is front-end only. Real authentication has to happen on the server, which should compare the
   password against the stored hash. Nothing here decides who is allowed in. */
(function () {
  "use strict";

  const form = document.getElementById("si-form");
  if (!form) {
    return;
  }

  const USERNAME_MIN = 3;
  const USERNAME_MAX = 50; /* matches users_admins.username VARCHAR(50) */
  const USERNAME_PATTERN = /^[A-Za-z0-9._-]+$/;
  const PASSWORD_MIN = 8;
  const REQUEST_TIMEOUT = 10000;
  const REDIRECT_DELAY = 600;

  const endpoint = (form.dataset.endpoint || "").trim();
  const successUrl = (form.dataset.successUrl || "").trim();

  const usernameInput = document.getElementById("si-username");
  const passwordInput = document.getElementById("si-password");
  const rememberInput = document.getElementById("si-remember");
  const revealButton = document.getElementById("si-reveal");
  const capsHint = document.getElementById("si-caps");
  const statusBox = document.getElementById("si-status");
  const submitButton = document.getElementById("si-submit");
  const submitLabel = submitButton.querySelector(".si-submit__label");
  const fields = [usernameInput, passwordInput];

  let isSubmitting = false;

  /* Returns an error message for a field, or an empty string when it is valid. */
  function getError(field) {
    if (field === usernameInput) {
      const value = field.value.trim();

      if (!value) {
        return "Enter your username.";
      }
      if (value.length < USERNAME_MIN) {
        return "Your username is at least " + USERNAME_MIN + " characters.";
      }
      if (value.length > USERNAME_MAX) {
        return "Your username is at most " + USERNAME_MAX + " characters.";
      }
      if (!USERNAME_PATTERN.test(value)) {
        return "Use only letters, numbers, dots, dashes, or underscores.";
      }
      return "";
    }

    if (field === passwordInput) {
      if (!field.value) {
        return "Enter your password.";
      }
      if (field.value.length < PASSWORD_MIN) {
        return "Your password is at least " + PASSWORD_MIN + " characters.";
      }
    }
    return "";
  }

  /* Shows or clears the inline error under a field and keeps the aria attributes in sync. */
  function setFieldError(field, message) {
    const errorElement = document.getElementById(field.id + "-error");

    if (message) {
      errorElement.textContent = message;
      errorElement.hidden = false;
      field.setAttribute("aria-invalid", "true");
    } else {
      errorElement.textContent = "";
      errorElement.hidden = true;
      field.removeAttribute("aria-invalid");
    }
  }

  /* Shows a message above the button. Errors are announced at once, other messages politely. */
  function showStatus(message, kind) {
    statusBox.textContent = message;
    statusBox.className = "si-status" + (kind ? " si-status--" + kind : "");
    statusBox.setAttribute("role", kind === "error" ? "alert" : "status");
    statusBox.hidden = false;
  }

  /* Removes the status message. */
  function clearStatus() {
    statusBox.textContent = "";
    statusBox.className = "si-status";
    statusBox.removeAttribute("role");
    statusBox.hidden = true;
  }

  /* Locks the form while a request is running so a double click cannot send it twice. */
  function setBusy(busy) {
    isSubmitting = busy;
    submitButton.setAttribute("aria-busy", String(busy));
    submitLabel.textContent = busy ? "Signing in" : "Sign in";
    fields.forEach(function (field) {
      field.readOnly = busy;
    });
  }

  /* Re-checks a field the visitor is fixing, but only once it has been flagged. */
  function handleFieldInput(event) {
    const field = event.currentTarget;
    if (field.getAttribute("aria-invalid") === "true") {
      setFieldError(field, getError(field));
    }
    clearStatus();
  }

  /* Toggles the padlock between hidden and visible password, keeping the caret where it was. */
  function handleRevealClick() {
    const show = passwordInput.type === "password";
    const start = passwordInput.selectionStart;
    const end = passwordInput.selectionEnd;

    passwordInput.type = show ? "text" : "password";
    revealButton.setAttribute("aria-pressed", String(show));
    revealButton.setAttribute("aria-label", show ? "Hide password" : "Show password");
    passwordInput.focus();
    passwordInput.setSelectionRange(start, end);
  }

  /* Shows a notice while Caps Lock is on, since the password is hidden and a typo is easy to miss. */
  function handleCapsLock(event) {
    if (typeof event.getModifierState !== "function") {
      return;
    }
    capsHint.hidden = !event.getModifierState("CapsLock");
  }

  /* Waits for a number of milliseconds. */
  function wait(milliseconds) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, milliseconds);
    });
  }

  /* Sends the credentials to the server and returns { status: "ok" | "invalid" | "demo" | "error" }. */
  async function requestSignIn(payload) {
    if (!endpoint) {
      await wait(700);
      return { status: "demo" };
    }

    const controller = new AbortController();
    const timer = window.setTimeout(function () {
      controller.abort();
    }, REQUEST_TIMEOUT);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      if (response.ok) {
        let redirect = "";
        try {
          const data = await response.json();
          redirect = typeof data.redirect === "string" ? data.redirect : "";
        } catch (parseError) {
          redirect = "";
        }
        return { status: "ok", redirect: redirect };
      }

      if (response.status === 400 || response.status === 401 || response.status === 403) {
        return { status: "invalid" };
      }
      return { status: "error" };
    } catch (networkError) {
      return { status: "error" };
    } finally {
      window.clearTimeout(timer);
    }
  }

  /* Only follows redirects to a page on this site, never an outside address. */
  function safeRedirect(target) {
    if (!target) {
      return successUrl;
    }

    try {
      const url = new URL(target, window.location.href);
      return url.origin === window.location.origin ? url.href : successUrl;
    } catch (urlError) {
      return successUrl;
    }
  }

  /* Validates, then signs in. Focus goes to the first invalid field when something is wrong. */
  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    clearStatus();

    let firstInvalid = null;
    fields.forEach(function (field) {
      const message = getError(field);
      setFieldError(field, message);
      if (message && !firstInvalid) {
        firstInvalid = field;
      }
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    setBusy(true);
    const result = await requestSignIn({
      username: usernameInput.value.trim(),
      password: passwordInput.value,
      remember: rememberInput.checked
    });

    if (result.status === "ok") {
      showStatus("Signed in. Taking you to your workspace.", "success");
      await wait(REDIRECT_DELAY);
      window.location.assign(safeRedirect(result.redirect));
      return;
    }

    setBusy(false);

    if (result.status === "demo") {
      showStatus("Your details look good, but sign-in is not connected to a server yet. It will work once the database and login are added.");
    } else if (result.status === "invalid") {
      showStatus("Incorrect username or password. Check both and try again.", "error");
      passwordInput.value = "";
      passwordInput.focus();
    } else {
      showStatus("We could not reach the server. Check your connection and try again.", "error");
    }
  }

  fields.forEach(function (field) {
    field.addEventListener("input", handleFieldInput);
  });

  revealButton.addEventListener("click", handleRevealClick);
  passwordInput.addEventListener("keydown", handleCapsLock);
  passwordInput.addEventListener("keyup", handleCapsLock);
  passwordInput.addEventListener("blur", function () {
    capsHint.hidden = true;
  });
  form.addEventListener("submit", handleSubmit);
})();