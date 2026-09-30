"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarCompare } from "@/components/charts/bar-compare";
import { fetchOrgSnapshot, storeSummary, regionSummaries, trainerSummaries, managerSummaries, type OrgSnapshot } from "@/lib/rollups";

export default function RegionalPage() {
  const [snap, setSnap] = React.useState<OrgSnapshot | null>(null);

  React.useEffect(() => {
    fetchOrgSnapshot().then(setSnap).catch(() => setSnap(null));
  }, []);

  if (!snap) {
    return (
      <AppShell title="Regional Dashboard" subtitle="Loading…">
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading…
        </div>
      </AppShell>
    );
  }

  const summaries = snap.stores.map((s) => storeSummary(snap, s.id));
  const ranked = [...summaries].sort((a, b) => b.compliance - a.compliance);
  const regionRows = regionSummaries(snap);
  const trainerRows = trainerSummaries(snap);
  const managerRows = [...managerSummaries(snap)].sort((a, b) => b.compliance - a.compliance).slice(0, 12);

  return (
    <AppShell title="Regional Dashboard" subtitle="Compare stores, managers and trainers — real data">
      {regionRows.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No regions set up yet — add them in Organization Setup.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {regionRows.map((r) => (
            <Card key={r.region.id} className="p-5">
              <p className="font-display text-base font-semibold">{r.region.name}</p>
              <p className="text-xs text-muted-foreground">{r.storeCount} store{r.storeCount === 1 ? "" : "s"} · {r.staffCount} staff</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <MiniMetric label="Compliance" value={`${r.compliance.toFixed(0)}%`} />
                <MiniMetric label="Quiz Avg" value={r.avgQuiz ? `${r.avgQuiz.toFixed(0)}%` : "—"} />
                <MiniMetric label="Practical" value={r.avgPractical ? r.avgPractical.toFixed(1) : "—"} />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Store Ranking</CardTitle>
          <CardDescription>All {snap.stores.length} stores ranked by compliance</CardDescription>
        </CardHeader>
        <CardContent>
          {ranked.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No stores yet.</p>
          ) : (
            <BarCompare
              data={ranked.map((s) => ({ label: s.store?.code ?? "—", compliance: Math.round(s.compliance) }))}
              bars={[{ key: "compliance", color: "var(--brand)" }]}
              layout="horizontal"
              height={340}
            />
          )}
        </CardContent>
      </Card>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Trainer Comparison</CardTitle>
            <CardDescription>{snap.trainers.length} trainer{snap.trainers.length === 1 ? "" : "s"} — matched by name on logged completions</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {trainerRows.length === 0 && <p className="text-sm text-muted-foreground">No trainers set up yet.</p>}
            {trainerRows.map((t) => (
              <div key={t.trainer.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium">{t.trainer.name}</p>
                  <p className="text-xs text-muted-foreground">{t.trainees} trainee{t.trainees === 1 ? "" : "s"} · {t.certificates} certified</p>
                </div>
                <Badge variant={t.avgPractical >= 4 ? "success" : t.avgPractical >= 3.5 ? "warning" : "secondary"}>
                  {t.avgPractical ? `${t.avgPractical.toFixed(2)} / 5` : "—"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Managers by Team Compliance</CardTitle>
            <CardDescription>Compliance rate of staff at their store</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {managerRows.length === 0 && <p className="text-sm text-muted-foreground">No managers set up yet.</p>}
            {managerRows.map((m) => (
              <Link key={m.manager.id} href={m.store ? `/stores/${m.store.id}` : "#"} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 hover:text-brand">
                <div>
                  <p className="text-sm font-medium">{m.manager.name}</p>
                  <p className="text-xs text-muted-foreground">{m.store?.code ?? "—"} · {m.teamSize} direct reports</p>
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
