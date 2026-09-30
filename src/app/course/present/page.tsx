import { AppShell } from "@/components/layout/app-shell";
import { PresentationClient } from "@/components/presentation/presentation-client";

export default function PresentPage() {
  return (
    <AppShell title="Presentation Mode" subtitle="Sales Build-Up Excellence · Module 001" fullBleed>
      <PresentationClient />
    </AppShell>
  );
}
