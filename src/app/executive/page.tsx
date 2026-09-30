"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, Users2, Award, GraduationCap, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { Donut } from "@/components/charts/donut";
import { BarCompare } from "@/components/charts/bar-compare";
import { fetchOrgSnapshot, overallStats, storeSummary, promotionReadyCompletions, needsCoachingCompletions, type OrgSnapshot } from "@/lib/rollups";

export default function ExecutivePage() {
  const [snap, setSnap] = React.useState<OrgSnapshot | null>(null);

  React.useEffect(() => {
    fetchOrgSnapshot().then(setSnap).catch(() => setSnap(null));
  }, []);

  if (!snap) {
    return (
      <AppShell title="Executive Dashboard" subtitle="Loading…">
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading…
        </div>
      </AppShell>
    );
  }

  const stats = overallStats(snap);
  const summaries = snap.stores.map((s) => storeSummary(snap, s.id));
  const ranked = [...summaries].sort((a, b) => b.compliance - a.compliance);
  const promotionReady = promotionReadyCompletions(snap);
  const needsCoaching = needsCoachingCompletions(snap);

  const readiness = [
    { name: "Certified", value: stats.completed, color: "var(--accent-emerald)" },
    { name: "In Progress", value: stats.inProgress, color: "var(--accent-amber)" },
    { name: "Needs Retake", value: stats.overdue, color: "var(--accent-rose)" },
    { name: "Not Started", value: stats.notStarted, color: "var(--border-strong)" },
  ];

  return (
    <AppShell title="Executive Dashboard" subtitle="Company-wide L&D performance — real data">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users2} label="Staff Certified" value={`${stats.completed} / ${stats.assigned}`} accent="brand" />
        <StatCard icon={GraduationCap} label="Avg Assessment Score" value={stats.avgQuiz ? `${stats.avgQuiz.toFixed(1)}%` : "—"} accent="violet" />
        <StatCard icon={Award} label="Certificates Issued" value={`${stats.certificates}`} accent="emerald" />
        <StatCard icon={Sparkles} label="Promotion Ready" value={`${promotionReady.length}`} accent="amber" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Staff Readiness</CardTitle>
            <CardDescription>Status across all {stats.assigned} staff</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Donut data={readiness} centerValue={`${stats.compliance.toFixed(0)}%`} centerLabel="Compliant" />
            <div className="mt-2 grid w-full grid-cols-2 gap-2 text-xs">
              {readiness.map((r) => (
                <div key={r.name} className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ background: r.color }} />
                  {r.name} · {r.value}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Store Ranking</CardTitle>
            <CardDescription>Compliance across all {snap.stores.length} stores</CardDescription>
          </CardHeader>
          <CardContent>
            {ranked.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">No stores yet.</p>
            ) : (
              <BarCompare
                data={ranked.map((s) => ({ label: s.store?.code ?? "—", compliance: Math.round(s.compliance) }))}
                bars={[{ key: "compliance", color: "var(--brand)" }]}
                layout="horizontal"
                height={300}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5"><Sparkles className="size-4 text-violet" /> Promotion Pipeline</CardTitle>
          <CardDescription>{promotionReady.length} ready · {needsCoaching.length} need coaching (from manager follow-ups)</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {promotionReady.length === 0 && <p className="text-sm text-muted-foreground">No manager follow-ups marked promotion-ready yet.</p>}
          {promotionReady.slice(0, 8).map((c) => (
            <Link key={c.id} href={`/employees/${c.staffId}`} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 hover:text-brand">
              <div>
                <p className="text-sm font-medium">{c.staff?.name}</p>
                <p className="text-xs text-muted-foreground">{c.staff?.role ?? "—"} · {c.staff?.storeName ?? "—"}</p>
              </div>
              <Badge variant="violet">Promotion Ready</Badge>
            </Link>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  );
}
