"use client";

import { updateCourse } from "@/lib/studio/queries";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { StudioActions, StudioData } from "../builder-shell";

export function PracticalSection({ data, actions }: { data: StudioData; actions: StudioActions }) {
  const { course } = data;
  const criteria = course.meta.practicalAssessment?.criteria ?? [];

  async function save(text: string) {
    const next = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const updated = await updateCourse(course.id, { meta: { ...course.meta, practicalAssessment: { criteria: next } } });
    actions.setCourse(updated);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Practical Assessment</CardTitle>
        <CardDescription>Page 21 — the observable, pass/fail criteria for the hands-on skill test.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1.5">
        <Label>Criteria — one per line</Label>
        <Textarea
          rows={8}
          defaultValue={criteria.join("\n")}
          placeholder={"e.g.\nGreets the guest within 30 seconds\nCorrectly logs temperature within the SOP range\nEscalates out-of-range readings immediately"}
          onBlur={(e) => save(e.target.value)}
        />
      </CardContent>
    </Card>
  );
}
