"use client";

import * as React from "react";
import { PenLine, CheckCircle2, Plus, X } from "lucide-react";
import { DATA } from "@/lib/data";
import { PILLARS } from "@/lib/curriculum/pillars";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const DEFAULT_COMMITMENTS = [
  "Use the 4 A's for every objection I hear",
  "Suggest one beverage pairing per table at order time",
  "Ask my shift lead for in-the-moment feedback at least twice a week",
];

export function WorkbookClient() {
  const employees = React.useMemo(
    () => DATA.employees.filter((e) => e.status === "in-progress" || e.status === "completed").slice(0, 60),
    []
  );
  const [employeeId, setEmployeeId] = React.useState(employees[0]?.id);
  const employee = DATA.employees.find((e) => e.id === employeeId)!;
  const store = DATA.stores.find((s) => s.id === employee.storeId)!;
  const manager = DATA.managers.find((m) => m.id === employee.managerId)!;
  const trainer = DATA.trainers.find((t) => t.id === employee.trainerId)!;
  const existing = DATA.workbooks.find((w) => w.employeeId === employeeId);

  const [reflection, setReflection] = React.useState<Record<string, string>>({});
  const [actionPlan, setActionPlan] = React.useState("");
  const [commitments, setCommitments] = React.useState<string[]>(DEFAULT_COMMITMENTS);
  const [newCommitment, setNewCommitment] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [signature, setSignature] = React.useState("");
  const [signed, setSigned] = React.useState<string | null>(null);

  React.useEffect(() => {
    setReflection(existing?.reflection ?? {});
    setActionPlan(existing?.actionPlan ?? "");
    setCommitments(existing?.commitments ?? DEFAULT_COMMITMENTS);
    setSigned(existing?.signedDate ?? null);
    setSignature(existing?.signedDate ? employee.name : "");
    setNotes("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  function sign() {
    if (!signature.trim()) return;
    setSigned(new Date().toISOString().slice(0, 10));
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr]">
      {/* Employee info panel */}
      <Card className="h-fit lg:sticky lg:top-20">
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
          <CardDescription>Select a trainee to view or complete their workbook</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Select value={employeeId} onValueChange={setEmployeeId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {employees.map((e) => (
                <SelectItem key={e.id} value={e.id}>{e.name} · {e.employeeNumber}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <InfoRow label="Employee #" value={employee.employeeNumber} />
          <InfoRow label="Store" value={store.name} />
          <InfoRow label="Role" value={employee.role} />
          <InfoRow label="Manager" value={manager.name} />
          <InfoRow label="Trainer" value={trainer.name} />
          <InfoRow label="Session Date" value={employee.assignedDate} />
          <InfoRow label="Version" value="v1.0" />

          <div className="mt-1">
            {signed ? (
              <Badge variant="success">Signed {signed}</Badge>
            ) : (
              <Badge variant="warning">Awaiting signature</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Workbook content */}
      <div className="flex flex-col gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Reflection Questions</CardTitle>
            <CardDescription>One reflection per learning pillar</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {PILLARS.map((p) => (
              <div key={p.id}>
                <Label className="text-xs text-muted-foreground">
                  Pillar {p.index} · {p.shortName} — what&apos;s your biggest takeaway?
                </Label>
                <Textarea
                  className="mt-1.5"
                  rows={2}
                  value={reflection[p.id] ?? ""}
                  onChange={(e) => setReflection((r) => ({ ...r, [p.id]: e.target.value }))}
                  placeholder="Write a short reflection…"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Action Plan</CardTitle>
            <CardDescription>What will you apply on your very next shift?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea rows={3} value={actionPlan} onChange={(e) => setActionPlan(e.target.value)} placeholder="e.g. Apply Name-Describe-Invite on every table for the next two weeks…" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal Commitments</CardTitle>
            <CardDescription>Concrete behaviors you're committing to</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {commitments.map((c, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <Checkbox defaultChecked />
                <span className="flex-1 text-sm">{c}</span>
                <button onClick={() => setCommitments((list) => list.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-rose">
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
            <div className="mt-1 flex gap-2">
              <Input value={newCommitment} onChange={(e) => setNewCommitment(e.target.value)} placeholder="Add a commitment…" />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (!newCommitment.trim()) return;
                  setCommitments((list) => [...list, newCommitment.trim()]);
                  setNewCommitment("");
                }}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any other notes from today's session…" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Digital Signature</CardTitle>
            <CardDescription>Type your full name to sign and date this workbook</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Full name</Label>
                <div className="relative mt-1.5">
                  <PenLine className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9 font-display italic" value={signature} onChange={(e) => setSignature(e.target.value)} placeholder={employee.name} />
                </div>
              </div>
              <Button onClick={sign} disabled={!signature.trim()}>
                <CheckCircle2 className="size-4" /> {signed ? "Re-sign" : "Sign & Save"}
              </Button>
            </div>
            {signed && <p className="mt-2 text-xs text-emerald">Signed by {signature} on {signed}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-1.5 text-xs last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
