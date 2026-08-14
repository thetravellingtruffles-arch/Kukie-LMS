// Structured draft-assist: no external AI call. Given a topic + category, it
// scaffolds the full Master Training Module Template shape — six starter
// pillars, a cover/closing slide per pillar, placeholder learning outcomes —
// with every fact that can't be derived from the topic string alone marked
// [INPUT REQUIRED] or [SME VALIDATION REQUIRED], per the template's own rule
// against inventing operational information (see Master Training Module
// Template, Page 49).

import type { CourseMeta } from "@/lib/types";

const PILLAR_COLORS: Array<"brand" | "amber" | "emerald" | "rose" | "violet" | "sky"> = [
  "brand", "amber", "emerald", "rose", "violet", "sky",
];

export interface DraftAssistInput {
  topic: string;
  category: string;
  targetAudience: string;
}

export interface DraftPillar {
  index: number;
  name: string;
  shortName: string;
  description: string;
  color: (typeof PILLAR_COLORS)[number];
}

export interface DraftAssistResult {
  title: string;
  subtitle: string;
  description: string;
  meta: CourseMeta;
  pillars: DraftPillar[];
}

const STARTER_STAGES = [
  { name: "Foundations", short: "Foundations", hint: "core knowledge and standards a learner must know before doing anything hands-on" },
  { name: "The Standard", short: "Standard", hint: "the exact SOP / correct-practice steps for {topic}" },
  { name: "Demonstration & Practice", short: "Practice", hint: "trainer-led demonstration followed by guided and independent practice" },
  { name: "Common Mistakes", short: "Mistakes", hint: "the errors this topic most often produces, and how to catch them" },
  { name: "Real Scenarios", short: "Scenarios", hint: "applying {topic} under real operational pressure" },
  { name: "Assessment & Sign-Off", short: "Assessment", hint: "how competence in {topic} is measured and certified" },
];

export function generateDraft(input: DraftAssistInput): DraftAssistResult {
  const topic = input.topic.trim() || "[INPUT REQUIRED]";

  const pillars: DraftPillar[] = STARTER_STAGES.map((s, i) => ({
    index: i + 1,
    name: `${s.name}: ${topic}`,
    shortName: s.short,
    description: s.hint.replace("{topic}", topic),
    color: PILLAR_COLORS[i % PILLAR_COLORS.length],
  }));

  const meta: CourseMeta = {
    category: input.category || "[INPUT REQUIRED]",
    targetAudience: input.targetAudience || "[INPUT REQUIRED]",
    duration: "[INPUT REQUIRED]",
    deliveryMethod: "[L&D DECISION REQUIRED]",
    classSize: "[L&D DECISION REQUIRED]",
    prerequisites: "[INPUT REQUIRED]",
    trainingNeed: {
      businessProblem: "[INPUT REQUIRED — what operational gap does this module close?]",
      operationalNeed: "[INPUT REQUIRED]",
      guestImpact: "[INPUT REQUIRED]",
      businessOutcome: "[INPUT REQUIRED]",
    },
    learningOutcomes: [
      { category: "Know", outcome: `[SME VALIDATION REQUIRED] Core facts and standards for ${topic}.` },
      { category: "Demonstrate", outcome: `[SME VALIDATION REQUIRED] Correctly demonstrate ${topic} per the approved SOP.` },
      { category: "Apply", outcome: `[SME VALIDATION REQUIRED] Apply ${topic} correctly under real operational conditions.` },
    ],
    practicalAssessment: { criteria: ["[SME VALIDATION REQUIRED] Define the observable pass/fail criteria for this skill."] },
    scoring: { passMarkPercent: 80, practicalPassScore: 4 },
    certification: { issuesCertificate: true, validityMonths: 12 },
    sourceTopic: input.topic,
  };

  return {
    title: topic === "[INPUT REQUIRED]" ? "Untitled Module" : topic,
    subtitle: `${input.category || "Training"} · Draft-assist scaffold`,
    description: `[SME VALIDATION REQUIRED] Draft scaffold generated from the topic "${input.topic}". Every section below needs review — nothing operational has been invented; placeholders are marked for input.`,
    meta,
    pillars,
  };
}
