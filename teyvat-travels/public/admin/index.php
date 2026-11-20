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
  <link rel="stylesheet" href="admin.css">
</head>
<body>
  <header class="admin-header">
    <strong>Director Dashboard</strong>
    <nav class="admin-nav">
      <a href="index.php">Dashboard</a>
      <a href="crud.php?entity=nations">Nations</a>
      <a href="crud.php?entity=packages">Packages</a>
      <a href="crud.php?entity=locations">Locations</a>
      <a href="crud.php?entity=tips">Tips</a>
      <a href="crud.php?entity=faqs">FAQs</a>
      <a href="inquiries.php">Inquiries</a>
      <a href="profile.php">Director</a>
      <a href="logout.php">Log out</a>
    </nav>
  </header>
  <main class="admin-main">
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
