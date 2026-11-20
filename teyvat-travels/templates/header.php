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
        <div class="site-nav__dropdown">
          <a class="site-nav__link site-nav__link--has-dropdown" href="index.php#nations" aria-haspopup="true">
            Destinations
            <svg class="site-nav__chevron" aria-hidden="true" width="10" height="6" viewBox="0 0 10 6" fill="none">
              <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
          <ul class="site-nav__panel" role="list">
            <li><a href="mondstadt.php"><span class="site-nav__dot" style="background:#82d7bd" aria-hidden="true"></span>Mondstadt</a></li>
            <li><a href="liyue.php"><span class="site-nav__dot" style="background:#e7bd69" aria-hidden="true"></span>Liyue</a></li>
            <li><a href="inazuma.php"><span class="site-nav__dot" style="background:#c59bed" aria-hidden="true"></span>Inazuma</a></li>
            <li><a href="sumeru.php"><span class="site-nav__dot" style="background:#a6d46c" aria-hidden="true"></span>Sumeru</a></li>
            <li><a href="fontaine.php"><span class="site-nav__dot" style="background:#7ed9e7" aria-hidden="true"></span>Fontaine</a></li>
            <li><a href="natlan.php"><span class="site-nav__dot" style="background:#ff936d" aria-hidden="true"></span>Natlan</a></li>
            <li><a href="snezhnaya.php"><span class="site-nav__dot" style="background:#a6ddf3" aria-hidden="true"></span>Snezhnaya</a></li>
          </ul>
          <details class="site-nav__details">
            <summary class="site-nav__link site-nav__link--summary">
              Destinations
              <svg class="site-nav__chevron" aria-hidden="true" width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </summary>
            <ul class="site-nav__sub" role="list">
              <li><a href="mondstadt.php"><span class="site-nav__dot" style="background:#82d7bd" aria-hidden="true"></span>Mondstadt</a></li>
              <li><a href="liyue.php"><span class="site-nav__dot" style="background:#e7bd69" aria-hidden="true"></span>Liyue</a></li>
              <li><a href="inazuma.php"><span class="site-nav__dot" style="background:#c59bed" aria-hidden="true"></span>Inazuma</a></li>
              <li><a href="sumeru.php"><span class="site-nav__dot" style="background:#a6d46c" aria-hidden="true"></span>Sumeru</a></li>
              <li><a href="fontaine.php"><span class="site-nav__dot" style="background:#7ed9e7" aria-hidden="true"></span>Fontaine</a></li>
              <li><a href="natlan.php"><span class="site-nav__dot" style="background:#ff936d" aria-hidden="true"></span>Natlan</a></li>
              <li><a href="snezhnaya.php"><span class="site-nav__dot" style="background:#a6ddf3" aria-hidden="true"></span>Snezhnaya</a></li>
            </ul>
          </details>
        </div>
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
