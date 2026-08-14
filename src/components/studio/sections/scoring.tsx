"use client";

import { updateCourse } from "@/lib/studio/queries";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { StudioActions, StudioData } from "../builder-shell";

export function ScoringSection({ data, actions }: { data: StudioData; actions: StudioActions }) {
  const { course } = data;
  const scoring = course.meta.scoring ?? {};

  async function save(patch: Partial<typeof scoring>) {
    const updated = await updateCourse(course.id, { meta: { ...course.meta, scoring: { ...scoring, ...patch } } });
    actions.setCourse(updated);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scoring & Pass Standard</CardTitle>
        <CardDescription>Pages 24–25 — the numbers the Knowledge and Practical Assessments are graded against.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label>Knowledge Assessment pass mark (%)</Label>
          <Input
            type="number" min={0} max={100}
            defaultValue={scoring.passMarkPercent ?? 80}
            onBlur={(e) => save({ passMarkPercent: Number(e.target.value) || 0 })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Practical Assessment pass score (out of 5)</Label>
          <Input
            type="number" min={1} max={5}
            defaultValue={scoring.practicalPassScore ?? 4}
            onBlur={(e) => save({ practicalPassScore: Number(e.target.value) || 1 })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
