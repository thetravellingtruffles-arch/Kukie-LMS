"use client";

import * as React from "react";
import { updateCourse } from "@/lib/studio/queries";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { StudioActions, StudioData } from "../builder-shell";
import { SaveField } from "./_shared";

export function ModuleInfoSection({ data, actions }: { data: StudioData; actions: StudioActions }) {
  const { course } = data;

  async function save(patch: Parameters<typeof updateCourse>[1]) {
    const updated = await updateCourse(course.id, patch);
    actions.setCourse(updated);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Module Info</CardTitle>
        <CardDescription>Page 5 of the Master Training Module Template — module identity and logistics.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SaveField label="Module Title" value={course.title} onSave={(v) => save({ title: v })} />
          <SaveField label="Subtitle" value={course.subtitle ?? ""} onSave={(v) => save({ subtitle: v })} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Description</Label>
          <Textarea
            defaultValue={course.description ?? ""}
            rows={3}
            onBlur={(e) => save({ description: e.target.value })}
            placeholder="What this module covers and why it exists…"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SaveField
            label="Training Category"
            value={course.meta.category ?? ""}
            onSave={(v) => save({ meta: { ...course.meta, category: v } })}
          />
          <SaveField
            label="Target Audience"
            value={course.meta.targetAudience ?? ""}
            onSave={(v) => save({ meta: { ...course.meta, targetAudience: v } })}
          />
          <SaveField
            label="Duration"
            value={course.meta.duration ?? ""}
            onSave={(v) => save({ meta: { ...course.meta, duration: v } })}
            placeholder="e.g. 90 minutes"
          />
          <SaveField
            label="Delivery Method"
            value={course.meta.deliveryMethod ?? ""}
            onSave={(v) => save({ meta: { ...course.meta, deliveryMethod: v } })}
            placeholder="e.g. In-person, on-site"
          />
          <SaveField
            label="Class Size"
            value={course.meta.classSize ?? ""}
            onSave={(v) => save({ meta: { ...course.meta, classSize: v } })}
          />
          <SaveField
            label="Prerequisites"
            value={course.meta.prerequisites ?? ""}
            onSave={(v) => save({ meta: { ...course.meta, prerequisites: v } })}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>Difficulty</Label>
            <Select value={course.difficulty} onValueChange={(v) => save({ difficulty: v as typeof course.difficulty })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Foundation">Foundation</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <SaveField
            label="Trainer Name"
            value={course.trainerName ?? ""}
            onSave={(v) => save({ trainerName: v })}
          />
        </div>

        <div className="rounded-[var(--radius-md)] border border-border bg-surface-muted/50 p-3 text-xs text-muted-foreground">
          Slug: <span className="font-mono">{course.slug}</span> · Module {String(course.moduleNumber).padStart(3, "0")} · Version {course.version}
        </div>
      </CardContent>
    </Card>
  );
}
