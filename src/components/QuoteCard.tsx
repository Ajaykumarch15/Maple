import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Quote } from "../types";
import SourceChip from "./SourceChip";
import { ArrowRightIcon, HeartIcon } from "./icons";
import { formatShort } from "../utils/format";

interface QuoteCardProps {
  quote: Quote;
  onToggleFavorite?: (id: string) => void;
  className?: string;
}

export default function QuoteCard({
  quote,
  onToggleFavorite,
  className,
}: QuoteCardProps) {
  const navigate = useNavigate();
  const favorite = !!quote.favorite;
  const collections = quote.collections ?? [];
  const shownTags = quote.tags.slice(0, 3);
  const extraTags = quote.tags.length - shownTags.length;

  const [heartPulse, setHeartPulse] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (favorite) {
      setHeartPulse(true);
      const t = setTimeout(() => setHeartPulse(false), 420);
      return () => clearTimeout(t);
    }
  }, [favorite]);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(quote.id);
  };

  const handleTag = (e: React.MouseEvent, tag: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/library?tag=${encodeURIComponent(tag)}`);
  };

  return (
    <Link
      to={`/quotes/${quote.id}`}
      className={`card card-hover group relative flex h-full flex-col overflow-hidden p-6 hover:border-border-strong ${className ?? ""}`}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle, var(--mood-soft), transparent 65%)",
        }}
        aria-hidden="true"
      />

      <div className="relative flex items-center justify-between gap-3">
        <SourceChip type={quote.sourceType} />
        <button
          type="button"
          onClick={handleFavorite}
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={favorite}
          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-200 active:scale-90 ${
            favorite
              ? "bg-rose-soft text-rose shadow-[0_0_18px_-4px_var(--source-favorite)]"
              : "text-ink-faint hover:bg-card hover:text-accent-deep"
          }`}
        >
          <HeartIcon
            className={`h-[18px] w-[18px] transition ${
              favorite ? "fill-current" : ""
            } ${heartPulse ? "animate-heart-pop" : ""}`}
          />
        </button>
      </div>

      <p className="relative mt-5 line-clamp-5 font-serif text-[19px] leading-[1.5] text-ink transition-[color,transform] duration-300 group-hover:-translate-y-px group-hover:text-[#f5f3ff]">
        “{quote.text}”
      </p>

      <div className="relative mt-auto border-t border-border/80 pt-4">
        <div className="mt-4 flex items-end justify-between gap-4">
          <div className="min-w-0">
            {quote.author && (
              <p className="truncate font-serif text-[17px] text-ink transition-colors duration-300 group-hover:text-accent-deep">
                {quote.author}
              </p>
            )}
            {quote.work && (
              <p className="mt-0.5 truncate text-xs text-ink-faint transition-colors duration-300 group-hover:text-ink-soft">
                {quote.work}
              </p>
            )}
          </div>
          <span className="flex shrink-0 items-center gap-2 text-[11px] tracking-wide text-ink-faint">
            {formatShort(quote.savedDate)}
            <ArrowRightIcon className="h-4 w-4 -translate-x-1.5 text-accent opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
          </span>
        </div>

        {quote.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {shownTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={(e) => handleTag(e, tag)}
                className="rounded-full border border-border bg-paper px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-ink-soft transition-all duration-200 hover:-translate-y-px hover:border-accent/60 hover:bg-card hover:text-accent-deep hover:shadow-sm active:scale-95"
              >
                {tag}
              </button>
            ))}
            {extraTags > 0 && (
              <span className="text-[10px] tracking-wide text-ink-faint">
                +{extraTags}
              </span>
            )}
          </div>
        )}

        {collections.length > 0 && (
          <p className="mt-3 line-clamp-1 text-[11px] tracking-wide text-ink-faint transition-colors duration-300 group-hover:text-ink-soft">
            {collections.join(" · ")}
          </p>
        )}
      </div>
    </Link>
  );
}
