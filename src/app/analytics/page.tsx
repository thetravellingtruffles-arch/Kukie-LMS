"use client";

import * as React from "react";
import { Loader2, GraduationCap, ClipboardCheck, QrCode, Award, TrendingUp } from "lucide-react";
import { format, parseISO, startOfWeek } from "date-fns";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { TrendLine } from "@/components/charts/trend-line";
import { BarCompare } from "@/components/charts/bar-compare";
import { fetchOrgSnapshot, overallStats, trainerSummaries, managerSummaries, scopeSnapshot, type OrgSnapshot } from "@/lib/rollups";
import { useAccessScope } from "@/lib/access/use-access-scope";

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
  const scope = useAccessScope();
  const [snap, setSnap] = React.useState<OrgSnapshot | null>(null);

  React.useEffect(() => {
    if (scope.loading) return;
    fetchOrgSnapshot().then((s) => setSnap(scopeSnapshot(s, scope.storeIds))).catch(() => setSnap(null));
  }, [scope.loading, scope.storeIds]);

  if (!snap) {
    return (
      <AppShell title="Analytics" subtitle="Loading…">
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading…
        </div>
      </AppShell>
    );
  }

  const stats = overallStats(snap);

  const weekMap = new Map<string, number>();
  snap.completions
    .filter((c) => c.certificateIssuedAt)
    .forEach((c) => {
      const week = format(startOfWeek(parseISO(c.certificateIssuedAt as string)), "MMM d");
      weekMap.set(week, (weekMap.get(week) ?? 0) + 1);
    });
  const weeklyTrend = Array.from(weekMap.entries()).map(([label, count]) => ({ label, count })).slice(-12);

  const scoreDist = bucketize(
    snap.completions.filter((c) => c.knowledgeScore != null).map((c) => c.knowledgeScore as number),
    [69, 79, 89, 100],
    ["60–69%", "70–79%", "80–89%", "90–100%"]
  );

  const practicalDist = bucketize(
    snap.completions.filter((c) => c.practicalScore != null).map((c) => c.practicalScore as number),
    [2.49, 3.49, 4.49, 5],
    ["1.0–2.5", "2.5–3.5", "3.5–4.5", "4.5–5.0"]
  );

  const roles = Array.from(new Set(snap.staff.map((s) => s.role).filter((r): r is string => !!r)));
  const roleRows = roles.map((role) => {
    const staffIds = new Set(snap.staff.filter((s) => s.role === role).map((s) => s.id));
    const scores = snap.completions.filter((c) => staffIds.has(c.staffId) && c.knowledgeScore != null).map((c) => c.knowledgeScore as number);
    const avgQuiz = scores.length ? scores.reduce((s, v) => s + v, 0) / scores.length : 0;
    return { label: role, avgQuiz: Math.round(avgQuiz) };
  });

  const trainerRows = trainerSummaries(snap).map((t) => ({ label: t.trainer.name.split(" ")[0], score: Number((t.avgPractical * 20).toFixed(0)) }));
  const managerRows = managerSummaries(snap).slice(0, 10).map((m) => ({ label: m.manager.name.split(" ")[0], compliance: Math.round(m.compliance) }));

  return (
    <AppShell title="Analytics" subtitle="Deep performance analytics — real L&D data">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={GraduationCap} label="Assessment Avg" value={stats.avgQuiz ? `${stats.avgQuiz.toFixed(1)}%` : "—"} accent="violet" />
        <StatCard icon={ClipboardCheck} label="Practical Avg" value={stats.avgPractical ? `${stats.avgPractical.toFixed(2)} / 5` : "—"} accent="amber" />
        <StatCard icon={QrCode} label="Attendance Sessions" value={`${stats.attendanceSessions.toLocaleString()}`} accent="brand" />
        <StatCard icon={Award} label="Certificates" value={`${stats.certificates}`} accent="emerald" />
        <StatCard icon={TrendingUp} label="Compliance" value={`${stats.compliance.toFixed(0)}%`} accent="rose" />
      </div>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Certification Trend</CardTitle>
          <CardDescription>Certificates issued per week, last 12 weeks</CardDescription>
        </CardHeader>
        <CardContent>
          {weeklyTrend.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No certificates issued yet.</p>
          ) : (
            <TrendLine data={weeklyTrend} dataKey="count" xKey="label" color="var(--accent-emerald)" />
          )}
        </CardContent>
      </Card>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assessment Score Distribution</CardTitle>
            <CardDescription>Knowledge Assessment results</CardDescription>
          </CardHeader>
          <CardContent>
            <BarCompare data={scoreDist} bars={[{ key: "count", color: "var(--brand)" }]} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Practical Score Distribution</CardTitle>
            <CardDescription>Out of 5</CardDescription>
          </CardHeader>
          <CardContent>
            <BarCompare data={practicalDist} bars={[{ key: "count", color: "var(--accent-amber)" }]} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Role Comparison</CardTitle>
            <CardDescription>Avg quiz score by role</CardDescription>
          </CardHeader>
          <CardContent>
            {roleRows.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No staff roles set yet.</p> : <BarCompare data={roleRows} bars={[{ key: "avgQuiz", color: "var(--accent-violet)" }]} layout="horizontal" />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Trainer Performance</CardTitle>
            <CardDescription>Avg trainee practical score (scaled /100)</CardDescription>
          </CardHeader>
          <CardContent>
            {trainerRows.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No trainers yet.</p> : <BarCompare data={trainerRows} bars={[{ key: "score", color: "var(--brand)" }]} />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Manager Performance</CardTitle>
            <CardDescription>Team compliance, top 10 managers</CardDescription>
          </CardHeader>
          <CardContent>
            {managerRows.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No managers yet.</p> : <BarCompare data={managerRows} bars={[{ key: "compliance", color: "var(--accent-emerald)" }]} />}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
