"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toTrainerMeta, trainerById, storeMeta } from "@/lib/scheduling/trainer-meta";
import { useOrgData } from "@/lib/scheduling/use-org-data";
import { fetchAllSessions } from "@/lib/scheduling/queries";
import type { TrainingSession } from "@/lib/scheduling/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SessionDialog } from "./session-dialog";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function monthGrid(anchor: Date) {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const first = new Date(year, month, 1);
  const firstDow = first.getDay() === 0 ? 7 : first.getDay(); // 1=Mon..7=Sun
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - (firstDow - 1));

  const last = new Date(year, month + 1, 0);
  const lastDow = last.getDay() === 0 ? 7 : last.getDay();
  const gridEnd = new Date(last);
  gridEnd.setDate(last.getDate() + (7 - lastDow));

  const days: Date[] = [];
  const cursor = new Date(gridStart);
  while (cursor <= gridEnd) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

const STATUS_DIM: Record<TrainingSession["status"], string> = {
  pending: "border-dashed opacity-80",
  confirmed: "",
  completed: "opacity-60",
  declined: "opacity-40 line-through",
  cancelled: "opacity-40 line-through",
};

export function CalendarClient() {
  const [anchor, setAnchor] = React.useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const { regions, stores, trainers: orgTrainers } = useOrgData();
  const trainers = React.useMemo(() => toTrainerMeta(orgTrainers), [orgTrainers]);
  const [sessions, setSessions] = React.useState<TrainingSession[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [regionId, setRegionId] = React.useState("all");
  const [storeId, setStoreId] = React.useState("all");
  const [trainerId, setTrainerId] = React.useState("all");
  const [active, setActive] = React.useState<TrainingSession | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const load = React.useCallback(() => {
    setLoading(true);
    fetchAllSessions()
      .then(setSessions)
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const days = React.useMemo(() => monthGrid(anchor), [anchor]);

  const filtered = React.useMemo(() => {
    return sessions.filter((s) => {
      if (regionId !== "all" && s.region_id !== regionId) return false;
      if (storeId !== "all" && s.store_id !== storeId) return false;
      if (trainerId !== "all" && s.trainer_id !== trainerId && s.preferred_trainer_id !== trainerId) return false;
      return true;
    });
  }, [sessions, regionId, storeId, trainerId]);

  const byDate = React.useMemo(() => {
    const map = new Map<string, TrainingSession[]>();
    for (const s of filtered) {
      const key = s.session_date ?? s.preferred_week_start; // pending/unmatched land on the Monday of their preferred week
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return map;
  }, [filtered]);

  const filteredStores = regionId === "all" ? stores : stores.filter((s) => s.regionId === regionId);
  const monthLabel = anchor.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const today = isoDate(new Date());

  function openSession(s: TrainingSession) {
    setActive(s);
    setDialogOpen(true);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setAnchor((a) => new Date(a.getFullYear(), a.getMonth() - 1, 1))}>
            <ChevronLeft />
          </Button>
          <p className="w-40 text-center font-display text-base font-extrabold uppercase tracking-tight">{monthLabel}</p>
          <Button variant="outline" size="icon" onClick={() => setAnchor((a) => new Date(a.getFullYear(), a.getMonth() + 1, 1))}>
            <ChevronRight />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setAnchor(() => { const d = new Date(); d.setDate(1); return d; })}>
            Today
          </Button>
          {loading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={regionId} onValueChange={(v) => { setRegionId(v); setStoreId("all"); }}>
            <SelectTrigger className="h-9 w-36"><SelectValue placeholder="Region" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regions.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={storeId} onValueChange={setStoreId}>
            <SelectTrigger className="h-9 w-40"><SelectValue placeholder="Store" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stores</SelectItem>
              {filteredStores.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={trainerId} onValueChange={setTrainerId}>
            <SelectTrigger className="h-9 w-40"><SelectValue placeholder="Trainer" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Trainers</SelectItem>
              {trainers.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-3 flex flex-wrap items-center gap-4">
        {trainers.map((t) => (
          <span key={t.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2.5 rounded-full" style={{ background: t.colorVar }} />
            {t.name}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-2.5 rounded-full border border-dashed border-muted-foreground" /> Pending / unmatched
        </span>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="grid grid-cols-7 bg-foreground text-background">
          {DAY_LABELS.map((d) => (
            <div key={d} className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide">
              {d.slice(0, 3)}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((d, i) => {
            const key = isoDate(d);
            const inMonth = d.getMonth() === anchor.getMonth();
            const daySessions = byDate.get(key) ?? [];
            const isToday = key === today;
            return (
              <div
                key={i}
                className={cn(
                  "min-h-[112px] border-b border-r border-border p-2",
                  (i + 1) % 7 === 0 && "border-r-0",
                  !inMonth && "bg-surface-muted/40"
                )}
              >
                <p className={cn("text-right text-[11px]", inMonth ? "text-foreground" : "text-muted-foreground/50", isToday && "font-extrabold")}>
                  {isToday ? <span className="rounded-full bg-foreground px-1.5 py-0.5 text-background">{d.getDate()}</span> : d.getDate()}
                </p>
                <div className="mt-1 flex flex-col gap-1">
                  {daySessions.slice(0, 3).map((s) => {
                    const trainer = trainerById(trainers, s.trainer_id ?? s.preferred_trainer_id ?? undefined);
                    const store = storeMeta(stores, s.store_id);
                    return (
                      <button
                        key={s.id}
                        onClick={() => openSession(s)}
                        className={cn(
                          "flex items-center gap-1 truncate rounded-[4px] border px-1.5 py-1 text-left text-[10px] font-semibold",
                          STATUS_DIM[s.status]
                        )}
                        style={{
                          borderColor: trainer?.colorVar ?? "var(--border-strong)",
                          color: trainer?.colorVar ?? "var(--muted-foreground)",
                        }}
                      >
                        <span className="size-1.5 shrink-0 rounded-full" style={{ background: trainer?.colorVar ?? "var(--border-strong)" }} />
                        <span className="truncate text-foreground">{store?.code ?? s.store_id}</span>
                        {s.start_time && <span className="shrink-0 opacity-70">{s.start_time.slice(0, 5)}</span>}
                      </button>
                    );
                  })}
                  {daySessions.length > 3 && (
                    <p className="text-[10px] font-medium text-muted-foreground">+{daySessions.length - 3} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <SessionDialog
        session={active}
        trainers={trainers}
        stores={stores}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onUpdated={(updated) => {
          setSessions((list) => list.map((s) => (s.id === updated.id ? updated : s)));
        }}
      />
    </div>
  );
}
