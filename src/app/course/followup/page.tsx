import { AppShell } from "@/components/layout/app-shell";
import { FollowUpClient } from "@/components/followup/followup-client";

export default function FollowUpPage() {
  return (
    <AppShell title="Manager Follow-Up" subtitle="Module 001 · 30-day post-training check-in">
      <FollowUpClient />
    </AppShell>
  );
}
