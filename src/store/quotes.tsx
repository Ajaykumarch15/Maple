import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Quote, QuoteInput } from "../types";
import { seedQuotes } from "../data/quotes";

interface QuotesContextValue {
  quotes: Quote[];
  addQuote: (data: QuoteInput, id?: string) => Quote;
  toggleCollected: (id: string) => void;
  deleteQuote: (id: string) => void;
  getQuote: (id: string) => Quote | undefined;
  collections: string[];
  allTags: string[];
}

const QuotesContext = createContext<QuotesContextValue | null>(null);

const STORAGE_KEY = "margin:quotes:v1";

function load(): Quote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as Quote[];
    }
  } catch {
    /* fall through to seed */
  }
  return seedQuotes;
}

export function QuotesProvider({ children }: { children: ReactNode }) {
  const [quotes, setQuotes] = useState<Quote[]>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
    } catch {
      /* storage unavailable */
    }
  }, [quotes]);

  const addQuote = (data: QuoteInput, id?: string): Quote => {
    const existing = id ? quotes.find((q) => q.id === id) : undefined;
    const result: Quote = existing
      ? { ...existing, ...data }
      : { ...data, id: crypto.randomUUID(), savedDate: new Date().toISOString() };
    setQuotes((qs) =>
      existing
        ? qs.map((q) => (q.id === id ? result : q))
        : [result, ...qs],
    );
    return result;
  };

  const toggleCollected = (id: string) => {
    setQuotes((qs) =>
      qs.map((q) => (q.id === id ? { ...q, collected: !q.collected } : q)),
    );
  };

  const deleteQuote = (id: string) => {
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
