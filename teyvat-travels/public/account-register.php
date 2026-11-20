<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/src/helpers.php';
require_once dirname(__DIR__) . '/src/auth.php';

start_secure_session();
if (is_client_logged_in()) {
    header('Location: account.php');
    exit;
}

$flash = consume_flash();
$name = '';
$email = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim((string) ($_POST['name'] ?? ''));
    $email = trim((string) ($_POST['email'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');
    $confirm = (string) ($_POST['confirm_password'] ?? '');

    if (!csrf_is_valid($_POST['csrf_token'] ?? null)) {
        set_flash('error', 'The registration session expired. Please try again.');
    } elseif (mb_strlen($name) < 2 || mb_strlen($name) > 100) {
        set_flash('error', 'Enter a name between 2 and 100 characters.');
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 190) {
        set_flash('error', 'Enter a valid email address.');
    } elseif (mb_strlen($password) < 8 || $password !== $confirm) {
        set_flash('error', 'Use at least 8 characters and make both passwords match.');
    } else {
        [$registered, $result] = register_client($name, $email, $password);
        if (!$registered) {
            set_flash('error', (string) $result);
        } else {
            session_regenerate_id(true);
            $_SESSION['client_id'] = (int) $result;
            $_SESSION['client_name'] = $name;
            $_SESSION['client_email'] = mb_strtolower($email);
            $_SESSION['client_role'] = 'client';
            set_flash('success', 'Your account is ready.');
            header('Location: account.php');
            exit;
        }
    }
    header('Location: account-register.php');
    exit;
}

$csrfToken = csrf_token();
$flash = consume_flash();
?>
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Create account | Teyvat Travels</title></head><body>
<main style="max-width:480px;margin:4rem auto;padding:1.5rem;font-family:system-ui">
<h1>Create an account</h1>
<?php if ($flash): ?><p role="alert"><?= e($flash['message']) ?></p><?php endif; ?>
<form method="post">
<input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>">
<p><label>Name<br><input name="name" required maxlength="100" value="<?= e($name) ?>"></label></p>
<p><label>Email<br><input name="email" type="email" required maxlength="190" value="<?= e($email) ?>"></label></p>
<p><label>Password<br><input name="password" type="password" minlength="8" required></label></p>
<p><label>Confirm password<br><input name="confirm_password" type="password" minlength="8" required></label></p>
<button type="submit">Create account</button>
</form>
<p><a href="login.php">Already have an account? Log in</a></p>
</main></body></html>
