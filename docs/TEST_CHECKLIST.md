# Teyvat Travels Test Checklist

## Setup

- [ ] MySQL is running.
- [ ] `teyvat_travels` exists.
- [ ] `schema.sql` and `seed.sql` import successfully.
- [ ] `.env` exists locally and is ignored by Git.
- [ ] `db-test.php` shows 7 nations, 28 nation facts, 7 packages, 21 package stops, 4 FAQs, and 1 Director profile.

## Public site

- [ ] Home page loads at `/index.php`.
- [ ] All seven package cards render.
- [ ] Package prices use Philippine peso formatting.
- [ ] `/nation.php?slug=` loads for each of the seven nations.
- [ ] Legacy `.html` nation URLs redirect to the database pages.
- [ ] Unknown nation slugs show a 404 response.
- [ ] Published FAQs render on the home page.

## Inquiry form

- [ ] Empty name is rejected.
- [ ] Invalid email is rejected.
- [ ] Empty message is rejected.
- [ ] Valid inquiry saves to `inquiries`.
- [ ] CSRF-protected submissions succeed only with a valid token.
- [ ] Honeypot submissions do not create database rows.
- [ ] Repeated submissions trigger throttling.
- [ ] A success message appears after a valid submission.

## Director login

- [ ] Unauthorized `/admin/index.php` redirects to login.
- [ ] Valid Director credentials open the dashboard.
- [ ] Invalid credentials show an error.
- [ ] Login session is regenerated.
- [ ] Logout ends dashboard access.
- [ ] Five failed attempts trigger the temporary login limit.

## Admin CRUD

- [ ] Nations can be listed, created, edited, and deleted.
- [ ] Packages can be listed, created, edited, and deleted.
- [ ] Package stops can be edited with the package.
- [ ] Locations can be listed, created, edited, and deleted.
- [ ] Tips can be listed, created, edited, and deleted.
- [ ] FAQs can be listed, created, edited, and deleted.
- [ ] Director profile can be edited.

## Inquiry inbox

- [ ] Inquiries appear newest/unread first.
- [ ] Mark-read updates `is_read`.
- [ ] Delete removes only the selected inquiry.

## Git and security

- [ ] `.env` is not in `git status`.
- [ ] SQL uses PDO prepared statements.
- [ ] Public dynamic output is escaped.
- [ ] No database password is committed.
- [ ] Database test remains blocked outside development.

## Optional Phase 9 features

- [ ] A traveller can register and log in.
- [ ] A traveller cannot access `/admin`.
- [ ] Profile name changes save.
- [ ] Traveller logout ends account access.
- [ ] Logged-in users can add and remove package favorites.
- [ ] Favorites appear on the account page.
- [ ] A logged-in inquiry stores `user_id`.
- [ ] `MAIL_NOTIFY_TO` receives or attempts a notification on a new inquiry.
