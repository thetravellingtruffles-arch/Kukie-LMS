"use client";

import * as React from "react";
import { CheckCircle2, XCircle, Clock, MapPin, Users2 } from "lucide-react";
import type { TrainingSession } from "@/lib/scheduling/types";
import { trainerById, storeMeta, type TrainerMeta } from "@/lib/scheduling/trainer-meta";
import { updateSessionStatus } from "@/lib/scheduling/queries";
import type { OrgStore } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS_VARIANT = {
  pending: "warning",
  confirmed: "success",
  declined: "danger",
  completed: "secondary",
  cancelled: "danger",
} as const;

export function SessionDialog({
  session,
  trainers,
  stores,
  open,
  onOpenChange,
  onUpdated,
}: {
  session: TrainingSession | null;
  trainers: TrainerMeta[];
  stores: OrgStore[];
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onUpdated: (s: TrainingSession) => void;
}) {
  const [assignTrainer, setAssignTrainer] = React.useState<string>("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    setAssignTrainer(session?.trainer_id ?? session?.preferred_trainer_id ?? "");
  }, [session]);

  if (!session) return null;
  const store = storeMeta(stores, session.store_id);
  const trainer = trainerById(trainers, session.trainer_id ?? undefined);

  async function act(status: TrainingSession["status"]) {
    if (!session) return;
    setBusy(true);
    try {
      const patch: Partial<TrainingSession> = {};
      if (status === "confirmed" && assignTrainer) patch.trainer_id = assignTrainer;
      const updated = await updateSessionStatus(session.id, status, patch);
      onUpdated(updated);
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>Training Session</DialogTitle>
            <Badge variant={STATUS_VARIANT[session.status]}>{session.status}</Badge>
          </div>
          <DialogDescription>Requested by {session.requested_by} ({session.requested_by_role})</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 text-sm">
          <Row icon={MapPin} label="Store" value={store?.name ?? session.store_id} />
          <Row icon={Clock} label="Preferred" value={`${session.preferred_day} · ${session.preferred_week_start}`} />
          {session.session_date && (
            <Row icon={Clock} label="Scheduled" value={`${session.session_date} · ${session.start_time?.slice(0, 5)}–${session.end_time?.slice(0, 5)}`} />
          )}
          <Row icon={Users2} label="Attendees" value={`${session.attendee_count}`} />

          <div className="flex items-center gap-3 border-t border-border pt-3">
            <span className="w-20 shrink-0 text-xs text-muted-foreground">Trainer</span>
            <Select value={assignTrainer} onValueChange={setAssignTrainer}>
              <SelectTrigger className="h-9 flex-1"><SelectValue placeholder="Assign a trainer…" /></SelectTrigger>
              <SelectContent>
                {trainers.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {trainer && !assignTrainer && <p className="text-xs text-muted-foreground">Currently unassigned.</p>}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          {session.status !== "declined" && session.status !== "cancelled" && (
            <Button variant="outline" disabled={busy} onClick={() => act(session.status === "pending" ? "declined" : "cancelled")}>
              <XCircle className="size-4" /> {session.status === "pending" ? "Decline" : "Cancel"}
            </Button>
          )}
          {session.status !== "confirmed" && session.status !== "completed" && (
            <Button disabled={busy || !assignTrainer} onClick={() => act("confirmed")}>
              <CheckCircle2 className="size-4" /> Confirm
            </Button>
          )}
          {session.status === "confirmed" && (
            <Button disabled={busy} onClick={() => act("completed")}>
              <CheckCircle2 className="size-4" /> Mark Completed
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="w-20 shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
