"use client";

import * as React from "react";
import { Loader2, Search, Award } from "lucide-react";
import { fetchStaff } from "@/lib/staff/queries";
import { fetchCourses } from "@/lib/studio/queries";
import { fetchCompletion, saveCompletion } from "@/lib/completions/queries";
import type { Staff, Course, Completion } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function LogCompletionDialog({
  open,
  onOpenChange,
  presetStaff,
  presetCourseSlug,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  presetStaff?: Staff | null;
  presetCourseSlug?: string | null;
  onSaved: () => void;
}) {
  const [staffList, setStaffList] = React.useState<Staff[]>([]);
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [staff, setStaff] = React.useState<Staff | null>(presetStaff ?? null);
  const [staffQuery, setStaffQuery] = React.useState("");
  const [courseSlug, setCourseSlug] = React.useState("");
  const [existing, setExisting] = React.useState<Completion | null>(null);
  const [loadingExisting, setLoadingExisting] = React.useState(false);

  const [knowledgeScore, setKnowledgeScore] = React.useState("");
  const [practicalScore, setPracticalScore] = React.useState("");
  const [roleplayScore, setRoleplayScore] = React.useState("");
  const [workbookCompleted, setWorkbookCompleted] = React.useState(false);
  const [readyForPromotion, setReadyForPromotion] = React.useState(false);
  const [notes, setNotes] = React.useState("");
  const [issueCert, setIssueCert] = React.useState(false);
  const [trainerName, setTrainerName] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    fetchStaff().then(setStaffList);
    fetchCourses().then((cs) => setCourses(cs.filter((c) => c.status === "published")));
    setStaff(presetStaff ?? null);
    setStaffQuery("");
    setCourseSlug(presetCourseSlug ?? "");
    resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function resetForm() {
    setExisting(null);
    setKnowledgeScore("");
    setPracticalScore("");
    setRoleplayScore("");
    setWorkbookCompleted(false);
    setReadyForPromotion(false);
    setNotes("");
    setIssueCert(false);
    setTrainerName("");
    setError(null);
  }

  React.useEffect(() => {
    if (!staff || !courseSlug) {
      resetForm();
      return;
    }
    setLoadingExisting(true);
    fetchCompletion(staff.id, courseSlug)
      .then((c) => {
        setExisting(c);
        if (c) {
          setKnowledgeScore(c.knowledgeScore != null ? String(c.knowledgeScore) : "");
          setPracticalScore(c.practicalScore != null ? String(c.practicalScore) : "");
          setRoleplayScore(c.roleplayScore != null ? String(c.roleplayScore) : "");
          setWorkbookCompleted(!!c.workbookCompletedAt);
          setReadyForPromotion(!!c.followupReadyForPromotion);
          setNotes(c.notes ?? "");
          setTrainerName(c.trainerName ?? "");
        }
      })
      .finally(() => setLoadingExisting(false));
  }, [staff, courseSlug]);

  const course = courses.find((c) => c.slug === courseSlug) ?? null;
  const filteredStaff = staffQuery.trim()
    ? staffList.filter((s) => s.name.toLowerCase().includes(staffQuery.toLowerCase()) || s.employeeNumber.toLowerCase().includes(staffQuery.toLowerCase()))
    : staffList.slice(0, 8);

  async function submit() {
    if (!staff || !course) return;
    setSaving(true);
    setError(null);
    try {
      await saveCompletion({
        staffId: staff.id,
        courseId: course.id,
        courseSlug: course.slug,
        courseTitle: course.title,
        knowledgeScore: knowledgeScore.trim() ? Number(knowledgeScore) : undefined,
        passMarkPercent: course.meta.scoring?.passMarkPercent ?? 80,
        practicalScore: practicalScore.trim() ? Number(practicalScore) : undefined,
        practicalPassScore: course.meta.scoring?.practicalPassScore ?? 4,
        roleplayScore: roleplayScore.trim() ? Number(roleplayScore) : undefined,
        workbookCompleted,
        followupReadyForPromotion: readyForPromotion || undefined,
        notes: notes || undefined,
        issueCertificate: issueCert && !!course.meta.certification?.issuesCertificate,
        validityMonths: course.meta.certification?.validityMonths ?? null,
        trainerName: trainerName || undefined,
      });
      onSaved();
      onOpenChange(false);
    } catch {
      setError("Couldn't save this record — try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Training Completion</DialogTitle>
          <DialogDescription>Record knowledge, practical, role play, workbook, and certificate outcomes for a staff member.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {!staff ? (
            <div>
              <Label htmlFor="lc-staff-search">Staff member</Label>
              <div className="relative mt-1.5">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="lc-staff-search" value={staffQuery} onChange={(e) => setStaffQuery(e.target.value)} placeholder="Search by name or employee #…" className="pl-9" autoFocus />
              </div>
              <div className="mt-2 max-h-40 overflow-y-auto rounded-[10px] border border-border">
                {filteredStaff.length === 0 ? (
                  <p className="p-3 text-xs text-muted-foreground">No matches.</p>
                ) : (
                  filteredStaff.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStaff(s)}
                      className="flex w-full items-center justify-between border-b border-border/60 px-3 py-2 text-left text-sm last:border-0 hover:bg-surface-muted"
                    >
                      <span className="font-medium">{s.name}</span>
                      <span className="text-xs text-muted-foreground">{s.employeeNumber}{s.storeName ? ` · ${s.storeName}` : ""}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-[10px] bg-surface-muted px-3 py-2">
              <div>
                <p className="text-sm font-medium">{staff.name}</p>
                <p className="text-xs text-muted-foreground">{staff.employeeNumber}{staff.storeName ? ` · ${staff.storeName}` : ""}</p>
              </div>
              {!presetStaff && (
                <button type="button" onClick={() => setStaff(null)} className="text-xs text-muted-foreground underline">Change</button>
              )}
            </div>
          )}

          <div>
            <Label>Course</Label>
            <Select value={courseSlug} onValueChange={setCourseSlug} disabled={!staff}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select a published module…" /></SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {staff && course && (
            <>
              {loadingExisting ? (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Loader2 className="size-3.5 animate-spin" /> Loading existing record…</p>
              ) : existing ? (
                <p className="text-xs text-muted-foreground">Editing existing record — last updated {new Date(existing.updatedAt).toLocaleDateString()}.</p>
              ) : null}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="lc-knowledge">Knowledge score (%)</Label>
                  <Input id="lc-knowledge" type="number" min={0} max={100} value={knowledgeScore} onChange={(e) => setKnowledgeScore(e.target.value)} placeholder={`Pass ${course.meta.scoring?.passMarkPercent ?? 80}%`} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="lc-practical">Practical score (1-5)</Label>
                  <Input id="lc-practical" type="number" min={0} max={5} step={0.1} value={practicalScore} onChange={(e) => setPracticalScore(e.target.value)} placeholder={`Pass ${course.meta.scoring?.practicalPassScore ?? 4}`} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="lc-roleplay">Role play score (1-5)</Label>
                  <Input id="lc-roleplay" type="number" min={0} max={5} step={0.1} value={roleplayScore} onChange={(e) => setRoleplayScore(e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="lc-trainer">Trainer</Label>
                  <Input id="lc-trainer" value={trainerName} onChange={(e) => setTrainerName(e.target.value)} placeholder="Trainer name" className="mt-1.5" />
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="flex items-center gap-2 text-sm"><Checkbox checked={workbookCompleted} onCheckedChange={(v) => setWorkbookCompleted(!!v)} /> Workbook completed & signed</label>
                <label className="flex items-center gap-2 text-sm"><Checkbox checked={readyForPromotion} onCheckedChange={(v) => setReadyForPromotion(!!v)} /> Manager follow-up: ready for promotion</label>
                {course.meta.certification?.issuesCertificate && (
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={issueCert} onCheckedChange={(v) => setIssueCert(!!v)} />
                    <Award className="size-3.5 text-brand" /> Issue certificate{course.meta.certification.validityMonths ? ` (valid ${course.meta.certification.validityMonths} months)` : ""}
                  </label>
                )}
              </div>

              <div>
                <Label htmlFor="lc-notes">Notes</Label>
                <Textarea id="lc-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes…" className="mt-1.5" rows={2} />
              </div>
            </>
          )}

          {error && <p className="text-xs text-rose">{error}</p>}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!staff || !course || saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : null} Save Record
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
