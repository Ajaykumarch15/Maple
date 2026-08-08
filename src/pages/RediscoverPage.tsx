import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuotes } from "../store/quotes";

const DAY_MS = 24 * 60 * 60 * 1000;

export default function RediscoverPage() {
  const { quotes } = useQuotes();
  const navigate = useNavigate();
  const location = useLocation();
  const excludeId = (location.state as { excludeId?: string } | null)?.excludeId;

  useEffect(() => {
    if (quotes.length === 0) return;

    const pool = quotes.filter((q) => q.id !== excludeId);
    if (pool.length === 0) {
      navigate("/library", { replace: true });
      return;
    }

    const now = Date.now();
    const ranked = pool.map((q) => {
      const opened = q.lastOpenedAt ? new Date(q.lastOpenedAt).getTime() : 0;
      return { q, opened, notRecent: !q.lastOpenedAt || now - opened > DAY_MS };
    });

    const candidates = ranked.some((r) => r.notRecent)
      ? ranked.filter((r) => r.notRecent)
      : ranked;

    candidates.sort((a, b) => a.opened - b.opened);
    const top = candidates.slice(
      0,
      Math.max(1, Math.min(10, Math.ceil(candidates.length / 3))),
    );
    const pick = top[Math.floor(Math.random() * top.length)];

    navigate(`/quotes/${pick.q.id}`, {
      replace: true,
      state: { fromRediscover: true },
    });
  }, [quotes, excludeId, navigate]);

  return (
    <div className="flex items-center justify-center py-28">
      <p className="font-serif text-xl text-ink-soft">
        Finding a line for you…
      </p>
    </div>
  );
}
