(function () {
  var form = document.getElementById('inquiry-form');
  if (!form) return;

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
    }

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      credentials: 'same-origin'
    }).then(function (response) {
      if (!response.ok) throw new Error('Submission failed');
      window.location.href = response.url || 'index.php#contact';
    }).catch(function () {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Send inquiry';
      }
      var alert = document.querySelector('.ct-form-alert');
      if (!alert) {
        alert = document.createElement('div');
        alert.className = 'ct-form-alert ct-form-alert--error';
        form.parentNode.insertBefore(alert, form);
      }
      alert.textContent = 'Your inquiry could not be submitted. Please try again.';
    });
  });
})();
