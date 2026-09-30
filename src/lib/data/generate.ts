import { Rng } from "./rng";
import { FIRST_NAMES, LAST_NAMES, REGIONS, STORE_META, ROLES, TRAINER_NAMES } from "./pools";
import { PILLARS } from "@/lib/curriculum/pillars";
import type {
  Dataset,
  Store,
  Manager,
  Trainer,
  Employee,
  EmployeeStatus,
  AttendanceRecord,
  KnowledgeAttempt,
  PracticalAssessment,
  PracticalCriterion,
  RolePlayAttempt,
  ManagerFollowUp,
  Certificate,
  WorkbookEntry,
  SalesKpiSnapshot,
  PillarId,
} from "@/lib/types";

const PRACTICAL_CRITERIA: PracticalCriterion[] = [
  "greeting", "smile", "eyeContact", "menuKnowledge", "confidence",
  "upselling", "crossSelling", "closingSale", "guestEngagement", "professionalism",
];

function fmtDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function pad(n: number, len: number) {
  return String(n).padStart(len, "0");
}

export function generateDataset(seed = 20260804): Dataset {
  const rng = new Rng(seed);

  const regions = REGIONS;

  // Stores
  const stores: Store[] = STORE_META.map((s, i) => ({
    id: `store-${i + 1}`,
    code: s.code,
    name: s.name,
    city: s.city,
    regionId: s.regionId,
    format: s.format,
    managerId: "", // filled after managers generated
    openedYear: rng.int(2014, 2023),
  }));

  // Managers — ~2 to 3 per store, ~30 total
  const managers: Manager[] = [];
  let managerSeq = 1;
  const titles = ["General Manager", "Assistant Manager", "Shift Manager"];
  stores.forEach((store, si) => {
    const count = si % 2 === 0 ? 3 : 2;
    for (let i = 0; i < count; i++) {
      const first = rng.pick(FIRST_NAMES);
      const last = rng.pick(LAST_NAMES);
      managers.push({
        id: `mgr-${managerSeq}`,
        name: `${first} ${last}`,
        storeId: store.id,
        title: titles[Math.min(i, titles.length - 1)],
      });
      if (i === 0) store.managerId = `mgr-${managerSeq}`;
      managerSeq++;
    }
  });

  // Trainers
  const trainers: Trainer[] = TRAINER_NAMES.map((t, i) => ({
    id: `trainer-${i + 1}`,
    name: t.name,
    regionId: t.regionId,
    certifiedSince: `${rng.int(2019, 2023)}-0${rng.int(1, 9)}-1${rng.int(0, 5)}`,
    specialties: rng.shuffle(PILLARS.map((p) => p.id)).slice(0, rng.int(2, 4)) as PillarId[],
  }));

  const trainersByRegion = (regionId: string) => {
    const inRegion = trainers.filter((t) => t.regionId === regionId);
    return inRegion.length ? inRegion : trainers;
  };

  // Employees — 350 total, distributed across stores
  const employees: Employee[] = [];
  const TOTAL_EMPLOYEES = 350;
  let empSeq = 1000;
  const storeManagers = (storeId: string) => managers.filter((m) => m.storeId === storeId);

  const perStoreBase = Math.floor(TOTAL_EMPLOYEES / stores.length);
  let remaining = TOTAL_EMPLOYEES - perStoreBase * stores.length;

  stores.forEach((store) => {
    let countForStore = perStoreBase;
    if (remaining > 0) {
      countForStore += 1;
      remaining -= 1;
    }
    const mgrs = storeManagers(store.id);
    const regionTrainers = trainersByRegion(store.regionId);

    for (let i = 0; i < countForStore; i++) {
      const first = rng.pick(FIRST_NAMES);
      const last = rng.pick(LAST_NAMES);
      const hireDaysAgo = rng.int(20, 1400);
      const hireDate = rng.daysAgo(hireDaysAgo);
      const assignedDaysAgo = rng.int(5, Math.min(hireDaysAgo, 120));
      const assignedDate = rng.daysAgo(assignedDaysAgo);
      const dueDate = new Date(assignedDate);
      dueDate.setDate(dueDate.getDate() + 14);

      const status: EmployeeStatus = rng.pickWeighted([
        { value: "completed", weight: 70 },
        { value: "in-progress", weight: 15 },
        { value: "overdue", weight: 8 },
        { value: "not-started", weight: 7 },
      ]);

      empSeq++;
      employees.push({
        id: `emp-${empSeq}`,
        employeeNumber: `KUK-EMP-${pad(empSeq, 6)}`,
        name: `${first} ${last}`,
        role: rng.pick(ROLES),
        storeId: store.id,
        managerId: rng.pick(mgrs).id,
        trainerId: rng.pick(regionTrainers).id,
        hireDate: fmtDate(hireDate),
        status,
        assignedDate: fmtDate(assignedDate),
        dueDate: fmtDate(dueDate),
      });
    }
  });

  // Downstream records
  const attendance: AttendanceRecord[] = [];
  const knowledgeAttempts: KnowledgeAttempt[] = [];
  const practicalAssessments: PracticalAssessment[] = [];
  const rolePlays: RolePlayAttempt[] = [];
  const managerFollowUps: ManagerFollowUp[] = [];
  const certificates: Certificate[] = [];
  const workbooks: WorkbookEntry[] = [];

  let certSeq = 500;

  for (const emp of employees) {
    const engaged = emp.status === "completed" || emp.status === "in-progress";
    if (!engaged) continue;

    const sessionDate = emp.assignedDate;
    const checkInHour = rng.int(8, 13);
    attendance.push({
      employeeId: emp.id,
      sessionDate,
      method: rng.bool(0.7) ? "QR" : "Manual",
      checkIn: `${pad(checkInHour, 2)}:${pad(rng.int(0, 59), 2)}`,
      checkOut: `${pad(checkInHour + 3, 2)}:${pad(rng.int(0, 59), 2)}`,
      durationMin: rng.int(160, 210),
      employeeSigned: true,
      trainerSigned: emp.status === "completed" || rng.bool(0.6),
    });

    // Workbook — completed employees always fill it, in-progress sometimes
    if (emp.status === "completed" || rng.bool(0.5)) {
      workbooks.push({
        employeeId: emp.id,
        reflection: {
          p1: "I learned that ATV is something I personally influence every shift, not just management.",
          p2: "Reading the table before I speak has already changed how I open conversations with guests.",
          p3: "The 4 A's gave me a real structure for objections instead of just freezing up.",
          p4: "Name, Describe, Invite is now my go-to script for suggestive selling.",
          p5: "I want my shift lead to start doing the pre-shift huddle every day, not just some days.",
          p6: "I'm going to track my own ATV and IPT numbers weekly against the store average.",
        },
        actionPlan: "Apply Name-Describe-Invite on every table for the next two weeks and track guest response.",
        commitments: [
          "Use the 4 A's for every objection I hear",
          "Suggest one beverage pairing per table at order time",
          "Ask my shift lead for in-the-moment feedback at least twice a week",
        ],
        signedDate: emp.status === "completed" ? emp.assignedDate : null,
      });
    }

    if (emp.status !== "completed") continue;

    // Knowledge attempt
    const pillarBreakdown: Record<PillarId, number> = {} as Record<PillarId, number>;
    PILLARS.forEach((p) => {
      pillarBreakdown[p.id] = rng.int(62, 100);
    });
    const avgScore = Math.round(
      PILLARS.reduce((s, p) => s + pillarBreakdown[p.id], 0) / PILLARS.length
    );
    const passed = avgScore >= 80;
    knowledgeAttempts.push({
      employeeId: emp.id,
      date: emp.assignedDate,
      scorePercent: avgScore,
      passed,
      attemptNumber: passed ? 1 : rng.int(1, 2),
      pillarBreakdown,
      timeSpentMin: rng.int(14, 38),
    });

    // Practical assessment
    const scores = {} as Record<PracticalCriterion, number>;
    PRACTICAL_CRITERIA.forEach((c) => {
      scores[c] = rng.int(3, 5);
    });
    const overall = Number(
      (PRACTICAL_CRITERIA.reduce((s, c) => s + scores[c], 0) / PRACTICAL_CRITERIA.length).toFixed(2)
    );
    practicalAssessments.push({
      employeeId: emp.id,
      trainerId: emp.trainerId,
      date: emp.assignedDate,
      scores,
      overall,
      pass: overall >= 3.5,
      comments: overall >= 4.3
        ? "Confident, warm delivery. Naturally weaves recommendations into service without sounding scripted."
        : overall >= 3.5
        ? "Solid grasp of the fundamentals. Suggestive selling language needs a bit more specificity."
        : "Needs additional coaching on objection handling and closing confidence before re-assessment.",
      recommendation: overall >= 4.3
        ? "Ready to coach peers on Pillar 4 techniques."
        : overall >= 3.5
        ? "Shadow a top performer for one shift on cross-selling."
        : "Schedule a follow-up practical assessment within 2 weeks.",
    });

    // Role play
    const steps = ["Greeting & Rapport", "Suggestive Recommendation", "Handling Objection", "Confirming & Closing"];
    const stepScores = steps.map((step) => ({ step, score: rng.int(3, 5) }));
    rolePlays.push({
      employeeId: emp.id,
      trainerId: emp.trainerId,
      date: emp.assignedDate,
      scenario: "Guest Orders a Burger",
      stepScores,
      overall: Number((stepScores.reduce((s, x) => s + x.score, 0) / stepScores.length).toFixed(2)),
    });

    // Certificate — only if both knowledge and practical passed
    const practicalPass = overall >= 3.5;
    if (passed && practicalPass) {
      certSeq++;
      certificates.push({
        employeeId: emp.id,
        certificateNumber: `KUKIE-CERT-2026-${pad(certSeq, 6)}`,
        issueDate: emp.assignedDate,
        trainerId: emp.trainerId,
        qrToken: `SLT${pad(certSeq, 6)}${rng.int(1000, 9999)}`,
      });

      // Manager follow-up for certs issued 30+ days ago
      const issueDate = new Date(emp.assignedDate);
      const daysSince = Math.floor((Date.now() - issueDate.getTime()) / 86400000);
      if (daysSince >= 30 && rng.bool(0.75)) {
        managerFollowUps.push({
          employeeId: emp.id,
          managerId: emp.managerId,
          date: fmtDate(rng.daysAgo(Math.max(0, daysSince - 30))),
          confidenceImproved: rng.bool(0.85),
          upsellImproved: rng.bool(0.8),
          applyingTraining: rng.bool(0.82),
          needsCoaching: rng.bool(0.18),
          readyForPromotion: rng.bool(0.22),
          notes: rng.bool(0.5)
            ? "Noticeably more confident suggesting add-ons since certification. Guests respond well."
            : "Applying the framework consistently during peak hours; still building consistency during slower shifts.",
        });
      }
    }
  }

  // Sales KPIs per store — before / 7 / 30 / 90 days, with realistic uplift trend
  const salesKpis: SalesKpiSnapshot[] = [];
  const baseByFormat: Record<Store["format"], { atv: number; guests: number; ipt: number }> = {
    QSR: { atv: 11.5, guests: 420, ipt: 1.9 },
    "Casual Dining": { atv: 24.5, guests: 260, ipt: 2.6 },
    Café: { atv: 9.2, guests: 310, ipt: 1.6 },
    "Hotel F&B": { atv: 32.0, guests: 150, ipt: 2.9 },
  };

  const periodLift: Record<SalesKpiSnapshot["period"], number> = {
    before: 0,
    d7: 0.02,
    d30: 0.06,
    d90: 0.084,
  };

  stores.forEach((store) => {
    const base = baseByFormat[store.format];
    (Object.keys(periodLift) as SalesKpiSnapshot["period"][]).forEach((period) => {
      const lift = periodLift[period];
      const jitter = () => rng.float(-0.015, 0.015, 3);
      salesKpis.push({
        storeId: store.id,
        period,
        atv: Number((base.atv * (1 + lift + jitter())).toFixed(2)),
        guestCount: Math.round(base.guests * (1 + lift * 0.3 + jitter())),
        itemsPerTransaction: Number((base.ipt * (1 + lift * 1.1 + jitter())).toFixed(2)),
        beverageAttachment: Number((38 + lift * 100 * 0.9 + rng.float(-2, 2)).toFixed(1)),
        dessertAttachment: Number((18 + lift * 100 * 0.7 + rng.float(-2, 2)).toFixed(1)),
        comboRate: Number((44 + lift * 100 * 0.6 + rng.float(-2, 2)).toFixed(1)),
        salesGrowthPct: Number((lift * 100).toFixed(1)),
        csat: Number((84 + lift * 100 * 0.25 + rng.float(-1.5, 1.5)).toFixed(1)),
        speedOfServiceSec: Math.round(210 - lift * 100 * 1.2 + rng.int(-6, 6)),
      });
    });
  });

  return {
    regions,
    stores,
    managers,
    trainers,
    employees,
    attendance,
    knowledgeAttempts,
    practicalAssessments,
    rolePlays,
    managerFollowUps,
    certificates,
    workbooks,
    salesKpis,
  };
}
