import { Router } from "express";
import {
  and,
  arrayContains,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  isNotNull,
  lte,
  ne,
  or,
  sql,
} from "drizzle-orm";
import { db } from "../db";
import { quotes } from "../db/schema";
import type { NewQuote } from "../db/schema";

const router = Router();

const VALID_TYPES = [
  "Book",
  "Movie",
  "Song",
  "Conversation",
  "My Own",
  "Other",
] as const;

const VALID_SORTS = new Set(["recent", "oldest", "author", "work", "favorites"]);

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;

function cleanOptional(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function cleanStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(String).filter((t) => t.trim() !== "");
}

function cleanCollections(value: unknown): string[] | null {
  if (Array.isArray(value)) return cleanStrings(value);
  const single = cleanOptional(value);
  return single ? [single] : null;
}

function parsePositiveInt(value: unknown, fallback: number): number {
  const n = parseInt(String(value ?? ""), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function isUuid(value: unknown): boolean {
  return (
    typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
  );
}

// Sort maps to fixed, explicit columns (never arbitrary request input).
// Every ordering ends with `id` as a deterministic tiebreaker so rows do
// not jump between pages when sort keys collide.
function buildOrderBy(sort: string) {
  switch (sort) {
    case "oldest":
      return [asc(quotes.savedDate), asc(quotes.id)];
    case "author":
      return [sql`${quotes.author} ASC NULLS FIRST`, asc(quotes.id)];
    case "work":
      return [sql`${quotes.work} ASC NULLS FIRST`, asc(quotes.id)];
    case "favorites":
      return [desc(quotes.favorite), desc(quotes.savedDate), desc(quotes.id)];
    default:
      return [desc(quotes.savedDate), desc(quotes.id)];
  }
}

router.get("/", async (req, res, next) => {
  try {
    const page = parsePositiveInt(req.query.page, DEFAULT_PAGE);
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, parsePositiveInt(req.query.limit, DEFAULT_LIMIT)),
    );

    const conditions: ReturnType<typeof and>[] = [];

    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    if (search) {
      const needle = `%${search}%`;
      conditions.push(
        or(
          ilike(quotes.text, needle),
          ilike(quotes.author, needle),
          ilike(quotes.work, needle),
          ilike(quotes.reflection, needle),
          sql`array_to_string(${quotes.collections}, ' ') ILIKE ${needle}`,
          sql`array_to_string(${quotes.tags}, ' ') ILIKE ${needle}`,
        ),
      );
    }
    if (
      typeof req.query.sourceType === "string" &&
      (VALID_TYPES as readonly string[]).includes(req.query.sourceType)
    ) {
      conditions.push(
        eq(quotes.sourceType, req.query.sourceType as (typeof VALID_TYPES)[number]),
      );
    }
    if (typeof req.query.author === "string" && req.query.author.trim()) {
      conditions.push(ilike(quotes.author, `%${req.query.author.trim()}%`));
    }
    if (typeof req.query.collection === "string" && req.query.collection.trim()) {
      conditions.push(arrayContains(quotes.collections, [req.query.collection]));
    }
    if (typeof req.query.tag === "string" && req.query.tag.trim()) {
      conditions.push(arrayContains(quotes.tags, [req.query.tag]));
    }
    if (req.query.favorite === "true") {
      conditions.push(eq(quotes.favorite, true));
    } else if (req.query.favorite === "false") {
      conditions.push(eq(quotes.favorite, false));
    }
    const dateFrom =
      typeof req.query.dateFrom === "string" && req.query.dateFrom
        ? new Date(`${req.query.dateFrom}T00:00:00`)
        : null;
    if (dateFrom && !Number.isNaN(dateFrom.getTime())) {
      conditions.push(gte(quotes.savedDate, dateFrom));
    }
    const dateTo =
      typeof req.query.dateTo === "string" && req.query.dateTo
        ? new Date(`${req.query.dateTo}T23:59:59.999`)
        : null;
    if (dateTo && !Number.isNaN(dateTo.getTime())) {
      conditions.push(lte(quotes.savedDate, dateTo));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const sort =
      typeof req.query.sort === "string" && VALID_SORTS.has(req.query.sort)
        ? req.query.sort
        : "recent";

    const [{ value: totalValue }] = await db
      .select({ value: count() })
      .from(quotes)
      .where(where);
    const total = Number(totalValue);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);

    const rows = await db
      .select()
      .from(quotes)
      .where(where)
      .orderBy(...buildOrderBy(sort))
      .limit(limit)
      .offset((safePage - 1) * limit);

    res.json({
      items: rows,
      pagination: { page: safePage, limit, total, totalPages },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/stats", async (req, res, next) => {
  try {
    const [totalRow, favoritesRow, reflectionsRow, collectionsResult] =
      await Promise.all([
        db.select({ value: count() }).from(quotes),
        db.select({ value: count() }).from(quotes).where(eq(quotes.favorite, true)),
        db
          .select({ value: count() })
          .from(quotes)
          .where(
            and(isNotNull(quotes.reflection), sql`trim(${quotes.reflection}) <> ''`),
          ),
        db.execute(
          sql`SELECT count(DISTINCT c)::int AS n FROM quotes, unnest(collections) AS c WHERE c <> ''`,
        ),
      ]);

    res.json({
      total: Number(totalRow[0].value),
      favorites: Number(favoritesRow[0].value),
      reflections: Number(reflectionsRow[0].value),
      collections: collectionsResult.rows[0]?.n ?? 0,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/meta", async (req, res, next) => {
  try {
    // Aggregated in SQL so we never ship the full table to the browser.
    const [collectionsResult, tagsResult, authorsResult] = await Promise.all([
      db.execute(sql`
        WITH colls AS (
          SELECT c AS name, text, saved_date
          FROM quotes, unnest(collections) AS c
          WHERE c <> ''
        ),
        counts AS (
          SELECT name, count(*)::int AS count FROM colls GROUP BY name
        ),
        previews AS (
          SELECT DISTINCT ON (name) name, text
          FROM colls
          ORDER BY name, saved_date DESC
        )
        SELECT counts.name, counts.count,
               CASE
                 WHEN length(previews.text) > 140 THEN left(previews.text, 140) || '…'
                 ELSE previews.text
               END AS preview
        FROM counts JOIN previews USING (name)
        ORDER BY counts.name
      `),
      db.execute(sql`
        SELECT DISTINCT t AS tag
        FROM quotes, unnest(tags) AS t
        WHERE t <> ''
        ORDER BY t
      `),
      db.execute(sql`
        SELECT DISTINCT author
        FROM quotes
        WHERE author IS NOT NULL AND trim(author) <> ''
        ORDER BY author
      `),
    ]);

    res.json({
      collections: collectionsResult.rows.map((r) => ({
        name: r.name,
        count: Number(r.count),
        preview: r.preview,
      })),
      tags: tagsResult.rows.map((r) => r.tag),
      authors: authorsResult.rows.map((r) => r.author),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/rediscover", async (req, res, next) => {
  try {
    const exclude =
      typeof req.query.exclude === "string" && isUuid(req.query.exclude)
        ? req.query.exclude
        : undefined;
    const where = exclude ? ne(quotes.id, exclude) : undefined;

    const rows = await db
      .select()
      .from(quotes)
      .where(where)
      .orderBy(sql`${quotes.lastOpenedAt} ASC NULLS FIRST`, asc(quotes.id))
      .limit(100);

    if (rows.length === 0) {
      res.json({ quote: null });
      return;
    }

    const DAY_MS = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const ranked = rows.map((q) => {
      const opened = q.lastOpenedAt ? new Date(q.lastOpenedAt).getTime() : 0;
      return { q, opened, notRecent: !q.lastOpenedAt || now - opened > DAY_MS };
    });

    const candidates = ranked.some((r) => r.notRecent)
      ? ranked.filter((r) => r.notRecent)
      : ranked;
    candidates.sort((a, b) => a.opened - b.opened);
    const top = candidates.slice(
      0,
      Math.max(1, Math.min(10, Math.ceil(candidates.length / 3))),
    );
    const pick = top[Math.floor(Math.random() * top.length)];

    res.json({ quote: pick.q });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/context", async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!isUuid(id)) {
      res.status(404).json({ error: "Quote not found" });
      return;
    }

    // Reading mode navigates in "recent" order (saved_date DESC, id DESC).
    // Window functions avoid passing the (possibly sub-millisecond) timestamp
    // back into a comparison, which the pg driver would truncate.
    const result = await db.execute(sql`
      WITH ranked AS (
        SELECT id,
               ROW_NUMBER() OVER (ORDER BY saved_date DESC, id DESC) AS rn,
               COUNT(*) OVER () AS total,
               LAG(id) OVER (ORDER BY saved_date DESC, id DESC) AS prev_id,
               LEAD(id) OVER (ORDER BY saved_date DESC, id DESC) AS next_id
        FROM quotes
      )
      SELECT rn, total, prev_id, next_id FROM ranked WHERE id = ${id}
    `);

    const rows = result.rows;
    if (!rows || rows.length === 0) {
      res.status(404).json({ error: "Quote not found" });
      return;
    }

    const r = rows[0];
    res.json({
      prevId: r.prev_id ?? null,
      nextId: r.next_id ?? null,
      position: Number(r.rn),
      total: Number(r.total),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!isUuid(req.params.id)) {
      res.status(404).json({ error: "Quote not found" });
      return;
    }
    const [row] = await db
      .select()
      .from(quotes)
      .where(eq(quotes.id, req.params.id))
      .limit(1);
    if (!row) {
      res.status(404).json({ error: "Quote not found" });
      return;
    }
    res.json(row);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const body = req.body ?? {};

    if (typeof body.text !== "string" || !body.text.trim()) {
      res.status(400).json({ error: "text is required" });
      return;
    }
    if (
      body.sourceType !== undefined &&
      !(VALID_TYPES as readonly string[]).includes(body.sourceType)
    ) {
      res.status(400).json({ error: "sourceType is invalid" });
      return;
    }

    const values: NewQuote = {
      text: body.text.trim(),
      sourceType: body.sourceType ?? "Book",
      work: cleanOptional(body.work),
      author: cleanOptional(body.author),
      reflection: cleanOptional(body.reflection),
      tags: cleanStrings(body.tags),
      collections: cleanCollections(body.collections) ?? cleanCollections(body.collection) ?? [],
      preservedFrom: cleanOptional(body.preservedFrom),
      device: cleanOptional(body.device),
      collected: typeof body.collected === "boolean" ? body.collected : false,
      favorite: typeof body.favorite === "boolean" ? body.favorite : false,
      lastOpenedAt: typeof body.lastOpenedAt === "string" ? new Date(body.lastOpenedAt) : undefined,
    };

    const [row] = await db.insert(quotes).values(values).returning();
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!isUuid(id)) {
      res.status(404).json({ error: "Quote not found" });
      return;
    }
    const body = req.body ?? {};

    const [existing] = await db
      .select({ id: quotes.id })
      .from(quotes)
      .where(eq(quotes.id, id))
      .limit(1);
    if (!existing) {
      res.status(404).json({ error: "Quote not found" });
      return;
    }
    if (
      body.sourceType !== undefined &&
      !(VALID_TYPES as readonly string[]).includes(body.sourceType)
    ) {
      res.status(400).json({ error: "sourceType is invalid" });
      return;
    }

    const patch: Partial<NewQuote> = {};

    if (typeof body.text === "string") {
      if (!body.text.trim()) {
        res.status(400).json({ error: "text cannot be empty" });
        return;
      }
      patch.text = body.text.trim();
    }
    if (body.sourceType !== undefined) {
      patch.sourceType = body.sourceType;
    }
    if ("work" in body) patch.work = cleanOptional(body.work);
    if ("author" in body) patch.author = cleanOptional(body.author);
    if ("reflection" in body) patch.reflection = cleanOptional(body.reflection);
    if ("tags" in body) patch.tags = cleanStrings(body.tags);
    if ("collections" in body)
      patch.collections = cleanCollections(body.collections) ?? [];
    if ("collection" in body && !("collections" in body))
      patch.collections = cleanCollections(body.collection) ?? [];
    if ("preservedFrom" in body) patch.preservedFrom = cleanOptional(body.preservedFrom);
    if ("device" in body) patch.device = cleanOptional(body.device);
    if ("collected" in body && typeof body.collected === "boolean") {
      patch.collected = body.collected;
    }
    if ("favorite" in body && typeof body.favorite === "boolean") {
      patch.favorite = body.favorite;
    }
    if ("lastOpenedAt" in body) {
      patch.lastOpenedAt =
        typeof body.lastOpenedAt === "string" && body.lastOpenedAt
          ? new Date(body.lastOpenedAt)
          : null;
    }

    const [row] = await db
      .update(quotes)
      .set(patch)
      .where(eq(quotes.id, id))
      .returning();
    res.json(row);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (!isUuid(req.params.id)) {
      res.status(404).json({ error: "Quote not found" });
      return;
    }
    await db.delete(quotes).where(eq(quotes.id, req.params.id));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
