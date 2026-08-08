import type { SourceType } from "../types";

export default function SourceChip({ type }: { type: SourceType }) {
  return (
    <span className="inline-flex items-center rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-accent-deep">
      {type}
    </span>
  );
}
