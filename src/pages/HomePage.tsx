import { Link } from "react-router-dom";
import { useQuotes } from "../store/quotes";
import QuoteCard from "../components/QuoteCard";
import StatsCard from "../components/StatsCard";
import ResurfaceCard from "../components/ResurfaceCard";
import {
  PlusIcon,
  ShuffleIcon,
  SparkleIcon,
  ArrowRightIcon,
} from "../components/icons";
import { dailyIndex, formatTodayLong, greeting } from "../utils/format";

export default function HomePage() {
  const { quotes, loading } = useQuotes();
  const featured = quotes[dailyIndex(quotes.length)];

  if (loading) {
    return (
      <div className="card flex items-center justify-center py-24">
        <p className="font-serif text-xl text-ink-soft">
          Gathering your lines…
        </p>
      </div>
    );
  }

  const reflectionCount = quotes.filter((q) => q.reflection?.trim()).length;
  const collectionCount = new Set(
    quotes.flatMap((q) => q.collections ?? []).filter(Boolean),
  ).size;

  const recent = [...quotes]
    .sort((a, b) => b.savedDate.localeCompare(a.savedDate))
    .slice(0, 4);

  return (
    <div>
      <header
        className="animate-rise flex flex-wrap items-end justify-between gap-6"
        style={{ animationDelay: "0ms" }}
      >
        <div>
          <p className="eyebrow">{formatTodayLong()}</p>
          <h1 className="mt-3 font-serif text-[40px] leading-[1.05] tracking-tight text-ink sm:text-[52px]">
            {greeting()}, Maple.
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
            Every line worth keeping, in one quiet place.{" "}
            <span className="text-ink">{quotes.length}</span> saved so far — let
            one of them find you tonight.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/rediscover" className="btn-ghost">
            <ShuffleIcon className="h-4 w-4" />
            Rediscover a line
          </Link>
          <Link to="/add" className="btn-primary">
            <PlusIcon className="h-4 w-4" />
            New save
          </Link>
        </div>
      </header>

      {featured && (
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
          value={quotes.length}
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
              ? `Your own words beside ${reflectionCount} of ${quotes.length} lines`
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
            className="inline-flex items-center gap-1.5 text-sm text-ink-soft transition hover:text-accent-deep"
          >
            View library
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {recent.map((quote) => (
            <QuoteCard key={quote.id} quote={quote} />
          ))}
        </div>
      </section>
    </div>
  );
}
