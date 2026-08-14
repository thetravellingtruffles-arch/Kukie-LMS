import { AppShell } from "@/components/layout/app-shell";
import { BuilderShell } from "@/components/studio/builder-shell";

export default async function StudioCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  return (
    <AppShell title="Module Builder" subtitle="Every section is editable in any order — nothing here is a locked wizard">
      <BuilderShell courseId={courseId} />
    </AppShell>
  );
}
