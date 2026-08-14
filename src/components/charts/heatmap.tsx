import { cn } from "@/lib/utils";

function intensity(value: number) {
  // value 0-100 -> background alpha
  const clamped = Math.min(100, Math.max(0, value));
  const alpha = 0.08 + (clamped / 100) * 0.85;
  return alpha;
}

export function Heatmap({
  rows,
  columns,
  getValue,
  formatValue,
}: {
  rows: { id: string; label: string }[];
  columns: { id: string; label: string }[];
  getValue: (rowId: string, colId: string) => number;
  formatValue?: (v: number) => string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1 text-xs">
        <thead>
          <tr>
            <th className="w-40 text-left text-[11px] font-medium text-muted-foreground"> </th>
            {columns.map((c) => (
              <th key={c.id} className="min-w-[76px] px-1 pb-2 text-center text-[11px] font-medium text-muted-foreground">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="pr-2 text-[12px] font-medium text-foreground">{r.label}</td>
              {columns.map((c) => {
                const v = getValue(r.id, c.id);
                return (
                  <td key={c.id} className="p-0">
                    <div
                      className={cn(
                        "flex h-9 items-center justify-center rounded-[8px] text-[11px] font-semibold text-brand"
                      )}
                      style={{ backgroundColor: `color-mix(in srgb, var(--brand) ${intensity(v) * 100}%, transparent)` }}
                    >
                      <span className={v > 55 ? "text-white" : "text-brand"}>
                        {formatValue ? formatValue(v) : Math.round(v)}
                      </span>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
