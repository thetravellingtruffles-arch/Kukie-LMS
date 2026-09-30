"use client";

import * as React from "react";
import { CheckCircle2, Users2 } from "lucide-react";
import { DATA } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/practical/star-rating";

const SCENARIO = {
  title: "Guest Orders a Burger",
  steps: [
    {
      step: "Greeting & Rapport",
      guest: "Hi, table for one please.",
      guidance: "Warm welcome, eye contact, seat promptly, open with genuine rapport before the menu.",
    },
    {
      step: "Suggestive Recommendation",
      guest: "I'll have the classic burger, please.",
      guidance: "Use Name → Describe → Invite. Suggest one complementary item, not three.",
    },
    {
      step: "Handling Objection",
      guest: "I'm okay, just the burger.",
      guidance: "Acknowledge warmly, no pressure, leave the door open for later.",
    },
    {
      step: "Confirming & Closing",
      guest: "Sounds good, thank you!",
      guidance: "Confirm the order back, positive close, set expectation on timing.",
    },
  ],
};

export function RolePlayClient() {
  const employees = React.useMemo(() => DATA.employees.filter((e) => e.status !== "not-started").slice(0, 80), []);
  const [employeeId, setEmployeeId] = React.useState(employees[0]?.id);
  const employee = DATA.employees.find((e) => e.id === employeeId)!;

  const [scores, setScores] = React.useState<number[]>(Array(SCENARIO.steps.length).fill(0));
  const [submitted, setSubmitted] = React.useState(false);

  const overall = scores.some((s) => s > 0) ? scores.reduce((a, b) => a + b, 0) / SCENARIO.steps.length : 0;
  const allScored = scores.every((s) => s > 0);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr]">
      <Card className="h-fit lg:sticky lg:top-20">
        <CardHeader>
          <CardTitle>Role Play Session</CardTitle>
          <CardDescription>{SCENARIO.title}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Select value={employeeId} onValueChange={(v) => { setEmployeeId(v); setScores(Array(SCENARIO.steps.length).fill(0)); setSubmitted(false); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {employees.map((e) => (
                <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="rounded-[12px] border border-border p-4 text-center">
            <p className="text-xs text-muted-foreground">Overall Score</p>
            <p className="mt-1 font-display text-3xl font-bold">{overall.toFixed(2)}<span className="text-base text-muted-foreground"> / 5</span></p>
            <Badge variant={overall === 0 ? "secondary" : overall >= 3.5 ? "success" : "danger"} className="mt-2">
              {overall === 0 ? "In progress" : overall >= 3.5 ? "Pass" : "Needs Practice"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        {SCENARIO.steps.map((s, i) => (
          <Card key={s.step}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Step {i + 1} · {s.step}</CardTitle>
                <StarRating value={scores[i]} onChange={(v) => setScores((arr) => arr.map((x, idx) => (idx === i ? v : x)))} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-[14px] bg-surface-muted px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Guest</p>
                  <p className="mt-1 text-[14px]">{s.guest}</p>
                </div>
              </div>
              <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
                <Users2 className="mt-0.5 size-3.5 shrink-0" /> {s.guidance}
              </p>
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-end">
          <Button onClick={() => setSubmitted(true)} disabled={!allScored}>
            <CheckCircle2 className="size-4" /> Submit Role Play
          </Button>
        </div>

        {submitted && (
          <div className="flex items-center gap-2.5 rounded-[12px] bg-emerald-soft p-4 text-sm text-emerald">
            <CheckCircle2 className="size-4.5" />
            Role play submitted for {employee.name} — overall {overall.toFixed(2)}/5.
          </div>
        )}
      </div>
    </div>
  );
}
