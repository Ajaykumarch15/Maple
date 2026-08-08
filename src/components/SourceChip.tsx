import type { SourceType } from "../types";

const STYLES: Record<SourceType, string> = {
  Book: "source-book",
  Movie: "source-movie",
  Song: "source-song",
  Conversation: "source-conversation",
  "My Own": "source-own",
  Other: "source-other",
};

export default function SourceChip({ type }: { type: SourceType }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] transition-colors duration-200 ${
        STYLES[type] ?? "source-other"
      }`}
    >
      {type}
    </span>
  );
}
