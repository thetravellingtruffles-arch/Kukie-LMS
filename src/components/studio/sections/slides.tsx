"use client";

import * as React from "react";
import { Plus, Trash2, ChevronUp, ChevronDown, GalleryHorizontal } from "lucide-react";
import { createSlide, updateSlide, deleteSlide, type SlideInput } from "@/lib/studio/queries";
import type { Slide, SlideType } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { StudioActions, StudioData } from "../builder-shell";

const SLIDE_TYPES: SlideType[] = ["cover", "pillar-intro", "concept", "framework", "stat", "scenario", "quote", "checklist", "closing"];

export function SlidesSection({ data, actions }: { data: StudioData; actions: StudioActions }) {
  const { slides, pillars } = data;
  const [adding, setAdding] = React.useState(false);

  async function addSlide(pillarId: string | null) {
    await createSlide(data.course.id, {
      pillarId,
      index: slides.length + 1,
      type: "concept",
      title: "New slide",
      bullets: [],
      notes: "",
      durationMin: 2,
    });
    setAdding(false);
    actions.refresh();
  }

  async function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= slides.length) return;
    const a = slides[i], b = slides[j];
    await Promise.all([updateSlide(a.id, { index: b.index }), updateSlide(b.id, { index: a.index })]);
    actions.refresh();
  }

  if (slides.length === 0 && pillars.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 p-10 text-center text-sm text-muted-foreground">
          <GalleryHorizontal className="size-6" />
          Add at least one pillar first (Pillars / Structure section) so slides have somewhere to live — or add a slide with no pillar for cover/closing content.
          <Button size="sm" className="mt-2" onClick={() => addSlide(null)}>
            <Plus className="size-3.5" /> Add First Slide
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Slides</CardTitle>
        <CardDescription>Page 15 onward — the presentation content, one slide at a time.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {slides.map((s, i) => (
          <SlideRow
            key={s.id}
            slide={s}
            pillars={pillars}
            onMoveUp={() => move(i, -1)}
            onMoveDown={() => move(i, 1)}
            onSaved={actions.refresh}
            first={i === 0}
            last={i === slides.length - 1}
          />
        ))}

        {adding ? (
          <div className="flex flex-wrap items-center gap-2 rounded-[var(--radius-md)] border border-dashed border-border p-3">
            <span className="text-xs text-muted-foreground">Add to pillar:</span>
            <Button size="sm" variant="outline" onClick={() => addSlide(null)}>No pillar (cover/closing)</Button>
            {pillars.map((p) => (
              <Button key={p.id} size="sm" variant="outline" onClick={() => addSlide(p.id)}>{p.shortName}</Button>
            ))}
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" className="w-fit" onClick={() => setAdding(true)}>
            <Plus className="size-3.5" /> Add Slide
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function SlideRow({
  slide, pillars, onMoveUp, onMoveDown, onSaved, first, last,
}: {
  slide: Slide;
  pillars: StudioData["pillars"];
  onMoveUp: () => void;
  onMoveDown: () => void;
  onSaved: () => void;
  first: boolean;
  last: boolean;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const pillar = pillars.find((p) => p.id === slide.pillarId);

  async function patch(input: Partial<SlideInput>) {
    await updateSlide(slide.id, input);
    onSaved();
  }
  async function remove() {
    await deleteSlide(slide.id);
    onSaved();
  }

  return (
    <div className="rounded-[var(--radius-md)] border border-border p-3">
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <button disabled={first} onClick={onMoveUp} className="disabled:opacity-30"><ChevronUp className="size-3.5" /></button>
          <button disabled={last} onClick={onMoveDown} className="disabled:opacity-30"><ChevronDown className="size-3.5" /></button>
        </div>
        <Badge variant="outline">{slide.type}</Badge>
        <button className="flex-1 text-left" onClick={() => setExpanded((e) => !e)}>
          <p className="text-sm font-semibold">{slide.title || "Untitled slide"}</p>
          <p className="text-xs text-muted-foreground">{pillar ? pillar.shortName : "No pillar"} · {slide.durationMin} min</p>
        </button>
        <Button variant="ghost" size="icon" onClick={remove}><Trash2 className="size-4" /></Button>
      </div>

      {expanded && (
        <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Type</Label>
              <Select value={slide.type} onValueChange={(v) => patch({ type: v as SlideType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SLIDE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Pillar</Label>
              <Select value={slide.pillarId ?? "none"} onValueChange={(v) => patch({ pillarId: v === "none" ? null : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No pillar</SelectItem>
                  {pillars.map((p) => <SelectItem key={p.id} value={p.id}>{p.shortName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Input defaultValue={slide.eyebrow ?? ""} placeholder="Eyebrow (small label above title)" onBlur={(e) => e.target.value !== (slide.eyebrow ?? "") && patch({ eyebrow: e.target.value })} />
          <Input defaultValue={slide.title} placeholder="Title" onBlur={(e) => e.target.value !== slide.title && patch({ title: e.target.value })} />
          <Input defaultValue={slide.subtitle ?? ""} placeholder="Subtitle" onBlur={(e) => e.target.value !== (slide.subtitle ?? "") && patch({ subtitle: e.target.value })} />

          {slide.type === "concept" && (
            <LinesField label="Bullets (one per line)" value={slide.bullets ?? []} onSave={(v) => patch({ bullets: v })} />
          )}

          {slide.type === "framework" && (
            <div className="flex flex-col gap-1.5">
              <Label>Framework name</Label>
              <Input
                defaultValue={slide.framework?.name ?? ""}
                onBlur={(e) => patch({ framework: { name: e.target.value, steps: slide.framework?.steps ?? [] } })}
              />
              <Label className="mt-2">Steps — one per line, "Title | Body"</Label>
              <Textarea
                rows={4}
                defaultValue={(slide.framework?.steps ?? []).map((s) => `${s.title} | ${s.body}`).join("\n")}
                onBlur={(e) => {
                  const steps = e.target.value.split("\n").filter(Boolean).map((line) => {
                    const [title, ...rest] = line.split("|");
                    return { title: title.trim(), body: rest.join("|").trim() };
                  });
                  patch({ framework: { name: slide.framework?.name ?? "", steps } });
                }}
              />
            </div>
          )}

          {slide.type === "stat" && (
            <div className="grid grid-cols-3 gap-2">
              <Input defaultValue={slide.stat?.value ?? ""} placeholder="Value (e.g. +12%)" onBlur={(e) => patch({ stat: { value: e.target.value, label: slide.stat?.label ?? "", caption: slide.stat?.caption } })} />
              <Input defaultValue={slide.stat?.label ?? ""} placeholder="Label" onBlur={(e) => patch({ stat: { value: slide.stat?.value ?? "", label: e.target.value, caption: slide.stat?.caption } })} />
              <Input defaultValue={slide.stat?.caption ?? ""} placeholder="Caption (optional)" onBlur={(e) => patch({ stat: { value: slide.stat?.value ?? "", label: slide.stat?.label ?? "", caption: e.target.value } })} />
            </div>
          )}

          {slide.type === "scenario" && (
            <div className="flex flex-col gap-1.5">
              <Label>Setup</Label>
              <Textarea rows={2} defaultValue={slide.scenario?.setup ?? ""} onBlur={(e) => patch({ scenario: { setup: e.target.value, lines: slide.scenario?.lines ?? [] } })} />
              <Label className="mt-2">Lines — one per line, "Speaker: Text"</Label>
              <Textarea
                rows={4}
                defaultValue={(slide.scenario?.lines ?? []).map((l) => `${l.speaker}: ${l.text}`).join("\n")}
                onBlur={(e) => {
                  const lines = e.target.value.split("\n").filter(Boolean).map((line) => {
                    const [speaker, ...rest] = line.split(":");
                    return { speaker: speaker.trim(), text: rest.join(":").trim() };
                  });
                  patch({ scenario: { setup: slide.scenario?.setup ?? "", lines } });
                }}
              />
            </div>
          )}

          {slide.type === "quote" && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_200px]">
              <Textarea rows={2} defaultValue={slide.quote?.text ?? ""} placeholder="Quote text" onBlur={(e) => patch({ quote: { text: e.target.value, author: slide.quote?.author ?? "" } })} />
              <Input defaultValue={slide.quote?.author ?? ""} placeholder="Author" onBlur={(e) => patch({ quote: { text: slide.quote?.text ?? "", author: e.target.value } })} />
            </div>
          )}

          {slide.type === "checklist" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <LinesField label="Do (one per line)" value={slide.checklist?.dos ?? []} onSave={(v) => patch({ checklist: { dos: v, donts: slide.checklist?.donts ?? [] } })} />
              <LinesField label="Don't (one per line)" value={slide.checklist?.donts ?? []} onSave={(v) => patch({ checklist: { dos: slide.checklist?.dos ?? [], donts: v } })} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Duration (min)</Label>
              <Input type="number" min={1} defaultValue={slide.durationMin} onBlur={(e) => patch({ durationMin: Number(e.target.value) || 1 })} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Trainer notes</Label>
            <Textarea rows={2} defaultValue={slide.notes} onBlur={(e) => e.target.value !== slide.notes && patch({ notes: e.target.value })} />
          </div>
        </div>
      )}
    </div>
  );
}

function LinesField({ label, value, onSave }: { label: string; value: string[]; onSave: (v: string[]) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <Textarea
        rows={4}
        defaultValue={value.join("\n")}
        onBlur={(e) => onSave(e.target.value.split("\n").map((l) => l.trim()).filter(Boolean))}
      />
    </div>
  );
}
