# AURELIA FC — Database Schema

**Engine:** MySQL 8 (`utf8mb4` / `utf8mb4_unicode_ci`), InnoDB.
**Database name:** `aurelia_fc`.
**Source of truth:** [`database/01_schema.sql`](../database/01_schema.sql) (schema),
[`database/02_seed.sql`](../database/02_seed.sql) (content),
[`database/03_create_admin.sql`](../database/03_create_admin.sql) (application user).

The schema is applied as plain SQL rather than via EF Core migrations. The
`AureliaDbContext` maps onto it with explicit snake_case column names, so the database
remains the authoritative definition.

34 tables, grouped below.

## Entity groups

### Users / authentication

| Table | Notes |
| --- | --- |
| `users` | Accounts. `email` unique. `password_hash` is BCrypt. `role` is `Member` or `Admin`. |
| `password_reset_tokens` | Reset tokens stored as a `CHAR(64)` SHA-256 hash with expiry and single-use timestamp. |

### Squads / players

| Table | Notes |
| --- | --- |
| `teams` | Squads (First Team, Women's First, U21, U18, Reserve, Women's Reserve). `player_count` is a stored display value maintained by the seed data, not a live count. |
| `positions` | Lookup: Goalkeeper / Defender / Midfielder / Forward. |
| `players` | `UNIQUE(team_id, squad_number)`; `avg_rating` constrained to 0–10; `nationality` is ISO-3166 alpha-3. |
| `player_season_stats` | Per-month apps/goals/assists, ordered by `sort_order`. |
| `player_career_history` | Previous clubs with period and optional apps/goals. |

### Competitions / matches

| Table | Notes |
| --- | --- |
| `competitions` | `UNIQUE(name, season)`; `type` is League / Cup / Friendly. |
| `league_standings` | `UNIQUE(competition_id, position)`. Goal difference and points are derived in the API (`goals_for - goals_against`, `won*3 + drawn`). |
| `matches` | `status` is Scheduled / Completed / Cancelled; `is_home` flags Aurelia home games. |
| `match_events` | Goals/cards with minute and `team_side`. |
| `match_stats` | `UNIQUE(match_id, stat_label)`; values are strings to accommodate `%`, `64%` etc. |
| `match_lineups` | `formation`, `squad_no` and `role_code` per side. |

### News / gallery

| Table | Notes |
| --- | --- |
| `news_articles` | `slug` unique; optional pull quote and author; `is_featured` marks the lead story. |
| `news_tags` | `UNIQUE(article_id, tag)`. |
| `gallery_images` | `category` is Match Day / Training / Events / Stadium; stores intrinsic `width_px`/`height_px`. |

### Shop / tickets

| Table | Notes |
| --- | --- |
| `product_categories` | Shop navigation. |
| `products` | `price` constrained `>= 0`; optional `badge` and `is_featured`. |
| `ticket_fixtures` | `UNIQUE(match_id)`; price band plus `available_seats` and `status_label`. |
| `season_ticket_tiers` | Tier name/price/description. |
| `season_ticket_features` | Feature bullets per tier. |
| `hospitality_packages` | Package price + `price_unit` (e.g. `/ match`). |

### Contact

| Table | Notes |
| --- | --- |
| `contact_departments` | Department name, email, optional phone. |
| `contact_messages` | Submitted enquiries; `user_id` nullable and `ON DELETE SET NULL`. |
| `faqs` | Contact page accordion content. |

### Commerce

| Table | Notes |
| --- | --- |
| `orders` | `reference` is `CHAR(12)` and unique; `user_id` nullable (guest checkout); status Pending / Paid / Cancelled. |
| `order_items` | Line items with snapshotted `description` and `unit_price`; `quantity > 0` enforced. |

`orders.total_amount` is always recomputed server-side from the catalogue; the
per-item `unit_price` is a snapshot for display and audit.

### Club content

| Table | Notes |
| --- | --- |
| `club_info` | Single-row(ish) club profile used by the About page and footer. |
| `club_milestones` | History timeline entries. |
| `club_values` | Values cards. |
| `club_honours` | Roll of honour with `years` and `count_label`. |
| `club_executives` | Board/executive profiles. |
| `partners` | Partner names (`UNIQUE`). |
| `quick_links` | Footer quick links. |

## Conventions

- Primary keys are `INT UNSIGNED AUTO_INCREMENT` unless a narrower type is sufficient.
- Foreign keys cascade on delete except where history must survive
  (`match_events` cascade, `contact_messages.user_id` / `orders.user_id` set null).
- `*_path` columns store **relative** asset paths such as `assets/images/hero-home.jpg`.
  The API returns them unchanged; the frontend prefixes a leading `/` so they resolve
  against its own asset root (`frontend/public/`).
- `sort_order` columns drive deterministic ordering without relying on insertion order.

## Derived values

These are computed by the API rather than stored:

| Value | Formula / source |
| --- | --- |
| `Standing.goalDifference` | `goals_for - goals_against` |
| `Standing.points` | `won * 3 + drawn` |
| `Fixture.scoreLabel` | `"{homeScore}-{awayScore}"` for completed matches, otherwise empty |
| `Fixture.dateLabel` / `timeLabel` | Formatted from `kickoff_at` |
| `PlayerCard.fullName` | `first_name + ' ' + last_name` |
| `Order.reference` | Generated (`AUR` + 9 random chars = 12) |
| `ContactMessage.reference` | Generated (`MSG-` + zero-padded id) |
