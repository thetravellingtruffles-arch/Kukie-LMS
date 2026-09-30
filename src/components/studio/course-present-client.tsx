"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { fetchCourseBundle } from "@/lib/studio/queries";
import { PresentationClient } from "@/components/presentation/presentation-client";
import type { Pillar, Slide } from "@/lib/types";

export function CoursePresentClient({ slug }: { slug: string }) {
  const [bundle, setBundle] = React.useState<{ title: string; pillars: Pillar[]; slides: Slide[] } | null | undefined>(undefined);

  React.useEffect(() => {
    fetchCourseBundle(slug).then((b) => setBundle(b ? { title: b.course.title, pillars: b.pillars, slides: b.slides } : null));
  }, [slug]);

  if (bundle === undefined) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Loading module…
      </div>
    );
  }
  if (bundle === null || bundle.slides.length === 0) {
    return (
      <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center gap-2 text-center">
        <p className="font-display text-lg font-semibold">Nothing to present yet</p>
        <p className="text-sm text-muted-foreground">This module has no slides, or doesn&apos;t exist.</p>
        <Link href="/studio" className="text-sm font-medium text-brand underline underline-offset-2">Back to Module Studio</Link>
      </div>
    );
  }

  return <PresentationClient slides={bundle.slides} pillars={bundle.pillars} courseLabel={bundle.title} totalMinutes={bundle.slides.reduce((s, sl) => s + sl.durationMin, 0)} />;
}
