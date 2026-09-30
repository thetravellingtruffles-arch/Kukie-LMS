import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CompetencyRadar } from "@/components/charts/competency-radar";
import { DATA } from "@/lib/data";
import { PILLARS } from "@/lib/curriculum/pillars";
import { initials } from "@/lib/utils";
import {
  Award, Clock, GraduationCap, ClipboardCheck, TrendingUp, TrendingDown, CheckCircle2, Circle, Sparkles,
} from "lucide-react";

export default async function EmployeeProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const employee = DATA.employees.find((e) => e.id === id);
  if (!employee) notFound();

  const store = DATA.stores.find((s) => s.id === employee.storeId)!;
  const manager = DATA.managers.find((m) => m.id === employee.managerId)!;
  const trainer = DATA.trainers.find((t) => t.id === employee.trainerId)!;
  const attendance = DATA.attendance.find((a) => a.employeeId === id);
  const knowledge = DATA.knowledgeAttempts.find((k) => k.employeeId === id);
  const practical = DATA.practicalAssessments.find((p) => p.employeeId === id);
  const rolePlay = DATA.rolePlays.find((r) => r.employeeId === id);
  const certificate = DATA.certificates.find((c) => c.employeeId === id);
  const followUp = DATA.managerFollowUps.find((f) => f.employeeId === id);

  const radar = knowledge
    ? PILLARS.map((p) => ({ pillar: p.shortName, score: knowledge.pillarBreakdown[p.id] }))
    : PILLARS.map((p) => ({ pillar: p.shortName, score: 0 }));

  const sortedPillars = knowledge
    ? [...PILLARS].sort((a, b) => knowledge.pillarBreakdown[b.id] - knowledge.pillarBreakdown[a.id])
    : [];
  const strengths = sortedPillars.slice(0, 2);
  const weaknesses = sortedPillars.slice(-2).reverse();

  const timeline = [
    { label: "Assigned to Module 001", date: employee.assignedDate, done: true },
    { label: "Attendance recorded", date: attendance?.sessionDate, done: !!attendance },
    { label: "Knowledge Assessment", date: knowledge?.date, done: !!knowledge, detail: knowledge ? `${knowledge.scorePercent}% · ${knowledge.passed ? "Passed" : "Failed"}` : undefined },
    { label: "Practical Assessment", date: practical?.date, done: !!practical, detail: practical ? `${practical.overall.toFixed(2)}/5 · ${practical.pass ? "Pass" : "Needs Coaching"}` : undefined },
    { label: "Role Play", date: rolePlay?.date, done: !!rolePlay, detail: rolePlay ? `${rolePlay.overall.toFixed(2)}/5` : undefined },
    { label: "Certificate Issued", date: certificate?.issueDate, done: !!certificate, detail: certificate?.certificateNumber },
    { label: "Manager Follow-Up", date: followUp?.date, done: !!followUp, detail: followUp ? (followUp.readyForPromotion ? "Promotion ready" : followUp.needsCoaching ? "Needs coaching" : "On track") : undefined },
  ];

  return (
    <AppShell title="Employee Profile" subtitle="Learning Passport">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <Avatar className="size-16">
              <AvatarFallback className="text-lg">{initials(employee.name)}</AvatarFallback>
            </Avatar>
            <h2 className="mt-3 font-display text-lg font-semibold">{employee.name}</h2>
            <p className="text-sm text-muted-foreground">{employee.role} · {store.name}</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">{employee.employeeNumber}</p>
            <Badge variant={employee.status === "completed" ? "success" : employee.status === "overdue" ? "danger" : "warning"} className="mt-3">
              {employee.status.replace("-", " ")}
            </Badge>

            <div className="mt-6 w-full space-y-2 text-left text-xs">
              <Row label="Manager" value={manager.name} />
              <Row label="Trainer" value={trainer.name} />
              <Row label="Hire Date" value={employee.hireDate} />
              <Row label="Assigned" value={employee.assignedDate} />
              <Row label="Due" value={employee.dueDate} />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4 lg:col-span-2 lg:grid-cols-4">
          <MiniStat icon={GraduationCap} label="Knowledge Score" value={knowledge ? `${knowledge.scorePercent}%` : "—"} accent="violet" />
          <MiniStat icon={ClipboardCheck} label="Practical Score" value={practical ? `${practical.overall.toFixed(2)}/5` : "—"} accent="amber" />
          <MiniStat icon={Award} label="Certificate" value={certificate ? "Issued" : "Pending"} accent={certificate ? "emerald" : "rose"} />
          <MiniStat icon={Clock} label="Training Hours" value={attendance ? `${(attendance.durationMin / 60).toFixed(1)}h` : "—"} accent="brand" />

          <Card className="col-span-2 lg:col-span-4">
            <CardHeader>
              <CardTitle>Competency by Pillar</CardTitle>
              <CardDescription>Knowledge Test breakdown for this employee</CardDescription>
            </CardHeader>
            <CardContent>
              <CompetencyRadar data={radar} color="var(--accent-violet)" height={260} />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Training History</CardTitle>
            <CardDescription>Full Module 001 journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              {timeline.map((t, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    {t.done ? <CheckCircle2 className="size-4.5 text-emerald" /> : <Circle className="size-4.5 text-border-strong" />}
                    {i < timeline.length - 1 && <div className="my-1 w-px flex-1 bg-border" />}
                  </div>
                  <div className="pb-5">
                    <p className={`text-sm font-medium ${!t.done && "text-muted-foreground"}`}>{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.date ?? "Not yet completed"}{t.detail ? ` · ${t.detail}` : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Strengths & Growth Areas</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {strengths.map((p) => (
                <div key={p.id} className="flex items-center gap-2 text-sm">
                  <TrendingUp className="size-4 text-emerald" /> {p.shortName}
                </div>
              ))}
              {weaknesses.map((p) => (
                <div key={p.id} className="flex items-center gap-2 text-sm">
                  <TrendingDown className="size-4 text-rose" /> {p.shortName}
                </div>
              ))}
              {!knowledge && <p className="text-xs text-muted-foreground">No assessment data yet.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recommended Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5 text-sm">
              {weaknesses[0] && (
                <div className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-brand" />
                  Shadow a top performer on {weaknesses[0].shortName.toLowerCase()}
                </div>
              )}
              <div className="flex items-start gap-2">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-brand" />
                {followUp?.readyForPromotion ? "Ready for promotion review" : "Continue coaching toward promotion readiness"}
              </div>
              <div className="flex items-start gap-2">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-brand" />
                Enroll in Module 002 once released
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-1.5 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent: "brand" | "amber" | "emerald" | "rose" | "violet";
}) {
  const map = {
    brand: "bg-brand-soft text-brand",
    amber: "bg-amber-soft text-amber",
    emerald: "bg-emerald-soft text-emerald",
    rose: "bg-rose-soft text-rose",
    violet: "bg-violet-soft text-violet",
  };
  return (
    <Card className="p-4">
      <div className={`flex size-8 items-center justify-center rounded-[8px] ${map[accent]}`}>
        <Icon className="size-4" />
      </div>
      <p className="mt-3 font-display text-lg font-bold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </Card>
  );
}
