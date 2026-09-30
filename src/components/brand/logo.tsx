import { cn } from "@/lib/utils";

/**
 * The Ü mark — Kükie's "soul". Two dots as eyes, treated as a rounded-square
 * app-icon badge exactly per the brand manual. `dark` = mark is being placed
 * on a dark/green surface (sidebar), so it flips to the light "on cream"
 * variant for contrast; otherwise it renders the standard green-badge mark.
 */
export function KukieMark({ className, dark }: { className?: string; dark?: boolean }) {
  return (
    <div
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-[24%] font-display text-[22px] font-bold leading-none",
        dark ? "bg-[#ede8e4] text-[#183135]" : "bg-[#183135] text-[#ede8e4]",
        className
      )}
    >
      Ü
    </div>
  );
}

/**
 * Compact lockup for chrome (sidebar, topbar). Ü mark + wordmark + a small
 * "ACADEMY" tag in gold — signals this is the L&D section of Kükie Pro.
 */
export function KukieLogo({ className, dark }: { className?: string; dark?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <KukieMark dark={dark} className="size-8 text-[17px]" />
      <div className="flex flex-col leading-none">
        <span className={cn("font-display text-[18px] font-bold leading-none tracking-tight", dark ? "text-[#ede8e4]" : "text-foreground")}>
          Kükie
        </span>
        <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-gold">
          Academy
        </span>
      </div>
    </div>
  );
}

/**
 * Full formal lockup — wordmark + subtitle — for cover slides, the login
 * screen and the certificate, matching the brand manual's title-card style.
 */
export function KukieWordmark({
  className,
  dark = true,
  subtitle = "Learning & Development",
}: {
  className?: string;
  dark?: boolean;
  subtitle?: string;
}) {
  return (
    <div className={cn("inline-flex flex-col items-center", className)}>
      <KukieMark dark={dark} className="mb-4 size-14 text-[30px]" />
      <span
        className={cn(
          "font-display text-[40px] font-bold leading-none tracking-tight",
          dark ? "text-[#ede8e4]" : "text-foreground"
        )}
      >
        Kükie
      </span>
      <span
        className={cn(
          "mt-2 text-[11px] font-semibold uppercase tracking-[0.28em]",
          dark ? "text-[#ede8e4]/60" : "text-foreground/60"
        )}
      >
        {subtitle}
      </span>
    </div>
  );
}
