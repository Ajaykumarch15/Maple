import type { SourceType } from "../types";

const STYLES: Record<SourceType, string> = {
  Book: "bg-accent-soft text-accent-deep",
  Movie: "bg-blue-soft text-blue",
  Song: "bg-rose-soft text-rose",
  Conversation: "bg-taupe-soft text-taupe",
  "My Own": "bg-gold-soft text-gold",
  Other: "border border-border bg-card text-ink-soft",
};

export default function SourceChip({ type }: { type: SourceType }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] transition-colors duration-200 ${
        STYLES[type] ?? STYLES.Other
      }`}
    >
      {type}
    </span>
  );
}
