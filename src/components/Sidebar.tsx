import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useQuotes } from "../store/quotes";
import { useTheme } from "../theme";
import { NAV_ITEMS } from "./nav";
import { MOODS, moodName } from "../moods";
import { MOOD_PALETTES } from "../moodTheme";
import { CheckIcon, ChevronDownIcon, PaletteIcon, PlusIcon } from "./icons";

export default function Sidebar() {
  const { stats } = useQuotes();
  const { mood, setMood, previewMood } = useTheme();
  const [moodOpen, setMoodOpen] = useState(false);
  const moodRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!moodOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (moodRef.current && !moodRef.current.contains(e.target as Node)) {
        setMoodOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoodOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [moodOpen]);

  useEffect(() => {
    if (!moodOpen) previewMood(null);
  }, [moodOpen]);

  return (
    <aside className="glass fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col border-r border-border lg:flex">
      <div
        className="pointer-events-none absolute inset-0 ambient-noise"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-44 ambient-drift"
        aria-hidden="true"
      />
      <div className="px-7 pb-6 pt-8">
        <Link
          to="/"
          className="group flex items-baseline gap-0.5"
          aria-label="Maple — home"
        >
          <span className="font-serif text-[28px] leading-none tracking-tight text-ink transition-colors duration-300 group-hover:text-accent-deep">
            Maple
          </span>
          <span className="bg-gradient-primary bg-clip-text font-serif text-[28px] leading-none text-transparent transition-transform duration-300 group-hover:translate-x-0.5">
            .
          </span>
        </Link>
        <p className="eyebrow mt-2.5">A commonplace book</p>
      </div>

      <div className="px-5">
        <Link to="/add" className="btn-primary group w-full">
          <PlusIcon className="h-4 w-4" />
          New save
        </Link>
      </div>

      <nav className="mt-8 min-h-0 flex-1 space-y-1 overflow-y-auto px-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-primary font-medium text-white shadow-[0_10px_24px_-10px_var(--mood-glow-strong)]"
                    : "text-ink-soft hover:bg-card/60 hover:text-ink"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full transition-all duration-300 ${
                      isActive
                        ? "bg-white translate-x-0 opacity-100"
                        : "bg-accent -translate-x-1 opacity-0"
                    }`}
                  />
                  <Icon
                    className={`h-[18px] w-[18px] transition-all duration-200 ${
                      isActive
                        ? "text-white"
                        : "text-ink-faint group-hover:translate-x-px group-hover:text-ink-soft"
                    }`}
                  />
                  {item.label}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-border/80 px-4 pb-5 pt-4">
        <p className="eyebrow flex items-center gap-1.5 px-3.5 pb-2">
          <PaletteIcon className="h-3.5 w-3.5" />
          Color mood
        </p>

        <div ref={moodRef} className="relative px-1.5">
          <button
            type="button"
            onClick={() => setMoodOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={moodOpen}
            className={`group flex w-full items-center justify-between gap-2.5 rounded-xl border px-3 py-2 text-[13px] transition-[border-color,background-color,color,box-shadow] duration-200 ${
              moodOpen
                ? "border-accent/50 bg-card shadow-[0_0_0_3px_var(--mood-soft)]"
                : "border-border bg-card/60 hover:border-accent/40 hover:bg-card"
            }`}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span
                aria-hidden="true"
                className="h-[18px] w-[18px] shrink-0 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${MOOD_PALETTES[mood].primary}, ${MOOD_PALETTES[mood].secondary} 50%, ${MOOD_PALETTES[mood].tertiary})`,
                  boxShadow: `0 0 12px -2px ${MOOD_PALETTES[mood].glow}`,
                }}
              />
              <span className="truncate font-medium text-ink">
                {moodName(mood)}
              </span>
            </span>
            <ChevronDownIcon
              className={`h-4 w-4 shrink-0 text-ink-faint transition-transform duration-200 ${
                moodOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {moodOpen && (
            <div
              role="menu"
              aria-label="Color mood"
              className="glass animate-pop absolute bottom-full left-0 right-0 z-50 mb-2 rounded-2xl border border-border p-1.5"
              style={{ boxShadow: "var(--shadow-pop)", transformOrigin: "bottom center" }}
            >
              {MOODS.map((m) => {
                const active = mood === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    role="menuitemradio"
                    aria-checked={active}
                    onClick={() => {
                      setMood(m.id);
                      setMoodOpen(false);
                    }}
                    onMouseEnter={() => previewMood(m.id)}
                    onMouseLeave={() => previewMood(null)}
                    title={`Switch to the ${m.name} color mood`}
                    className={`group flex w-full items-center justify-between gap-3 rounded-xl px-3 py-1.5 text-[13px] transition-colors duration-200 ${
                      active
                        ? "bg-accent-soft font-medium text-accent-deep"
                        : "text-ink-soft hover:bg-card/60 hover:text-ink"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className="h-[18px] w-[18px] shrink-0 rounded-full"
                        style={{
                          background: `linear-gradient(135deg, ${m.colors[0]}, ${m.colors[1]} 50%, ${m.colors[2]})`,
                          boxShadow: active
                            ? `0 0 12px -2px ${MOOD_PALETTES[m.id].glow}`
                            : "0 0 0 1px rgba(255, 255, 255, 0.06)",
                        }}
                      />
                      <span className="truncate">{m.name}</span>
                    </span>
                    {active && (
                      <CheckIcon className="h-3.5 w-3.5 shrink-0 text-accent-deep" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <p className="px-3.5 pt-4 text-xs leading-relaxed text-ink-faint">
          <span className="text-gradient font-serif text-base">
            {stats?.total ?? 0}
          </span>{" "}
          lines kept
        </p>
        <p className="mt-0.5 px-3.5 text-[11px] text-ink-faint">
          Words worth returning to · {new Date().getFullYear()}
        </p>
      </div>
    </aside>
  );
}
