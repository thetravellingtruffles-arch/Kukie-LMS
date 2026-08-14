"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";

export function BarCompare({
  data,
  bars,
  xKey = "label",
  height = 260,
  layout = "vertical",
  colorByIndex,
}: {
  data: Record<string, unknown>[];
  bars: { key: string; color: string; name?: string }[];
  xKey?: string;
  height?: number;
  layout?: "vertical" | "horizontal";
  colorByIndex?: string[];
}) {
  const isHorizontal = layout === "horizontal";
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout={isHorizontal ? "vertical" : "horizontal"}
        margin={{ top: 8, right: 16, left: isHorizontal ? 8 : -18, bottom: 0 }}
        barGap={6}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={isHorizontal} horizontal={!isHorizontal} />
        {isHorizontal ? (
          <>
            <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey={xKey}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              width={110}
            />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={36} />
          </>
        )}
        <Tooltip
          cursor={{ fill: "var(--surface-muted)" }}
          contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }}
        />
        {bars.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
        {bars.map((b) => (
          <Bar key={b.key} dataKey={b.key} name={b.name ?? b.key} fill={b.color} radius={[6, 6, 6, 6]} maxBarSize={28}>
            {colorByIndex &&
              data.map((_, i) => <Cell key={i} fill={colorByIndex[i % colorByIndex.length]} />)}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
