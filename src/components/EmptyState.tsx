import { Link } from "react-router-dom";
import { PlusIcon } from "./icons";

interface EmptyStateProps {
  title: string;
  body: string;
  ctaLabel?: string;
  ctaTo?: string;
}

export default function EmptyState({
  title,
  body,
  ctaLabel,
  ctaTo,
}: EmptyStateProps) {
  return (
    <div className="card relative overflow-hidden px-8 py-16 text-center">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-accent/10 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 ambient-noise"
        aria-hidden="true"
      />
      <div className="relative">
        <div
          className="mb-7 flex items-center justify-center gap-3 text-ink-faint"
          aria-hidden="true"
        >
          <span className="h-px w-14 bg-gradient-to-r from-transparent to-border-strong" />
          <span className="font-serif text-2xl leading-none">❧</span>
          <span className="h-px w-14 bg-gradient-to-l from-transparent to-border-strong" />
        </div>
        <p className="font-serif text-2xl text-ink">{title}</p>
        <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-ink-soft">
          {body}
        </p>
        {ctaLabel && ctaTo && (
          <Link to={ctaTo} className="btn-primary mt-7">
            <PlusIcon className="h-4 w-4" />
            {ctaLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
