"use client";

import { updateCourse } from "@/lib/studio/queries";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { StudioActions, StudioData } from "../builder-shell";

const FIELDS: { key: "businessProblem" | "operationalNeed" | "guestImpact" | "businessOutcome"; label: string; placeholder: string }[] = [
  { key: "businessProblem", label: "Business Problem", placeholder: "What operational problem does this training exist to fix?" },
  { key: "operationalNeed", label: "Operational Need", placeholder: "What day-to-day operational gap does it close?" },
  { key: "guestImpact", label: "Guest Impact", placeholder: "How does this affect the guest experience?" },
  { key: "businessOutcome", label: "Business Outcome", placeholder: "What measurable outcome should this training produce?" },
];

export function TrainingNeedSection({ data, actions }: { data: StudioData; actions: StudioActions }) {
  const { course } = data;
  const need = course.meta.trainingNeed ?? {};

  async function save(key: (typeof FIELDS)[number]["key"], value: string) {
    const updated = await updateCourse(course.id, {
      meta: { ...course.meta, trainingNeed: { ...need, [key]: value } },
    });
    actions.setCourse(updated);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Need / Business Purpose</CardTitle>
        <CardDescription>Page 6 — why this training exists. Current State → Required State.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {FIELDS.map((f) => (
          <div key={f.key} className="flex flex-col gap-1.5">
            <Label>{f.label}</Label>
            <Textarea
              rows={2}
              defaultValue={need[f.key] ?? ""}
              placeholder={f.placeholder}
              onBlur={(e) => {
                if (e.target.value !== (need[f.key] ?? "")) save(f.key, e.target.value);
              }}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
