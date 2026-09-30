import { AppShell } from "@/components/layout/app-shell";
import { SalesImpactClient } from "@/components/sales-impact/sales-impact-client";

export default function SalesImpactPage() {
  return (
    <AppShell title="Sales Impact" subtitle="Proving the training moved the numbers">
      <div className="mb-5 rounded-[12px] border border-amber/30 bg-amber-soft px-4 py-3 text-sm text-amber">
        <strong>Sample data.</strong> This page has no connected point-of-sale system yet, so every number below
        is illustrative sample data — not real sales figures. Connect a POS integration to make this page live.
      </div>
      <SalesImpactClient />
    </AppShell>
  );
}
