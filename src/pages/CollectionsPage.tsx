import { Link } from "react-router-dom";
import { useQuotes } from "../store/quotes";
import EmptyState from "../components/EmptyState";
import { CollectionsIcon, ArrowRightIcon } from "../components/icons";

export default function CollectionsPage() {
  const { quotes } = useQuotes();

  const grouped = new Map<string, typeof quotes>();
  for (const q of quotes) {
    if (!q.collection) continue;
    const list = grouped.get(q.collection) ?? [];
    list.push(q);
    grouped.set(q.collection, list);
  }

  const entries = [...grouped.entries()].sort((a, b) =>
    a[0].localeCompare(b[0]),
  );

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
          {entries.map(([name, list], i) => {
            const first = list[0];
            return (
              <Link
                key={name}
                to={`/library?collection=${encodeURIComponent(name)}`}
                className="card group flex flex-col p-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[0_16px_44px_-20px_rgba(36,33,29,0.28)]"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent-deep">
                    <CollectionsIcon className="h-5 w-5" />
                  </span>
                  <span className="eyebrow">
                    {list.length} {list.length === 1 ? "line" : "lines"}
                  </span>
                </div>
                <h2 className="mt-5 font-serif text-[26px] tracking-tight text-ink">
                  {name}
                </h2>
                {first && (
                  <p className="mt-3 line-clamp-2 font-cormorant text-[18px] italic leading-relaxed text-ink-soft">
                    “{first.text}”
                  </p>
                )}
                <div className="mt-6 flex items-center gap-1.5 border-t border-border/80 pt-4 text-sm text-ink-soft transition group-hover:text-accent-deep">
                  Open collection
                  <ArrowRightIcon className="h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="mt-10">
          <EmptyState
            title="No collections yet."
            body="Group saved lines into collections as you go — by mood, by book, by season."
            ctaLabel="Save your first line"
            ctaTo="/add"
          />
        </div>
      )}
    </div>
  );
}
