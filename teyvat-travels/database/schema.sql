-- =====================================================================
-- Teyvat Travels - database schema (MySQL / MariaDB)
--
-- Safe to re-run: every table uses CREATE TABLE IF NOT EXISTS and
-- nothing here ever drops or deletes data.
-- To start completely fresh, run manually:  DROP DATABASE teyvat_travels;
-- =====================================================================

CREATE DATABASE IF NOT EXISTS teyvat_travels
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE teyvat_travels;

-- ---------------------------------------------------------------------
-- nations: the seven nations (one row per nation page)
-- about_body holds the "About" paragraphs, separated by a blank line.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nations (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug             VARCHAR(40)  NOT NULL,
  name             VARCHAR(60)  NOT NULL,
  element          VARCHAR(30)  NULL,
  kicker           VARCHAR(120) NULL,
  tagline          VARCHAR(255) NULL,
  accent_color     CHAR(7)      NOT NULL,
  sort_order       SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  image_path       VARCHAR(255) NOT NULL,
  hero_alt         VARCHAR(255) NULL,
  card_alt         VARCHAR(255) NULL,
  meta_description VARCHAR(300) NULL,
  about_kicker     VARCHAR(120) NULL,
  about_heading    VARCHAR(200) NULL,
  about_body       TEXT         NULL,
  created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_nations_slug (slug),
  KEY idx_nations_sort (sort_order)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- nation_facts: the "Quick Facts" rows on each nation page
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nation_facts (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nation_id  INT UNSIGNED NOT NULL,
  label      VARCHAR(60)  NOT NULL,
  value      VARCHAR(160) NOT NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_facts_nation (nation_id, sort_order),
  CONSTRAINT fk_facts_nation FOREIGN KEY (nation_id)
    REFERENCES nations (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- packages: tour packages (currently one per nation, but a nation may
-- have several later). Price is stored as a whole number of pesos and
-- formatted as "PHP 12,500" by PHP when displayed.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS packages (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nation_id   INT UNSIGNED NOT NULL,
  title       VARCHAR(160) NOT NULL,
  description TEXT         NOT NULL,
  price_php   INT UNSIGNED NOT NULL,
  days        TINYINT UNSIGNED NOT NULL,
  nights      TINYINT UNSIGNED NOT NULL,
  badge       VARCHAR(60)  NULL,
  is_featured TINYINT(1)   NOT NULL DEFAULT 0,
  is_active   TINYINT(1)   NOT NULL DEFAULT 1,
  sort_order  SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_packages_nation (nation_id),
  KEY idx_packages_sort (is_active, sort_order),
  CONSTRAINT fk_packages_nation FOREIGN KEY (nation_id)
    REFERENCES nations (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- package_stops: the "featured stops" listed on a package
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS package_stops (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  package_id INT UNSIGNED NOT NULL,
  name       VARCHAR(120) NOT NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_stops_package (package_id, sort_order),
  CONSTRAINT fk_stops_package FOREIGN KEY (package_id)
    REFERENCES packages (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- locations: "Key Locations" cards (also feeds the photo gallery).
-- Seeded in a later phase.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS locations (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nation_id   INT UNSIGNED NOT NULL,
  name        VARCHAR(120) NOT NULL,
  image_path  VARCHAR(255) NOT NULL,
  image_alt   VARCHAR(255) NULL,
  description TEXT         NULL,
  tag         VARCHAR(80)  NULL,
  sort_order  SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_locations_nation (nation_id, sort_order),
  CONSTRAINT fk_locations_nation FOREIGN KEY (nation_id)
    REFERENCES nations (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- tips: "Travel Tips" cards on each nation page. Seeded in a later phase.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tips (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nation_id  INT UNSIGNED NOT NULL,
  title      VARCHAR(120) NOT NULL,
  body       TEXT         NOT NULL,
  icon       VARCHAR(40)  NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_tips_nation (nation_id, sort_order),
  CONSTRAINT fk_tips_nation FOREIGN KEY (nation_id)
    REFERENCES nations (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- faqs: homepage frequently asked questions
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS faqs (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  question     VARCHAR(255) NOT NULL,
  answer       TEXT         NOT NULL,
  sort_order   SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  is_published TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  KEY idx_faqs_sort (is_published, sort_order)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- director_profile: the Director's profile (a single row, id = 1)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS director_profile (
  id         TINYINT UNSIGNED NOT NULL,
  name       VARCHAR(100) NOT NULL,
  title      VARCHAR(100) NOT NULL,
  bio        TEXT         NOT NULL,
  photo_path VARCHAR(255) NULL,
  photo_alt  VARCHAR(255) NULL,
  updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- inquiries: messages sent through the contact/inquiry form.
-- ip_hash stores a hash (never the raw IP) for spam throttling.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inquiries (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(190) NOT NULL,
  subject    VARCHAR(150) NULL,
  message    TEXT         NOT NULL,
  user_id    INT UNSIGNED NULL,
  is_read    TINYINT(1)   NOT NULL DEFAULT 0,
  ip_hash    CHAR(64)     NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_inquiries_inbox (is_read, created_at),
  KEY idx_inquiries_ip (ip_hash, created_at),
  KEY idx_inquiries_user (user_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- users: accounts. The core project needs only ONE row: the Director's
-- admin account, created by a seed script (never by public sign-up).
-- 'client' exists for the optional client-accounts phase.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('admin','client') NOT NULL DEFAULT 'client',
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP    NULL DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS favorites (
  user_id     INT UNSIGNED NOT NULL,
  package_id  INT UNSIGNED NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, package_id),
  CONSTRAINT fk_favorites_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_favorites_package FOREIGN KEY (package_id)
    REFERENCES packages (id) ON DELETE CASCADE
) ENGINE=InnoDB;