<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/src/helpers.php';
require_once dirname(__DIR__) . '/src/auth.php';

start_secure_session();
if (is_client_logged_in()) {
    header('Location: account.php');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim((string) ($_POST['email'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');
    if (!csrf_is_valid($_POST['csrf_token'] ?? null)) {
        set_flash('error', 'The login session expired. Please try again.');
    } elseif (!login_attempt_allowed()) {
        set_flash('error', 'Too many login attempts. Please wait 10 minutes.');
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
        record_login_attempt();
        set_flash('error', 'Enter a valid email and password.');
    } else {
        $user = authenticate_client($email, $password);
        if ($user === null) {
            record_login_attempt();
            set_flash('error', 'Invalid email or password.');
        } else {
            session_regenerate_id(true);
            $_SESSION['client_id'] = (int) $user['id'];
            $_SESSION['client_name'] = $user['name'];
            $_SESSION['client_email'] = $user['email'];
            $_SESSION['client_role'] = $user['role'];
            unset($_SESSION['login_attempts'], $_SESSION['login_attempt_window_start']);
            header('Location: account.php');
            exit;
        }
    }
    header('Location: account-login.php');
    exit;
}

$csrfToken = csrf_token();
$flash = consume_flash();
?>
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Account login | Teyvat Travels</title></head><body>
<main style="max-width:480px;margin:4rem auto;padding:1.5rem;font-family:system-ui">
<h1>Traveller login</h1>
<?php if ($flash): ?><p role="alert"><?= e($flash['message']) ?></p><?php endif; ?>
<form method="post">
<input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>">
<p><label>Email<br><input name="email" type="email" required autocomplete="username"></label></p>
<p><label>Password<br><input name="password" type="password" required autocomplete="current-password"></label></p>
<button type="submit">Log in</button>
</form>
<p><a href="account-register.php">Create an account</a></p>
</main></body></html>
