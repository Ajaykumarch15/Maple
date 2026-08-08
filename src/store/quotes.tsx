import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { Quote, QuoteInput } from "../types";

interface QuotesContextValue {
  quotes: Quote[];
  loading: boolean;
  addQuote: (data: QuoteInput, id?: string) => Promise<Quote>;
  toggleCollected: (id: string) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  getQuote: (id: string) => Quote | undefined;
  collections: string[];
  allTags: string[];
}

const QuotesContext = createContext<QuotesContextValue | null>(null);

const API = "/api/quotes";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API request failed with status ${res.status}`);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export function QuotesProvider({ children }: { children: ReactNode }) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    request<Quote[]>(API)
      .then((data) => {
        if (!cancelled) setQuotes(data);
      })
      .catch((err) => {
        console.error("Failed to load quotes", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const addQuote = async (data: QuoteInput, id?: string): Promise<Quote> => {
    if (id) {
      const updated = await request<Quote>(`${API}/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      setQuotes((qs) => qs.map((q) => (q.id === id ? updated : q)));
      return updated;
    }
    const created = await request<Quote>(API, {
      method: "POST",
      body: JSON.stringify(data),
    });
    setQuotes((qs) => [created, ...qs]);
    return created;
  };

  const toggleCollected = async (id: string) => {
    const current = quotes.find((q) => q.id === id);
    if (!current) return;
    const updated = await request<Quote>(`${API}/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ collected: !current.collected }),
    });
    setQuotes((qs) => qs.map((q) => (q.id === id ? updated : q)));
  };

  const deleteQuote = async (id: string) => {
    await request<never>(`${API}/${id}`, { method: "DELETE" });
    setQuotes((qs) => qs.filter((q) => q.id !== id));
  };

  const getQuote = (id: string) => quotes.find((q) => q.id === id);

  const collections = useMemo(
    () =>
      Array.from(
        new Set(quotes.map((q) => q.collection).filter(Boolean)),
      ) as string[],
    [quotes],
  );

  const allTags = useMemo(
    () =>
      Array.from(new Set(quotes.flatMap((q) => q.tags))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [quotes],
  );

  const value: QuotesContextValue = {
    quotes,
    loading,
    addQuote,
    toggleCollected,
    deleteQuote,
    getQuote,
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
