import type { OrgStore, OrgTrainer } from "@/lib/types";
import type { PreferredDay } from "./types";

export const WORKING_DAYS: PreferredDay[] = ["Monday", "Tuesday", "Wednesday", "Thursday"];

export const DAY_TO_ISO: Record<PreferredDay, number> = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
};

const TRAINER_COLOR_VARS = ["var(--trainer-1)", "var(--trainer-2)", "var(--trainer-3)", "var(--trainer-4)"];
const TRAINER_COLOR_CLASSES = {
  bg: ["bg-trainer-1", "bg-trainer-2", "bg-trainer-3", "bg-trainer-4"],
  text: ["text-trainer-1", "text-trainer-2", "text-trainer-3", "text-trainer-4"],
};

export interface TrainerMeta {
  id: string;
  name: string;
  regionId: string | null;
  colorVar: string;
  colorIndex: number;
}

/**
 * Real trainers (from useOrgData) mapped to the same TrainerMeta shape the
 * scheduling UI already expects, with a deterministic display color assigned
 * by list position.
 */
export function toTrainerMeta(trainers: OrgTrainer[]): TrainerMeta[] {
  return trainers.map((t, i) => ({
    id: t.id,
    name: t.name,
    regionId: t.regionId,
    colorVar: TRAINER_COLOR_VARS[i % TRAINER_COLOR_VARS.length],
    colorIndex: i % TRAINER_COLOR_VARS.length,
  }));
}

export function trainerById(trainers: TrainerMeta[], id: string | null | undefined) {
  return trainers.find((t) => t.id === id);
}

export function trainerColorClass(trainers: TrainerMeta[], id: string | null | undefined, kind: "bg" | "text" = "bg") {
  const t = trainerById(trainers, id);
  if (!t) return kind === "bg" ? "bg-border-strong" : "text-muted-foreground";
  return TRAINER_COLOR_CLASSES[kind][t.colorIndex];
}

export function storeMeta(stores: OrgStore[], storeId: string | null | undefined) {
  return stores.find((s) => s.id === storeId);
}
