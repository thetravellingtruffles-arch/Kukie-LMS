import { AppShell } from "@/components/layout/app-shell";
import { OrganizationClient } from "@/components/organization/organization-client";

export default function OrganizationPage() {
  return (
    <AppShell title="Organization Setup" subtitle="Real regions, stores, trainers and managers — these feed Staff, Scheduling and the training calendar">
      <OrganizationClient />
    </AppShell>
  );
}
