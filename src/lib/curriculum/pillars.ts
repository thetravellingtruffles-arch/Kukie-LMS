import type { Pillar } from "@/lib/types";

export const PILLARS: Pillar[] = [
  {
    id: "p1",
    index: 1,
    name: "The Science of Restaurant Sales",
    shortName: "Science of Sales",
    description: "Understanding revenue drivers and the KPIs that move them.",
    color: "brand",
    icon: "LineChart",
  },
  {
    id: "p2",
    index: 2,
    name: "The Psychology of Buying",
    shortName: "Psychology of Buying",
    description: "How guests actually make purchasing decisions.",
    color: "violet",
    icon: "Brain",
  },
  {
    id: "p3",
    index: 3,
    name: "Sales Through Hospitality",
    shortName: "Sales Through Hospitality",
    description: "Using genuine service to create natural sales moments.",
    color: "emerald",
    icon: "HeartHandshake",
  },
  {
    id: "p4",
    index: 4,
    name: "Advanced Selling Techniques",
    shortName: "Advanced Techniques",
    description: "Upselling, cross-selling, premium selling and attachment.",
    color: "amber",
    icon: "TrendingUp",
  },
  {
    id: "p5",
    index: 5,
    name: "Operational Execution",
    shortName: "Operational Execution",
    description: "Coaching, role play and daily floor routines.",
    color: "rose",
    icon: "ClipboardCheck",
  },
  {
    id: "p6",
    index: 6,
    name: "Measuring Success",
    shortName: "Measuring Success",
    description: "Dashboards, KPI tracking and post-training performance.",
    color: "sky",
    icon: "Gauge",
  },
];

export function pillarById(id: string) {
  return PILLARS.find((p) => p.id === id);
}
