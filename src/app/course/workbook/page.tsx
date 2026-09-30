import { AppShell } from "@/components/layout/app-shell";
import { WorkbookClient } from "@/components/workbook/workbook-client";

export default function WorkbookPage() {
  return (
    <AppShell title="Digital Participant Workbook" subtitle="Module 001 · Sales Build-Up Excellence">
      <WorkbookClient />
    </AppShell>
  );
}
