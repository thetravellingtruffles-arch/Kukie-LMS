"use client";

import * as React from "react";
import { Search, Loader2, Plus, Award, CheckCircle2, XCircle, Clock } from "lucide-react";
import { fetchCompletions, isCertificateValid, isCertificateExpiringSoon } from "@/lib/completions/queries";
import type { Completion } from "@/lib/types";
import { useAccessScope } from "@/lib/access/use-access-scope";
import { fetchStaff } from "@/lib/staff/queries";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import { LogCompletionDialog } from "./log-completion-dialog";

export function TrainingRecordsClient() {
  const scope = useAccessScope();
  const [completions, setCompletions] = React.useState<Completion[] | null>(null);
  const [query, setQuery] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Completion | null>(null);

  const refresh = React.useCallback(async () => {
    const all = await fetchCompletions();
    if (scope.storeIds === "all") {
      setCompletions(all);
      return;
    }
    const staff = await fetchStaff();
    const allowedStaffIds = new Set(staff.filter((s) => s.storeId && (scope.storeIds as string[]).includes(s.storeId)).map((s) => s.id));
    setCompletions(all.filter((c) => allowedStaffIds.has(c.staffId)));
  }, [scope.storeIds]);

  React.useEffect(() => {
    if (scope.loading) return;
    refresh();
  }, [scope.loading, refresh]);

  const rows = React.useMemo(() => {
    if (!completions) return [];
    const q = query.toLowerCase();
    return completions.filter(
      (c) =>
        (c.staff?.name ?? "").toLowerCase().includes(q) ||
        (c.staff?.employeeNumber ?? "").toLowerCase().includes(q) ||
        (c.courseTitle ?? c.courseSlug).toLowerCase().includes(q)
    );
  }, [completions, query]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search staff or module…" className="pl-9" />
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="size-4" /> Log Completion
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {completions === null ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading training records…
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <p className="font-display text-base font-semibold">No training records yet</p>
              <p className="text-sm text-muted-foreground">Results save here automatically, or log one manually.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="p-3 font-medium">Staff</th>
                    <th className="p-3 font-medium">Module</th>
                    <th className="p-3 font-medium">Knowledge</th>
                    <th className="p-3 font-medium">Practical</th>
                    <th className="p-3 font-medium">Certificate</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c) => (
                    <tr key={c.id} className="border-b border-border/60 last:border-0">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-8"><AvatarFallback>{initials(c.staff?.name ?? "?")}</AvatarFallback></Avatar>
                          <div>
                            <p className="font-medium leading-tight">{c.staff?.name ?? "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">{c.staff?.employeeNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">{c.courseTitle ?? c.courseSlug}</td>
                      <td className="p-3"><ScoreCell score={c.knowledgeScore} passed={c.knowledgePassed} suffix="%" /></td>
                      <td className="p-3"><ScoreCell score={c.practicalScore} passed={c.practicalPassed} suffix="/5" /></td>
                      <td className="p-3">
                        {c.certificateNumber ? (
                          <span className={`flex items-center gap-1 text-xs ${isCertificateValid(c) ? (isCertificateExpiringSoon(c) ? "text-amber" : "text-emerald") : "text-rose"}`}>
                            <Award className="size-3.5" />
                            {isCertificateValid(c) ? (isCertificateExpiringSoon(c) ? "Expiring soon" : "Valid") : "Expired"}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-3"><StatusBadge status={c.status} /></td>
                      <td className="p-3">
                        <Button variant="outline" size="sm" onClick={() => { setEditing(c); setDialogOpen(true); }}>Edit</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <LogCompletionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        presetStaff={editing?.staff ?? null}
        presetCourseSlug={editing?.courseSlug ?? null}
        onSaved={refresh}
      />
    </div>
  );
}

function ScoreCell({ score, passed, suffix }: { score: number | null; passed?: boolean | null; suffix: string }) {
  if (score === null || score === undefined) return <span className="text-xs text-muted-foreground">—</span>;
  const Icon = passed === false ? XCircle : passed === true ? CheckCircle2 : Clock;
  return (
    <span className={`flex items-center gap-1 text-xs ${passed === false ? "text-rose" : passed === true ? "text-emerald" : "text-muted-foreground"}`}>
      <Icon className="size-3.5" /> {score}{suffix}
    </span>
  );
}

function StatusBadge({ status }: { status: Completion["status"] }) {
  const map: Record<Completion["status"], { label: string; variant: "success" | "warning" | "danger" | "secondary" }> = {
    "not-started": { label: "Not Started", variant: "secondary" },
    "in-progress": { label: "In Progress", variant: "warning" },
    completed: { label: "Completed", variant: "success" },
    overdue: { label: "Needs Retake", variant: "danger" },
  };
  const m = map[status];
  return <Badge variant={m.variant}>{m.label}</Badge>;
}
