# Teyvat Travels - Browser Setup

Teyvat Travels now runs as a static HTML/CSS/JavaScript project. PHP and MySQL are not required. Browser data is stored in IndexedDB.

## Requirements

- Windows 10 or Windows 11
- A modern browser with IndexedDB support
- Git, optional
- Visual Studio Code, optional
- Python or another local static HTTP server

## Run locally

Open a terminal in the project root and run:

```powershell
cd teyvat-travels/public
python -m http.server 8000
```

Open:

- `http://localhost:8000/index.html`
- `http://localhost:8000/login.html`
- `http://localhost:8000/account-register.html`

You may also open `index.html` through VS Code Live Server.

Do not open the project with `file://` if browser storage or modules are restricted.

## Initial data

The first JavaScript load creates IndexedDB database `teyvat_travels`.

Seeded browser data includes:

- Seven nations
- Seven packages
- Four FAQs
- One Director profile
- One Director account

Browser data belongs to the current browser profile and origin. It does not synchronize to another computer or browser.

## Director login

Open `login.html` and use:

- Email: `johnreylunar02@gmail.com`
- Password: `admin123`

The first successful login creates the browser-side password hash. Change this local default in source or after first login before showing the demo.

## Traveller accounts

Travellers can create an account through `account-register.html`.

Passwords are hashed with Web Crypto PBKDF2 before IndexedDB stores them. Session identity is kept in `sessionStorage` for the current browser tab/session.

## Favorites

Logged-in travellers can save packages to IndexedDB. Favorites are listed on `account.html`.

## Inquiry form

The homepage inquiry form stores submissions in IndexedDB.

The Director can view, mark read, and delete inquiries on `admin.html`.

## Browser storage reset

To reset demo data:

1. Open browser Developer Tools.
2. Open Application or Storage.
3. Select IndexedDB.
4. Delete `teyvat_travels`.
5. Refresh the page.

## Important limitations

- This is a browser-only database demo.
- Data is local to one browser profile and origin.
- A different device or browser will not see the same accounts or inquiries.
- Admin checks are client-side and are not secure against someone with developer tools.
- Do not use real passwords, real personal records, or sensitive information.
- Do not present this mode as a production multi-user system.

For a real shared system, use a server backend with MySQL and server-side authentication.
