import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-[var(--radius-sm)] border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide w-fit whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-brand-soft text-brand border-transparent",
        secondary: "bg-surface-muted text-foreground border-border",
        outline: "border-border text-foreground bg-transparent",
        success: "bg-emerald-soft text-emerald border-transparent",
        warning: "bg-amber-soft text-amber border-transparent",
        danger: "bg-rose-soft text-rose border-transparent",
        violet: "bg-violet-soft text-violet border-transparent",
        sky: "bg-sky-soft text-sky border-transparent",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export { Badge, badgeVariants };
