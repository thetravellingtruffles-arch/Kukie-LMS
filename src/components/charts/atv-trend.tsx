"use client";

import { TrendLine } from "./trend-line";

// Small client wrapper so server components can render an ATV trend
// without passing a function prop across the server/client boundary.
export function AtvTrend({ data }: { data: Record<string, unknown>[] }) {
  return (
    <TrendLine
      data={data}
      dataKey="atv"
      xKey="label"
      color="var(--brand)"
      valueFormatter={(v) => `$${v.toFixed(2)}`}
    />
  );
}
