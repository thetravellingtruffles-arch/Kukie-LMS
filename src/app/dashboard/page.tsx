"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, Users2, CheckCircle2, Award, GraduationCap, ClipboardCheck, QrCode } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarCompare } from "@/components/charts/bar-compare";
import { fetchOrgSnapshot, overallStats, storeSummary, type OrgSnapshot } from "@/lib/rollups";

export default function DashboardPage() {
  const [snap, setSnap] = React.useState<OrgSnapshot | null>(null);

  React.useEffect(() => {
    fetchOrgSnapshot().then(setSnap).catch(() => setSnap(null));
  }, []);

  if (!snap) {
    return (
      <AppShell title="Home Dashboard" subtitle="Kükie Academy">
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading dashboard…
        </div>
      </AppShell>
    );
  }

  const stats = overallStats(snap);
  const storeSummaries = snap.stores.map((s) => storeSummary(snap, s.id));
  const barData = storeSummaries
    .map((s) => ({ label: s.store?.code ?? "—", compliance: Math.round(s.compliance) }))
    .sort((a, b) => b.compliance - a.compliance);

  return (
    <AppShell title="Home Dashboard" subtitle="Kükie Academy · Real-time L&D data">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users2} label="Staff Recorded" value={stats.assigned.toLocaleString()} accent="brand" />
        <StatCard icon={CheckCircle2} label="Certified" value={stats.completed.toLocaleString()} accent="emerald" />
        <StatCard icon={GraduationCap} label="Average Assessment Score" value={stats.avgQuiz ? `${stats.avgQuiz.toFixed(1)}%` : "—"} accent="violet" />
        <StatCard icon={ClipboardCheck} label="Average Practical Score" value={stats.avgPractical ? `${stats.avgPractical.toFixed(2)} / 5` : "—"} accent="amber" />
        <StatCard icon={Award} label="Certificates Issued" value={stats.certificates.toLocaleString()} accent="rose" />
        <StatCard icon={QrCode} label="Attendance Sessions" value={stats.attendanceSessions.toLocaleString()} accent="brand" />
        <StatCard icon={Users2} label="Stores" value={`${snap.stores.length}`} accent="emerald" />
        <StatCard icon={GraduationCap} label="Trainers" value={`${snap.trainers.length}`} accent="violet" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Compliance</CardTitle>
            <CardDescription>Company-wide certification rate</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <ProgressRing value={stats.compliance} size={128} stroke={11} sublabel="compliant" />
            <div className="grid w-full grid-cols-2 gap-2 text-center">
              <div className="rounded-[10px] bg-surface-muted p-2">
                <p className="font-display text-sm font-semibold">{stats.inProgress}</p>
                <p className="text-[10px] text-muted-foreground">In Progress</p>
              </div>
              <div className="rounded-[10px] bg-rose-soft p-2">
                <p className="font-display text-sm font-semibold text-rose">{stats.overdue}</p>
                <p className="text-[10px] text-rose">Needs Retake</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Store Compliance Comparison</CardTitle>
            <CardDescription>Percentage of staff certified, per store</CardDescription>
          </CardHeader>
          <CardContent>
            {barData.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">No stores set up yet — add one in Organization Setup.</p>
            ) : (
              <BarCompare data={barData} bars={[{ key: "compliance", color: "var(--brand)" }]} layout="horizontal" height={300} />
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Store Directory</CardTitle>
            <CardDescription>{snap.stores.length} store{snap.stores.length === 1 ? "" : "s"} set up</CardDescription>
          </div>
          <Link href="/stores" className="text-xs font-medium text-brand hover:underline">
            View all stores →
          </Link>
        </CardHeader>
        <CardContent>
          {storeSummaries.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No stores yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="pb-2 font-medium">Store</th>
                    <th className="pb-2 font-medium">Format</th>
                    <th className="pb-2 font-medium">Staff</th>
                    <th className="pb-2 font-medium">Compliance</th>
                    <th className="pb-2 font-medium">Certificates</th>
                  </tr>
                </thead>
                <tbody>
                  {storeSummaries.map((s) => (
                    <tr key={s.store?.id} className="border-b border-border/60 last:border-0">
                      <td className="py-2.5">
                        <Link href={`/stores/${s.store?.id}`} className="font-medium hover:text-brand">
                          {s.store?.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">{s.store?.city}</p>
                      </td>
                      <td className="py-2.5">
                        <Badge variant="secondary">{s.store?.format ?? "—"}</Badge>
                      </td>
                      <td className="py-2.5">{s.staffList.length}</td>
                      <td className="py-2.5">
                        <span className={s.compliance >= 80 ? "text-emerald" : s.compliance >= 60 ? "text-amber" : "text-rose"}>
                          {s.compliance.toFixed(0)}%
                        </span>
                      </td>
                      <td className="py-2.5">{s.certificates}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
