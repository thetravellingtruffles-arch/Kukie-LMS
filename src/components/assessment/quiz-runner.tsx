"use client";

import * as React from "react";
import { CheckCircle2, XCircle, RotateCcw, ArrowRight, ImageIcon, Trophy } from "lucide-react";
import { QUIZ_SET } from "@/lib/curriculum/questions";
import { PILLARS } from "@/lib/curriculum/pillars";
import { PILLAR_BADGE_VARIANT } from "@/lib/curriculum/pillar-colors";
import type { Pillar, QuizQuestion } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarCompare } from "@/components/charts/bar-compare";
import { cn } from "@/lib/utils";

const QUIZ_LENGTH = 20;

function isCorrect(q: QuizQuestion, answer: unknown): boolean {
  if (q.type === "ordering") {
    return Array.isArray(answer) && JSON.stringify(answer) === JSON.stringify(q.correctAnswer);
  }
  if (q.type === "matching") {
    const correct = q.correctAnswer as string[];
    const given = (answer as string[]) ?? [];
    return correct.length === given.length && correct.every((c) => given.includes(c));
  }
  return answer === q.correctAnswer;
}

export function QuizRunner({
  questionSet = QUIZ_SET,
  pillars = PILLARS,
  passMark = 80,
  onComplete,
}: {
  questionSet?: QuizQuestion[];
  pillars?: Pillar[];
  passMark?: number;
  onComplete?: (result: { scorePercent: number; passed: boolean }) => void;
}) {
  const PASS_MARK = passMark;
  const questions = React.useMemo(() => questionSet.slice(0, QUIZ_LENGTH), [questionSet]);
  const [index, setIndex] = React.useState(0);
  const [phase, setPhase] = React.useState<"answering" | "feedback" | "results">("answering");
  const [answer, setAnswer] = React.useState<unknown>(null);
  const [results, setResults] = React.useState<{ q: QuizQuestion; answer: unknown; correct: boolean }[]>([]);
  const [startedAt] = React.useState(() => Date.now());

  const q = questions[index];

  React.useEffect(() => {
    if (phase !== "results" || !onComplete) return;
    const scorePercent = Math.round((results.filter((r) => r.correct).length / results.length) * 100);
    onComplete({ scorePercent, passed: scorePercent >= PASS_MARK });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function submit() {
    const correct = isCorrect(q, answer);
    setResults((r) => [...r, { q, answer, correct }]);
    setPhase("feedback");
  }

  function next() {
    if (index === questions.length - 1) {
      setPhase("results");
      return;
    }
    setIndex((i) => i + 1);
    setAnswer(null);
    setPhase("answering");
  }

  function retake() {
    setIndex(0);
    setAnswer(null);
    setResults([]);
    setPhase("answering");
  }

  if (phase === "results") {
    const scorePercent = Math.round((results.filter((r) => r.correct).length / results.length) * 100);
    const passed = scorePercent >= PASS_MARK;
    const timeSpentMin = Math.max(1, Math.round((Date.now() - startedAt) / 60000));

    const byPillar = pillars.map((p) => {
      const inPillar = results.filter((r) => r.q.pillarId === p.id);
      const pct = inPillar.length ? Math.round((inPillar.filter((r) => r.correct).length / inPillar.length) * 100) : 0;
      return { label: p.shortName, score: pct };
    });

    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className={cn("mx-auto flex size-16 items-center justify-center rounded-full", passed ? "bg-emerald-soft text-emerald" : "bg-rose-soft text-rose")}>
            <Trophy className="size-8" />
          </div>
          <p className="mt-5 font-display text-4xl font-bold">{scorePercent}%</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {results.filter((r) => r.correct).length} of {results.length} correct · {timeSpentMin} min · Pass mark {PASS_MARK}%
          </p>
          <Badge variant={passed ? "success" : "danger"} className="mt-3">
            {passed ? "Passed — Certificate Eligible" : "Not Yet Passed"}
          </Badge>

          <div className="mx-auto mt-8 max-w-xl text-left">
            <p className="mb-2 text-sm font-semibold">Score by Pillar</p>
            <BarCompare
              data={byPillar}
              bars={[{ key: "score", color: "var(--brand)" }]}
              layout="horizontal"
              height={220}
            />
          </div>

          <div className="mt-8 flex justify-center gap-3">
            <Button variant="outline" onClick={retake}>
              <RotateCcw className="size-4" /> Retake Assessment
            </Button>
            {passed && <Button>Continue to Practical Assessment <ArrowRight className="size-4" /></Button>}
          </div>
        </CardContent>
      </Card>
    );
  }

  const pillar = pillars.find((p) => p.id === q.pillarId);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          Question {index + 1} of {questions.length}
        </p>
        <p className="text-xs font-medium text-muted-foreground">Pass mark: {PASS_MARK}%</p>
      </div>
      <Progress value={((index + (phase === "feedback" ? 1 : 0)) / questions.length) * 100} className="mb-6" />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            {pillar && <Badge variant={PILLAR_BADGE_VARIANT[pillar.color]}>{pillar.shortName}</Badge>}
            <Badge variant="outline">{typeLabel(q.type)}</Badge>
            <Badge variant="secondary">{q.difficulty}</Badge>
          </div>
          <CardTitle className="mt-2 text-lg font-semibold leading-snug">{q.prompt}</CardTitle>
        </CardHeader>
        <CardContent>
          {q.type === "image" && (
            <div className="mb-4 flex h-28 items-center justify-center gap-2 rounded-[12px] border border-dashed border-border bg-surface-muted text-muted-foreground">
              <ImageIcon className="size-5" />
              <span className="text-xs">Diagram reference — Menu Engineering Matrix</span>
            </div>
          )}

          <QuestionInput q={q} value={answer} onChange={setAnswer} disabled={phase === "feedback"} />

          {phase === "feedback" && (
            <div className={cn("mt-5 flex items-start gap-2.5 rounded-[12px] p-4 text-sm", isCorrect(q, answer) ? "bg-emerald-soft text-emerald" : "bg-rose-soft text-rose")}>
              {isCorrect(q, answer) ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> : <XCircle className="mt-0.5 size-4 shrink-0" />}
              <div>
                <p className="font-semibold">{isCorrect(q, answer) ? "Correct" : "Not quite"}</p>
                <p className="mt-0.5 text-foreground/80">{q.explanation}</p>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            {phase === "answering" ? (
              <Button onClick={submit} disabled={!isAnswered(q, answer)}>
                Submit Answer
              </Button>
            ) : (
              <Button onClick={next}>
                {index === questions.length - 1 ? "View Results" : "Next Question"} <ArrowRight className="size-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function typeLabel(t: QuizQuestion["type"]) {
  return {
    mcq: "Multiple Choice",
    "true-false": "True / False",
    image: "Image Question",
    scenario: "Scenario",
    ordering: "Ordering",
    matching: "Matching",
  }[t];
}

function isAnswered(q: QuizQuestion, answer: unknown) {
  if (q.type === "ordering") return Array.isArray(answer) && answer.length === (q.options?.length ?? 0);
  if (q.type === "matching") return Array.isArray(answer) && answer.length === (q.correctAnswer as string[]).length;
  return answer !== null && answer !== undefined && answer !== "";
}

function QuestionInput({
  q,
  value,
  onChange,
  disabled,
}: {
  q: QuizQuestion;
  value: unknown;
  onChange: (v: unknown) => void;
  disabled: boolean;
}) {
  if (q.type === "true-false") {
    return (
      <div className="grid grid-cols-2 gap-3">
        {["true", "false"].map((opt) => (
          <OptionButton key={opt} label={opt === "true" ? "True" : "False"} active={value === opt} disabled={disabled} onClick={() => onChange(opt)} />
        ))}
      </div>
    );
  }

  if (q.type === "mcq" || q.type === "scenario" || q.type === "image") {
    return (
      <div className="flex flex-col gap-2.5">
        {q.options?.map((opt) => (
          <OptionButton key={opt} label={opt} active={value === opt} disabled={disabled} onClick={() => onChange(opt)} />
        ))}
      </div>
    );
  }

  if (q.type === "ordering") {
    const chosen = (value as string[]) ?? [];
    const remaining = (q.options ?? []).filter((o) => !chosen.includes(o));
    return (
      <div>
        <p className="mb-2 text-xs text-muted-foreground">Click items in the correct order.</p>
        <div className="mb-3 flex min-h-11 flex-wrap gap-2 rounded-[10px] border border-dashed border-border p-2">
          {chosen.length === 0 && <span className="px-1 text-xs text-muted-foreground/60">Your sequence will appear here…</span>}
          {chosen.map((c, i) => (
            <span key={c} className="flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-xs font-medium text-brand-foreground">
              {i + 1}. {c}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {remaining.map((opt) => (
            <button
              key={opt}
              disabled={disabled}
              onClick={() => onChange([...chosen, opt])}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface-muted disabled:opacity-50"
            >
              {opt}
            </button>
          ))}
        </div>
        {chosen.length > 0 && !disabled && (
          <button onClick={() => onChange([])} className="mt-2 text-xs text-muted-foreground underline">
            Reset order
          </button>
        )}
      </div>
    );
  }

  if (q.type === "matching") {
    const pairs = (q.correctAnswer as string[]).map((s) => {
      const [left, right] = s.split(" = ");
      return { left, right };
    });
    const rightOptions = [...pairs.map((p) => p.right)].reverse();
    const selections = (value as string[]) ?? Array(pairs.length).fill("");

    function setSelection(i: number, right: string) {
      const left = pairs[i].left;
      const next = [...selections];
      next[i] = `${left} = ${right}`;
      onChange(next);
    }

    return (
      <div className="flex flex-col gap-2.5">
        {pairs.map((p, i) => (
          <div key={p.left} className="flex items-center gap-3 rounded-[10px] border border-border p-3">
            <span className="w-40 shrink-0 text-sm font-medium">{p.left}</span>
            <Select disabled={disabled} onValueChange={(v) => setSelection(i, v)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Choose a match…" />
              </SelectTrigger>
              <SelectContent>
                {rightOptions.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

function OptionButton({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-[10px] border px-4 py-3 text-left text-sm transition-colors disabled:cursor-not-allowed",
        active ? "border-brand bg-brand-soft text-brand font-medium" : "border-border hover:bg-surface-muted"
      )}
    >
      {label}
    </button>
  );
}
