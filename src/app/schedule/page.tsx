import { AppShell } from "@/components/layout/app-shell";
import { SignupClient } from "@/components/scheduling/signup-client";

export default function SchedulePage() {
  return (
    <AppShell title="Schedule Training" subtitle="Request a Module 001 session for your store">
      <SignupClient />
    </AppShell>
  );
}
