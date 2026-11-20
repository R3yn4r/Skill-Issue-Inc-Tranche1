<?php
declare(strict_types=1);

/**
 * Loads settings from the ".env" file in the project root (one level above
 * /public, so visitors can never download it) and returns them as an array.
 *
 * Usage:  $config = require __DIR__ . '/../config/config.php';
 */

$envFile = dirname(__DIR__) . '/.env';
$env = [];

if (is_readable($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
    foreach ($lines as $line) {
        $line = trim($line);
        // Skip comments and anything that is not KEY=VALUE
        if ($line === '' || $line[0] === '#' || !str_contains($line, '=')) {
            continue;
        }
        [$key, $value] = explode('=', $line, 2);
        $env[trim($key)] = trim(trim($value), "\"'");
    }
}

return [
    'app_env' => $env['APP_ENV'] ?? 'production',
    'db' => [
        'host' => $env['DB_HOST'] ?? '127.0.0.1',
        'port' => (int) ($env['DB_PORT'] ?? 3306),
        'name' => $env['DB_NAME'] ?? 'teyvat_travels',
        'user' => $env['DB_USER'] ?? '',
        'pass' => $env['DB_PASS'] ?? '',
    ],
];