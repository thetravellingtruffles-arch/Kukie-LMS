import { supabase } from "@/lib/supabase/client";
import type { Staff, StaffStatus, StaffAttendanceRecord } from "@/lib/types";

function dbToStaff(row: any): Staff {
  return {
    id: row.id,
    employeeNumber: row.employee_number,
    name: row.name,
    role: row.role,
    storeName: row.store_name,
    storeId: row.store_id ?? null,
    email: row.email,
    phone: row.phone,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function dbToAttendance(row: any): StaffAttendanceRecord {
  return {
    id: row.id,
    courseSlug: row.course_slug,
    courseTitle: row.course_title,
    staffId: row.staff_id,
    method: row.method,
    checkedInAt: row.checked_in_at,
    staff: row.staff ? dbToStaff(row.staff) : undefined,
  };
}

// ---------------------------------------------------------------------------
// Staff
// ---------------------------------------------------------------------------

export async function fetchStaff(): Promise<Staff[]> {
  const { data, error } = await supabase.from("kukie_academy_staff").select("*").order("name");
  if (error) throw error;
  return (data ?? []).map(dbToStaff);
}

export async function fetchStaffById(id: string): Promise<Staff | null> {
  const { data, error } = await supabase.from("kukie_academy_staff").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? dbToStaff(data) : null;
}

export async function fetchStaffByEmployeeNumber(employeeNumber: string): Promise<Staff | null> {
  const { data, error } = await supabase
    .from("kukie_academy_staff")
    .select("*")
    .eq("employee_number", employeeNumber)
    .maybeSingle();
  if (error) throw error;
  return data ? dbToStaff(data) : null;
}

export interface NewStaffInput {
  employeeNumber: string;
  name: string;
  role?: string;
  storeName?: string;
  storeId?: string | null;
  email?: string;
  phone?: string;
  notes?: string;
}

export async function createStaff(input: NewStaffInput): Promise<Staff> {
  const { data, error } = await supabase
    .from("kukie_academy_staff")
    .insert({
      employee_number: input.employeeNumber,
      name: input.name,
      role: input.role ?? null,
      store_name: input.storeName ?? null,
      store_id: input.storeId ?? null,
      email: input.email ?? null,
      phone: input.phone ?? null,
      notes: input.notes ?? null,
      status: "active",
    })
    .select()
    .single();
  if (error) throw error;
  return dbToStaff(data);
}

export async function updateStaff(id: string, patch: Partial<{
  name: string; role: string | null; storeName: string | null; storeId: string | null; email: string | null;
  phone: string | null; status: StaffStatus; notes: string | null;
}>): Promise<Staff> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.name !== undefined) payload.name = patch.name;
  if (patch.role !== undefined) payload.role = patch.role;
  if (patch.storeName !== undefined) payload.store_name = patch.storeName;
  if (patch.storeId !== undefined) payload.store_id = patch.storeId;
  if (patch.email !== undefined) payload.email = patch.email;
  if (patch.phone !== undefined) payload.phone = patch.phone;
  if (patch.status !== undefined) payload.status = patch.status;
  if (patch.notes !== undefined) payload.notes = patch.notes;
  const { data, error } = await supabase.from("kukie_academy_staff").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return dbToStaff(data);
}

export async function deleteStaff(id: string): Promise<void> {
  const { error } = await supabase.from("kukie_academy_staff").delete().eq("id", id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Attendance (QR check-in)
// ---------------------------------------------------------------------------

/**
 * Look up a staff record by scanned QR payload, or auto-create one if the
 * code isn't recognized. QR badges encode "KUKIE-STAFF:<employeeNumber>".
 * If the payload doesn't decode to a known staff member, the caller should
 * fall back to a quick-create form rather than calling this blind — this
 * helper only handles the "already exists" half of the lookup.
 */
export function parseStaffQrPayload(raw: string): string | null {
  const trimmed = raw.trim();
  const match = trimmed.match(/^KUKIE-STAFF:(.+)$/);
  const employeeNumber = match ? match[1] : trimmed;
  return employeeNumber.length > 0 ? employeeNumber : null;
}

export async function checkInStaff(input: {
  staffId: string;
  courseSlug: string;
  courseTitle?: string;
  method?: "qr" | "manual";
}): Promise<StaffAttendanceRecord> {
  const { data, error } = await supabase
    .from("kukie_academy_attendance")
    .insert({
      staff_id: input.staffId,
      course_slug: input.courseSlug,
      course_title: input.courseTitle ?? null,
      method: input.method ?? "qr",
    })
    .select()
    .single();
  if (error) throw error;
  return dbToAttendance(data);
}

export async function fetchAttendanceForCourse(courseSlug: string): Promise<StaffAttendanceRecord[]> {
  const { data, error } = await supabase
    .from("kukie_academy_attendance")
    .select("*, staff:kukie_academy_staff(*)")
    .eq("course_slug", courseSlug)
    .order("checked_in_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(dbToAttendance);
}
