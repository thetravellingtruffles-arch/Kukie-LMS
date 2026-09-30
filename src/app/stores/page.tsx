import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { DATA, storeSummary } from "@/lib/data";

export default function StoresPage() {
  const summaries = DATA.stores.map((s) => storeSummary(s.id));

  return (
    <AppShell title="Store Dashboards" subtitle="All 12 Kükie Academy locations">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {summaries.map((s) => (
          <Link key={s.store.id} href={`/stores/${s.store.id}`}>
            <Card className="h-full p-5 transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-base font-semibold">{s.store.name}</p>
                  <p className="text-xs text-muted-foreground">{s.store.city}</p>
                </div>
                <ProgressRing value={s.compliance} size={56} stroke={6} label={`${Math.round(s.compliance)}%`} />
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <Badge variant="secondary">{s.store.format}</Badge>
                <Badge variant="outline">{s.store.code}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <MiniMetric label="Employees" value={`${s.employees.length}`} />
                <MiniMetric label="Quiz Avg" value={`${s.avgQuiz.toFixed(0)}%`} />
                <MiniMetric label="Certs" value={`${s.certificates}`} />
              </div>
            </Card>
          </Link>
        ))}
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
