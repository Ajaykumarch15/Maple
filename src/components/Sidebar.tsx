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
      <div className="px-7 pb-6 pt-8">
        <Link to="/" className="flex items-baseline gap-0.5">
          <span className="font-serif text-[28px] leading-none tracking-tight text-ink">
            Margin
          </span>
          <span className="font-serif text-[28px] leading-none text-accent">
            .
          </span>
        </Link>
        <p className="eyebrow mt-2.5">A commonplace book</p>
      </div>

      <div className="px-5">
        <Link to="/add" className="btn-primary w-full">
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
                `group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition ${
                  isActive
                    ? "border border-border bg-card/85 font-medium text-ink shadow-[0_1px_3px_rgba(36,33,29,0.05)]"
                    : "border border-transparent text-ink-soft hover:bg-card/55 hover:text-ink"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`h-[18px] w-[18px] transition ${
                      isActive
                        ? "text-accent"
                        : "text-ink-faint group-hover:text-ink-soft"
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
          className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm text-ink-soft transition hover:bg-card/60 hover:text-ink"
        >
          <span className="flex items-center gap-3">
            {isDark ? (
              <MoonIcon className="h-[18px] w-[18px] text-ink-faint" />
            ) : (
              <SunIcon className="h-[18px] w-[18px] text-ink-faint" />
            )}
            {isDark ? "Midnight" : "Daylight"}
          </span>
          <span
            className={`h-2 w-2 rounded-full ${isDark ? "bg-accent" : "bg-border-strong"}`}
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
