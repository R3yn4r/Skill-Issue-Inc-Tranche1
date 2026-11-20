# Teyvat Travels - Setup Guide

This guide explains how to run Teyvat Travels on a Windows computer.

## 1. Requirements

Install or verify the following:

- Windows 10 or Windows 11
- Git
- XAMPP or Laragon
- PHP 8.2 or newer
- MySQL 8 or MariaDB
- phpMyAdmin
- A modern browser
- Visual Studio Code, optional for editing

PHP must have these extensions enabled:

- `pdo_mysql`
- `mysqli`
- `mbstring`
- `session`

For XAMPP, use the PHP executable at:

```text
C:\xampp\php\php.exe
```

## 2. Get the project

Clone the repository or download it as a ZIP:

```powershell
git clone https://github.com/R3yn4r/Skill-Issue-Inc-Tranche1.git
cd Skill-Issue-Inc-Tranche1
git switch feature/lunar-johnrey
```

The project folder is:

```text
teyvat-travels/
├── config/
├── database/
├── public/
│   ├── admin/
│   ├── assets/
│   ├── css/
│   ├── images/
│   └── js/
├── src/
└── templates/
```

Do not move `public/`, `src/`, `config/`, `database/`, or `templates/` out of the project folder.

## 3. Start MySQL and Apache

Open XAMPP Control Panel and start:

- Apache
- MySQL

Apache normally uses port `80`, and MySQL normally uses port `3306`.

If MySQL does not start, open:

```text
C:\xampp\mysql\data\mysql_error.log
```

The log will show whether another application is using port `3306`.

## 4. Create the database

Open phpMyAdmin:

```text
http://localhost/phpmyadmin
```

Do not use `root` from the PHP application.

First import:

```text
teyvat-travels/database/schema.sql
```

Then import:

```text
teyvat-travels/database/seed.sql
```

The database should be named `teyvat_travels` and include the following tables:

- `nations`
- `nation_facts`
- `packages`
- `package_stops`
- `locations`
- `tips`
- `faqs`
- `director_profile`
- `inquiries`
- `users`
- `favorites`

## 5. Create the limited database account

In phpMyAdmin, open **SQL** and run:

```sql
CREATE USER 'teyvat_app'@'localhost'
IDENTIFIED BY 'replace-with-a-development-password';

GRANT SELECT, INSERT, UPDATE, DELETE
ON teyvat_travels.*
TO 'teyvat_app'@'localhost';

FLUSH PRIVILEGES;
```

Use a separate development password. Do not use `root` or add privileges that allow the application to change table structure.

## 6. Configure `.env`

From the project root, copy the example:

```powershell
Copy-Item teyvat-travels\.env.example teyvat-travels\.env
```

Open `teyvat-travels/.env` and set:

```text
APP_ENV=development

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=teyvat_travels
DB_USER=teyvat_app
DB_PASS=replace-with-a-development-password
MAIL_NOTIFY_TO=
```

Rules:

- Replace `replace-with-a-development-password` with the password created in Step 5.
- Keep `MAIL_NOTIFY_TO` empty for local testing unless mail delivery is configured.
- Never commit `.env`.
- `.env` is excluded by `.gitignore`.

Confirm Git is ignoring it:

```powershell
git status --ignored
git check-ignore -v teyvat-travels/.env
```

The ignore check should report `.env`.

## 7. Verify PHP extensions

Run:

```powershell
C:\xampp\php\php.exe -v
C:\xampp\php\php.exe -m
```

Confirm `pdo_mysql` and `mysqli` appear in the module list.

If `pdo_mysql` is missing:

1. Open `C:\xampp\php\php.ini`.
2. Find `;extension=pdo_mysql`.
3. Remove the leading semicolon.
4. Restart Apache.

## 8. Start the project

From the project root:

```powershell
C:\xampp\php\php.exe -S localhost:8000 -t teyvat-travels/public
```

Keep this terminal open while testing.

Open:

- Home: `http://localhost:8000/index.php`
- Database test: `http://localhost:8000/db-test.php`
- Central login: `http://localhost:8000/login.php`
- Admin area: `http://localhost:8000/admin/index.php`

The database test page should only run when `APP_ENV=development`.

## 9. Sign in

The central login automatically determines whether an account is an admin or a traveller:

- Admin users are sent to `/admin/index.php`.
- Client users are sent to `/account.php`.

The seed script creates the Director account in `users`.

For local testing, change the seed password before public use:

```powershell
C:\xampp\php\php.exe -r "echo password_hash('your-new-development-password', PASSWORD_DEFAULT);"
```

Copy the generated hash and update MySQL:

```sql
UPDATE users
SET password_hash = 'paste-the-generated-bcrypt-hash'
WHERE email = 'the-director-email';
```

After deploying, delete or disable any development-only password and database test page.

## 10. Test the public site

Check:

1. The home page loads.
2. The package cards show data from MySQL.
3. The Destinations dropdown opens.
4. Every destination opens through `nation.php?slug=<nation>`.
5. The FAQ section loads database entries.
6. The inquiry form validates input.
7. A valid inquiry appears in the admin inbox.
8. Client registration and login work.
9. Logged-in clients can save favorites.

Use the database test page to confirm row counts:

- 7 nations
- 28 nation facts
- 7 packages
- 21 package stops
- 21 locations
- 21 tips
- 4 FAQs
- 1 Director profile
- 1 Director account

## 11. Test the Director features

Open `http://localhost:8000/login.php`, sign in as the Director, and test:

- Dashboard
- Nations CRUD
- Packages CRUD
- Package stops
- Locations CRUD
- Tips CRUD
- FAQ CRUD
- Director profile editing
- Inquiry mark-read
- Inquiry deletion
- Logout

Direct access to admin pages must return to login unless the server session contains an admin role.

## 12. Email notifications

Inquiry notifications are optional.

Set `MAIL_NOTIFY_TO` to the Director email:

```text
MAIL_NOTIFY_TO=director@example.com
```

Local XAMPP PHP may not be configured to send mail. In that case:

- The inquiry is still saved.
- `mail()` may return unsuccessful.
- Configure SMTP or use a mail provider before production deployment.

Do not add SMTP passwords or API keys to Git.

## 13. Common problems

### `could not find driver`

Enable `pdo_mysql` in `C:\xampp\php\php.ini`, then restart Apache.

### `Access denied`

Check:

- `.env` database username
- `.env` database password
- The account created in phpMyAdmin
- `teyvat_app`@`localhost`

### `Unknown database`

Import `schema.sql` before `seed.sql`.

### `Connection refused`

Check that MySQL is running and port `3306` is available.

### Port `8000` is already in use

Start PHP with another port:

```powershell
C:\xampp\php\php.exe -S localhost:8080 -t teyvat-travels/public
```

Then replace port `8000` with `8080` in the browser URL.

### Images do not load

Keep the project in `teyvat-travels/public/` and serve with `-t teyvat-travels/public`.

Do not open the PHP pages directly with `file://`.

## 14. Git security check

Before committing:

```powershell
git status
git status --ignored
git check-ignore -v teyvat-travels/.env
```

Do not commit:

- `teyvat-travels/.env`
- Database passwords
- Mail/API credentials
- Session files
- Temporary test data

The database schema and seed files are safe to commit when they contain no real password or private key.
