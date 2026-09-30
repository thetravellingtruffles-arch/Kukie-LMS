import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const accentMap = {
  brand: "bg-brand-soft text-brand",
  amber: "bg-amber-soft text-amber",
  emerald: "bg-emerald-soft text-emerald",
  rose: "bg-rose-soft text-rose",
  violet: "bg-violet-soft text-violet",
};

export function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  deltaLabel,
  accent = "brand",
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  delta?: number;
  deltaLabel?: string;
  accent?: keyof typeof accentMap;
  className?: string;
}) {
  const positive = (delta ?? 0) >= 0;
  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-start justify-between">
        <div className={cn("flex size-9 items-center justify-center rounded-[10px]", accentMap[accent])}>
          <Icon className="size-4.5" />
        </div>
        {delta !== undefined && (
          <span
            className={cn(
              "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
              positive ? "bg-emerald-soft text-emerald" : "bg-rose-soft text-rose"
            )}
          >
            {positive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
      <p className="mt-4 font-display text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-0.5 text-[13px] text-muted-foreground">{label}</p>
      {deltaLabel && <p className="mt-2 text-[11px] text-muted-foreground/70">{deltaLabel}</p>}
    </Card>
  );
}
