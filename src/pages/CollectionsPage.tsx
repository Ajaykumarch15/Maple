import { Link } from "react-router-dom";
import { useQuotes } from "../store/quotes";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import { CollectionsIcon, ArrowRightIcon } from "../components/icons";

export default function CollectionsPage() {
  const { meta } = useQuotes();

  if (!meta) {
    return (
      <div>
        <header className="animate-rise">
          <p className="eyebrow">Collections</p>
          <h1 className="mt-2 font-serif text-[40px] leading-none tracking-tight text-ink sm:text-[46px]">
            Collections
          </h1>
        </header>
        <div className="card mt-10">
          <Loader copy="Gathering your threads…" />
        </div>
      </div>
    );
  }

  const entries = meta.collections;

  return (
    <div>
      <header className="animate-rise">
        <p className="eyebrow">
          {entries.length} {entries.length === 1 ? "collection" : "collections"}
        </p>
        <h1 className="mt-2 font-serif text-[40px] leading-none tracking-tight text-ink sm:text-[46px]">
          Collections
        </h1>
        <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-soft">
          Threads that run through your archive — the quiet themes your saved
          lines keep returning to.
        </p>
      </header>

      {entries.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {entries.map((entry, i) => (
            <Link
              key={entry.name}
              to={`/library?collection=${encodeURIComponent(entry.name)}`}
              className="card card-hover animate-card-in group relative flex h-full flex-col overflow-hidden p-7 hover:border-border-strong"
              style={{ animationDelay: `${Math.min(i, 7) * 50}ms` }}
            >
              <div
                className="pointer-events-none absolute -left-14 -top-14 h-44 w-44 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(circle, rgba(112,138,129,0.16), transparent 65%)",
                }}
                aria-hidden="true"
              />
              <div className="relative flex items-center justify-between gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent-deep transition-all duration-300 group-hover:-rotate-6 group-hover:scale-105 group-hover:shadow-[0_8px_20px_-8px_rgba(112,138,129,0.5)]">
                  <CollectionsIcon className="h-5 w-5" />
                </span>
                <span className="eyebrow">
                  {entry.count} {entry.count === 1 ? "line" : "lines"}
                </span>
              </div>
              <h2 className="relative mt-5 font-serif text-[26px] tracking-tight text-ink">
                {entry.name}
              </h2>
              {entry.preview && (
                <p className="relative mt-3 line-clamp-2 font-cormorant text-[18px] italic leading-relaxed text-ink-soft transition-transform duration-300 group-hover:translate-x-px">
                  “{entry.preview}”
                </p>
              )}
              <div className="relative mt-6 flex items-center gap-1.5 border-t border-border/80 pt-4 text-sm text-ink-soft transition-colors duration-300 group-hover:text-accent-deep">
                Open collection
                <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-10">
          <EmptyState
            title="Your themes are waiting."
            body="A collection begins with a line worth keeping — save one and gather its companions here."
            ctaLabel="Save your first line"
            ctaTo="/add"
          />
        </div>
      )}
    </div>
  );
}
