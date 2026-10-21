# AURELIA FC — Design Reference Inventory

Source of truth: the 16 exported screen PDFs in `design reference/` (Figma export, 1440px desktop frames).
All coordinates below are in design pixels (frame width = 1440).

The Figma share link (`figma.com/design/aqLl1r8aqhfN0vJ1suFWv1`) requires an authenticated
session and returned no content to automated fetch, so the PDF frame exports were used as the
authoritative reference. They preserve exact geometry, colours, typography sizes and the
original raster imagery (extracted to `tools/images_jpg/`).

> **Hero banner extraction (corrected).** Every full-bleed hero in the export is a
> **1440×630 placement (aspect 2.286)** backed by a **1536×672 raster** — on `home`,
> `about-club` and `tickets` alike. The first extraction pass mis-mapped several roles to
> a different embedded stream, so `hero-about` (1152×896), `hero-tickets` (1024×1024),
> `shop-hero-kit` (1024×1024) and `hero-match` (1344×768) shipped with the wrong source
> image. They were re-extracted from the correct placement with
> `tools/refix_heroes.py`; all four now match the 1536×672 / 2.286 original.

---

## 1. Global design tokens (measured)

### Colours
| Token | Value | Use |
|---|---|---|
| `bg-base` | `#050918` | page background |
| `bg-surface` | `#0C132A` | alternating section bands, footer |
| `bg-elevated` | `#161E38` | table header row / card header |
| `accent` | `#D97706` | primary CTA, active tab, highlight row |
| `accent-light` | `#FBBF24` | gold text, borders, hover, icons |
| `text-primary` | `#FFFFFF` | headings |
| `text-muted` | `#A3AED0` | body text |
| `text-dim` | `#64748B` | footer secondary text |
| `border` | `#1E293B` | hairlines / card borders |

### Typography
| Role | Size (px) | Weight |
|---|---|---|
| Hero display | 72 | 700 |
| Section H1 (page title) | 48 / 56 | 700 |
| Section H2 | 36 | 700 |
| Card name / stat | 20–24 | 600 |
| Big stat number | 48 (32 in cards) | 700 |
| Body | 14–16 | 400 |
| Eyebrow / label | 11–12 | 600, letter-spacing, uppercase |
| Nav link | 14 | 500 |
| Button label | 14 | 600, uppercase, letter-spacing |

Font family: the export embeds no font descriptor, so a geometric sans matching the glyph
proportions was chosen: **Outfit** (headings) / **Inter** (body), loaded from Google Fonts.

### Layout
- Content container: `1440px` frame, inner content `x=80 → 1360` (**1280px max-width**).
- Header: fixed 88px tall, transparent over hero.
- Section vertical rhythm: ~60–80px internal, ~185px between bands.
- Card grid: 3 columns, 32px gutters (e.g. home cards at x=80, 514.7, 949.3 w=411.4).
- Footer: 4 columns + bottom bar with copyright.

---

## 2. Screens (16)

### 2.1 Home (`home.pdf`, 1440×3496)
Header nav → hero (full-bleed image 1440×630) → Next Match + League Standings →
stats band (37 YEARS / 12 TROPHIES / 45,000 Seats) → Recent Results (3 cards) →
Featured Players (3 cards, image 410.7×273.8) → Latest News (3 cards) →
Official Partners strip → 4-column footer.

Key content: hero title "Aurelia FC", sub "Rise. Unite. Conquer.",
buttons `EXPLORE SQUAD` / `LATEST FIXTURES`.
Next match card: `SEPTEMBER 12 · PREMIER DIVISION`, `HOME GAME`, VS block
"Aurelia FC" vs "Ironclad United", STADIUM `Aurelia Arena`, KICK OFF `19:45 BST`,
CTA `PURCHASE MATCH TICKETS`.
Standings table: POS/CLUB/P/GD/PTS, 5 rows (Stormgate 12, Aurelia 10, Northvale 7,
Crestwood 5, Ironclad 4).

### 2.2 About Club (`about-club.pdf`, 1440×2957)
Title "About Aurelia FC" (56px) → Club History Timeline (4 milestones 1987/1994/2003/2015-2020)
→ Mission & Values (Excellence / Unity / Community) → Aurelia Arena feature (image left,
copy + CAPACITY 45,000 Seats / RECORD ATTENDANCE 45,210 Fans) →
Honours Cabinet (Premier Division Champions 4, National Cup Winners 6, Super Cup Champions 2)
→ Key Executives (Sir Arthur Sterling — Club President, Adrianna Vance — Head Coach) → footer.

### 2.3 Teams (`teams.pdf`, 1440×1662)
Title "Our Teams" → 6 team cards (2 rows × 3) each image 457×200:
First Team (Coach: Adrianna Vance, 25 Players), Reserve Team (David Sterling, 22),
U-21 Academy (Marcus Thorne, 20), U-18 Academy (Leon Croft, 18),
Women's First Team (Sarah Jenkins, 23), Women's Reserve (Elena Rostov, 19) + `VIEW SQUAD`.

### 2.4 Players (`players.pdf`, 1440×1712)
Title "Squad" → filter chips All/Goalkeepers/Defenders/Midfielders/Forwards +
search field "Search squad players..." → 8 player cards (grid 4×2, image 302×302):
Thomas Reign #1 GK UK, David Okafor #4 DEF NGR, Lena Hartwell #5 DEF USA, Elena Cross #7 MID ESP,
James Kato #8 MID JPN, Marcus Vane #9 FWD ENG, Sofia Almeida #10 FWD BRA, Riku Tanaka #11 FWD JPN.

### 2.5 Player Profile (`player-profile.pdf`, 1440×1629)
`FORWARD` / `SQUAD NO. 9` → "Marcus Vane" (56px) → bio → 4 stat tiles
(28 GOALS SCORED, 12 ASSISTS DELIVERED, 38 APPEARANCES, 4.2 AVERAGE MATCH RATING) →
Season Statistics table (MONTH/APPS/GOALS/ASSISTS: Sep 2026 2/3/1, Aug 2026 4/4/2,
May 2026 5/5/3, Apr 2026 6/8/2) → Career History
(Aurelia FC 2023–Present 74 Matches 48 Goals; Ironclad United 2020–2023 92/35;
Crestwood Youth 2018–2020 Graduate Academy) → footer. Portrait image 280×360.

### 2.6 Matches & Fixtures (`matches-fixtures.pdf`, 1440×1277)
Title → tabs Upcoming/Results/All → fixture rows: date, competition, home vs away names,
VS, venue, KICK OFF, HOME/AWAY badge, `BUY TICKETS`.
Fixtures: Sep 12 2026 Aurelia vs Ironclad United (League, Aurelia Arena, HOME);
Sep 19 2026 vs Thornfield Rangers (Cup, Thornfield Stadium, AWAY);
Sep 26 2026 vs Crestwood Athletic (League, Aurelia Arena, HOME);
Oct 03 2026 vs Stormgate FC (League, Aurelia Arena, HOME).

### 2.7 Match Detail (`match-detail.pdf`, 1440×2033)
`COMPLETED MATCH — PREMIER LEAGUE`, score "3 – 1", Aurelia FC vs Northvale City,
`Sep 7, 2026 · Aurelia Arena · Attendance: 44,812`.
Match Events timeline (23' Marcus Vane Goal assist Elena Cross AURELIA;
51' Elena Cross Goal free kick; 65' Torres Goal header NORTHVALE;
78' Almeida Goal corner). Match Stats: Possession 58/42, Shots 14/8, Shots on Target 7/3,
Corners 6/4, Fouls 11/13, Yellow Cards 2/3.
Starting XI (4-3-3) with `#1 T. Harrison GK` … `#9 Marcus Vane CF`; Northvale (4-4-2).
Man of the Match: Marcus Vane, Forward · Aurelia FC, rating 8.7 (image 480×274),
GOAL 1 / ASSIST 1 / SHOTS 5 / PASS ACC. 88%.

### 2.8 League Table (`league-table.pdf`, 1440×1498)
Title + "2026/2027 Season" → table POS/CLUB/P/W/D/L/GF/GA/GD/PTS, 12 clubs
(1 Stormgate 38, 2 Aurelia 35, 3 Northvale 33, 4 Crestwood 30, 5 Ironclad 28,
6 Thornfield 26, 7 Meridian 24, 8 Ashford 22, 9 Blackmoor 19, 10 Silverpeak 17,
11 Dunhaven 14, 12 Redcliffe 11) + legend UEFA Champions League Spots / Relegation Zone.

### 2.9 Tickets (`tickets.pdf`, 1440×3029)
Hero image → "Match Tickets" → 4 fixture ticket rows with date block, tournament,
match, available seats + "Selling Fast", price range, `BUY TICKETS`
(Sep 12 Ironclad £35–£85, 12 seats; Sep 24? Stormgate £40–£95, 24; Oct 05 Northvale £25–£65;
Oct 18 Crestwood £30–£75).
Season Tickets: Standard £450/season, Premium £750/season, VIP £1,200/season with feature
lists and `SELECT TIER`. Hospitality: The Royal Lounge £150/match, Aurelia Executive Box
£2,500/match, `ENQUIRE NOW` (images 240×240).

### 2.10 Shop (`shop.pdf`, 1440×2207)
Hero banner (1280×560) → category chips All/Kits/Training/Accessories/Lifestyle →
featured hero "New Season Home Kit 2026/27" + `SHOP NOW` → 8 product cards (302×302):
Home Kit 2026/27 £89.99, Away Kit £89.99, Third Kit £79.99, Training Jersey £49.99,
Track Jacket £64.99, Scarf £19.99, Cap £24.99, Football £29.99, each `ADD TO CART`.

### 2.11 News (`news.pdf`, 1440×2170)
Title → featured article (image 770×440 + `FEATURED CLUB NEWS` `Sep 5, 2026`
"Aurelia FC signs exciting new partnership with Royal Sports" + `READ FULL ARTICLE`)
→ 6 article cards (image 410×234): Match Report, Transfer, Club News, Youth Academy,
Transfer, Club News with dates and `READ MORE`.

### 2.12 News Article (`news-article.pdf`, 1440×2299)
`MATCH REPORT` `Sep 7, 2026 · By Sarah Mitchell` → headline (48px) → hero image 1280×560 →
body copy → pull-quote "…MARCUS VANE, CF" → Share This Story (Facebook/Twitter/LinkedIn/Copy Link)
→ Related Articles list (4) → tags #Derby #Vane Hat Trick #Aurelia Arena #Matchday → footer.

### 2.13 Gallery (`gallery.pdf`, 1440×2085)
Title "Media Gallery" → filter chips All/Match Day/Training/Events/Stadium →
masonry grid of 10 images with captions → `LOAD MORE IMAGES`.

### 2.14 Contact (`contact.pdf`, 1440×2898)
Title → Send a Message form (Full Name, Email Address, Subject select, Message,
`SEND MESSAGE`) alongside 3 info cards (General Enquiries hello@aureliafc.com,
Ticket Office tickets@aureliafc.com +44 (0) 20 8123 4568, Media & Press press@aureliafc.com)
→ Stadium Location (address + map image 832×364) → FAQ accordion (5 questions) → footer.

### 2.15 Sign In (`sign-in.pdf`, 1440×1024)
Centered card: AURELIA FOOTBALL CLUB, "Sign In to Aurelia FC",
"Access your tickets, order history and membership portal.",
Email Address, Password (+ `SHOW`), Remember me, Forgot Password?, `SIGN IN`,
or continue with Google / Apple, "Don't have an account? Sign Up".

### 2.16 Sign Up (`sign-up.pdf`, 1440×1124)
"AURELIA FOOTBALL CLUB", "Create Your Account", First/Last Name, Email Address,
Password (+`HIDE`, strength meter "Strong"), Confirm Password,
"I agree to the Terms & Conditions and Privacy Policy.", `CREATE ACCOUNT`,
or continue with Google / Apple, "Already have an account? Sign In".

---

## 3. Shared chrome

**Header (all pages, 88px):** logo "AURELIA FC" + "EST. 1987" at x=132;
nav Home, About, Teams, Players, Matches, News, Shop, Contact (x=442→965);
right side "Sign In" (x=1171) and gold button `GET TICKETS` (x=1252, w=87).

**Footer (all pages):** 4 columns — AURELIA FC + "Rise. Unite. Conquer." + description;
AURELIA ARENA (Capacity/Built/Address); QUICK LINKS (Latest Tickets, Club Membership,
Hospitality Suites, Online Shop); plus Contact column on the tickets variant.
Bottom bar: "© 2026 Aurelia Football Club. All Rights Reserved." / "Designed for Premium Performance."

**Official Partners strip:** 5 wordmark logos — AURELIA AIRWAYS, AMBER TRUST, ROYAL SPORTS,
SPRING WATER, STADIUM GROUP.

---

## 4. Data entities implied by the screens

`teams`, `players`, `player_season_stats`, `player_career_history`,
`competitions`, `league_standings`, `matches`, `match_events`, `match_stats`,
`match_lineups`, `news_articles`, `news_tags`, `gallery_images`,
`products`, `product_categories`, `ticket_fixtures`, `season_ticket_tiers`,
`hospitality_packages`, `contact_messages`, `faqs`, `users`, `orders`, `order_items`.
