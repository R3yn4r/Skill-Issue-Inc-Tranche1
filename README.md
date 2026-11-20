# Teyvat Travels

Teyvat Travels is a static HTML/CSS/JavaScript course project for the seven nations of Teyvat.

The project uses browser IndexedDB for demo data, accounts, favorites, inquiries, and admin actions. PHP and MySQL are not used.

## Requirements

- Windows 10 or Windows 11
- A modern browser with IndexedDB support
- Python or another static HTTP server
- Git, optional

## Run locally

```powershell
cd teyvat-travels/public
python -m http.server 8000
```

Open:

- `http://localhost:8000/index.html`
- `http://localhost:8000/login.html`
- `http://localhost:8000/account-register.html`

## Project pages

- `index.html` - public homepage
- Nation pages - static HTML nation guides
- `login.html` - centralized client/admin login
- `account-register.html` - browser traveller registration
- `account.html` - traveller profile and favorites
- `admin.html` - browser Director dashboard and inquiry inbox

## Storage

The JavaScript creates IndexedDB database `teyvat_travels`.

Browser data includes:

- Users
- Nations
- Packages
- FAQs
- Inquiries
- Favorites
- Director profile

Data belongs to the current browser profile and origin. It will not synchronize across browsers or devices.

## Local Director login

- Email: `johnreylunar02@gmail.com`
- Password: `admin123`

The first login hashes the password locally and stores it in IndexedDB.

## Security limitation

Browser-side authentication and admin checks are not secure for production use. Do not store real passwords or sensitive personal data. A real shared system requires a server, server-side authentication, authorization, and a database.

See [SETUP.md](SETUP.md) for the complete browser setup guide.
