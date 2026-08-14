"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Loader2, FileText, Target, ListChecks, Layers, GalleryHorizontal, HelpCircle,
  ClipboardCheck, Gauge, Award, Rocket, Check, QrCode,
} from "lucide-react";
import { fetchCourseById, fetchPillars, fetchSlides, fetchQuestions } from "@/lib/studio/queries";
import type { Course, Pillar, QuizQuestion, Slide } from "@/lib/types";
import { cn } from "@/lib/utils";

import { ModuleInfoSection } from "./sections/module-info";
import { CheckInSection } from "./sections/checkin";
import { TrainingNeedSection } from "./sections/training-need";
import { LearningOutcomesSection } from "./sections/learning-outcomes";
import { PillarsSection } from "./sections/pillars";
import { SlidesSection } from "./sections/slides";
import { QuestionsSection } from "./sections/questions";
import { PracticalSection } from "./sections/practical";
import { ScoringSection } from "./sections/scoring";
import { CertificationSection } from "./sections/certification";
import { PublishSection } from "./sections/publish";

export type StudioData = {
  course: Course;
  pillars: Pillar[];
  slides: Slide[];
  questions: QuizQuestion[];
};

export type StudioActions = {
  refresh: () => Promise<void>;
  setCourse: (c: Course) => void;
};

const SECTIONS = [
  { id: "info", label: "Module Info", icon: FileText, done: (d: StudioData) => !!d.course.title && !!d.course.meta.category },
  { id: "checkin", label: "Attendance & QR Check-In", icon: QrCode, done: () => true },
  { id: "need", label: "Training Need", icon: Target, done: (d: StudioData) => !!d.course.meta.trainingNeed?.businessProblem },
  { id: "outcomes", label: "Learning Outcomes", icon: ListChecks, done: (d: StudioData) => (d.course.meta.learningOutcomes?.length ?? 0) > 0 },
  { id: "pillars", label: "Pillars / Structure", icon: Layers, done: (d: StudioData) => d.pillars.length > 0 },
  { id: "slides", label: "Slides", icon: GalleryHorizontal, done: (d: StudioData) => d.slides.length > 0 },
  { id: "questions", label: "Knowledge Questions", icon: HelpCircle, done: (d: StudioData) => d.questions.length > 0 },
  { id: "practical", label: "Practical Assessment", icon: ClipboardCheck, done: (d: StudioData) => (d.course.meta.practicalAssessment?.criteria?.length ?? 0) > 0 },
  { id: "scoring", label: "Scoring & Pass Standard", icon: Gauge, done: (d: StudioData) => !!d.course.meta.scoring?.passMarkPercent },
  { id: "certification", label: "Certification", icon: Award, done: (d: StudioData) => d.course.meta.certification?.issuesCertificate !== undefined },
  { id: "publish", label: "Review & Publish", icon: Rocket, done: (d: StudioData) => d.course.status === "published" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];

export function BuilderShell({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [data, setData] = React.useState<StudioData | null>(null);
  const [section, setSection] = React.useState<SectionId>("info");
  const [notFound, setNotFound] = React.useState(false);

  const load = React.useCallback(async () => {
    const course = await fetchCourseById(courseId);
    if (!course) {
      setNotFound(true);
      return;
    }
    const [pillars, slides, questions] = await Promise.all([
      fetchPillars(course.id),
      fetchSlides(course.id),
      fetchQuestions(course.id),
    ]);
    setData({ course, pillars, slides, questions });
  }, [courseId]);

  React.useEffect(() => {
    load();
  }, [load]);

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <p className="font-display text-lg font-semibold">Module not found</p>
        <p className="text-sm text-muted-foreground">It may have been deleted, or the link is wrong.</p>
        <button onClick={() => router.push("/studio")} className="text-sm font-medium text-brand underline underline-offset-2">
          Back to Module Studio
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Loading module…
      </div>
    );
  }

  const actions: StudioActions = { refresh: load, setCourse: (c) => setData((d) => (d ? { ...d, course: c } : d)) };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
      {/* Non-linear section nav — every section is reachable at any time, in any order. */}
      <nav className="flex flex-col gap-0.5 lg:sticky lg:top-6 lg:self-start">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          const active = section === s.id;
          const complete = s.done(data);
          return (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={cn(
                "flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2.5 text-left text-[13px] font-medium transition-colors",
                active ? "bg-brand text-brand-foreground" : "text-foreground hover:bg-surface-muted"
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="flex-1 truncate">{s.label}</span>
              {complete && (
                <Check className={cn("size-3.5 shrink-0", active ? "text-brand-foreground" : "text-emerald")} />
              )}
            </button>
          );
        })}
      </nav>

      <div className="min-w-0">
        {section === "info" && <ModuleInfoSection data={data} actions={actions} />}
        {section === "checkin" && <CheckInSection data={data} />}
        {section === "need" && <TrainingNeedSection data={data} actions={actions} />}
        {section === "outcomes" && <LearningOutcomesSection data={data} actions={actions} />}
        {section === "pillars" && <PillarsSection data={data} actions={actions} />}
        {section === "slides" && <SlidesSection data={data} actions={actions} />}
        {section === "questions" && <QuestionsSection data={data} actions={actions} />}
        {section === "practical" && <PracticalSection data={data} actions={actions} />}
        {section === "scoring" && <ScoringSection data={data} actions={actions} />}
        {section === "certification" && <CertificationSection data={data} actions={actions} />}
        {section === "publish" && <PublishSection data={data} actions={actions} />}
      </div>
    </div>
  );
}
