<?php
$currentPage = $currentPage ?? 'home';
$brandHref = $brandHref ?? 'index.php';
?>
<a class="skip-link" href="#main-content">Skip to content</a>
<header class="site-header">
  <div class="site-header__inner">
    <input class="menu-toggle" type="checkbox" id="menu-toggle" aria-label="Open navigation menu">
    <label class="menu-button" for="menu-toggle" aria-hidden="true"><span></span><span></span><span></span></label>
    <a class="site-brand" href="<?= e($brandHref) ?>" aria-label="Skill Issue Inc. home">
      <img class="site-brand__logo" src="assets/img/skill-issue-logo.svg" alt="Skill Issue Inc.">
    </a>
    <nav class="site-nav" aria-label="Primary navigation">
      <div class="site-nav__desktop">
        <a class="site-nav__link <?= $currentPage === 'home' ? 'is-active' : '' ?>" href="index.php">Home</a>
        <a class="site-nav__link" href="index.php#packages">Packages</a>
        <a class="site-nav__link" href="index.php#nations">Destinations</a>
        <a class="site-nav__link" href="index.php#who-we-are">About Us</a>
        <a class="site-nav__link" href="index.php#faq">FAQ</a>
        <a class="site-nav__link" href="index.php#contact">Contact</a>
        <?php if (is_client_logged_in()): ?>
          <a class="site-nav__link" href="account.php">My account</a>
        <?php elseif (!is_admin_logged_in()): ?>
          <a class="site-nav__link" href="login.php">Log in</a>
        <?php endif; ?>
      </div>
    </nav>
  </div>
</header>
