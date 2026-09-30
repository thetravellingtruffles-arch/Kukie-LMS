"use client";

import * as React from "react";
import { CheckCircle2, UserRound } from "lucide-react";
import { DATA } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

const DEFAULTS = {
  confidenceImproved: true,
  upsellImproved: true,
  applyingTraining: true,
  needsCoaching: false,
  readyForPromotion: false,
};

const QUESTIONS: { key: keyof typeof DEFAULTS; label: string }[] = [
  { key: "confidenceImproved", label: "Has the employee's confidence improved since training?" },
  { key: "upsellImproved", label: "Has upselling / suggestive selling improved?" },
  { key: "applyingTraining", label: "Is the employee actively applying the training on the floor?" },
  { key: "needsCoaching", label: "Does the employee need additional coaching?" },
  { key: "readyForPromotion", label: "Is the employee ready for promotion consideration?" },
];

export function FollowUpClient() {
  const certifiedEmployees = React.useMemo(() => {
    const certIds = new Set(DATA.certificates.map((c) => c.employeeId));
    return DATA.employees.filter((e) => certIds.has(e.id)).slice(0, 80);
  }, []);
  const [employeeId, setEmployeeId] = React.useState(certifiedEmployees[0]?.id);
  const employee = DATA.employees.find((e) => e.id === employeeId)!;
  const manager = DATA.managers.find((m) => m.id === employee.managerId)!;

  const [answers, setAnswers] = React.useState({ ...DEFAULTS });
  const [notes, setNotes] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const recent = DATA.managerFollowUps
    .map((f) => ({ f, emp: DATA.employees.find((e) => e.id === f.employeeId)! }))
    .slice(0, 30);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.1fr]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>New Follow-Up</CardTitle>
          <CardDescription>Complete 30 days after certification</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Select value={employeeId} onValueChange={(v) => { setEmployeeId(v); setSubmitted(false); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {certifiedEmployees.map((e) => (
                <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="rounded-[10px] bg-surface-muted p-3 text-xs">
            <p className="flex justify-between py-0.5"><span className="text-muted-foreground">Manager</span><span className="font-medium">{manager.name}</span></p>
            <p className="flex justify-between py-0.5"><span className="text-muted-foreground">Certified</span><span className="font-medium">{employee.assignedDate}</span></p>
          </div>

          <div className="flex flex-col divide-y divide-border">
            {QUESTIONS.map((q) => (
              <div key={q.key} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <span className="pr-4 text-sm">{q.label}</span>
                <Switch checked={answers[q.key]} onCheckedChange={(v) => setAnswers((a) => ({ ...a, [q.key]: v }))} />
              </div>
            ))}
          </div>

          <Textarea rows={3} placeholder="Manager notes…" value={notes} onChange={(e) => setNotes(e.target.value)} />

          <Button onClick={() => setSubmitted(true)}>
            <UserRound className="size-4" /> Submit Follow-Up
          </Button>

          {submitted && (
            <div className="flex items-center gap-2.5 rounded-[12px] bg-emerald-soft p-3 text-xs text-emerald">
              <CheckCircle2 className="size-4 shrink-0" />
              Follow-up submitted for {employee.name}.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Follow-Ups</CardTitle>
          <CardDescription>{DATA.managerFollowUps.length} completed company-wide</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex max-h-[640px] flex-col divide-y divide-border overflow-y-auto">
            {recent.map(({ f, emp }, i) => (
              <div key={i} className="flex items-start justify-between gap-3 py-3 first:pt-0">
                <div>
                  <p className="text-sm font-medium">{emp.name}</p>
                  <p className="text-xs text-muted-foreground">{f.date}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{f.notes}</p>
                </div>
                <div className="flex shrink-0 flex-wrap justify-end gap-1">
                  {f.readyForPromotion && <Badge variant="violet">Promotion Ready</Badge>}
                  {f.needsCoaching && <Badge variant="warning">Needs Coaching</Badge>}
                  {!f.needsCoaching && <Badge variant="success">On Track</Badge>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
