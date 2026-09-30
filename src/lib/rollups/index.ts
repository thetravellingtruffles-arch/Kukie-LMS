// Real-data rollups — replaces src/lib/data/selectors.ts (which computed
// stats over the fake seeded-random Dataset). Everything here is computed
// client-side over real Supabase rows (staff, org, completions, attendance),
// fetched via fetchOrgSnapshot(). Volumes are small (dozens/hundreds of
// rows), so plain in-memory aggregation is fine — no SQL aggregation needed.

import { fetchStaff, fetchAllAttendance } from "@/lib/staff/queries";
import { fetchStores, fetchRegions, fetchManagers, fetchTrainers } from "@/lib/org/queries";
import { fetchCompletions } from "@/lib/completions/queries";
import type {
  Staff, OrgStore, OrgRegion, OrgManager, OrgTrainer, Completion, StaffAttendanceRecord,
} from "@/lib/types";

export interface OrgSnapshot {
  staff: Staff[];
  stores: OrgStore[];
  regions: OrgRegion[];
  managers: OrgManager[];
  trainers: OrgTrainer[];
  completions: Completion[];
  attendance: StaffAttendanceRecord[];
}

export async function fetchOrgSnapshot(): Promise<OrgSnapshot> {
  const [staff, stores, regions, managers, trainers, completions, attendance] = await Promise.all([
    fetchStaff(),
    fetchStores(),
    fetchRegions(),
    fetchManagers(),
    fetchTrainers(),
    fetchCompletions(),
    fetchAllAttendance(),
  ]);
  return { staff, stores, regions, managers, trainers, completions, attendance };
}

function avg(nums: number[]): number {
  if (!nums.length) return 0;
  return nums.reduce((s, n) => s + n, 0) / nums.length;
}

export function isCertified(c: Completion): boolean {
  return !!c.certificateNumber;
}

export function completionsForStaff(completions: Completion[], staffIds: Set<string>): Completion[] {
  return completions.filter((c) => staffIds.has(c.staffId));
}

export function complianceRate(staffList: Staff[], completions: Completion[]): number {
  if (!staffList.length) return 0;
  const ids = new Set(staffList.map((s) => s.id));
  const certifiedStaff = new Set(
    completions.filter((c) => isCertified(c) && ids.has(c.staffId)).map((c) => c.staffId)
  );
  return (certifiedStaff.size / staffList.length) * 100;
}

export function avgKnowledgeScore(completions: Completion[]): number {
  return avg(completions.filter((c) => c.knowledgeScore != null).map((c) => c.knowledgeScore as number));
}

export function avgPracticalScore(completions: Completion[]): number {
  return avg(completions.filter((c) => c.practicalScore != null).map((c) => c.practicalScore as number));
}

export function certificatesCount(completions: Completion[]): number {
  return completions.filter(isCertified).length;
}

export interface StoreSummary {
  store: OrgStore | undefined;
  staffList: Staff[];
  compliance: number;
  avgQuiz: number;
  avgPractical: number;
  certificates: number;
  overdueStaff: Staff[];
  topStaff: { staff: Staff; quiz: number; practical: number; combined: number }[];
  manager?: OrgManager;
}

export function storeSummary(snap: OrgSnapshot, storeId: string): StoreSummary {
  const store = snap.stores.find((s) => s.id === storeId);
  const staffList = snap.staff.filter((s) => s.storeId === storeId);
  const ids = new Set(staffList.map((s) => s.id));
  const comps = completionsForStaff(snap.completions, ids);

  const overdueStaffIds = new Set(comps.filter((c) => c.status === "overdue").map((c) => c.staffId));
  const overdueStaff = staffList.filter((s) => overdueStaffIds.has(s.id));

  const topStaff = staffList
    .map((s) => {
      const staffComps = comps.filter((c) => c.staffId === s.id);
      if (!staffComps.length) return null;
      const quiz = avg(staffComps.filter((c) => c.knowledgeScore != null).map((c) => c.knowledgeScore as number));
      const practical = avg(staffComps.filter((c) => c.practicalScore != null).map((c) => c.practicalScore as number));
      return { staff: s, quiz: Math.round(quiz), practical, combined: quiz * 0.5 + practical * 20 * 0.5 };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => b.combined - a.combined);

  return {
    store,
    staffList,
    compliance: complianceRate(staffList, snap.completions),
    avgQuiz: avgKnowledgeScore(comps),
    avgPractical: avgPracticalScore(comps),
    certificates: certificatesCount(comps),
    overdueStaff,
    topStaff: topStaff.slice(0, 5),
    manager: snap.managers.find((m) => m.storeId === storeId),
  };
}

export interface OverallStats {
  assigned: number;
  completed: number;
  inProgress: number;
  overdue: number;
  notStarted: number;
  compliance: number;
  avgQuiz: number;
  avgPractical: number;
  certificates: number;
  attendanceSessions: number;
}

export function overallStats(snap: OrgSnapshot): OverallStats {
  const { staff, completions, attendance } = snap;
  const certifiedIds = new Set(completions.filter(isCertified).map((c) => c.staffId));
  const overdueIds = new Set(
    completions.filter((c) => c.status === "overdue" && !certifiedIds.has(c.staffId)).map((c) => c.staffId)
  );
  const inProgressIds = new Set(
    completions
      .filter((c) => c.status === "in-progress" && !certifiedIds.has(c.staffId) && !overdueIds.has(c.staffId))
      .map((c) => c.staffId)
  );
  const activeStaffIds = new Set(completions.map((c) => c.staffId));
  const notStarted = Math.max(0, staff.length - activeStaffIds.size);

  return {
    assigned: staff.length,
    completed: certifiedIds.size,
    inProgress: inProgressIds.size,
    overdue: overdueIds.size,
    notStarted,
    compliance: staff.length ? (certifiedIds.size / staff.length) * 100 : 0,
    avgQuiz: avgKnowledgeScore(completions),
    avgPractical: avgPracticalScore(completions),
    certificates: certificatesCount(completions),
    attendanceSessions: attendance.length,
  };
}

export interface RegionSummary {
  region: OrgRegion;
  storeCount: number;
  staffCount: number;
  compliance: number;
  avgQuiz: number;
  avgPractical: number;
}

export function regionSummaries(snap: OrgSnapshot): RegionSummary[] {
  return snap.regions.map((region) => {
    const storesInRegion = snap.stores.filter((s) => s.regionId === region.id);
    const summaries = storesInRegion.map((s) => storeSummary(snap, s.id));
    const staffCount = summaries.reduce((sum, s) => sum + s.staffList.length, 0);
    return {
      region,
      storeCount: storesInRegion.length,
      staffCount,
      compliance: avg(summaries.map((s) => s.compliance)),
      avgQuiz: avg(summaries.map((s) => s.avgQuiz)),
      avgPractical: avg(summaries.map((s) => s.avgPractical)),
    };
  });
}

export interface TrainerSummary {
  trainer: OrgTrainer;
  trainees: number;
  avgPractical: number;
  certificates: number;
}

/** Best-effort match: trainer stats are grouped by the free-text trainerName
 *  recorded on each completion (Log Completion form), matched case-insensitively
 *  against the trainer's name in the Trainers roster. */
export function trainerSummaries(snap: OrgSnapshot): TrainerSummary[] {
  return snap.trainers.map((trainer) => {
    const mine = snap.completions.filter((c) => (c.trainerName ?? "").toLowerCase().trim() === trainer.name.toLowerCase().trim());
    const traineeIds = new Set(mine.map((c) => c.staffId));
    return {
      trainer,
      trainees: traineeIds.size,
      avgPractical: avgPracticalScore(mine),
      certificates: certificatesCount(mine),
    };
  });
}

export interface ManagerSummary {
  manager: OrgManager;
  store: OrgStore | undefined;
  teamSize: number;
  compliance: number;
}

export function managerSummaries(snap: OrgSnapshot): ManagerSummary[] {
  return snap.managers.map((manager) => {
    const store = snap.stores.find((s) => s.id === manager.storeId);
    const teamStaff = snap.staff.filter((s) => s.storeId === manager.storeId);
    return {
      manager,
      store,
      teamSize: teamStaff.length,
      compliance: complianceRate(teamStaff, snap.completions),
    };
  });
}

export function promotionReadyCompletions(snap: OrgSnapshot): Completion[] {
  return snap.completions.filter((c) => c.followupReadyForPromotion === true);
}

export function needsCoachingCompletions(snap: OrgSnapshot): Completion[] {
  return snap.completions.filter((c) => c.followupReadyForPromotion === false && c.followupCompletedAt);
}
