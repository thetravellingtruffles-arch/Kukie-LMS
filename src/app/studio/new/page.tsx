import { AppShell } from "@/components/layout/app-shell";
import { NewModuleClient } from "@/components/studio/new-module-client";

export default function NewModulePage() {
  return (
    <AppShell title="New Module" subtitle="Blank or draft-assisted — every module follows the Master Training Module Template">
      <NewModuleClient />
    </AppShell>
  );
}
