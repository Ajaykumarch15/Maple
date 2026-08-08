import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuotes } from "../store/quotes";
import QuoteCard from "../components/QuoteCard";
import StatsCard from "../components/StatsCard";
import ResurfaceCard from "../components/ResurfaceCard";
import Loader from "../components/Loader";
import {
  PlusIcon,
  ShuffleIcon,
  SparkleIcon,
  ArrowRightIcon,
} from "../components/icons";
import { dailyIndex, formatTodayLong, greeting } from "../utils/format";
import type { Quote } from "../types";

export default function HomePage() {
  const { fetchQuotes, stats, statsReady } = useQuotes();
  const [featured, setFeatured] = useState<Quote | null>(null);
  const [recent, setRecent] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!statsReady) return;
    let active = true;
    const total = stats?.total ?? 0;

    if (total === 0) {
      setFeatured(null);
      setRecent([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([
      fetchQuotes({ sort: "recent", limit: 4 }),
      fetchQuotes({ sort: "recent", limit: 1, page: dailyIndex(total) + 1 }),
    ])
      .then(([rec, feat]) => {
        if (!active) return;
        setRecent(rec.items);
        setFeatured(feat.items[0] ?? null);
        setFailed(false);
      })
      .catch(() => {
        if (!active) return;
        setFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fetchQuotes, stats?.total, statsReady]);

  if (loading) {
    return (
      <div className="card">
        <Loader copy="Gathering your lines…" />
      </div>
    );
  }

  const total = stats?.total ?? 0;
  const reflectionCount = stats?.reflections ?? 0;
  const collectionCount = stats?.collections ?? 0;

  return (
    <div>
      <header
        className="animate-rise flex flex-wrap items-end justify-between gap-6"
        style={{ animationDelay: "0ms" }}
      >
        <div>
          <p className="eyebrow">{formatTodayLong()}</p>
          <h1 className="mt-3 font-serif text-[40px] leading-[1.05] tracking-tight text-ink sm:text-[52px]">
            {greeting()}, <span className="text-gradient">Maple.</span>
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
            Every line worth keeping, in one quiet place.{" "}
            <span className="text-ink">{total}</span> saved so far — let one of
            them find you tonight.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/rediscover" className="btn-ghost group">
            <ShuffleIcon className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
            Rediscover a line
          </Link>
          <Link to="/add" className="btn-primary group">
            <PlusIcon className="h-4 w-4" />
            New save
          </Link>
        </div>
      </header>

      {featured && !failed && (
        <section
          className="animate-rise mt-10"
          style={{ animationDelay: "60ms" }}
        >
          <p className="eyebrow mb-4 inline-flex items-center gap-2">
            <SparkleIcon className="h-4 w-4 text-accent" />
            Resurface today
          </p>
          <ResurfaceCard quote={featured} />
        </section>
      )}

      <section
        className="animate-rise mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3"
        style={{ animationDelay: "120ms" }}
      >
        <StatsCard
          label="Saved lines"
          value={total}
          caption="The words you chose to keep"
        />
        <StatsCard
          label="Collections"
          value={collectionCount}
          caption="Threads that run through your archive"
        />
        <StatsCard
          label="Reflections"
          value={reflectionCount}
          caption={
            reflectionCount > 0
              ? `Your own words beside ${reflectionCount} of ${total} lines`
              : "Your own words beside the lines you keep"
          }
        />
      </section>

      <section
        className="animate-rise mt-12"
        style={{ animationDelay: "180ms" }}
      >
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-[26px] tracking-tight text-ink">
              Recent saves
            </h2>
            <p className="mt-1 text-[13px] text-ink-faint">
              The latest additions to your commonplace book
            </p>
          </div>
          <Link
            to="/library"
            className="group inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors duration-200 hover:text-accent-deep"
          >
            View library
            <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {recent.map((quote, i) => (
            <div
              key={quote.id}
              className="animate-card-in"
              style={{ animationDelay: `${Math.min(i, 7) * 60}ms` }}
            >
              <QuoteCard quote={quote} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
