import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PILLARS } from "@/lib/curriculum/pillars";
import { PILLAR_ICONS } from "@/lib/curriculum/icons";
import { PILLAR_BG_SOFT, PILLAR_TEXT } from "@/lib/curriculum/pillar-colors";
import { SLIDES, TOTAL_SLIDE_MINUTES } from "@/lib/curriculum/slides";
import { QUESTIONS } from "@/lib/curriculum/questions";
import { overallStats } from "@/lib/data";
import {
  Clock, Signal, Users2, Tag, PlaySquare, NotebookPen, QrCode, ListChecks,
  ClipboardCheck, Award, UserRound,
} from "lucide-react";

const DELIVERABLES = [
  { label: "Presentation", href: "/course/present", icon: PlaySquare, desc: `${SLIDES.length} slides` },
  { label: "Digital Workbook", href: "/course/workbook", icon: NotebookPen, desc: "Reflection & action plan" },
  { label: "Attendance", href: "/course/attendance", icon: QrCode, desc: "QR check-in" },
  { label: "Knowledge Assessment", href: "/course/assessment", icon: ListChecks, desc: `${QUESTIONS.length} questions` },
  { label: "Practical Assessment", href: "/course/practical", icon: ClipboardCheck, desc: "10-point rubric" },
  { label: "Role Play", href: "/course/roleplay", icon: Users2, desc: "Guided scenario" },
  { label: "Manager Follow-Up", href: "/course/followup", icon: UserRound, desc: "30-day check-in" },
  { label: "Certificate", href: "/course/certificate", icon: Award, desc: "Issue & verify" },
];

export default function CoursePage() {
  const stats = overallStats();

  return (
    <AppShell title="Course Overview" subtitle="Module 001">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-sidebar p-8 text-white sm:p-10">
        <div className="grid-fade pointer-events-none absolute inset-0 opacity-[0.07]" />
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-brand/30 blur-3xl" />
        <Badge variant="violet" className="relative z-10 bg-white/10 text-white">Kükie Academy · Module 001</Badge>
        <h2 className="relative z-10 mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Sales Build-Up Excellence
        </h2>
        <p className="relative z-10 mt-3 max-w-2xl text-sm text-white/70">
          A complete learning ecosystem — presentation, workbook, attendance, assessments, practical
          coaching and manager follow-up — connected to live Sales Impact analytics. This module
          establishes the framework every future Kükie Academy module will reuse.
        </p>

        <div className="relative z-10 mt-7 flex flex-wrap gap-3">
          <Link href="/course/present"><Button size="lg">Launch Presentation</Button></Link>
          <Link href="/course/workbook"><Button size="lg" variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-white/10">Open Workbook</Button></Link>
        </div>

        <div className="relative z-10 mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
          <Meta icon={Clock} label="Est. Duration" value={`${Math.round(TOTAL_SLIDE_MINUTES)} min`} />
          <Meta icon={Signal} label="Difficulty" value="Intermediate" />
          <Meta icon={Tag} label="Version" value="v1.0" />
          <Meta icon={Users2} label="Trainers" value="4 certified" />
          <Meta icon={ListChecks} label="Slides" value={`${SLIDES.length}`} />
        </div>
      </div>

      {/* Progress + objectives */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Learning Objectives</CardTitle>
            <CardDescription>By the end of Module 001, every team member will be able to:</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {PILLARS.map((p) => (
                <li key={p.id} className="flex items-start gap-2.5 rounded-[10px] bg-surface-muted p-3 text-[13px]">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[10px] font-bold text-brand">
                    {p.index}
                  </span>
                  <span>{p.description}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organization Progress</CardTitle>
            <CardDescription>Across all assigned employees</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Compliance</span>
                <span className="font-semibold">{stats.compliance.toFixed(0)}%</span>
              </div>
              <Progress value={stats.compliance} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="rounded-[10px] bg-emerald-soft p-2.5">
                <p className="font-display text-base font-bold text-emerald">{stats.completed}</p>
                <p className="text-emerald/80">Completed</p>
              </div>
              <div className="rounded-[10px] bg-amber-soft p-2.5">
                <p className="font-display text-base font-bold text-amber">{stats.inProgress}</p>
                <p className="text-amber/80">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deliverables quick launch */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {DELIVERABLES.map((d) => (
          <Link key={d.href} href={d.href}>
            <Card className="h-full p-4 transition-shadow hover:shadow-md">
              <d.icon className="size-5 text-brand" />
              <p className="mt-3 text-[13px] font-semibold leading-tight">{d.label}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{d.desc}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pillars */}
      <h3 className="mt-8 mb-3 font-display text-lg font-semibold">Course Modules — Six Learning Pillars</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {PILLARS.map((p) => {
          const Icon = PILLAR_ICONS[p.icon];
          const slideCount = SLIDES.filter((s) => s.pillarId === p.id).length;
          const qCount = QUESTIONS.filter((q) => q.pillarId === p.id).length;
          return (
            <Card key={p.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`flex size-9 items-center justify-center rounded-[10px] ${PILLAR_BG_SOFT[p.color]} ${PILLAR_TEXT[p.color]}`}>
                    <Icon className="size-4.5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground">Pillar {p.index} of 6</p>
                    <CardTitle>{p.shortName}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between gap-4">
                <p className="text-[13px] text-muted-foreground">{p.description}</p>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{slideCount} slides</span>
                  <span>{qCount} quiz questions</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}

function Meta({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-white/50">
        <Icon className="size-3.5" />
        <span className="text-[11px]">{label}</span>
      </div>
      <p className="mt-1 font-display text-sm font-semibold">{value}</p>
    </div>
  );
}
