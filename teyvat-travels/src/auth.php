<?php
declare(strict_types=1);

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';

function authenticate_admin(string $email, string $password): ?array
{
    $pdo = db();
    $statement = $pdo->prepare(
        'SELECT id, name, email, password_hash, role
           FROM users
          WHERE email = :email
          LIMIT 1'
    );
    $statement->execute(['email' => mb_strtolower(trim($email))]);
    $user = $statement->fetch();

    if (!is_array($user) || $user['role'] !== 'admin') {
        return null;
    }
    if (!password_verify($password, $user['password_hash'])) {
        return null;
    }

    $update = $pdo->prepare(
        'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = :id AND role = \'admin\''
    );
    $update->execute(['id' => $user['id']]);

    return $user;
}

function authenticate_client(string $email, string $password): ?array
{
    $pdo = db();
    $statement = $pdo->prepare(
        'SELECT id, name, email, password_hash, role
           FROM users
          WHERE email = :email AND role = \'client\'
          LIMIT 1'
    );
    $statement->execute(['email' => mb_strtolower(trim($email))]);
    $user = $statement->fetch();

    if (!is_array($user) || !password_verify($password, $user['password_hash'])) {
        return null;
    }

    $update = $pdo->prepare(
        'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = :id AND role = \'client\''
    );
    $update->execute(['id' => $user['id']]);
    return $user;
}

function register_client(string $name, string $email, string $password): array
{
    $pdo = db();
    $email = mb_strtolower(trim($email));

    $existing = $pdo->prepare('SELECT id FROM users WHERE email = :email');
    $existing->execute(['email' => $email]);
    if ($existing->fetch()) {
        return [false, 'An account with this email already exists.'];
    }

    $statement = $pdo->prepare(
        'INSERT INTO users (name, email, password_hash, role)
         VALUES (:name, :email, :password_hash, \'client\')'
    );
    $statement->execute([
        'name' => $name,
        'email' => $email,
        'password_hash' => password_hash($password, PASSWORD_DEFAULT),
    ]);

    $id = (int) $pdo->lastInsertId();
    return [true, $id];
}
