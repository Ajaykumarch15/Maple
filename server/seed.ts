import "dotenv/config";
import { db } from "./db";
import { quotes } from "./db/schema";
import { seedQuotes } from "../src/data/quotes";
import type { NewQuote } from "./db/schema";

const rows: NewQuote[] = seedQuotes.map((q) => ({
  text: q.text,
  sourceType: q.sourceType,
  work: q.work ?? null,
  author: q.author ?? null,
  reflection: q.reflection ?? null,
  tags: q.tags,
  collections: q.collections ?? [],
  savedDate: new Date(q.savedDate),
  preservedFrom: q.preservedFrom ?? null,
  device: q.device ?? null,
  collected: q.collected ?? false,
  favorite: q.favorite ?? false,
}));

async function main() {
  console.log("Clearing quotes table…");
  await db.delete(quotes);
  console.log(`Seeding ${rows.length} quotes…`);
  await db.insert(quotes).values(rows);
  console.log("Done. Seed complete.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
