<?php
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/src/helpers.php';
require_once dirname(__DIR__, 2) . '/src/db.php';

require_admin();

$pdo = db();
$counts = [
    'Nations' => (int) $pdo->query('SELECT COUNT(*) FROM nations')->fetchColumn(),
    'Packages' => (int) $pdo->query('SELECT COUNT(*) FROM packages')->fetchColumn(),
    'FAQs' => (int) $pdo->query('SELECT COUNT(*) FROM faqs')->fetchColumn(),
    'Inquiries' => (int) $pdo->query('SELECT COUNT(*) FROM inquiries')->fetchColumn(),
];
$unread = (int) $pdo->query('SELECT COUNT(*) FROM inquiries WHERE is_read = 0')->fetchColumn();
$flash = consume_flash();
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Director Dashboard | Teyvat Travels</title>
  <style>
    body { margin: 0; background: #0d1918; color: #eef5f3; font-family: Inter, system-ui, sans-serif; }
    header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background: #172826; border-bottom: 1px solid #31433f; }
    main { max-width: 960px; margin: 0 auto; padding: 2rem; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; }
    .card { padding: 1.25rem; border: 1px solid #31433f; border-radius: 8px; background: #172826; }
    .card strong { display: block; margin-top: .5rem; font-size: 2rem; color: #82d7bd; }
    a { color: #82d7bd; }
  </style>
</head>
<body>
  <header>
    <strong>Director Dashboard</strong>
    <span><?= e($_SESSION['admin_name']) ?> | <a href="logout.php">Log out</a></span>
  </header>
  <main>
    <h1>Welcome, <?= e($_SESSION['admin_name']) ?></h1>
    <p><?= $unread ?> unread <?= $unread === 1 ? 'inquiry' : 'inquiries' ?>.</p>
    <div class="cards">
      <?php foreach ($counts as $label => $count): ?>
        <div class="card"><?= e($label) ?><strong><?= $count ?></strong></div>
      <?php endforeach; ?>
    </div>
  </main>
</body>
</html>
