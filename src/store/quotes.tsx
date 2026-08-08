import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import type {
  Quote,
  QuoteContextInfo,
  QuoteInput,
  QuoteListResponse,
  QuoteMeta,
  QuoteQueryParams,
  QuoteStats,
} from "../types";

interface QuotesContextValue {
  quotes: Quote[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  loadLibrary: (query: QuoteQueryParams) => void;
  goToPage: (page: number) => void;
  fetchQuotes: (query: QuoteQueryParams) => Promise<QuoteListResponse>;
  getQuote: (id: string) => Promise<Quote | undefined>;
  getQuoteContext: (id: string) => Promise<QuoteContextInfo>;
  getRediscover: (excludeId?: string) => Promise<Quote | null>;
  stats: QuoteStats | null;
  statsReady: boolean;
  meta: QuoteMeta | null;
  refreshStats: () => void;
  refreshMeta: () => void;
  addQuote: (data: QuoteInput, id?: string) => Promise<Quote>;
  updateQuote: (id: string, patch: Partial<Quote>) => Promise<Quote>;
  toggleCollected: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  setCollections: (id: string, collections: string[]) => Promise<void>;
  touchQuote: (id: string) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  collections: string[];
  allTags: string[];
}

const QuotesContext = createContext<QuotesContextValue | null>(null);

const API_BASE = (import.meta.env.VITE_API_BASE || "/api").replace(/\/+$/, "");
const API = `${API_BASE}/quotes`;

const DEFAULT_LIMIT = 30;

class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new ApiError(`API request failed with status ${res.status}`, res.status);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

function buildQuery(query: QuoteQueryParams): string {
  const sp = new URLSearchParams();
  const entries: [string, string | number | undefined][] = [
    ["search", query.search],
    ["sourceType", query.sourceType],
    ["author", query.author],
    ["collection", query.collection],
    ["tag", query.tag],
    ["favorite", query.favorite],
    ["dateFrom", query.dateFrom],
    ["dateTo", query.dateTo],
    ["sort", query.sort],
    ["page", query.page],
    ["limit", query.limit],
  ];
  for (const [key, value] of entries) {
    if (value === undefined || value === null || value === "") continue;
    sp.set(key, String(value));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export function QuotesProvider({ children }: { children: ReactNode }) {
  const [library, setLibrary] = useState({
    items: [] as Quote[],
    page: 1,
    total: 0,
    totalPages: 1,
    limit: DEFAULT_LIMIT,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<QuoteStats | null>(null);
  const [statsReady, setStatsReady] = useState(false);
  const [meta, setMeta] = useState<QuoteMeta | null>(null);

  const currentLibraryQueryRef = useRef<QuoteQueryParams>({});
  const requestSeq = useRef(0);
  const quoteCacheRef = useRef(new Map<string, Quote>());
  const libraryRef = useRef(library);

  useEffect(() => {
    libraryRef.current = library;
  }, [library]);

  const applyLocalQuote = useCallback((updated: Quote) => {
    quoteCacheRef.current.set(updated.id, updated);
    setLibrary((s) => ({
      ...s,
      items: s.items.map((q) => (q.id === updated.id ? updated : q)),
    }));
  }, []);

  const findLocalQuote = useCallback(
    (id: string): Quote | undefined =>
      libraryRef.current.items.find((q) => q.id === id) ??
      quoteCacheRef.current.get(id),
    [],
  );

  const fetchQuotes = useCallback(async (query: QuoteQueryParams) => {
    return request<QuoteListResponse>(`${API}${buildQuery(query)}`);
  }, []);

  const loadLibrary = useCallback(
    (query: QuoteQueryParams) => {
      currentLibraryQueryRef.current = query;
      const seq = ++requestSeq.current;
      setLoading(true);
      setError(null);
      fetchQuotes(query)
        .then((res) => {
          if (seq !== requestSeq.current) return;
          setLibrary({
            items: res.items,
            page: res.pagination.page,
            total: res.pagination.total,
            totalPages: res.pagination.totalPages,
            limit: res.pagination.limit,
          });
        })
        .catch((err) => {
          if (seq !== requestSeq.current) return;
          setError(err instanceof Error ? err.message : "Failed to load quotes");
        })
        .finally(() => {
          if (seq === requestSeq.current) setLoading(false);
        });
    },
    [fetchQuotes],
  );

  const goToPage = useCallback(
    (page: number) => {
      loadLibrary({ ...currentLibraryQueryRef.current, page });
    },
    [loadLibrary],
  );

  const refreshStats = useCallback(async () => {
    try {
      setStats(await request<QuoteStats>(`${API}/stats`));
    } catch (err) {
      console.error("Failed to load stats", err);
    } finally {
      setStatsReady(true);
    }
  }, []);

  const refreshMeta = useCallback(async () => {
    try {
      setMeta(await request<QuoteMeta>(`${API}/meta`));
    } catch (err) {
      console.error("Failed to load meta", err);
    }
  }, []);

  useEffect(() => {
    refreshStats();
    refreshMeta();
  }, [refreshStats, refreshMeta]);

  const getQuote = useCallback(async (id: string) => {
    const local = findLocalQuote(id);
    if (local) return local;
    try {
      const quote = await request<Quote>(`${API}/${id}`);
      quoteCacheRef.current.set(id, quote);
      return quote;
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return undefined;
      throw err;
    }
  }, [findLocalQuote]);

  const getQuoteContext = useCallback(async (id: string) => {
    return request<QuoteContextInfo>(`${API}/${id}/context`);
  }, []);

  const getRediscover = useCallback(async (excludeId?: string) => {
    const q = excludeId ? `?exclude=${encodeURIComponent(excludeId)}` : "";
    const res = await request<{ quote: Quote | null }>(`${API}/rediscover${q}`);
    return res.quote;
  }, []);

  const updateQuote = useCallback(
    async (id: string, patch: Partial<Quote>) => {
      const updated = await request<Quote>(`${API}/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      applyLocalQuote(updated);
      if ("collections" in patch) refreshMeta();
      return updated;
    },
    [applyLocalQuote, refreshMeta],
  );

  const toggleCollected = useCallback(
    async (id: string) => {
      const current = findLocalQuote(id);
      if (!current) return;
      const optimistic = { ...current, collected: !current.collected };
      applyLocalQuote(optimistic);
      try {
        await updateQuote(id, { collected: optimistic.collected });
      } catch (err) {
        applyLocalQuote(current);
        throw err;
      }
    },
    [findLocalQuote, applyLocalQuote, updateQuote],
  );

  const toggleFavorite = useCallback(
    async (id: string) => {
      const current = findLocalQuote(id);
      if (!current) return;
      const optimistic = { ...current, favorite: !current.favorite };
      applyLocalQuote(optimistic);
      try {
        await updateQuote(id, { favorite: optimistic.favorite });
        refreshStats();
        if (currentLibraryQueryRef.current.favorite !== undefined) {
          loadLibrary(currentLibraryQueryRef.current);
        }
      } catch (err) {
        applyLocalQuote(current);
        throw err;
      }
    },
    [findLocalQuote, applyLocalQuote, updateQuote, refreshStats, loadLibrary],
  );

  const setCollections = useCallback(
    async (id: string, collections: string[]) => {
      const current = findLocalQuote(id);
      if (current) applyLocalQuote({ ...current, collections });
      try {
        await updateQuote(id, { collections });
      } catch (err) {
        if (current) applyLocalQuote(current);
        throw err;
      }
    },
    [findLocalQuote, applyLocalQuote, updateQuote],
  );

  const touchQuote = useCallback(
    async (id: string) => {
      await updateQuote(id, { lastOpenedAt: new Date().toISOString() });
    },
    [updateQuote],
  );

  const addQuote = useCallback(
    async (data: QuoteInput, id?: string): Promise<Quote> => {
      let created: Quote;
      if (id) {
        created = await updateQuote(id, data);
      } else {
        created = await request<Quote>(API, {
          method: "POST",
          body: JSON.stringify(data),
        });
        quoteCacheRef.current.set(created.id, created);
      }
      refreshStats();
      refreshMeta();
      return created;
    },
    [updateQuote, refreshStats, refreshMeta],
  );

  const deleteQuote = useCallback(
    async (id: string) => {
      await request<never>(`${API}/${id}`, { method: "DELETE" });
      quoteCacheRef.current.delete(id);
      setLibrary((s) => {
        const total = Math.max(0, s.total - 1);
        return {
          ...s,
          items: s.items.filter((q) => q.id !== id),
          total,
          totalPages: Math.max(1, Math.ceil(total / s.limit)),
        };
      });
      refreshStats();
      refreshMeta();
    },
    [refreshStats, refreshMeta],
  );

  const collections = useMemo(
    () => (meta ? meta.collections.map((c) => c.name) : []),
    [meta],
  );

  const allTags = useMemo(() => (meta ? meta.tags : []), [meta]);

  const value: QuotesContextValue = {
    quotes: library.items,
    loading,
    error,
    total: library.total,
    page: library.page,
    totalPages: library.totalPages,
    limit: library.limit,
    loadLibrary,
    goToPage,
    fetchQuotes,
    getQuote,
    getQuoteContext,
    getRediscover,
    stats,
    statsReady,
    meta,
    refreshStats,
    refreshMeta,
    addQuote,
    updateQuote,
    toggleCollected,
    toggleFavorite,
    setCollections,
    touchQuote,
    deleteQuote,
    collections,
    allTags,
  };

  return (
    <QuotesContext.Provider value={value}>{children}</QuotesContext.Provider>
  );
}

export function useQuotes(): QuotesContextValue {
  const ctx = useContext(QuotesContext);
  if (!ctx) throw new Error("useQuotes must be used within a QuotesProvider");
  return ctx;
}
