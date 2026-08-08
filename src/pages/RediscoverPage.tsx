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
    <div className="flex items-center justify-center py-28">
      <Loader copy="Finding a line for you…" />
    </div>
  );
}
