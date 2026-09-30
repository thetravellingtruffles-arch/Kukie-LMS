"use client";

import * as React from "react";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { DATA, salesImpactSeries, employeeSalesRanking } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendLine } from "@/components/charts/trend-line";
import { StatCard } from "@/components/dashboard/stat-card";
import { DollarSign, Users2, Utensils, Wine, Cake, Layers, Smile, Timer } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const METRICS: { key: string; label: string; icon: LucideIcon; format: (v: number) => string; accent: "brand" | "amber" | "emerald" | "rose" | "violet" }[] = [
  { key: "atv", label: "Average Transaction Value", icon: DollarSign, format: (v) => `$${v.toFixed(2)}`, accent: "brand" },
  { key: "guestCount", label: "Daily Guest Count", icon: Users2, format: (v) => v.toFixed(0), accent: "violet" },
  { key: "itemsPerTransaction", label: "Items Per Transaction", icon: Layers, format: (v) => v.toFixed(2), accent: "amber" },
  { key: "beverageAttachment", label: "Beverage Attachment", icon: Wine, format: (v) => `${v.toFixed(1)}%`, accent: "emerald" },
  { key: "dessertAttachment", label: "Dessert Attachment", icon: Cake, format: (v) => `${v.toFixed(1)}%`, accent: "rose" },
  { key: "comboRate", label: "Combo Rate", icon: Utensils, format: (v) => `${v.toFixed(1)}%`, accent: "brand" },
  { key: "csat", label: "Guest Satisfaction (CSAT)", icon: Smile, format: (v) => `${v.toFixed(1)}%`, accent: "violet" },
  { key: "speedOfServiceSec", label: "Speed of Service", icon: Timer, format: (v) => `${v.toFixed(0)}s`, accent: "amber" },
];

export function SalesImpactClient() {
  const [scope, setScope] = React.useState("all");

  const storeIds = React.useMemo(() => {
    if (scope === "all") return undefined;
    if (scope.startsWith("region:")) {
      const regionId = scope.split(":")[1];
      return DATA.stores.filter((s) => s.regionId === regionId).map((s) => s.id);
    }
    return [scope];
  }, [scope]);

  const series = salesImpactSeries(storeIds);
  const before = series[0];
  const d90 = series[series.length - 1];
  const ranking = employeeSalesRanking(storeIds).slice(0, 12);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Comparing operational KPIs Before Training → 7 / 30 / 90 Days after Module 001 rollout.
        </p>
        <Select value={scope} onValueChange={setScope}>
          <SelectTrigger className="w-60"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stores</SelectItem>
            {DATA.regions.map((r) => (
              <SelectItem key={r.id} value={`region:${r.id}`}>{r.name} Region</SelectItem>
            ))}
            {DATA.stores.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {METRICS.map((m) => {
          const beforeVal = before[m.key as keyof typeof before] as number;
          const afterVal = d90[m.key as keyof typeof d90] as number;
          const delta = beforeVal !== 0 ? ((afterVal - beforeVal) / beforeVal) * 100 * (m.key === "speedOfServiceSec" ? -1 : 1) : 0;
          return (
            <StatCard
              key={m.key}
              icon={m.icon}
              label={m.label}
              value={m.format(afterVal)}
              delta={delta}
              deltaLabel="vs. before training, 90 days"
              accent={m.accent}
            />
          );
        })}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {METRICS.slice(0, 4).map((m) => (
          <Card key={m.key}>
            <CardHeader>
              <CardTitle className="text-sm">{m.label}</CardTitle>
              <CardDescription>Before Training → 90 Days</CardDescription>
            </CardHeader>
            <CardContent>
              <TrendLine data={series} dataKey={m.key} height={200} valueFormatter={m.format} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5"><Trophy className="size-4 text-amber" /> Employee Sales Ranking</CardTitle>
          <CardDescription>Derived from Knowledge + Practical performance, scoped to current filter</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col divide-y divide-border">
            {ranking.map((r, i) => (
              <Link key={r.employee.id} href={`/employees/${r.employee.id}`} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 hover:text-brand">
                <div className="flex items-center gap-3">
                  <span className="flex size-7 items-center justify-center rounded-full bg-amber-soft text-[11px] font-bold text-amber">{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium">{r.employee.name}</p>
                    <p className="text-xs text-muted-foreground">{r.store.code} · {r.employee.role}</p>
                  </div>
                </div>
                <Badge variant="secondary">{r.score} pts</Badge>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
