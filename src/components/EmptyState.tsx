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
    <div className="card px-8 py-16 text-center">
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
  );
}
