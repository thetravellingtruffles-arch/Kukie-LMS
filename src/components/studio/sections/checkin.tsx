"use client";

import { QrCode, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckInPanel } from "@/components/attendance/check-in-panel";
import type { StudioData } from "../builder-shell";

export function CheckInSection({ data }: { data: StudioData }) {
  const { course } = data;
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><QrCode className="size-4" /> Attendance & QR Check-In</CardTitle>
          <CardDescription>Standard on every Kükie Academy module — the first step of every training session.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="flex items-start gap-2 rounded-[10px] bg-emerald-soft px-3 py-2.5 text-xs text-emerald">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
            This isn&apos;t optional or configured per module — every module built in the Studio automatically gets a live QR
            check-in station at <span className="font-mono">/course/{course.slug || "…"}/attendance</span>. Staff scan their
            badge here before the training content starts, and it feeds the attendance record for reporting.
          </p>
        </CardContent>
      </Card>

      <div className="max-w-md">
        <CheckInPanel courseSlug={course.slug} courseTitle={course.title} />
      </div>
    </div>
  );
}
