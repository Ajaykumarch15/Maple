# Margin

A personal commonplace book — a quiet place to save the quotes, lines, and thoughts worth keeping, and to find them again.

Built around the flow **Capture → Organize → Search → Filter → Read → Rediscover**, Margin is designed to stay calm and useful even with 1,000+ saved quotes.

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
- **Deployment** — a single Render web service serving both the API and the built frontend

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

| Variable        | Required | Description                                                                  |
| --------------- | -------- | ---------------------------------------------------------------------------- |
| `DATABASE_URL`  | yes      | PostgreSQL connection string, e.g. `postgresql://user:pass@host:5432/margin?sslmode=require` |
| `PORT`          | no       | API port (default `4000`). Render sets this automatically.                    |
| `CORS_ORIGIN`   | no       | Restrict browser CORS to one origin. Leave unset to allow any origin.         |

When deploying the frontend to GitHub Pages (not the default), set `VITE_API_BASE` as a GitHub Actions repository variable.

## Scripts

| Script           | Description                                             |
| ---------------- | ------------------------------------------------------- |
| `npm run dev`    | Run API and Vite dev server together                    |
| `npm run dev:server` | API only (tsx watch, port 4000)                     |
| `npm run dev:client` | Vite client only (port 5173)                        |
| `npm run build`  | Type-check and build the frontend into `dist/`          |
| `npm run start`  | Serve the API (also serves `dist/` if present)          |
| `npm run preview`| Preview the production build locally                    |
| `npm run db:generate` | Generate a Drizzle migration from schema changes |
| `npm run db:migrate`  | Apply pending Drizzle migrations to the database     |
| `npm run db:push`     | Push schema changes directly (see note below)         |
| `npm run db:seed`     | Reset and seed the database with sample quotes        |

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

## Project Structure

```
server/
  db/            # Drizzle schema + connection pool
  routes/        # Express routes for /api/quotes
  seed.ts        # Sample data seeder
  index.ts       # Express app (API + static dist serving)
src/
  components/    # Layout, sidebar, quote cards, icons, etc.
  pages/         # Home, Library, Collections, Reflections, Search, Quote detail, Add/Edit, Rediscover
  store/         # API-backed quotes context
  utils/         # Formatting helpers, useDebounce
  data/quotes.ts # Seed data source
```

## Deployment (Render)

This app deploys as a **single Render web service** — the Express server serves both the API and the built frontend, so there is no CORS or proxy setup.

1. Push the repository to GitHub.
2. On [render.com](https://dashboard.render.com): **New → Web Service** → connect the repo.
3. Name: `margin`, Runtime: **Node**.
4. Build command: `npm ci && npm run build`
5. Start command: `npm run start`
6. Add environment variable `DATABASE_URL` (your PostgreSQL connection string).
7. Create the service. Every push to `main` auto-redeploys.

## License

Private project — all rights reserved.
