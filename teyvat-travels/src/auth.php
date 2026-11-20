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
