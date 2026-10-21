-- =============================================================================
-- AURELIA FC — seed data
-- -----------------------------------------------------------------------------
-- TEST/SEED DATA ONLY. Content mirrors the copy shown in the Figma reference
-- screens so the application renders identically to the design.
-- Run after database/01_schema.sql:
--   mysql -u <user> -p aurelia_fc < database/02_seed.sql
-- =============================================================================
USE aurelia_fc;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE password_reset_tokens;
TRUNCATE TABLE contact_messages;
TRUNCATE TABLE faqs;
TRUNCATE TABLE contact_departments;
TRUNCATE TABLE hospitality_packages;
TRUNCATE TABLE season_ticket_features;
TRUNCATE TABLE season_ticket_tiers;
TRUNCATE TABLE ticket_fixtures;
TRUNCATE TABLE products;
TRUNCATE TABLE product_categories;
TRUNCATE TABLE gallery_images;
TRUNCATE TABLE news_tags;
TRUNCATE TABLE news_articles;
TRUNCATE TABLE match_lineups;
TRUNCATE TABLE match_stats;
TRUNCATE TABLE match_events;
TRUNCATE TABLE matches;
TRUNCATE TABLE league_standings;
TRUNCATE TABLE competitions;
TRUNCATE TABLE player_career_history;
TRUNCATE TABLE player_season_stats;
TRUNCATE TABLE players;
TRUNCATE TABLE positions;
TRUNCATE TABLE teams;
TRUNCATE TABLE users;
TRUNCATE TABLE quick_links;
TRUNCATE TABLE partners;
TRUNCATE TABLE club_executives;
TRUNCATE TABLE club_honours;
TRUNCATE TABLE club_values;
TRUNCATE TABLE club_milestones;
TRUNCATE TABLE club_info;
SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- Club info, milestones, values, honours, executives, partners, links
-- -----------------------------------------------------------------------------
INSERT INTO club_info
  (club_name, motto, founded_year, description, stadium_name, capacity, built_year,
   record_attendance, address, phone)
VALUES
  ('Aurelia FC', 'Rise. Unite. Conquer.', 1987,
   'Aurelia Football Club is a professional football club based in Aurelia. Founded in 1987, the club competes in the premier tier of sports excellence.',
   'Aurelia Arena', 45000, 2003, 45210, '100 Royal Way, Aurelia', '+44 (0) 20 8123 4567');

INSERT INTO club_milestones (year_label, title, body, sort_order) VALUES
  ('1987', 'Club Founded', 'Originally established by community leaders under the motto Rise. Unite. Conquer.', 1),
  ('1994', 'First Trophy', 'Aurelia FC secures the National Cup, beginning a long journey of major honors.', 2),
  ('2003', 'Arena Completed', 'Inauguration of the state-of-the-art Aurelia Arena with a massive 45,000 capacity.', 3),
  ('2015-2020', 'The Golden Era', 'Five consecutive league titles and three continental finals cemented legacy.', 4);

INSERT INTO club_values (title, body, sort_order) VALUES
  ('Excellence', 'We strive to reach the pinnacle of performance in coaching, playstyle, and operational efficiency.', 1),
  ('Unity', 'A family on and off the pitch. Fans, players, and staff rise together in perfect alignment.', 2),
  ('Community', 'Supporting local foundations, youth academies, and empowering Aurelia''s neighborhood programs.', 3);

INSERT INTO club_honours (title, years, count_label, sort_order) VALUES
  ('Premier Division Champions', '2015, 2017, 2018, 2020', '4 Trophies', 1),
  ('National Cup Winners', '1994, 2001, 2005, 2012, 2019, 2024', '6 Cups', 2),
  ('Super Cup Champions', '2016, 2019', '2 Trophies', 3);

INSERT INTO club_executives (full_name, role_title, image_path, sort_order) VALUES
  ('Sir Arthur Sterling', 'Club President', 'assets/images/executive-arthur.jpg', 1),
  ('Adrianna Vance', 'Head Coach', 'assets/images/executive-adrianna.jpg', 2);

INSERT INTO partners (name, sort_order) VALUES
  ('AURELIA AIRWAYS', 1), ('AMBER TRUST', 2), ('ROYAL SPORTS', 3),
  ('SPRING WATER', 4), ('STADIUM GROUP', 5);

INSERT INTO quick_links (label, href, sort_order) VALUES
  ('Latest Tickets', '/tickets', 1),
  ('Club Membership', '/signup', 2),
  ('Hospitality Suites', '/tickets#hospitality', 3),
  ('Online Shop', '/shop', 4);

-- -----------------------------------------------------------------------------
-- Teams & players
-- -----------------------------------------------------------------------------
INSERT INTO teams (name, coach, player_count, description, image_path, sort_order) VALUES
  ('First Team', 'Adrianna Vance', 25, 'The senior squad competing in the Premier Division.', 'assets/images/team-first.jpg', 1),
  ('Reserve Team', 'David Sterling', 22, 'Development squad feeding the first team.', 'assets/images/team-reserve.jpg', 2),
  ('U-21 Academy', 'Marcus Thorne', 20, 'Elite pathway for emerging professional talent.', 'assets/images/team-u21.jpg', 3),
  ('U-18 Academy', 'Leon Croft', 18, 'Foundation age group focused on technical mastery.', 'assets/images/team-u18.jpg', 4),
  ('Women''s First Team', 'Sarah Jenkins', 23, 'Senior women''s squad in the national top flight.', 'assets/images/team-women-first.jpg', 5),
  ('Women''s Reserve', 'Elena Rostov', 19, 'Women''s development and reserve squad.', 'assets/images/team-women-reserve.jpg', 6);

INSERT INTO positions (name) VALUES ('Goalkeeper'), ('Defender'), ('Midfielder'), ('Forward');

-- First Team (team_id = 1) — matches the Squad and Player Profile screens
INSERT INTO players
  (team_id, position_id, squad_number, first_name, last_name, nationality, date_of_birth,
   height_cm, bio, image_path, goals, assists, appearances, avg_rating)
VALUES
  (1, 1, 1, 'Thomas', 'Reign', 'GBR', '1996-03-14', 191,
   'Commanding shot-stopper with outstanding distribution and a calm presence under pressure.',
   'assets/images/squad-thomas-reign.jpg', 0, 0, 34, 7.60),
  (1, 2, 4, 'David', 'Okafor', 'NGA', '1998-07-22', 188,
   'The international centre-back locks down his position at the club, extending his tenure through the 2030 season.',
   'assets/images/squad-david-okafor.jpg', 3, 2, 33, 7.80),
  (1, 2, 5, 'Lena', 'Hartwell', 'USA', '1999-11-02', 180,
   'Aggressive slide-tackling defender who reads the game and starts attacks from the back.',
   'assets/images/squad-lena-hartwell.jpg', 2, 4, 31, 7.70),
  (1, 3, 7, 'Elena', 'Cross', 'ESP', '1997-05-30', 172,
   'Creative midfielder with a lethal direct free kick and an exceptional eye for a line-breaking pass.',
   'assets/images/squad-elena-cross.jpg', 9, 12, 36, 8.10),
  (1, 3, 8, 'James', 'Kato', 'JPN', '2000-01-18', 176,
   'Tireless engine in midfield, covers every blade of grass and links defence to attack.',
   'assets/images/squad-james-kato.jpg', 5, 8, 32, 7.50),
  (1, 4, 9, 'Marcus', 'Vane', 'ENG', '1999-08-09', 183,
   'An exceptional athlete with blistering speed and outstanding predatory instincts in the final third. Vane joined Aurelia FC and quickly cemented himself as a core tactical anchor.',
   'assets/images/squad-marcus-vane.jpg', 28, 12, 38, 4.20),
  (1, 4, 10, 'Sofia', 'Almeida', 'BRA', '2001-04-27', 170,
   'Technically gifted forward capable of unlocking any defence with a moment of brilliance.',
   'assets/images/squad-sofia-almeida.jpg', 14, 7, 30, 7.90),
  (1, 4, 11, 'Riku', 'Tanaka', 'JPN', '2002-09-15', 175,
   'Rapid winger who thrives on the counter and delivers pinpoint crosses.',
   'assets/images/squad-riku-tanaka.jpg', 11, 10, 29, 7.65);

-- Remaining squads (names generated to populate every team card)
INSERT INTO players (team_id, position_id, squad_number, first_name, last_name, nationality, image_path, goals, assists, appearances, avg_rating) VALUES
  (2, 1, 1, 'Peter', 'Hale', 'GBR', NULL, 0, 0, 18, 7.10),
  (2, 2, 4, 'Owen', 'Marsh', 'GBR', NULL, 1, 1, 20, 7.00),
  (2, 3, 8, 'Kofi', 'Boateng', 'GHA', NULL, 4, 5, 21, 7.30),
  (2, 4, 9, 'Luca', 'Moretti', 'ITA', NULL, 12, 4, 22, 7.55),
  (3, 2, 5, 'Ivan', 'Petrov', 'BUL', NULL, 1, 2, 16, 6.95),
  (3, 3, 10, 'Noah', 'Berg', 'SWE', NULL, 7, 6, 19, 7.40),
  (3, 4, 11, 'Diego', 'Santos', 'POR', NULL, 9, 3, 18, 7.35),
  (4, 1, 1, 'Sam', 'Whitlock', 'GBR', NULL, 0, 0, 14, 6.90),
  (4, 2, 3, 'Tariq', 'Rahman', 'PAK', NULL, 1, 1, 15, 6.85),
  (4, 3, 8, 'Felix', 'Nolan', 'IRL', NULL, 5, 4, 16, 7.20),
  (4, 4, 9, 'Andre', 'Costa', 'BRA', NULL, 8, 2, 15, 7.25),
  (5, 1, 1, 'Grace', 'Bell', 'GBR', NULL, 0, 0, 22, 7.45),
  (5, 2, 6, 'Nadia', 'Farah', 'MAR', NULL, 2, 3, 23, 7.55),
  (5, 3, 8, 'Emily', 'Shaw', 'GBR', NULL, 6, 9, 23, 7.70),
  (5, 4, 9, 'Amara', 'Diallo', 'SEN', NULL, 18, 6, 23, 8.05),
  (6, 2, 5, 'Zoe', 'Kirby', 'GBR', NULL, 1, 2, 17, 7.05),
  (6, 3, 7, 'Mia', 'Larsen', 'DEN', NULL, 5, 5, 19, 7.30),
  (6, 4, 11, 'Chiara', 'Rossi', 'ITA', NULL, 10, 4, 19, 7.40);

-- Marcus Vane profile detail
INSERT INTO player_season_stats (player_id, season, month_label, sort_order, apps, goals, assists) VALUES
  (6, '2026/2027', 'September 2026', 1, 2, 3, 1),
  (6, '2026/2027', 'August 2026', 2, 4, 4, 2),
  (6, '2026/2027', 'May 2026', 3, 5, 5, 3),
  (6, '2026/2027', 'April 2026', 4, 6, 8, 2);

INSERT INTO player_career_history (player_id, club_name, period, appearances, goals, note, sort_order) VALUES
  (6, 'Aurelia FC', '2023 - Present', 74, 48, NULL, 1),
  (6, 'Ironclad United', '2020 - 2023', 92, 35, NULL, 2),
  (6, 'Crestwood Youth', '2018 - 2020', NULL, NULL, 'Graduate Academy', 3);

-- -----------------------------------------------------------------------------
-- Competitions, standings, matches
-- -----------------------------------------------------------------------------
INSERT INTO competitions (name, type, season) VALUES
  ('Premier Division', 'League', '2026/2027'),
  ('National Cup', 'Cup', '2026/2027');

INSERT INTO league_standings
  (competition_id, position, club_name, played, won, drawn, lost, goals_for, goals_against) VALUES
  (1, 1, 'Stormgate FC',        16, 12, 2, 2, 34, 12),
  (1, 2, 'Aurelia FC',          16, 11, 2, 3, 31, 15),
  (1, 3, 'Northvale City',      16, 10, 3, 3, 28, 14),
  (1, 4, 'Crestwood Athletic',  16,  9, 3, 4, 25, 18),
  (1, 5, 'Ironclad United',     16,  8, 4, 4, 24, 20),
  (1, 6, 'Thornfield Rangers',  16,  7, 5, 4, 21, 19),
  (1, 7, 'Meridian Town',       16,  7, 3, 6, 19, 18),
  (1, 8, 'Ashford Vale',        16,  6, 4, 6, 18, 22),
  (1, 9, 'Blackmoor FC',        16,  5, 4, 7, 15, 23),
  (1, 10, 'Silverpeak United',  16,  4, 5, 7, 14, 26),
  (1, 11, 'Dunhaven City',      16,  3, 5, 8, 11, 29),
  (1, 12, 'Redcliffe Borough',  16,  2, 5, 9,  8, 32);

-- Completed match shown on the Match Detail screen
INSERT INTO matches
  (competition_id, home_team, away_team, kickoff_at, venue, is_home, status,
   home_score, away_score, attendance, match_report)
VALUES
  (1, 'Aurelia FC', 'Northvale City', '2026-09-07 19:45:00', 'Aurelia Arena', 1, 'Completed',
   3, 1, 44812, 'Marcus Vane Secures Crucial Hat Trick in Derby Victory');

SET @completed_match := LAST_INSERT_ID();

INSERT INTO match_events (match_id, minute, team_side, player_name, event_type, sort_order) VALUES
  (@completed_match, 23, 'Home', 'Marcus Vane',  'Goal (Assisted by Elena Cross)', 1),
  (@completed_match, 51, 'Home', 'Elena Cross',  'Goal (Direct Free Kick)',        2),
  (@completed_match, 65, 'Away', 'Torres',       'Goal (Header)',                  3),
  (@completed_match, 78, 'Home', 'Almeida',      'Goal (Corner Kick)',             4);

INSERT INTO match_stats (match_id, stat_label, home_value, away_value, sort_order) VALUES
  (@completed_match, 'Possession',       '58%', '42%', 1),
  (@completed_match, 'Shots',            '14',  '8',   2),
  (@completed_match, 'Shots on Target',  '7',   '3',   3),
  (@completed_match, 'Corners',          '6',   '4',   4),
  (@completed_match, 'Fouls',            '11',  '13',  5),
  (@completed_match, 'Yellow Cards',     '2',   '3',   6);

INSERT INTO match_lineups (match_id, side, formation, squad_no, player_name, role_code, sort_order) VALUES
  (@completed_match, 'Home', '4-3-3', '#1', 'T. Harrison',  'GK', 1),
  (@completed_match, 'Home', '4-3-3', '#4', 'D. Okafor',    'CB', 2),
  (@completed_match, 'Home', '4-3-3', '#5', 'A. Sterling',  'CB', 3),
  (@completed_match, 'Home', '4-3-3', '#3', 'R. Kael',      'LB', 4),
  (@completed_match, 'Home', '4-3-3', '#2', 'J. Mercer',    'RB', 5),
  (@completed_match, 'Home', '4-3-3', '#6', 'K. Vance',     'DM', 6),
  (@completed_match, 'Home', '4-3-3', '#7', 'Elena Cross',  'CM', 7),
  (@completed_match, 'Home', '4-3-3', '#8', 'L. Almeida',   'CM', 8),
  (@completed_match, 'Home', '4-3-3', '#11','S. Russo',     'LW', 9),
  (@completed_match, 'Home', '4-3-3', '#10','C. Sterling',  'RW', 10),
  (@completed_match, 'Home', '4-3-3', '#9', 'Marcus Vane',  'CF', 11),
  (@completed_match, 'Away', '4-4-2', '#1', 'M. Slayter',   'GK', 1),
  (@completed_match, 'Away', '4-4-2', '#3', 'G. Thorne',    'CB', 2),
  (@completed_match, 'Away', '4-4-2', '#4', 'H. Bishop',    'CB', 3),
  (@completed_match, 'Away', '4-4-2', '#2', 'E. Vance',     'LB', 4),
  (@completed_match, 'Away', '4-4-2', '#5', 'O. Crest',     'RB', 5),
  (@completed_match, 'Away', '4-4-2', '#8', 'R. Torres',    'CM', 6),
  (@completed_match, 'Away', '4-4-2', '#6', 'S. Finch',     'CM', 7),
  (@completed_match, 'Away', '4-4-2', '#7', 'T. Novak',     'LM', 8),
  (@completed_match, 'Away', '4-4-2', '#11','P. Mercer',    'RM', 9),
  (@completed_match, 'Away', '4-4-2', '#9', 'A. Torres',    'CF', 10),
  (@completed_match, 'Away', '4-4-2', '#10','J. Sterling',  'CF', 11);

-- Fixtures on the Matches & Fixtures screen
INSERT INTO matches
  (competition_id, home_team, away_team, kickoff_at, venue, is_home, status)
VALUES
  (1, 'Aurelia FC', 'Ironclad United',    '2026-09-12 19:45:00', 'Aurelia Arena',     1, 'Scheduled'),
  (2, 'Aurelia FC', 'Thornfield Rangers', '2026-09-19 19:45:00', 'Thornfield Stadium',0, 'Scheduled'),
  (1, 'Aurelia FC', 'Crestwood Athletic', '2026-09-26 19:45:00', 'Aurelia Arena',     1, 'Scheduled'),
  (1, 'Aurelia FC', 'Stormgate FC',       '2026-10-03 19:45:00', 'Aurelia Arena',     1, 'Scheduled');

-- Home-page recent results (completed)
INSERT INTO matches
  (competition_id, home_team, away_team, kickoff_at, venue, is_home, status,
   home_score, away_score, attendance)
VALUES
  (1, 'Aurelia FC',    'Northvale City', '2026-09-02 19:45:00', 'Aurelia Arena', 1, 'Completed', 3, 1, 44120),
  (2, 'Stormgate FC',  'Aurelia FC',     '2026-08-28 19:45:00', 'Stormgate Park',0, 'Completed', 0, 2, 38210),
  (1, 'Aurelia FC',    'Crestwood Athletic','2026-08-22 19:45:00','Aurelia Arena',1, 'Completed', 1, 1, 43980);

-- -----------------------------------------------------------------------------
-- Ticket fixtures & hospitality
-- -----------------------------------------------------------------------------
INSERT INTO ticket_fixtures (match_id, price_min, price_max, available_seats, status_label)
SELECT id, 35.00, 85.00, 12, 'Selling Fast' FROM matches WHERE home_team='Aurelia FC' AND away_team='Ironclad United' AND status='Scheduled';
INSERT INTO ticket_fixtures (match_id, price_min, price_max, available_seats, status_label)
SELECT id, 40.00, 95.00, 24, 'Selling Fast' FROM matches WHERE away_team='Stormgate FC' AND status='Scheduled';
INSERT INTO ticket_fixtures (match_id, price_min, price_max, available_seats, status_label)
SELECT id, 25.00, 65.00, 32, 'Available'    FROM matches WHERE away_team='Thornfield Rangers' AND status='Scheduled';
INSERT INTO ticket_fixtures (match_id, price_min, price_max, available_seats, status_label)
SELECT id, 30.00, 75.00, 18, 'Selling Fast' FROM matches WHERE away_team='Crestwood Athletic' AND status='Scheduled';

INSERT INTO season_ticket_tiers (name, price, description, sort_order) VALUES
  ('Standard', 450.00, 'Secure entry to all 19 Premier Division home fixtures.', 1),
  ('Premium',  750.00, 'Exquisite midfield seating and complimentary match programs.', 2),
  ('VIP',     1200.00, 'Ultimate experience with stadium lounge access and VIP parking.', 3);

INSERT INTO season_ticket_features (tier_id, feature, sort_order) VALUES
  (1, 'All Home League fixtures', 1),
  (1, '10% online store discount', 2),
  (1, 'Priority booking for Cup matches', 3),
  (2, 'Best midfield tier seats', 1),
  (2, 'Complimentary Match Program', 2),
  (2, 'Access to exclusive members lounge', 3),
  (2, '15% store discount', 4),
  (3, 'Luxury padded VIP seats', 1),
  (3, 'Complimentary dining & drinks', 2),
  (3, 'Pre-match team insights', 3),
  (3, 'VIP stadium parking spot', 4);

INSERT INTO hospitality_packages (name, price, price_unit, description, image_path, sort_order) VALUES
  ('The Royal Lounge', 150.00, '/ match',
   'Indulge in pre-match buffets, live musical entertainment, and padded executive balcony seating.',
   'assets/images/hospitality-royal-lounge.jpg', 1),
  ('Aurelia Executive Box', 2500.00, '/ match',
   'Private suite for up to 10 guests. Personal host, gourmet culinary experience and supreme royal comfort.',
   'assets/images/hospitality-executive-box.jpg', 2);

-- -----------------------------------------------------------------------------
-- Shop
-- -----------------------------------------------------------------------------
INSERT INTO product_categories (name, sort_order) VALUES
  ('Kits', 1), ('Training', 2), ('Accessories', 3), ('Lifestyle', 4);

INSERT INTO products (category_id, name, price, image_path, badge, is_featured, description, sort_order) VALUES
  (1, 'Home Kit 2026/27',   89.99, 'assets/images/product-home-kit.jpg', 'NEW ARRIVAL', 1,
      'Authentic design crafted for performance. Features royal gold detailing on historic midnight navy.', 1),
  (1, 'Away Kit 2026/27',   89.99, 'assets/images/product-away-kit.jpg', NULL, 0, 'Lightweight away kit built for speed.', 2),
  (1, 'Third Kit 2026/27',  79.99, 'assets/images/product-third-kit.jpg', NULL, 0, 'Bold third kit for European nights.', 3),
  (2, 'Training Jersey',    49.99, 'assets/images/product-training-jersey.jpg', NULL, 0, 'Breathable training jersey worn by the first team.', 4),
  (2, 'Track Jacket',       64.99, 'assets/images/product-track-jacket.jpg', NULL, 0, 'Full-zip track jacket with club crest.', 5),
  (3, 'Scarf',              19.99, 'assets/images/product-scarf.jpg', NULL, 0, 'Woven royal scarf in club colours.', 6),
  (3, 'Cap',                24.99, 'assets/images/product-cap.jpg', NULL, 0, 'Adjustable cap with embroidered crest.', 7),
  (3, 'Football',           29.99, 'assets/images/product-football.jpg', NULL, 0, 'Official match ball replica.', 8);

-- -----------------------------------------------------------------------------
-- News
-- -----------------------------------------------------------------------------
INSERT INTO news_articles
  (slug, category, title, excerpt, body, author_name, pull_quote, pull_quote_by,
   image_path, published_at, is_featured)
VALUES
  ('aurelia-fc-royal-sports-partnership', 'CLUB NEWS',
   'Aurelia FC signs exciting new partnership with Royal Sports',
   'The Royals announce a long term sponsorship agreement that secures future training development funding, state-of-the-art player analytics equipment, and expanded grassroots academies.',
   'The Royals are delighted to confirm a landmark partnership with Royal Sports. The agreement secures future training development funding, state-of-the-art player analytics equipment and expanded grassroots academies across the region. Club President Sir Arthur Sterling described the deal as a defining moment for the next decade of Aurelia FC.',
   'Sarah Mitchell', NULL, NULL, 'assets/images/news-featured-partnership.jpg', '2026-09-05 10:00:00', 1),

  ('vane-hat-trick-derby-victory', 'MATCH REPORT',
   'Marcus Vane secures crucial hat-trick in derby victory',
   'A thrilling game at Aurelia Arena ended with a 3-1 triumph as Vane dominates the second half with classic finishes.',
   'In what will be remembered as one of the most electric derby matchdays of the decade, Aurelia FC dominated the turf at Aurelia Arena this Saturday. The primary protagonist was none other than striker Marcus Vane, who put on a clinical finishing masterclass to secure all three points for the Royals. From the opening whistle, Head Coach Adrianna Vance deployed an aggressive high-press setup, seeking to rattle Northvale City''s deep backline. Vane found the opener in the 23rd minute after a brilliant line-breaking pass from midfielder Elena Cross, lifting the roaring crowd of 45,000 to their feet. Northvale found a brief glimmer of hope when Torres converted a well-timed header in the 65th minute. However, Aurelia''s superior tactical conditioning eventually proved too much. Elena Cross converted a direct free kick just ten minutes later to seal the dominance before Almeida''s late corner completed the final 3-1 scoreline.',
   'Sarah Mitchell',
   'We played as one collective family today. The crowd''s roar in the second half was the extra push we needed to finish them off.',
   'MARCUS VANE, CF', 'assets/images/article-vane-derby-hero.jpg', '2026-09-07 09:00:00', 0),

  ('youth-prodigy-five-year-deal', 'TRANSFER',
   'Aurelia FC signs exciting youth prodigy on long term deal',
   'The 19-year-old playmaker commits to a 5-year developmental pathway with the club with big high-tier potential.',
   'The 19-year-old playmaker commits to a 5-year developmental pathway with the club. Scouts have tracked his progress for three seasons and the coaching staff believe he can graduate into the first team squad within eighteen months.',
   'Daniel Ross', NULL, NULL, 'assets/images/news-young-prodigy.jpg', '2026-09-04 14:00:00', 0),

  ('arena-next-gen-dome-roof', 'CLUB NEWS',
   'Aurelia Arena upgrades with next-generation dome roof',
   'Continuing our carbon neutral initiative, Aurelia Arena stadium will host zero emission matches starting next spring.',
   'Continuing our carbon neutral initiative, Aurelia Arena will host zero emission matches starting next spring. The new dome roof incorporates photovoltaic cladding and rainwater harvesting, cutting matchday energy consumption by 40%.',
   'Priya Nair', NULL, NULL, 'assets/images/news-stadium-roof.jpg', '2026-08-30 11:00:00', 0),

  ('okafor-contract-extension-2030', 'TRANSFER',
   'Defensive powerhouse David Okafor pens contract extension',
   'The international CB locks down his position at the club, extending his tenure through the 2030 season.',
   'The international centre-back locks down his position at the club, extending his tenure through the 2030 season. Okafor has been a cornerstone of the defence since arriving at Aurelia.',
   'Daniel Ross', NULL, NULL, 'assets/images/news-okafor.jpg', '2026-08-18 09:30:00', 0),

  ('u18-national-cup-final', 'YOUTH ACADEMY',
   'Under-18 squad secures historic national cup final',
   'Our development prospects defeated Stormgate Academy 4-0 to reach the pinnacle cup final this autumn.',
   'Our development prospects defeated Stormgate Academy 4-0 to reach the pinnacle cup final this autumn. The academy coaching staff praised the group''s maturity and tactical discipline.',
   'Leon Croft', NULL, NULL, 'assets/images/news-u18-cup.jpg', '2026-08-24 16:00:00', 0),

  ('summer-tour-north-america', 'CLUB NEWS',
   'Announcing international summer tour dates cities',
   'The club embarks on a historic pre-season friendlies series across North America starting mid-July next season.',
   'The club embarks on a historic pre-season friendlies series across North America starting mid-July next season, with fixtures planned in three major cities.',
   'Priya Nair', NULL, NULL, 'assets/images/news-summer-tour.jpg', '2026-08-15 12:00:00', 0);

INSERT INTO news_tags (article_id, tag) VALUES
  (2, '#Derby'), (2, '#Vane Hat Trick'), (2, '#Aurelia Arena'), (2, '#Matchday');

-- -----------------------------------------------------------------------------
-- Gallery
-- -----------------------------------------------------------------------------
INSERT INTO gallery_images (category, caption, image_path, width_px, height_px, sort_order) VALUES
  ('Match Day', 'Vane secures the game-winning goal',      'assets/images/gallery-vane-winning-goal.jpg', 420, 280, 1),
  ('Training',  'Manager Vance dynamic pitch strategy',    'assets/images/gallery-vance-tactics.jpg',     420, 280, 2),
  ('Match Day', 'Aggressive slide tackle stops counter',   'assets/images/gallery-slide-tackle.jpg',      420, 280, 3),
  ('Stadium',   'Aurelia Arena pitch perfect grass',       'assets/images/gallery-pitch-grass.jpg',       400, 292, 4),
  ('Training',  'Team training conditioning drills',       'assets/images/gallery-training-drills.jpg',   856, 375, 5),
  ('Events',    'Passionate Royals fanbase in full roar',  'assets/images/gallery-crowd-roar.jpg',        420, 280, 6),
  ('Events',    'Royal Home Kit details for new season',   'assets/images/gallery-home-kit-detail.jpg',   420, 280, 7),
  ('Training',  'Pre-game tactical drills setups',         'assets/images/gallery-pre-game-drills.jpg',   420, 280, 8),
  ('Stadium',   'Morning light over Aurelia Arena',        'assets/images/gallery-morning-light.jpg',     856, 375, 9),
  ('Events',    'Unified in locker room triumph',          'assets/images/gallery-locker-room.jpg',       400, 292, 10);

-- -----------------------------------------------------------------------------
-- Contact
-- -----------------------------------------------------------------------------
INSERT INTO contact_departments (name, email, phone, note, sort_order) VALUES
  ('General Enquiries', 'hello@aureliafc.com', '+44 (0) 20 8123 4567', 'Standard club operations and inquiries.', 1),
  ('Ticket Office',     'tickets@aureliafc.com', '+44 (0) 20 8123 4568', 'Mon-Fri: 9:00 AM - 5:00 PM BST', 2),
  ('Media & Press',     'press@aureliafc.com', NULL, 'For accredited press & media inquiries only.', 3);

INSERT INTO faqs (question, answer, sort_order) VALUES
  ('How do I purchase matchday tickets?',
   'Matchday tickets can be purchased online through our Ticket portal or directly at the Aurelia Arena box office.', 1),
  ('Are stadium tours available?',
   'Yes, stadium tours run every Tuesday and Thursday. Advanced booking is required through the quick links.', 2),
  ('How can I join the Youth Academy?',
   'Our youth academy holds open trials twice a year. Keep an eye on our latest news or contact trials@aureliafc.com.', 3),
  ('Can I host private events at Aurelia Arena?',
   'Absolutely, we have several luxurious hospitality suites available for corporate events and private celebrations.', 4),
  ('Is there matchday parking available?',
   'Yes, stadium parking is available but limited. We highly recommend booking a parking pass alongside your tickets.', 5);

-- -----------------------------------------------------------------------------
-- Demo user (TEST DATA — password: RoyalPass1!  hashed with BCrypt)
-- Hash generated at seed time by the API on first run if this row is absent;
-- see database/03_create_admin.sql for creating an admin account safely.
-- -----------------------------------------------------------------------------
