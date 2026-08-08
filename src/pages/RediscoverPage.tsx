import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuotes } from "../store/quotes";
import Loader from "../components/Loader";

export default function RediscoverPage() {
  const { getRediscover } = useQuotes();
  const navigate = useNavigate();
  const location = useLocation();
  const excludeId = (location.state as { excludeId?: string } | null)?.excludeId;

  useEffect(() => {
    let active = true;
    getRediscover(excludeId)
      .then((quote) => {
        if (!active) return;
        if (!quote) {
          navigate("/library", { replace: true });
          return;
        }
        navigate(`/quotes/${quote.id}`, {
          replace: true,
          state: { fromRediscover: true },
        });
      })
      .catch(() => {
        if (!active) return;
        navigate("/library", { replace: true });
      });
    return () => {
      active = false;
    };
  }, [getRediscover, excludeId, navigate]);

  return (
    <div className="relative flex items-center justify-center py-28">
      <div
        aria-hidden="true"
        className="animate-pulse-glow pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-[rgba(139,92,255,0.35)] to-[rgba(0,229,255,0.25)] blur-3xl"
      />
      <Loader copy="Finding a line for you…" className="relative" />
    </div>
  );
}
