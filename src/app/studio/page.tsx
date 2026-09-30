import { AppShell } from "@/components/layout/app-shell";
import { StudioList } from "@/components/studio/studio-list";

export default function StudioPage() {
  return (
    <AppShell title="Module Studio" subtitle="Build and manage Kükie Academy training modules">
      <StudioList />
    </AppShell>
  );
}
