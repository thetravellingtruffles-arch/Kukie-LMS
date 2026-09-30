import { supabase } from "@/lib/supabase/client";
import type { Course, CourseMeta, CourseStatus, Pillar, QuizQuestion, Slide, SlideType, QuestionType } from "@/lib/types";

// ---------------------------------------------------------------------------
// Row -> app-type mappers
// ---------------------------------------------------------------------------

function dbToCourse(row: any): Course {
  return {
    id: row.id,
    slug: row.slug,
    moduleNumber: row.module_number,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    version: row.version,
    difficulty: row.difficulty,
    trainerName: row.trainer_name,
    status: row.status,
    meta: (row.meta ?? {}) as CourseMeta,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function dbToPillar(row: any): Pillar {
  return {
    id: row.id,
    index: row.index,
    name: row.name,
    shortName: row.short_name,
    description: row.description ?? "",
    color: row.color,
    icon: row.icon,
  };
}

function dbToSlide(row: any): Slide {
  const c = row.content ?? {};
  return {
    id: row.id,
    pillarId: row.pillar_id,
    index: row.index,
    type: row.type as SlideType,
    eyebrow: row.eyebrow ?? undefined,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    bullets: c.bullets,
    stat: c.stat,
    framework: c.framework,
    scenario: c.scenario,
    quote: c.quote,
    checklist: c.checklist,
    notes: row.notes ?? "",
    durationMin: row.duration_min,
  };
}

function dbToQuestion(row: any): QuizQuestion {
  return {
    id: row.id,
    pillarId: row.pillar_id,
    type: row.type as QuestionType,
    prompt: row.prompt,
    options: row.options ?? undefined,
    correctAnswer: row.correct_answer,
    explanation: row.explanation ?? "",
    difficulty: row.difficulty,
  };
}

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------

export async function fetchCourses(): Promise<Course[]> {
  const { data, error } = await supabase.from("kukie_academy_courses").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(dbToCourse);
}

export async function fetchCourseBySlug(slug: string): Promise<Course | null> {
  const { data, error } = await supabase.from("kukie_academy_courses").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data ? dbToCourse(data) : null;
}

export async function fetchCourseById(id: string): Promise<Course | null> {
  const { data, error } = await supabase.from("kukie_academy_courses").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? dbToCourse(data) : null;
}

export interface NewCourseInput {
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  difficulty?: Course["difficulty"];
  moduleNumber?: number;
  meta?: CourseMeta;
}

export async function createCourse(input: NewCourseInput): Promise<Course> {
  const { data, error } = await supabase
    .from("kukie_academy_courses")
    .insert({
      slug: input.slug,
      title: input.title,
      subtitle: input.subtitle ?? null,
      description: input.description ?? null,
      difficulty: input.difficulty ?? "Foundation",
      module_number: input.moduleNumber ?? 2,
      status: "draft",
      meta: input.meta ?? {},
    })
    .select()
    .single();
  if (error) throw error;
  return dbToCourse(data);
}

export async function updateCourse(id: string, patch: Partial<{
  title: string; subtitle: string | null; description: string | null; version: string;
  difficulty: Course["difficulty"]; trainerName: string | null; status: CourseStatus; meta: CourseMeta;
}>): Promise<Course> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.title !== undefined) payload.title = patch.title;
  if (patch.subtitle !== undefined) payload.subtitle = patch.subtitle;
  if (patch.description !== undefined) payload.description = patch.description;
  if (patch.version !== undefined) payload.version = patch.version;
  if (patch.difficulty !== undefined) payload.difficulty = patch.difficulty;
  if (patch.trainerName !== undefined) payload.trainer_name = patch.trainerName;
  if (patch.status !== undefined) payload.status = patch.status;
  if (patch.meta !== undefined) payload.meta = patch.meta;

  const { data, error } = await supabase.from("kukie_academy_courses").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return dbToCourse(data);
}

export async function deleteCourse(id: string): Promise<void> {
  const { error } = await supabase.from("kukie_academy_courses").delete().eq("id", id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Pillars
// ---------------------------------------------------------------------------

export async function fetchPillars(courseId: string): Promise<Pillar[]> {
  const { data, error } = await supabase.from("kukie_academy_pillars").select("*").eq("course_id", courseId).order("index");
  if (error) throw error;
  return (data ?? []).map(dbToPillar);
}

export async function createPillar(courseId: string, input: { index: number; name: string; shortName: string; description?: string; color?: Pillar["color"]; icon?: string }): Promise<Pillar> {
  const { data, error } = await supabase
    .from("kukie_academy_pillars")
    .insert({
      course_id: courseId,
      index: input.index,
      name: input.name,
      short_name: input.shortName,
      description: input.description ?? null,
      color: input.color ?? "brand",
      icon: input.icon ?? "Sparkles",
    })
    .select()
    .single();
  if (error) throw error;
  return dbToPillar(data);
}

export async function updatePillar(id: string, patch: Partial<{ index: number; name: string; shortName: string; description: string; color: Pillar["color"]; icon: string }>): Promise<Pillar> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.index !== undefined) payload.index = patch.index;
  if (patch.name !== undefined) payload.name = patch.name;
  if (patch.shortName !== undefined) payload.short_name = patch.shortName;
  if (patch.description !== undefined) payload.description = patch.description;
  if (patch.color !== undefined) payload.color = patch.color;
  if (patch.icon !== undefined) payload.icon = patch.icon;
  const { data, error } = await supabase.from("kukie_academy_pillars").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return dbToPillar(data);
}

export async function deletePillar(id: string): Promise<void> {
  const { error } = await supabase.from("kukie_academy_pillars").delete().eq("id", id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Slides
// ---------------------------------------------------------------------------

export async function fetchSlides(courseId: string): Promise<Slide[]> {
  const { data, error } = await supabase.from("kukie_academy_slides").select("*").eq("course_id", courseId).order("index");
  if (error) throw error;
  return (data ?? []).map(dbToSlide);
}

export interface SlideInput {
  pillarId: string | null;
  index: number;
  type: SlideType;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  bullets?: string[];
  stat?: Slide["stat"];
  framework?: Slide["framework"];
  scenario?: Slide["scenario"];
  quote?: Slide["quote"];
  checklist?: Slide["checklist"];
  notes?: string;
  durationMin?: number;
}

function slideContentPayload(input: SlideInput) {
  return {
    bullets: input.bullets,
    stat: input.stat,
    framework: input.framework,
    scenario: input.scenario,
    quote: input.quote,
    checklist: input.checklist,
  };
}

export async function createSlide(courseId: string, input: SlideInput): Promise<Slide> {
  const { data, error } = await supabase
    .from("kukie_academy_slides")
    .insert({
      course_id: courseId,
      pillar_id: input.pillarId,
      index: input.index,
      type: input.type,
      eyebrow: input.eyebrow ?? null,
      title: input.title,
      subtitle: input.subtitle ?? null,
      content: slideContentPayload(input),
      notes: input.notes ?? "",
      duration_min: input.durationMin ?? 2,
    })
    .select()
    .single();
  if (error) throw error;
  return dbToSlide(data);
}

export async function updateSlide(id: string, input: Partial<SlideInput>): Promise<Slide> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.pillarId !== undefined) payload.pillar_id = input.pillarId;
  if (input.index !== undefined) payload.index = input.index;
  if (input.type !== undefined) payload.type = input.type;
  if (input.eyebrow !== undefined) payload.eyebrow = input.eyebrow;
  if (input.title !== undefined) payload.title = input.title;
  if (input.subtitle !== undefined) payload.subtitle = input.subtitle;
  if (input.notes !== undefined) payload.notes = input.notes;
  if (input.durationMin !== undefined) payload.duration_min = input.durationMin;
  if (
    input.bullets !== undefined || input.stat !== undefined || input.framework !== undefined ||
    input.scenario !== undefined || input.quote !== undefined || input.checklist !== undefined
  ) {
    payload.content = slideContentPayload(input as SlideInput);
  }
  const { data, error } = await supabase.from("kukie_academy_slides").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return dbToSlide(data);
}

export async function deleteSlide(id: string): Promise<void> {
  const { error } = await supabase.from("kukie_academy_slides").delete().eq("id", id);
  if (error) throw error;
}

export async function reorderSlides(updates: { id: string; index: number }[]): Promise<void> {
  await Promise.all(updates.map((u) => supabase.from("kukie_academy_slides").update({ index: u.index }).eq("id", u.id)));
}

// ---------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------

export async function fetchQuestions(courseId: string): Promise<QuizQuestion[]> {
  const { data, error } = await supabase.from("kukie_academy_questions").select("*").eq("course_id", courseId).order("created_at");
  if (error) throw error;
  return (data ?? []).map(dbToQuestion);
}

export interface QuestionInput {
  pillarId: string | null;
  type: QuestionType;
  prompt: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  difficulty?: QuizQuestion["difficulty"];
}

export async function createQuestion(courseId: string, input: QuestionInput): Promise<QuizQuestion> {
  const { data, error } = await supabase
    .from("kukie_academy_questions")
    .insert({
      course_id: courseId,
      pillar_id: input.pillarId,
      type: input.type,
      prompt: input.prompt,
      options: input.options ?? [],
      correct_answer: input.correctAnswer,
      explanation: input.explanation ?? "",
      difficulty: input.difficulty ?? "foundation",
    })
    .select()
    .single();
  if (error) throw error;
  return dbToQuestion(data);
}

export async function updateQuestion(id: string, input: Partial<QuestionInput>): Promise<QuizQuestion> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.pillarId !== undefined) payload.pillar_id = input.pillarId;
  if (input.type !== undefined) payload.type = input.type;
  if (input.prompt !== undefined) payload.prompt = input.prompt;
  if (input.options !== undefined) payload.options = input.options;
  if (input.correctAnswer !== undefined) payload.correct_answer = input.correctAnswer;
  if (input.explanation !== undefined) payload.explanation = input.explanation;
  if (input.difficulty !== undefined) payload.difficulty = input.difficulty;
  const { data, error } = await supabase.from("kukie_academy_questions").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return dbToQuestion(data);
}

export async function deleteQuestion(id: string): Promise<void> {
  const { error } = await supabase.from("kukie_academy_questions").delete().eq("id", id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Whole-course fetch, for preview/present/assessment routes
// ---------------------------------------------------------------------------

export async function fetchCourseBundle(slug: string) {
  const course = await fetchCourseBySlug(slug);
  if (!course) return null;
  const [pillars, slides, questions] = await Promise.all([
    fetchPillars(course.id),
    fetchSlides(course.id),
    fetchQuestions(course.id),
  ]);
  return { course, pillars, slides, questions };
}
