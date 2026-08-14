import { AppShell } from "@/components/layout/app-shell";
import { SalesImpactClient } from "@/components/sales-impact/sales-impact-client";

export default function SalesImpactPage() {
  return (
    <AppShell title="Sales Impact" subtitle="Proving the training moved the numbers">
      <SalesImpactClient />
    </AppShell>
  );
}
