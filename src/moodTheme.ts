import { MOODS } from "./moods";
import type { ColorMood } from "./moods";

export interface MoodPalette {
  id: ColorMood;
  name: string;
  primary: string;
  secondary: string;
  tertiary: string;
  highlight: string;
  gradient: string;
  gradientStrong: string;
  glow: string;
  glowStrong: string;
  glowSoft: string;
  glowSecondary: string;
  glowTertiary: string;
  soft: string;
  border: string;
  ambientA: string;
  ambientB: string;
  ambientC: string;
  ambientGlow: string;
}

function rgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface PaletteSeed {
  primary: string;
  secondary: string;
  tertiary: string;
  highlight: string;
}

const HIGHLIGHTS: Record<ColorMood, string> = {
  aurora: "#a78bfa",
  sunset: "#ff9db8",
  ocean: "#7aa2ff",
  cyber: "#7fe9ff",
  ember: "#ffb27a",
  garden: "#c9f57d",
};

function buildPalette(
  seed: PaletteSeed,
  id: ColorMood,
  name: string,
): MoodPalette {
  return {
    id,
    name,
    ...seed,
    gradient: `linear-gradient(120deg, ${seed.primary} 0%, ${seed.secondary} 48%, ${seed.tertiary} 100%)`,
    gradientStrong: `linear-gradient(120deg, ${seed.primary} 0%, ${seed.secondary} 42%, ${seed.tertiary} 100%)`,
    glow: rgba(seed.primary, 0.55),
    glowStrong: rgba(seed.primary, 0.72),
    glowSoft: rgba(seed.primary, 0.28),
    glowSecondary: rgba(seed.secondary, 0.5),
    glowTertiary: rgba(seed.tertiary, 0.45),
    soft: rgba(seed.primary, 0.14),
    border: rgba(seed.primary, 0.45),
    ambientA: rgba(seed.primary, 0.16),
    ambientB: rgba(seed.secondary, 0.11),
    ambientC: rgba(seed.tertiary, 0.1),
    ambientGlow: rgba(seed.primary, 0.14),
  };
}

function paletteFor(m: (typeof MOODS)[number]): MoodPalette {
  const seed: PaletteSeed = {
    primary: m.colors[0],
    secondary: m.colors[1],
    tertiary: m.colors[2],
    highlight: HIGHLIGHTS[m.id],
  };
  return buildPalette(seed, m.id, m.name);
}

export const MOOD_PALETTES = Object.fromEntries(
  MOODS.map((m) => [m.id, paletteFor(m)]),
) as Record<ColorMood, MoodPalette>;

export const MOOD_ORDER: ColorMood[] = MOODS.map((m) => m.id);
