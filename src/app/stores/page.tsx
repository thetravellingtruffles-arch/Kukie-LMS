"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { fetchOrgSnapshot, storeSummary, type OrgSnapshot } from "@/lib/rollups";

export default function StoresPage() {
  const [snap, setSnap] = React.useState<OrgSnapshot | null>(null);

  React.useEffect(() => {
    fetchOrgSnapshot().then(setSnap).catch(() => setSnap(null));
  }, []);

  if (!snap) {
    return (
      <AppShell title="Store Dashboards" subtitle="Loading…">
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading stores…
        </div>
      </AppShell>
    );
  }

  const summaries = snap.stores.map((s) => storeSummary(snap, s.id));

  return (
    <AppShell title="Store Dashboards" subtitle={`${snap.stores.length} location${snap.stores.length === 1 ? "" : "s"}`}>
      {summaries.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          No stores yet — add one under Organization Setup.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {summaries.map((s) => (
            <Link key={s.store?.id} href={`/stores/${s.store?.id}`}>
              <Card className="h-full p-5 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-display text-base font-semibold">{s.store?.name}</p>
                    <p className="text-xs text-muted-foreground">{s.store?.city}</p>
                  </div>
                  <ProgressRing value={s.compliance} size={56} stroke={6} label={`${Math.round(s.compliance)}%`} />
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <Badge variant="secondary">{s.store?.format ?? "—"}</Badge>
                  <Badge variant="outline">{s.store?.code}</Badge>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <MiniMetric label="Staff" value={`${s.staffList.length}`} />
                  <MiniMetric label="Quiz Avg" value={s.avgQuiz ? `${s.avgQuiz.toFixed(0)}%` : "—"} />
                  <MiniMetric label="Certs" value={`${s.certificates}`} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
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
