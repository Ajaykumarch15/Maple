CREATE TYPE "public"."source_type" AS ENUM('Book', 'Movie', 'Song', 'Conversation', 'My Own', 'Other');--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"text" text NOT NULL,
	"source_type" "source_type" DEFAULT 'Book' NOT NULL,
	"work" text,
	"author" text,
	"reflection" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"collection" text,
	"saved_date" timestamp with time zone DEFAULT now() NOT NULL,
	"preserved_from" text,
	"device" text,
	"collected" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE INDEX "quotes_tags_idx" ON "quotes" USING gin ("tags");--> statement-breakpoint
CREATE INDEX "quotes_collection_idx" ON "quotes" USING btree ("collection");--> statement-breakpoint
CREATE INDEX "quotes_saved_date_idx" ON "quotes" USING btree ("saved_date");