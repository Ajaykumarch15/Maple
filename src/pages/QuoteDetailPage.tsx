import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toPng } from "html-to-image";
import { useQuotes } from "../store/quotes";
import SourceChip from "../components/SourceChip";
import QuoteCard from "../components/QuoteCard";
import EmptyState from "../components/EmptyState";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BookmarkIcon,
  DownloadIcon,
  EditIcon,
  HeartIcon,
  PlusIcon,
  ShuffleIcon,
  TrashIcon,
  XIcon,
} from "../components/icons";
import { countWords, formatDate, slugify } from "../utils/format";
import type { Quote, QuoteContextInfo } from "../types";

export default function QuoteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getQuote,
    getQuoteContext,
    fetchQuotes,
    toggleCollected,
    toggleFavorite,
    deleteQuote,
    setCollections,
    touchQuote,
  } = useQuotes();
  const [quote, setQuote] = useState<Quote | null | undefined>(undefined);
  const [context, setContext] = useState<QuoteContextInfo | null>(null);
  const [related, setRelated] = useState<Quote[]>([]);
  const [exporting, setExporting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [collectionInput, setCollectionInput] = useState("");
  const exportRef = useRef<HTMLDivElement>(null);
  const touchedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setQuote(undefined);
    setContext(null);
    setRelated([]);

    getQuote(id)
      .then((q) => {
        if (!active) return;
        if (!q) {
          setQuote(null);
          return;
        }
        setQuote(q);
        const first = (q.collections ?? [])[0];
        if (!first) return;
        fetchQuotes({ collection: first, sort: "recent", limit: 12 })
          .then((res) => {
            if (active) setRelated(res.items.filter((r) => r.id !== q.id));
          })
          .catch(() => {});
      })
      .catch(() => {
        if (active) setQuote(null);
      });

    getQuoteContext(id)
      .then((c) => {
        if (active) setContext(c);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [id, getQuote, getQuoteContext, fetchQuotes]);

  useEffect(() => {
    if (!id || touchedRef.current === id) return;
    touchedRef.current = id;
    touchQuote(id).catch(() => {});
  }, [id, touchQuote]);

  const prev = context?.prevId ? { id: context.prevId } : undefined;
  const next = context?.nextId ? { id: context.nextId } : undefined;
  const position = context?.position ?? 0;
  const total = context?.total ?? 0;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      )
        return;
      if (e.key === "ArrowLeft" && prev) navigate(`/quotes/${prev.id}`);
      if (e.key === "ArrowRight" && next) navigate(`/quotes/${next.id}`);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, navigate]);

  const handleExport = async () => {
    const node = exportRef.current;
    if (!node || exporting || !quote) return;
    setExporting(true);
    try {
      await document.fonts?.ready;
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#faf8f5",
      });
      const a = document.createElement("a");
      a.download = `${slugify(quote?.author ?? "margin")}-${slugify(quote?.text ?? "quote")}.png`;
      a.href = dataUrl;
      a.click();
    } catch (err) {
      console.error("Failed to export image", err);
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!quote) return;
    try {
      await deleteQuote(quote.id);
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate("/library");
      }
    } catch (err) {
      console.error("Failed to delete quote", err);
    }
  };

  const handleToggleFavorite = async () => {
    if (!quote) return;
    const prevQuote = quote;
    setQuote({ ...quote, favorite: !quote.favorite });
    try {
      await toggleFavorite(quote.id);
    } catch (err) {
      setQuote(prevQuote);
      console.error("Failed to toggle favorite", err);
    }
  };

  const handleToggleCollected = async () => {
    if (!quote) return;
    const prevQuote = quote;
    setQuote({ ...quote, collected: !quote.collected });
    try {
      await toggleCollected(quote.id);
    } catch (err) {
      setQuote(prevQuote);
      console.error("Failed to toggle collect", err);
    }
  };

  const addCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote) return;
    const clean = collectionInput.trim();
    if (!clean) return;
    const next = Array.from(new Set([...(quote.collections ?? []), clean]));
    const prevQuote = quote;
    setCollectionInput("");
    setQuote({ ...quote, collections: next });
    try {
      await setCollections(quote.id, next);
    } catch (err) {
      setQuote(prevQuote);
      console.error("Failed to update collections", err);
    }
  };

  const removeCollection = async (name: string) => {
    if (!quote) return;
    const next = (quote.collections ?? []).filter((c) => c !== name);
    const prevQuote = quote;
    setQuote({ ...quote, collections: next });
    try {
      await setCollections(quote.id, next);
    } catch (err) {
      setQuote(prevQuote);
      console.error("Failed to update collections", err);
    }
  };

  const backButton = (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className="mb-8 inline-flex items-center gap-2 text-sm text-ink-soft transition hover:text-ink"
    >
      <ArrowLeftIcon className="h-4 w-4" /> Back
    </button>
  );

  if (quote === undefined) {
    return (
      <div>
        {backButton}
        <div className="flex items-center justify-center py-24">
          <p className="font-serif text-lg text-ink-soft">Lifting this line…</p>
        </div>
      </div>
    );
  }

  if (quote === null) {
    return (
      <div>
        {backButton}
        <EmptyState
          title="This line has drifted away."
          body="It may have been removed, or the link is no longer valid."
          ctaLabel="Go to library"
          ctaTo="/library"
        />
      </div>
    );
  }

  const favorite = !!quote.favorite;
  const collected = !!quote.collected;
  const words = countWords(quote.text);
  const relatedCount = related.length;

  return (
    <div>
      <div className="animate-rise flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-full px-1 py-1 text-sm text-ink-soft transition hover:text-ink"
        >
          <ArrowLeftIcon className="h-4 w-4" /> Back
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/rediscover", { state: { excludeId: quote.id } })}
            className="btn-ghost"
            title="Surprise me with another line"
          >
            <ShuffleIcon className="h-4 w-4" />
            Surprise me
          </button>
          <button
            type="button"
            onClick={handleToggleFavorite}
            className={`btn-ghost ${favorite ? "border-accent! text-accent-deep!" : ""}`}
          >
            <HeartIcon
              className={`h-4 w-4 ${favorite ? "fill-current text-accent" : ""}`}
            />
            {favorite ? "Favorited" : "Favorite"}
          </button>
          <Link to={`/add?edit=${quote.id}`} className="btn-ghost">
            <EditIcon className="h-4 w-4" />
            Edit
          </Link>

          <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />

          <button
            type="button"
            onClick={handleToggleCollected}
            className={`btn-ghost ${collected ? "border-accent! text-accent-deep!" : ""}`}
          >
            <BookmarkIcon
              className={`h-4 w-4 ${collected ? "fill-accent text-accent" : ""}`}
            />
            {collected ? "Collected" : "Collect"}
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="btn-ghost"
          >
            <DownloadIcon className="h-4 w-4" />
            {exporting ? "Preparing…" : "Export"}
          </button>

          {confirmDelete ? (
            <div className="flex max-w-full flex-wrap items-center justify-end gap-1.5 rounded-full border border-red-200 bg-red-50 py-1.5 pl-4 pr-1.5 dark:border-red-800/50 dark:bg-red-950/40">
              <span className="text-sm text-red-700 dark:text-red-300">
                Delete this line?
              </span>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-full bg-red-600 px-3.5 py-1.5 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-full px-2.5 py-1.5 text-sm font-medium text-ink-soft transition hover:text-ink"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="btn-ghost text-red-600/90 hover:border-red-300 hover:text-red-600 dark:text-red-400/90 dark:hover:border-red-700/60 dark:hover:text-red-300"
            >
              <TrashIcon className="h-4 w-4" />
              Delete
            </button>
          )}
        </div>
      </div>

      <div
        className="animate-rise relative mt-6 overflow-hidden rounded-3xl border border-border bg-card px-5 py-12 sm:px-16 sm:py-20"
        style={{ animationDelay: "60ms" }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 120% at 50% 0%, rgba(112,138,129,0.1) 0%, rgba(255,255,255,0) 55%)",
          }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <span
            className="font-cormorant text-[64px] leading-none text-accent"
            aria-hidden="true"
          >
            “
          </span>
          <blockquote className="mt-1 font-serif text-[28px] leading-[1.3] tracking-tight text-ink sm:text-[36px] lg:text-[40px]">
            {quote.text}
          </blockquote>
          <div className="mt-9">
            {quote.author && (
              <p className="font-serif text-[22px] text-ink-soft">{quote.author}</p>
            )}
            {quote.work && (
              <p className="mt-1 text-sm text-ink-faint">{quote.work}</p>
            )}
            <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-3">
              <SourceChip type={quote.sourceType} />
              <span className="text-[12px] tracking-wide text-ink-faint">
                Saved {formatDate(quote.savedDate)}
              </span>
            </div>
            {quote.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                {quote.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/library?tag=${encodeURIComponent(tag)}`}
                    className="chip hover:border-accent/50 hover:text-accent-deep"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="animate-rise mt-6 grid gap-6 lg:grid-cols-3"
        style={{ animationDelay: "120ms" }}
      >
        <section className="card p-7 lg:col-span-2">
          <p className="eyebrow">Your reflection</p>
          {quote.reflection ? (
            <p className="mt-4 font-cormorant text-[22px] italic leading-relaxed text-ink">
              “{quote.reflection}”
            </p>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-border-strong bg-paper-deep/60 px-5 py-6">
              <p className="font-serif text-lg text-ink-soft">
                No reflection yet.
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-faint">
                A sentence about why this line stopped you will make it yours.
              </p>
              <Link
                to={`/add?edit=${quote.id}`}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent-deep transition hover:text-ink"
              >
                Add a reflection <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          )}
        </section>

        <aside className="card p-7">
          <p className="eyebrow">Preservation</p>
          <dl className="mt-5 space-y-4 text-[13px]">
            {[
              ["Preserved from", quote.preservedFrom ?? "Manual entry"],
              ["First saved", formatDate(quote.savedDate)],
              ["Word count", String(words)],
              ["Characters", String(quote.text.length)],
              ["Device", quote.device ?? "Unknown"],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex items-start justify-between gap-4 border-b border-border/70 pb-3 last:border-0 last:pb-0"
              >
                <dt className="shrink-0 text-ink-faint">{k}</dt>
                <dd className="min-w-0 flex-1 break-words text-right font-medium text-ink-soft">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 border-t border-border/70 pt-5">
            <p className="eyebrow">Collections</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(quote.collections ?? []).length === 0 && (
                <p className="text-[13px] text-ink-faint">
                  Not in any collection yet.
                </p>
              )}
              {(quote.collections ?? []).map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent-soft px-3 py-1 text-[12px] font-medium text-accent-deep"
                >
                  {c}
                  <button
                    type="button"
                    aria-label={`Remove from ${c}`}
                    onClick={() => removeCollection(c)}
                    className="text-accent-deep/70 transition hover:text-ink"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <form onSubmit={addCollection} className="mt-3 flex items-center gap-2">
              <input
                value={collectionInput}
                onChange={(e) => setCollectionInput(e.target.value)}
                placeholder="Add a collection…"
                className="min-w-0 flex-1 rounded-full border border-dashed border-border-strong bg-card px-4 py-1.5 text-[13px] text-ink outline-none transition placeholder:text-ink-faint focus:border-accent focus:ring-4 focus:ring-accent/15"
              />
              <button
                type="submit"
                aria-label="Add collection"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-white transition hover:bg-accent-deep"
              >
                <PlusIcon className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section
          className="animate-rise mt-12"
          style={{ animationDelay: "180ms" }}
        >
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-[24px] tracking-tight text-ink">
                From the same collections
              </h2>
              <p className="mt-1 text-[13px] text-ink-faint">
                {(quote.collections ?? []).join(" · ")} — {relatedCount} more{" "}
                {relatedCount === 1 ? "line" : "lines"}
              </p>
            </div>
            <Link
              to={`/library?collection=${encodeURIComponent((quote.collections ?? [])[0] ?? "")}`}
              className="inline-flex items-center gap-1.5 text-sm text-ink-soft transition hover:text-accent-deep"
            >
              View all <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {related.map((q) => (
              <QuoteCard key={q.id} quote={q} />
            ))}
          </div>
        </section>
      )}

      <div
        className="animate-rise mt-10 flex items-center justify-between gap-4 border-t border-border/80 pt-6"
        style={{ animationDelay: "200ms" }}
      >
        <button
          type="button"
          disabled={!prev}
          onClick={() => prev && navigate(`/quotes/${prev.id}`)}
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-ink-soft transition hover:text-ink disabled:cursor-default disabled:opacity-35 disabled:hover:text-ink-soft"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>
        <p className="font-serif text-lg text-ink-soft">
          {position} <span className="text-ink-faint">/ {total}</span>
        </p>
        <button
          type="button"
          disabled={!next}
          onClick={() => next && navigate(`/quotes/${next.id}`)}
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-ink-soft transition hover:text-ink disabled:cursor-default disabled:opacity-35 disabled:hover:text-ink-soft"
        >
          <span className="hidden sm:inline">Next</span>
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={exportRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          left: "-10000px",
          top: 0,
          width: 1080,
          backgroundColor: "#faf8f5",
          padding: "72px 80px",
          border: "1px solid #eae3db",
          borderRadius: "20px",
        }}
      >
        <p
          style={{
            fontFamily: "Cormorant Garamond, Georgia, serif",
            fontSize: 64,
            lineHeight: 1,
            color: "#708a81",
          }}
        >
          “
        </p>
        <p
          style={{
            fontFamily: "Instrument Serif, Georgia, serif",
            fontSize: 44,
            lineHeight: 1.35,
            color: "#24211d",
            marginTop: 8,
          }}
        >
          {quote.text}
        </p>
        <div
          style={{
            marginTop: 44,
            paddingTop: 28,
            borderTop: "1px solid #eae3db",
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
          }}
        >
          <div>
            {quote.author && (
              <p
                style={{
                  fontFamily: "Instrument Serif, Georgia, serif",
                  fontSize: 24,
                  color: "#24211d",
                }}
              >
                {quote.author}
              </p>
            )}
            {quote.work && (
              <p
                style={{
                  fontFamily: "Instrument Sans, sans-serif",
                  fontSize: 15,
                  color: "#a69c8f",
                  marginTop: 4,
                }}
              >
                {quote.work}
              </p>
            )}
          </div>
          <p
            style={{
              fontFamily: "Instrument Sans, sans-serif",
              fontSize: 14,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#a69c8f",
            }}
          >
            Saved in Maple
          </p>
        </div>
      </div>
    </div>
  );
}
