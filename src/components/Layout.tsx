import { Link, NavLink, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useTheme } from "../theme";
import { NAV_ITEMS } from "./nav";
import { MoonIcon, PlusIcon, SunIcon } from "./icons";

function MobileTopBar() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-sidebar/95 backdrop-blur lg:hidden">
      <div className="flex items-center justify-between px-5 pb-2 pt-4">
        <Link to="/" className="flex items-baseline gap-0.5">
          <span className="font-serif text-[24px] leading-none tracking-tight text-ink">
            Maple
          </span>
          <span className="font-serif text-[24px] leading-none text-accent">.</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-soft transition hover:bg-card/60 hover:text-ink"
          >
            {isDark ? (
              <MoonIcon className="h-5 w-5" />
            ) : (
              <SunIcon className="h-5 w-5" />
            )}
          </button>
          <Link
            to="/add"
            aria-label="New save"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white transition hover:bg-accent-deep"
          >
            <PlusIcon className="h-5 w-5" />
          </Link>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-5 pb-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
                isActive
                  ? "bg-accent-soft text-accent-deep"
                  : "text-ink-soft hover:bg-card/60 hover:text-ink"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

export default function Layout() {
  return (
    <div className="min-h-screen bg-paper">
      <Sidebar />
      <MobileTopBar />
      <main className="lg:pl-[264px]">
        <div className="mx-auto max-w-[1060px] px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
