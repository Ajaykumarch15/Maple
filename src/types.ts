export type SourceType =
  | "Book"
  | "Movie"
  | "Song"
  | "Conversation"
  | "My Own"
  | "Other";

export const SOURCE_TYPES: SourceType[] = [
  "Book",
  "Movie",
  "Song",
  "Conversation",
  "My Own",
  "Other",
];

export interface Quote {
  id: string;
  text: string;
  sourceType: SourceType;
  work?: string;
  author?: string;
  reflection?: string;
  tags: string[];
  collection?: string;
  savedDate: string;
  preservedFrom?: string;
  device?: string;
  collected?: boolean;
}

export type QuoteInput = Omit<Quote, "id" | "savedDate" | "collected">;
