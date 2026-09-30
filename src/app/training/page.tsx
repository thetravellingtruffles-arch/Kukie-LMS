import { AppShell } from "@/components/layout/app-shell";
import { TrainingRecordsClient } from "@/components/training-record/training-records-client";

export default function TrainingPage() {
  return (
    <AppShell title="Training Records" subtitle="Completion tracking and certifications — real, persisted L&D data">
      <TrainingRecordsClient />
    </AppShell>
  );
}
