import { DATA } from "./dataset";
import { PILLARS } from "@/lib/curriculum/pillars";
import type { Employee, PillarId, SalesKpiSnapshot, Store } from "@/lib/types";

function avg(nums: number[]) {
  if (!nums.length) return 0;
  return nums.reduce((s, n) => s + n, 0) / nums.length;
}

export function employeesOf(storeIds?: string[]) {
  if (!storeIds) return DATA.employees;
  return DATA.employees.filter((e) => storeIds.includes(e.storeId));
}

export function complianceRate(employees: Employee[]) {
  if (!employees.length) return 0;
  const completed = employees.filter((e) => e.status === "completed").length;
  return (completed / employees.length) * 100;
}

export function avgKnowledgeScore(employeeIds?: Set<string>) {
  const attempts = employeeIds
    ? DATA.knowledgeAttempts.filter((a) => employeeIds.has(a.employeeId))
    : DATA.knowledgeAttempts;
  return avg(attempts.map((a) => a.scorePercent));
}

export function avgPracticalScore(employeeIds?: Set<string>) {
  const list = employeeIds
    ? DATA.practicalAssessments.filter((a) => employeeIds.has(a.employeeId))
    : DATA.practicalAssessments;
  return avg(list.map((a) => a.overall));
}

export function certificatesCount(employeeIds?: Set<string>) {
  return employeeIds
    ? DATA.certificates.filter((c) => employeeIds.has(c.employeeId)).length
    : DATA.certificates.length;
}

export function trainingHours(employeeIds?: Set<string>) {
  const list = employeeIds
    ? DATA.attendance.filter((a) => employeeIds.has(a.employeeId))
    : DATA.attendance;
  return list.reduce((s, a) => s + a.durationMin, 0) / 60;
}

export function storeById(id: string): Store | undefined {
  return DATA.stores.find((s) => s.id === id);
}

export function employeesByStore(storeId: string) {
  return DATA.employees.filter((e) => e.storeId === storeId);
}

export function storeSummary(storeId: string) {
  const emps = employeesByStore(storeId);
  const ids = new Set(emps.map((e) => e.id));
  const overdue = emps.filter((e) => e.status === "overdue");
  const completed = emps.filter((e) => e.status === "completed");

  const practicalByEmp = new Map(DATA.practicalAssessments.filter((p) => ids.has(p.employeeId)).map((p) => [p.employeeId, p.overall]));
  const knowledgeByEmp = new Map(DATA.knowledgeAttempts.filter((k) => ids.has(k.employeeId)).map((k) => [k.employeeId, k.scorePercent]));

  const ranked = completed
    .map((e) => ({
      employee: e,
      quiz: knowledgeByEmp.get(e.id) ?? 0,
      practical: practicalByEmp.get(e.id) ?? 0,
      combined: (knowledgeByEmp.get(e.id) ?? 0) * 0.5 + (practicalByEmp.get(e.id) ?? 0) * 20 * 0.5,
    }))
    .sort((a, b) => b.combined - a.combined);

  return {
    store: storeById(storeId)!,
    employees: emps,
    compliance: complianceRate(emps),
    avgQuiz: avgKnowledgeScore(ids),
    avgPractical: avgPracticalScore(ids),
    completionRate: emps.length ? (completed.length / emps.length) * 100 : 0,
    topEmployees: ranked.slice(0, 5),
    overdueEmployees: overdue,
    certificates: certificatesCount(ids),
  };
}

export function regionSummary(regionId: string) {
  const stores = DATA.stores.filter((s) => s.regionId === regionId);
  return stores.map((s) => storeSummary(s.id));
}

export function pillarCompetencyRadar(employeeIds?: Set<string>) {
  const attempts = employeeIds
    ? DATA.knowledgeAttempts.filter((a) => employeeIds.has(a.employeeId))
    : DATA.knowledgeAttempts;
  return PILLARS.map((p) => ({
    pillar: p.shortName,
    pillarId: p.id,
    score: Math.round(avg(attempts.map((a) => a.pillarBreakdown[p.id as PillarId]))),
  }));
}

export function salesKpiForPeriod(period: SalesKpiSnapshot["period"], storeIds?: string[]) {
  const rows = DATA.salesKpis.filter(
    (k) => k.period === period && (!storeIds || storeIds.includes(k.storeId))
  );
  return {
    atv: avg(rows.map((r) => r.atv)),
    guestCount: avg(rows.map((r) => r.guestCount)),
    itemsPerTransaction: avg(rows.map((r) => r.itemsPerTransaction)),
    beverageAttachment: avg(rows.map((r) => r.beverageAttachment)),
    dessertAttachment: avg(rows.map((r) => r.dessertAttachment)),
    comboRate: avg(rows.map((r) => r.comboRate)),
    salesGrowthPct: avg(rows.map((r) => r.salesGrowthPct)),
    csat: avg(rows.map((r) => r.csat)),
    speedOfServiceSec: avg(rows.map((r) => r.speedOfServiceSec)),
  };
}

export function salesImpactSeries(storeIds?: string[]) {
  const periods: SalesKpiSnapshot["period"][] = ["before", "d7", "d30", "d90"];
  const labels: Record<SalesKpiSnapshot["period"], string> = {
    before: "Before Training",
    d7: "7 Days",
    d30: "30 Days",
    d90: "90 Days",
  };
  return periods.map((period) => ({
    period,
    label: labels[period],
    ...salesKpiForPeriod(period, storeIds),
  }));
}

export function employeeSalesRanking(storeIds?: string[]) {
  // Deterministic ranking derived from practical + knowledge performance, scoped to a store set.
  const emps = employeesOf(storeIds).filter((e) => e.status === "completed");
  const practicalByEmp = new Map(DATA.practicalAssessments.map((p) => [p.employeeId, p.overall]));
  const knowledgeByEmp = new Map(DATA.knowledgeAttempts.map((k) => [k.employeeId, k.scorePercent]));
  return emps
    .map((e) => {
      const store = storeById(e.storeId)!;
      const practical = practicalByEmp.get(e.id) ?? 0;
      const knowledge = knowledgeByEmp.get(e.id) ?? 0;
      return {
        employee: e,
        store,
        score: Math.round(practical * 15 + knowledge * 0.5),
        practical,
        knowledge,
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function overallStats() {
  const emps = DATA.employees;
  return {
    assigned: emps.length,
    completed: emps.filter((e) => e.status === "completed").length,
    inProgress: emps.filter((e) => e.status === "in-progress").length,
    overdue: emps.filter((e) => e.status === "overdue").length,
    notStarted: emps.filter((e) => e.status === "not-started").length,
    compliance: complianceRate(emps),
    avgQuiz: avgKnowledgeScore(),
    avgPractical: avgPracticalScore(),
    certificates: certificatesCount(),
    trainingHours: trainingHours(),
  };
}
