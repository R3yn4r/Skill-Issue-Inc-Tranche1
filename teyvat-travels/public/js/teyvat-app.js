(function () {
  'use strict';

  function escapeHtml(value) {
    var element = document.createElement('span');
    element.textContent = value == null ? '' : String(value);
    return element.innerHTML;
  }

  function setupFaqs() {
    var list = document.querySelector('[data-faq-list]');
    if (!list) return;
    TeyvatDB.getAll('faqs').then(function (faqs) {
      faqs.sort(function (a, b) { return a.sortOrder - b.sortOrder; });
      list.innerHTML = faqs.filter(function (faq) { return faq.published; }).map(function (faq) {
        return '<details class="hx-faq-item"><summary class="hx-faq-question">' +
          escapeHtml(faq.question) + '</summary><p class="hx-faq-answer">' +
          escapeHtml(faq.answer) + '</p></details>';
      }).join('');
    });
  }

  function setupInquiryForm() {
    var form = document.getElementById('inquiry-form');
    if (!form) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var data = new FormData(form);
      var name = String(data.get('name') || '').trim();
      var email = String(data.get('email') || '').trim();
      var subject = String(data.get('subject') || '').trim();
      var message = String(data.get('message') || '').trim();
      var alert = form.parentNode.querySelector('[data-form-alert]');

      if (!name || !email || !message) {
        if (alert) {
          alert.textContent = 'Name, email, and message are required.';
          alert.className = 'ct-form-alert ct-form-alert--error';
        }
        return;
      }

      TeyvatDB.put('inquiries', {
        name: name,
        email: email,
        subject: subject,
        message: message,
        isRead: false,
        createdAt: new Date().toISOString()
      }).then(function () {
        form.reset();
        if (alert) {
          alert.textContent = 'Thank you. Your inquiry has been saved.';
          alert.className = 'ct-form-alert ct-form-alert--success';
        }
      }).catch(function () {
        if (alert) {
          alert.textContent = 'Your inquiry could not be saved. Please try again.';
          alert.className = 'ct-form-alert ct-form-alert--error';
        }
      });
    });
  }

  function setupAdmin() {
    if (!document.querySelector('[data-browser-crud]')) return;

    TeyvatDB.getAll('inquiries').then(function (inquiries) {
      var inbox = document.querySelector('[data-inquiry-list]');
      if (!inbox) return;

      inquiries.sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
      inbox.innerHTML = inquiries.length ? inquiries.map(function (inquiry) {
        return '<article class="inquiry"><h3>' + escapeHtml(inquiry.subject || 'General inquiry') + '</h3>' +
          '<p>' + escapeHtml(inquiry.name) + ' — ' + escapeHtml(inquiry.email) + '</p>' +
          '<p>' + escapeHtml(inquiry.message) + '</p>' +
          '<button type="button" data-read-inquiry="' + inquiry.id + '">' +
          (inquiry.isRead ? 'Read' : 'Mark read') + '</button> ' +
          '<button type="button" data-delete-inquiry="' + inquiry.id + '">Delete</button></article>';
      }).join('') : '<p>No inquiries yet.</p>';

      inbox.querySelectorAll('[data-read-inquiry]').forEach(function (button) {
        button.addEventListener('click', function () {
          TeyvatDB.getById('inquiries', Number(button.dataset.readInquiry)).then(function (inquiry) {
            inquiry.isRead = true;
            return TeyvatDB.put('inquiries', inquiry);
          }).then(setupAdmin);
        });
      });

      inbox.querySelectorAll('[data-delete-inquiry]').forEach(function (button) {
        button.addEventListener('click', function () {
          TeyvatDB.delete('inquiries', Number(button.dataset.deleteInquiry)).then(setupAdmin);
        });
      });
    });
  }

  function setupBrowserCrud() {
    var packageList = document.querySelector('[data-package-list]');
    var faqList = document.querySelector('[data-admin-faq-list]');

    if (packageList) {
      TeyvatDB.getAll('packages').then(function (packages) {
        packageList.innerHTML = packages.map(function (pkg) {
          return '<article><h3>' + escapeHtml(pkg.title) + '</h3>' +
            '<button type="button" data-toggle-package="' + pkg.id + '">' +
            (pkg.active ? 'Deactivate' : 'Activate') + '</button> ' +
            '<button type="button" data-delete-package="' + pkg.id + '">Delete</button></article>';
        }).join('');

        packageList.querySelectorAll('[data-toggle-package]').forEach(function (button) {
          button.addEventListener('click', function () {
            TeyvatDB.getById('packages', Number(button.dataset.togglePackage)).then(function (pkg) {
              pkg.active = !pkg.active;
              return TeyvatDB.put('packages', pkg);
            }).then(setupBrowserCrud);
          });
        });

        packageList.querySelectorAll('[data-delete-package]').forEach(function (button) {
          button.addEventListener('click', function () {
            TeyvatDB.delete('packages', Number(button.dataset.deletePackage)).then(setupBrowserCrud);
          });
        });
      });
    }

    if (faqList) {
      TeyvatDB.getAll('faqs').then(function (faqs) {
        faqList.innerHTML = faqs.map(function (faq) {
          return '<article><h3>' + escapeHtml(faq.question) + '</h3>' +
            '<p>' + escapeHtml(faq.answer) + '</p>' +
            '<button type="button" data-delete-faq="' + faq.id + '">Delete</button></article>';
        }).join('');

        faqList.querySelectorAll('[data-delete-faq]').forEach(function (button) {
          button.addEventListener('click', function () {
            TeyvatDB.delete('faqs', Number(button.dataset.deleteFaq)).then(setupBrowserCrud);
          });
        });
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupFaqs();
    setupInquiryForm();
    setupAdmin();
    setupBrowserCrud();
  });

  window.TeyvatApp = { escapeHtml: escapeHtml };
})();
