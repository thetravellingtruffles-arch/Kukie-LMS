"use client";

import * as React from "react";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle2, Loader2, UserPlus, Clock3, Smartphone, ChevronDown, IdCard } from "lucide-react";
import { QrScanner, ManualCodeEntry } from "./qr-scanner";
import {
  fetchStaffByEmployeeNumber,
  createStaff,
  checkInStaff,
  fetchAttendanceForCourse,
  parseStaffQrPayload,
} from "@/lib/staff/queries";
import type { StaffAttendanceRecord } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type Feedback =
  | { kind: "success"; name: string }
  | { kind: "error"; message: string }
  | null;

export function CheckInPanel({ courseSlug, courseTitle }: { courseSlug: string; courseTitle?: string }) {
  const [records, setRecords] = React.useState<StaffAttendanceRecord[]>([]);
  const [loadingLog, setLoadingLog] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [feedback, setFeedback] = React.useState<Feedback>(null);
  const [pendingNew, setPendingNew] = React.useState<{ employeeNumber: string; method: "qr" | "manual" } | null>(null);
  const [showBadgeScanner, setShowBadgeScanner] = React.useState(false);
  const [checkinUrl, setCheckinUrl] = React.useState("");

  React.useEffect(() => {
    if (typeof window !== "undefined") setCheckinUrl(`${window.location.origin}/checkin/${courseSlug}`);
  }, [courseSlug]);

  const refresh = React.useCallback(async (silent = false) => {
    if (!silent) setLoadingLog(true);
    try {
      const rows = await fetchAttendanceForCourse(courseSlug);
      setRecords(rows);
    } finally {
      if (!silent) setLoadingLog(false);
    }
  }, [courseSlug]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  // Live updates: staff registering from their own phone (via the session QR
  // code) write attendance rows this device didn't create itself, so poll
  // for new check-ins while this panel is open.
  React.useEffect(() => {
    const interval = setInterval(() => refresh(true), 4000);
    return () => clearInterval(interval);
  }, [refresh]);

  React.useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(t);
  }, [feedback]);

  const handleCode = React.useCallback(
    async (raw: string, method: "qr" | "manual") => {
      if (busy || pendingNew) return;
      const employeeNumber = parseStaffQrPayload(raw);
      if (!employeeNumber) return;
      setBusy(true);
      try {
        const staff = await fetchStaffByEmployeeNumber(employeeNumber);
        if (!staff) {
          setPendingNew({ employeeNumber, method });
          return;
        }
        const record = await checkInStaff({ staffId: staff.id, courseSlug, courseTitle, method });
        setRecords((prev) => [{ ...record, staff }, ...prev]);
        setFeedback({ kind: "success", name: staff.name });
      } catch (err) {
        setFeedback({ kind: "error", message: err instanceof Error ? err.message : "Check-in failed." });
      } finally {
        setBusy(false);
      }
    },
    [busy, pendingNew, courseSlug, courseTitle]
  );

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Smartphone className="size-4" /> Scan to Register</CardTitle>
          <CardDescription>Staff scan this with their own phone to check in — new phones register with name + employee number first</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          {checkinUrl ? (
            <div className="rounded-[16px] border border-border bg-white p-4">
              <QRCodeSVG value={checkinUrl} size={180} />
            </div>
          ) : (
            <div className="flex size-[212px] items-center justify-center"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
          )}
          <p className="break-all text-center font-mono text-[11px] text-muted-foreground">{checkinUrl}</p>

          {feedback?.kind === "success" && (
            <p className="flex w-full items-center gap-1.5 rounded-[10px] bg-emerald-soft px-3 py-2 text-xs font-medium text-emerald">
              <CheckCircle2 className="size-3.5" /> Checked in: {feedback.name}
            </p>
          )}
          {feedback?.kind === "error" && (
            <p className="w-full rounded-[10px] bg-rose-soft px-3 py-2 text-xs font-medium text-rose">{feedback.message}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <button
          type="button"
          onClick={() => setShowBadgeScanner((v) => !v)}
          className="flex w-full items-center justify-between p-5 text-left"
        >
          <span className="flex items-center gap-2 font-display text-base font-semibold">
            <IdCard className="size-4" /> Or scan a printed staff badge
          </span>
          <ChevronDown className={`size-4 text-muted-foreground transition-transform ${showBadgeScanner ? "rotate-180" : ""}`} />
        </button>
        {showBadgeScanner && (
          <CardContent className="flex flex-col gap-3 pt-0">
            <QrScanner onScan={(v) => handleCode(v, "qr")} paused={busy || !!pendingNew} />
            <ManualCodeEntry onSubmit={(v) => handleCode(v, "manual")} />

            {busy && !pendingNew && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" /> Looking up staff…
              </p>
            )}

            {pendingNew && (
              <QuickAddStaff
                employeeNumber={pendingNew.employeeNumber}
                onCancel={() => setPendingNew(null)}
                onCreated={async (staff) => {
                  const record = await checkInStaff({ staffId: staff.id, courseSlug, courseTitle, method: pendingNew.method });
                  setRecords((prev) => [{ ...record, staff }, ...prev]);
                  setFeedback({ kind: "success", name: staff.name });
                  setPendingNew(null);
                }}
              />
            )}
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live Check-Ins</CardTitle>
          <CardDescription>{records.length} checked in to this module</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingLog ? (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" /> Loading…
            </p>
          ) : records.length === 0 ? (
            <p className="text-xs text-muted-foreground">No check-ins yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {records.map((r) => (
                <li key={r.id} className="flex items-center justify-between rounded-[10px] bg-surface-muted px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium">{r.staff?.name ?? "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{r.staff?.employeeNumber}{r.staff?.storeName ? ` · ${r.staff.storeName}` : ""}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{r.method}</Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock3 className="size-3" />
                      {new Date(r.checkedInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function QuickAddStaff({
  employeeNumber,
  onCancel,
  onCreated,
}: {
  employeeNumber: string;
  onCancel: () => void;
  onCreated: (staff: Awaited<ReturnType<typeof createStaff>>) => void | Promise<void>;
}) {
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const staff = await createStaff({ employeeNumber, name: name.trim(), role: role.trim() || undefined });
      await onCreated(staff);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create staff record.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2.5 rounded-[10px] border border-gold/40 bg-gold-soft p-3">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
        <UserPlus className="size-3.5" /> New badge — {employeeNumber} isn&apos;t in the system yet
      </p>
      <div>
        <Label htmlFor="qa-name" className="text-xs">Full name</Label>
        <Input id="qa-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" autoFocus />
      </div>
      <div>
        <Label htmlFor="qa-role" className="text-xs">Role (optional)</Label>
        <Input id="qa-role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Server" />
      </div>
      <p className="text-[11px] text-muted-foreground">Store gets assigned later by an admin in the Staff Directory.</p>
      {error && <p className="text-xs text-rose">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={saving || !name.trim()}>
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <UserPlus className="size-3.5" />} Add & Check In
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel} disabled={saving}>Cancel</Button>
      </div>
    </form>
  );
}
