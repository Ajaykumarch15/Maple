import { Link, useNavigate } from "react-router-dom";
import type { Quote } from "../types";
import SourceChip from "./SourceChip";
import { HeartIcon } from "./icons";
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
      className={`card group flex flex-col p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[0_16px_44px_-20px_rgba(36,33,29,0.28)] ${className ?? ""}`}
    >
      <div className="flex items-center justify-between gap-3">
        <SourceChip type={quote.sourceType} />
        <button
          type="button"
          onClick={handleFavorite}
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={favorite}
          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
            favorite
              ? "bg-accent-soft text-accent-deep"
              : "text-ink-faint hover:bg-card hover:text-accent-deep"
          }`}
        >
          <HeartIcon
            className={`h-[18px] w-[18px] ${favorite ? "fill-current" : ""}`}
          />
        </button>
      </div>

      <p className="mt-5 line-clamp-5 font-serif text-[19px] leading-[1.5] text-ink">
        “{quote.text}”
      </p>

      <div className="mt-auto border-t border-border/80 pt-4">
        <div className="mt-4 flex items-end justify-between gap-4">
          <div className="min-w-0">
            {quote.author && (
              <p className="truncate font-serif text-[17px] text-ink">
                {quote.author}
              </p>
            )}
            {quote.work && (
              <p className="mt-0.5 truncate text-xs text-ink-faint">
                {quote.work}
              </p>
            )}
          </div>
          <span className="shrink-0 text-[11px] tracking-wide text-ink-faint">
            {formatShort(quote.savedDate)}
          </span>
        </div>

        {quote.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {shownTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={(e) => handleTag(e, tag)}
                className="rounded-full border border-border bg-paper px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-ink-soft transition hover:border-accent/50 hover:text-accent-deep"
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
          <p className="mt-3 line-clamp-1 text-[11px] tracking-wide text-ink-faint">
            {collections.join(" · ")}
          </p>
        )}
      </div>
    </Link>
  );
}
