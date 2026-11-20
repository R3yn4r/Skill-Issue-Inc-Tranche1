<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/src/helpers.php';
require_once dirname(__DIR__) . '/src/db.php';

start_secure_session();
$csrfToken = csrf_token();
$flash = consume_flash();
$old = is_array($_SESSION['inquiry_old'] ?? null) ? $_SESSION['inquiry_old'] : [];
unset($_SESSION['inquiry_old']);

$faqStatement = db()->prepare(
    'SELECT question, answer
       FROM faqs
      WHERE is_published = 1
      ORDER BY sort_order ASC, id ASC'
);
$faqStatement->execute();
$faqs = $faqStatement->fetchAll();

$packageStatement = db()->prepare(
    'SELECT p.id, p.title, p.description, p.price_php, p.days, p.nights,
            p.badge, p.is_featured, p.sort_order,
            n.slug, n.name, n.accent_color, n.card_alt, n.image_path
       FROM packages p
       JOIN nations n ON n.id = p.nation_id
      WHERE p.is_active = 1
      ORDER BY p.sort_order ASC, p.id ASC'
);
$packageStatement->execute();
$packages = $packageStatement->fetchAll();

$stopStatement = db()->prepare(
    'SELECT name FROM package_stops
      WHERE package_id = :package_id
      ORDER BY sort_order ASC, id ASC'
);
foreach ($packages as &$package) {
    $stopStatement->execute(['package_id' => $package['id']]);
    $package['stops'] = $stopStatement->fetchAll();
}
unset($package);
?>
<!doctype html>
<html lang="en">
<head>
  <?php
    $pageTitle = 'Skill Issue Inc. | Teyvat Travels';
    $pageDescription = 'Meet Skill Issue Inc., the team behind Teyvat Travels, and explore our guides, routes, and travel resources for all seven nations.';
    require dirname(__DIR__) . '/templates/head.php';
  ?>
</head>
<body class="home-page" id="top">
  <a class="skip-link" href="#main-content">Skip to content</a>

  <header class="site-header">
    <div class="site-header__inner">
      <!-- Hamburger: visually-hidden checkbox drives mobile menu via CSS ~ sibling -->
      <input class="menu-toggle" type="checkbox" id="menu-toggle" aria-label="Open navigation menu">
      <label class="menu-button" for="menu-toggle" aria-hidden="true">
        <span></span><span></span><span></span>
      </label>

      <a class="site-brand" href="index.php" aria-label="Skill Issue Inc. home">
        <img class="site-brand__logo" src="assets/img/skill-issue-logo.svg" alt="">
      </a>

      <nav class="site-nav" aria-label="Main navigation">

        <!-- On-page company navigation -->
        <a class="site-nav__link is-active" href="#top" aria-current="page">Home</a>
        <a class="site-nav__link" href="#packages">Packages</a>

        <!-- Destinations: CSS :hover/:focus-within dropdown on desktop,
             <details>/<summary> expandable on mobile -->
        <div class="site-nav__dropdown">
          <!-- Desktop trigger (plain link + chevron, kept focusable) -->
          <a class="site-nav__link site-nav__link--has-dropdown" href="#nations"
             aria-haspopup="true">Destinations
            <svg class="site-nav__chevron" aria-hidden="true" width="10" height="6"
                 viewBox="0 0 10 6" fill="none">
              <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5"
                    stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
          <!-- Desktop panel -->
          <ul class="site-nav__panel" role="list">
            <li>
              <a href="mondstadt.php">
                <span class="site-nav__dot" style="background:#82d7bd" aria-hidden="true"></span>
                Mondstadt
              </a>
            </li>
            <li>
              <a href="liyue.php">
                <span class="site-nav__dot" style="background:#e7bd69" aria-hidden="true"></span>
                Liyue
              </a>
            </li>
            <li>
              <a href="inazuma.php">
                <span class="site-nav__dot" style="background:#c59bed" aria-hidden="true"></span>
                Inazuma
              </a>
            </li>
            <li>
              <a href="sumeru.php">
                <span class="site-nav__dot" style="background:#a6d46c" aria-hidden="true"></span>
                Sumeru
              </a>
            </li>
            <li>
              <a href="fontaine.php">
                <span class="site-nav__dot" style="background:#7ed9e7" aria-hidden="true"></span>
                Fontaine
              </a>
            </li>
            <li>
              <a href="natlan.php">
                <span class="site-nav__dot" style="background:#ff936d" aria-hidden="true"></span>
                Natlan
              </a>
            </li>
            <li>
              <a href="snezhnaya.php">
                <span class="site-nav__dot" style="background:#a6ddf3" aria-hidden="true"></span>
                Snezhnaya
              </a>
            </li>
          </ul>
          <!-- Mobile-only: <details> expandable -->
          <details class="site-nav__details">
            <summary class="site-nav__link site-nav__link--summary">
              Destinations
              <svg class="site-nav__chevron" aria-hidden="true" width="10" height="6"
                   viewBox="0 0 10 6" fill="none">
                <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5"
                      stroke-linecap="round" stroke-linejoin="round"/>
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

        <a class="site-nav__link" href="#who-we-are">About Us</a>
        <a class="site-nav__link" href="#faq">FAQ</a>
        <a class="site-nav__link" href="#contact">Contact</a>
        <?php if (is_client_logged_in()): ?>
          <a class="site-nav__link" href="account.php">My account</a>
        <?php else: ?>
          <a class="site-nav__link" href="login.php">Log in</a>
        <?php endif; ?>

      </nav>
    </div>
  </header>

  <main id="main-content" class="hx-main">
    <!-- Company profile hero -->
    <section class="hero hx-hero" aria-labelledby="hero-title">
      <video class="hero__video" autoplay muted loop playsinline poster="assets/img/mondstadt.webp" aria-hidden="true">
        <source src="images/Liyue%20Lantern.mp4" type="video/mp4">
      </video>
      <div class="hero__veil" aria-hidden="true"></div>
      <div class="hero__sparkles" aria-hidden="true">
        <span></span><span></span><span></span><span></span><span></span><span></span>
      </div>
      <div class="hero__content">
        <p class="hero__eyebrow entrance entrance--one">Skill Issue Inc.</p>
        <h1 class="hero__title entrance entrance--two" id="hero-title">Teyvat Travels</h1>
        <p class="hero__tagline entrance entrance--three">Well-planned journeys across all seven nations of Teyvat.</p>
        <div class="hx-hero-actions entrance entrance--four">
          <a class="journey-button hx-hero-primary" href="#packages">
            <span>Explore Our Packages</span>
            <span class="journey-button__arrow" aria-hidden="true">&#8594;</span>
          </a>
        </div>
      </div>
      <a class="scroll-cue" href="#packages" aria-label="Scroll to explore travel packages">
        <span class="scroll-cue__line" aria-hidden="true"></span>
        <span>Explore Packages</span>
      </a>
      <span class="hero__edition" aria-hidden="true">An expedition across seven lands</span>
    </section>

    <!-- Guide package overview -->
    <section class="hx-section hx-packages hx-anchor-offset" id="nations" aria-labelledby="hx-packages-title">
      <div class="hx-container">
        <header class="hx-section-heading hx-anchor-offset" id="packages">
          <p class="hx-eyebrow">Tour Packages</p>
          <h2 class="hx-section-title" id="hx-packages-title">Choose your kind of expedition</h2>
          <p class="hx-section-intro">Explore our guide collections and build a route that fits the way you travel.</p>
        </header>
        <div class="pk-grid" aria-label="Seven nation tour packages">
          <?php foreach ($packages as $index => $package): ?>
            <article class="pk-card <?= $package['is_featured'] ? 'pk-card--featured' : '' ?>" style="--accent: <?= e($package['accent_color']) ?>;">
              <div class="pk-card__visual">
                <a class="pk-card__image-link" href="nation.php?slug=<?= rawurlencode($package['slug']) ?>"><img class="pk-card__image" src="<?= e($package['image_path']) ?>" alt="<?= e($package['card_alt']) ?>" loading="lazy" width="1600" height="900"></a>
                <span class="pk-card__shade" aria-hidden="true"></span>
                <span class="pk-card__index" aria-hidden="true"><?= sprintf('%02d', $index + 1) ?></span>
                <?php if ($package['badge'] !== null && $package['badge'] !== ''): ?>
                  <span class="pk-card__badge"><?= e($package['badge']) ?></span>
                <?php endif; ?>
                <div class="pk-card__overlay">
                  <a class="pk-region" href="nation.php?slug=<?= rawurlencode($package['slug']) ?>"><?= e($package['name']) ?></a>
                  <h3 class="pk-title"><?= e($package['title']) ?></h3>
                  <p class="pk-card__price">From ₱<?= number_format((int) $package['price_php']) ?> per person</p>
                </div>
              </div>
              <div class="pk-card__body">
                <p class="pk-description"><?= e($package['description']) ?></p>
                <ul class="pk-stops" aria-label="Featured stops">
                  <?php foreach ($package['stops'] as $stop): ?>
                    <li><?= e($stop['name']) ?></li>
                  <?php endforeach; ?>
                </ul>
                <div class="pk-meta">
                  <div class="pk-stat"><p class="pk-stat-label">Duration</p><p class="pk-stat-value"><?= (int) $package['days'] ?> Days / <?= (int) $package['nights'] ?> Nights</p></div>
                  <div class="pk-stat"><p class="pk-stat-label">Starting price</p><p class="pk-stat-value">From ₱<?= number_format((int) $package['price_php']) ?> per person</p></div>
                </div>
                <a class="pk-link" href="#contact">View details <span aria-hidden="true">&#8594;</span></a>
                <a class="pk-explore-link" href="nation.php?slug=<?= rawurlencode($package['slug']) ?>">Explore <?= e($package['name']) ?> <span aria-hidden="true">&#8594;</span></a>
                <?php if (is_client_logged_in()): ?>
                  <form method="post" action="favorite-toggle.php">
                    <input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>">
                    <input type="hidden" name="package_id" value="<?= (int) $package['id'] ?>">
                    <input type="hidden" name="return_to" value="index.php">
                    <button type="submit" class="ct-cta-btn">Toggle favorite</button>
                  </form>
                <?php else: ?>
                  <a class="pk-explore-link" href="login.php">Log in to save favorites</a>
                <?php endif; ?>
              </div>
            </article>
          <?php endforeach; ?>
        </div>
      </div>
    </section>

    <!-- Services and travel resources -->
    <section class="hx-section hx-offerings" id="offerings" aria-labelledby="hx-offerings-title">
      <div class="hx-container">
        <header class="hx-section-heading">
          <p class="hx-eyebrow">What We Offer</p>
          <h2 class="hx-section-title" id="hx-offerings-title">Tools for every Traveller</h2>
        </header>
        <div class="hx-offerings-grid">
          <article class="hx-panel hx-offering-card">
            <span class="hx-symbol" aria-hidden="true">&#9678;</span>
            <h3 class="hx-card-title">Nation Guides</h3>
            <p class="hx-body-copy">Your companion for every nation, packed with the places and stories that make each one unforgettable.</p>
          </article>
          <article class="hx-panel hx-offering-card">
            <span class="hx-symbol" aria-hidden="true">&#10148;</span>
            <h3 class="hx-card-title">Travel Tips</h3>
            <p class="hx-body-copy">Learn what to pack, where to start, and which hidden gems are worth the detour.</p>
          </article>
          <article class="hx-panel hx-offering-card">
            <span class="hx-symbol" aria-hidden="true">&#8599;</span>
            <h3 class="hx-card-title">Expedition Routes</h3>
            <p class="hx-body-copy">Make the most of every journey with paths designed to save time and show off the best views.</p>
          </article>
          <article class="hx-panel hx-offering-card">
            <span class="hx-symbol" aria-hidden="true">&#10022;</span>
            <h3 class="hx-card-title">Cultural Highlights</h3>
            <p class="hx-body-copy">Dive into the festivals, flavors, and legends that give each nation its heart and character.</p>
          </article>
        </div>
      </div>
    </section>

    <!-- Company introduction -->
    <section class="hx-section hx-who" id="who-we-are" aria-labelledby="hx-who-title">
      <div class="hx-container hx-who-layout">
        <div class="hx-copy-block">
          <p class="hx-eyebrow">Who We Are</p>
          <h2 class="hx-section-title" id="hx-who-title">A team for the journey</h2>
          <p class="hx-body-copy">Skill Issue Inc. is the team behind Teyvat Travels, a travel agency for explorers who want to travel across the seven nations of Teyvat. We are the researchers, writers, designers, and developers who turn a vast world into clear, well-planned journeys. Behind every destination guide, itinerary, and travel tip is a group of specialists who study each region in depth, map out the best routes, and keep every page accurate and up to date, so travelers can fully experience the joy of adventure with ease.</p>
        </div>
        <div class="hx-company-mark">
          <img class="hx-company-mark__logo" src="assets/img/skill-issue-logo.svg" alt="Skill Issue Inc.">
        </div>
      </div>
    </section>

    <!-- Director profile -->
    <section class="hx-section hx-director" aria-labelledby="hx-director-title">
      <div class="hx-container hx-director-layout">
        <figure class="hx-director-portrait">
          <img src="assets/img/director.jpg" alt="Charles Paule, Managing Director" loading="lazy" width="800" height="800">
        </figure>
        <div class="hx-director-copy">
          <p class="hx-eyebrow">Leadership</p>
          <h2 class="hx-section-title" id="hx-director-title">Meet Our Director</h2>
          <h3 class="hx-card-title">Charles Paule</h3>
          <p class="hx-director-role">Managing Director</p>
          <p class="hx-body-copy">Charles Paule leads Skill Issue Inc. with a commitment to making every journey through Teyvat clear, welcoming, and memorable. Charles brings together the researchers, writers, designers, and developers who create trustworthy guides for travelers across all seven nations. Charles believes thoughtful planning should make room for discovery, helping every Traveller explore with confidence.</p>
        </div>
      </div>
    </section>

    <!-- Mission and vision -->
    <section class="hx-section hx-purpose" aria-labelledby="hx-purpose-title">
      <div class="hx-container">
        <header class="hx-section-heading">
          <p class="hx-eyebrow">What Guides Us</p>
          <h2 class="hx-section-title" id="hx-purpose-title">Mission &amp; Vision</h2>
        </header>
        <div class="hx-purpose-grid">
          <article class="hx-panel hx-purpose-card">
            <span class="hx-symbol" aria-hidden="true">&#9670;</span>
            <h3 class="hx-card-title">Our Mission</h3>
            <p class="hx-body-copy">To make exploring Teyvat easier, smoother, and more enjoyable for every Traveller, one well-researched guide at a time.</p>
          </article>
          <article class="hx-panel hx-purpose-card">
            <span class="hx-symbol" aria-hidden="true">&#9671;</span>
            <h3 class="hx-card-title">Our Vision</h3>
            <p class="hx-body-copy">To be the most dependable travel companion in Teyvat, known for accurate guidance, engaging storytelling, and always being updated for the next horizon.</p>
          </article>
        </div>
      </div>
    </section>

    <!-- Frequently asked questions -->
    <section class="hx-section hx-faq" id="faq" aria-labelledby="hx-faq-title">
      <div class="hx-container hx-faq-layout">
        <header class="hx-section-heading hx-faq-heading">
          <p class="hx-eyebrow">FAQ</p>
          <h2 class="hx-section-title" id="hx-faq-title">A few helpful details</h2>
        </header>
        <div class="hx-faq-list">
          <?php foreach ($faqs as $faq): ?>
            <details class="hx-faq-item">
              <summary class="hx-faq-question"><?= e($faq['question']) ?></summary>
              <p class="hx-faq-answer"><?= e($faq['answer']) ?></p>
            </details>
          <?php endforeach; ?>
        </div>
      </div>
    </section>

    <!-- Contact details -->
    <section class="hx-section hx-contact" id="contact" aria-labelledby="hx-contact-title">
      <div class="hx-container ct-layout">

        <!-- Left: inquiry form -->
        <div class="ct-copy">
          <p class="hx-eyebrow ct-eyebrow">Contact</p>
          <h2 class="hx-section-title ct-heading" id="hx-contact-title">Plan the next chapter</h2>
          <div class="ct-heading-bar" aria-hidden="true"></div>
          <p class="hx-body-copy ct-intro">Send an inquiry to the team.</p>

          <?php if ($flash): ?>
            <div class="ct-form-alert <?= $flash['type'] === 'success' ? 'ct-form-alert--success' : 'ct-form-alert--error' ?>" role="alert">
              <?= e($flash['message']) ?>
            </div>
          <?php endif; ?>

          <form id="inquiry-form" class="ct-form" action="contact-submit.php" method="post" novalidate>
            <input type="hidden" name="csrf_token" value="<?= e($csrfToken) ?>">
            <input type="hidden" name="website" value="">

            <div class="ct-form-grid">
              <div class="ct-field">
                <label for="inquiry-name">Name</label>
                <input id="inquiry-name" name="name" type="text" maxlength="100" required
                       value="<?= e((string) ($old['name'] ?? '')) ?>">
              </div>
              <div class="ct-field">
                <label for="inquiry-email">Email</label>
                <input id="inquiry-email" name="email" type="email" maxlength="190" required
                       value="<?= e((string) ($old['email'] ?? '')) ?>">
              </div>
            </div>

            <div class="ct-field">
              <label for="inquiry-subject">Subject <span>(optional)</span></label>
              <input id="inquiry-subject" name="subject" type="text" maxlength="150"
                     value="<?= e((string) ($old['subject'] ?? '')) ?>">
            </div>

            <div class="ct-field">
              <label for="inquiry-message">Message</label>
              <textarea id="inquiry-message" name="message" rows="5" maxlength="5000" required><?= e((string) ($old['message'] ?? '')) ?></textarea>
            </div>

            <button class="ct-cta-btn ct-form-submit" type="submit">Send inquiry</button>
            <p class="ct-cta-note">We usually reply within a few days.</p>
          </form>
        </div>

        <!-- Right: contact details card -->
        <!-- Office hours are a placeholder — replace with your office schedule. -->
        <aside class="hx-panel ct-card" aria-label="Contact details">
          <div class="ct-card-accent" aria-hidden="true"></div>
          <h3 class="ct-card-title">Contact details</h3>
          <dl class="ct-details">

            <div class="ct-item">
              <div class="ct-icon" aria-hidden="true">✉️</div>
              <div class="ct-item-body">
                <dt class="ct-label">Email</dt>
                <dd class="ct-value">
                  <span class="ct-email">skillissueinc@gmail.com</span>
                </dd>
              </div>
            </div>

            <div class="ct-divider" aria-hidden="true"></div>

            <div class="ct-item">
              <div class="ct-icon" aria-hidden="true">📞</div>
              <div class="ct-item-body">
                <dt class="ct-label">Phone</dt>
                <dd class="ct-value">02-2546579</dd>
              </div>
            </div>

            <div class="ct-divider" aria-hidden="true"></div>

            <div class="ct-item">
              <div class="ct-icon" aria-hidden="true">📍</div>
              <div class="ct-item-body">
                <dt class="ct-label">Location</dt>
                <dd class="ct-value">Polytechnic University of the Philippines Sta. Maria Bulacan</dd>
              </div>
            </div>

            <div class="ct-divider" aria-hidden="true"></div>

            <div class="ct-item">
              <div class="ct-icon" aria-hidden="true">🕘</div>
              <div class="ct-item-body">
                <dt class="ct-label">Office Hours</dt>
                <dd class="ct-value">Monday-Friday, 8:30 AM to 5:30 PM</dd>
              </div>
            </div>

          </dl>
        </aside>

      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="footer-grid">

      <!-- Brand column -->
      <div class="footer-col footer-col--brand">
        <a class="site-brand site-brand--footer" href="index.php" aria-label="Skill Issue Inc. home">
          <img class="site-brand__logo" src="assets/img/skill-issue-logo.svg" alt="Skill Issue Inc.">
        </a>
        <p class="site-footer__blurb">Unofficial fan travel guides for the seven nations of Teyvat.</p>
        <p class="footer-col__copy">&copy; 2026 Skill Issue Inc.</p>
      </div>

      <!-- Destinations column: 4 left + 3 right via two-col layout -->
      <div class="footer-col">
        <span class="footer-col__title" id="footer-dest-label">Destinations</span>
        <nav aria-labelledby="footer-dest-label">
          <ul class="footer-col__links footer-col__links--two-col">
            <li><a href="mondstadt.php">Mondstadt</a></li>
            <li><a href="liyue.php">Liyue</a></li>
            <li><a href="inazuma.php">Inazuma</a></li>
            <li><a href="sumeru.php">Sumeru</a></li>
            <li><a href="fontaine.php">Fontaine</a></li>
            <li><a href="natlan.php">Natlan</a></li>
            <li><a href="snezhnaya.php">Snezhnaya</a></li>
          </ul>
        </nav>
      </div>

      <!-- Quick Links column: 3 left + 3 right via two-col layout -->
      <div class="footer-col">
        <span class="footer-col__title" id="footer-quick-label">Quick Links</span>
        <nav aria-labelledby="footer-quick-label">
          <ul class="footer-col__links footer-col__links--two-col">
            <li><a href="#top" aria-current="page">Home</a></li>
            <li><a href="#packages">Packages</a></li>
            <li><a href="#nations">Destinations</a></li>
            <li><a href="#who-we-are">About Us</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>
      </div>

    </div><!-- /.footer-grid -->

    <div class="footer-bottom">
      <p class="footer-bottom__copy">Unofficial fan project. Genshin Impact is a trademark of HoYoverse.</p>
      <a class="footer-back-top" href="#top">Back to top &#8593;</a>
    </div>
  </footer>
  <script src="js/inquiry.js"></script>
  <script src="js/site-enhancements.js" defer></script>
</body>
</html>