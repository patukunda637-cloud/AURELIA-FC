# AURELIA FC — API Reference

Base URL (development): `http://127.0.0.1:5080`

All request and response bodies are JSON (`application/json`). Monetary values are
decimal numbers in GBP. Dates without a time are ISO-8601 (`YYYY-MM-DD`); timestamps are
ISO-8601 UTC.

Authentication uses JWT bearer tokens:

```
Authorization: Bearer <token>
```

Tokens are issued by `/api/auth/register` and `/api/auth/login` and expire after the
number of minutes configured in `Jwt:ExpiryMinutes`.

Error responses use [RFC 9457 ProblemDetails](https://www.rfc-editor.org/rfc/rfc9457):

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": { "password": ["Password must be at least 8 characters long."] }
}
```

Field names in `errors` are PascalCase; the frontend normalises them to camelCase and
maps them onto form fields.

---

## 1. Content

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/content/club` | — | Club profile: name, motto, founded year, description, stadium name, capacity, built year, record attendance, address, phone. |
| GET | `/api/content/milestones` | — | Club history milestones (`yearLabel`, `title`, `body`), ordered by year. |
| GET | `/api/content/values` | — | Club values cards (`title`, `body`). |
| GET | `/api/content/honours` | — | Roll of honour (`title`, `years`, `countLabel`). |
| GET | `/api/content/executives` | — | Executive team (`fullName`, `roleTitle`, `imagePath`). |
| GET | `/api/content/partners` | — | Partner / sponsor names. |
| GET | `/api/content/quick-links` | — | Footer quick links (`label`, `href`). |
| GET | `/api/content/faqs` | — | Contact-page FAQs (`question`, `answer`). |
| GET | `/api/content/departments` | — | Contact departments (`name`, `email`, `phone`). |

## 2. Squads and players

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/squads` | — | All squads (`id`, `name`, `coach`, `playerCount`, `description`, `imagePath`). |
| GET | `/api/squads/{id}` | — | A single squad. `404` when unknown. |
| GET | `/api/squads/{id}/players` | — | Players belonging to a squad. |
| GET | `/api/players` | — | Player search/filter. Query: `teamId` (int), `position` (string, `All` ignored), `search` (matches first/last/full name). |
| GET | `/api/players/{id}` | — | Player profile including `seasonStats` (per-month) and `careerHistory`. `404` when unknown. |

`PlayerCard` fields: `id`, `squadNumber`, `fullName`, `firstName`, `lastName`, `position`,
`positionGroup`, `nationality`, `imagePath`, `goals`, `assists`, `appearances`, `avgRating`,
`teamId`, `teamName`.

## 3. Matches and standings

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/matches` | — | Fixtures. Query: `status` = `upcoming` \| `results` \| `all` (default `all`). |
| GET | `/api/matches/{id}` | — | Match detail: events, stats and lineups. `404` when unknown. |
| GET | `/api/matches/standings` | — | League table. Query: `season` (optional label, e.g. `2025/26`). |

`Fixture.status` is one of `Scheduled`, `Completed`, `Cancelled`. `MatchEvent.side` is
`Home` or `Away`.

## 4. Tickets

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/tickets` | — | Matchday ticket fixtures with price band, availability and status label. |
| GET | `/api/tickets/season-tiers` | — | Season ticket tiers with feature lists. |
| GET | `/api/tickets/hospitality` | — | Hospitality packages (`name`, `price`, `priceUnit`, `description`, `imagePath`). |

## 5. Shop

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/shop/categories` | — | Product categories. |
| GET | `/api/shop/products` | — | Products. Query: `category` (category name, `All` ignored). |
| GET | `/api/shop/products/{id}` | — | A single product. `404` when unknown. |
| GET | `/api/shop/featured` | — | The single featured product. |

## 6. News and gallery

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/news` | — | Article cards. Query: `category` (category name, `All` ignored). |
| GET | `/api/news/featured` | — | The featured/lead article. |
| GET | `/api/news/{slug}` | — | Full article with `body`, `authorName`, `pullQuote`, `tags`. `404` when unknown. |
| GET | `/api/news/{slug}/related` | — | Up to four related articles (same category first, then newest). |
| GET | `/api/gallery` | — | Gallery images. Query: `category` (category name, `All` ignored). |

## 7. Contact

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/contact` | — | Submit a contact message. Returns `{ id, reference, message }` where `reference` is a `MSG-` prefixed ticket number. |

Request body:

```json
{ "fullName": "Arthur Sterling", "email": "arthur@example.com", "subject": "Ticket Enquiries", "message": "…" }
```

Validation: `fullName` 2–160 chars, valid `email`, `subject` 1–120 chars, `message`
10–4000 chars. Validation failures return `400` with field errors.

## 8. Authentication

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | — | Create an account. Returns a token plus the user summary. `409` if the email already exists. |
| POST | `/api/auth/login` | — | Exchange credentials for a token. `401` on bad credentials. |
| GET | `/api/auth/me` | ✔ | The authenticated user's summary. `401` without a valid token. |

Register body:

```json
{
  "firstName": "Arthur", "lastName": "Sterling",
  "email": "arthur@example.com",
  "password": "RoyalPassword123", "confirmPassword": "RoyalPassword123"
}
```

Password policy: at least 8 characters, and at least one lowercase letter, one uppercase
letter and one digit. `firstName`/`lastName` are 1–80 chars. `confirmPassword` is optional
but, when supplied, must match `password`.

`AuthResponse`: `token`, `expiresAt`, `userId`, `firstName`, `lastName`, `email`, `role`.

## 9. Orders

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/orders` | — | Create an order. Prices are **re-derived server-side** from the catalogue; client-supplied `unitPrice` is ignored. |
| GET | `/api/orders/{id}` | ✔ | Read one of your own orders. `403` for another user's order, `404` when unknown. |
| GET | `/api/orders/mine` | ✔ | All orders belonging to the authenticated user, newest first. |

Create-order body:

```json
{
  "orderType": "Shop",
  "items": [
    { "itemType": "Product", "itemRefId": 1, "description": "Home Kit", "quantity": 2, "unitPrice": 89.99 }
  ]
}
```

- `orderType`: `Shop` | `Tickets` | `SeasonTicket` | `Hospitality`
- `itemType`: `Product` | `MatchTicket` | `SeasonTicket` | `Hospitality`
- `itemRefId` must reference an existing catalogue row for the given `itemType`.
- `reference` is a 12-character uppercase code, e.g. `AURCJ5FL46S6`.

---

## Status codes

| Code | Meaning |
| --- | --- |
| 200 | Success |
| 400 | Validation failure (ProblemDetails with `errors`) |
| 401 | Missing or invalid credentials / token |
| 403 | Authenticated but not permitted to access the resource |
| 404 | Resource not found |
| 409 | Conflict (e.g. email already registered) |
| 500 | Unhandled server error |

## OpenAPI / interactive docs

Swagger UI is served at `http://127.0.0.1:5080/swagger` and the raw document at
`http://127.0.0.1:5080/swagger/v1/swagger.json`. The site root (`/`) redirects to
Swagger UI. The generated document lists all 38 operations.

> The generated document does not mark the three `[Authorize]` operations
> (`GET /api/auth/me`, `GET /api/orders/mine`, `GET /api/orders/{id}`) with a lock icon,
> because `AddSecurityRequirement` is applied globally rather than per-operation. The
> attributes are enforced at runtime — anonymous calls to those three endpoints return
> `401`. The “Auth” column in the tables above is the accurate reference.

Health check: `GET /health` returns `{ "status": "healthy", "database": true }`, or
`degraded` when the database cannot be reached.
