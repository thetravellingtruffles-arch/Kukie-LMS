import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, GraduationCap, PlaySquare, NotebookPen, QrCode, ListChecks,
  ClipboardCheck, Users2, UserRound, Award, IdCard, Store, Map, BarChart3,
  LineChart, TrendingUp, FileOutput, CalendarPlus, CalendarDays, LayoutTemplate,
  Building2,
} from "lucide-react";
import type { UserRole } from "@/lib/auth/use-session";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Omit to show to every signed-in role. Set to restrict to specific roles. */
  roles?: UserRole[];
}

// Reused role sets, matching the layout.tsx gates on each route.
const INSIGHTS_ROLES: UserRole[] = ["vp", "operations", "area_manager"];
const STUDIO_ROLES: UserRole[] = ["admin", "studio_editor"];
const ORG_ROLES: UserRole[] = ["admin"];

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Home Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Module 001 · Sales Build-Up",
    items: [
      { label: "Course Overview", href: "/course", icon: GraduationCap },
      { label: "Attendance / QR Check-In", href: "/course/attendance", icon: QrCode },
      { label: "Presentation Mode", href: "/course/present", icon: PlaySquare },
      { label: "Digital Workbook", href: "/course/workbook", icon: NotebookPen },
      { label: "Knowledge Assessment", href: "/course/assessment", icon: ListChecks },
      { label: "Practical Assessment", href: "/course/practical", icon: ClipboardCheck },
      { label: "Role Play", href: "/course/roleplay", icon: Users2 },
      { label: "Manager Follow-Up", href: "/course/followup", icon: UserRound },
      { label: "Certificate", href: "/course/certificate", icon: Award },
    ],
  },
  {
    label: "Module Studio",
    items: [
      { label: "All Modules", href: "/studio", icon: LayoutTemplate, roles: STUDIO_ROLES },
    ],
  },
  {
    label: "Scheduling",
    items: [
      { label: "Schedule Training", href: "/schedule", icon: CalendarPlus },
      { label: "Training Calendar", href: "/calendar", icon: CalendarDays },
    ],
  },
  {
    label: "People & Stores",
    items: [
      { label: "Organization Setup", href: "/organization", icon: Building2, roles: ORG_ROLES },
      { label: "Staff Directory", href: "/staff", icon: QrCode },
      { label: "Training Records", href: "/training", icon: ClipboardCheck },
      { label: "Employee Profiles", href: "/employees", icon: IdCard },
      { label: "Store Dashboards", href: "/stores", icon: Store },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Regional Dashboard", href: "/regional", icon: Map, roles: INSIGHTS_ROLES },
      { label: "Executive Dashboard", href: "/executive", icon: BarChart3, roles: INSIGHTS_ROLES },
      { label: "Analytics", href: "/analytics", icon: LineChart, roles: INSIGHTS_ROLES },
      { label: "Sales Impact", href: "/sales-impact", icon: TrendingUp, roles: INSIGHTS_ROLES },
      { label: "Reports", href: "/reports", icon: FileOutput, roles: INSIGHTS_ROLES },
    ],
  },
];
