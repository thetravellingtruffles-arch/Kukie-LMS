import { AppShell } from "@/components/layout/app-shell";
import { RolePlayClient } from "@/components/roleplay/roleplay-client";

export default function RolePlayPage() {
  return (
    <AppShell title="Role Play" subtitle="Module 001 · Guest Orders a Burger">
      <RolePlayClient />
    </AppShell>
  );
}
