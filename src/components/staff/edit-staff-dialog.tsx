"use client";

import * as React from "react";
import Link from "next/link";
import { Pencil, Loader2 } from "lucide-react";
import { updateStaff } from "@/lib/staff/queries";
import { fetchStores } from "@/lib/org/queries";
import type { Staff, OrgStore, StaffStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function EditStaffDialog({
  staff,
  open,
  onOpenChange,
  onSaved,
}: {
  staff: Staff | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: (staff: Staff) => void;
}) {
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState("");
  const [storeId, setStoreId] = React.useState<string>("none");
  const [status, setStatus] = React.useState<StaffStatus>("active");
  const [stores, setStores] = React.useState<OrgStore[]>([]);
  const [storesLoaded, setStoresLoaded] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    fetchStores().then(setStores).catch(() => setStores([])).finally(() => setStoresLoaded(true));
  }, [open]);

  React.useEffect(() => {
    if (staff && open) {
      setName(staff.name);
      setRole(staff.role ?? "");
      setStoreId(staff.storeId ?? "none");
      setStatus(staff.status);
      setError(null);
    }
  }, [staff, open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!staff || !name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const selectedStore = stores.find((s) => s.id === storeId);
      const updated = await updateStaff(staff.id, {
        name: name.trim(),
        role: role.trim() || null,
        storeId: selectedStore?.id ?? null,
        storeName: selectedStore?.name ?? null,
        status,
      });
      onSaved(updated);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Staff Member</DialogTitle>
          <DialogDescription>{staff?.employeeNumber}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div>
            <Label htmlFor="e-name">Full Name</Label>
            <Input id="e-name" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="e-role">Role</Label>
              <Input id="e-role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Server" />
            </div>
            <div>
              <Label htmlFor="e-status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as StaffStatus)}>
                <SelectTrigger id="e-status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="e-store">Store / Location</Label>
            <Select value={storeId} onValueChange={setStoreId} disabled={storesLoaded && stores.length === 0}>
              <SelectTrigger id="e-store"><SelectValue placeholder="Select a store" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No store</SelectItem>
                {stores.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {storesLoaded && stores.length === 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                No stores set up yet — <Link href="/organization" className="underline underline-offset-2">add one in Organization Setup</Link>.
              </p>
            )}
          </div>
          {error && <p className="text-xs text-rose">{error}</p>}
          <Button type="submit" disabled={saving || !name.trim()} className="mt-1">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Pencil className="size-4" />} Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
