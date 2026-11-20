<?php
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/src/helpers.php';
require_once dirname(__DIR__, 2) . '/src/db.php';

require_admin();
$pdo = db();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_is_valid($_POST['csrf_token'] ?? null)) {
        set_flash('error', 'The session expired. Please try again.');
    } else {
        $id = (int) ($_POST['id'] ?? 0);
        $operation = (string) ($_POST['operation'] ?? '');
        if ($id > 0 && $operation === 'read') {
            $pdo->prepare('UPDATE inquiries SET is_read = 1 WHERE id = :id')->execute(['id' => $id]);
            set_flash('success', 'Inquiry marked as read.');
        } elseif ($id > 0 && $operation === 'delete') {
            $pdo->prepare('DELETE FROM inquiries WHERE id = :id')->execute(['id' => $id]);
            set_flash('success', 'Inquiry deleted.');
        }
    }
    header('Location: inquiries.php');
    exit;
}

$csrfToken = csrf_token();
$flash = consume_flash();
$inquiries = $pdo->query('SELECT * FROM inquiries ORDER BY is_read ASC, created_at DESC, id DESC')->fetchAll();
?>
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Inquiry Inbox | Admin</title><link rel="stylesheet" href="admin.css"></head><body>
<header class="admin-header"><strong>Teyvat Travels Admin</strong><nav class="admin-nav"><a href="index.php">Dashboard</a><a href="crud.php?entity=nations">Nations</a><a href="crud.php?entity=packages">Packages</a><a href="crud.php?entity=locations">Locations</a><a href="crud.php?entity=tips">Tips</a><a href="crud.php?entity=faqs">FAQs</a><a href="inquiries.php">Inquiries</a><a href="profile.php">Director</a><a href="logout.php">Log out</a></nav></header>
<main class="admin-main">
  <h1>Inquiry Inbox</h1>
  <?php if ($flash): ?><p class="flash <?= $flash['type'] === 'error' ? 'error' : '' ?>"><?= e($flash['message']) ?></p><?php endif; ?>
  <?php foreach ($inquiries as $inquiry): ?>
    <article class="inquiry <?= !$inquiry['is_read'] ? 'unread' : '' ?>">
      <h2><?= e($inquiry['subject'] ?: 'General inquiry') ?></h2>
      <p class="inquiry-meta">From <?= e($inquiry['name']) ?> &lt;<?= e($inquiry['email']) ?>&gt; — <?= e($inquiry['created_at']) ?><?= !$inquiry['is_read'] ? ' — Unread' : '' ?></p>
      <p><?= nl2br(e($inquiry['message'])) ?></p>
      <div class="actions">
        <?php if (!$inquiry['is_read']): ?>
          <form method="post"><input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>"><input type="hidden" name="operation" value="read"><input type="hidden" name="id" value="<?= (int) $inquiry['id'] ?>"><button class="button secondary" type="submit">Mark read</button></form>
        <?php endif; ?>
        <form method="post" onsubmit="return confirm('Delete this inquiry?');"><input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>"><input type="hidden" name="operation" value="delete"><input type="hidden" name="id" value="<?= (int) $inquiry['id'] ?>"><button class="button danger" type="submit">Delete</button></form>
      </div>
    </article>
  <?php endforeach; ?>
  <?php if (!$inquiries): ?><p>No inquiries yet.</p><?php endif; ?>
</main></body></html>
