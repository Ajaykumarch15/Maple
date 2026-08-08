import { Link, NavLink } from "react-router-dom";
import { useQuotes } from "../store/quotes";
import { useTheme } from "../theme";
import { NAV_ITEMS } from "./nav";
import { MoonIcon, PlusIcon, SunIcon } from "./icons";

export default function Sidebar() {
  const { stats } = useQuotes();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col border-r border-border bg-sidebar lg:flex">
      <div
        className="pointer-events-none absolute inset-0 ambient-noise"
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
          <span className="font-serif text-[28px] leading-none text-accent transition-transform duration-300 group-hover:translate-x-0.5">
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

      <nav className="mt-8 flex-1 space-y-1 px-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors duration-200 ${
                  isActive
                    ? "bg-accent-soft font-medium text-ink"
                    : "text-ink-soft hover:bg-card/55 hover:text-ink"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-accent transition-all duration-300 ${
                      isActive
                        ? "translate-x-0 opacity-100"
                        : "-translate-x-1 opacity-0"
                    }`}
                  />
                  <Icon
                    className={`h-[18px] w-[18px] transition-all duration-200 ${
                      isActive
                        ? "text-accent"
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

      <div className="border-t border-border/80 px-4 pb-5 pt-4">
        <button
          type="button"
          onClick={toggleTheme}
          className="group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm text-ink-soft transition-colors duration-200 hover:bg-card/60 hover:text-ink"
        >
          <span className="flex items-center gap-3">
            {isDark ? (
              <MoonIcon className="h-[18px] w-[18px] text-ink-faint transition-transform duration-300 group-hover:-rotate-12" />
            ) : (
              <SunIcon className="h-[18px] w-[18px] text-ink-faint transition-transform duration-300 group-hover:rotate-45" />
            )}
            {isDark ? "Midnight" : "Daylight"}
          </span>
          <span
            className={`h-2 w-2 rounded-full transition-colors duration-300 ${
              isDark ? "bg-accent" : "bg-border-strong"
            }`}
            aria-hidden="true"
          />
        </button>
        <p className="px-3.5 pt-3 text-xs leading-relaxed text-ink-faint">
          <span className="font-serif text-base text-ink">
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
