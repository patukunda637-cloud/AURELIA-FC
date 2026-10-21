# AURELIA FC — Build and Verification Report

Date: 21 October 2026
Scope: recreation of the 16 Figma design frames as a full-stack application.

---

## 1. Deliverable

| Component | Location | Status |
| --- | --- | --- |
| React + TypeScript + Vite frontend | `frontend/` | Built, linted, unit-tested |
| ASP.NET Core 9 Web API (C#) | `backend/AureliaFc.Api/` | Built, exercised live |
| MySQL 8 schema + seed | `database/*.sql` | Applied to a real server |
| Documentation | `README.md`, `docs/*.md` | Complete |
| Design extraction tooling + evidence | `tools/` | Retained for traceability |

---

## 2. What was actually executed

### 2.1 Backend

```
dotnet build backend/AureliaFc.Api
    Build succeeded.
        0 Warning(s)
        0 Error(s)
```

> A rebuild while the API is running fails with `MSB3027`/`MSB3021` (the running process
> holds `AureliaFc.Api.exe`). This is a Windows file lock, not a compile error — stop the
> process, or build before starting it. A clean build reports 0 warnings, 0 errors.

The API was run on `http://127.0.0.1:5080` against a real MySQL 8.0.28 server and driven
over HTTP. Verified outcomes:

| Area | Evidence |
| --- | --- |
| Database schema | 34 tables created by `01_schema.sql` |
| Seed data | 26 players, 8 matches, 7 articles, 10 gallery images, 8 products, 12 standings rows, 6 squads |
| Referential integrity | 0 orphans across 8 foreign-key checks |
| CHECK constraints | 0 violations across 7 constraint checks (rating range, nationality length, negative price, price band, quantity, reference length, duplicate squad numbers) |
| Public endpoints | All 30 return `200` with the documented JSON shape |
| Unknown resource | `GET /api/matches/999` → `404` ProblemDetails |
| Swagger | 38 operations generated |
| Health | `GET /health` → `{"status":"healthy","database":true}` |

### 2.2 Authentication and authorisation

| Request | Result |
| --- | --- |
| `POST /api/auth/register` with a policy-compliant password | `200`, JWT issued (531 chars), user persisted |
| `POST /api/auth/register` with `royalpassword123` | `400` — policy requires an upper-case letter and a digit |
| `POST /api/auth/register` duplicate email | `409` |
| `POST /api/auth/login` correct / incorrect | `200` / `401` |
| `GET /api/auth/me` with / without token | `200` / `401` |
| `GET /api/orders/mine` without token | `401` |
| `GET /api/orders/{id}` for another user's order | `403` |

### 2.3 Commerce integrity

The critical test: submit a product line with `unitPrice: 0.01` for a product that costs
more, and confirm the server ignores the client figure.

| Observation | Result |
| --- | --- |
| Client sent | `0.01` × 3 |
| Catalogue price (`products.id = 2`) | `89.99` |
| Server stored | `269.97` |
| Line description | Forced to the catalogue name (`Away Kit 2026/27`), not the client string |
| Reference | `AUR9YZS5RGLE` — exactly 12 characters |
| Ticket order | `AUR27P4VCGRF`, total `70.00` |
| `orders/mine` scoping | Returned only the requesting user's 2 orders |

Persistence was confirmed directly in MySQL (orders and matching `order_items` rows).

### 2.4 Frontend

Dependencies were installed from `registry.npmmirror.com` because `registry.npmjs.org`
was unreachable from the build network (`ECONNRESET`). 271 packages installed.

```
npm run lint    → 0 errors, 0 warnings
npm run build   → tsc -b clean; vite build: 104 modules transformed
                  index.html 0.64 kB │ CSS 45.43 kB │ JS 342.91 kB (102.00 kB gzip)
npm test        → 3 files, 20/20 tests passed
```

Backend integration suite (`backend/AureliaFc.Api.Tests`, added in the final verification
pass — see defect 7): `WebApplicationFactory` hosts the API in-process against MySQL.

```
dotnet test backend/AureliaFc.Api.Tests → 47/47 tests passed (net9.0)
```

Coverage: health + database connectivity, 22 public GET endpoints, 404s for unknown ids,
position/status filters, contact persistence and validation, register/login/`/me` round
trip, weak-password / mismatch / invalid-email / duplicate-email rejections, wrong-password
and tampered-token `401`s, server-side order re-pricing, order read-back and cross-user
`403`, empty/unknown/out-of-range order rejection, guest checkout, and Swagger generation.

Integration checks against the live API:

| Check | Result |
| --- | --- |
| `npm run dev` on :5173 | Serves the SPA (`<title>` and `/src/main.tsx` entry present) |
| `/api` proxy | Forwards to :5080; `GET /api/content/club` → `200` with real club JSON |
| Status passthrough | `401` from `/api/orders/mine` relayed unchanged |
| SPA deep link `/players/1` | `200` |
| `vite preview` on :4173 | Serves the built bundle; `assets/images/hero-home.jpg` → `200 image/jpeg` |
| Built bundle audit | Contains all 9 extra routes and all 12 API endpoint prefixes |
| Mock-data audit | No `MOCK_`, `mockData`, `FAKE_`, `placeholderData`, or stubbed resolvers in the bundle |
| Build output | All 60 images, `favicon.svg` and `manifest.json` copied into `dist/` |
| Asset resolution | All 43 API-served paths and 11 hardcoded paths exist on disk (60 files total) |

---

## 3. Defects found and fixed

Verification was not a rubber stamp; these were found and corrected.

| # | Defect | Root cause | Fix |
| --- | --- | --- | --- |
| 1 | Client accepted `royalpassword123` (the literal placeholder copy in the design) while the API rejected it — the form's own example produced a server `400`. | Client validation required only length, not character classes. | Client validation now mirrors `Validation.StrongPasswordRegex`. Placeholders changed to `RoyalPassword123`; regression test added. |
| 2 | `TSC2769` — `test` block rejected in `vite.config.ts`. | `defineConfig` imported from `vite`. | Import from `vitest/config`. |
| 3 | Every test failed at render: `localStorage` undefined. | Node 26 + jsdom does not place `Storage` on `globalThis`. | Added a spec-compliant in-memory `Storage` shim in the test setup. |
| 4 | ESLint errors: context modules export both a provider and a hook. | `react-refresh/only-export-components`. | Scoped the rule off for `src/context/**` with a comment explaining why. |
| 5 | `useAsync` fired an authenticated request before the auth guard on `/account`, producing a wasted `401`. | Loader ran unconditionally on mount. | Added an opt-in `enabled` flag (backward-compatible); `AccountPage` defers until signed in. |
| 6 | `tsc -b` did not behave as a project build. | Single monolithic tsconfig. | Split into `tsconfig.app.json` + `tsconfig.node.json` with project references. |
| 7 | No automated backend tests existed — every backend claim rested on manual HTTP calls. | Test packages were assumed unavailable (NuGet was reachable all along). | Added `backend/AureliaFc.Api.Tests` (xUnit + `Microsoft.AspNetCore.Mvc.Testing`) with 47 integration tests, and expanded the frontend suite from 4 to 20 tests. |
| 8 | The README documented `frontend/.env.example` but the file did not exist. | Template never created. | Added `frontend/.env.example` with a safe, empty `VITE_API_BASE_URL`. |
| 9 | The README claimed `.env`/`.env.local` were git-ignored, but no `.gitignore` existed. | Repository was never initialised with ignore rules. | Added a root `.gitignore` covering env files, `bin/`, `obj/`, `node_modules/`, `dist/` and the local `tools/` MySQL distribution. |

Documentation was also corrected where it diverged from the implementation:

- related-articles limit is 4, not 3;
- contact `fullName` max is 160, not 120;
- `confirmPassword` is optional; names are 1–80 characters;
- `image_path` values have **no** leading slash in API responses (the frontend adds it);
- Swagger omits the per-operation lock icon although the attributes are enforced at runtime;
- `Team.playerCount` is a stored column, not a live count.

---

## 4. Deliberate deviations

| Item | Reason |
| --- | --- |
| Target framework `net9.0` (not `net10.0`) | Pomelo 9 is runtime-incompatible with EF Core 10 (`MissingMethodException` from `UseMySql`). `<RollForward>LatestMajor</RollForward>` lets it run on a newer runtime. |
| Explicit `MySqlServerVersion(8,0,28)` instead of `ServerVersion.AutoDetect` | Avoids the EF Core 9/10 internal-API break in `AutoDetect`. |
| Outfit + Inter web fonts | The PDF exports embed no font names, so no font could be recovered; these are the closest matches to the reference type. |
| Schema via SQL scripts rather than EF migrations | Keeps the database as the single authoritative definition; the EF model maps onto it explicitly. |

---

## 5. Not verified

- **No headless-browser (E2E) tests.** Behaviour was verified at the HTTP, build and
  component-test level; no Playwright/Cypress suite drives the rendered UI.
- **No payment integration.** There is no gateway to test; orders are persisted as
  `Pending`.
- **OAuth.** Google/Apple buttons exist in the design but no provider is configured, so
  they are rendered disabled rather than simulating success.

---

## 6. Reproducing this verification

```powershell
# 1. Database
mysql -u root -p -e "source database/01_schema.sql"
mysql -u root -p -e "source database/02_seed.sql"

# 2. Backend build + integration tests (MySQL must be running and seeded)
dotnet build backend/AureliaFc.Api
dotnet test  backend/AureliaFc.Api.Tests          # 47 tests

# 3. API
$env:ASPNETCORE_ENVIRONMENT = "Development"
dotnet run --project backend/AureliaFc.Api      # http://127.0.0.1:5080

# 4. Frontend (separate terminal)
cd frontend
npm install                                     # add --registry=<mirror> if npmjs is blocked
npm run lint
npm run build
npm test                                        # 20 tests
npm run dev                                     # http://localhost:5173
```

---

## 7. VS Code one-key run (Ctrl+F5)

`.vscode/{tasks,launch,settings,extensions}.json` run the whole stack from one keypress.
Verified by executing the exact task command chain (`kill-dev-ports` → `api-build` →
`api-run` → `web-dev`) against the real project paths.

| Check | Result |
| --- | --- |
| All four `.vscode/*.json` parse as valid JSON(C) | Pass |
| `kill-dev-ports` frees 5080 + 5173 while both servers are live | Pass — stopped PIDs 8740 / 29456, 0 listeners after |
| `api-build` (`dotnet build backend/AureliaFc.Api/…`) | Pass — 0 warnings, 0 errors |
| `api-run` emits the matcher's ready line | Pass — `Now listening on: http://127.0.0.1:5080` |
| `web-dev` emits the matcher's ready line | Pass — `Local: http://localhost:5173/` |
| API reachable through the Vite proxy at :5173 | Pass — `/api/players` → 26 players |
| Guarded route still protected via proxy | Pass — `/api/orders/mine` → 401 |
| SPA deep link served by dev server | Pass — `/players` → 200 |
| `.vscode/` tracked by git (not ignored) | Pass — `.gitignore` rule removed |

> The `kill-dev-ports` step is what makes repeated Ctrl+F5 safe: without it a second run
> hits `EADDRINUSE` (Vite) or `MSB3027`/`MSB3021` (locked `AureliaFc.Api.exe`).

