import { Link } from "react-router-dom";
import type { Quote } from "../types";
import SourceChip from "./SourceChip";
import { formatShort } from "../utils/format";

interface QuoteCardProps {
  quote: Quote;
  className?: string;
}

export default function QuoteCard({ quote, className }: QuoteCardProps) {
  return (
    <Link
      to={`/quotes/${quote.id}`}
      className={`card group flex flex-col p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[0_16px_44px_-20px_rgba(36,33,29,0.28)] ${className ?? ""}`}
    >
      <div className="flex items-center justify-between gap-3">
        <SourceChip type={quote.sourceType} />
        <span className="text-[11px] tracking-wide text-ink-faint">
          {formatShort(quote.savedDate)}
        </span>
      </div>

      <p className="mt-5 line-clamp-4 font-serif text-[19px] leading-[1.5] text-ink">
        “{quote.text}”
      </p>

      <div className="mt-6 flex items-end justify-between gap-4 border-t border-border/80 pt-4">
        <div className="min-w-0">
          {quote.author && (
            <p className="truncate font-serif text-[17px] text-ink">
              {quote.author}
            </p>
          )}
          {quote.work && (
            <p className="mt-0.5 truncate text-xs text-ink-faint">{quote.work}</p>
          )}
        </div>
        {quote.collection && (
          <span className="max-w-[45%] shrink-0 truncate text-[11px] tracking-wide text-ink-faint">
            {quote.collection}
          </span>
        )}
      </div>
    </Link>
  );
}
