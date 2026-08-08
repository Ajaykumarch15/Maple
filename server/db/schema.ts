import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const sourceTypeEnum = pgEnum("source_type", [
  "Book",
  "Movie",
  "Song",
  "Conversation",
  "My Own",
  "Other",
]);

export const quotes = pgTable(
  "quotes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    text: text("text").notNull(),
    sourceType: sourceTypeEnum("source_type").notNull().default("Book"),
    work: text("work"),
    author: text("author"),
    reflection: text("reflection"),
    tags: text("tags")
      .array()
      .notNull()
      .default([]),
    collections: text("collections")
      .array()
      .notNull()
      .default([]),
    savedDate: timestamp("saved_date", { withTimezone: true })
      .notNull()
      .defaultNow(),
    preservedFrom: text("preserved_from"),
    device: text("device"),
    collected: boolean("collected").notNull().default(false),
    favorite: boolean("favorite").notNull().default(false),
    lastOpenedAt: timestamp("last_opened_at", { withTimezone: true }),
  },
  (table) => [
    index("quotes_tags_idx").using("gin", table.tags),
    index("quotes_collections_idx").using("gin", table.collections),
    index("quotes_saved_date_idx").on(table.savedDate),
  ],
);

export type QuoteRow = typeof quotes.$inferSelect;
export type NewQuote = typeof quotes.$inferInsert;
