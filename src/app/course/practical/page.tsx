import { AppShell } from "@/components/layout/app-shell";
import { PracticalClient } from "@/components/practical/practical-client";

export default function PracticalPage() {
  return (
    <AppShell title="Practical Assessment" subtitle="Module 001 · Trainer-scored floor evaluation">
      <PracticalClient />
    </AppShell>
  );
}
