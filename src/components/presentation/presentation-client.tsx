"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Maximize, Minimize, NotebookText, Clock, PlayCircle, PauseCircle,
} from "lucide-react";
import { SLIDES, TOTAL_SLIDE_MINUTES } from "@/lib/curriculum/slides";
import { PILLARS } from "@/lib/curriculum/pillars";
import { PILLAR_BG_SOLID } from "@/lib/curriculum/pillar-colors";
import { SlideView } from "./slide-view";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { Pillar, Slide } from "@/lib/types";

function fmtTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function PresentationClient({
  slides = SLIDES,
  pillars = PILLARS,
  totalMinutes = TOTAL_SLIDE_MINUTES,
  courseLabel,
}: {
  slides?: Slide[];
  pillars?: Pillar[];
  totalMinutes?: number;
  courseLabel?: string;
}) {
  const [index, setIndex] = React.useState(0);
  const [showNotes, setShowNotes] = React.useState(true);
  const [running, setRunning] = React.useState(true);
  const [elapsed, setElapsed] = React.useState(0);
  const [fullscreen, setFullscreen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const slide = slides[index];
  const total = slides.length;

  React.useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const goto = React.useCallback((i: number) => {
    setIndex(Math.max(0, Math.min(total - 1, i)));
  }, [total]);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") goto(index + 1);
      if (e.key === "ArrowLeft") goto(index - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, goto]);

  function toggleFullscreen() {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
      setFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setFullscreen(false);
    }
  }

  const targetSeconds = Math.round(totalMinutes * 60);
  const pacing = elapsed <= targetSeconds ? "on pace" : "behind pace";

  return (
    <div ref={containerRef} className="flex h-[calc(100vh-64px)] flex-col bg-background lg:h-[calc(100vh-64px)]">
      <Progress value={((index + 1) / total) * 100} className="h-1 rounded-none" />

      <div className="flex min-h-0 flex-1">
        {/* Thumbnails */}
        <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-border p-3 lg:block">
          {pillars.map((p) => {
            const slidesForPillar = slides.filter((s) => s.pillarId === p.id);
            if (!slidesForPillar.length) return null;
            return (
              <div key={p.id} className="mb-3">
                <p className="px-1 pb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Pillar {p.index} · {p.shortName}
                </p>
                <div className="flex flex-col gap-1">
                  {slidesForPillar.map((s) => {
                    const i = slides.findIndex((x) => x.id === s.id);
                    const active = i === index;
                    return (
                      <button
                        key={s.id}
                        onClick={() => goto(i)}
                        className={cn(
                          "flex items-center gap-2 rounded-[8px] px-2 py-1.5 text-left text-[12px] transition-colors",
                          active ? "bg-brand-soft text-brand font-medium" : "text-muted-foreground hover:bg-surface-muted"
                        )}
                      >
                        <span className={cn("h-4 w-1 shrink-0 rounded-full", PILLAR_BG_SOLID[p.color])} />
                        <span className="truncate">{i + 1}. {s.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {slides.filter((s) => !s.pillarId).map((s) => {
            const i = slides.findIndex((x) => x.id === s.id);
            const active = i === index;
            return (
              <button
                key={s.id}
                onClick={() => goto(i)}
                className={cn(
                  "mb-1 flex w-full items-center gap-2 rounded-[8px] px-2 py-1.5 text-left text-[12px] transition-colors",
                  active ? "bg-brand-soft text-brand font-medium" : "text-muted-foreground hover:bg-surface-muted"
                )}
              >
                <span className="h-4 w-1 shrink-0 rounded-full bg-foreground/40" />
                <span className="truncate">{i + 1}. {s.title}</span>
              </button>
            );
          })}
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="mx-auto h-full max-w-4xl"
              >
                <SlideView slide={slide} pillars={pillars} totalSlides={total} courseLabel={courseLabel} />
              </motion.div>
            </AnimatePresence>
          </div>

          {showNotes && (
            <div className="border-t border-border bg-surface-muted/60 px-6 py-3">
              <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <NotebookText className="size-3.5" /> Speaker Notes
              </p>
              <p className="text-[13px] leading-snug text-foreground/80">{slide.notes}</p>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => goto(index - 1)} disabled={index === 0}>
                <ChevronLeft />
              </Button>
              <Button variant="outline" size="icon" onClick={() => goto(index + 1)} disabled={index === total - 1}>
                <ChevronRight />
              </Button>
              <span className="ml-1 text-xs text-muted-foreground">
                Slide <span className="font-semibold text-foreground">{index + 1}</span> / {total}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setRunning((r) => !r)}
                className="flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                {running ? <PauseCircle className="size-3.5" /> : <PlayCircle className="size-3.5" />}
                <Clock className="size-3.5" />
                {fmtTime(elapsed)}
                <span className="hidden text-[10px] opacity-60 sm:inline">· {pacing}</span>
              </button>

              <Button variant={showNotes ? "secondary" : "ghost"} size="sm" onClick={() => setShowNotes((s) => !s)}>
                <NotebookText className="size-3.5" /> Notes
              </Button>

              <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                {fullscreen ? <Minimize /> : <Maximize />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
