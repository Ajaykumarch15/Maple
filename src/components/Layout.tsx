import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useTheme } from "../theme";
import { NAV_ITEMS } from "./nav";
import { PlusIcon } from "./icons";
import { moodName } from "../moods";

function AmbientBackground() {
  return (
    <div className="ambient-bg" aria-hidden="true">
      <div className="ambient-aurora" />
      <div className="ambient-blob ambient-blob--a" />
      <div className="ambient-blob ambient-blob--b" />
      <div className="ambient-blob ambient-blob--c" />
      <div className="absolute inset-0 ambient-noise" />
    </div>
  );
}

function MobileTopBar() {
  const { mood, cycleMood } = useTheme();

  return (
    <header className="glass sticky top-0 z-40 border-b border-border lg:hidden">
      <div className="flex items-center justify-between px-5 pb-2 pt-4">
        <Link to="/" className="flex items-baseline gap-0.5">
          <span className="font-serif text-[24px] leading-none tracking-tight text-ink">
            Maple
          </span>
          <span className="bg-gradient-primary bg-clip-text font-serif text-[24px] leading-none text-transparent">.</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={cycleMood}
            aria-label={`Color mood: ${moodName(mood)}`}
            title={`Color mood: ${moodName(mood)}`}
            className="group inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-soft transition hover:bg-card/60 hover:text-ink"
          >
            <span
              aria-hidden="true"
              className="h-5 w-5 rounded-full transition-transform duration-300 group-hover:rotate-45"
              style={{ background: "var(--mood-gradient)" }}
            />
          </button>
          <Link
            to="/add"
            aria-label="New save"
            className="bg-gradient-primary inline-flex h-10 w-10 items-center justify-center rounded-full text-white shadow-[0_6px_18px_-6px_var(--mood-glow)] transition hover:brightness-110"
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
                  ? "bg-gradient-primary text-white shadow-[0_6px_18px_-8px_var(--mood-glow-strong)]"
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
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <AmbientBackground />
      <Sidebar />
      <MobileTopBar />
      <main className="lg:pl-[264px]">
        <div
          key={location.pathname}
          className="page-enter mx-auto max-w-[1060px] px-5 py-8 sm:px-8 lg:px-10 lg:py-12"
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}
