"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sparkles, FilePlus2, Loader2, ArrowRight } from "lucide-react";
import { createCourse, createPillar } from "@/lib/studio/queries";
import { generateDraft } from "@/lib/studio/draft-assist";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || `module-${Date.now()}`;
}

export function NewModuleClient() {
  const router = useRouter();
  const [mode, setMode] = React.useState<"blank" | "draft">("draft");
  const [busy, setBusy] = React.useState(false);

  // Shared
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [audience, setAudience] = React.useState("");
  // Draft-assist only
  const [topic, setTopic] = React.useState("");

  async function submit() {
    setBusy(true);
    try {
      if (mode === "blank") {
        const course = await createCourse({
          slug: slugify(title || "untitled-module"),
          title: title || "Untitled Module",
          subtitle: category ? `${category} · Draft` : "Draft",
          meta: { category, targetAudience: audience },
        });
        router.push(`/studio/${course.id}`);
        return;
      }

      const draft = generateDraft({ topic, category, targetAudience: audience });
      const course = await createCourse({
        slug: slugify(topic || "untitled-module"),
        title: draft.title,
        subtitle: draft.subtitle,
        description: draft.description,
        meta: draft.meta,
      });
      await Promise.all(draft.pillars.map((p) => createPillar(course.id, p)));
      router.push(`/studio/${course.id}`);
    } finally {
      setBusy(false);
    }
  }

  const canSubmit = mode === "blank" ? title.trim().length > 0 : topic.trim().length > 0;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 grid grid-cols-2 gap-3">
        <ModeCard
          active={mode === "draft"}
          icon={Sparkles}
          title="Draft-Assist"
          description="Describe a topic — I scaffold all six pillars, learning outcomes and the assessment framework, with placeholders wherever real input is needed."
          onClick={() => setMode("draft")}
        />
        <ModeCard
          active={mode === "blank"}
          icon={FilePlus2}
          title="Blank Module"
          description="Start from an empty Master Training Module Template and build every section yourself, in any order."
          onClick={() => setMode("blank")}
        />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-6">
          {mode === "draft" ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="topic">Topic</Label>
              <Textarea
                id="topic"
                rows={3}
                placeholder="e.g. Proper HACCP temperature logging for cold storage"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Module Title</Label>
              <Input id="title" placeholder="e.g. Cold Storage & HACCP Logging" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category">Training Category</Label>
              <Input id="category" placeholder="e.g. Food Safety" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="audience">Target Audience</Label>
              <Input id="audience" placeholder="e.g. Kitchen staff" value={audience} onChange={(e) => setAudience(e.target.value)} />
            </div>
          </div>

          <Button onClick={submit} disabled={!canSubmit || busy} size="lg" className="mt-2">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
            {mode === "draft" ? "Generate Draft & Open Builder" : "Create Module & Open Builder"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ModeCard({
  active,
  icon: Icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-2 rounded-[var(--radius-lg)] border p-4 text-left transition-colors",
        active ? "border-brand bg-brand-soft" : "border-border hover:bg-surface-muted"
      )}
    >
      <Icon className={cn("size-5", active ? "text-brand" : "text-muted-foreground")} />
      <p className="font-display text-sm font-semibold">{title}</p>
      <p className="text-xs leading-snug text-muted-foreground">{description}</p>
    </button>
  );
}
