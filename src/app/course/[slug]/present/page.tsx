import { AppShell } from "@/components/layout/app-shell";
import { CoursePresentClient } from "@/components/studio/course-present-client";

export default async function CoursePresentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <AppShell title="Presentation Mode" subtitle="Module Studio module" fullBleed>
      <CoursePresentClient slug={slug} />
    </AppShell>
  );
}
