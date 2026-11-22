/* Validates the contact inquiry form and stores submissions in this browser only. */
(function () {
  "use strict";

  const form = document.querySelector("#ct-inquiry-form");
  if (!form) {
    return;
  }

  const storageKey = "tt_inquiries";
  const nameField = form.querySelector("#ct-inquiry-name");
  const emailField = form.querySelector("#ct-inquiry-email");
  const phoneField = form.querySelector("#ct-inquiry-phone");
  const packageField = form.querySelector("#ct-inquiry-package");
  const messageField = form.querySelector("#ct-inquiry-message");
  const messageCount = form.querySelector("#ct-inquiry-message-count");
  const status = form.querySelector("#ct-inquiry-status");
  const fields = [nameField, emailField, phoneField, messageField];
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^(?:09\d{9}|\+639\d{9})$/;

  /* Keeps status feedback in the form so save failures never look successful. */
  function showStatus(message, isError) {
    status.textContent = message;
    status.dataset.state = isError ? "error" : "success";
    status.hidden = false;
  }

  function clearStatus() {
    status.textContent = "";
    status.hidden = true;
    status.removeAttribute("data-state");
  }

  /* Displays or clears the inline validation feedback associated with a field. */
  function setFieldError(field, message) {
    const error = form.querySelector("#" + field.id + "-error");
    if (message) {
      field.setAttribute("aria-invalid", "true");
      error.textContent = message;
      error.hidden = false;
      return false;
    }

    field.removeAttribute("aria-invalid");
    error.textContent = "";
    error.hidden = true;
    return true;
  }

  /* Applies the field-specific rules and returns whether the value is valid. */
  function validateField(field) {
    const value = field.value.trim();
    let errorMessage = "";

    if (field === nameField) {
      if (!value) {
        errorMessage = "Enter your full name.";
      } else {
        const letterCount = Array.from(value).filter(function (character) {
          return /\p{L}/u.test(character);
        }).length;
        if (letterCount < 2) {
          errorMessage = "Enter at least two letters for your name.";
        }
      }
    } else if (field === emailField) {
      if (!value) {
        errorMessage = "Enter your email address.";
      } else if (!emailPattern.test(value)) {
        errorMessage = "Enter a valid email address.";
      }
    } else if (field === phoneField) {
      if (!value) {
        errorMessage = "Enter your contact number.";
      } else if (!phonePattern.test(value)) {
        errorMessage = "Use 09XXXXXXXXX or +639XXXXXXXXX format.";
      }
    } else if (field === messageField) {
      if (!value) {
        errorMessage = "Enter a message.";
      } else if (value.length < 10) {
        errorMessage = "Your message must be at least 10 characters.";
      } else if (field.value.length > 500) {
        errorMessage = "Your message must be no more than 500 characters.";
      }
    }

    return setFieldError(field, errorMessage);
  }

  /* Creates the next reference number from valid existing inquiry IDs. */
  function nextInquiryId(records) {
    let highestNumber = 0;

    for (let index = 0; index < records.length; index += 1) {
      const record = records[index];
      const inquiryId = record && typeof record.inquiry_id === "string"
        ? record.inquiry_id
        : "";
      const match = /^INQ-(\d+)$/.exec(inquiryId);

      if (match) {
        highestNumber = Math.max(highestNumber, Number(match[1]));
      }
    }

    return "INQ-" + String(highestNumber + 1).padStart(4, "0");
  }

  /* Reads existing records without discarding malformed or inaccessible storage. */
  function readInquiries() {
    let storedValue;
    try {
      storedValue = window.localStorage.getItem(storageKey);
    } catch (error) {
      showStatus("This browser could not access local storage. Please try again or use Email us.", true);
      return null;
    }

    if (storedValue === null) {
      return [];
    }

    let records;
    try {
      records = JSON.parse(storedValue);
    } catch (error) {
      showStatus("Saved inquiry data could not be read, so this submission was not saved.", true);
      return null;
    }

    if (!Array.isArray(records)) {
      showStatus("Saved inquiry data has an unexpected format, so this submission was not saved.", true);
      return null;
    }

    return records;
  }

  /* Updates the live message counter and mirrors validation after the first error. */
  function handleMessageInput() {
    messageCount.textContent = messageField.value.length + " / 500 characters";
    if (messageField.getAttribute("aria-invalid") === "true") {
      validateField(messageField);
    }
  }

  fields.forEach(function (field) {
    field.addEventListener("blur", function () {
      validateField(field);
    });

    field.addEventListener("input", function () {
      if (field.getAttribute("aria-invalid") === "true") {
        validateField(field);
      }
    });
  });

  messageField.addEventListener("input", handleMessageInput);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearStatus();

    let firstInvalidField = null;
    fields.forEach(function (field) {
      if (!validateField(field) && firstInvalidField === null) {
        firstInvalidField = field;
      }
    });

    if (firstInvalidField) {
      firstInvalidField.focus();
      return;
    }

    const inquiries = readInquiries();
    if (inquiries === null) {
      return;
    }

    const inquiryId = nextInquiryId(inquiries);
    const inquiry = {
      inquiry_id: inquiryId,
      full_name: nameField.value.trim(),
      email: emailField.value.trim(),
      contact_number: phoneField.value.trim(),
      package_code: packageField.value || null,
      message: messageField.value.trim(),
      inquiry_status: "New",
      submitted_at: new Date().toISOString()
    };

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(inquiries.concat(inquiry)));
    } catch (error) {
      showStatus("This browser could not save your inquiry. Please try again or use Email us.", true);
      return;
    }

    form.reset();
    fields.forEach(function (field) {
      setFieldError(field, "");
    });
    handleMessageInput();
    showStatus("Your inquiry was saved in this browser. Reference: " + inquiryId + ".", false);
  });
})();
