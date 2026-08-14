"use client";

import * as React from "react";
import Link from "next/link";
import { UserPlus, Loader2 } from "lucide-react";
import { createStaff } from "@/lib/staff/queries";
import { fetchStores } from "@/lib/org/queries";
import type { Staff, OrgStore } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function suggestEmployeeNumber() {
  return `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
}

export function AddStaffDialog({ onCreated }: { onCreated: (staff: Staff) => void }) {
  const [open, setOpen] = React.useState(false);
  const [employeeNumber, setEmployeeNumber] = React.useState(suggestEmployeeNumber());
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState("");
  const [storeId, setStoreId] = React.useState<string>("none");
  const [stores, setStores] = React.useState<OrgStore[]>([]);
  const [storesLoaded, setStoresLoaded] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchStores()
      .then(setStores)
      .catch(() => setStores([]))
      .finally(() => setStoresLoaded(true));
  }, []);

  function reset() {
    setEmployeeNumber(suggestEmployeeNumber());
    setName("");
    setRole("");
    setStoreId("none");
    setEmail("");
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !employeeNumber.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const selectedStore = stores.find((s) => s.id === storeId);
      const staff = await createStaff({
        employeeNumber: employeeNumber.trim(),
        name: name.trim(),
        role: role.trim() || undefined,
        storeName: selectedStore?.name,
        storeId: selectedStore?.id ?? null,
        email: email.trim() || undefined,
      });
      onCreated(staff);
      setOpen(false);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add staff member — employee number may already be in use.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button><UserPlus className="size-4" /> Add Staff</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Staff Member</DialogTitle>
          <DialogDescription>Creates a real, persisted staff record with a scannable QR badge.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div>
            <Label htmlFor="s-num">Employee Number</Label>
            <Input id="s-num" value={employeeNumber} onChange={(e) => setEmployeeNumber(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="s-name">Full Name</Label>
            <Input id="s-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="s-role">Role</Label>
              <Input id="s-role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Server" />
            </div>
            <div>
              <Label htmlFor="s-store">Store / Location</Label>
              <Select value={storeId} onValueChange={setStoreId} disabled={storesLoaded && stores.length === 0}>
                <SelectTrigger id="s-store"><SelectValue placeholder="Select a store" /></SelectTrigger>
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
          </div>
          <div>
            <Label htmlFor="s-email">Email (optional)</Label>
            <Input id="s-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />
          </div>
          {error && <p className="text-xs text-rose">{error}</p>}
          <Button type="submit" disabled={saving || !name.trim()} className="mt-1">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />} Add Staff Member
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
