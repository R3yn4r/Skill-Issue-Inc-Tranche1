<?php
declare(strict_types=1);

function e(?string $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function start_secure_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    $secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $secure,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

function csrf_token(): string
{
    if (empty($_SESSION['csrf_token']) || !is_string($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function csrf_is_valid(?string $token): bool
{
    return is_string($token)
        && isset($_SESSION['csrf_token'])
        && is_string($_SESSION['csrf_token'])
        && hash_equals($_SESSION['csrf_token'], $token);
}

function set_flash(string $type, string $message): void
{
    $_SESSION['flash'] = ['type' => $type, 'message' => $message];
}

function consume_flash(): ?array
{
    $flash = $_SESSION['flash'] ?? null;
    unset($_SESSION['flash']);
    return is_array($flash) ? $flash : null;
}

function is_admin_logged_in(): bool
{
    return isset($_SESSION['admin_id'], $_SESSION['admin_role'])
        && $_SESSION['admin_role'] === 'admin';
}

function require_admin(): void
{
    start_secure_session();
    if (!is_admin_logged_in()) {
        header('Location: login.php');
        exit;
    }
}

function login_attempt_allowed(): bool
{
    $now = time();
    $windowStart = (int) ($_SESSION['login_attempt_window_start'] ?? 0);
    $attempts = (int) ($_SESSION['login_attempts'] ?? 0);

    if ($windowStart === 0 || $now - $windowStart >= 600) {
        $_SESSION['login_attempt_window_start'] = $now;
        $_SESSION['login_attempts'] = 0;
        return true;
    }

    return $attempts < 5;
}

function record_login_attempt(): void
{
    $_SESSION['login_attempts'] = (int) ($_SESSION['login_attempts'] ?? 0) + 1;
}

function is_client_logged_in(): bool
{
    return isset($_SESSION['client_id'], $_SESSION['client_role'])
        && $_SESSION['client_role'] === 'client';
}

function require_client(): void
{
    start_secure_session();
    if (!is_client_logged_in()) {
        header('Location: account-login.php');
        exit;
    }
}
