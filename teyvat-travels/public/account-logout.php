<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/src/helpers.php';
start_secure_session();
unset($_SESSION['client_id'], $_SESSION['client_name'], $_SESSION['client_email'], $_SESSION['client_role']);
header('Location: index.php');
