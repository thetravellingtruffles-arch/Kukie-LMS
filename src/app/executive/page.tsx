import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { Donut } from "@/components/charts/donut";
import { BarCompare } from "@/components/charts/bar-compare";
import { DATA, overallStats, storeSummary, salesImpactSeries } from "@/lib/data";
import { Users2, Award, Clock, TrendingUp, DollarSign, Sparkles } from "lucide-react";

export default function ExecutivePage() {
  const stats = overallStats();
  const summaries = DATA.stores.map((s) => storeSummary(s.id));
  const ranked = [...summaries].sort((a, b) => b.compliance - a.compliance);
  const kpiSeries = salesImpactSeries();
  const before = kpiSeries.find((k) => k.period === "before")!;
  const d90 = kpiSeries.find((k) => k.period === "d90")!;

  const totalGuestsAnnual = d90.guestCount * DATA.stores.length * 365;
  const revenueImpactAnnual = (d90.atv - before.atv) * totalGuestsAnnual;
  const trainingCost = stats.trainingHours * 28; // fully loaded hourly cost estimate
  const roiPercent = trainingCost > 0 ? (revenueImpactAnnual / trainingCost) * 100 : 0;

  const promotionReady = DATA.managerFollowUps.filter((f) => f.readyForPromotion);
  const needsCoaching = DATA.managerFollowUps.filter((f) => f.needsCoaching);

  const readiness = [
    { name: "Completed", value: stats.completed, color: "var(--accent-emerald)" },
    { name: "In Progress", value: stats.inProgress, color: "var(--accent-amber)" },
    { name: "Overdue", value: stats.overdue, color: "var(--accent-rose)" },
    { name: "Not Started", value: stats.notStarted, color: "var(--border-strong)" },
  ];

  return (
    <AppShell title="Executive Dashboard" subtitle="Company-wide Module 001 performance">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users2} label="Employees Trained" value={`${stats.completed} / ${stats.assigned}`} accent="brand" />
        <StatCard icon={Clock} label="Total Training Hours" value={stats.trainingHours.toLocaleString(undefined, { maximumFractionDigits: 0 })} accent="violet" />
        <StatCard icon={Award} label="Certificates Issued" value={`${stats.certificates}`} accent="emerald" />
        <StatCard icon={DollarSign} label="Est. Training ROI" value={`${roiPercent.toFixed(0)}%`} deltaLabel="Projected annual, vs. training cost" accent="amber" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Employee Readiness</CardTitle>
            <CardDescription>Status across all {stats.assigned} assigned</CardDescription>
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
            <CardDescription>Compliance across all 12 stores</CardDescription>
          </CardHeader>
          <CardContent>
            <BarCompare
              data={ranked.map((s) => ({ label: s.store.code, compliance: Math.round(s.compliance) }))}
              bars={[{ key: "compliance", color: "var(--brand)" }]}
              layout="horizontal"
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5"><TrendingUp className="size-4 text-emerald" /> Training ROI Model</CardTitle>
            <CardDescription>Illustrative — ATV lift × guest volume vs. training cost</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5 text-sm">
            <RoiRow label="ATV before training" value={`$${before.atv.toFixed(2)}`} />
            <RoiRow label="ATV at 90 days" value={`$${d90.atv.toFixed(2)}`} />
            <RoiRow label="Projected annual revenue impact" value={`$${revenueImpactAnnual.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} highlight />
            <RoiRow label="Estimated fully-loaded training cost" value={`$${trainingCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
            <RoiRow label="Estimated ROI" value={`${roiPercent.toFixed(0)}%`} highlight />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5"><Sparkles className="size-4 text-violet" /> Promotion Pipeline</CardTitle>
            <CardDescription>{promotionReady.length} ready · {needsCoaching.length} need coaching</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {promotionReady.slice(0, 8).map((f) => {
              const emp = DATA.employees.find((e) => e.id === f.employeeId)!;
              const store = DATA.stores.find((s) => s.id === emp.storeId)!;
              return (
                <Link key={f.employeeId} href={`/employees/${emp.id}`} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 hover:text-brand">
                  <div>
                    <p className="text-sm font-medium">{emp.name}</p>
                    <p className="text-xs text-muted-foreground">{emp.role} · {store.code}</p>
                  </div>
                  <Badge variant="violet">Promotion Ready</Badge>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function RoiRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-1.5 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={highlight ? "font-display font-semibold text-brand" : "font-medium"}>{value}</span>
    </div>
  );
}
