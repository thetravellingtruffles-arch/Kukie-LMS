"use client";

import * as React from "react";
import { Loader2, ArrowRight, Award, CheckCircle2, Clock, XCircle } from "lucide-react";
import { fetchCompletionsByEmployeeNumber, isCertificateValid, isCertificateExpiringSoon } from "@/lib/completions/queries";
import type { Completion, Staff } from "@/lib/types";
import { KukieMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type Step = "lookup" | "results";

export function MyTrainingClient() {
  const [step, setStep] = React.useState<Step>("lookup");
  const [employeeNumber, setEmployeeNumber] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [staff, setStaff] = React.useState<Staff | null>(null);
  const [completions, setCompletions] = React.useState<Completion[]>([]);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    if (!employeeNumber.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const result = await fetchCompletionsByEmployeeNumber(employeeNumber.trim());
      if (!result) {
        setError("No staff member found with that employee number.");
        return;
      }
      setStaff(result.staff ?? null);
      setCompletions(result.completions);
      setStep("results");
    } catch {
      setError("Something went wrong looking that up — try again.");
    } finally {
      setBusy(false);
    }
  }

  if (step === "lookup") {
    return (
      <div className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center gap-6 px-6 py-10 text-center">
        <KukieMark className="size-12" />
        <form onSubmit={lookup} className="flex w-full flex-col gap-4 text-left">
          <div>
            <p className="font-display text-lg font-semibold text-[#183135]">My Training Record</p>
            <p className="mt-1 text-sm text-[#183135]/70">Enter your employee number to see your completed modules, scores, and certificates.</p>
          </div>
          <div>
            <Label htmlFor="mt-emp-num">Employee Number</Label>
            <Input id="mt-emp-num" value={employeeNumber} onChange={(e) => setEmployeeNumber(e.target.value)} placeholder="e.g. EMP-0001" autoFocus className="mt-1.5" />
          </div>
          {error && <p className="text-xs text-rose">{error}</p>}
          <Button type="submit" disabled={busy || !employeeNumber.trim()}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />} View My Record
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-dvh max-w-lg px-5 py-8">
      <div className="mb-6 flex items-center gap-3">
        <KukieMark className="size-9" />
        <div>
          <p className="font-display text-lg font-semibold text-[#183135]">{staff?.name}</p>
          <p className="text-xs text-[#183135]/60">{staff?.employeeNumber}{staff?.storeName ? ` · ${staff.storeName}` : ""}</p>
        </div>
      </div>

      {completions.length === 0 ? (
        <p className="rounded-[12px] border border-dashed border-[#183135]/20 p-6 text-center text-sm text-[#183135]/60">
          No training activity recorded yet.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {completions.map((c) => (
            <div key={c.id} className="rounded-[14px] border border-[#183135]/10 bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-display text-sm font-semibold text-[#183135]">{c.courseTitle ?? c.courseSlug}</p>
                <StatusBadge status={c.status} />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#183135]/70">
                <ScoreRow label="Knowledge" score={c.knowledgeScore} passed={c.knowledgePassed} />
                <ScoreRow label="Practical" score={c.practicalScore} passed={c.practicalPassed} suffix="/5" />
                <ScoreRow label="Role Play" score={c.roleplayScore} suffix="/5" />
                <div className="flex items-center gap-1.5">
                  {c.workbookCompletedAt ? <CheckCircle2 className="size-3.5 text-emerald" /> : <Clock className="size-3.5 text-[#183135]/30" />}
                  Workbook
                </div>
              </div>

              {c.certificateNumber && (
                <div className={`mt-3 flex items-center gap-2 rounded-[10px] px-3 py-2 text-xs ${isCertificateValid(c) ? (isCertificateExpiringSoon(c) ? "bg-amber-soft text-amber" : "bg-emerald-soft text-emerald") : "bg-rose-soft text-rose"}`}>
                  <Award className="size-3.5 shrink-0" />
                  <span>
                    Certificate {c.certificateNumber}
                    {c.certificateExpiresAt
                      ? isCertificateValid(c)
                        ? ` · valid until ${new Date(c.certificateExpiresAt).toLocaleDateString()}`
                        : ` · expired ${new Date(c.certificateExpiresAt).toLocaleDateString()}`
                      : " · no expiry"}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <button type="button" onClick={() => { setStep("lookup"); setEmployeeNumber(""); }} className="mt-6 text-xs text-[#183135]/50 underline underline-offset-2">
        Look up a different employee number
      </button>
    </div>
  );
}

function ScoreRow({ label, score, passed, suffix = "%" }: { label: string; score: number | null; passed?: boolean | null; suffix?: string }) {
  if (score === null || score === undefined) {
    return (
      <div className="flex items-center gap-1.5">
        <Clock className="size-3.5 text-[#183135]/30" />
        {label}
      </div>
    );
  }
  const Icon = passed === false ? XCircle : CheckCircle2;
  return (
    <div className="flex items-center gap-1.5">
      <Icon className={`size-3.5 ${passed === false ? "text-rose" : "text-emerald"}`} />
      {label} {score}{suffix}
    </div>
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
