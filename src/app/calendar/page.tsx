import { AppShell } from "@/components/layout/app-shell";
import { CalendarClient } from "@/components/scheduling/calendar-client";

export default function CalendarPage() {
  return (
    <AppShell title="Training Calendar" subtitle="All scheduled and pending sessions across regions">
      <CalendarClient />
    </AppShell>
  );
}
