(function () {
  'use strict';

  function escapeHtml(value) {
    var element = document.createElement('span');
    element.textContent = value == null ? '' : String(value);
    return element.innerHTML;
  }

  function hashPassword(password) {
    if (!window.crypto || !crypto.subtle) return Promise.reject(new Error('Secure password hashing is unavailable.'));
    var salt = crypto.getRandomValues(new Uint8Array(16));
    var encoder = new TextEncoder();
    return crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
      .then(function (key) {
        return crypto.subtle.deriveBits({ name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-256' }, key, 256);
      })
      .then(function (bits) {
        var bytes = new Uint8Array(bits);
        var hash = Array.from(bytes).map(function (byte) { return byte.toString(16).padStart(2, '0'); }).join('');
        var saltText = Array.from(salt).map(function (byte) { return byte.toString(16).padStart(2, '0'); }).join('');
        return 'pbkdf2$100000$' + saltText + '$' + hash;
      });
  }

  function verifyPassword(password, stored) {
    if (!stored || stored.indexOf('pbkdf2$') !== 0) return Promise.resolve(false);
    var parts = stored.split('$');
    var iterations = Number(parts[1]);
    var salt = new Uint8Array(parts[2].match(/.{2}/g).map(function (hex) { return parseInt(hex, 16); }));
    var encoder = new TextEncoder();
    return crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
      .then(function (key) {
        return crypto.subtle.deriveBits({ name: 'PBKDF2', salt: salt, iterations: iterations, hash: 'SHA-256' }, key, 256);
      })
      .then(function (bits) {
        var hash = Array.from(new Uint8Array(bits)).map(function (byte) { return byte.toString(16).padStart(2, '0'); }).join('');
        return hash === parts[3];
      });
  }

  function currentUser() {
    try { return JSON.parse(sessionStorage.getItem('teyvatUser') || 'null'); }
    catch (error) { return null; }
  }

  function setUser(user) {
    sessionStorage.setItem('teyvatUser', JSON.stringify(user));
  }

  function addSharedNavigationState() {
    var loginLink = document.querySelector('[data-login-link]');
    var user = currentUser();
    if (loginLink) {
      loginLink.textContent = user ? (user.role === 'admin' ? 'Dashboard' : 'My account') : 'Log in';
      loginLink.href = user ? (user.role === 'admin' ? 'admin.html' : 'account.html') : 'login.html';
    }
  }

  function setupFaqs() {
    var list = document.querySelector('[data-faq-list]');
    if (!list) return;
    TeyvatDB.getAll('faqs').then(function (faqs) {
      faqs.sort(function (a, b) { return a.sortOrder - b.sortOrder; });
      list.innerHTML = faqs.filter(function (faq) { return faq.published; }).map(function (faq) {
        return '<details class="hx-faq-item"><summary class="hx-faq-question">' + escapeHtml(faq.question) +
          '</summary><p class="hx-faq-answer">' + escapeHtml(faq.answer) + '</p></details>';
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
        if (alert) { alert.textContent = 'Name, email, and message are required.'; alert.className = 'ct-form-alert ct-form-alert--error'; }
        return;
      }

      var user = currentUser();
      TeyvatDB.put('inquiries', {
        name: name,
        email: email,
        subject: subject,
        message: message,
        userId: user ? user.id : null,
        isRead: false,
        createdAt: new Date().toISOString()
      }).then(function () {
        form.reset();
        if (alert) { alert.textContent = 'Thank you. Your inquiry has been saved.'; alert.className = 'ct-form-alert ct-form-alert--success'; }
      }).catch(function () {
        if (alert) { alert.textContent = 'Your inquiry could not be saved. Please try again.'; alert.className = 'ct-form-alert ct-form-alert--error'; }
      });
    });
  }

  function setupLoginPage() {
    var form = document.getElementById('central-login-form');
    if (!form) return;
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var email = String(new FormData(form).get('email') || '').trim().toLowerCase();
      var password = String(new FormData(form).get('password') || '');
      var alert = document.querySelector('[data-login-alert]');

      TeyvatDB.findByIndex('users', 'email', email).then(function (user) {
        if (!user) throw new Error('invalid');
        if (user.passwordHash === 'ADMIN_PASSWORD_PENDING') {
          if (user.role !== 'admin') throw new Error('invalid');
          if (email !== user.email) throw new Error('invalid');
          if (password !== 'admin123') throw new Error('invalid');
          return hashPassword(password).then(function (passwordHash) {
            user.passwordHash = passwordHash;
            return TeyvatDB.put('users', user).then(function () {
              setUser({ id: user.id, name: user.name, email: user.email, role: user.role });
              window.location.href = 'admin.html';
            });
          });
        }
        return verifyPassword(password, user.passwordHash).then(function (valid) {
          if (!valid) throw new Error('invalid');
          setUser({ id: user.id, name: user.name, email: user.email, role: user.role });
          window.location.href = user.role === 'admin' ? 'admin.html' : 'account.html';
        });
      }).catch(function () {
        if (alert) alert.textContent = 'Invalid email or password.';
      });
    });
  }

  function setupRegistration() {
    var form = document.getElementById('account-register-form');
    if (!form) return;
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var data = new FormData(form);
      var name = String(data.get('name') || '').trim();
      var email = String(data.get('email') || '').trim().toLowerCase();
      var password = String(data.get('password') || '');
      var confirm = String(data.get('confirm_password') || '');
      var alert = document.querySelector('[data-register-alert]');
      if (name.length < 2 || password.length < 8 || password !== confirm) {
        if (alert) alert.textContent = 'Use a name, 8-character password, and matching confirmation.';
        return;
      }
      TeyvatDB.findByIndex('users', 'email', email).then(function (existing) {
        if (existing) throw new Error('exists');
        return hashPassword(password).then(function (passwordHash) {
          return TeyvatDB.put('users', { name: name, email: email, passwordHash: passwordHash, role: 'client', createdAt: new Date().toISOString() });
        });
      }).then(function () {
        TeyvatDB.findByIndex('users', 'email', email).then(function (user) {
          setUser({ id: user.id, name: user.name, email: user.email, role: user.role });
          window.location.href = 'account.html';
        });
      }).catch(function (error) {
        if (alert) alert.textContent = error.message === 'exists' ? 'An account with this email already exists.' : 'Registration failed.';
      });
    });
  }

  function setupAccount() {
    var accountName = document.querySelector('[data-account-name]');
    var accountEmail = document.querySelector('[data-account-email]');
    var favoritesList = document.querySelector('[data-favorites-list]');
    var user = currentUser();
    if (!user || user.role !== 'client') {
      window.location.href = 'login.html';
      return;
    }
    if (accountName) accountName.value = user.name;
    if (accountEmail) accountEmail.textContent = user.email;

    var form = document.getElementById('account-profile-form');
    if (form) form.addEventListener('submit', function (event) {
      event.preventDefault();
      var name = String(new FormData(form).get('name') || '').trim();
      if (!name) return;
      TeyvatDB.getById('users', user.id).then(function (record) {
        record.name = name;
        return TeyvatDB.put('users', record);
      }).then(function () {
        user.name = name;
        setUser(user);
      });
    });

    if (favoritesList) {
      TeyvatDB.getAll('favorites').then(function (favorites) {
        var mine = favorites.filter(function (favorite) { return favorite.userId === user.id; });
        if (!mine.length) { favoritesList.textContent = 'No favorite packages yet.'; return; }
        Promise.all(mine.map(function (favorite) { return TeyvatDB.getById('packages', favorite.packageId); })).then(function (packages) {
          favoritesList.innerHTML = packages.filter(Boolean).map(function (pkg) {
            return '<article class="card"><h3>' + escapeHtml(pkg.title) + '</h3><p>₱' + Number(pkg.price).toLocaleString() + '</p></article>';
          }).join('');
        });
      });
    }
  }

  function setupAdmin() {
    var user = currentUser();
    if (!user || user.role !== 'admin') {
      window.location.href = 'login.html';
      return;
    }
    var name = document.querySelector('[data-admin-name]');
    if (name) name.textContent = user.name;

    TeyvatDB.getAll('inquiries').then(function (inquiries) {
      var inbox = document.querySelector('[data-inquiry-list]');
      if (!inbox) return;
      inquiries.sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
      inbox.innerHTML = inquiries.length ? inquiries.map(function (inquiry) {
        return '<article class="inquiry"><h3>' + escapeHtml(inquiry.subject || 'General inquiry') + '</h3>' +
          '<p>' + escapeHtml(inquiry.name) + ' — ' + escapeHtml(inquiry.email) + '</p>' +
          '<p>' + escapeHtml(inquiry.message) + '</p>' +
          '<button type="button" data-read-inquiry="' + inquiry.id + '">' + (inquiry.isRead ? 'Read' : 'Mark read') + '</button>' +
          '<button type="button" data-delete-inquiry="' + inquiry.id + '">Delete</button></article>';
      }).join('') : '<p>No inquiries yet.</p>';

      inbox.querySelectorAll('[data-read-inquiry]').forEach(function (button) {
        button.addEventListener('click', function () {
          TeyvatDB.getById('inquiries', Number(button.dataset.readInquiry)).then(function (inquiry) {
            inquiry.isRead = true;
            return TeyvatDB.put('inquiries', inquiry);
          }).then(function () { setupAdmin(); });
        });
      });
      inbox.querySelectorAll('[data-delete-inquiry]').forEach(function (button) {
        button.addEventListener('click', function () {
          TeyvatDB.delete('inquiries', Number(button.dataset.deleteInquiry)).then(function () { setupAdmin(); });
        });
      });
    });
  }

  function setupPackageFavorites() {
    document.querySelectorAll('[data-package-id]').forEach(function (card) {
      var button = document.createElement('button');
      button.type = 'button';
      button.textContent = 'Save favorite';
      button.className = 'ct-cta-btn';
      card.querySelector('.pk-card__body').appendChild(button);

      button.addEventListener('click', function () {
        var user = currentUser();
        if (!user || user.role !== 'client') {
          window.location.href = 'login.html';
          return;
        }

        TeyvatDB.getAll('favorites').then(function (favorites) {
          var packageId = Number(card.dataset.packageId);
          var existing = favorites.find(function (favorite) {
            return favorite.userId === user.id && favorite.packageId === packageId;
          });
          if (existing) {
            return TeyvatDB.delete('favorites', existing.id).then(function () {
              button.textContent = 'Save favorite';
            });
          }
          return TeyvatDB.put('favorites', {
            userId: user.id,
            packageId: packageId,
            createdAt: new Date().toISOString()
          }).then(function () {
            button.textContent = 'Remove favorite';
          });
        });
      });
    });
  }

  function setupBrowserCrud() {
    var admin = document.querySelector('[data-browser-crud]');
    if (!admin) return;
    var user = currentUser();
    if (!user || user.role !== 'admin') {
      window.location.href = 'login.html';
      return;
    }

    var packageList = document.querySelector('[data-package-list]');
    var faqList = document.querySelector('[data-admin-faq-list]');

    if (packageList) {
      TeyvatDB.getAll('packages').then(function (packages) {
        packageList.innerHTML = packages.map(function (pkg) {
          return '<article><h3>' + escapeHtml(pkg.title) + '</h3>' +
            '<button type="button" data-toggle-package="' + pkg.id + '">' + (pkg.active ? 'Deactivate' : 'Activate') + '</button>' +
            '<button type="button" data-delete-package="' + pkg.id + '">Delete</button></article>';
        }).join('');

        packageList.querySelectorAll('[data-toggle-package]').forEach(function (button) {
          button.addEventListener('click', function () {
            TeyvatDB.getById('packages', Number(button.dataset.togglePackage)).then(function (pkg) {
              pkg.active = !pkg.active;
              return TeyvatDB.put('packages', pkg);
            }).then(function () { setupBrowserCrud(); });
          });
        });
        packageList.querySelectorAll('[data-delete-package]').forEach(function (button) {
          button.addEventListener('click', function () {
            TeyvatDB.delete('packages', Number(button.dataset.deletePackage)).then(function () { setupBrowserCrud(); });
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
            TeyvatDB.delete('faqs', Number(button.dataset.deleteFaq)).then(function () { setupBrowserCrud(); });
          });
        });
      });
    }
  }

  function setupLogout() {
    document.querySelectorAll('[data-logout]').forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        sessionStorage.removeItem('teyvatUser');
        window.location.href = 'index.html';
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    addSharedNavigationState();
    setupFaqs();
    setupInquiryForm();
    setupLoginPage();
    setupRegistration();
    setupAccount();
    setupAdmin();
    setupPackageFavorites();
    setupBrowserCrud();
    setupLogout();
  });

  window.TeyvatApp = { escapeHtml: escapeHtml, currentUser: currentUser, hashPassword: hashPassword, verifyPassword: verifyPassword };
})();
