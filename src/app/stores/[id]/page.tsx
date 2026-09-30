"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Users2, Award, GraduationCap, ClipboardCheck, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { fetchOrgSnapshot, storeSummary, type OrgSnapshot } from "@/lib/rollups";

export default function StoreDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [snap, setSnap] = React.useState<OrgSnapshot | null>(null);

  React.useEffect(() => {
    fetchOrgSnapshot().then(setSnap).catch(() => setSnap(null));
  }, []);

  if (!snap) {
    return (
      <AppShell title="Store" subtitle="Loading…">
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading store…
        </div>
      </AppShell>
    );
  }

  const summary = storeSummary(snap, id);
  if (!summary.store) {
    return (
      <AppShell title="Store not found" subtitle="">
        <p className="py-16 text-center text-sm text-muted-foreground">This store doesn&apos;t exist or was removed.</p>
      </AppShell>
    );
  }
  const store = summary.store;
  const recentCertificates = snap.completions
    .filter((c) => summary.staffList.some((s) => s.id === c.staffId) && c.certificateNumber)
    .sort((a, b) => new Date(b.certificateIssuedAt ?? 0).getTime() - new Date(a.certificateIssuedAt ?? 0).getTime())
    .slice(0, 8);

  return (
    <AppShell title={store.name} subtitle={`${store.code} · ${store.city ?? ""}`}>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{store.format ?? "—"}</Badge>
        {store.openedYear && <Badge variant="outline">Opened {store.openedYear}</Badge>}
        {summary.manager && <Badge variant="outline">GM: {summary.manager.name}</Badge>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users2} label="Staff" value={`${summary.staffList.length}`} accent="brand" />
        <StatCard icon={GraduationCap} label="Avg Quiz Score" value={summary.avgQuiz ? `${summary.avgQuiz.toFixed(1)}%` : "—"} accent="violet" />
        <StatCard icon={ClipboardCheck} label="Avg Practical Score" value={summary.avgPractical ? `${summary.avgPractical.toFixed(2)} / 5` : "—"} accent="amber" />
        <StatCard icon={Award} label="Certificates" value={`${summary.certificates}`} accent="emerald" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Compliance</CardTitle>
            <CardDescription>Certification rate</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <ProgressRing value={summary.compliance} size={120} stroke={10} sublabel="compliant" />
            <div className="grid w-full grid-cols-2 gap-2 text-center text-xs">
              <div className="rounded-[10px] bg-emerald-soft p-2">
                <p className="font-display font-semibold text-emerald">{summary.certificates}</p>
                <p className="text-emerald/80">Certified</p>
              </div>
              <div className="rounded-[10px] bg-rose-soft p-2">
                <p className="font-display font-semibold text-rose">{summary.overdueStaff.length}</p>
                <p className="text-rose/80">Needs Retake</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recently Certified</CardTitle>
            <CardDescription>Latest certificates issued at this store</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {recentCertificates.length === 0 && <p className="text-sm text-muted-foreground">No certificates issued yet.</p>}
            {recentCertificates.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium">{c.staff?.name}</p>
                  <p className="text-xs text-muted-foreground">{c.courseTitle ?? c.courseSlug}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {c.certificateIssuedAt ? new Date(c.certificateIssuedAt).toLocaleDateString() : ""}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Staff</CardTitle>
            <CardDescription>Ranked by combined quiz + practical performance</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {summary.topStaff.length === 0 && <p className="text-sm text-muted-foreground">No training activity yet.</p>}
            {summary.topStaff.map((t, i) => (
              <Link key={t.staff.id} href={`/employees/${t.staff.id}`} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 hover:text-brand">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-6 items-center justify-center rounded-full bg-brand-soft text-[11px] font-bold text-brand">{i + 1}</span>
                  <span className="text-sm font-medium">{t.staff.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{t.quiz}% · {t.practical.toFixed(1)}/5</span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5"><AlertTriangle className="size-4 text-rose" /> Staff Needing Retake</CardTitle>
            <CardDescription>Failed a stage and haven&apos;t retaken it</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {summary.overdueStaff.length === 0 && <p className="text-sm text-muted-foreground">No one overdue — great work.</p>}
            {summary.overdueStaff.slice(0, 8).map((s) => (
              <Link key={s.id} href={`/employees/${s.id}`} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 hover:text-brand">
                <span className="text-sm font-medium">{s.name}</span>
                <span className="text-xs text-rose">Retake needed</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
