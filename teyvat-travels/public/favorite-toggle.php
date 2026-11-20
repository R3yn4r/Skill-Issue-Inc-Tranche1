<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/src/helpers.php';
require_once dirname(__DIR__) . '/src/db.php';

require_client();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method not allowed.');
}
if (!csrf_is_valid($_POST['csrf_token'] ?? null)) {
    set_flash('error', 'The session expired. Please try again.');
    header('Location: index.php');
    exit;
}

$packageId = (int) ($_POST['package_id'] ?? 0);
$returnTo = trim((string) ($_POST['return_to'] ?? 'index.php'));
if (!in_array($returnTo, ['index.php', 'account.php'], true) && !preg_match('/^nation\\.php\\?slug=[a-z0-9-]+$/', $returnTo)) {
    $returnTo = 'index.php';
}

if ($packageId > 0) {
    $pdo = db();
    $exists = $pdo->prepare('SELECT 1 FROM favorites WHERE user_id=:user_id AND package_id=:package_id');
    $exists->execute(['user_id'=>(int)$_SESSION['client_id'], 'package_id'=>$packageId]);
    if ($exists->fetch()) {
        $pdo->prepare('DELETE FROM favorites WHERE user_id=:user_id AND package_id=:package_id')->execute(['user_id'=>(int)$_SESSION['client_id'], 'package_id'=>$packageId]);
        set_flash('success', 'Package removed from favorites.');
    } else {
        $pdo->prepare('INSERT INTO favorites (user_id, package_id) VALUES (:user_id, :package_id)')->execute(['user_id'=>(int)$_SESSION['client_id'], 'package_id'=>$packageId]);
        set_flash('success', 'Package added to favorites.');
    }
}

header('Location: ' . $returnTo);
