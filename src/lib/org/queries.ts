import { supabase } from "@/lib/supabase/client";
import type { OrgRegion, OrgStore, OrgManager, OrgTrainer, OrgStatus } from "@/lib/types";

function dbToRegion(row: any): OrgRegion {
  return { id: row.id, code: row.code, name: row.name, createdAt: row.created_at, updatedAt: row.updated_at };
}
function dbToStore(row: any): OrgStore {
  return {
    id: row.id, code: row.code, name: row.name, city: row.city, regionId: row.region_id,
    format: row.format, openedYear: row.opened_year, status: row.status,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}
function dbToManager(row: any): OrgManager {
  return {
    id: row.id, name: row.name, title: row.title, storeId: row.store_id,
    email: row.email, phone: row.phone, createdAt: row.created_at, updatedAt: row.updated_at,
  };
}
function dbToTrainer(row: any): OrgTrainer {
  return {
    id: row.id, name: row.name, email: row.email, phone: row.phone, regionId: row.region_id,
    certifiedSince: row.certified_since, specialties: row.specialties ?? [], status: row.status,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

// ---------------------------------------------------------------------------
// Regions
// ---------------------------------------------------------------------------

export async function fetchRegions(): Promise<OrgRegion[]> {
  const { data, error } = await supabase.from("kukie_academy_regions").select("*").order("name");
  if (error) throw error;
  return (data ?? []).map(dbToRegion);
}

export async function createRegion(input: { code: string; name: string }): Promise<OrgRegion> {
  const { data, error } = await supabase.from("kukie_academy_regions").insert({ code: input.code, name: input.name }).select().single();
  if (error) throw error;
  return dbToRegion(data);
}

export async function deleteRegion(id: string): Promise<void> {
  const { error } = await supabase.from("kukie_academy_regions").delete().eq("id", id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Stores
// ---------------------------------------------------------------------------

export async function fetchStores(): Promise<OrgStore[]> {
  const { data, error } = await supabase.from("kukie_academy_stores").select("*").order("name");
  if (error) throw error;
  return (data ?? []).map(dbToStore);
}

export interface NewStoreInput {
  code: string;
  name: string;
  city?: string;
  regionId?: string | null;
  format?: string;
  openedYear?: number;
}

export async function createStore(input: NewStoreInput): Promise<OrgStore> {
  const { data, error } = await supabase
    .from("kukie_academy_stores")
    .insert({
      code: input.code, name: input.name, city: input.city ?? null, region_id: input.regionId ?? null,
      format: input.format ?? null, opened_year: input.openedYear ?? null, status: "active",
    })
    .select()
    .single();
  if (error) throw error;
  return dbToStore(data);
}

export async function updateStore(id: string, patch: Partial<{
  name: string; city: string | null; regionId: string | null; format: string | null; openedYear: number | null; status: OrgStatus;
}>): Promise<OrgStore> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.name !== undefined) payload.name = patch.name;
  if (patch.city !== undefined) payload.city = patch.city;
  if (patch.regionId !== undefined) payload.region_id = patch.regionId;
  if (patch.format !== undefined) payload.format = patch.format;
  if (patch.openedYear !== undefined) payload.opened_year = patch.openedYear;
  if (patch.status !== undefined) payload.status = patch.status;
  const { data, error } = await supabase.from("kukie_academy_stores").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return dbToStore(data);
}

export async function deleteStore(id: string): Promise<void> {
  const { error } = await supabase.from("kukie_academy_stores").delete().eq("id", id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Managers
// ---------------------------------------------------------------------------

export async function fetchManagers(): Promise<OrgManager[]> {
  const { data, error } = await supabase.from("kukie_academy_managers").select("*").order("name");
  if (error) throw error;
  return (data ?? []).map(dbToManager);
}

export async function createManager(input: { name: string; title?: string; storeId?: string | null; email?: string; phone?: string }): Promise<OrgManager> {
  const { data, error } = await supabase
    .from("kukie_academy_managers")
    .insert({ name: input.name, title: input.title ?? null, store_id: input.storeId ?? null, email: input.email ?? null, phone: input.phone ?? null })
    .select()
    .single();
  if (error) throw error;
  return dbToManager(data);
}

export async function deleteManager(id: string): Promise<void> {
  const { error } = await supabase.from("kukie_academy_managers").delete().eq("id", id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Trainers
// ---------------------------------------------------------------------------

export async function fetchTrainers(): Promise<OrgTrainer[]> {
  const { data, error } = await supabase.from("kukie_academy_trainers").select("*").order("name");
  if (error) throw error;
  return (data ?? []).map(dbToTrainer);
}

export interface NewTrainerInput {
  name: string;
  email?: string;
  phone?: string;
  regionId?: string | null;
  certifiedSince?: string;
  specialties?: string[];
}

export async function createTrainer(input: NewTrainerInput): Promise<OrgTrainer> {
  const { data, error } = await supabase
    .from("kukie_academy_trainers")
    .insert({
      name: input.name, email: input.email ?? null, phone: input.phone ?? null, region_id: input.regionId ?? null,
      certified_since: input.certifiedSince ?? null, specialties: input.specialties ?? [], status: "active",
    })
    .select()
    .single();
  if (error) throw error;
  return dbToTrainer(data);
}

export async function updateTrainer(id: string, patch: Partial<{
  name: string; email: string | null; phone: string | null; regionId: string | null; status: OrgStatus;
}>): Promise<OrgTrainer> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.name !== undefined) payload.name = patch.name;
  if (patch.email !== undefined) payload.email = patch.email;
  if (patch.phone !== undefined) payload.phone = patch.phone;
  if (patch.regionId !== undefined) payload.region_id = patch.regionId;
  if (patch.status !== undefined) payload.status = patch.status;
  const { data, error } = await supabase.from("kukie_academy_trainers").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return dbToTrainer(data);
}

export async function deleteTrainer(id: string): Promise<void> {
  const { error } = await supabase.from("kukie_academy_trainers").delete().eq("id", id);
  if (error) throw error;
}
