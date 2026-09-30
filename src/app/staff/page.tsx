import { AppShell } from "@/components/layout/app-shell";
import { StaffDirectory } from "@/components/staff/staff-directory";

export default function StaffPage() {
  return (
    <AppShell title="Staff Directory" subtitle="Real, persisted staff records — added here or auto-created on first QR scan">
      <StaffDirectory />
    </AppShell>
  );
}
