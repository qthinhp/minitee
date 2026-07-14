// "Deep water" design language: dark navy space, glowing aqua accents,
// soft glass cards, rounded everything. One place to tweak the whole vibe.

export const colors = {
  bg: "#050B18",            // near-black navy
  bgTop: "#0B1B33",         // gradient top
  card: "rgba(120, 190, 255, 0.08)",
  cardBorder: "rgba(120, 190, 255, 0.22)",
  aqua: "#39D6FF",
  aquaDeep: "#2F80ED",
  mint: "#3DFFC5",
  text: "#EAF6FF",
  textDim: "rgba(234, 246, 255, 0.62)",
  danger: "#FF7B93",
  gold: "#FFD66B",
  waterTop: "#2F80ED",
  waterBottom: "#39D6FF",
};

export const radii = { sm: 12, md: 18, lg: 26, pill: 999 };

export const spacing = (n: number) => n * 8;

export const type = {
  hero: { fontSize: 52, fontWeight: "800" as const, color: colors.text, letterSpacing: 1 },
  title: { fontSize: 24, fontWeight: "700" as const, color: colors.text, letterSpacing: 0.5 },
  body: { fontSize: 16, color: colors.text, lineHeight: 22 },
  dim: { fontSize: 15, color: colors.textDim, lineHeight: 21 },
  label: { fontSize: 13, fontWeight: "700" as const, color: colors.textDim,
           textTransform: "uppercase" as const, letterSpacing: 1.5 },
};

/** Drippy the mascot reacts to your progress. */
export function mood(pct: number): { face: string; line: string } {
  if (pct <= 0)   return { face: "😴", line: "Drippy is thirsty… wake me up with a sip!" };
  if (pct < 25)   return { face: "🥱", line: "Nice start! Little sips, big wins." };
  if (pct < 50)   return { face: "🙂", line: "Warming up! Your future self says thanks." };
  if (pct < 75)   return { face: "😄", line: "Halfway there — you're on a roll!" };
  if (pct < 100)  return { face: "🤩", line: "SO close! One more bottle to glory." };
  if (pct < 130)  return { face: "🏆", line: "GOAL! You're basically a fountain today ⛲" };
  return          { face: "🐳", line: "Whale mode unlocked. Legendary hydration." };
}
