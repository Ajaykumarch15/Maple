import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuotes } from "../store/quotes";
import QuoteCard from "../components/QuoteCard";
import EmptyState from "../components/EmptyState";
import { SearchIcon, XIcon, ChevronDownIcon } from "../components/icons";
import { SOURCE_TYPES } from "../types";
import type { SourceType } from "../types";

type SortKey = "newest" | "oldest" | "az";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "az", label: "A – Z" },
];

export default function LibraryPage() {
  const { quotes, loading } = useQuotes();
  const [params, setParams] = useSearchParams();
  const collection = params.get("collection") ?? undefined;

  const [query, setQuery] = useState("");
  const [type, setType] = useState<"All" | SourceType>("All");
  const [sort, setSort] = useState<SortKey>("newest");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    let result = quotes.filter((q) => {
      if (collection && q.collection !== collection) return false;
      if (type !== "All" && q.sourceType !== type) return false;
      if (!needle) return true;
      return [q.text, q.author, q.work, q.reflection, ...q.tags]
        .filter(Boolean)
        .some((field) => (field as string).toLowerCase().includes(needle));
    });

    result = [...result].sort((a, b) => {
      if (sort === "az") return (a.text || "").localeCompare(b.text || "");
      if (sort === "oldest") return a.savedDate.localeCompare(b.savedDate);
      return b.savedDate.localeCompare(a.savedDate);
    });
    return result;
  }, [quotes, collection, type, query, sort]);

  const clearCollection = () => {
    const next = new URLSearchParams(params);
    next.delete("collection");
    setParams(next, { replace: true });
  };

  const chips: ("All" | SourceType)[] = ["All", ...SOURCE_TYPES];

  return (
    <div>
      <header className="animate-rise flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">
            {filtered.length} {filtered.length === 1 ? "line" : "lines"} kept
          </p>
          <h1 className="mt-2 font-serif text-[40px] leading-none tracking-tight text-ink sm:text-[46px]">
            Library
          </h1>
        </div>

        <div className="relative w-full sm:w-80">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-faint" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your lines…"
            className="input pl-11"
          />
        </div>
      </header>

      <div className="animate-rise mt-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setType(c)}
              className={
                type === c
                  ? "chip border-accent bg-accent text-white hover:border-accent"
                  : "chip hover:border-ink-soft/40 hover:text-ink"
              }
            >
              {c}
            </button>
          ))}
        </div>

        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="appearance-none rounded-full border border-border bg-card py-2 pl-4 pr-9 text-[13px] font-medium text-ink-soft outline-none transition hover:border-ink-soft/40 hover:text-ink focus:ring-4 focus:ring-accent/15"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        </div>
      </div>

      {collection && (
        <div className="animate-rise mt-4 flex items-center gap-2">
          <span className="eyebrow">Collection</span>
          <span className="chip border-accent/30 bg-accent-soft text-accent-deep">
            {collection}
          </span>
          <button
            type="button"
            onClick={clearCollection}
            className="inline-flex items-center gap-1 text-xs text-ink-soft transition hover:text-ink"
          >
            <XIcon className="h-3.5 w-3.5" />
            Clear
          </button>
        </div>
      )}

      {loading ? (
        <div className="card mt-8 flex items-center justify-center py-24">
          <p className="font-serif text-xl text-ink-soft">
            Gathering your lines…
          </p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((quote) => (
            <QuoteCard key={quote.id} quote={quote} />
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            title={
              query || type !== "All" ? "Nothing matches that." : "The library is quiet."
            }
            body={
              query || type !== "All"
                ? "Try a different word, or clear the filters to see everything you've kept."
                : "Save your first line worth keeping and it will appear here."
            }
            ctaLabel="New save"
            ctaTo="/add"
          />
        </div>
      )}
    </div>
  );
}
