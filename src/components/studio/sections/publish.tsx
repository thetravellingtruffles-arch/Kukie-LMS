"use client";

import * as React from "react";
import Link from "next/link";
import { Check, X, Rocket, Layers, ClipboardList, QrCode } from "lucide-react";
import { updateCourse } from "@/lib/studio/queries";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { StudioActions, StudioData } from "../builder-shell";

export function PublishSection({ data, actions }: { data: StudioData; actions: StudioActions }) {
  const { course, pillars, slides, questions } = data;
  const [busy, setBusy] = React.useState(false);

  const gates = [
    { label: "Module title & category set", pass: !!course.title && !!course.meta.category },
    { label: "At least one learning outcome", pass: (course.meta.learningOutcomes?.length ?? 0) > 0 },
    { label: "At least one pillar", pass: pillars.length > 0 },
    { label: "At least one slide", pass: slides.length > 0 },
    { label: "At least five knowledge questions", pass: questions.length >= 5 },
    { label: "Practical assessment criteria defined", pass: (course.meta.practicalAssessment?.criteria?.length ?? 0) > 0 },
    { label: "Pass mark defined", pass: !!course.meta.scoring?.passMarkPercent },
  ];
  const allPass = gates.every((g) => g.pass);
  const hasPlaceholders = JSON.stringify(course.meta).includes("INPUT REQUIRED") || JSON.stringify(course.meta).includes("VALIDATION REQUIRED");

  async function publish() {
    setBusy(true);
    try {
      const updated = await updateCourse(course.id, { status: "published" });
      actions.setCourse(updated);
    } finally {
      setBusy(false);
    }
  }
  async function unpublish() {
    setBusy(true);
    try {
      const updated = await updateCourse(course.id, { status: "draft" });
      actions.setCourse(updated);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Review & Publish</CardTitle>
          <CardDescription>Page 45 — the final release gate before this module is available to learners.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {gates.map((g) => (
            <div key={g.label} className="flex items-center gap-2.5 text-sm">
              {g.pass ? <Check className="size-4 shrink-0 text-emerald" /> : <X className="size-4 shrink-0 text-rose" />}
              <span className={g.pass ? "" : "text-muted-foreground"}>{g.label}</span>
            </div>
          ))}

          {hasPlaceholders && (
            <div className="mt-2 rounded-[var(--radius-md)] border border-amber/40 bg-amber-soft p-3 text-xs text-amber">
              This module still contains [INPUT REQUIRED] / [SME VALIDATION REQUIRED] placeholders from draft-assist. Review every section before publishing to real learners.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="flex items-center gap-2">
            <Badge variant={course.status === "published" ? "success" : "warning"}>
              {course.status === "published" ? "Published" : "Draft"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {course.status === "published" ? "Live and reachable at /course/" + course.slug + "/present" : "Only visible in the Studio"}
            </span>
          </div>
          <div className="flex gap-2">
            {course.status === "published" ? (
              <>
                <Button variant="outline" asChild>
                  <Link href={`/course/${course.slug}/attendance`}><QrCode className="size-4" /> 1. QR Check-In</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/course/${course.slug}/present`}><Layers className="size-4" /> 2. Preview</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/course/${course.slug}/assessment`}><ClipboardList className="size-4" /> 3. Assessment</Link>
                </Button>
                <Button variant="secondary" onClick={unpublish} disabled={busy}>Unpublish</Button>
              </>
            ) : (
              <Button onClick={publish} disabled={!allPass || busy}>
                <Rocket className="size-4" /> Publish Module
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
