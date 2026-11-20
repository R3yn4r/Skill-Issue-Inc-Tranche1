<?php
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/src/helpers.php';
require_once dirname(__DIR__, 2) . '/src/db.php';

require_admin();
$pdo = db();
$flash = consume_flash();
$stmt = $pdo->query('SELECT * FROM director_profile WHERE id = 1');
$profile = $stmt->fetch();
if (!is_array($profile)) {
    $profile = ['name'=>'','title'=>'','bio'=>'','photo_path'=>'','photo_alt'=>''];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_is_valid($_POST['csrf_token'] ?? null)) {
        set_flash('error', 'The session expired. Please try again.');
    } else {
        $values = [
            'name' => trim((string) ($_POST['name'] ?? '')),
            'title' => trim((string) ($_POST['title'] ?? '')),
            'bio' => trim((string) ($_POST['bio'] ?? '')),
            'photo_path' => trim((string) ($_POST['photo_path'] ?? '')),
            'photo_alt' => trim((string) ($_POST['photo_alt'] ?? '')),
        ];
        if ($values['name'] === '' || $values['title'] === '' || $values['bio'] === '') {
            set_flash('error', 'Name, title, and biography are required.');
        } else {
            $profileUpdate = $pdo->prepare(
                'INSERT INTO director_profile (id,name,title,bio,photo_path,photo_alt)
                 VALUES (1,:name,:title,:bio,:photo_path,:photo_alt)
                 ON DUPLICATE KEY UPDATE
                   name=VALUES(name), title=VALUES(title), bio=VALUES(bio),
                   photo_path=VALUES(photo_path), photo_alt=VALUES(photo_alt)'
            );
            $profileUpdate->execute($values);
            $_SESSION['admin_name'] = $values['name'];
            set_flash('success', 'Director profile saved.');
        }
    }
    header('Location: profile.php');
    exit;
}

$csrfToken = csrf_token();
?>
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Director Profile | Admin</title><link rel="stylesheet" href="admin.css"></head><body>
<header class="admin-header"><strong>Teyvat Travels Admin</strong><nav class="admin-nav"><a href="index.php">Dashboard</a><a href="crud.php?entity=nations">Nations</a><a href="crud.php?entity=packages">Packages</a><a href="crud.php?entity=locations">Locations</a><a href="crud.php?entity=tips">Tips</a><a href="crud.php?entity=faqs">FAQs</a><a href="inquiries.php">Inquiries</a><a href="profile.php">Director</a><a href="logout.php">Log out</a></nav></header>
<main class="admin-main">
  <h1>Director Profile</h1>
  <?php if ($flash): ?><p class="flash <?= $flash['type'] === 'error' ? 'error' : '' ?>"><?= e($flash['message']) ?></p><?php endif; ?>
  <form method="post" class="form-grid">
    <input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>">
    <div class="field"><label>Name</label><input name="name" required maxlength="100" value="<?= e($profile['name']) ?>"></div>
    <div class="field"><label>Title</label><input name="title" required maxlength="100" value="<?= e($profile['title']) ?>"></div>
    <div class="field full"><label>Biography</label><textarea name="bio" required><?= e($profile['bio']) ?></textarea></div>
    <div class="field"><label>Photo path</label><input name="photo_path" maxlength="255" value="<?= e($profile['photo_path']) ?>"></div>
    <div class="field"><label>Photo alt text</label><input name="photo_alt" maxlength="255" value="<?= e($profile['photo_alt']) ?>"></div>
    <div class="field full"><button class="button" type="submit">Save profile</button></div>
  </form>
</main></body></html>
