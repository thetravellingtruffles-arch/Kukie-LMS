import { supabase } from "@/lib/supabase/client";
import { DAY_TO_ISO } from "./trainer-meta";
import type { TrainerMeta } from "./trainer-meta";
import type { NewSessionRequest, PreferredDay, TrainerAvailability, TrainingSession } from "./types";

export async function fetchSessions(range?: { from: string; to: string }) {
  let query = supabase.from("kukie_academy_training_sessions").select("*").order("preferred_week_start", { ascending: true });
  if (range) {
    // include sessions confirmed within range OR still-pending requests for that week range
    query = query.or(
      `and(session_date.gte.${range.from},session_date.lte.${range.to}),and(session_date.is.null,preferred_week_start.gte.${range.from},preferred_week_start.lte.${range.to})`
    );
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as TrainingSession[];
}

export async function fetchAllSessions() {
  const { data, error } = await supabase
    .from("kukie_academy_training_sessions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  return (data ?? []) as TrainingSession[];
}

export async function fetchAvailability() {
  const { data, error } = await supabase.from("kukie_academy_trainer_availability").select("*");
  if (error) throw error;
  return (data ?? []) as TrainerAvailability[];
}

/** Candidate dates for a given preferred day within a given week-start (Monday). */
export function candidateDate(weekStart: string, day: PreferredDay) {
  const start = new Date(weekStart + "T00:00:00");
  const offset = DAY_TO_ISO[day] - 1; // Monday = weekStart + 0
  const d = new Date(start);
  d.setDate(start.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

const SLOT_TIMES = ["09:00", "10:30", "13:00", "14:30"];

export interface SlotOption {
  time: string;
  label: string;
  available: boolean;
}

/**
 * Real availability check: a trainer is available on the candidate date if
 * (a) their weekly working-day pattern covers it, and (b) no existing
 * pending/confirmed session already occupies that time slot.
 */
export async function getAvailableSlots(trainerId: string, weekStart: string, day: PreferredDay): Promise<SlotOption[]> {
  const [{ data: avail }, date] = await Promise.all([
    supabase
      .from("kukie_academy_trainer_availability")
      .select("*")
      .eq("trainer_id", trainerId)
      .eq("day_of_week", DAY_TO_ISO[day])
      .maybeSingle(),
    Promise.resolve(candidateDate(weekStart, day)),
  ]);

  if (!avail || !avail.is_available) {
    return SLOT_TIMES.map((t) => ({ time: t, label: t, available: false }));
  }

  const { data: existing } = await supabase
    .from("kukie_academy_training_sessions")
    .select("start_time,status")
    .eq("trainer_id", trainerId)
    .eq("session_date", date)
    .in("status", ["pending", "confirmed", "completed"]);

  const taken = new Set((existing ?? []).map((r) => (r.start_time ?? "").slice(0, 5)));

  return SLOT_TIMES.map((t) => ({ time: t, label: t, available: !taken.has(t) }));
}

export async function findAvailableTrainer(trainers: TrainerMeta[], weekStart: string, day: PreferredDay, regionId: string, time: string) {
  const date = candidateDate(weekStart, day);
  const regional = trainers.filter((t) => t.regionId === regionId);
  const pool = regional.length ? regional : trainers;

  for (const trainer of pool) {
    const { data: avail } = await supabase
      .from("kukie_academy_trainer_availability")
      .select("*")
      .eq("trainer_id", trainer.id)
      .eq("day_of_week", DAY_TO_ISO[day])
      .maybeSingle();
    if (!avail?.is_available) continue;

    const { data: existing } = await supabase
      .from("kukie_academy_training_sessions")
      .select("id")
      .eq("trainer_id", trainer.id)
      .eq("session_date", date)
      .eq("start_time", time)
      .in("status", ["pending", "confirmed", "completed"]);

    if (!existing || existing.length === 0) return trainer;
  }
  return null;
}

export async function createSession(payload: NewSessionRequest) {
  const { data, error } = await supabase.from("kukie_academy_training_sessions").insert(payload).select().single();
  if (error) throw error;
  return data as TrainingSession;
}

export async function updateSessionStatus(id: string, status: TrainingSession["status"], patch?: Partial<TrainingSession>) {
  const { data, error } = await supabase
    .from("kukie_academy_training_sessions")
    .update({ status, updated_at: new Date().toISOString(), ...patch })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as TrainingSession;
}
