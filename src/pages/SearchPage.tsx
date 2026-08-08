import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuotes } from "../store/quotes";
import SourceChip from "../components/SourceChip";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import { useDebounce } from "../utils/useDebounce";
import { SearchIcon, XIcon, ArrowRightIcon } from "../components/icons";
import { formatShort } from "../utils/format";
import type { Quote } from "../types";

export default function SearchPage() {
  const { fetchQuotes, allTags } = useQuotes();
  const [params, setParams] = useSearchParams();
  const tag = params.get("tag");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 200);
  const [results, setResults] = useState<Quote[]>([]);
  const [recent, setRecent] = useState<Quote[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const needle = debouncedQuery.trim();
    if (!needle && !tag) {
      setResults([]);
      setSearched(false);
      return;
    }
    let active = true;
    setSearching(true);
    fetchQuotes({
      search: needle || undefined,
      tag: tag || undefined,
      sort: "recent",
      limit: 100,
    })
      .then((res) => {
        if (!active) return;
        setResults(res.items);
        setSearched(true);
      })
      .catch(() => {
        if (!active) return;
        setResults([]);
        setSearched(true);
      })
      .finally(() => {
        if (active) setSearching(false);
      });
    return () => {
      active = false;
    };
  }, [debouncedQuery, tag, fetchQuotes]);

  useEffect(() => {
    let active = true;
    fetchQuotes({ sort: "recent", limit: 3 })
      .then((res) => {
        if (active) setRecent(res.items);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [fetchQuotes]);

  const clearTag = () => {
    const next = new URLSearchParams(params);
    next.delete("tag");
    setParams(next, { replace: true });
  };

  const showResults = query.trim() !== "" || !!tag || searched;

  return (
    <div>
      <header className="animate-rise">
        <p className="eyebrow">Search</p>
        <h1 className="mt-2 font-serif text-[40px] leading-none tracking-tight text-ink sm:text-[46px]">
          Find a line
        </h1>
        <div className="group relative mt-6 max-w-2xl">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-faint transition-colors duration-200 group-focus-within:text-cyan" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the words you kept…"
            autoFocus
            className="input py-4 pl-11 text-[16px]!"
          />
        </div>
      </header>

      {tag && (
        <div className="animate-rise mt-4 flex items-center gap-2">
          <span className="eyebrow">Tag</span>
          <span className="chip border-accent/30 bg-accent-soft text-accent-deep">
            #{tag}
          </span>
          <button
            type="button"
            onClick={clearTag}
            className="inline-flex items-center gap-1 text-xs text-ink-soft transition hover:text-ink"
          >
            <XIcon className="h-3.5 w-3.5" />
            Clear
          </button>
        </div>
      )}

      {showResults ? (
        searching ? (
          <div className="card mt-8 max-w-3xl">
            <Loader copy="Searching your lines…" />
          </div>
        ) : results.length > 0 ? (
          <div
            key={`${debouncedQuery}|${tag ?? ""}`}
            className="animate-results mt-8 max-w-3xl space-y-3"
          >
            {results.map((q) => (
              <Link
                key={q.id}
                to={`/quotes/${q.id}`}
                className="card card-hover group flex items-center justify-between gap-6 px-6 py-5 hover:border-border-strong"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <SourceChip type={q.sourceType} />
                    <span className="text-[11px] tracking-wide text-ink-faint">
                      {formatShort(q.savedDate)}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-2 font-serif text-[18px] leading-relaxed text-ink">
                    “{q.text}”
                  </p>
                  <p className="mt-2 truncate text-xs text-ink-faint">
                    {[q.author, q.work, ...(q.collections ?? [])]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <ArrowRightIcon className="h-5 w-5 shrink-0 -translate-x-1 text-ink-faint opacity-70 transition-all duration-300 group-hover:translate-x-0 group-hover:text-cyan group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-8 max-w-3xl">
            <EmptyState
              title="Nothing found."
              body="No saved line matches that yet. Try a different word or a shorter phrase."
            />
          </div>
        )
      ) : (
        <>
          <section
            className="animate-rise mt-10"
            style={{ animationDelay: "80ms" }}
          >
            <p className="eyebrow mb-4">Browse by tag</p>
            <div className="flex flex-wrap gap-2">
              {allTags.map((t) => (
                <Link
                  key={t}
                  to={`/search?tag=${encodeURIComponent(t)}`}
                  className={`chip hover:border-accent/50 hover:text-accent-deep ${
                    tag === t
                      ? "border-accent/30 bg-accent-soft text-accent-deep"
                      : ""
                  }`}
                >
                  #{t}
                </Link>
              ))}
            </div>
          </section>

          <section
            className="animate-rise mt-12"
            style={{ animationDelay: "140ms" }}
          >
            <p className="eyebrow mb-4">Recently saved</p>
            <div className="max-w-3xl space-y-3">
              {recent.map((q, i) => (
                <div
                  key={q.id}
                  className="animate-card-in"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <Link
                    to={`/quotes/${q.id}`}
                    className="card card-hover group flex items-center justify-between gap-6 px-6 py-5 hover:border-border-strong"
                  >
                    <div className="min-w-0">
                      <p className="line-clamp-1 font-serif text-[18px] text-ink">
                        “{q.text}”
                      </p>
                      <p className="mt-1.5 text-xs text-ink-faint">
                        {[q.author, q.work].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <ArrowRightIcon className="h-5 w-5 shrink-0 -translate-x-1 text-ink-faint opacity-70 transition-all duration-300 group-hover:translate-x-0 group-hover:text-cyan group-hover:opacity-100" />
                  </Link>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
