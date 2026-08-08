# Maple

A personal commonplace book — a quiet place to save the quotes, lines, and thoughts worth keeping, and to find them again.

Built around the flow **Capture → Organize → Search → Filter → Read → Rediscover**, Maple is designed to stay calm and useful even with 1,000+ saved quotes.

## Features

- **New Save** — capture a line from a book, movie, song, conversation, or your own writing, with an optional reflection, tags, and collection.
- **Library** — instant, debounced search across quote text, author, work, reflection, tags, and collections.
- **Filters** — source type, author, collection, tag, date saved, and favorites. All filters combine, with removable chips and a single "Clear all".
- **Sorting** — recently saved, oldest, A–Z by author, A–Z by work, favorites first.
- **Favorites** — one-tap heart on every card and in reading view; dedicated Favorites view.
- **Collections** — a quote can live in multiple collections. Create them anytime; none are forced at save time.
- **Reading mode** — open a quote as a calm, typography-focused reading view with Previous / Next navigation, a `12 / 87` position indicator, arrow-key support, export-to-image, and edit/delete.
- **Rediscover** — "Surprise me" surfaces quotes you haven't revisited recently, weighted toward least-interacted lines.
- **Themes** — warm paper "Daylight" and a dark "Midnight" theme.
- **Responsive** — editorial desktop grid, collapsing filters on mobile, single-column cards, full reading mode on phones.

## Tech Stack

- **Frontend** — React 18, TypeScript, Vite, Tailwind CSS v4, React Router
- **Backend** — Node.js, Express, TypeScript (tsx)
- **Database** — PostgreSQL with Drizzle ORM (works with Neon, Supabase, or any Postgres)

## Prerequisites

- Node.js 18+ and npm
- A PostgreSQL database (e.g. a free Neon project) and its connection string

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
#    then fill in your DATABASE_URL (see below)

# 3. Create the database tables
npm run db:migrate

# (optional) seed with sample quotes
npm run db:seed

# 4. Run the app (API on :4000, Vite dev server on :5173)
npm run dev
```

Open http://localhost:5173.

### Environment Variables

Maple reads these from `.env`:

| Variable       | Required | Description                                                                  |
| -------------- | -------- | ---------------------------------------------------------------------------- |
| `DATABASE_URL` | yes      | PostgreSQL connection string, e.g. `postgresql://user:pass@host:5432/margin?sslmode=require` |
| `PORT`         | no       | API port (default `4000`).                                                    |
| `CORS_ORIGIN`  | no       | Restrict browser CORS to one origin. Leave unset to allow any origin.         |

## Scripts

| Script             | Description                                             |
| ------------------ | ------------------------------------------------------- |
| `npm run dev`      | Run API and Vite dev server together                    |
| `npm run dev:server` | API only (tsx watch, port 4000)                       |
| `npm run dev:client` | Vite client only (port 5173)                          |
| `npm run build`    | Type-check and build the frontend into `dist/`          |
| `npm run start`    | Run the API server (serves `dist/` if present)          |
| `npm run preview`  | Preview the production build locally                    |
| `npm run db:generate` | Generate a Drizzle migration from schema changes    |
| `npm run db:migrate`  | Apply pending Drizzle migrations to the database     |
| `npm run db:push`     | Push schema changes directly (see note below)       |
| `npm run db:seed`     | Reset and seed the database with sample quotes      |

## Database

Schema lives in `server/db/schema.ts`. Key fields on the `quotes` table:

- `text`, `sourceType` (Book / Movie / Song / Conversation / My Own / Other), `work`, `author`, `reflection`
- `tags text[]`, `collections text[]` (multi-collection)
- `collected`, `favorite` booleans
- `savedDate`, `lastOpenedAt` (drives Rediscover)

GIN indexes exist on `tags` and `collections`; `savedDate` is indexed for ordering.

The schema is versioned through Drizzle migrations in `server/db/migrations/`:

1. After changing `schema.ts`, run `npm run db:generate` to create a new migration.
2. Apply it with `npm run db:migrate` (recommended, tested against both an existing and a fresh database).
3. Optional `npm run db:push` pushes the schema directly without a migration file — but it can fail with `column "id" is in a primary key` on some Drizzle/Postgres combos, so prefer `db:migrate`.

## API

The Express server exposes `GET /api/quotes` and friends. The browser never
receives the full table — every list is paginated, filtered, and sorted
server-side, so the app stays responsive with 1,000+ quotes.

### `GET /api/quotes`

Query parameters (all optional, all combinable):

| Param        | Description                                                            |
| ------------ | ---------------------------------------------------------------------- |
| `search`     | Case-insensitive match across text, author, work, reflection, tags, collections |
| `sourceType` | One of `Book`, `Movie`, `Song`, `Conversation`, `My Own`, `Other`      |
| `author`     | Case-insensitive author substring                                      |
| `collection` | Exact collection membership (multi-collection aware)                   |
| `tag`        | Exact tag membership                                                   |
| `favorite`   | `true` or `false`                                                      |
| `dateFrom`   | `YYYY-MM-DD` (inclusive, local start-of-day)                           |
| `dateTo`     | `YYYY-MM-DD` (inclusive, local end-of-day)                             |
| `sort`       | `recent` (default), `oldest`, `author`, `work`, `favorites`            |
| `page`       | 1-based page number (default `1`, clamped to the last page)            |
| `limit`      | Rows per page (default `30`, max `100`)                                |

Response:

```json
{
  "items": [ /* Quote rows */ ],
  "pagination": { "page": 1, "limit": 30, "total": 14, "totalPages": 1 }
}
```

Sort orders map to fixed columns (never raw input) and always tie-break on
`id`, so rows never jump between pages.

### Other endpoints

| Endpoint                 | Description                                                             |
| ------------------------ | ----------------------------------------------------------------------- |
| `GET /api/quotes/stats`  | `{ total, favorites, reflections, collections }`                        |
| `GET /api/quotes/meta`   | Distinct collections (with count + preview), tags, and authors          |
| `GET /api/quotes/rediscover` | `{ quote }` weighted toward least-recently-opened lines; optional `?exclude=<uuid>` |
| `GET /api/quotes/:id/context` | `{ prevId, nextId, position, total }` in reading mode without downloading the list |
| `GET /api/quotes/:id`    | Single quote                                                            |
| `POST /api/quotes`       | Create a quote                                                          |
| `PATCH /api/quotes/:id`  | Partial update (text, sourceType, work, author, reflection, tags, collections, collected, favorite, lastOpenedAt) |
| `DELETE /api/quotes/:id` | Delete a quote                                                          |

## Project Structure

```
server/
  db/            # Drizzle schema, connection pool, migrations
  routes/        # Express routes for /api/quotes
  seed.ts        # Sample data seeder
  app.ts         # Express app (API + static dist serving)
  index.ts       # Server entry point
src/
  components/    # Layout, sidebar, quote cards, icons, etc.
  pages/         # Home, Library, Collections, Reflections, Search, Quote detail, Add/Edit, Rediscover
  store/         # API-backed quotes context
  utils/         # Formatting helpers, useDebounce
  data/quotes.ts # Seed data source
```

## Testing

There is no automated test suite yet. Before shipping a change, verify with:

```bash
npm run build    # type-checks (tsc) and builds the frontend
```

then run the app with `npm run dev` and smoke-test the main flows: quote
CRUD, search, filters, sorting, favorites, collections, and reading mode.

## Deployment (Vercel)

The app can deploy to Vercel as a single project. The Express API runs as a
serverless function (`api/index.ts`) and Vercel serves the built frontend from
`dist`. A rewrite in `vercel.json` sends `/api/*` to the function and every
other route to `index.html` (SPA fallback), so the browser always talks to the
same origin and there is no CORS setup.

1. Push the repository to GitHub.
2. On [vercel.com](https://vercel.com): **Add New → Project** → import the repo.
3. Build command `npm run build` and output `dist` are set by `vercel.json`.
4. Add the environment variable `DATABASE_URL` (your PostgreSQL connection
   string).
5. Deploy. Every push to `main` auto-redeploys.

To deploy from the CLI instead, run `vercel login` once, then `vercel --prod`.

## License

Private project — all rights reserved.
