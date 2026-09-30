"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Loader2, ShieldCheck, PencilLine, Layers, QrCode } from "lucide-react";
import { fetchCourses } from "@/lib/studio/queries";
import { fetchAttendanceForCourse } from "@/lib/staff/queries";
import type { Course } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const REFERENCE_MODULE = {
  slug: "sales-build-up",
  title: "Sales Build-Up Excellence",
  subtitle: "Module 001 · Six-pillar sales performance curriculum",
  status: "published" as const,
};

function CheckInCount({ slug }: { slug: string }) {
  const [count, setCount] = React.useState<number | null>(null);
  React.useEffect(() => {
    fetchAttendanceForCourse(slug).then((rows) => setCount(rows.length)).catch(() => setCount(0));
  }, [slug]);
  return (
    <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
      <QrCode className="size-3" /> {count === null ? "…" : count} checked in
    </p>
  );
}

export function StudioList() {
  const [courses, setCourses] = React.useState<Course[] | null>(null);

  React.useEffect(() => {
    fetchCourses().then(setCourses).catch(() => setCourses([]));
  }, []);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Build a new module using the Master Training Module Template — start blank or let draft-assist scaffold it from a topic.
        </p>
        <Button asChild>
          <Link href="/studio/new"><Plus className="size-4" /> New Module</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {/* Reference module — static, read-only from the Studio's perspective */}
        <Card className="border-dashed">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <Badge variant="secondary"><ShieldCheck className="size-3" /> Reference</Badge>
              <span className="text-[11px] text-muted-foreground">Module 001</span>
            </div>
            <p className="font-display text-base font-semibold leading-snug">{REFERENCE_MODULE.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{REFERENCE_MODULE.subtitle}</p>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Built by hand as the flagship reference implementation. Not editable in the Studio.
            </p>
            <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
              <Link href="/course">View Module</Link>
            </Button>
          </CardContent>
        </Card>

        {courses === null && (
          <Card><CardContent className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading modules…</CardContent></Card>
        )}

        {courses?.length === 0 && null}

        {courses?.map((c) => (
          <Card key={c.id}>
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <Badge variant={c.status === "published" ? "success" : "warning"}>
                  {c.status === "published" ? "Published" : "Draft"}
                </Badge>
                <span className="text-[11px] text-muted-foreground">Module {String(c.moduleNumber).padStart(3, "0")}</span>
              </div>
              <p className="font-display text-base font-semibold leading-snug">{c.title || "Untitled module"}</p>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{c.subtitle || c.description || "No description yet."}</p>
              <CheckInCount slug={c.slug} />
              <div className="mt-4 flex gap-2">
                <Button size="sm" className="flex-1" asChild>
                  <Link href={`/studio/${c.id}`}><PencilLine className="size-3.5" /> Edit</Link>
                </Button>
                {c.status === "published" && (
                  <Button size="sm" variant="outline" className="flex-1" asChild>
                    <Link href={`/course/${c.slug}/present`}><Layers className="size-3.5" /> Preview</Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
