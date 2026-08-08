import type { SourceType } from "../types";

const STYLES: Record<SourceType, string> = {
  Book: "bg-accent-soft text-accent-deep shadow-[0_0_14px_-6px_rgba(139,92,255,0.7)]",
  Movie: "bg-blue-soft text-blue shadow-[0_0_14px_-6px_rgba(77,124,255,0.7)]",
  Song: "bg-rose-soft text-rose shadow-[0_0_14px_-6px_rgba(255,60,172,0.7)]",
  Conversation: "bg-taupe-soft text-taupe shadow-[0_0_14px_-6px_rgba(154,160,181,0.6)]",
  "My Own": "bg-gold-soft text-gold shadow-[0_0_14px_-6px_rgba(182,255,74,0.6)]",
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
