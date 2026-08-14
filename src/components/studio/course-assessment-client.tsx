"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { fetchCourseBundle } from "@/lib/studio/queries";
import { QuizRunner } from "@/components/assessment/quiz-runner";
import type { Course, Pillar, QuizQuestion } from "@/lib/types";

export function CourseAssessmentClient({ slug }: { slug: string }) {
  const [bundle, setBundle] = React.useState<{ course: Course; pillars: Pillar[]; questions: QuizQuestion[] } | null | undefined>(undefined);

  React.useEffect(() => {
    fetchCourseBundle(slug).then((b) => setBundle(b ? { course: b.course, pillars: b.pillars, questions: b.questions } : null));
  }, [slug]);

  if (bundle === undefined) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Loading assessment…
      </div>
    );
  }
  if (bundle === null || bundle.questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
        <p className="font-display text-lg font-semibold">No questions yet</p>
        <p className="text-sm text-muted-foreground">This module has no knowledge questions, or doesn&apos;t exist.</p>
        <Link href="/studio" className="text-sm font-medium text-brand underline underline-offset-2">Back to Module Studio</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <QuizRunner questionSet={bundle.questions} pillars={bundle.pillars} passMark={bundle.course.meta.scoring?.passMarkPercent ?? 80} />
    </div>
  );
}
