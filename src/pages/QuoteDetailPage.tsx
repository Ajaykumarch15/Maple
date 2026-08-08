import { useRef, useState } from "react";
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
  TrashIcon,
} from "../components/icons";
import { countWords, formatDate, slugify } from "../utils/format";

export default function QuoteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { quotes, getQuote, toggleCollected, deleteQuote } = useQuotes();
  const [exporting, setExporting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const quote = id ? getQuote(id) : undefined;

  const handleExport = async () => {
    const node = exportRef.current;
    if (!node || exporting) return;
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

  if (!quote) {
    return (
      <div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center gap-2 text-sm text-ink-soft transition hover:text-ink"
        >
          <ArrowLeftIcon className="h-4 w-4" /> Back
        </button>
        <EmptyState
          title="This line has drifted away."
          body="It may have been removed, or the link is no longer valid."
          ctaLabel="Go to library"
          ctaTo="/library"
        />
      </div>
    );
  }

  const related = quote.collection
    ? quotes.filter(
        (q) => q.collection === quote.collection && q.id !== quote.id,
      )
    : [];
  const words = countWords(quote.text);

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
            onClick={handleExport}
            disabled={exporting}
            className="btn-ghost"
          >
            <DownloadIcon className="h-4 w-4" />
            {exporting ? "Preparing…" : "Export image"}
          </button>
          <button
            type="button"
            onClick={() => {
              toggleCollected(quote.id).catch((err) =>
                console.error("Failed to toggle collect", err),
              );
            }}
            className={`btn-ghost ${
              quote.collected ? "border-accent! text-accent-deep!" : ""
            }`}
          >
            <BookmarkIcon
              className={`h-4 w-4 ${quote.collected ? "fill-accent text-accent" : ""}`}
            />
            {quote.collected ? "Collected" : "Collect"}
          </button>
          <Link to={`/add?edit=${quote.id}`} className="btn-ghost">
            <EditIcon className="h-4 w-4" />
            Edit entry
          </Link>

          <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />

          {confirmDelete ? (
            <div className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 py-1.5 pl-4 pr-1.5 dark:border-red-800/50 dark:bg-red-950/40">
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
        className="animate-rise relative mt-6 overflow-hidden rounded-3xl border border-border bg-card px-8 py-14 sm:px-16 sm:py-20"
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
            <div className="mt-5 inline-flex items-center gap-3">
              <SourceChip type={quote.sourceType} />
              <span className="text-[12px] tracking-wide text-ink-faint">
                Saved {formatDate(quote.savedDate)}
              </span>
            </div>
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
                <dd className="text-right font-medium text-ink-soft">{v}</dd>
              </div>
            ))}
            {quote.collection && (
              <div className="flex items-start justify-between gap-4">
                <dt className="shrink-0 text-ink-faint">Collection</dt>
                <dd>
                  <Link
                    to={`/library?collection=${encodeURIComponent(quote.collection)}`}
                    className="inline-flex items-center gap-1 font-medium text-accent-deep transition hover:text-ink"
                  >
                    {quote.collection}
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </dd>
              </div>
            )}
          </dl>
        </aside>
      </div>

      {quote.tags.length > 0 && (
        <div className="animate-rise mt-6 flex flex-wrap items-center gap-2">
          <span className="eyebrow mr-1">Tags</span>
          {quote.tags.map((tag) => (
            <Link
              key={tag}
              to={`/search?tag=${encodeURIComponent(tag)}`}
              className="chip hover:border-accent/50 hover:text-accent-deep"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {related.length > 0 && (
        <section
          className="animate-rise mt-12"
          style={{ animationDelay: "180ms" }}
        >
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-[24px] tracking-tight text-ink">
                From the same collection
              </h2>
              <p className="mt-1 text-[13px] text-ink-faint">
                “{quote.collection}” — {related.length} more{" "}
                {related.length === 1 ? "line" : "lines"}
              </p>
            </div>
            <Link
              to={`/library?collection=${encodeURIComponent(quote.collection!)}`}
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
            Saved in Margin
          </p>
        </div>
      </div>
    </div>
  );
}
