# Teyvat Travels Test Checklist

## Setup

- [ ] A local HTTP server is running.
- [ ] `index.html` opens successfully.
- [ ] IndexedDB database `teyvat_travels` is created.
- [ ] Seed data appears after first load.

## Public site

- [ ] Home page loads at `/index.html`.
- [ ] All package cards render.
- [ ] Nation pages open and preserve the existing CSS design.
- [ ] FAQs render from IndexedDB.
- [ ] Destinations dropdown opens and nation links work.

## Inquiry form

- [ ] Empty fields are rejected.
- [ ] Invalid email is rejected.
- [ ] A valid inquiry saves to IndexedDB.
- [ ] Success feedback appears.
- [ ] Reloading preserves the inquiry.

## Director login

- [ ] `/login.html` accepts the Director account.
- [ ] The Director is sent to `/admin.html`.
- [ ] Invalid credentials show an error.
- [ ] Logout removes the browser session.

## Admin

- [ ] Director name appears on the dashboard.
- [ ] Inquiry inbox lists saved inquiries.
- [ ] Mark-read updates an inquiry.
- [ ] Delete removes an inquiry.

## Client accounts

- [ ] Client registration creates a local account.
- [ ] Client login reaches `/account.html`.
- [ ] Profile name updates.
- [ ] Logged-in account cannot open admin dashboard.
- [ ] Logout removes the client session.

## Browser storage

- [ ] The project works after browser refresh.
- [ ] Deleting IndexedDB resets the demo data.
- [ ] No server secrets or passwords are committed.
