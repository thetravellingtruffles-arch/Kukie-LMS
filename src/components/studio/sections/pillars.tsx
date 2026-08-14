"use client";

import * as React from "react";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { createPillar, updatePillar, deletePillar } from "@/lib/studio/queries";
import type { Pillar } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PILLAR_BADGE_VARIANT } from "@/lib/curriculum/pillar-colors";
import type { StudioActions, StudioData } from "../builder-shell";

const COLORS: Pillar["color"][] = ["brand", "amber", "emerald", "rose", "violet", "sky"];

export function PillarsSection({ data, actions }: { data: StudioData; actions: StudioActions }) {
  const [pillars, setPillars] = React.useState(data.pillars);
  React.useEffect(() => setPillars(data.pillars), [data.pillars]);
  const [adding, setAdding] = React.useState(false);
  const [name, setName] = React.useState("");

  async function add() {
    if (!name.trim()) return;
    await createPillar(data.course.id, {
      index: pillars.length + 1,
      name,
      shortName: name.split(" ").slice(0, 2).join(" "),
      color: COLORS[pillars.length % COLORS.length],
    });
    setName("");
    setAdding(false);
    actions.refresh();
  }

  async function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= pillars.length) return;
    const a = pillars[i], b = pillars[j];
    await Promise.all([updatePillar(a.id, { index: b.index }), updatePillar(b.id, { index: a.index })]);
    actions.refresh();
  }

  async function remove(id: string) {
    await deletePillar(id);
    actions.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pillars / Structure</CardTitle>
        <CardDescription>Page 4 — the sections this module is organized around. Six is typical, not required.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {pillars.map((p, i) => (
          <PillarRow key={p.id} pillar={p} onMoveUp={() => move(i, -1)} onMoveDown={() => move(i, 1)} onRemove={() => remove(p.id)} onSaved={actions.refresh} first={i === 0} last={i === pillars.length - 1} />
        ))}

        {adding ? (
          <div className="flex items-center gap-2">
            <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Pillar name…" onKeyDown={(e) => e.key === "Enter" && add()} />
            <Button size="sm" onClick={add}>Add</Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" className="w-fit" onClick={() => setAdding(true)}>
            <Plus className="size-3.5" /> Add Pillar
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function PillarRow({
  pillar, onMoveUp, onMoveDown, onRemove, onSaved, first, last,
}: {
  pillar: Pillar; onMoveUp: () => void; onMoveDown: () => void; onRemove: () => void; onSaved: () => void; first: boolean; last: boolean;
}) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="rounded-[var(--radius-md)] border border-border p-3">
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <button disabled={first} onClick={onMoveUp} className="disabled:opacity-30"><ChevronUp className="size-3.5" /></button>
          <button disabled={last} onClick={onMoveDown} className="disabled:opacity-30"><ChevronDown className="size-3.5" /></button>
        </div>
        <Badge variant={PILLAR_BADGE_VARIANT[pillar.color]}>{pillar.index}</Badge>
        <button className="flex-1 text-left" onClick={() => setExpanded((e) => !e)}>
          <p className="text-sm font-semibold">{pillar.name}</p>
          <p className="text-xs text-muted-foreground">{pillar.shortName}</p>
        </button>
        <Button variant="ghost" size="icon" onClick={onRemove}><Trash2 className="size-4" /></Button>
      </div>

      {expanded && (
        <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
          <Input
            defaultValue={pillar.name}
            onBlur={async (e) => { if (e.target.value !== pillar.name) { await updatePillar(pillar.id, { name: e.target.value }); onSaved(); } }}
            placeholder="Full name"
          />
          <Input
            defaultValue={pillar.shortName}
            onBlur={async (e) => { if (e.target.value !== pillar.shortName) { await updatePillar(pillar.id, { shortName: e.target.value }); onSaved(); } }}
            placeholder="Short name (for nav/footer)"
          />
          <Textarea
            defaultValue={pillar.description}
            rows={2}
            onBlur={async (e) => { if (e.target.value !== pillar.description) { await updatePillar(pillar.id, { description: e.target.value }); onSaved(); } }}
            placeholder="What this pillar covers…"
          />
        </div>
      )}
    </div>
  );
}
