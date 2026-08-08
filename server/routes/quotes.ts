import { Router } from "express";
import {
  and,
  arrayContains,
  asc,
  desc,
  eq,
  ilike,
  or,
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

function cleanTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(String).filter((t) => t.trim() !== "");
}

router.get("/", async (req, res, next) => {
  try {
    const { search, type, collection, tag, sort } = req.query as Record<
      string,
      string | undefined
    >;

    const conditions = [];

    if (search) {
      const needle = `%${search}%`;
      conditions.push(
        or(
          ilike(quotes.text, needle),
          ilike(quotes.author, needle),
          ilike(quotes.work, needle),
          ilike(quotes.reflection, needle),
          ilike(quotes.collection, needle),
        ),
      );
    }
    if (type && (VALID_TYPES as readonly string[]).includes(type)) {
      conditions.push(eq(quotes.sourceType, type as (typeof VALID_TYPES)[number]));
    }
    if (collection) {
      conditions.push(eq(quotes.collection, collection));
    }
    if (tag) {
      conditions.push(arrayContains(quotes.tags, [tag]));
    }

    const orderBy =
      sort === "oldest"
        ? asc(quotes.savedDate)
        : sort === "az"
          ? asc(quotes.text)
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
      tags: cleanTags(body.tags),
      collection: cleanOptional(body.collection),
      preservedFrom: cleanOptional(body.preservedFrom),
      device: cleanOptional(body.device),
      collected: typeof body.collected === "boolean" ? body.collected : false,
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
    if ("tags" in body) patch.tags = cleanTags(body.tags);
    if ("collection" in body) patch.collection = cleanOptional(body.collection);
    if ("preservedFrom" in body) patch.preservedFrom = cleanOptional(body.preservedFrom);
    if ("device" in body) patch.device = cleanOptional(body.device);
    if ("collected" in body && typeof body.collected === "boolean") {
      patch.collected = body.collected;
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
