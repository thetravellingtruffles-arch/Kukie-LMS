// Core domain types for Kükie Academy — Module 001: Sales Build-Up Excellence

// Widened from a fixed "p1".."p6" union to a plain string so that
// database-backed modules (Module Studio) — whose pillar ids are UUIDs —
// can reuse every type and component below unchanged.
export type PillarId = string;

export interface Pillar {
  id: PillarId;
  index: number;
  name: string;
  shortName: string;
  description: string;
  color: "brand" | "amber" | "emerald" | "rose" | "violet" | "sky";
  icon: string;
}

export type SlideType =
  | "cover"
  | "pillar-intro"
  | "concept"
  | "framework"
  | "stat"
  | "scenario"
  | "quote"
  | "checklist"
  | "closing";

export interface SlideFrameworkStep {
  title: string;
  body: string;
}

export interface SlideScenarioLine {
  speaker: string;
  text: string;
}

export interface Slide {
  id: string;
  pillarId: PillarId | null;
  index: number;
  type: SlideType;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  bullets?: string[];
  stat?: { value: string; label: string; caption?: string };
  framework?: { name: string; steps: SlideFrameworkStep[] };
  scenario?: { setup: string; lines: SlideScenarioLine[] };
  quote?: { text: string; author: string };
  checklist?: { dos: string[]; donts: string[] };
  notes: string;
  durationMin: number;
}

export type QuestionType =
  | "mcq"
  | "true-false"
  | "image"
  | "scenario"
  | "ordering"
  | "matching";

export interface QuizQuestion {
  id: string;
  pillarId: PillarId;
  type: QuestionType;
  prompt: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: "foundation" | "intermediate" | "advanced";
}

export type EmployeeStatus = "not-started" | "in-progress" | "completed" | "overdue";

export interface Region {
  id: string;
  name: string;
}

export interface Store {
  id: string;
  code: string;
  name: string;
  city: string;
  regionId: string;
  format: "QSR" | "Casual Dining" | "Café" | "Hotel F&B";
  managerId: string;
  openedYear: number;
}

export interface Trainer {
  id: string;
  name: string;
  regionId: string;
  certifiedSince: string;
  specialties: PillarId[];
}

export interface Manager {
  id: string;
  name: string;
  storeId: string;
  title: string;
}

export interface Employee {
  id: string;
  employeeNumber: string;
  name: string;
  role: "Server" | "Barista" | "Host" | "Shift Lead" | "Cashier" | "Bartender";
  storeId: string;
  managerId: string;
  trainerId: string;
  hireDate: string;
  status: EmployeeStatus;
  assignedDate: string;
  dueDate: string;
}

export interface AttendanceRecord {
  employeeId: string;
  sessionDate: string;
  method: "QR" | "Manual";
  checkIn: string;
  checkOut: string;
  durationMin: number;
  employeeSigned: boolean;
  trainerSigned: boolean;
}

export interface KnowledgeAttempt {
  employeeId: string;
  date: string;
  scorePercent: number;
  passed: boolean;
  attemptNumber: number;
  pillarBreakdown: Record<PillarId, number>;
  timeSpentMin: number;
}

export type PracticalCriterion =
  | "greeting"
  | "smile"
  | "eyeContact"
  | "menuKnowledge"
  | "confidence"
  | "upselling"
  | "crossSelling"
  | "closingSale"
  | "guestEngagement"
  | "professionalism";

export interface PracticalAssessment {
  employeeId: string;
  trainerId: string;
  date: string;
  scores: Record<PracticalCriterion, number>; // 1-5
  overall: number; // 1-5 average
  pass: boolean;
  comments: string;
  recommendation: string;
}

export interface RolePlayAttempt {
  employeeId: string;
  trainerId: string;
  date: string;
  scenario: string;
  stepScores: { step: string; score: number }[];
  overall: number;
}

export interface ManagerFollowUp {
  employeeId: string;
  managerId: string;
  date: string;
  confidenceImproved: boolean;
  upsellImproved: boolean;
  applyingTraining: boolean;
  needsCoaching: boolean;
  readyForPromotion: boolean;
  notes: string;
}

export interface Certificate {
  employeeId: string;
  certificateNumber: string;
  issueDate: string;
  trainerId: string;
  qrToken: string;
}

export interface WorkbookEntry {
  employeeId: string;
  reflection: Record<string, string>;
  actionPlan: string;
  commitments: string[];
  signedDate: string | null;
}

export type KpiPeriod = "before" | "d7" | "d30" | "d90";

export interface SalesKpiSnapshot {
  storeId: string;
  period: KpiPeriod;
  atv: number;
  guestCount: number;
  itemsPerTransaction: number;
  beverageAttachment: number;
  dessertAttachment: number;
  comboRate: number;
  salesGrowthPct: number;
  csat: number;
  speedOfServiceSec: number;
}

// ---------------------------------------------------------------------------
// Module Studio — database-backed courses (anything beyond the static
// Module 001 reference implementation lives in Supabase; see
// src/lib/studio/queries.ts).
// ---------------------------------------------------------------------------

export type CourseStatus = "draft" | "published";

export interface LearningOutcomeRow {
  category: "Know" | "Understand" | "Demonstrate" | "Perform" | "Apply" | "Explain" | "Troubleshoot" | "Coach";
  outcome: string;
}

export interface CourseMeta {
  category?: string;
  targetAudience?: string;
  duration?: string;
  deliveryMethod?: string;
  classSize?: string;
  prerequisites?: string;
  trainingNeed?: {
    businessProblem?: string;
    operationalNeed?: string;
    guestImpact?: string;
    businessOutcome?: string;
  };
  learningOutcomes?: LearningOutcomeRow[];
  practicalAssessment?: { criteria: string[] };
  scoring?: { passMarkPercent?: number; practicalPassScore?: number };
  certification?: { issuesCertificate?: boolean; validityMonths?: number };
  sourceTopic?: string; // the prompt used for AI draft-assist, if any
}

export interface Course {
  id: string;
  slug: string;
  moduleNumber: number;
  title: string;
  subtitle: string | null;
  description: string | null;
  version: string;
  difficulty: "Foundation" | "Intermediate" | "Advanced";
  trainerName: string | null;
  status: CourseStatus;
  meta: CourseMeta;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Real (Supabase-backed) Staff + Attendance — separate from the mock
// Employee/AttendanceRecord types above, which drive the sample dashboards.
// Staff records are real and persist; they're what the QR scanner and the
// Studio-built modules' attendance pages read and write.
// ---------------------------------------------------------------------------

export type StaffStatus = "active" | "inactive";

export interface Staff {
  id: string;
  employeeNumber: string;
  name: string;
  role: string | null;
  storeName: string | null;
  storeId: string | null;
  email: string | null;
  phone: string | null;
  status: StaffStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StaffAttendanceRecord {
  id: string;
  courseSlug: string;
  courseTitle: string | null;
  staffId: string;
  method: "qr" | "manual";
  checkedInAt: string;
  staff?: Staff;
}

// ---------------------------------------------------------------------------
// Real (Supabase-backed) Organization Data — Regions, Stores, Trainers,
// Managers. Separate from the mock Region/Store/Trainer/Manager types above,
// which continue to drive the sample dashboards (Regional/Executive/
// Analytics/Sales Impact/Reports) until those are migrated in a later phase.
// ---------------------------------------------------------------------------

export type OrgStatus = "active" | "inactive";

export interface OrgRegion {
  id: string;
  code: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrgStore {
  id: string;
  code: string;
  name: string;
  city: string | null;
  regionId: string | null;
  format: string | null;
  openedYear: number | null;
  status: OrgStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrgManager {
  id: string;
  name: string;
  title: string | null;
  storeId: string | null;
  email: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrgTrainer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  regionId: string | null;
  certifiedSince: string | null;
  specialties: string[];
  status: OrgStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Dataset {
  regions: Region[];
  stores: Store[];
  managers: Manager[];
  trainers: Trainer[];
  employees: Employee[];
  attendance: AttendanceRecord[];
  knowledgeAttempts: KnowledgeAttempt[];
  practicalAssessments: PracticalAssessment[];
  rolePlays: RolePlayAttempt[];
  managerFollowUps: ManagerFollowUp[];
  certificates: Certificate[];
  workbooks: WorkbookEntry[];
  salesKpis: SalesKpiSnapshot[];
}
