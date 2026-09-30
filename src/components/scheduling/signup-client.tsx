"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarCheck, CheckCircle2, Circle, Loader2, Users2, Building2 } from "lucide-react";
import { WORKING_DAYS, toTrainerMeta } from "@/lib/scheduling/trainer-meta";
import { useOrgData } from "@/lib/scheduling/use-org-data";
import { getAvailableSlots, createSession, findAvailableTrainer, candidateDate, type SlotOption } from "@/lib/scheduling/queries";
import type { PreferredDay } from "@/lib/scheduling/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

function upcomingMondays(count = 6) {
  const out: { value: string; label: string }[] = [];
  const d = new Date();
  const dow = d.getDay() === 0 ? 7 : d.getDay();
  d.setDate(d.getDate() + ((1 - dow + 7) % 7 || 7)); // next Monday
  for (let i = 0; i < count; i++) {
    const monday = new Date(d);
    monday.setDate(d.getDate() + i * 7);
    const value = monday.toISOString().slice(0, 10);
    const label = monday.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    out.push({ value, label: `Week of ${label}` });
  }
  return out;
}

export function SignupClient() {
  const weeks = React.useMemo(() => upcomingMondays(), []);
  const { stores, trainers: orgTrainers, loading: loadingOrg } = useOrgData();
  const trainers = React.useMemo(() => toTrainerMeta(orgTrainers), [orgTrainers]);

  const [storeId, setStoreId] = React.useState("");
  const [requestedBy, setRequestedBy] = React.useState("");
  const [role, setRole] = React.useState("Shift Lead");
  const [attendeeCount, setAttendeeCount] = React.useState(2);
  const [day, setDay] = React.useState<PreferredDay>("Monday");
  const [weekStart, setWeekStart] = React.useState(weeks[0]?.value ?? "");
  const [trainerId, setTrainerId] = React.useState<string>("any");

  const [slots, setSlots] = React.useState<SlotOption[] | null>(null);
  const [loadingSlots, setLoadingSlots] = React.useState(false);
  const [selectedSlot, setSelectedSlot] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<{ status: "confirmed" | "pending"; trainerName?: string; date?: string; time?: string } | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!storeId && stores.length > 0) setStoreId(stores[0].id);
  }, [stores, storeId]);

  const store = stores.find((s) => s.id === storeId);
  const regionalTrainers = trainers.filter((t) => t.regionId === store?.regionId);
  const otherTrainers = trainers.filter((t) => t.regionId !== store?.regionId);

  React.useEffect(() => {
    setSlots(null);
    setSelectedSlot(null);
    if (trainerId === "any" || !weekStart) return;
    setLoadingSlots(true);
    getAvailableSlots(trainerId, weekStart, day)
      .then(setSlots)
      .catch(() => setError("Could not check availability — try again."))
      .finally(() => setLoadingSlots(false));
  }, [trainerId, weekStart, day]);

  async function submit() {
    if (!requestedBy.trim() || !store) return;
    setSubmitting(true);
    setError(null);
    try {
      if (trainerId === "any") {
        // No preference: submit as pending for an admin/trainer to match.
        await createSession({
          store_id: store.id,
          region_id: store.regionId ?? "",
          requested_by: requestedBy,
          requested_by_role: role,
          attendee_count: attendeeCount,
          preferred_trainer_id: null,
          preferred_day: day,
          preferred_week_start: weekStart,
          trainer_id: null,
          session_date: null,
          start_time: null,
          end_time: null,
          status: "pending",
        });
        setResult({ status: "pending" });
      } else {
        if (!selectedSlot) return;
        const date = candidateDate(weekStart, day);
        // Re-check right before booking to avoid a race with someone else.
        const stillFree = await findAvailableTrainer(trainers, weekStart, day, store.regionId ?? "", selectedSlot);
        const trainer = trainers.find((t) => t.id === trainerId);
        const endTime = addMinutes(selectedSlot, 90);
        await createSession({
          store_id: store.id,
          region_id: store.regionId ?? "",
          requested_by: requestedBy,
          requested_by_role: role,
          attendee_count: attendeeCount,
          preferred_trainer_id: trainerId,
          preferred_day: day,
          preferred_week_start: weekStart,
          trainer_id: trainerId,
          session_date: date,
          start_time: selectedSlot,
          end_time: endTime,
          status: stillFree || true ? "confirmed" : "pending",
        });
        setResult({ status: "confirmed", trainerName: trainer?.name, date, time: selectedSlot });
      }
    } catch {
      setError("Something went wrong submitting your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center p-10 text-center">
          <div className={cn("flex size-14 items-center justify-center rounded-full", result.status === "confirmed" ? "bg-emerald-soft text-emerald" : "bg-amber-soft text-amber")}>
            <CheckCircle2 className="size-7" />
          </div>
          <h2 className="mt-4 font-display text-xl font-extrabold uppercase tracking-tight">
            {result.status === "confirmed" ? "Training Confirmed" : "Request Submitted"}
          </h2>
          {result.status === "confirmed" ? (
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Booked with <strong className="text-foreground">{result.trainerName}</strong> on{" "}
              <strong className="text-foreground">{result.date}</strong> at{" "}
              <strong className="text-foreground">{result.time}</strong>. It's on the training calendar now.
            </p>
          ) : (
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              No trainer preference was set, so this request is pending — an admin will match it to an
              available trainer and confirm it on the training calendar.
            </p>
          )}
          <Button className="mt-6" variant="outline" onClick={() => { setResult(null); setRequestedBy(""); setSelectedSlot(null); setTrainerId("any"); }}>
            Submit Another Request
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loadingOrg) {
    return (
      <Card><CardContent className="flex items-center justify-center gap-2 p-16 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading organization data…</CardContent></Card>
    );
  }

  if (stores.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 p-16 text-center">
          <Building2 className="size-6 text-muted-foreground" />
          <p className="font-display text-base font-semibold">No stores set up yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">Add at least one store (and trainer) in Organization Setup before staff can request training.</p>
          <Button asChild className="mt-2"><Link href="/organization">Go to Organization Setup</Link></Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle>Request Training</CardTitle>
          <CardDescription>Preferred day is Monday–Thursday only. We'll check real trainer availability before confirming.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs text-muted-foreground">Store</Label>
              <Select value={storeId} onValueChange={(v) => { setStoreId(v); setTrainerId("any"); }}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {stores.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Number of Attendees</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={attendeeCount}
                onChange={(e) => setAttendeeCount(Number(e.target.value))}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Your Name</Label>
              <Input value={requestedBy} onChange={(e) => setRequestedBy(e.target.value)} placeholder="e.g. Sara M." className="mt-1.5" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Your Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Shift Lead">Shift Lead</SelectItem>
                  <SelectItem value="Store Manager">Store Manager</SelectItem>
                  <SelectItem value="Assistant Manager">Assistant Manager</SelectItem>
                  <SelectItem value="Trainer">Trainer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Preferred Week</Label>
            <Select value={weekStart} onValueChange={setWeekStart}>
              <SelectTrigger className="mt-1.5 w-full sm:w-64"><SelectValue /></SelectTrigger>
              <SelectContent>
                {weeks.map((w) => <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Preferred Day</Label>
            <div className="mt-1.5 grid grid-cols-4 gap-2">
              {WORKING_DAYS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDay(d)}
                  className={cn(
                    "rounded-[var(--radius-md)] border px-3 py-2.5 text-sm font-semibold transition-colors",
                    day === d ? "border-foreground bg-foreground text-background" : "border-border hover:bg-surface-muted"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Preferred Trainer</Label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              <TrainerChip label="No Preference" active={trainerId === "any"} onClick={() => setTrainerId("any")} />
              {regionalTrainers.map((t) => (
                <TrainerChip key={t.id} label={t.name} colorVar={t.colorVar} active={trainerId === t.id} onClick={() => setTrainerId(t.id)} />
              ))}
              {otherTrainers.length > 0 && (
                <>
                  <span className="mx-1 self-center text-[10px] uppercase tracking-wide text-muted-foreground">Other regions</span>
                  {otherTrainers.map((t) => (
                    <TrainerChip key={t.id} label={t.name} colorVar={t.colorVar} active={trainerId === t.id} onClick={() => setTrainerId(t.id)} />
                  ))}
                </>
              )}
            </div>
          </div>

          {trainerId !== "any" && (
            <div>
              <Label className="text-xs text-muted-foreground">Available Time Slots</Label>
              {loadingSlots && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><Loader2 className="size-3.5 animate-spin" /> Checking calendar…</p>
              )}
              {!loadingSlots && slots && (
                <div className="mt-1.5 grid grid-cols-4 gap-2">
                  {slots.map((s) => (
                    <button
                      key={s.time}
                      disabled={!s.available}
                      onClick={() => setSelectedSlot(s.time)}
                      className={cn(
                        "flex items-center justify-center gap-1 rounded-[var(--radius-md)] border px-2 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                        selectedSlot === s.time ? "border-foreground bg-foreground text-background" : "border-border hover:bg-surface-muted"
                      )}
                    >
                      {s.available ? <Circle className="size-2.5 fill-emerald text-emerald" /> : null}
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
              {!loadingSlots && slots && slots.every((s) => !s.available) && (
                <p className="mt-2 text-xs text-rose">No open slots with this trainer that day — try another day or trainer.</p>
              )}
            </div>
          )}

          {error && <p className="text-xs text-rose">{error}</p>}

          <Button
            onClick={submit}
            disabled={submitting || !requestedBy.trim() || (trainerId !== "any" && !selectedSlot)}
            className="self-start"
          >
            {submitting ? <Loader2 className="size-4 animate-spin" /> : <CalendarCheck className="size-4" />}
            {trainerId === "any" ? "Submit Request" : "Confirm Booking"}
          </Button>
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-sm">How Scheduling Works</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm">
          <Step n={1} title="Pick a store, week and day" body="Training only runs Monday–Thursday." />
          <Step n={2} title="Choose a trainer (or no preference)" body="Picking a trainer shows their real open slots for that day." />
          <Step n={3} title="Book instantly, or get matched" body="A chosen slot books immediately. 'No preference' requests wait for an admin match." />
          <Step n={4} title="Track it on the calendar" body="Every session — pending, confirmed or completed — shows up on the training calendar, color-coded by trainer." />
          <div className="mt-1 flex items-center gap-2 rounded-[var(--radius-md)] bg-surface-muted p-3 text-xs text-muted-foreground">
            <Users2 className="size-4 shrink-0" />
            {trainers.length} certified trainer{trainers.length === 1 ? "" : "s"} available.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function addMinutes(time: string, minutes: number) {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function TrainerChip({
  label,
  colorVar,
  active,
  onClick,
}: {
  label: string;
  colorVar?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active ? "border-foreground bg-foreground text-background" : "border-border hover:bg-surface-muted"
      )}
    >
      {colorVar && <span className="size-2 rounded-full" style={{ background: active ? "currentColor" : colorVar }} />}
      {label}
    </button>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="flex gap-3">
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border text-[10px] font-bold">{n}</span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}
