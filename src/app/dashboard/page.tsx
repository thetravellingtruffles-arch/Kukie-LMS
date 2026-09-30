import { AppShell } from "@/components/layout/app-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarCompare } from "@/components/charts/bar-compare";
import { CompetencyRadar } from "@/components/charts/competency-radar";
import { Heatmap } from "@/components/charts/heatmap";
import { DATA, overallStats, pillarCompetencyRadar, storeSummary } from "@/lib/data";
import { Users2, CheckCircle2, Award, Clock, GraduationCap, ClipboardCheck } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const stats = overallStats();
  const radar = pillarCompetencyRadar();
  const storeSummaries = DATA.stores.map((s) => storeSummary(s.id));

  const barData = storeSummaries
    .map((s) => ({ label: s.store.code, compliance: Math.round(s.compliance) }))
    .sort((a, b) => b.compliance - a.compliance);

  return (
    <AppShell title="Home Dashboard" subtitle="Kükie Academy · Module 001 · Sales Build-Up Excellence">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users2} label="Employees Assigned" value={stats.assigned.toLocaleString()} accent="brand" />
        <StatCard
          icon={CheckCircle2}
          label="Employees Completed"
          value={stats.completed.toLocaleString()}
          delta={4.2}
          deltaLabel="vs. last 30 days"
          accent="emerald"
        />
        <StatCard icon={GraduationCap} label="Average Assessment Score" value={`${stats.avgQuiz.toFixed(1)}%`} delta={2.1} accent="violet" />
        <StatCard icon={ClipboardCheck} label="Average Practical Score" value={`${stats.avgPractical.toFixed(2)} / 5`} delta={1.4} accent="amber" />
        <StatCard icon={Award} label="Certificates Issued" value={stats.certificates.toLocaleString()} delta={5.6} accent="rose" />
        <StatCard icon={Clock} label="Training Hours" value={stats.trainingHours.toLocaleString(undefined, { maximumFractionDigits: 0 })} accent="brand" />
        <StatCard icon={Users2} label="Stores Onboarded" value={`${DATA.stores.length}`} accent="emerald" />
        <StatCard icon={GraduationCap} label="Active Trainers" value={`${DATA.trainers.length}`} accent="violet" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Compliance</CardTitle>
            <CardDescription>Company-wide training completion</CardDescription>
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
                <p className="text-[10px] text-rose">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Store Compliance Comparison</CardTitle>
            <CardDescription>Percentage of assigned employees who completed Module 001</CardDescription>
          </CardHeader>
          <CardContent>
            <BarCompare data={barData} bars={[{ key: "compliance", color: "var(--brand)", name: "Compliance %" }]} layout="horizontal" height={300} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Competency by Pillar</CardTitle>
            <CardDescription>Average Knowledge Test score, all employees</CardDescription>
          </CardHeader>
          <CardContent>
            <CompetencyRadar data={radar} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Store Heat Map</CardTitle>
            <CardDescription>Compliance, quiz average and practical average by store</CardDescription>
          </CardHeader>
          <CardContent>
            <Heatmap
              rows={storeSummaries.map((s) => ({ id: s.store.id, label: s.store.code }))}
              columns={[
                { id: "compliance", label: "Compliance" },
                { id: "quiz", label: "Quiz Avg" },
                { id: "practical", label: "Practical" },
              ]}
              getValue={(rowId, colId) => {
                const s = storeSummaries.find((x) => x.store.id === rowId)!;
                if (colId === "compliance") return s.compliance;
                if (colId === "quiz") return s.avgQuiz;
                return (s.avgPractical / 5) * 100;
              }}
              formatValue={(v) => `${Math.round(v)}`}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Store Directory</CardTitle>
            <CardDescription>All 12 stores currently running Module 001</CardDescription>
          </div>
          <Link href="/stores" className="text-xs font-medium text-brand hover:underline">
            View all stores →
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="pb-2 font-medium">Store</th>
                  <th className="pb-2 font-medium">Format</th>
                  <th className="pb-2 font-medium">Employees</th>
                  <th className="pb-2 font-medium">Compliance</th>
                  <th className="pb-2 font-medium">Certificates</th>
                </tr>
              </thead>
              <tbody>
                {storeSummaries.map((s) => (
                  <tr key={s.store.id} className="border-b border-border/60 last:border-0">
                    <td className="py-2.5">
                      <Link href={`/stores/${s.store.id}`} className="font-medium hover:text-brand">
                        {s.store.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{s.store.city}</p>
                    </td>
                    <td className="py-2.5">
                      <Badge variant="secondary">{s.store.format}</Badge>
                    </td>
                    <td className="py-2.5">{s.employees.length}</td>
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
        </CardContent>
      </Card>
    </AppShell>
  );
}
