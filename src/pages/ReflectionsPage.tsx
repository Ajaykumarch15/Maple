import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuotes } from "../store/quotes";
import SourceChip from "../components/SourceChip";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
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
        <div className="card mt-10">
          <Loader copy="Gathering your notes…" />
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
          {withReflection.map((q, i) => (
            <div
              key={q.id}
              className="animate-card-in"
              style={{ animationDelay: `${Math.min(i, 7) * 50}ms` }}
            >
              <Link
                to={`/quotes/${q.id}`}
                className="card card-hover group relative flex h-full flex-col overflow-hidden p-7 hover:border-rose/40"
              >
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(110% 90% at 15% 0%, rgba(255,60,172,0.07), transparent 55%), radial-gradient(100% 80% at 100% 100%, rgba(139,92,255,0.08), transparent 55%)",
                  }}
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(110% 90% at 15% 0%, rgba(255,60,172,0.14), transparent 55%), radial-gradient(100% 80% at 100% 100%, rgba(0,229,255,0.08), transparent 55%)",
                  }}
                  aria-hidden="true"
                />
                <div className="relative flex items-center justify-between gap-3">
                  <SourceChip type={q.sourceType} />
                  <span className="text-[11px] tracking-wide text-ink-faint">
                    {formatShort(q.savedDate)}
                  </span>
                </div>

                <p className="relative mt-6 font-cormorant text-[22px] italic leading-[1.55] text-[#f3f1ff] transition-colors duration-300 group-hover:text-white">
                  “{q.reflection}”
                </p>

                <div className="relative mt-auto pt-6">
                  <p className="line-clamp-2 font-serif text-[16px] leading-relaxed text-ink-soft">
                    — {q.author ?? q.work ?? "Untitled"}
                  </p>
                  <p className="mt-4 inline-flex items-center gap-1.5 border-t border-border/80 pt-4 text-sm text-ink-soft transition-colors duration-300 group-hover:text-accent-deep">
                    Read the entry
                    <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10">
          <EmptyState
            title="Leave a thought beside the words."
            body="When a line stops you, add a sentence about why. Those notes are what make the archive yours."
            ctaLabel="New save"
            ctaTo="/add"
          />
        </div>
      )}
    </div>
  );
}
