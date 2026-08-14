"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  onChange,
  max = 5,
}: {
  value: number;
  onChange: (v: number) => void;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i + 1 <= value;
        return (
          <button key={i} type="button" onClick={() => onChange(i + 1)} className="p-0.5">
            <Star className={cn("size-5 transition-colors", filled ? "fill-amber text-amber" : "text-border-strong")} />
          </button>
        );
      })}
    </div>
  );
}
