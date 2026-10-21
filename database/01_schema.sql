-- =============================================================================
-- AURELIA FC — MySQL 8 database schema
-- =============================================================================
-- Creates the database, all tables, keys, indexes and constraints required by
-- the 16 screens in the Figma reference. Safe to re-run (drops + recreates).
--
-- Run:  mysql -u <user> -p < database/01_schema.sql
-- =============================================================================

DROP DATABASE IF EXISTS aurelia_fc;
CREATE DATABASE aurelia_fc
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE aurelia_fc;

-- -----------------------------------------------------------------------------
-- Users / authentication
-- -----------------------------------------------------------------------------
CREATE TABLE users (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  first_name      VARCHAR(80)  NOT NULL,
  last_name       VARCHAR(80)  NOT NULL,
  email           VARCHAR(190) NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  role            ENUM('Member','Admin') NOT NULL DEFAULT 'Member',
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE password_reset_tokens (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     INT UNSIGNED NOT NULL,
  token_hash  CHAR(64)     NOT NULL,
  expires_at  DATETIME     NOT NULL,
  used_at     DATETIME     NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_prt_token (token_hash),
  KEY ix_prt_user (user_id),
  CONSTRAINT fk_prt_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Squads / teams / players
-- -----------------------------------------------------------------------------
CREATE TABLE teams (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(120) NOT NULL,
  coach       VARCHAR(120) NOT NULL,
  player_count SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  description VARCHAR(255) NULL,
  image_path  VARCHAR(255) NULL,
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_teams_name (name)
) ENGINE=InnoDB;

CREATE TABLE positions (
  id    TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name  VARCHAR(40) NOT NULL,          -- Goalkeeper / Defender / Midfielder / Forward
  PRIMARY KEY (id),
  UNIQUE KEY uq_positions_name (name)
) ENGINE=InnoDB;

CREATE TABLE players (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  team_id        INT UNSIGNED NOT NULL,
  position_id    TINYINT UNSIGNED NOT NULL,
  squad_number   TINYINT UNSIGNED NOT NULL,
  first_name     VARCHAR(80)  NOT NULL,
  last_name      VARCHAR(80)  NOT NULL,
  nationality    CHAR(3)      NOT NULL,   -- ISO-3166 alpha-3 country code
  date_of_birth  DATE         NULL,
  height_cm      SMALLINT UNSIGNED NULL,
  bio            TEXT         NULL,
  image_path     VARCHAR(255) NULL,
  goals          SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  assists        SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  appearances    SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  avg_rating     DECIMAL(4,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (id),
  UNIQUE KEY uq_players_team_squad (team_id, squad_number),
  KEY ix_players_position (position_id),
  CONSTRAINT chk_players_rating CHECK (avg_rating >= 0 AND avg_rating <= 10),
  CONSTRAINT chk_players_nationality CHECK (CHAR_LENGTH(nationality) = 3),
  CONSTRAINT fk_players_team FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE,
  CONSTRAINT fk_players_position FOREIGN KEY (position_id) REFERENCES positions (id)
) ENGINE=InnoDB;

CREATE TABLE player_season_stats (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  player_id   INT UNSIGNED NOT NULL,
  season      VARCHAR(20)  NOT NULL,
  month_label VARCHAR(40)  NOT NULL,
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  apps        SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  goals       SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  assists     SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY ix_pss_player (player_id),
  CONSTRAINT fk_pss_player FOREIGN KEY (player_id) REFERENCES players (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE player_career_history (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  player_id   INT UNSIGNED NOT NULL,
  club_name   VARCHAR(120) NOT NULL,
  period      VARCHAR(40)  NOT NULL,
  appearances SMALLINT UNSIGNED NULL,
  goals       SMALLINT UNSIGNED NULL,
  note        VARCHAR(120) NULL,
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY ix_pch_player (player_id),
  CONSTRAINT fk_pch_player FOREIGN KEY (player_id) REFERENCES players (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Competitions / standings
-- -----------------------------------------------------------------------------
CREATE TABLE competitions (
  id        INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name      VARCHAR(120) NOT NULL,
  type      ENUM('League','Cup','Friendly') NOT NULL DEFAULT 'League',
  season    VARCHAR(20)  NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_competitions (name, season)
) ENGINE=InnoDB;

CREATE TABLE league_standings (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  competition_id INT UNSIGNED NOT NULL,
  position       TINYINT UNSIGNED NOT NULL,
  club_name      VARCHAR(120) NOT NULL,
  played         TINYINT UNSIGNED NOT NULL DEFAULT 0,
  won            TINYINT UNSIGNED NOT NULL DEFAULT 0,
  drawn          TINYINT UNSIGNED NOT NULL DEFAULT 0,
  lost           TINYINT UNSIGNED NOT NULL DEFAULT 0,
  goals_for      SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  goals_against  SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_standings_pos (competition_id, position),
  CONSTRAINT fk_standings_competition FOREIGN KEY (competition_id)
    REFERENCES competitions (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Matches
-- -----------------------------------------------------------------------------
CREATE TABLE matches (
  id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
  competition_id    INT UNSIGNED NOT NULL,
  home_team         VARCHAR(120) NOT NULL,
  away_team         VARCHAR(120) NOT NULL,
  kickoff_at        DATETIME     NOT NULL,
  venue             VARCHAR(120) NOT NULL,
  is_home           TINYINT(1)   NOT NULL DEFAULT 0,
  status            ENUM('Scheduled','Completed','Cancelled') NOT NULL DEFAULT 'Scheduled',
  home_score        TINYINT UNSIGNED NULL,
  away_score        TINYINT UNSIGNED NULL,
  attendance        INT UNSIGNED NULL,
  match_report      VARCHAR(255) NULL,
  PRIMARY KEY (id),
  KEY ix_matches_kickoff (kickoff_at),
  KEY ix_matches_status (status),
  CONSTRAINT fk_matches_competition FOREIGN KEY (competition_id)
    REFERENCES competitions (id)
) ENGINE=InnoDB;

CREATE TABLE match_events (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  match_id   INT UNSIGNED NOT NULL,
  minute     TINYINT UNSIGNED NOT NULL,
  team_side  ENUM('Home','Away') NOT NULL,
  player_name VARCHAR(120) NOT NULL,
  event_type VARCHAR(60)  NOT NULL,   -- Goal (Assisted by X) / Goal (Header) ...
  sort_order SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY ix_events_match (match_id),
  CONSTRAINT fk_events_match FOREIGN KEY (match_id) REFERENCES matches (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE match_stats (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  match_id     INT UNSIGNED NOT NULL,
  stat_label   VARCHAR(60) NOT NULL,
  home_value   VARCHAR(10) NOT NULL,
  away_value   VARCHAR(10) NOT NULL,
  sort_order   SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_match_stat (match_id, stat_label),
  CONSTRAINT fk_stats_match FOREIGN KEY (match_id) REFERENCES matches (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE match_lineups (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  match_id    INT UNSIGNED NOT NULL,
  side        ENUM('Home','Away') NOT NULL,
  formation   VARCHAR(12) NOT NULL,
  squad_no    VARCHAR(4)  NOT NULL,
  player_name VARCHAR(120) NOT NULL,
  role_code   VARCHAR(4)  NOT NULL,   -- GK / CB / LB / RB / DM / CM / LW / RW / CF
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY ix_lineups_match (match_id, side),
  CONSTRAINT fk_lineups_match FOREIGN KEY (match_id) REFERENCES matches (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- News
-- -----------------------------------------------------------------------------
CREATE TABLE news_articles (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug          VARCHAR(180) NOT NULL,
  category      VARCHAR(60)  NOT NULL,   -- Match Report / Transfer / Club News ...
  title         VARCHAR(220) NOT NULL,
  excerpt       VARCHAR(500) NOT NULL,
  body          LONGTEXT     NOT NULL,
  author_name   VARCHAR(120) NULL,
  pull_quote    VARCHAR(500) NULL,
  pull_quote_by VARCHAR(120) NULL,
  image_path    VARCHAR(255) NULL,
  published_at  DATETIME     NOT NULL,
  is_featured   TINYINT(1)   NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_news_slug (slug),
  KEY ix_news_published (published_at)
) ENGINE=InnoDB;

CREATE TABLE news_tags (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  article_id INT UNSIGNED NOT NULL,
  tag        VARCHAR(60) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_news_tag (article_id, tag),
  CONSTRAINT fk_news_tags_article FOREIGN KEY (article_id)
    REFERENCES news_articles (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Gallery
-- -----------------------------------------------------------------------------
CREATE TABLE gallery_images (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category    ENUM('Match Day','Training','Events','Stadium') NOT NULL,
  caption     VARCHAR(180) NOT NULL,
  image_path  VARCHAR(255) NOT NULL,
  width_px    SMALLINT UNSIGNED NOT NULL,
  height_px   SMALLINT UNSIGNED NOT NULL,
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY ix_gallery_category (category)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Shop
-- -----------------------------------------------------------------------------
CREATE TABLE product_categories (
  id   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(60) NOT NULL,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_product_categories (name)
) ENGINE=InnoDB;

CREATE TABLE products (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_id  INT UNSIGNED NOT NULL,
  name         VARCHAR(160) NOT NULL,
  price        DECIMAL(8,2) NOT NULL,
  image_path   VARCHAR(255) NULL,
  badge        VARCHAR(40)  NULL,      -- NEW ARRIVAL etc.
  is_featured  TINYINT(1)   NOT NULL DEFAULT 0,
  description  VARCHAR(255) NULL,
  sort_order   SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY ix_products_category (category_id),
  CONSTRAINT chk_products_price CHECK (price >= 0),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id)
    REFERENCES product_categories (id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Tickets / hospitality
-- -----------------------------------------------------------------------------
CREATE TABLE ticket_fixtures (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  match_id       INT UNSIGNED NOT NULL,
  price_min      DECIMAL(8,2) NOT NULL,
  price_max      DECIMAL(8,2) NOT NULL,
  available_seats SMALLINT UNSIGNED NOT NULL,
  status_label   VARCHAR(60) NOT NULL,   -- Selling Fast / Available
  PRIMARY KEY (id),
  UNIQUE KEY uq_ticket_fixture (match_id),
  CONSTRAINT chk_ticket_price CHECK (price_max >= price_min),
  CONSTRAINT fk_ticket_fixture_match FOREIGN KEY (match_id)
    REFERENCES matches (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE season_ticket_tiers (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(60)  NOT NULL,
  price       DECIMAL(8,2) NOT NULL,
  description VARCHAR(255) NOT NULL,
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_season_tier (name)
) ENGINE=InnoDB;

CREATE TABLE season_ticket_features (
  id      INT UNSIGNED NOT NULL AUTO_INCREMENT,
  tier_id INT UNSIGNED NOT NULL,
  feature VARCHAR(160) NOT NULL,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY ix_stf_tier (tier_id),
  CONSTRAINT fk_stf_tier FOREIGN KEY (tier_id)
    REFERENCES season_ticket_tiers (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE hospitality_packages (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(120) NOT NULL,
  price       DECIMAL(10,2) NOT NULL,
  price_unit  VARCHAR(20)  NOT NULL DEFAULT '/ match',
  description VARCHAR(400) NOT NULL,
  image_path  VARCHAR(255) NULL,
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Contact / FAQ
-- -----------------------------------------------------------------------------
CREATE TABLE contact_departments (
  id       INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name     VARCHAR(80)  NOT NULL,
  email    VARCHAR(190) NOT NULL,
  phone    VARCHAR(60)  NULL,
  note     VARCHAR(255) NULL,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE contact_messages (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name  VARCHAR(160) NOT NULL,
  email      VARCHAR(190) NOT NULL,
  subject    VARCHAR(120) NOT NULL,
  message    TEXT         NOT NULL,
  user_id    INT UNSIGNED NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_handled TINYINT(1)   NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY ix_contact_created (created_at),
  CONSTRAINT fk_contact_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE faqs (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  question   VARCHAR(255) NOT NULL,
  answer     VARCHAR(600) NOT NULL,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Commerce (orders created from the shop / ticket pages)
-- -----------------------------------------------------------------------------
CREATE TABLE orders (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id      INT UNSIGNED NULL,
  reference    CHAR(12)     NOT NULL,
  order_type   ENUM('Shop','Tickets','SeasonTicket','Hospitality') NOT NULL,
  status       ENUM('Pending','Paid','Cancelled') NOT NULL DEFAULT 'Pending',
  total_amount DECIMAL(10,2) NOT NULL,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_orders_reference (reference),
  KEY ix_orders_user (user_id),
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE order_items (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id     INT UNSIGNED NOT NULL,
  item_type    ENUM('Product','MatchTicket','SeasonTicket','Hospitality') NOT NULL,
  item_ref_id  INT UNSIGNED NULL,
  description  VARCHAR(180) NOT NULL,
  quantity     SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  unit_price   DECIMAL(8,2) NOT NULL,
  PRIMARY KEY (id),
  KEY ix_order_items_order (order_id),
  CONSTRAINT chk_order_qty CHECK (quantity > 0),
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id)
    REFERENCES orders (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Club info (about page + footer + partners)
-- -----------------------------------------------------------------------------
CREATE TABLE club_info (
  id            TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  club_name     VARCHAR(120) NOT NULL,
  motto         VARCHAR(120) NOT NULL,
  founded_year  SMALLINT UNSIGNED NOT NULL,
  description   VARCHAR(600) NOT NULL,
  stadium_name  VARCHAR(120) NOT NULL,
  capacity      INT UNSIGNED NOT NULL,
  built_year    SMALLINT UNSIGNED NOT NULL,
  record_attendance INT UNSIGNED NOT NULL,
  address       VARCHAR(180) NOT NULL,
  phone         VARCHAR(60)  NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE club_milestones (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  year_label VARCHAR(20)  NOT NULL,
  title      VARCHAR(120) NOT NULL,
  body       VARCHAR(300) NOT NULL,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE club_values (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title      VARCHAR(80)  NOT NULL,
  body       VARCHAR(300) NOT NULL,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE club_honours (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title       VARCHAR(120) NOT NULL,
  years       VARCHAR(200) NOT NULL,
  count_label VARCHAR(40)  NOT NULL,   -- "4 Trophies"
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE club_executives (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name  VARCHAR(120) NOT NULL,
  role_title VARCHAR(120) NOT NULL,
  image_path VARCHAR(255) NULL,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE partners (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name       VARCHAR(120) NOT NULL,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_partners_name (name)
) ENGINE=InnoDB;

CREATE TABLE quick_links (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  label      VARCHAR(120) NOT NULL,
  href       VARCHAR(180) NOT NULL,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
) ENGINE=InnoDB;
