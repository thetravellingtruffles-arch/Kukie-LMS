"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Loader2, Award, Clock, GraduationCap, ClipboardCheck, CheckCircle2, Circle } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { fetchStaffById } from "@/lib/staff/queries";
import { fetchCompletionsForStaff, isCertificateValid, isCertificateExpiringSoon } from "@/lib/completions/queries";
import type { Staff, Completion } from "@/lib/types";
import { initials } from "@/lib/utils";

export default function EmployeeProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [staff, setStaff] = React.useState<Staff | null | undefined>(undefined);
  const [completions, setCompletions] = React.useState<Completion[]>([]);

  React.useEffect(() => {
    fetchStaffById(id).then((s) => {
      setStaff(s);
      if (s) fetchCompletionsForStaff(s.id).then(setCompletions);
    }).catch(() => setStaff(null));
  }, [id]);

  if (staff === undefined) {
    return (
      <AppShell title="Employee Profile" subtitle="Loading…">
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading profile…
        </div>
      </AppShell>
    );
  }
  if (!staff) {
    return (
      <AppShell title="Employee not found" subtitle="">
        <p className="py-16 text-center text-sm text-muted-foreground">This staff record doesn&apos;t exist or was removed.</p>
      </AppShell>
    );
  }

  const certified = completions.some((c) => c.certificateNumber);
  const overdue = !certified && completions.some((c) => c.status === "overdue");
  const overallStatus = certified ? "completed" : overdue ? "overdue" : completions.length ? "in-progress" : "not-started";
  const latestKnowledge = completions.find((c) => c.knowledgeScore != null);
  const latestPractical = completions.find((c) => c.practicalScore != null);
  const anyCertificate = completions.find((c) => c.certificateNumber);

  return (
    <AppShell title="Employee Profile" subtitle="Real training record — Kükie Academy">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <Avatar className="size-16">
              <AvatarFallback className="text-lg">{initials(staff.name)}</AvatarFallback>
            </Avatar>
            <h2 className="mt-3 font-display text-lg font-semibold">{staff.name}</h2>
            <p className="text-sm text-muted-foreground">{staff.role ?? "—"} · {staff.storeName ?? "—"}</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">{staff.employeeNumber}</p>
            <Badge variant={overallStatus === "completed" ? "success" : overallStatus === "overdue" ? "danger" : overallStatus === "in-progress" ? "warning" : "secondary"} className="mt-3">
              {overallStatus === "completed" ? "Certified" : overallStatus === "overdue" ? "Needs Retake" : overallStatus === "in-progress" ? "In Progress" : "Not Started"}
            </Badge>

            <div className="mt-6 w-full space-y-2 text-left text-xs">
              <Row label="Email" value={staff.email ?? "—"} />
              <Row label="Phone" value={staff.phone ?? "—"} />
              <Row label="Status" value={staff.status} />
              <Row label="Courses" value={`${completions.length}`} />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4 lg:col-span-2 lg:grid-cols-4">
          <MiniStat icon={GraduationCap} label="Latest Knowledge Score" value={latestKnowledge?.knowledgeScore != null ? `${latestKnowledge.knowledgeScore}%` : "—"} accent="violet" />
          <MiniStat icon={ClipboardCheck} label="Latest Practical Score" value={latestPractical?.practicalScore != null ? `${latestPractical.practicalScore.toFixed(1)}/5` : "—"} accent="amber" />
          <MiniStat icon={Award} label="Certificate" value={anyCertificate ? "Issued" : "Pending"} accent={anyCertificate ? "emerald" : "rose"} />
          <MiniStat icon={Clock} label="Courses Tracked" value={`${completions.length}`} accent="brand" />
        </div>
      </div>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Training Record</CardTitle>
          <CardDescription>Every course this employee has activity on</CardDescription>
        </CardHeader>
        <CardContent>
          {completions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No training activity recorded yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {completions.map((c) => (
                <div key={c.id} className="rounded-[12px] border border-border p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-display text-sm font-semibold">{c.courseTitle ?? c.courseSlug}</p>
                    <Badge variant={c.status === "completed" ? "success" : c.status === "overdue" ? "danger" : c.status === "in-progress" ? "warning" : "secondary"}>
                      {c.status === "completed" ? "Certified" : c.status === "overdue" ? "Needs Retake" : c.status === "in-progress" ? "In Progress" : "Not Started"}
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-col gap-1.5 text-xs">
                    <TimelineRow label="Knowledge Assessment" done={c.knowledgeScore != null} detail={c.knowledgeScore != null ? `${c.knowledgeScore}% · ${c.knowledgePassed ? "Passed" : "Failed"}` : undefined} />
                    <TimelineRow label="Practical Assessment" done={c.practicalScore != null} detail={c.practicalScore != null ? `${c.practicalScore.toFixed(1)}/5 · ${c.practicalPassed ? "Pass" : "Needs Coaching"}` : undefined} />
                    <TimelineRow label="Role Play" done={c.roleplayScore != null} detail={c.roleplayScore != null ? `${c.roleplayScore.toFixed(1)}/5` : undefined} />
                    <TimelineRow label="Digital Workbook" done={!!c.workbookCompletedAt} />
                    <TimelineRow label="Manager Follow-Up" done={!!c.followupCompletedAt} detail={c.followupCompletedAt ? (c.followupReadyForPromotion ? "Promotion ready" : "On track") : undefined} />
                    <TimelineRow label="Certificate Issued" done={!!c.certificateNumber} detail={c.certificateNumber ?? undefined} />
                  </div>
                  {c.certificateNumber && (
                    <div className={`mt-3 flex items-center gap-2 rounded-[10px] px-3 py-2 text-xs ${isCertificateValid(c) ? (isCertificateExpiringSoon(c) ? "bg-amber-soft text-amber" : "bg-emerald-soft text-emerald") : "bg-rose-soft text-rose"}`}>
                      <Award className="size-3.5 shrink-0" />
                      Certificate {c.certificateNumber}
                      {c.certificateExpiresAt
                        ? isCertificateValid(c)
                          ? ` · valid until ${new Date(c.certificateExpiresAt).toLocaleDateString()}`
                          : ` · expired ${new Date(c.certificateExpiresAt).toLocaleDateString()}`
                        : " · no expiry"}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}

function TimelineRow({ label, done, detail }: { label: string; done: boolean; detail?: string }) {
  return (
    <div className="flex items-center gap-2">
      {done ? <CheckCircle2 className="size-3.5 text-emerald" /> : <Circle className="size-3.5 text-border-strong" />}
      <span className={done ? "" : "text-muted-foreground"}>{label}</span>
      {detail && <span className="text-muted-foreground">· {detail}</span>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-1.5 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent: "brand" | "amber" | "emerald" | "rose" | "violet";
}) {
  const map = {
    brand: "bg-brand-soft text-brand",
    amber: "bg-amber-soft text-amber",
    emerald: "bg-emerald-soft text-emerald",
    rose: "bg-rose-soft text-rose",
    violet: "bg-violet-soft text-violet",
  };
  return (
    <Card className="p-4">
      <div className={`flex size-8 items-center justify-center rounded-[8px] ${map[accent]}`}>
        <Icon className="size-4" />
      </div>
      <p className="mt-3 font-display text-lg font-bold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </Card>
  );
}
