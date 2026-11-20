<?php
declare(strict_types=1);

$pageTitle = $pageTitle ?? 'Teyvat Travels';
$pageDescription = $pageDescription ?? 'Unofficial fan travel guides for Teyvat.';
$extraCss = $extraCss ?? [];
?>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="<?= e($pageDescription) ?>">
<meta name="theme-color" content="#101b1c">
<title><?= e($pageTitle) ?></title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/style.css">
<link rel="stylesheet" href="css/home-extra.css">
<link rel="stylesheet" href="css/packages.css">
<link rel="stylesheet" href="css/contact.css">
<link rel="stylesheet" href="css/layout-align.css">
<link rel="stylesheet" href="css/site-enhancements.css">
<?php foreach ($extraCss as $cssFile): ?>
  <link rel="stylesheet" href="<?= e($cssFile) ?>">
<?php endforeach; ?>
