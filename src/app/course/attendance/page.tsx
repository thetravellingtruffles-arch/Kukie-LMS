import { AppShell } from "@/components/layout/app-shell";
import { AttendanceClient } from "@/components/attendance/attendance-client";

export default function AttendancePage() {
  return (
    <AppShell title="Attendance" subtitle="Module 001 · Sales Build-Up Excellence">
      <AttendanceClient />
    </AppShell>
  );
}
