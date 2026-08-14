"use client";

import * as React from "react";
import { Search, Loader2, QrCode, Trash2, Pencil } from "lucide-react";
import { fetchStaff, deleteStaff } from "@/lib/staff/queries";
import type { Staff } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { initials } from "@/lib/utils";
import { AddStaffDialog } from "./add-staff-dialog";
import { EditStaffDialog } from "./edit-staff-dialog";
import { StaffBadge } from "./staff-badge";

export function StaffDirectory() {
  const [staff, setStaff] = React.useState<Staff[] | null>(null);
  const [query, setQuery] = React.useState("");
  const [badgeFor, setBadgeFor] = React.useState<Staff | null>(null);
  const [editFor, setEditFor] = React.useState<Staff | null>(null);

  const refresh = React.useCallback(async () => {
    setStaff(await fetchStaff());
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const rows = React.useMemo(() => {
    if (!staff) return [];
    const q = query.toLowerCase();
    return staff.filter(
      (s) => s.name.toLowerCase().includes(q) || s.employeeNumber.toLowerCase().includes(q) || (s.storeName ?? "").toLowerCase().includes(q)
    );
  }, [staff, query]);

  async function handleDelete(id: string) {
    if (!confirm("Remove this staff member? This also removes their attendance history.")) return;
    await deleteStaff(id);
    refresh();
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search staff…" className="pl-9" />
        </div>
        <AddStaffDialog onCreated={() => refresh()} />
      </div>

      <Card>
        <CardContent className="p-0">
          {staff === null ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading staff…
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <p className="font-display text-base font-semibold">No staff yet</p>
              <p className="text-sm text-muted-foreground">Add staff here, or they&apos;ll be created automatically the first time they scan in.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="p-3 font-medium">Staff</th>
                    <th className="p-3 font-medium">Employee #</th>
                    <th className="p-3 font-medium">Role</th>
                    <th className="p-3 font-medium">Store</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s) => (
                    <tr key={s.id} className="border-b border-border/60 last:border-0">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-8"><AvatarFallback>{initials(s.name)}</AvatarFallback></Avatar>
                          <span className="font-medium">{s.name}</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-xs text-muted-foreground">{s.employeeNumber}</td>
                      <td className="p-3 text-muted-foreground">{s.role ?? "—"}</td>
                      <td className="p-3 text-muted-foreground">{s.storeName ?? "—"}</td>
                      <td className="p-3">
                        <Badge variant={s.status === "active" ? "success" : "secondary"}>{s.status}</Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-1.5">
                          <Button variant="outline" size="sm" onClick={() => setBadgeFor(s)}>
                            <QrCode className="size-3.5" /> Badge
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditFor(s)}>
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)}>
                            <Trash2 className="size-3.5 text-rose" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!badgeFor} onOpenChange={(v) => !v && setBadgeFor(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Staff QR Badge</DialogTitle>
            <DialogDescription>Print or display this — scan it at any Kükie Academy check-in station.</DialogDescription>
          </DialogHeader>
          {badgeFor && (
            <div className="flex justify-center py-2">
              <StaffBadge staff={badgeFor} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <EditStaffDialog
        staff={editFor}
        open={!!editFor}
        onOpenChange={(v) => !v && setEditFor(null)}
        onSaved={() => { setEditFor(null); refresh(); }}
      />
    </div>
  );
}
