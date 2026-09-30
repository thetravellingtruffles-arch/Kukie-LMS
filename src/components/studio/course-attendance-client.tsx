"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { fetchCourseBySlug } from "@/lib/studio/queries";
import { CheckInPanel } from "@/components/attendance/check-in-panel";
import type { Course } from "@/lib/types";

export function CourseAttendanceClient({ slug }: { slug: string }) {
  const [course, setCourse] = React.useState<Course | null | undefined>(undefined);

  React.useEffect(() => {
    fetchCourseBySlug(slug).then(setCourse);
  }, [slug]);

  if (course === undefined) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Loading module…
      </div>
    );
  }
  if (course === null) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
        <p className="font-display text-lg font-semibold">Module not found</p>
        <Link href="/studio" className="text-sm font-medium text-brand underline underline-offset-2">Back to Module Studio</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <CheckInPanel courseSlug={course.slug} courseTitle={course.title} />
    </div>
  );
}
