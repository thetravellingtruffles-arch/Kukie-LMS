import { AppShell } from "@/components/layout/app-shell";
import { QuizRunner } from "@/components/assessment/quiz-runner";

export default function AssessmentPage() {
  return (
    <AppShell title="Knowledge Assessment" subtitle="Module 001 · Pass mark 80%">
      <div className="mx-auto max-w-2xl">
        <QuizRunner />
      </div>
    </AppShell>
  );
}
