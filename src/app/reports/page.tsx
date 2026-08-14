import { AppShell } from "@/components/layout/app-shell";
import { ReportsClient } from "@/components/reports/reports-client";

export default function ReportsPage() {
  return (
    <AppShell title="Reports" subtitle="Generate and export Module 001 performance data">
      <ReportsClient />
    </AppShell>
  );
}
