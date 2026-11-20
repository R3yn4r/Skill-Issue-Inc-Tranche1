# Teyvat Travels

Teyvat Travels is a PHP and MySQL fan-guide website for the seven nations of Teyvat, with a protected Director admin area.

## Requirements

- Windows
- XAMPP or Laragon
- PHP 8.2 or newer
- MySQL 8 or MariaDB
- Git

## Local setup

1. Start MySQL and Apache in XAMPP.
2. Import `teyvat-travels/database/schema.sql`, then `teyvat-travels/database/seed.sql`, in phpMyAdmin.
3. Create the application database user:

```sql
CREATE USER 'teyvat_app'@'localhost' IDENTIFIED BY 'replace-with-a-development-password';
GRANT SELECT, INSERT, UPDATE, DELETE ON teyvat_travels.* TO 'teyvat_app'@'localhost';
FLUSH PRIVILEGES;
```

4. Copy the example environment file:

```powershell
Copy-Item teyvat-travels\.env.example teyvat-travels\.env
```

5. Set the database values in `teyvat-travels/.env`. Never commit this file.
6. Start the site from the project root:

```powershell
C:\xampp\php\php.exe -S localhost:8000 -t teyvat-travels/public
```

7. Open:
   - Home: http://localhost:8000/index.php
   - Database test: http://localhost:8000/db-test.php
   - Director login: http://localhost:8000/admin/login.php

The database test page is development-only and is blocked outside `APP_ENV=development`.

## Director account

The seed script creates one Director account with the configured email. Change the seeded password by generating a bcrypt hash and updating the `users` row:

```php
echo password_hash('replace-with-a-new-password', PASSWORD_DEFAULT);
```

```sql
UPDATE users
SET password_hash = 'paste-the-bcrypt-hash-here'
WHERE email = 'the-director-email';
```

The user table is not publicly writable and the public site has no registration flow.

## Project structure

- `teyvat-travels/public/` - web root and public PHP pages
- `teyvat-travels/public/admin/` - Director admin pages
- `teyvat-travels/src/` - PDO, authentication, session, and helper code
- `teyvat-travels/config/` - environment loading
- `teyvat-travels/database/` - schema and seed SQL

## Security

- Use prepared PDO statements.
- Keep database credentials in `.env`.
- Keep `.env` out of Git.
- Use only the limited `teyvat_app` database account.
- Public output is escaped with `htmlspecialchars()`.
- Forms use CSRF tokens.
- Admin pages verify the server-side `admin` role.
- In production, disable PHP display errors and use HTTPS.

## Git workflow

Work and commit on `feature/lunar-johnrey` unless the instructor assigns a different branch.
