import { AppShell } from "@/components/layout/app-shell";
import { CourseAttendanceClient } from "@/components/studio/course-attendance-client";

export default async function CourseAttendancePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <AppShell title="QR Check-In" subtitle="Module Studio module">
      <CourseAttendanceClient slug={slug} />
    </AppShell>
  );
}
