// Static class maps so Tailwind's compiler can see full class names
// (dynamic template strings like `bg-${color}-soft` are not detectable by the scanner).

export type PillarColor = "brand" | "amber" | "emerald" | "rose" | "violet" | "sky";

export const PILLAR_BG_SOFT: Record<PillarColor, string> = {
  brand: "bg-brand-soft",
  amber: "bg-amber-soft",
  emerald: "bg-emerald-soft",
  rose: "bg-rose-soft",
  violet: "bg-violet-soft",
  sky: "bg-sky-soft",
};

export const PILLAR_TEXT: Record<PillarColor, string> = {
  brand: "text-brand",
  amber: "text-amber",
  emerald: "text-emerald",
  rose: "text-rose",
  violet: "text-violet",
  sky: "text-sky",
};

export const PILLAR_BG_SOLID: Record<PillarColor, string> = {
  brand: "bg-brand",
  amber: "bg-amber",
  emerald: "bg-emerald",
  rose: "bg-rose",
  violet: "bg-violet",
  sky: "bg-sky",
};

export const PILLAR_HEX: Record<PillarColor, string> = {
  brand: "var(--brand)",
  amber: "var(--accent-amber)",
  emerald: "var(--accent-emerald)",
  rose: "var(--accent-rose)",
  violet: "var(--accent-violet)",
  sky: "var(--accent-sky)",
};

export const PILLAR_BADGE_VARIANT: Record<PillarColor, "default" | "warning" | "success" | "danger" | "violet" | "sky"> = {
  brand: "default",
  amber: "warning",
  emerald: "success",
  rose: "danger",
  violet: "violet",
  sky: "sky",
};
