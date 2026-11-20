<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/src/helpers.php';
require_once dirname(__DIR__) . '/src/db.php';

start_secure_session();
$csrfToken = csrf_token();

$slug = strtolower(trim((string) ($_GET['slug'] ?? '')));
$nationStatement = db()->prepare(
    'SELECT * FROM nations WHERE slug = :slug LIMIT 1'
);
$nationStatement->execute(['slug' => $slug]);
$nation = $nationStatement->fetch();

if (!is_array($nation)) {
    http_response_code(404);
    exit('Nation not found.');
}

$pdo = db();

$factsStatement = $pdo->prepare(
    'SELECT label, value FROM nation_facts
      WHERE nation_id = :nation_id
      ORDER BY sort_order ASC, id ASC'
);
$factsStatement->execute(['nation_id' => $nation['id']]);
$facts = $factsStatement->fetchAll();

$locationsStatement = $pdo->prepare(
    'SELECT name, image_path, image_alt, description, tag
       FROM locations
      WHERE nation_id = :nation_id
      ORDER BY sort_order ASC, id ASC'
);
$locationsStatement->execute(['nation_id' => $nation['id']]);
$locations = $locationsStatement->fetchAll();

$tipsStatement = $pdo->prepare(
    'SELECT title, body, icon
       FROM tips
      WHERE nation_id = :nation_id
      ORDER BY sort_order ASC, id ASC'
);
$tipsStatement->execute(['nation_id' => $nation['id']]);
$tips = $tipsStatement->fetchAll();

$packageStatement = $pdo->prepare(
    'SELECT * FROM packages
      WHERE nation_id = :nation_id AND is_active = 1
      ORDER BY sort_order ASC, id ASC
      LIMIT 1'
);
$packageStatement->execute(['nation_id' => $nation['id']]);
$package = $packageStatement->fetch();

$stops = [];
if (is_array($package)) {
    $stopsStatement = $pdo->prepare(
        'SELECT name FROM package_stops
          WHERE package_id = :package_id
          ORDER BY sort_order ASC, id ASC'
    );
    $stopsStatement->execute(['package_id' => $package['id']]);
    $stops = $stopsStatement->fetchAll();
}

$nextStatement = $pdo->prepare(
    'SELECT slug, name, image_path
       FROM nations
      WHERE sort_order > :sort_order
      ORDER BY sort_order ASC
      LIMIT 1'
);
$nextStatement->execute(['sort_order' => $nation['sort_order']]);
$nextNation = $nextStatement->fetch();
if (!is_array($nextNation)) {
    $nextStatement = $pdo->query(
        'SELECT slug, name, image_path FROM nations ORDER BY sort_order ASC LIMIT 1'
    );
    $nextNation = $nextStatement->fetch();
}

$aboutParagraphs = preg_split('/\R{2,}/', (string) $nation['about_body']) ?: [];
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="<?= e($nation['meta_description']) ?>">
  <meta name="theme-color" content="#101b1c">
  <title><?= e($nation['name']) ?> | Teyvat Travels</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/home-extra.css">
  <link rel="stylesheet" href="css/packages.css">
  <link rel="stylesheet" href="css/contact.css">
  <link rel="stylesheet" href="css/layout-align.css">
</head>
<body class="nation-page" id="top" style="--accent: <?= e($nation['accent_color']) ?>;">
  <a class="skip-link" href="#main-content">Skip to content</a>
  <header class="site-header">
    <div class="site-header__inner">
      <a class="site-brand" href="index.php" aria-label="Skill Issue Inc. home">
        <img class="site-brand__logo" src="assets/img/skill-issue-logo.svg" alt="Skill Issue Inc.">
      </a>
      <nav class="site-nav" aria-label="Primary navigation">
        <a class="site-nav__link" href="index.php">Home</a>
        <a class="site-nav__link" href="index.php#packages">Packages</a>
        <a class="site-nav__link" href="index.php#nations">Destinations</a>
        <a class="site-nav__link" href="index.php#faq">FAQ</a>
        <a class="site-nav__link" href="index.php#contact">Contact</a>
        <?php if (is_client_logged_in()): ?>
          <a class="site-nav__link" href="account.php">My account</a>
        <?php else: ?>
          <a class="site-nav__link" href="login.php">Log in</a>
        <?php endif; ?>
      </nav>
    </div>
  </header>

  <main class="nation-page" id="main-content" style="--accent: <?= e($nation['accent_color']) ?>;">
    <section class="nation-hero" aria-labelledby="hero-title">
      <div class="nation-hero__bg" style="background-image: url('<?= e($nation['image_path']) ?>');" role="img" aria-label="<?= e($nation['hero_alt']) ?>"></div>
      <div class="nation-hero__veil" aria-hidden="true"></div>
      <div class="nation-hero__content">
        <p class="nation-hero__element section-kicker"><?= e($nation['element']) ?></p>
        <p class="nation-hero__kicker"><?= e($nation['kicker']) ?></p>
        <h1 class="nation-hero__title" id="hero-title"><?= e($nation['name']) ?></h1>
        <p class="nation-hero__tagline"><?= e($nation['tagline']) ?></p>
        <a class="nation-hero__scroll-cue" href="#about"><span class="nation-hero__scroll-line"></span><span>Scroll down</span></a>
      </div>
    </section>

    <section class="nation-about" id="about" aria-labelledby="about-title">
      <div class="nation-wrap">
        <div class="nation-about__grid">
          <div class="nation-about__text">
            <p class="section-kicker"><?= e($nation['about_kicker']) ?></p>
            <h2 id="about-title"><?= e($nation['about_heading']) ?></h2>
            <?php foreach ($aboutParagraphs as $paragraph): ?>
              <p class="nation-about__body"><?= e(trim($paragraph)) ?></p>
            <?php endforeach; ?>
          </div>
          <aside class="nation-about__facts">
            <div class="nation-facts-card">
              <h3 class="nation-facts-card__heading">Quick Facts</h3>
              <dl class="nation-facts-card__list">
                <?php foreach ($facts as $fact): ?>
                  <div class="nation-facts-card__row">
                    <dt><?= e($fact['label']) ?></dt>
                    <dd><?= e($fact['value']) ?></dd>
                  </div>
                <?php endforeach; ?>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <section class="nation-locations" aria-labelledby="locations-title">
      <div class="nation-wrap">
        <p class="section-kicker">Points of interest</p>
        <h2 class="nation-locations__heading" id="locations-title">Key Locations</h2>
        <div class="nation-locations__grid">
          <?php foreach ($locations as $location): ?>
            <article class="nation-loc-card">
              <img src="<?= e($location['image_path']) ?>" alt="<?= e($location['image_alt']) ?>" class="nation-loc-card__img" loading="lazy" width="600" height="400">
              <div class="nation-loc-card__body">
                <h3 class="nation-loc-card__title"><?= e($location['name']) ?></h3>
                <p class="nation-loc-card__desc"><?= e($location['description']) ?></p>
                <?php if ($location['tag'] !== null && $location['tag'] !== ''): ?>
                  <span class="mondstadt-tag"><?= e($location['tag']) ?></span>
                <?php endif; ?>
              </div>
            </article>
          <?php endforeach; ?>
        </div>
      </div>
    </section>

    <section class="nation-tips" aria-labelledby="tips-title">
      <div class="nation-wrap">
        <p class="section-kicker">Before you go</p>
        <h2 class="nation-tips__heading" id="tips-title">Travel Tips</h2>
        <div class="nation-tips__grid">
          <?php foreach ($tips as $tip): ?>
            <article class="nation-tip-card">
              <span class="nation-tip-card__icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><use href="assets/img/game-icons.svg#<?= e($tip['icon']) ?>"></use></svg></span>
              <h3 class="nation-tip-card__title"><?= e($tip['title']) ?></h3>
              <p class="nation-tip-card__text"><?= e($tip['body']) ?></p>
            </article>
          <?php endforeach; ?>
        </div>
      </div>
    </section>

    <?php if (is_array($package)): ?>
      <section class="pk-section" id="<?= e($nation['slug']) ?>-package" aria-labelledby="package-title">
        <div class="pk-inner">
          <header class="pk-heading">
            <p class="pk-heading__kicker">Nation tour package</p>
            <h2 id="package-title"><?= e($package['title']) ?></h2>
          </header>
          <article class="pk-detail-card">
            <p><?= e($package['description']) ?></p>
            <ul>
              <?php foreach ($stops as $stop): ?><li><?= e($stop['name']) ?></li><?php endforeach; ?>
            </ul>
            <p><strong>₱<?= number_format((int) $package['price_php']) ?></strong> — <?= (int) $package['days'] ?> Days / <?= (int) $package['nights'] ?> Nights</p>
            <?php if (is_client_logged_in()): ?>
              <form method="post" action="favorite-toggle.php">
                <input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>">
                <input type="hidden" name="package_id" value="<?= (int) $package['id'] ?>">
                <input type="hidden" name="return_to" value="nation.php?slug=<?= rawurlencode($nation['slug']) ?>">
                <button type="submit">Toggle favorite</button>
              </form>
            <?php else: ?>
              <p><a href="login.php">Log in to save this package</a></p>
            <?php endif; ?>
          </article>
        </div>
      </section>
    <?php endif; ?>

    <?php if (is_array($nextNation)): ?>
      <section class="nation-next" aria-labelledby="next-title">
        <div class="nation-wrap">
          <p class="section-kicker">Continue your journey</p>
          <h2 id="next-title">Explore <?= e($nextNation['name']) ?></h2>
          <a href="nation.php?slug=<?= rawurlencode($nextNation['slug']) ?>">View <?= e($nextNation['name']) ?> <span aria-hidden="true">&rarr;</span></a>
        </div>
      </section>
    <?php endif; ?>
  </main>
</body>
</html>
