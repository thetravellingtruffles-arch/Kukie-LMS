import { supabase } from "@/lib/supabase/client";
import type { Completion, CompletionStatus } from "@/lib/types";

function dbToCompletion(row: any): Completion {
  return {
    id: row.id,
    staffId: row.staff_id,
    courseId: row.course_id,
    courseSlug: row.course_slug,
    courseTitle: row.course_title,
    status: row.status,

    knowledgeScore: row.knowledge_score,
    knowledgePassed: row.knowledge_passed,
    knowledgeCompletedAt: row.knowledge_completed_at,

    practicalScore: row.practical_score,
    practicalPassed: row.practical_passed,
    practicalCompletedAt: row.practical_completed_at,
    practicalNotes: row.practical_notes,

    roleplayScore: row.roleplay_score,
    roleplayCompletedAt: row.roleplay_completed_at,

    workbookCompletedAt: row.workbook_completed_at,

    followupCompletedAt: row.followup_completed_at,
    followupReadyForPromotion: row.followup_ready_for_promotion,
    followupNotes: row.followup_notes,

    certificateNumber: row.certificate_number,
    certificateIssuedAt: row.certificate_issued_at,
    certificateExpiresAt: row.certificate_expires_at,

    trainerName: row.trainer_name,
    notes: row.notes,

    createdAt: row.created_at,
    updatedAt: row.updated_at,

    staff: row.staff
      ? {
          id: row.staff.id,
          employeeNumber: row.staff.employee_number,
          name: row.staff.name,
          role: row.staff.role,
          storeName: row.staff.store_name,
          storeId: row.staff.store_id ?? null,
          email: row.staff.email,
          phone: row.staff.phone,
          status: row.staff.status,
          notes: row.staff.notes,
          createdAt: row.staff.created_at,
          updatedAt: row.staff.updated_at,
        }
      : undefined,
  };
}

const SELECT_WITH_STAFF = "*, staff:kukie_academy_staff(*)";

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function fetchCompletions(): Promise<Completion[]> {
  const { data, error } = await supabase
    .from("kukie_academy_completions")
    .select(SELECT_WITH_STAFF)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(dbToCompletion);
}

export async function fetchCompletionsForStaff(staffId: string): Promise<Completion[]> {
  const { data, error } = await supabase
    .from("kukie_academy_completions")
    .select(SELECT_WITH_STAFF)
    .eq("staff_id", staffId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(dbToCompletion);
}

export async function fetchCompletionsForCourse(courseSlug: string): Promise<Completion[]> {
  const { data, error } = await supabase
    .from("kukie_academy_completions")
    .select(SELECT_WITH_STAFF)
    .eq("course_slug", courseSlug)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(dbToCompletion);
}

export async function fetchCompletion(staffId: string, courseSlug: string): Promise<Completion | null> {
  const { data, error } = await supabase
    .from("kukie_academy_completions")
    .select(SELECT_WITH_STAFF)
    .eq("staff_id", staffId)
    .eq("course_slug", courseSlug)
    .maybeSingle();
  if (error) throw error;
  return data ? dbToCompletion(data) : null;
}

/** Self-serve lookup used by the "My Training Record" page — no login required. */
export async function fetchCompletionsByEmployeeNumber(employeeNumber: string): Promise<{ staff: Completion["staff"]; completions: Completion[] } | null> {
  const { data: staffRow, error: staffError } = await supabase
    .from("kukie_academy_staff")
    .select("*")
    .eq("employee_number", employeeNumber.trim())
    .maybeSingle();
  if (staffError) throw staffError;
  if (!staffRow) return null;
  const completions = await fetchCompletionsForStaff(staffRow.id);
  const staff = completions[0]?.staff ?? {
    id: staffRow.id,
    employeeNumber: staffRow.employee_number,
    name: staffRow.name,
    role: staffRow.role,
    storeName: staffRow.store_name,
    storeId: staffRow.store_id ?? null,
    email: staffRow.email,
    phone: staffRow.phone,
    status: staffRow.status,
    notes: staffRow.notes,
    createdAt: staffRow.created_at,
    updatedAt: staffRow.updated_at,
  };
  return { staff, completions };
}

// ---------------------------------------------------------------------------
// Writes — one upsert per stage, keyed on (staff_id, course_slug)
// ---------------------------------------------------------------------------

async function upsertRow(staffId: string, courseSlug: string, courseId: string | null, courseTitle: string | null, patch: Record<string, unknown>): Promise<Completion> {
  const existing = await supabase
    .from("kukie_academy_completions")
    .select("id, status")
    .eq("staff_id", staffId)
    .eq("course_slug", courseSlug)
    .maybeSingle();
  if (existing.error) throw existing.error;

  const payload: Record<string, unknown> = {
    ...patch,
    staff_id: staffId,
    course_slug: courseSlug,
    course_id: courseId,
    course_title: courseTitle,
    updated_at: new Date().toISOString(),
  };

  if (existing.data) {
    const { data, error } = await supabase
      .from("kukie_academy_completions")
      .update(payload)
      .eq("id", existing.data.id)
      .select(SELECT_WITH_STAFF)
      .single();
    if (error) throw error;
    return dbToCompletion(data);
  }

  const { data, error } = await supabase
    .from("kukie_academy_completions")
    .insert({ status: "in-progress", ...payload })
    .select(SELECT_WITH_STAFF)
    .single();
  if (error) throw error;
  return dbToCompletion(data);
}

export interface KnowledgeResultInput {
  staffId: string;
  courseId: string | null;
  courseSlug: string;
  courseTitle?: string | null;
  scorePercent: number;
  passMarkPercent: number;
}

export async function recordKnowledgeResult(input: KnowledgeResultInput): Promise<Completion> {
  const passed = input.scorePercent >= input.passMarkPercent;
  return upsertRow(input.staffId, input.courseSlug, input.courseId, input.courseTitle ?? null, {
    knowledge_score: input.scorePercent,
    knowledge_passed: passed,
    knowledge_completed_at: new Date().toISOString(),
    status: passed ? "in-progress" : "overdue",
  });
}

export interface PracticalResultInput {
  staffId: string;
  courseId: string | null;
  courseSlug: string;
  courseTitle?: string | null;
  score: number; // 1-5 average
  passScore: number;
  notes?: string;
  trainerName?: string;
}

export async function recordPracticalResult(input: PracticalResultInput): Promise<Completion> {
  const passed = input.score >= input.passScore;
  return upsertRow(input.staffId, input.courseSlug, input.courseId, input.courseTitle ?? null, {
    practical_score: input.score,
    practical_passed: passed,
    practical_completed_at: new Date().toISOString(),
    practical_notes: input.notes ?? null,
    trainer_name: input.trainerName ?? null,
    status: "in-progress",
  });
}

export interface RoleplayResultInput {
  staffId: string;
  courseId: string | null;
  courseSlug: string;
  courseTitle?: string | null;
  score: number;
}

export async function recordRoleplayResult(input: RoleplayResultInput): Promise<Completion> {
  return upsertRow(input.staffId, input.courseSlug, input.courseId, input.courseTitle ?? null, {
    roleplay_score: input.score,
    roleplay_completed_at: new Date().toISOString(),
    status: "in-progress",
  });
}

export async function recordWorkbookComplete(staffId: string, courseId: string | null, courseSlug: string, courseTitle?: string | null): Promise<Completion> {
  return upsertRow(staffId, courseSlug, courseId, courseTitle ?? null, {
    workbook_completed_at: new Date().toISOString(),
    status: "in-progress",
  });
}

export interface FollowupInput {
  staffId: string;
  courseId: string | null;
  courseSlug: string;
  courseTitle?: string | null;
  readyForPromotion: boolean;
  notes?: string;
}

export async function recordFollowup(input: FollowupInput): Promise<Completion> {
  return upsertRow(input.staffId, input.courseSlug, input.courseId, input.courseTitle ?? null, {
    followup_completed_at: new Date().toISOString(),
    followup_ready_for_promotion: input.readyForPromotion,
    followup_notes: input.notes ?? null,
    status: "in-progress",
  });
}

function generateCertificateNumber(courseSlug: string): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  const prefix = courseSlug.slice(0, 3).toUpperCase();
  return `KUKIE-${prefix}-${stamp}-${rand}`;
}

export interface IssueCertificateInput {
  staffId: string;
  courseId: string | null;
  courseSlug: string;
  courseTitle?: string | null;
  validityMonths?: number | null;
  trainerName?: string;
}

export async function issueCertificate(input: IssueCertificateInput): Promise<Completion> {
  const issuedAt = new Date();
  const expiresAt = input.validityMonths
    ? new Date(issuedAt.getFullYear(), issuedAt.getMonth() + input.validityMonths, issuedAt.getDate())
    : null;
  return upsertRow(input.staffId, input.courseSlug, input.courseId, input.courseTitle ?? null, {
    certificate_number: generateCertificateNumber(input.courseSlug),
    certificate_issued_at: issuedAt.toISOString(),
    certificate_expires_at: expiresAt ? expiresAt.toISOString() : null,
    trainer_name: input.trainerName ?? null,
    status: "completed",
  });
}

export interface SaveCompletionInput {
  staffId: string;
  courseId: string | null;
  courseSlug: string;
  courseTitle?: string | null;
  knowledgeScore?: number | null;
  passMarkPercent?: number;
  practicalScore?: number | null;
  practicalPassScore?: number;
  practicalNotes?: string | null;
  roleplayScore?: number | null;
  workbookCompleted?: boolean;
  followupReadyForPromotion?: boolean | null;
  followupNotes?: string | null;
  issueCertificate?: boolean;
  validityMonths?: number | null;
  trainerName?: string | null;
  notes?: string | null;
}

/**
 * One-shot save used by the trainer/admin "Log Completion" form — covers
 * every stage in a single upsert, since real practical/role-play/workbook/
 * follow-up UIs don't exist yet for Studio-authored courses (only the
 * knowledge assessment writes for itself, via recordKnowledgeResult).
 */
export async function saveCompletion(input: SaveCompletionInput): Promise<Completion> {
  const patch: Record<string, unknown> = {};

  if (input.knowledgeScore !== undefined && input.knowledgeScore !== null) {
    const passed = input.knowledgeScore >= (input.passMarkPercent ?? 80);
    patch.knowledge_score = input.knowledgeScore;
    patch.knowledge_passed = passed;
    patch.knowledge_completed_at = new Date().toISOString();
  }
  if (input.practicalScore !== undefined && input.practicalScore !== null) {
    const passed = input.practicalScore >= (input.practicalPassScore ?? 4);
    patch.practical_score = input.practicalScore;
    patch.practical_passed = passed;
    patch.practical_completed_at = new Date().toISOString();
    patch.practical_notes = input.practicalNotes ?? null;
  }
  if (input.roleplayScore !== undefined && input.roleplayScore !== null) {
    patch.roleplay_score = input.roleplayScore;
    patch.roleplay_completed_at = new Date().toISOString();
  }
  if (input.workbookCompleted) {
    patch.workbook_completed_at = new Date().toISOString();
  }
  if (input.followupReadyForPromotion !== undefined && input.followupReadyForPromotion !== null) {
    patch.followup_completed_at = new Date().toISOString();
    patch.followup_ready_for_promotion = input.followupReadyForPromotion;
    patch.followup_notes = input.followupNotes ?? null;
  }
  if (input.trainerName) patch.trainer_name = input.trainerName;
  if (input.notes !== undefined) patch.notes = input.notes;

  let status: CompletionStatus = "in-progress";
  if (input.issueCertificate) {
    const issuedAt = new Date();
    const expiresAt = input.validityMonths
      ? new Date(issuedAt.getFullYear(), issuedAt.getMonth() + input.validityMonths, issuedAt.getDate())
      : null;
    patch.certificate_number = generateCertificateNumber(input.courseSlug);
    patch.certificate_issued_at = issuedAt.toISOString();
    patch.certificate_expires_at = expiresAt ? expiresAt.toISOString() : null;
    status = "completed";
  } else if (patch.knowledge_passed === false || patch.practical_passed === false) {
    status = "overdue";
  } else if (Object.keys(patch).length === 0) {
    status = "not-started";
  }
  patch.status = status;

  return upsertRow(input.staffId, input.courseSlug, input.courseId, input.courseTitle ?? null, patch);
}

export async function setCompletionStatus(id: string, status: CompletionStatus): Promise<Completion> {
  const { data, error } = await supabase
    .from("kukie_academy_completions")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(SELECT_WITH_STAFF)
    .single();
  if (error) throw error;
  return dbToCompletion(data);
}

export async function deleteCompletion(id: string): Promise<void> {
  const { error } = await supabase.from("kukie_academy_completions").delete().eq("id", id);
  if (error) throw error;
}

/** True once a certificate has been issued and hasn't expired yet. */
export function isCertificateValid(c: Completion): boolean {
  if (!c.certificateIssuedAt) return false;
  if (!c.certificateExpiresAt) return true;
  return new Date(c.certificateExpiresAt).getTime() > Date.now();
}

export function isCertificateExpiringSoon(c: Completion, withinDays = 60): boolean {
  if (!c.certificateExpiresAt) return false;
  const days = (new Date(c.certificateExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return days > 0 && days <= withinDays;
}
