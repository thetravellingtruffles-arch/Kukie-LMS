import { AppShell } from "@/components/layout/app-shell";
import { CourseAssessmentClient } from "@/components/studio/course-assessment-client";

export default async function CourseAssessmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <AppShell title="Knowledge Assessment" subtitle="Module Studio module">
      <CourseAssessmentClient slug={slug} />
    </AppShell>
  );
}
