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
  collections?: string[];
  savedDate: string;
  preservedFrom?: string;
  device?: string;
  collected?: boolean;
  favorite?: boolean;
  lastOpenedAt?: string | null;
}

export type QuoteInput = Omit<
  Quote,
  "id" | "savedDate" | "collected" | "favorite" | "lastOpenedAt"
>;

export type SortKey = "recent" | "oldest" | "author" | "work" | "favorites";

export interface QuoteQueryParams {
  search?: string;
  sourceType?: string;
  author?: string;
  collection?: string;
  tag?: string;
  favorite?: "true" | "false";
  dateFrom?: string;
  dateTo?: string;
  sort?: SortKey;
  page?: number;
  limit?: number;
}

export interface QuotePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface QuoteListResponse {
  items: Quote[];
  pagination: QuotePagination;
}

export interface QuoteStats {
  total: number;
  favorites: number;
  reflections: number;
  collections: number;
}

export interface CollectionInfo {
  name: string;
  count: number;
  preview?: string;
}

export interface QuoteMeta {
  collections: CollectionInfo[];
  tags: string[];
  authors: string[];
}

export interface QuoteContextInfo {
  prevId: string | null;
  nextId: string | null;
  position: number;
  total: number;
}
