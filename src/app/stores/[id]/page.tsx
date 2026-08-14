import { notFound } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { AtvTrend } from "@/components/charts/atv-trend";
import { DATA, storeSummary, salesImpactSeries } from "@/lib/data";
import { Users2, Award, GraduationCap, ClipboardCheck, AlertTriangle } from "lucide-react";

export default async function StoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = DATA.stores.find((s) => s.id === id);
  if (!store) notFound();

  const summary = storeSummary(id);
  const kpiSeries = salesImpactSeries([id]);
  const manager = DATA.managers.find((m) => m.id === store.managerId)!;

  return (
    <AppShell title={store.name} subtitle={`${store.code} · ${store.city}`}>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{store.format}</Badge>
        <Badge variant="outline">Opened {store.openedYear}</Badge>
        <Badge variant="outline">GM: {manager.name}</Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users2} label="Employees Assigned" value={`${summary.employees.length}`} accent="brand" />
        <StatCard icon={GraduationCap} label="Avg Quiz Score" value={`${summary.avgQuiz.toFixed(1)}%`} accent="violet" />
        <StatCard icon={ClipboardCheck} label="Avg Practical Score" value={`${summary.avgPractical.toFixed(2)} / 5`} accent="amber" />
        <StatCard icon={Award} label="Certificates" value={`${summary.certificates}`} accent="emerald" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Compliance</CardTitle>
            <CardDescription>Course completion rate</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <ProgressRing value={summary.compliance} size={120} stroke={10} sublabel="compliant" />
            <div className="grid w-full grid-cols-2 gap-2 text-center text-xs">
              <div className="rounded-[10px] bg-emerald-soft p-2">
                <p className="font-display font-semibold text-emerald">{summary.employees.filter((e) => e.status === "completed").length}</p>
                <p className="text-emerald/80">Completed</p>
              </div>
              <div className="rounded-[10px] bg-rose-soft p-2">
                <p className="font-display font-semibold text-rose">{summary.overdueEmployees.length}</p>
                <p className="text-rose/80">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>ATV Trend</CardTitle>
            <CardDescription>Before Training → 90 Days, this store</CardDescription>
          </CardHeader>
          <CardContent>
            <AtvTrend data={kpiSeries} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Employees</CardTitle>
            <CardDescription>Ranked by combined quiz + practical performance</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {summary.topEmployees.map((t, i) => (
              <Link key={t.employee.id} href={`/employees/${t.employee.id}`} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 hover:text-brand">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-6 items-center justify-center rounded-full bg-brand-soft text-[11px] font-bold text-brand">{i + 1}</span>
                  <span className="text-sm font-medium">{t.employee.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{t.quiz}% · {t.practical.toFixed(1)}/5</span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5"><AlertTriangle className="size-4 text-rose" /> Employees Overdue</CardTitle>
            <CardDescription>Past due date without completion</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {summary.overdueEmployees.length === 0 && <p className="text-sm text-muted-foreground">No overdue employees — great work.</p>}
            {summary.overdueEmployees.slice(0, 8).map((e) => (
              <Link key={e.id} href={`/employees/${e.id}`} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 hover:text-brand">
                <span className="text-sm font-medium">{e.name}</span>
                <span className="text-xs text-rose">Due {e.dueDate}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
