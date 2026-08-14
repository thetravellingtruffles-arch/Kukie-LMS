export type PreferredDay = "Monday" | "Tuesday" | "Wednesday" | "Thursday";
export type SessionStatus = "pending" | "confirmed" | "declined" | "completed" | "cancelled";

export interface TrainerAvailability {
  id: string;
  trainer_id: string;
  day_of_week: number; // 1=Mon .. 7=Sun
  is_available: boolean;
  start_time: string; // "09:00:00"
  end_time: string;
}

export interface TrainingSession {
  id: string;
  course_id: string | null;
  course_slug: string;

  store_id: string;
  region_id: string;
  requested_by: string;
  requested_by_role: string | null;
  attendee_count: number;

  preferred_trainer_id: string | null;
  preferred_day: PreferredDay;
  preferred_week_start: string; // date

  trainer_id: string | null;
  session_date: string | null; // date
  start_time: string | null;
  end_time: string | null;

  status: SessionStatus;
  notes: string | null;

  created_at: string;
  updated_at: string;
}

export interface NewSessionRequest {
  store_id: string;
  region_id: string;
  requested_by: string;
  requested_by_role: string;
  attendee_count: number;
  preferred_trainer_id: string | null;
  preferred_day: PreferredDay;
  preferred_week_start: string;
  trainer_id: string | null;
  session_date: string | null;
  start_time: string | null;
  end_time: string | null;
  status: SessionStatus;
}
