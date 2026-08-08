import { createContext, useContext, useLayoutEffect, useState } from "react";
import type { ReactNode } from "react";
import { MOOD_PALETTES, MOOD_ORDER } from "./moodTheme";
import { isColorMood } from "./moods";
import type { ColorMood } from "./moods";

interface ThemeContextValue {
  mood: ColorMood;
  setMood: (mood: ColorMood) => void;
  cycleMood: () => void;
  previewMood: (mood: ColorMood | null) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "margin:mood";

function initialMood(): ColorMood {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isColorMood(stored)) return stored;
  } catch {
    /* ignore */
  }
  return "aurora";
}

function applyMoodVars(mood: ColorMood) {
  const p = MOOD_PALETTES[mood];
  const root = document.documentElement;
  const vars: Record<string, string> = {
    "--mood-primary": p.primary,
    "--mood-secondary": p.secondary,
    "--mood-tertiary": p.tertiary,
    "--mood-highlight": p.highlight,
    "--mood-gradient": p.gradient,
    "--mood-gradient-strong": p.gradientStrong,
    "--mood-glow": p.glow,
    "--mood-glow-strong": p.glowStrong,
    "--mood-glow-soft": p.glowSoft,
    "--mood-glow-secondary": p.glowSecondary,
    "--mood-glow-tertiary": p.glowTertiary,
    "--mood-soft": p.soft,
    "--mood-border": p.border,
    "--color-accent": p.primary,
    "--color-accent-deep": p.highlight,
    "--color-accent-soft": p.soft,
    "--ambient-a": p.ambientA,
    "--ambient-b": p.ambientB,
    "--ambient-c": p.ambientC,
    "--ambient-glow": p.ambientGlow,
  };
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mood, setMoodState] = useState<ColorMood>(initialMood);

  useLayoutEffect(() => {
    document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = "dark";
    applyMoodVars(mood);
    try {
      localStorage.setItem(STORAGE_KEY, mood);
    } catch {
      /* ignore */
    }
  }, [mood]);

  const setMood = (next: ColorMood) => {
    if (next === mood) return;
    const root = document.documentElement;
    root.classList.add("mood-switching");
    setMoodState(next);
    window.setTimeout(() => root.classList.remove("mood-switching"), 650);
  };

  const cycleMood = () => {
    const index = MOOD_ORDER.indexOf(mood);
    setMood(MOOD_ORDER[(index + 1) % MOOD_ORDER.length]);
  };

  const previewMood = (next: ColorMood | null) => {
    applyMoodVars(next ?? mood);
  };

  return (
    <ThemeContext.Provider value={{ mood, setMood, cycleMood, previewMood }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
