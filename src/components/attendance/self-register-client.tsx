"use client";

import * as React from "react";
import { CheckCircle2, Loader2, ArrowRight, UserPlus } from "lucide-react";
import { fetchStaffByEmployeeNumber, createStaff, checkInStaff } from "@/lib/staff/queries";
import { fetchCourseBySlug } from "@/lib/studio/queries";
import type { Staff } from "@/lib/types";
import { KukieMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STATIC_TITLES: Record<string, string> = {
  "module-001": "Sales Build-Up Excellence",
};

type Step = "loading" | "not-found" | "lookup" | "register" | "confirm" | "done" | "error";

export function SelfRegisterClient({ slug }: { slug: string }) {
  const [courseTitle, setCourseTitle] = React.useState<string | null>(null);
  const [step, setStep] = React.useState<Step>("loading");
  const [employeeNumber, setEmployeeNumber] = React.useState("");
  const [matchedStaff, setMatchedStaff] = React.useState<Staff | null>(null);
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function resolve() {
      if (STATIC_TITLES[slug]) {
        setCourseTitle(STATIC_TITLES[slug]);
        setStep("lookup");
        return;
      }
      try {
        const course = await fetchCourseBySlug(slug);
        if (!course) {
          setStep("not-found");
          return;
        }
        setCourseTitle(course.title);
        setStep("lookup");
      } catch {
        setStep("not-found");
      }
    }
    resolve();
  }, [slug]);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    if (!employeeNumber.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const staff = await fetchStaffByEmployeeNumber(employeeNumber.trim());
      if (staff) {
        setMatchedStaff(staff);
        setStep("confirm");
      } else {
        setStep("register");
      }
    } catch {
      setError("Something went wrong looking that up — try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmCheckIn(staff: Staff) {
    setSubmitting(true);
    setError(null);
    try {
      await checkInStaff({ staffId: staff.id, courseSlug: slug, courseTitle: courseTitle ?? undefined, method: "qr" });
      setMatchedStaff(staff);
      setStep("done");
    } catch {
      setError("Check-in failed — try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function register(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const staff = await createStaff({
        employeeNumber: employeeNumber.trim(),
        name: name.trim(),
        role: role.trim() || undefined,
      });
      await checkInStaff({ staffId: staff.id, courseSlug: slug, courseTitle: courseTitle ?? undefined, method: "qr" });
      setMatchedStaff(staff);
      setStep("done");
    } catch {
      setError("Registration failed — the employee number may already be taken. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      <KukieMark className="size-12" />

      {step === "loading" && (
        <p className="flex items-center gap-2 text-sm text-[#183135]/70"><Loader2 className="size-4 animate-spin" /> Loading…</p>
      )}

      {step === "not-found" && (
        <div>
          <p className="font-display text-lg font-semibold text-[#183135]">Session not found</p>
          <p className="mt-1 text-sm text-[#183135]/70">This check-in link doesn&apos;t match a module. Ask your trainer for the current QR code.</p>
        </div>
      )}

      {step === "lookup" && (
        <form onSubmit={lookup} className="flex w-full flex-col gap-4 text-left">
          <div>
            <p className="font-display text-lg font-semibold text-[#183135]">{courseTitle}</p>
            <p className="mt-1 text-sm text-[#183135]/70">Enter your employee number to check in.</p>
          </div>
          <div>
            <Label htmlFor="emp-num">Employee Number</Label>
            <Input id="emp-num" value={employeeNumber} onChange={(e) => setEmployeeNumber(e.target.value)} placeholder="e.g. EMP-0001" autoFocus className="mt-1.5" />
          </div>
          {error && <p className="text-xs text-rose">{error}</p>}
          <Button type="submit" disabled={submitting || !employeeNumber.trim()}>
            {submitting ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />} Continue
          </Button>
        </form>
      )}

      {step === "confirm" && matchedStaff && (
        <div className="flex w-full flex-col gap-4">
          <div>
            <p className="font-display text-lg font-semibold text-[#183135]">Welcome back, {matchedStaff.name.split(" ")[0]}</p>
            <p className="mt-1 text-sm text-[#183135]/70">{matchedStaff.employeeNumber}{matchedStaff.storeName ? ` · ${matchedStaff.storeName}` : ""}</p>
          </div>
          {error && <p className="text-xs text-rose">{error}</p>}
          <Button onClick={() => confirmCheckIn(matchedStaff)} disabled={submitting}>
            {submitting ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />} Check In to {courseTitle}
          </Button>
          <button type="button" onClick={() => { setStep("lookup"); setMatchedStaff(null); }} className="text-xs text-[#183135]/50 underline underline-offset-2">
            Not you? Use a different employee number
          </button>
        </div>
      )}

      {step === "register" && (
        <form onSubmit={register} className="flex w-full flex-col gap-4 text-left">
          <div>
            <p className="flex items-center gap-1.5 font-display text-lg font-semibold text-[#183135]"><UserPlus className="size-4" /> New here?</p>
            <p className="mt-1 text-sm text-[#183135]/70">{employeeNumber} isn&apos;t registered yet — enter your name to register and check in.</p>
          </div>
          <div>
            <Label htmlFor="reg-name">Full Name</Label>
            <Input id="reg-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" autoFocus className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="reg-role">Role (optional)</Label>
            <Input id="reg-role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Server" className="mt-1.5" />
          </div>
          {error && <p className="text-xs text-rose">{error}</p>}
          <Button type="submit" disabled={submitting || !name.trim()}>
            {submitting ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />} Register & Check In
          </Button>
          <button type="button" onClick={() => setStep("lookup")} className="text-xs text-[#183135]/50 underline underline-offset-2">
            Back
          </button>
        </form>
      )}

      {step === "done" && matchedStaff && (
        <div className="flex flex-col items-center gap-2">
          <div className="flex size-14 items-center justify-center rounded-full bg-emerald-soft text-emerald">
            <CheckCircle2 className="size-7" />
          </div>
          <p className="font-display text-lg font-semibold text-[#183135]">You&apos;re checked in</p>
          <p className="text-sm text-[#183135]/70">{matchedStaff.name} · {courseTitle}</p>
          <p className="text-xs text-[#183135]/50">You can close this page now.</p>
        </div>
      )}
    </div>
  );
}
