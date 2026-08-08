export const MOODS = [
  {
    id: "aurora",
    name: "Aurora",
    colors: ["#8b5cff", "#4d7cff", "#00e5ff"],
  },
  {
    id: "sunset",
    name: "Sunset",
    colors: ["#ff4d8d", "#ff2e63", "#ff8a45"],
  },
  {
    id: "ocean",
    name: "Ocean",
    colors: ["#2f6bff", "#00e5ff", "#8b5cff"],
  },
  {
    id: "cyber",
    name: "Cyber",
    colors: ["#00e5ff", "#8b5cff", "#ff3cac"],
  },
  {
    id: "ember",
    name: "Ember",
    colors: ["#ff8a3d", "#ff5e7a", "#ff2e9e"],
  },
  {
    id: "garden",
    name: "Neon Garden",
    colors: ["#a8e84a", "#00e5ff", "#8b5cff"],
  },
] as const;

export type ColorMood = (typeof MOODS)[number]["id"];

export const MOOD_IDS: ColorMood[] = MOODS.map((m) => m.id);

export function isColorMood(value: string | null | undefined): value is ColorMood {
  return !!value && MOOD_IDS.includes(value as ColorMood);
}

export function moodName(id: ColorMood): string {
  return MOODS.find((m) => m.id === id)?.name ?? "Aurora";
}
