import { Link } from "react-router-dom";
import type { Quote } from "../types";
import { ArrowRightIcon, SparkleIcon } from "./icons";

export default function ResurfaceCard({ quote }: { quote: Quote }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 0%, rgba(112,138,129,0.14) 0%, rgba(255,255,255,0) 55%)",
        }}
      />
      <div className="relative mx-auto max-w-2xl px-5 py-10 text-center sm:px-14 sm:py-16">
        <span
          className="font-cormorant text-7xl leading-none text-accent"
          aria-hidden="true"
        >
          “
        </span>
        <blockquote className="mt-2 font-serif text-[28px] leading-[1.3] text-ink sm:text-[34px]">
          {quote.text}
        </blockquote>
        <p className="mt-7 font-serif text-lg text-ink-soft">
          {quote.author ?? quote.work}
        </p>
        {quote.author && quote.work && (
          <p className="mt-1 text-[13px] text-ink-faint">{quote.work}</p>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-center gap-5 border-t border-border pt-7">
          <Link to={`/quotes/${quote.id}`} className="btn-primary">
            Open entry
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
          {quote.collection && (
            <Link
              to={`/library?collection=${encodeURIComponent(quote.collection)}`}
              className="inline-flex items-center gap-1.5 text-sm text-ink-soft transition hover:text-accent-deep"
            >
              <SparkleIcon className="h-4 w-4" />
              From “{quote.collection}”
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
