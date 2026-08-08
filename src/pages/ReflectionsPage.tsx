import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuotes } from "../store/quotes";
import SourceChip from "../components/SourceChip";
import EmptyState from "../components/EmptyState";
import { ArrowRightIcon } from "../components/icons";
import { formatShort } from "../utils/format";
import type { Quote } from "../types";

export default function ReflectionsPage() {
  const { fetchQuotes } = useQuotes();
  const [withReflection, setWithReflection] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchQuotes({ sort: "recent", limit: 100 })
      .then((res) => {
        if (active) {
          setWithReflection(res.items.filter((q) => q.reflection?.trim()));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetchQuotes]);

  if (loading) {
    return (
      <div>
        <header className="animate-rise">
          <p className="eyebrow">Reflections</p>
          <h1 className="mt-2 font-serif text-[40px] leading-none tracking-tight text-ink sm:text-[46px]">
            Reflections
          </h1>
        </header>
        <div className="card mt-10 flex items-center justify-center py-24">
          <p className="font-serif text-xl text-ink-soft">
            Gathering your notes…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="animate-rise">
        <p className="eyebrow">
          {withReflection.length}{" "}
          {withReflection.length === 1 ? "reflection" : "reflections"}
        </p>
        <h1 className="mt-2 font-serif text-[40px] leading-none tracking-tight text-ink sm:text-[46px]">
          Reflections
        </h1>
        <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-soft">
          The places where your own words meet the words you kept.
        </p>
      </header>

      {withReflection.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {withReflection.map((q) => (
            <Link
              key={q.id}
              to={`/quotes/${q.id}`}
              className="card group flex flex-col p-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[0_16px_44px_-20px_rgba(36,33,29,0.28)]"
            >
              <div className="flex items-center justify-between gap-3">
                <SourceChip type={q.sourceType} />
                <span className="text-[11px] tracking-wide text-ink-faint">
                  {formatShort(q.savedDate)}
                </span>
              </div>

              <p className="mt-5 font-cormorant text-[21px] italic leading-[1.55] text-ink">
                “{q.reflection}”
              </p>

              <div className="mt-auto pt-6">
                <p className="line-clamp-2 font-serif text-[16px] leading-relaxed text-ink-soft">
                  — {q.author ?? q.work ?? "Untitled"}
                </p>
                <p className="mt-4 inline-flex items-center gap-1.5 border-t border-border/80 pt-4 text-sm text-ink-soft transition group-hover:text-accent-deep">
                  Read the entry
                  <ArrowRightIcon className="h-4 w-4" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-10">
          <EmptyState
            title="Nothing reflected yet."
            body="When a line stops you, add a sentence about why. Those notes are what make the archive yours."
            ctaLabel="New save"
            ctaTo="/add"
          />
        </div>
      )}
    </div>
  );
}
