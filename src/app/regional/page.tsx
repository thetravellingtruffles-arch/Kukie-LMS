import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarCompare } from "@/components/charts/bar-compare";
import { DATA, storeSummary } from "@/lib/data";

export default function RegionalPage() {
  const summaries = DATA.stores.map((s) => storeSummary(s.id));
  const ranked = [...summaries].sort((a, b) => b.compliance - a.compliance);

  const regionRows = DATA.regions.map((r) => {
    const inRegion = summaries.filter((s) => s.store.regionId === r.id);
    const emps = inRegion.reduce((sum, s) => sum + s.employees.length, 0);
    const compliance = inRegion.reduce((sum, s) => sum + s.compliance, 0) / inRegion.length;
    const quiz = inRegion.reduce((sum, s) => sum + s.avgQuiz, 0) / inRegion.length;
    const practical = inRegion.reduce((sum, s) => sum + s.avgPractical, 0) / inRegion.length;
    return { region: r, stores: inRegion.length, employees: emps, compliance, quiz, practical };
  });

  const trainerRows = DATA.trainers.map((t) => {
    const emps = DATA.employees.filter((e) => e.trainerId === t.id);
    const ids = new Set(emps.map((e) => e.id));
    const practicals = DATA.practicalAssessments.filter((p) => ids.has(p.employeeId));
    const avgPractical = practicals.length ? practicals.reduce((s, p) => s + p.overall, 0) / practicals.length : 0;
    const certs = DATA.certificates.filter((c) => ids.has(c.employeeId)).length;
    return { trainer: t, trainees: emps.length, avgPractical, certs };
  });

  const managerRows = DATA.managers
    .map((m) => {
      const emps = DATA.employees.filter((e) => e.managerId === m.id);
      const completed = emps.filter((e) => e.status === "completed").length;
      const compliance = emps.length ? (completed / emps.length) * 100 : 0;
      const store = DATA.stores.find((s) => s.id === m.storeId)!;
      return { manager: m, store, team: emps.length, compliance };
    })
    .sort((a, b) => b.compliance - a.compliance)
    .slice(0, 12);

  return (
    <AppShell title="Regional Dashboard" subtitle="Compare stores, managers and trainers">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {regionRows.map((r) => (
          <Card key={r.region.id} className="p-5">
            <p className="font-display text-base font-semibold">{r.region.name}</p>
            <p className="text-xs text-muted-foreground">{r.stores} stores · {r.employees} employees</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <MiniMetric label="Compliance" value={`${r.compliance.toFixed(0)}%`} />
              <MiniMetric label="Quiz Avg" value={`${r.quiz.toFixed(0)}%`} />
              <MiniMetric label="Practical" value={r.practical.toFixed(1)} />
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Store Ranking</CardTitle>
          <CardDescription>All 12 stores ranked by compliance</CardDescription>
        </CardHeader>
        <CardContent>
          <BarCompare
            data={ranked.map((s) => ({ label: s.store.code, compliance: Math.round(s.compliance) }))}
            bars={[{ key: "compliance", color: "var(--brand)" }]}
            layout="horizontal"
            height={340}
          />
        </CardContent>
      </Card>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Trainer Comparison</CardTitle>
            <CardDescription>4 certified Kükie Academy trainers</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {trainerRows.map((t) => (
              <div key={t.trainer.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium">{t.trainer.name}</p>
                  <p className="text-xs text-muted-foreground">{t.trainees} trainees · {t.certs} certified</p>
                </div>
                <Badge variant={t.avgPractical >= 4 ? "success" : t.avgPractical >= 3.5 ? "warning" : "danger"}>
                  {t.avgPractical.toFixed(2)} / 5
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Managers by Compliance</CardTitle>
            <CardDescription>Team compliance rate</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {managerRows.map((m) => (
              <Link key={m.manager.id} href={`/stores/${m.store.id}`} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 hover:text-brand">
                <div>
                  <p className="text-sm font-medium">{m.manager.name}</p>
                  <p className="text-xs text-muted-foreground">{m.store.code} · {m.team} direct reports</p>
                </div>
                <span className="text-sm font-semibold">{m.compliance.toFixed(0)}%</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] bg-surface-muted p-2">
      <p className="font-display text-sm font-semibold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
