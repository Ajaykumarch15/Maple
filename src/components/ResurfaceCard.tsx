import { Link } from "react-router-dom";
import type { Quote } from "../types";
import { ArrowRightIcon, SparkleIcon } from "./icons";

export default function ResurfaceCard({ quote }: { quote: Quote }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-[0_0_70px_-20px_var(--mood-glow)]">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 ambient-drift" />
        <div className="absolute inset-0 ambient-noise" />
        <div
          className="animate-pulse-glow absolute left-1/2 top-[-10rem] h-80 w-[44rem] max-w-none -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background:
              "linear-gradient(90deg, var(--mood-glow-soft), var(--mood-glow-secondary), var(--mood-glow-tertiary))",
          }}
        />
        <span className="animate-twinkle absolute left-[14%] top-[22%] h-1.5 w-1.5 rounded-full bg-mood" />
        <span
          className="animate-twinkle absolute right-[18%] top-[38%] h-1 w-1 rounded-full bg-mood-tertiary"
          style={{ animationDelay: "1.4s" }}
        />
        <span
          className="animate-twinkle absolute bottom-[26%] left-[22%] h-1 w-1 rounded-full bg-mood-secondary"
          style={{ animationDelay: "2.8s" }}
        />
        <span
          className="animate-twinkle absolute bottom-[18%] right-[24%] h-1.5 w-1.5 rounded-full bg-mood"
          style={{ animationDelay: "3.9s" }}
        />
      </div>
      <div className="relative mx-auto max-w-2xl px-5 py-10 text-center sm:px-14 sm:py-16">
        <span
          className="text-gradient font-cormorant text-7xl leading-none"
          aria-hidden="true"
        >
          “
        </span>
        <blockquote className="mt-2 font-serif text-[28px] leading-[1.3] text-[#f3f1ff] sm:text-[34px]">
          {quote.text}
        </blockquote>
        <p className="mt-7 font-serif text-lg italic text-accent-deep">
          {quote.author ?? quote.work}
        </p>
        {quote.author && quote.work && (
          <p className="mt-1 text-[13px] tracking-wide text-ink-faint">
            {quote.work}
          </p>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-center gap-5 border-t border-border/80 pt-7">
          <Link to={`/quotes/${quote.id}`} className="btn-primary group">
            Open entry
            <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
          {quote.collections?.[0] && (
            <Link
              to={`/library?collection=${encodeURIComponent(quote.collections[0])}`}
              className="group inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors duration-200 hover:text-accent-deep"
            >
              <SparkleIcon className="h-4 w-4 text-accent transition-transform duration-300 group-hover:rotate-12" />
              From “{quote.collections[0]}”
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
