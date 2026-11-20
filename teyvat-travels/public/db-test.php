<?php
declare(strict_types=1);

/**
 * TEMPORARY test page - proves PHP can talk to the database.
 * It only runs when APP_ENV=development. DELETE this file before deployment.
 */

require_once dirname(__DIR__) . '/src/db.php';

$config = require dirname(__DIR__) . '/config/config.php';
if (($config['app_env'] ?? 'production') !== 'development') {
    http_response_code(404);
    exit('Not found');
}

function e(?string $text): string
{
    return htmlspecialchars((string) $text, ENT_QUOTES, 'UTF-8');
}

$pdo = db();

// 1) Row count of every table (table names come from this fixed list only)
$tables = ['nations', 'nation_facts', 'packages', 'package_stops', 'locations',
           'tips', 'faqs', 'director_profile', 'inquiries', 'users'];
$counts = [];
foreach ($tables as $table) {
    $counts[$table] = (int) $pdo->query("SELECT COUNT(*) FROM `$table`")->fetchColumn();
}

// 2) A prepared statement with a placeholder (the safe pattern to copy)
$stmt = $pdo->prepare('SELECT name, tagline FROM nations WHERE slug = :slug');
$stmt->execute(['slug' => 'mondstadt']);
$nation = $stmt->fetch();

// 3) All packages joined with their nation
$packages = $pdo->query(
    'SELECT n.name AS nation, p.title, p.price_php, p.days, p.nights
       FROM packages p
       JOIN nations n ON n.id = p.nation_id
      WHERE p.is_active = 1
      ORDER BY p.sort_order'
)->fetchAll();

header('Content-Type: text/html; charset=utf-8');
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Database test</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 760px; margin: 2rem auto; padding: 0 1rem; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 1.5rem; }
    th, td { border: 1px solid #ccc; padding: .4rem .6rem; text-align: left; }
    .ok { color: #1a7f37; font-weight: 600; }
  </style>
</head>
<body>
  <h1>Database test</h1>
  <p class="ok">&#10003; Connected to "<?= e($config['db']['name']) ?>" as "<?= e($config['db']['user']) ?>".</p>

  <h2>Rows per table</h2>
  <table>
    <?php foreach ($counts as $table => $count): ?>
      <tr><th><?= e($table) ?></th><td><?= $count ?></td></tr>
    <?php endforeach; ?>
  </table>

  <h2>Prepared statement</h2>
  <p>
    <?php if ($nation): ?>
      <?= e($nation['name']) ?> &mdash; <?= e($nation['tagline']) ?>
    <?php else: ?>
      Nation not found (did you run seed.sql?).
    <?php endif; ?>
  </p>

  <h2>Packages</h2>
  <table>
    <tr><th>Nation</th><th>Package</th><th>Price</th><th>Duration</th></tr>
    <?php foreach ($packages as $p): ?>
      <tr>
        <td><?= e($p['nation']) ?></td>
        <td><?= e($p['title']) ?></td>
        <td>&#8369;<?= number_format((int) $p['price_php']) ?></td>
        <td><?= (int) $p['days'] ?> Days / <?= (int) $p['nights'] ?> Nights</td>
      </tr>
    <?php endforeach; ?>
  </table>
</body>
</html>