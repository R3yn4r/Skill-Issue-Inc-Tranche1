<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/src/helpers.php';
require_once dirname(__DIR__) . '/src/db.php';

start_secure_session();
$config = require dirname(__DIR__) . '/config/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    exit('Method not allowed.');
}

if (!csrf_is_valid($_POST['csrf_token'] ?? null)) {
    set_flash('error', 'The form session has expired. Please try again.');
    header('Location: index.php#contact');
    exit;
}

if (trim((string) ($_POST['website'] ?? '')) !== '') {
    set_flash('success', 'Thank you. Your inquiry has been received.');
    header('Location: index.php#contact');
    exit;
}

$name = trim((string) ($_POST['name'] ?? ''));
$email = trim((string) ($_POST['email'] ?? ''));
$subject = trim((string) ($_POST['subject'] ?? ''));
$message = trim((string) ($_POST['message'] ?? ''));

$_SESSION['inquiry_old'] = [
    'name' => $name,
    'email' => $email,
    'subject' => $subject,
    'message' => $message,
];

$errors = [];
if ($name === '' || mb_strlen($name) > 100) {
    $errors[] = 'Enter a name between 1 and 100 characters.';
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 190) {
    $errors[] = 'Enter a valid email address.';
}
if (mb_strlen($subject) > 150) {
    $errors[] = 'The subject must be 150 characters or fewer.';
}
if ($message === '' || mb_strlen($message) > 5000) {
    $errors[] = 'Enter a message between 1 and 5000 characters.';
}

if ($errors) {
    set_flash('error', implode(' ', $errors));
    header('Location: index.php#contact');
    exit;
}

$remoteAddress = (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
$ipHash = hash('sha256', 'teyvat-inquiry|' . $remoteAddress);

try {
    $pdo = db();

    $throttle = $pdo->prepare(
        'SELECT COUNT(*) FROM inquiries
         WHERE ip_hash = :ip_hash AND created_at >= (NOW() - INTERVAL 10 MINUTE)'
    );
    $throttle->execute(['ip_hash' => $ipHash]);
    if ((int) $throttle->fetchColumn() >= 5) {
        set_flash('error', 'Too many inquiries submitted recently. Please wait a few minutes and try again.');
        header('Location: index.php#contact');
        exit;
    }

    $insert = $pdo->prepare(
        'INSERT INTO inquiries (name, email, subject, message, user_id, ip_hash)
         VALUES (:name, :email, :subject, :message, :user_id, :ip_hash)'
    );
    $insert->execute([
        'name' => $name,
        'email' => $email,
        'subject' => $subject !== '' ? $subject : null,
        'message' => $message,
        'user_id' => is_client_logged_in() ? (int) $_SESSION['client_id'] : null,
        'ip_hash' => $ipHash,
    ]);

    $notifyTo = trim((string) ($config['mail_notify_to'] ?? ''));
    if ($notifyTo !== '' && filter_var($notifyTo, FILTER_VALIDATE_EMAIL) && function_exists('mail')) {
        $subjectLine = 'New Teyvat Travels inquiry: ' . ($subject !== '' ? $subject : 'General inquiry');
        $body = "Name: {$name}\nEmail: {$email}\nSubject: " . ($subject !== '' ? $subject : 'General inquiry') . "\n\n{$message}";
        $headers = [
            'From: Teyvat Travels <no-reply@localhost>',
            'Reply-To: ' . $email,
            'Content-Type: text/plain; charset=UTF-8',
        ];
        @mail($notifyTo, $subjectLine, $body, implode("\r\n", $headers));
    }

    unset($_SESSION['inquiry_old']);
    set_flash('success', 'Thank you. Your inquiry has been received.');
    header('Location: index.php#contact');
    exit;
} catch (Throwable $e) {
    error_log('Inquiry submission failed: ' . $e->getMessage());
    set_flash('error', 'Your inquiry could not be saved. Please try again.');
    header('Location: index.php#contact');
    exit;
}
