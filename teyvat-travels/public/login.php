<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/src/helpers.php';
require_once dirname(__DIR__) . '/src/auth.php';

start_secure_session();

if (is_admin_logged_in()) {
    header('Location: admin/index.php');
    exit;
}
if (is_client_logged_in()) {
    header('Location: account.php');
    exit;
}

$email = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim((string) ($_POST['email'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');

    if (!csrf_is_valid($_POST['csrf_token'] ?? null)) {
        set_flash('error', 'The login session expired. Please try again.');
    } elseif (!login_attempt_allowed()) {
        set_flash('error', 'Too many login attempts. Please wait 10 minutes and try again.');
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
        record_login_attempt();
        set_flash('error', 'Enter a valid email address and password.');
    } else {
        $admin = authenticate_admin($email, $password);
        if ($admin !== null) {
            session_regenerate_id(true);
            $_SESSION['admin_id'] = (int) $admin['id'];
            $_SESSION['admin_name'] = $admin['name'];
            $_SESSION['admin_email'] = $admin['email'];
            $_SESSION['admin_role'] = $admin['role'];
            unset($_SESSION['login_attempts'], $_SESSION['login_attempt_window_start']);
            header('Location: admin/index.php');
            exit;
        }

        $client = authenticate_client($email, $password);
        if ($client !== null) {
            session_regenerate_id(true);
            $_SESSION['client_id'] = (int) $client['id'];
            $_SESSION['client_name'] = $client['name'];
            $_SESSION['client_email'] = $client['email'];
            $_SESSION['client_role'] = $client['role'];
            unset($_SESSION['login_attempts'], $_SESSION['login_attempt_window_start']);
            header('Location: account.php');
            exit;
        }

        record_login_attempt();
        set_flash('error', 'Invalid email or password.');
    }

    header('Location: login.php');
    exit;
}

$csrfToken = csrf_token();
$flash = consume_flash();
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Login | Teyvat Travels</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #101c1b; color: #eef5f3; font-family: Inter, system-ui, sans-serif; }
    .login { width: min(420px, calc(100% - 2rem)); padding: 2rem; box-sizing: border-box; border: 1px solid #31433f; border-radius: 10px; background: #172826; }
    h1 { margin: 0 0 .35rem; }
    .subtitle { margin: 0 0 1.25rem; color: #b6c7c3; }
    label { display: block; margin-top: 1rem; font-weight: 700; }
    input { width: 100%; box-sizing: border-box; margin-top: .45rem; padding: .75rem; border: 1px solid #536862; border-radius: 5px; background: #101c1b; color: #fff; }
    button { width: 100%; margin-top: 1.25rem; padding: .75rem; border: 0; border-radius: 5px; background: #82d7bd; color: #101c1b; font-weight: 800; cursor: pointer; }
    a { color: #82d7bd; }
    .flash { padding: .75rem; border: 1px solid #d27c7c; border-radius: 5px; background: #3a2020; }
  </style>
</head>
<body>
  <main class="login">
    <h1>Teyvat Travels</h1>
    <p class="subtitle">Sign in as a traveller or Director.</p>
    <?php if ($flash): ?><p class="flash" role="alert"><?= e($flash['message']) ?></p><?php endif; ?>
    <form method="post">
      <input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>">
      <label for="email">Email</label>
      <input id="email" name="email" type="email" autocomplete="username" required value="<?= e($email) ?>">
      <label for="password">Password</label>
      <input id="password" name="password" type="password" autocomplete="current-password" required>
      <button type="submit">Log in</button>
    </form>
    <p><a href="account-register.php">Create a traveller account</a></p>
  </main>
</body>
</html>
