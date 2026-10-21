# AURELIA FC — Full-Stack Club Website

A complete, working recreation of the **AURELIA FC** club website from the 16 Figma
design-reference frames in `design reference/`. Everything is wired to a real, persistent
MySQL 8 database — there is no mock data, no hard-coded credentials and no simulated
network layer.

```
React 19 + TypeScript + Vite   ──HTTP/JSON──▶   ASP.NET Core 9 Web API (C#)   ──EF Core 9──▶   MySQL 8
```

---

## Table of contents

- [What's included](#whats-included)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Setup from scratch](#setup-from-scratch)
- [Running the app](#running-the-app)
- [Environment variables](#environment-variables)
- [Project layout](#project-layout)
- [Screens and features](#screens-and-features)
- [Testing](#testing)
- [Documentation](#documentation)
- [Troubleshooting](#troubleshooting)
- [Known limitations](#known-limitations)

---

## What's included

| Area | Status |
| --- | --- |
| 16 designed screens + 4 supporting routes | Implemented |
| 34-table MySQL schema | Implemented, seeded |
| 30+ REST endpoints | Implemented and verified against a live database |
| Registration / login (JWT) + BCrypt password hashing | Implemented |
| Cart → order flow with server-side re-pricing | Implemented |
| Contact form with persisted messages | Implemented |
| 60 real design images extracted from the Figma frames | Wired through the database |

## Architecture

- **Frontend** — React 19 + TypeScript, bundled by Vite. Client-side routing with React
  Router. Three React contexts (`AuthContext`, `CartContext`) plus a small `useAsync`
  data-fetching hook. No UI kit: the design system is a hand-written token sheet
  (`src/styles/global.css`) derived from measured values in the Figma frames. All colours,
  spacing and type sizes trace back to `docs/DESIGN-INVENTORY.md`.
- **Backend** — ASP.NET Core Web API on `net9.0`, EF Core 9 with the Pomelo MySQL
  provider, JWT bearer authentication, BCrypt password hashing and Swagger/OpenAPI.
- **Database** — MySQL 8. Schema is applied as SQL scripts (not EF migrations); the EF
  model maps onto the existing snake_case schema explicitly.

Request flow: the browser talks only to the Vite dev server, which proxies `/api/*` to the
API (see `frontend/vite.config.ts`). That keeps everything same-origin in development, so
no CORS pre-flight is needed. In production, set `VITE_API_BASE_URL` and the API's
`Cors:AllowedOrigins` instead.

## Prerequisites

| Tool | Version used | Notes |
| --- | --- | --- |
| .NET SDK | 9.0 (any 9.0+ runtime works via `RollForward`) | `dotnet --version` |
| Node.js | 20 LTS or newer | `node --version` |
| npm | 10+ | ships with Node |
| MySQL Server | 8.0.x | must be running and reachable |

> **Why `net9.0` and not `net10.0`?** The MySQL provider (Pomelo 9) is built against
> EF Core 9 internals and throws `MissingMethodException` at runtime under EF Core 10. The
> project therefore targets `net9.0` and sets `<RollForward>LatestMajor</RollForward>` so
> it still runs on a machine that only has the .NET 10 runtime installed.

## Setup from scratch

### 1. Start MySQL

Make sure a MySQL 8 server is listening on `127.0.0.1:3306` before continuing.

### 2. Create the schema, seed content, and add the API user

```powershell
# from the repository root
mysql -u root -p -e "source database/01_schema.sql"
mysql -u root -p -e "source database/02_seed.sql"
mysql -u root -p -e "source database/03_create_admin.sql"
```

`01_schema.sql` drops and recreates `aurelia_fc`, so it is safe to re-run. Edit the
`CHANGE_ME` passwords in `03_create_admin.sql` first — or skip that file and point the
connection string at an existing user.

### 3. Configure the API connection string

Set it via an environment variable so no secret is committed:

```powershell
$env:ConnectionStrings__Aurelia = "Server=127.0.0.1;Port=3306;Database=aurelia_fc;User=aurelia_app;Password=your-strong-password;"
```

`backend/AureliaFc.Api/appsettings.Development.json` contains a **development-only**
fallback (`root`, empty password) and a **development-only** JWT key. Do not use either in
production.

### 4. Install frontend dependencies

```powershell
cd frontend
npm install
```

## Running the app

Two terminals.

**Terminal 1 — API** (listens on `http://127.0.0.1:5080`):

```powershell
$env:ASPNETCORE_ENVIRONMENT = "Development"
$env:ASPNETCORE_URLS = "http://127.0.0.1:5080"
dotnet run --project backend/AureliaFc.Api
```

**Terminal 2 — web app** (listens on `http://localhost:5173`):

```powershell
cd frontend
npm run dev
```

Then open <http://localhost:5173>. API docs are at <http://127.0.0.1:5080/swagger>.

To generate a BCrypt hash for an admin account:

```powershell
dotnet run --project backend/AureliaFc.Api -- hash "YourStrongPassword"
```

## Environment variables

### Backend

| Variable | Purpose |
| --- | --- |
| `ConnectionStrings__Aurelia` | MySQL connection string (required in production). |
| `Jwt__Key` | Signing key, **at least 32 characters** (required in production). |
| `Jwt__Issuer` / `Jwt__Audience` | Token issuer/audience. Defaults are in `appsettings.json`. |
| `Jwt__ExpiryMinutes` | Token lifetime in minutes (default 480). |
| `Cors__AllowedOrigins__0`, `__1`, … | Allowed browser origins for the deployed frontend. |
| `ASPNETCORE_URLS` | Bind address, e.g. `http://127.0.0.1:5080`. |
| `ASPNETCORE_ENVIRONMENT` | `Development` enables verbose errors and the dev configuration file. |

### Frontend

Copy `frontend/.env.example` to `frontend/.env` and adjust:

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Absolute API origin. **Leave empty** in development to use the proxy. |
| `VITE_API_TARGET` | Target the Vite dev-server proxy forwards `/api` to. Defaults to `http://127.0.0.1:5080`. |

> Only `VITE_`-prefixed variables reach the browser, so never put secrets in `.env`.
> `.env` and `.env.local` are git-ignored; `.env.example` is the committed template.

## Project layout

```
AURELIA FC/
├── AURELIA-PROMPT.md              # Original task specification
├── design reference/              # 16 Figma frame PDF exports (source of truth)
├── database/
│   ├── 01_schema.sql              # Database + 34 tables
│   ├── 02_seed.sql                # Real content for every screen
│   └── 03_create_admin.sql        # App DB user + optional admin account
├── backend/AureliaFc.Api/
│   ├── Program.cs                 # Composition root, auth, CORS, Swagger, /health
│   ├── Controllers/               # One per resource (see docs/API.md)
│   ├── Contracts/Dtos.cs          # Request/response DTOs
│   ├── Data/AureliaDbContext.cs   # EF Core mapping onto the SQL schema
│   ├── Models/                    # Entity classes
│   └── Services/                  # Mappers, JWT/BCrypt, validation
├── frontend/
│   ├── src/api/                   # Typed client + DTO types
│   ├── src/components/            # Cards, tables, state components, layout
│   ├── src/context/               # AuthContext, CartContext
│   ├── src/hooks/useAsync.ts      # Load/error/retry data hook
│   ├── src/pages/                 # One folder-level module per screen
│   ├── src/styles/global.css      # Design tokens + shared utilities
│   ├── public/assets/images/      # 60 extracted design images + manifest.json
│   └── vite.config.ts             # Dev proxy, Vitest config
├── docs/
│   ├── DESIGN-INVENTORY.md        # Measured design tokens + screen inventory
│   ├── API.md                     # Endpoint reference
│   └── DATABASE.md                # Schema documentation
└── tools/                         # Extraction scripts + measurement output
```

## Screens and features

| Screen | Route | What it does |
| --- | --- | --- |
| Home | `/` | Hero, next fixture, featured news, standings snapshot, shop teaser. |
| About | `/about` | Club story, milestones timeline, values, honours, executives. |
| Teams | `/teams` | All squads with coach and squad size. |
| Players | `/players` | Searchable, filterable squad list (team + position). |
| Player Profile | `/players/:id` | Bio, season stats, career history. |
| Matches | `/matches` | Upcoming fixtures and results with competition filters. |
| Match Detail | `/matches/:id` | Events, stats and lineups. |
| League Table | `/league-table` | Full standings with derived points and goal difference. |
| News | `/news` | Article cards with category filters. |
| News Article | `/news/:slug` | Full article with tags and related stories. |
| Gallery | `/gallery` | Filterable image grid by category. |
| Tickets | `/tickets` | Matchday tickets, season tiers, hospitality. |
| Shop | `/shop` | Product grid, categories, cart and order placement. |
| Contact | `/contact` | Contact form (persisted), departments, location, FAQs. |
| Sign In | `/signin` | JWT login. |
| Sign Up | `/signup` | Registration with client + server password policy. |
| Account | `/account` | Protected membership portal: profile, order history. |
| Not Found | `*` | 404 page. |

## Testing

```powershell
# Frontend: type-check + production build
cd frontend
npm run build

# Frontend: component tests (Vitest + React Testing Library)
npm test

# Frontend: lint
npm run lint

# Backend: build
dotnet build backend/AureliaFc.Api

# Backend: integration tests (boots the API in-process against MySQL)
dotnet test backend/AureliaFc.Api.Tests
```

> The backend integration suite (`backend/AureliaFc.Api.Tests`) uses
> `WebApplicationFactory` to host the real API in-process and talks to the same MySQL
> database as `dotnet run`, so **MySQL must be running and seeded** before it will pass.
> It uses the `Development` configuration (the working connection string).

> **Verification status.** The backend was compiled and exercised against a live MySQL
> 8.0.28 instance; the frontend was type-checked, built, linted and unit-tested. All
> results below are observed, not assumed.

> **Install note.** `registry.npmjs.org` was unreachable from the build machine, so
> dependencies were installed from the reachable mirror
> `npm install --registry=https://registry.npmmirror.com`. Any registry works.

### What was verified

| Check | Result |
| --- | --- |
| `npm install` | 271 packages installed |
| `npm run build` (`tsc -b && vite build`) | Succeeded — 104 modules, 0 type errors |
| `npm test` (Vitest + Testing Library) | 20/20 tests passed (3 files) |
| `npm run lint` (ESLint 9) | 0 errors, 0 warnings |
| Production bundle | `index.html` 0.64 kB, CSS 45.43 kB, JS 342.83 kB (101.95 kB gzipped) |
| `dotnet build backend/AureliaFc.Api` | Succeeded — 0 warnings, 0 errors |
| `dotnet test backend/AureliaFc.Api.Tests` | 47/47 tests passed |
| Schema applied to MySQL 8.0.28 | Succeeded — 34 tables created |
| Seed applied | Succeeded — 26 players, 8 matches, 7 articles, 10 gallery images, 8 products, 12 standings rows |
| All 30 public GET endpoints | `200` with expected JSON shapes |
| Dev server (`npm run dev`) on :5173 | Serves the SPA; `/api` proxy forwards to :5080 |
| Proxy status passthrough | `401` from `/api/orders/mine` relayed unchanged |
| SPA deep link (`/players/1`) | `200` (client-side routing) |
| Register → login → `/api/auth/me` | `200` at each step, JWT issued (531 chars) |
| Register with `royalpassword123` | `400` — policy requires an upper-case letter and a digit |
| Register with `RoyalPassword123` | `200`, user persisted |
| Tampered order price (client `0.01` × 3) | Server charged `269.97` from the catalogue |
| Order history scoping | `orders/mine` returned only that user's two orders |
| Reading another user's order | `403` |
| `GET /api/matches/999` (unknown id) | `404` ProblemDetails |
| Register with weak password | `400` with `errors.password` |
| Register valid / duplicate email | `200` with token / `409` |
| Login correct / incorrect | `200` / `401` |
| `GET /api/auth/me` with and without token | `200` / `401` |
| `GET /api/orders/mine`, `/api/orders/{id}` without token | `401` |
| Contact submit valid / invalid | `MSG-000001` / `400` with field errors |
| Order re-pricing (client sent `0.01`, catalogue `89.99` × 2) | Server charged `179.98` |
| Order reference length | Exactly 12 characters (`AURCJ5FL46S6`, `AURMN6ETQ6GE`) |
| Orders and order items persisted in MySQL | 2 orders, matching items |
| API `/health` | `{"status":"healthy","database":true}` |
| Swagger document | 38 operations generated |
| Every API-served and hardcoded image path | All 43 + 11 resolve to real files in `frontend/public/assets/images/` |

### What was **not** verified

- Browser rendering of individual screens and interactive flows (clicking through the
  cart, submitting the real sign-up form in a browser) — verified at the HTTP, build and
  component level, but no headless-browser suite drives the UI.
- Payment processing — there is no gateway to test against; orders are recorded `Pending`.
### Defects found and fixed during verification

| Defect | Fix |
| --- | --- |
| `vite.config.ts` imported `defineConfig` from `vite`, so the `test` block failed type-checking (`TS2769`). | Import from `vitest/config`. |
| ESLint rejected the context modules for co-locating a provider and its accessor hook. | Scoped `react-refresh/only-export-components` off for `src/context/**`. |
| tsconfig was a single project, so `tsc -b` did not behave as a build. | Split into `tsconfig.app.json` + `tsconfig.node.json` with project references. |
| Under Node 26 + jsdom, `localStorage` was undefined, failing every test at render. | Added a spec-compliant in-memory `Storage` shim in the test setup. |
| The sign-up form accepted `royalpassword123` (the string shown in the design as placeholder copy) but the API rejects it, because the policy requires an upper-case letter and a digit — the client would have shown a server 400 for its own example. | Client validation now mirrors `Validation.StrongPasswordRegex` exactly, placeholders use `RoyalPassword123`, and a regression test covers the rejection. |
| `useAsync` fired authenticated requests before the auth check on `/account`, producing a wasted `401`. | Added an opt-in `enabled` flag; `AccountPage` defers the request until signed in. |
| The README documented `frontend/.env.example` as the committed environment template, but the file did not exist. | Added `frontend/.env.example` (empty `VITE_API_BASE_URL`, safe to commit). |
| The README stated `.env`/`.env.local` were git-ignored, but the repository had no `.gitignore` at all — so secrets and build output were not actually ignored. | Added a root `.gitignore` covering env files, `bin/`, `obj/`, `node_modules/`, `dist/` and the local `tools/` MySQL distribution. |

Manual end-to-end checks that exercise the real stack (all of the following were run
against the live API and database):

1. **Register** at `/signup` — a weak password is rejected with a field error; a valid
   submission creates a row in `users` and returns a token.
2. **Sign in** at `/signin` with those credentials.
3. **Contact** at `/contact` — a valid message returns a `MSG-` reference and inserts into
   `contact_messages`.
4. **Shop** — add items to the cart and place an order. The API re-prices from the
   catalogue, so a tampered client price is ignored.
5. **Tickets** — buy a match ticket; the resulting order appears under `/account`.

## Documentation

- [`docs/DESIGN-INVENTORY.md`](docs/DESIGN-INVENTORY.md) — measured design tokens, the 16
  screens, shared chrome and the entity list derived from the Figma frames.
- [`docs/API.md`](docs/API.md) — every endpoint, payload shape and status code.
- [`docs/DATABASE.md`](docs/DATABASE.md) — the 34 tables, their purpose and derived values.
- [`docs/VERIFICATION-REPORT.md`](docs/VERIFICATION-REPORT.md) — build and test evidence,
  defects found and fixed, and what remains unverified.

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| `MissingMethodException: AbstractionsStrings.ArgumentIsEmpty` on startup | The project was retargeted to EF Core 10. Keep `net9.0` + EF Core 9 / Pomelo 9. |
| `Unable to reach the Aurelia FC service` in the browser | The API is not running, or `VITE_API_TARGET` points at the wrong port. |
| `401` on every authenticated call | The JWT key changed after the token was issued — sign in again. |
| Empty pages instead of data | The API is up but the database is empty; re-run `02_seed.sql`. |
| `Access denied for user 'aurelia_app'` | Re-run `03_create_admin.sql`, or fix `ConnectionStrings__Aurelia`. |
| `dotnet run` fails with a runtime-not-found error | Install the .NET 9 runtime, or keep `<RollForward>LatestMajor</RollForward>` and a newer runtime. |
| `npm install` fails with `ECONNRESET` / `ENOTCACHED` | `registry.npmjs.org` is unreachable from your network. Either use a machine with registry access, set a proxy (`npm config set proxy http://host:port` and `npm config set https-proxy http://host:port`), or install from a reachable mirror: `npm install --registry=https://registry.npmmirror.com`. |

## Known limitations

- **No automated browser (E2E) tests.** Verification covered the API end-to-end against a
  live database, the dev-server proxy, and component tests, but there is no Playwright /
  Cypress suite, so visual regressions in the rendered pages are not caught automatically.
- **OAuth buttons are inert.** Google and Apple sign-in are present in the design but no
  provider is configured, so the buttons are rendered disabled rather than faking a flow.
- **Checkout does not process payment.** Orders are recorded with status `Pending`; there
  is no payment gateway integration, and no payment details are collected.
- **`password_reset_tokens` is unused.** The "Forgot Password?" link routes to `/contact`
  because the frames do not define a reset screen.
- **Admin features are data-only.** The `Admin` role exists in the schema and in issued
  tokens, but no admin UI is designed in the frames.
- **The design system is approximated.** The PDF exports contain no font names, so
  **Outfit** (display) and **Inter** (body) were chosen as close matches to the reference
  type. Colours and geometry were measured directly and are exact.
- **Only 26 players are seeded** across six squads, matching the content visible in the
  frames rather than a full roster.
