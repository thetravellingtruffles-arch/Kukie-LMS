"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { fetchCourseBundle } from "@/lib/studio/queries";
import { fetchStaffByEmployeeNumber, fetchStaffById } from "@/lib/staff/queries";
import { recordKnowledgeResult } from "@/lib/completions/queries";
import { QuizRunner } from "@/components/assessment/quiz-runner";
import type { Course, Pillar, QuizQuestion, Staff } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export function CourseAssessmentClient({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const staffIdParam = searchParams.get("staff");

  const [bundle, setBundle] = React.useState<{ course: Course; pillars: Pillar[]; questions: QuizQuestion[] } | null | undefined>(undefined);
  const [staff, setStaff] = React.useState<Staff | null>(null);
  const [staffLoading, setStaffLoading] = React.useState(!!staffIdParam);
  const [employeeNumber, setEmployeeNumber] = React.useState("");
  const [lookupError, setLookupError] = React.useState<string | null>(null);
  const [lookupBusy, setLookupBusy] = React.useState(false);
  const [saved, setSaved] = React.useState<{ scorePercent: number; passed: boolean } | null>(null);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchCourseBundle(slug).then((b) => setBundle(b ? { course: b.course, pillars: b.pillars, questions: b.questions } : null));
  }, [slug]);

  React.useEffect(() => {
    if (!staffIdParam) return;
    setStaffLoading(true);
    fetchStaffById(staffIdParam).then((s) => {
      setStaff(s);
      setStaffLoading(false);
    });
  }, [staffIdParam]);

  async function lookupStaff(e: React.FormEvent) {
    e.preventDefault();
    if (!employeeNumber.trim()) return;
    setLookupBusy(true);
    setLookupError(null);
    try {
      const found = await fetchStaffByEmployeeNumber(employeeNumber.trim());
      if (found) {
        setStaff(found);
      } else {
        setLookupError("No staff member found with that employee number.");
      }
    } catch {
      setLookupError("Something went wrong looking that up — try again.");
    } finally {
      setLookupBusy(false);
    }
  }

  async function handleComplete(result: { scorePercent: number; passed: boolean }) {
    if (!staff || !bundle) return;
    try {
      await recordKnowledgeResult({
        staffId: staff.id,
        courseId: bundle.course.id,
        courseSlug: slug,
        courseTitle: bundle.course.title,
        scorePercent: result.scorePercent,
        passMarkPercent: bundle.course.meta.scoring?.passMarkPercent ?? 80,
      });
      setSaved(result);
    } catch {
      setSaveError("Your score was calculated but couldn't be saved to your training record. Ask an admin to log it manually.");
    }
  }

  if (bundle === undefined || staffLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Loading assessment…
      </div>
    );
  }
  if (bundle === null || bundle.questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
        <p className="font-display text-lg font-semibold">No questions yet</p>
        <p className="text-sm text-muted-foreground">This module has no knowledge questions, or doesn&apos;t exist.</p>
        <Link href="/studio" className="text-sm font-medium text-brand underline underline-offset-2">Back to Module Studio</Link>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="mx-auto max-w-sm">
        <Card>
          <CardContent className="p-6">
            <p className="font-display text-lg font-semibold">Who&apos;s taking this assessment?</p>
            <p className="mt-1 text-sm text-muted-foreground">Enter your employee number to attach this result to your training record.</p>
            <form onSubmit={lookupStaff} className="mt-4 flex flex-col gap-3">
              <div>
                <Label htmlFor="assess-emp-num">Employee Number</Label>
                <Input id="assess-emp-num" value={employeeNumber} onChange={(e) => setEmployeeNumber(e.target.value)} placeholder="e.g. EMP-0001" autoFocus className="mt-1.5" />
              </div>
              {lookupError && <p className="text-xs text-rose">{lookupError}</p>}
              <Button type="submit" disabled={lookupBusy || !employeeNumber.trim()}>
                {lookupBusy ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />} Continue
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (saved) {
    return (
      <div className="mx-auto max-w-sm text-center">
        <div className={`mx-auto flex size-14 items-center justify-center rounded-full ${saved.passed ? "bg-emerald-soft text-emerald" : "bg-rose-soft text-rose"}`}>
          <CheckCircle2 className="size-7" />
        </div>
        <p className="mt-4 font-display text-lg font-semibold">Saved to {staff.name.split(" ")[0]}&apos;s training record</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {saved.scorePercent}% · {saved.passed ? "Passed" : "Not yet passed"} · {bundle.course.title}
        </p>
        {saveError && <p className="mt-2 text-xs text-rose">{saveError}</p>}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="mb-3 text-center text-xs text-muted-foreground">Taking this assessment as <span className="font-medium text-foreground">{staff.name}</span> ({staff.employeeNumber})</p>
      <QuizRunner
        questionSet={bundle.questions}
        pillars={bundle.pillars}
        passMark={bundle.course.meta.scoring?.passMarkPercent ?? 80}
        onComplete={handleComplete}
      />
    </div>
  );
}
