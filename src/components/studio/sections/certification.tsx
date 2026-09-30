"use client";

import { updateCourse } from "@/lib/studio/queries";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { StudioActions, StudioData } from "../builder-shell";

export function CertificationSection({ data, actions }: { data: StudioData; actions: StudioActions }) {
  const { course } = data;
  const cert = course.meta.certification ?? {};

  async function save(patch: Partial<typeof cert>) {
    const updated = await updateCourse(course.id, { meta: { ...course.meta, certification: { ...cert, ...patch } } });
    actions.setCourse(updated);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Certification</CardTitle>
        <CardDescription>Page 28 — whether completing this module issues a certificate, and for how long it's valid.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-border p-3">
          <div>
            <p className="text-sm font-medium">Issues a certificate on pass</p>
            <p className="text-xs text-muted-foreground">Learners who pass both assessments receive a formal certificate.</p>
          </div>
          <Switch checked={cert.issuesCertificate ?? true} onCheckedChange={(v) => save({ issuesCertificate: v })} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Validity (months) — leave blank if it never expires</Label>
          <Input
            type="number" min={0}
            defaultValue={cert.validityMonths ?? 12}
            onBlur={(e) => save({ validityMonths: Number(e.target.value) || undefined })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
