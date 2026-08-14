import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { TrendLine } from "@/components/charts/trend-line";
import { BarCompare } from "@/components/charts/bar-compare";
import { CompetencyRadar } from "@/components/charts/competency-radar";
import { Heatmap } from "@/components/charts/heatmap";
import { DATA, overallStats, pillarCompetencyRadar } from "@/lib/data";
import { PILLARS } from "@/lib/curriculum/pillars";
import { GraduationCap, ClipboardCheck, Clock, Award, TrendingUp } from "lucide-react";
import { format, parseISO, startOfWeek } from "date-fns";

function bucketize(values: number[], edges: number[], labels: string[]) {
  const counts = Array(labels.length).fill(0);
  values.forEach((v) => {
    for (let i = 0; i < edges.length; i++) {
      if (v <= edges[i]) {
        counts[i]++;
        return;
      }
    }
    counts[counts.length - 1]++;
  });
  return labels.map((l, i) => ({ label: l, count: counts[i] }));
}

export default function AnalyticsPage() {
  const stats = overallStats();
  const radar = pillarCompetencyRadar();

  // Weekly certification trend
  const weekMap = new Map<string, number>();
  DATA.certificates.forEach((c) => {
    const week = format(startOfWeek(parseISO(c.issueDate)), "MMM d");
    weekMap.set(week, (weekMap.get(week) ?? 0) + 1);
  });
  const weeklyTrend = Array.from(weekMap.entries())
    .map(([label, count]) => ({ label, count }))
    .slice(-12);

  const scoreDist = bucketize(
    DATA.knowledgeAttempts.map((k) => k.scorePercent),
    [69, 79, 89, 100],
    ["60–69%", "70–79%", "80–89%", "90–100%"]
  );

  const practicalDist = bucketize(
    DATA.practicalAssessments.map((p) => p.overall),
    [2.49, 3.49, 4.49, 5],
    ["1.0–2.5", "2.5–3.5", "3.5–4.5", "4.5–5.0"]
  );

  const roleRows = Array.from(new Set(DATA.employees.map((e) => e.role))).map((role) => {
    const emps = DATA.employees.filter((e) => e.role === role);
    const ids = new Set(emps.map((e) => e.id));
    const quizzes = DATA.knowledgeAttempts.filter((k) => ids.has(k.employeeId));
    const avgQuiz = quizzes.length ? quizzes.reduce((s, k) => s + k.scorePercent, 0) / quizzes.length : 0;
    return { label: role, avgQuiz: Math.round(avgQuiz) };
  });

  const trainerRows = DATA.trainers.map((t) => {
    const emps = DATA.employees.filter((e) => e.trainerId === t.id);
    const ids = new Set(emps.map((e) => e.id));
    const practicals = DATA.practicalAssessments.filter((p) => ids.has(p.employeeId));
    const avg = practicals.length ? practicals.reduce((s, p) => s + p.overall, 0) / practicals.length : 0;
    return { label: t.name.split(" ")[0], score: Number((avg * 20).toFixed(0)) };
  });

  const managerRows = DATA.managers.slice(0, 10).map((m) => {
    const emps = DATA.employees.filter((e) => e.managerId === m.id);
    const completed = emps.filter((e) => e.status === "completed").length;
    return { label: m.name.split(" ")[0], compliance: emps.length ? Math.round((completed / emps.length) * 100) : 0 };
  });

  const storePillarHeat = DATA.stores.map((store) => {
    const emps = DATA.employees.filter((e) => e.storeId === store.id);
    const ids = new Set(emps.map((e) => e.id));
    const attempts = DATA.knowledgeAttempts.filter((k) => ids.has(k.employeeId));
    const scores: Record<string, number> = {};
    PILLARS.forEach((p) => {
      scores[p.id] = attempts.length
        ? Math.round(attempts.reduce((s, a) => s + a.pillarBreakdown[p.id], 0) / attempts.length)
        : 0;
    });
    return { store, scores };
  });

  return (
    <AppShell title="Analytics" subtitle="Deep performance analytics across Module 001">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={GraduationCap} label="Assessment Avg" value={`${stats.avgQuiz.toFixed(1)}%`} accent="violet" />
        <StatCard icon={ClipboardCheck} label="Practical Avg" value={`${stats.avgPractical.toFixed(2)} / 5`} accent="amber" />
        <StatCard icon={Clock} label="Attendance Sessions" value={`${DATA.attendance.length.toLocaleString()}`} accent="brand" />
        <StatCard icon={Award} label="Certificates" value={`${stats.certificates}`} accent="emerald" />
        <StatCard icon={TrendingUp} label="Compliance" value={`${stats.compliance.toFixed(0)}%`} accent="rose" />
      </div>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Certification Trend</CardTitle>
          <CardDescription>Certificates issued per week, last 12 weeks</CardDescription>
        </CardHeader>
        <CardContent>
          <TrendLine data={weeklyTrend} dataKey="count" xKey="label" color="var(--accent-emerald)" />
        </CardContent>
      </Card>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assessment Score Distribution</CardTitle>
            <CardDescription>Knowledge Test results</CardDescription>
          </CardHeader>
          <CardContent>
            <BarCompare data={scoreDist} bars={[{ key: "count", color: "var(--brand)" }]} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Practical Score Distribution</CardTitle>
            <CardDescription>10-point rubric, out of 5</CardDescription>
          </CardHeader>
          <CardContent>
            <BarCompare data={practicalDist} bars={[{ key: "count", color: "var(--accent-amber)" }]} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Competency by Pillar</CardTitle>
            <CardDescription>Company-wide</CardDescription>
          </CardHeader>
          <CardContent>
            <CompetencyRadar data={radar} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Store Heat Map — Competency by Pillar</CardTitle>
            <CardDescription>Average Knowledge Test score per pillar, per store</CardDescription>
          </CardHeader>
          <CardContent>
            <Heatmap
              rows={storePillarHeat.map((s) => ({ id: s.store.id, label: s.store.code }))}
              columns={PILLARS.map((p) => ({ id: p.id, label: `P${p.index}` }))}
              getValue={(rowId, colId) => storePillarHeat.find((s) => s.store.id === rowId)!.scores[colId]}
            />
          </CardContent>
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Department Comparison</CardTitle>
            <CardDescription>Avg quiz score by role</CardDescription>
          </CardHeader>
          <CardContent>
            <BarCompare data={roleRows} bars={[{ key: "avgQuiz", color: "var(--accent-violet)" }]} layout="horizontal" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Trainer Performance</CardTitle>
            <CardDescription>Avg trainee practical score (scaled /100)</CardDescription>
          </CardHeader>
          <CardContent>
            <BarCompare data={trainerRows} bars={[{ key: "score", color: "var(--brand)" }]} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Manager Performance</CardTitle>
            <CardDescription>Team compliance, top 10 managers</CardDescription>
          </CardHeader>
          <CardContent>
            <BarCompare data={managerRows} bars={[{ key: "compliance", color: "var(--accent-emerald)" }]} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
