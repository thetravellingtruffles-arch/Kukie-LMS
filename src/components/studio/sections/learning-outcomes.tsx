"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { updateCourse } from "@/lib/studio/queries";
import type { LearningOutcomeRow } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { StudioActions, StudioData } from "../builder-shell";

const CATEGORIES: LearningOutcomeRow["category"][] = ["Know", "Understand", "Demonstrate", "Perform", "Apply", "Explain", "Troubleshoot", "Coach"];

export function LearningOutcomesSection({ data, actions }: { data: StudioData; actions: StudioActions }) {
  const { course } = data;
  const rows = course.meta.learningOutcomes ?? [];

  async function persist(next: LearningOutcomeRow[]) {
    const updated = await updateCourse(course.id, { meta: { ...course.meta, learningOutcomes: next } });
    actions.setCourse(updated);
  }

  function addRow() {
    persist([...rows, { category: "Know", outcome: "" }]);
  }
  function updateRow(i: number, patch: Partial<LearningOutcomeRow>) {
    persist(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function removeRow(i: number) {
    persist(rows.filter((_, idx) => idx !== i));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning Outcomes</CardTitle>
        <CardDescription>Page 7 — measurable, not vague. "Correctly demonstrate X per the approved SOP," not "understand X."</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {rows.length === 0 && <p className="text-sm text-muted-foreground">No outcomes yet — add one below.</p>}
        {rows.map((r, i) => (
          <div key={i} className="flex items-start gap-2">
            <Select value={r.category} onValueChange={(v) => updateRow(i, { category: v as LearningOutcomeRow["category"] })}>
              <SelectTrigger className="w-40 shrink-0"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input
              defaultValue={r.outcome}
              placeholder="By the end of this module, the learner will be able to…"
              onBlur={(e) => {
                if (e.target.value !== r.outcome) updateRow(i, { outcome: e.target.value });
              }}
            />
            <Button variant="ghost" size="icon" onClick={() => removeRow(i)}><Trash2 className="size-4" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" className="mt-1 w-fit" onClick={addRow}>
          <Plus className="size-3.5" /> Add Outcome
        </Button>
      </CardContent>
    </Card>
  );
}
