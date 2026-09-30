import { supabase } from "@/lib/supabase/client";

/**
 * The set of store ids the current signed-in user may see on admin-facing
 * performance/compliance pages, resolved server-side by the
 * kukie_academy_accessible_store_ids() Postgres function (single source of
 * truth, also usable directly in SQL/RLS elsewhere later).
 *
 * Returns "all" for admin/vp (every store, no filtering needed) or an array
 * of store ids for operations/area_manager. An empty array means the user
 * has a scoped role but no brand/area has been assigned to them yet.
 */
export async function fetchAccessibleStoreIds(role: string | null | undefined): Promise<"all" | string[]> {
  if (role === "admin" || role === "vp") return "all";
  const { data, error } = await supabase.rpc("kukie_academy_accessible_store_ids");
  if (error) throw error;
  return (data ?? []).map((row: { id?: string } | string) => (typeof row === "string" ? row : row.id ?? ""));
}

export interface BrandAccessRow {
  brandId: string;
  brandName: string;
  brandCode: string;
}
export async function fetchUserBrandAccess(userId: string): Promise<BrandAccessRow[]> {
  const { data, error } = await supabase
    .from("kukie_academy_user_brand_access")
    .select("brand_id, brand:kukie_academy_brands(id, name, code)")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((row: any) => ({ brandId: row.brand_id, brandName: row.brand?.name ?? "", brandCode: row.brand?.code ?? "" }));
}

export interface AreaAccessRow {
  regionId: string;
  regionName: string;
}
export async function fetchUserAreaAccess(userId: string): Promise<AreaAccessRow[]> {
  const { data, error } = await supabase
    .from("kukie_academy_user_area_access")
    .select("region_id, region:kukie_academy_regions(id, name)")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((row: any) => ({ regionId: row.region_id, regionName: row.region?.name ?? "" }));
}

export async function setUserBrandAccess(userId: string, brandIds: string[]): Promise<void> {
  await supabase.from("kukie_academy_user_brand_access").delete().eq("user_id", userId);
  if (brandIds.length === 0) return;
  const { error } = await supabase
    .from("kukie_academy_user_brand_access")
    .insert(brandIds.map((brand_id) => ({ user_id: userId, brand_id })));
  if (error) throw error;
}

export async function setUserAreaAccess(userId: string, regionIds: string[]): Promise<void> {
  await supabase.from("kukie_academy_user_area_access").delete().eq("user_id", userId);
  if (regionIds.length === 0) return;
  const { error } = await supabase
    .from("kukie_academy_user_area_access")
    .insert(regionIds.map((region_id) => ({ user_id: userId, region_id })));
  if (error) throw error;
}

export async function setUserRole(userId: string, role: string): Promise<void> {
  const { error } = await supabase.from("kukie_academy_user_profiles").update({ role }).eq("id", userId);
  if (error) throw error;
}

export interface UserProfileRow {
  id: string;
  email: string;
  role: string | null;
  createdAt: string;
}

/**
 * Every user profile — for the admin-only Organization Setup "Users &
 * Access" panel. Admin is the only role that can reach this (RLS + the
 * RequireRole gate on /organization), so a full unfiltered list is safe here.
 */
export async function fetchAllUsers(): Promise<UserProfileRow[]> {
  const { data, error } = await supabase
    .from("kukie_academy_user_profiles")
    .select("id, email, role, created_at")
    .order("email", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row: any) => ({ id: row.id, email: row.email, role: row.role, createdAt: row.created_at }));
}
