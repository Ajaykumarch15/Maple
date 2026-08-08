import { Router } from "express";
import {
  and,
  arrayContains,
  asc,
  desc,
  eq,
  ilike,
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

router.get("/", async (req, res, next) => {
  try {
    const { search, type, collection, tag, author, favorite, sort } =
      req.query as Record<string, string | undefined>;

    const conditions = [];

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
    if (type && (VALID_TYPES as readonly string[]).includes(type)) {
      conditions.push(eq(quotes.sourceType, type as (typeof VALID_TYPES)[number]));
    }
    if (collection) {
      conditions.push(arrayContains(quotes.collections, [collection]));
    }
    if (tag) {
      conditions.push(arrayContains(quotes.tags, [tag]));
    }
    if (author) {
      conditions.push(ilike(quotes.author, `%${author}%`));
    }
    if (favorite === "true") {
      conditions.push(eq(quotes.favorite, true));
    } else if (favorite === "false") {
      conditions.push(eq(quotes.favorite, false));
    }

    const orderBy =
      sort === "oldest"
        ? asc(quotes.savedDate)
        : sort === "az"
          ? asc(quotes.text)
          : sort === "author"
            ? asc(quotes.author)
            : sort === "work"
              ? asc(quotes.work)
              : sort === "favorites"
                ? desc(quotes.favorite)
                : desc(quotes.savedDate);

    const rows = await db
      .select()
      .from(quotes)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderBy);

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
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
    await db.delete(quotes).where(eq(quotes.id, req.params.id));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
