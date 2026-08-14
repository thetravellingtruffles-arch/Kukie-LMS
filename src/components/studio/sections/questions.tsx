"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { createQuestion, updateQuestion, deleteQuestion, type QuestionInput } from "@/lib/studio/queries";
import type { QuestionType, QuizQuestion } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { StudioActions, StudioData } from "../builder-shell";

const TYPES: QuestionType[] = ["mcq", "true-false", "image", "scenario", "ordering", "matching"];
const DIFFICULTIES: QuizQuestion["difficulty"][] = ["foundation", "intermediate", "advanced"];

function arrayTypes(t: QuestionType) {
  return t === "ordering" || t === "matching";
}

export function QuestionsSection({ data, actions }: { data: StudioData; actions: StudioActions }) {
  const { questions, pillars } = data;

  async function addQuestion() {
    await createQuestion(data.course.id, {
      pillarId: pillars[0]?.id ?? null,
      type: "mcq",
      prompt: "New question",
      options: ["Option A", "Option B"],
      correctAnswer: "Option A",
      difficulty: "foundation",
    });
    actions.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Knowledge Questions</CardTitle>
        <CardDescription>Page 20 — the question bank powering the Knowledge Assessment.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {questions.length === 0 && <p className="text-sm text-muted-foreground">No questions yet.</p>}
        {questions.map((q) => (
          <QuestionRow key={q.id} question={q} pillars={pillars} onSaved={actions.refresh} />
        ))}
        <Button variant="outline" size="sm" className="w-fit" onClick={addQuestion}>
          <Plus className="size-3.5" /> Add Question
        </Button>
      </CardContent>
    </Card>
  );
}

function QuestionRow({ question, pillars, onSaved }: { question: QuizQuestion; pillars: StudioData["pillars"]; onSaved: () => void }) {
  const [expanded, setExpanded] = React.useState(false);

  async function patch(input: Partial<QuestionInput>) {
    await updateQuestion(question.id, input);
    onSaved();
  }
  async function remove() {
    await deleteQuestion(question.id);
    onSaved();
  }

  const correctAnswerText = Array.isArray(question.correctAnswer) ? question.correctAnswer.join("\n") : question.correctAnswer;

  return (
    <div className="rounded-[var(--radius-md)] border border-border p-3">
      <div className="flex items-center gap-2">
        <Badge variant="outline">{question.type}</Badge>
        <button className="flex-1 text-left" onClick={() => setExpanded((e) => !e)}>
          <p className="text-sm font-semibold">{question.prompt}</p>
        </button>
        <Button variant="ghost" size="icon" onClick={remove}><Trash2 className="size-4" /></Button>
      </div>

      {expanded && (
        <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Type</Label>
              <Select value={question.type} onValueChange={(v) => patch({ type: v as QuestionType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Difficulty</Label>
              <Select value={question.difficulty} onValueChange={(v) => patch({ difficulty: v as QuizQuestion["difficulty"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DIFFICULTIES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Pillar</Label>
              <Select value={question.pillarId ?? "none"} onValueChange={(v) => patch({ pillarId: v === "none" ? null : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No pillar</SelectItem>
                  {pillars.map((p) => <SelectItem key={p.id} value={p.id}>{p.shortName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Prompt</Label>
            <Textarea rows={2} defaultValue={question.prompt} onBlur={(e) => e.target.value !== question.prompt && patch({ prompt: e.target.value })} />
          </div>

          {question.type !== "true-false" && (
            <div className="flex flex-col gap-1.5">
              <Label>Options — one per line{question.type === "matching" ? " (right-hand side values)" : ""}</Label>
              <Textarea
                rows={3}
                defaultValue={(question.options ?? []).join("\n")}
                onBlur={(e) => patch({ options: e.target.value.split("\n").map((l) => l.trim()).filter(Boolean) })}
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label>
              Correct answer{arrayTypes(question.type) ? " — one per line" : ""}
              {question.type === "matching" && " (\"left = right\" pairs)"}
              {question.type === "ordering" && " (correct order, one item per line)"}
            </Label>
            <Textarea
              rows={arrayTypes(question.type) ? 3 : 1}
              defaultValue={correctAnswerText}
              onBlur={(e) => {
                const v = arrayTypes(question.type)
                  ? e.target.value.split("\n").map((l) => l.trim()).filter(Boolean)
                  : e.target.value;
                patch({ correctAnswer: v });
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Explanation (shown after answering)</Label>
            <Textarea rows={2} defaultValue={question.explanation} onBlur={(e) => e.target.value !== question.explanation && patch({ explanation: e.target.value })} />
          </div>
        </div>
      )}
    </div>
  );
}
