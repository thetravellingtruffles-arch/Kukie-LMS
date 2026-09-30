"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Loader2 } from "lucide-react";
import { fetchOrgSnapshot, scopeSnapshot, type OrgSnapshot } from "@/lib/rollups";
import { useAccessScope } from "@/lib/access/use-access-scope";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { initials } from "@/lib/utils";
import type { CompletionStatus } from "@/lib/types";

const STATUS_VARIANT: Record<CompletionStatus, "success" | "warning" | "danger" | "secondary"> = {
  completed: "success",
  "in-progress": "warning",
  overdue: "danger",
  "not-started": "secondary",
};

const STATUS_LABEL: Record<CompletionStatus, string> = {
  completed: "Certified",
  "in-progress": "In Progress",
  overdue: "Needs Retake",
  "not-started": "Not Started",
};

export function EmployeeDirectory() {
  const scope = useAccessScope();
  const [snap, setSnap] = React.useState<OrgSnapshot | null>(null);
  const [query, setQuery] = React.useState("");
  const [storeId, setStoreId] = React.useState<string>("all");
  const [status, setStatus] = React.useState<string>("all");

  React.useEffect(() => {
    if (scope.loading) return;
    fetchOrgSnapshot().then((s) => setSnap(scopeSnapshot(s, scope.storeIds))).catch(() => setSnap(null));
  }, [scope.loading, scope.storeIds]);

  const rows = React.useMemo(() => {
    if (!snap) return [];
    return snap.staff
      .map((s) => {
        const comps = snap.completions.filter((c) => c.staffId === s.id);
        const certified = comps.some((c) => c.certificateNumber);
        const overdue = !certified && comps.some((c) => c.status === "overdue");
        const derivedStatus: CompletionStatus = certified ? "completed" : overdue ? "overdue" : comps.length ? "in-progress" : "not-started";
        return { staff: s, status: derivedStatus, courseCount: comps.length };
      })
      .filter((r) => (storeId === "all" ? true : r.staff.storeId === storeId))
      .filter((r) => (status === "all" ? true : r.status === status))
      .filter(
        (r) => r.staff.name.toLowerCase().includes(query.toLowerCase()) || r.staff.employeeNumber.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 200);
  }, [snap, query, storeId, status]);

  if (!snap) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Loading employees…
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search employees…" className="pl-9" />
        </div>
        <Select value={storeId} onValueChange={setStoreId}>
          <SelectTrigger className="w-52"><SelectValue placeholder="All Stores" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stores</SelectItem>
            {snap.stores.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Certified</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="overdue">Needs Retake</SelectItem>
            <SelectItem value="not-started">Not Started</SelectItem>
          </SelectContent>
        </Select>
        <p className="ml-auto self-center text-xs text-muted-foreground">
          Showing {rows.length} of {snap.staff.length.toLocaleString()}
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No staff match these filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="p-3.5 font-medium">Employee</th>
                    <th className="p-3.5 font-medium">Role</th>
                    <th className="p-3.5 font-medium">Store</th>
                    <th className="p-3.5 font-medium">Status</th>
                    <th className="p-3.5 font-medium">Courses</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.staff.id} className="border-b border-border/60 last:border-0 hover:bg-surface-muted/50">
                      <td className="p-3.5">
                        <Link href={`/employees/${r.staff.id}`} className="flex items-center gap-2.5">
                          <Avatar className="size-8">
                            <AvatarFallback>{initials(r.staff.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium hover:text-brand">{r.staff.name}</p>
                            <p className="text-xs text-muted-foreground">{r.staff.employeeNumber}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="p-3.5 text-muted-foreground">{r.staff.role ?? "—"}</td>
                      <td className="p-3.5 text-muted-foreground">{r.staff.storeName ?? "—"}</td>
                      <td className="p-3.5"><Badge variant={STATUS_VARIANT[r.status]}>{STATUS_LABEL[r.status]}</Badge></td>
                      <td className="p-3.5 text-muted-foreground">{r.courseCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
