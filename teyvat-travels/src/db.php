<?php
declare(strict_types=1);

/**
 * Returns one shared PDO connection to the database.
 *
 * Usage:
 *   require_once dirname(__DIR__) . '/src/db.php';
 *   $stmt = db()->prepare('SELECT * FROM nations WHERE slug = :slug');
 *   $stmt->execute(['slug' => $slug]);
 *
 * ALWAYS pass user input through prepared-statement placeholders
 * (":slug"), never by pasting it into the SQL text.
 */
function db(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $config = require dirname(__DIR__) . '/config/config.php';
    $db = $config['db'];

    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
        $db['host'],
        $db['port'],
        $db['name']
    );

    try {
        $pdo = new PDO($dsn, $db['user'], $db['pass'], [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // throw errors
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // rows as arrays
            PDO::ATTR_EMULATE_PREPARES   => false,                  // real prepared statements
        ]);
    } catch (PDOException $e) {
        // Log the real reason, but never show it to visitors in production.
        error_log('Database connection failed: ' . $e->getMessage());
        http_response_code(500);

        if (($config['app_env'] ?? 'production') === 'development') {
            exit('Database connection failed: ' . htmlspecialchars($e->getMessage(), ENT_QUOTES, 'UTF-8'));
        }
        exit('Sorry, the site is temporarily unavailable.');
    }

    return $pdo;
}