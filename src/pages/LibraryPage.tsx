import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuotes } from "../store/quotes";
import QuoteCard from "../components/QuoteCard";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import { useDebounce } from "../utils/useDebounce";
import { SOURCE_TYPES } from "../types";
import type { QuoteQueryParams, SourceType } from "../types";
import {
  ChevronDownIcon,
  CollectionsIcon,
  HeartIcon,
  PlusIcon,
  SearchIcon,
  SlidersIcon,
  TagIcon,
  XIcon,
} from "../components/icons";

type SortKey = "recent" | "oldest" | "author" | "work" | "favorites";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "recent", label: "Recently saved" },
  { value: "oldest", label: "Oldest" },
  { value: "author", label: "A – Z by author" },
  { value: "work", label: "A – Z by work" },
  { value: "favorites", label: "Favorites first" },
];

const PAGE_SIZE = 24;

interface FilterMenuProps {
  label: string;
  icon: React.ReactNode;
  options: string[];
  selected?: string;
  onSelect: (value: string | undefined) => void;
}

function FilterMenu({ label, icon, options, selected, onSelect }: FilterMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={
          selected
            ? "chip border-accent bg-accent-soft text-accent-deep"
            : "chip hover:border-ink-soft/40 hover:text-ink"
        }
      >
        {icon}
        {label}
        <ChevronDownIcon
          className={`h-3 w-3 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="animate-pop glass absolute left-0 top-full z-30 mt-2 max-h-80 w-72 overflow-y-auto rounded-2xl border border-border p-2 shadow-pop">
          {options.length === 0 ? (
            <p className="px-3 py-3 text-[13px] text-ink-faint">Nothing here yet.</p>
          ) : (
            options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onSelect(selected === opt ? undefined : opt);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-[13px] transition-colors duration-150 ${
                  selected === opt
                    ? "bg-accent-soft font-medium text-accent-deep"
                    : "text-ink-soft hover:bg-card hover:text-ink"
                }`}
              >
                <span className="truncate">{opt}</span>
                {selected === opt && <XIcon className="h-3.5 w-3.5 shrink-0" />}
              </button>
            ))
          )}
          {selected && (
            <button
              type="button"
              onClick={() => {
                onSelect(undefined);
                setOpen(false);
              }}
              className="mt-1 flex w-full items-center gap-2 rounded-xl border-t border-border px-3 py-2 text-left text-[13px] text-ink-soft transition-colors duration-150 hover:text-ink"
            >
              <XIcon className="h-3.5 w-3.5" /> Clear {label.toLowerCase()}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function LibraryPage() {
  const {
    quotes,
    loading,
    toggleFavorite,
    loadLibrary,
    goToPage,
    total,
    page,
    totalPages,
    limit,
    collections: allCollections,
    allTags,
    meta,
  } = useQuotes();
  const [params, setParams] = useSearchParams();

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 200);
  const [view, setView] = useState<"all" | "favorites">("all");
  const [collection, setCollection] = useState<string | undefined>(
    params.get("collection") ?? undefined,
  );
  const [tag, setTag] = useState<string | undefined>(
    params.get("tag") ?? undefined,
  );
  const [source, setSource] = useState<"All" | SourceType>("All");
  const [author, setAuthor] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    setCollection(params.get("collection") ?? undefined);
  }, [params]);

  useEffect(() => {
    setTag(params.get("tag") ?? undefined);
  }, [params]);

  const setCollectionFilter = (value: string | undefined) => {
    setCollection(value);
    const next = new URLSearchParams(params);
    if (value) next.set("collection", value);
    else next.delete("collection");
    setParams(next, { replace: true });
  };

  const setTagFilter = (value: string | undefined) => {
    setTag(value);
    const next = new URLSearchParams(params);
    if (value) next.set("tag", value);
    else next.delete("tag");
    setParams(next, { replace: true });
  };

  const allAuthors = useMemo(
    () => (meta ? meta.authors : []),
    [meta],
  );

  const queryFor = useMemo<QuoteQueryParams>(() => {
    const trimmedSearch = debouncedQuery.trim();
    return {
      search: trimmedSearch || undefined,
      sourceType: source === "All" ? undefined : source,
      author: author.trim() || undefined,
      collection,
      tag,
      favorite: view === "favorites" ? "true" : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      sort,
      page: 1,
      limit: PAGE_SIZE,
    };
  }, [debouncedQuery, source, author, collection, tag, view, dateFrom, dateTo, sort]);

  useEffect(() => {
    loadLibrary(queryFor);
  }, [queryFor, loadLibrary]);

  const activeCount = [
    view === "favorites",
    !!collection,
    !!tag,
    source !== "All",
    author.trim() !== "",
    !!dateFrom,
    !!dateTo,
  ].filter(Boolean).length;

  const clearAll = () => {
    setView("all");
    setCollectionFilter(undefined);
    setTagFilter(undefined);
    setSource("All");
    setAuthor("");
    setDateFrom("");
    setDateTo("");
  };

  const chips = (
    <>
      {view === "favorites" && (
        <span className="chip border-accent/40 bg-accent-soft text-accent-deep">
          Favorites
          <button
            type="button"
            onClick={() => setView("all")}
            aria-label="Remove favorites filter"
          >
            <XIcon className="h-3 w-3" />
          </button>
        </span>
      )}
      {collection && (
        <span className="chip border-accent/40 bg-accent-soft text-accent-deep">
          {collection}
          <button
            type="button"
            onClick={() => setCollectionFilter(undefined)}
            aria-label="Remove collection filter"
          >
            <XIcon className="h-3 w-3" />
          </button>
        </span>
      )}
      {tag && (
        <span className="chip border-accent/40 bg-accent-soft text-accent-deep">
          #{tag}
          <button
            type="button"
            onClick={() => setTagFilter(undefined)}
            aria-label="Remove tag filter"
          >
            <XIcon className="h-3 w-3" />
          </button>
        </span>
      )}
      {source !== "All" && (
        <span className="chip hover:border-ink-soft/40">
          {source}
          <button type="button" onClick={() => setSource("All")} aria-label="Remove source filter">
            <XIcon className="h-3 w-3" />
          </button>
        </span>
      )}
      {author.trim() !== "" && (
        <span className="chip hover:border-ink-soft/40">
          {author}
          <button type="button" onClick={() => setAuthor("")} aria-label="Remove author filter">
            <XIcon className="h-3 w-3" />
          </button>
        </span>
      )}
      {(dateFrom || dateTo) && (
        <span className="chip hover:border-ink-soft/40">
          {dateFrom ? dateFrom.split("-").reverse().join("/") : "any"} –{" "}
          {dateTo ? dateTo.split("-").reverse().join("/") : "today"}
          <button
            type="button"
            onClick={() => {
              setDateFrom("");
              setDateTo("");
            }}
            aria-label="Remove date filter"
          >
            <XIcon className="h-3 w-3" />
          </button>
        </span>
      )}
    </>
  );

  const emptyLibrary = total === 0 && activeCount === 0;
  const emptyTitle = emptyLibrary
    ? "Nothing here yet."
    : view === "favorites"
      ? "No favorites yet."
      : collection
        ? "This collection is waiting for its first line."
        : "No lines found.";
  const emptyBody = emptyLibrary
    ? "Start keeping the lines you don't want to lose — your first save will appear here."
    : view === "favorites"
      ? "Tap the heart on any quote to keep it close."
      : collection
        ? "Save a line into this collection and it will appear here."
        : "Try another word, author, tag, or collection.";

  const shownStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const shownEnd = Math.min(page * limit, total);
  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  return (
    <div>
      <header className="animate-rise flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">
            {total} {total === 1 ? "line" : "lines"} kept
          </p>
          <h1 className="mt-2 font-serif text-[40px] leading-none tracking-tight text-ink sm:text-[46px]">
            Your Library
          </h1>
          <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-ink-soft">
            A collection of lines worth keeping.
          </p>
        </div>
        <Link to="/add" className="btn-primary">
          <PlusIcon className="h-4 w-4" />
          New Save
        </Link>
      </header>

      <div className="animate-rise mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="group relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-faint transition-colors duration-200 group-focus-within:text-accent" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search quotes, authors, works, reflections, tags…"
            className="input pl-11 pr-11"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-ink-faint transition hover:bg-card hover:text-ink"
            >
              <XIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="relative shrink-0">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="appearance-none rounded-full border border-border-strong bg-elevated py-2.5 pl-4 pr-9 text-[13px] font-medium text-ink-soft outline-none transition hover:border-ink-soft/40 hover:text-ink focus:border-accent/60 focus:ring-4 focus:ring-accent/20"
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

      <div className="animate-rise mt-4 flex flex-wrap items-center gap-2">
        <div className="flex rounded-full border border-border bg-card p-1">
          <button
            type="button"
            onClick={() => setView("all")}
            className={`rounded-full px-4 py-1.5 text-[12px] font-medium transition ${
              view === "all"
                ? "bg-gradient-primary text-white shadow-[0_6px_16px_-8px_var(--mood-glow-strong)]"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setView("favorites")}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] font-medium transition ${
              view === "favorites"
                ? "bg-gradient-primary text-white shadow-[0_6px_16px_-8px_var(--mood-glow-strong)]"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            <HeartIcon
              className={`h-3.5 w-3.5 ${view === "favorites" ? "fill-current" : ""}`}
            />
            Favorites
          </button>
        </div>

        <FilterMenu
          label="Collections"
          icon={<CollectionsIcon className="h-3.5 w-3.5" />}
          options={allCollections}
          selected={collection}
          onSelect={setCollectionFilter}
        />
        <FilterMenu
          label="Tags"
          icon={<TagIcon className="h-3.5 w-3.5" />}
          options={allTags}
          selected={tag}
          onSelect={setTagFilter}
        />

        <button
          type="button"
          onClick={() => setShowPanel((s) => !s)}
          className={`chip ${
            showPanel || activeCount > 0
              ? "border-accent bg-accent-soft text-accent-deep"
              : "hover:border-ink-soft/40 hover:text-ink"
          }`}
        >
          <SlidersIcon className="h-3.5 w-3.5" />
          Filter
          {activeCount > 0 && (
            <span className="bg-gradient-primary inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold text-white">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {showPanel && (
        <div className="animate-rise glass mt-3 rounded-2xl border border-border p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="eyebrow">Refine your library</p>
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1 text-[12px] text-ink-soft transition hover:text-ink"
            >
              <XIcon className="h-3.5 w-3.5" /> Clear all
            </button>
          </div>

          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <span className="eyebrow block">Source</span>
              <div className="mt-3 flex flex-wrap gap-2">
                {(["All", ...SOURCE_TYPES] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSource(t)}
                    className={
                      source === t
                        ? "chip border-transparent bg-gradient-primary text-white shadow-[0_6px_16px_-8px_var(--mood-glow-strong)]"
                        : "chip hover:border-ink-soft/40 hover:text-ink"
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="filter-author" className="eyebrow block">
                Author / speaker
              </label>
              <input
                id="filter-author"
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                list="filter-authors"
                placeholder="Any author…"
                className="input mt-3"
              />
              <datalist id="filter-authors">
                {allAuthors.map((a) => (
                  <option key={a} value={a} />
                ))}
              </datalist>
            </div>

            <div>
              <label htmlFor="filter-collection" className="eyebrow block">
                Collection
              </label>
              <input
                id="filter-collection"
                type="text"
                value={collection ?? ""}
                onChange={(e) =>
                  setCollection(e.target.value.trim() ? e.target.value : undefined)
                }
                list="filter-collections"
                placeholder="Any collection…"
                className="input mt-3"
              />
              <datalist id="filter-collections">
                {allCollections.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div>
              <label htmlFor="filter-tag" className="eyebrow block">
                Tag
              </label>
              <input
                id="filter-tag"
                type="text"
                value={tag ?? ""}
                onChange={(e) => setTag(e.target.value.trim() ? e.target.value : undefined)}
                list="filter-tags"
                placeholder="Any tag…"
                className="input mt-3"
              />
              <datalist id="filter-tags">
                {allTags.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="filter-from" className="eyebrow block">
                  From
                </label>
                <input
                  id="filter-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="input mt-3"
                />
              </div>
              <div>
                <label htmlFor="filter-to" className="eyebrow block">
                  To
                </label>
                <input
                  id="filter-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="input mt-3"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeCount > 0 && (
        <div className="animate-rise mt-3 flex flex-wrap items-center gap-2">
          {chips}
        </div>
      )}

      {loading ? (
        <div className="card mt-8">
          <Loader copy="Gathering your lines…" />
        </div>
      ) : quotes.length > 0 ? (
        <>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {quotes.map((quote, i) => (
              <div
                key={quote.id}
                className="animate-card-in"
                style={{ animationDelay: `${Math.min(i, 11) * 45}ms` }}
              >
                <QuoteCard
                  quote={quote}
                  onToggleFavorite={(id) => {
                    toggleFavorite(id).catch((err) =>
                      console.error("Failed to toggle favorite", err),
                    );
                  }}
                />
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/80 pt-6 sm:flex-row">
            <p className="text-[13px] text-ink-faint">
              Showing {shownStart}–{shownEnd} of {total}{" "}
              {total === 1 ? "line" : "lines"}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!hasPrevious}
                onClick={() => goToPage(page - 1)}
                className="chip hover:border-ink-soft/40 hover:text-ink disabled:cursor-default disabled:opacity-35 disabled:hover:border-border disabled:hover:text-ink-soft"
              >
                Previous
              </button>
              <span className="text-[13px] text-ink-soft">
                Page {page} of {Math.max(totalPages, 1)}
              </span>
              <button
                type="button"
                disabled={!hasNext}
                onClick={() => goToPage(page + 1)}
                className="chip hover:border-ink-soft/40 hover:text-ink disabled:cursor-default disabled:opacity-35 disabled:hover:border-border disabled:hover:text-ink-soft"
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="mt-8">
          <EmptyState
            title={emptyTitle}
            body={emptyBody}
            ctaLabel={emptyLibrary ? "New Save" : undefined}
            ctaTo="/add"
          />
        </div>
      )}
    </div>
  );
}
