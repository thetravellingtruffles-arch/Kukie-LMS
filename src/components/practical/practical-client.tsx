"use client";

import * as React from "react";
import { CheckCircle2, ClipboardCheck } from "lucide-react";
import { DATA } from "@/lib/data";
import type { PracticalCriterion } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "./star-rating";

const CRITERIA: { key: PracticalCriterion; label: string; group: string }[] = [
  { key: "greeting", label: "Greeting", group: "Hospitality Fundamentals" },
  { key: "smile", label: "Smile", group: "Hospitality Fundamentals" },
  { key: "eyeContact", label: "Eye Contact", group: "Hospitality Fundamentals" },
  { key: "menuKnowledge", label: "Menu Knowledge", group: "Technique Internalization" },
  { key: "confidence", label: "Confidence", group: "Technique Internalization" },
  { key: "upselling", label: "Upselling", group: "Applied Sales Behavior" },
  { key: "crossSelling", label: "Cross-Selling", group: "Applied Sales Behavior" },
  { key: "closingSale", label: "Closing Sale", group: "Applied Sales Behavior" },
  { key: "guestEngagement", label: "Guest Engagement", group: "Overall Impression" },
  { key: "professionalism", label: "Professionalism", group: "Overall Impression" },
];

export function PracticalClient() {
  const employees = React.useMemo(() => DATA.employees.filter((e) => e.status !== "not-started").slice(0, 80), []);
  const [employeeId, setEmployeeId] = React.useState(employees[0]?.id);
  const employee = DATA.employees.find((e) => e.id === employeeId)!;
  const trainer = DATA.trainers.find((t) => t.id === employee.trainerId)!;

  const [scores, setScores] = React.useState<Record<PracticalCriterion, number>>(
    Object.fromEntries(CRITERIA.map((c) => [c.key, 0])) as Record<PracticalCriterion, number>
  );
  const [comments, setComments] = React.useState("");
  const [recommendation, setRecommendation] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const scored = Object.values(scores).filter((v) => v > 0).length;
  const overall = scored ? Object.values(scores).reduce((s, v) => s + v, 0) / CRITERIA.length : 0;
  const pass = overall >= 3.5;

  function submit() {
    setSubmitted(true);
  }

  function reset() {
    setScores(Object.fromEntries(CRITERIA.map((c) => [c.key, 0])) as Record<PracticalCriterion, number>);
    setComments("");
    setRecommendation("");
    setSubmitted(false);
  }

  const groups = Array.from(new Set(CRITERIA.map((c) => c.group)));

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr]">
      <Card className="h-fit lg:sticky lg:top-20">
        <CardHeader>
          <CardTitle>Assessment Details</CardTitle>
          <CardDescription>Trainer-scored, live on the floor</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Select value={employeeId} onValueChange={(v) => { setEmployeeId(v); reset(); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {employees.map((e) => (
                <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="rounded-[10px] bg-surface-muted p-3 text-xs">
            <p className="flex justify-between py-0.5"><span className="text-muted-foreground">Trainer</span><span className="font-medium">{trainer.name}</span></p>
            <p className="flex justify-between py-0.5"><span className="text-muted-foreground">Role</span><span className="font-medium">{employee.role}</span></p>
            <p className="flex justify-between py-0.5"><span className="text-muted-foreground">Date</span><span className="font-medium">{new Date().toISOString().slice(0, 10)}</span></p>
          </div>

          <div className="mt-2 rounded-[12px] border border-border p-4 text-center">
            <p className="text-xs text-muted-foreground">Overall Score</p>
            <p className="mt-1 font-display text-3xl font-bold">{overall.toFixed(2)}<span className="text-base text-muted-foreground"> / 5</span></p>
            <Badge variant={overall === 0 ? "secondary" : pass ? "success" : "danger"} className="mt-2">
              {overall === 0 ? "Not yet scored" : pass ? "Pass" : "Needs Coaching"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-5">
        {groups.map((group) => (
          <Card key={group}>
            <CardHeader>
              <CardTitle className="text-sm">{group}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-border">
              {CRITERIA.filter((c) => c.group === group).map((c) => (
                <div key={c.key} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <span className="text-sm font-medium">{c.label}</span>
                  <StarRating value={scores[c.key]} onChange={(v) => setScores((s) => ({ ...s, [c.key]: v }))} />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Comments & Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Textarea rows={3} placeholder="Trainer comments…" value={comments} onChange={(e) => setComments(e.target.value)} />
            <Textarea rows={2} placeholder="Recommendations for next steps…" value={recommendation} onChange={(e) => setRecommendation(e.target.value)} />
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{scored} of {CRITERIA.length} criteria scored</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={reset}>Reset</Button>
            <Button onClick={submit} disabled={scored < CRITERIA.length}>
              <ClipboardCheck className="size-4" /> Submit Assessment
            </Button>
          </div>
        </div>

        {submitted && (
          <div className="flex items-center gap-2.5 rounded-[12px] bg-emerald-soft p-4 text-sm text-emerald">
            <CheckCircle2 className="size-4.5" />
            Practical assessment submitted for {employee.name} — overall {overall.toFixed(2)}/5, {pass ? "Pass" : "Needs Coaching"}.
          </div>
        )}
      </div>
    </div>
  );
}
