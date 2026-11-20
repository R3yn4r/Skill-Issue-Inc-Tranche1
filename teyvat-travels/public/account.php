<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/src/helpers.php';
require_once dirname(__DIR__) . '/src/db.php';

require_client();
$pdo = db();
$clientId = (int) $_SESSION['client_id'];
$flash = consume_flash();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_is_valid($_POST['csrf_token'] ?? null)) {
        set_flash('error', 'The session expired. Please try again.');
    } else {
        $name = trim((string) ($_POST['name'] ?? ''));
        if (mb_strlen($name) < 2 || mb_strlen($name) > 100) {
            set_flash('error', 'Enter a name between 2 and 100 characters.');
        } else {
            $pdo->prepare('UPDATE users SET name=:name WHERE id=:id AND role=\'client\'')->execute(['name'=>$name,'id'=>$clientId]);
            $_SESSION['client_name'] = $name;
            set_flash('success', 'Profile updated.');
        }
    }
    header('Location: account.php');
    exit;
}

$csrfToken = csrf_token();
$flash = consume_flash();

$favorites = $pdo->prepare(
    'SELECT p.id,p.title,p.description,p.price_php,p.days,p.nights,n.name,n.slug,n.accent_color
       FROM favorites f
       JOIN packages p ON p.id=f.package_id
       JOIN nations n ON n.id=p.nation_id
      WHERE f.user_id=:user_id
      ORDER BY f.created_at DESC'
);
$favorites->execute(['user_id'=>$clientId]);
$favoriteRows = $favorites->fetchAll();
?>
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>My account | Teyvat Travels</title></head><body>
<main style="max-width:900px;margin:3rem auto;padding:1.5rem;font-family:system-ui">
<p><a href="index.php">Back to site</a> | <a href="account-logout.php">Log out</a></p>
<h1>My account</h1>
<?php if ($flash): ?><p role="alert"><?= e($flash['message']) ?></p><?php endif; ?>
<form method="post">
<input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>">
<p><label>Name<br><input name="name" required maxlength="100" value="<?= e($_SESSION['client_name']) ?>"></label></p>
<p>Email: <?= e($_SESSION['client_email']) ?></p>
<button type="submit">Update profile</button>
</form>
<h2>Favorite packages</h2>
<?php foreach ($favoriteRows as $favorite): ?>
<article style="border:1px solid #ccc;padding:1rem;margin-bottom:1rem">
<h3><a href="nation.php?slug=<?= rawurlencode($favorite['slug']) ?>"><?= e($favorite['title']) ?></a></h3>
<p><?= e($favorite['name']) ?> — ₱<?= number_format((int)$favorite['price_php']) ?> — <?= (int)$favorite['days'] ?> Days / <?= (int)$favorite['nights'] ?> Nights</p>
</article>
<?php endforeach; ?>
<?php if (!$favoriteRows): ?><p>No favorite packages yet.</p><?php endif; ?>
</main></body></html>
