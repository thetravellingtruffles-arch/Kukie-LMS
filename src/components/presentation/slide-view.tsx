import type { Pillar, Slide } from "@/lib/types";
import { PILLARS } from "@/lib/curriculum/pillars";
import { SLIDES } from "@/lib/curriculum/slides";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { KukieLogo, KukieMark } from "@/components/brand/logo";

const YEAR_LABEL = "KÜKIE ACADEMY 2026";

export function SlideView({
  slide,
  pillars = PILLARS,
  totalSlides = SLIDES.length,
  courseLabel = "SALES BUILD-UP EXCELLENCE",
}: {
  slide: Slide;
  pillars?: Pillar[];
  totalSlides?: number;
  courseLabel?: string;
}) {
  const COURSE_LABEL = courseLabel.toUpperCase();
  const pillar = slide.pillarId ? pillars.find((p) => p.id === slide.pillarId) : undefined;

  // ---------------- COVER ----------------
  if (slide.type === "cover") {
    return (
      <Frame dark>
        <div className="flex items-start justify-between">
          <KukieLogo dark />
          <p className="max-w-[220px] text-right text-[9px] leading-relaxed text-white/40">
            Confidential &amp; Internal Use Only. Property of Kükie Pro.
            Not for external distribution.
          </p>
        </div>

        <div className="mt-auto">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">{slide.eyebrow}</p>
          <h1 className="mt-4 font-display text-5xl font-extrabold uppercase leading-[1.02] tracking-tight sm:text-6xl">
            {slide.title}
          </h1>
          {slide.subtitle && (
            <p className="mt-4 max-w-2xl text-lg italic text-white/70">{slide.subtitle}</p>
          )}
        </div>

        <BrandFooter dark left="VERSION 1.0 · MODULE 001" right={YEAR_LABEL} />
      </Frame>
    );
  }

  // ---------------- CLOSING ----------------
  if (slide.type === "closing") {
    return (
      <Frame dark>
        <div className="flex items-start justify-between">
          <KukieLogo dark />
        </div>

        <div className="mt-auto">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">Module 001 Complete</p>
          <h1 className="mt-4 font-display text-4xl font-extrabold uppercase leading-[1.05] tracking-tight sm:text-5xl">
            {slide.title}
          </h1>
          {slide.subtitle && <p className="mt-4 max-w-xl text-sm text-white/60">{slide.subtitle}</p>}
        </div>

        <BrandFooter dark left={COURSE_LABEL} right={YEAR_LABEL} />
      </Frame>
    );
  }

  // ---------------- PILLAR / SECTION DIVIDER ----------------
  if (slide.type === "pillar-intro" && pillar) {
    return (
      <Frame dark>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <KukieMark dark className="size-8 text-[11px]" />
            <span className="font-display text-sm font-bold uppercase tracking-tight text-white">KÜKIE</span>
          </div>
          <span className="font-display text-[110px] font-extrabold leading-none tracking-tight text-white sm:text-[140px]">
            {String(pillar.index).padStart(2, "0")}
          </span>
        </div>

        <div className="mt-auto">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">{slide.eyebrow}</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold uppercase leading-[1.05] tracking-tight sm:text-5xl">
            {slide.title}
          </h1>
          {slide.subtitle && <p className="mt-3 max-w-xl text-sm text-white/60 sm:text-base">{slide.subtitle}</p>}
        </div>

        <BrandFooter dark left={`${COURSE_LABEL} WORKBOOK`} right={YEAR_LABEL} />
      </Frame>
    );
  }

  // ---------------- WHITE CONTENT SLIDES ----------------
  return (
    <Frame>
      <SlideHeader slide={slide} pillar={pillar} />

      {slide.type === "concept" && slide.bullets && (
        <div className="mt-8 flex w-full flex-col divide-y divide-border">
          {slide.bullets.map((b, i) => (
            <p key={i} className="py-3 text-[16px] font-semibold leading-snug first:pt-0">
              {b}
            </p>
          ))}
        </div>
      )}

      {slide.type === "framework" && slide.framework && (
        <div className="mt-8 w-full">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Framework</p>
          <p className="mt-1 font-display text-xl font-extrabold uppercase tracking-tight">{slide.framework.name}</p>
          <div className="mt-5 flex flex-col divide-y divide-border">
            {slide.framework.steps.map((s, i) => (
              <div key={i} className="flex gap-4 py-3.5 first:pt-0">
                <span className="font-display text-sm font-extrabold text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                <p className="text-[15px] leading-snug">
                  <span className="font-bold">{s.title}</span>
                  <span className="text-muted-foreground"> — {s.body}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {slide.type === "stat" && slide.stat && (
        <div className="mt-6 flex w-full flex-1 flex-col justify-center">
          <p className="font-display text-7xl font-extrabold tracking-tight text-foreground sm:text-8xl">{slide.stat.value}</p>
          <p className="mt-4 text-base font-bold uppercase tracking-tight">{slide.stat.label}</p>
          {slide.stat.caption && <p className="mt-2 max-w-md text-sm text-muted-foreground">{slide.stat.caption}</p>}
        </div>
      )}

      {slide.type === "scenario" && slide.scenario && (
        <div className="mt-8 w-full">
          <p className="text-[13px] italic text-muted-foreground">{slide.scenario.setup}</p>
          <div className="mt-5 flex flex-col divide-y divide-border">
            {slide.scenario.lines.map((l, i) => (
              <div key={i} className="py-3 first:pt-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{l.speaker}</p>
                <p className="mt-1 text-[15px] font-medium leading-snug">{l.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {slide.type === "quote" && slide.quote && (
        <div className="mt-8 flex w-full flex-1 flex-col justify-center">
          <p className="max-w-2xl font-display text-3xl font-bold leading-snug">&ldquo;{slide.quote.text}&rdquo;</p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">— {slide.quote.author}</p>
        </div>
      )}

      {slide.type === "checklist" && slide.checklist && (
        <div className="mt-8 grid w-full grid-cols-1 gap-8 sm:grid-cols-2 sm:divide-x sm:divide-border">
          <div className="sm:pr-8">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em]">
              <Check className="size-3.5" strokeWidth={3} /> Do
            </p>
            <ul className="mt-3 flex flex-col divide-y divide-border">
              {slide.checklist.dos.map((d, i) => (
                <li key={i} className="py-2.5 text-[14px] leading-snug first:pt-0">{d}</li>
              ))}
            </ul>
          </div>
          <div className="sm:pl-8">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
              <X className="size-3.5" strokeWidth={3} /> Don&apos;t
            </p>
            <ul className="mt-3 flex flex-col divide-y divide-border">
              {slide.checklist.donts.map((d, i) => (
                <li key={i} className="py-2.5 text-[14px] leading-snug text-muted-foreground first:pt-0">{d}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <BrandFooter left={(pillar?.shortName ?? "OVERVIEW").toUpperCase()} right={`${slide.index} · ${totalSlides}`} />
    </Frame>
  );
}

function SlideHeader({ slide, pillar }: { slide: Slide; pillar?: Pillar }) {
  return (
    <div className="w-full">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {pillar ? `Pillar ${pillar.index} · ${pillar.shortName}` : "The following covers:"}
      </p>
      <h2 className="mt-2 font-display text-2xl font-extrabold uppercase leading-tight tracking-tight sm:text-[28px]">
        {slide.title}
      </h2>
      {slide.subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{slide.subtitle}</p>}
    </div>
  );
}

function BrandFooter({ left, right, dark }: { left: string; right: string; dark?: boolean }) {
  return (
    <div
      className={cn(
        "mt-auto flex items-center justify-between border-t pt-3 text-[10px] font-semibold uppercase tracking-[0.14em]",
        dark ? "border-white/25 text-white/45" : "border-border text-muted-foreground"
      )}
    >
      <span>{left}</span>
      <span>{right}</span>
    </div>
  );
}

function Frame({ dark, children }: { dark?: boolean; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col gap-0 rounded-[10px] border p-8 sm:p-12",
        dark ? "border-[#183135] bg-[#183135] text-[#ede8e4]" : "border-border bg-surface text-foreground"
      )}
    >
      {children}
    </div>
  );
}
