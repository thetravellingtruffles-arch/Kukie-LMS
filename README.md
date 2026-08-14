# SALT Academy — Module 001: Sales Build-Up Excellence

A production-quality prototype of a sales performance improvement platform for restaurants, cafés, QSR and hotel F&B teams. Built with Next.js (App Router), TypeScript, Tailwind CSS v4, Radix UI primitives, Framer Motion and Recharts.

This is Module 001 of SALT Academy. It establishes the framework — page structure, data model, design system, six-pillar curriculum architecture, and measurement approach — that every future module reuses.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 — it redirects to `/login`. Any email/password on the login screen signs you in (no real auth backend; this is a front-end prototype over generated sample data).

To build for production:

```bash
npm run build
npm start
```

## What's included

The app is fully wired end-to-end: Presentation → Attendance → Workbook → Assessment → Practical Observation → Role Play → Manager Follow-Up → Certificate → Analytics → Sales Impact, all backed by a deterministic generated dataset (12 stores, 350 employees, 30 managers, 4 trainers, and thousands of assessment/attendance/certificate records — see `src/lib/data/generate.ts`).

Pages:

- `/login` — branded login screen with dark mode
- `/dashboard` — home dashboard with org-wide KPIs, store heat map, compliance
- `/course` — course overview organized by the six learning pillars
- `/course/present` — full presentation mode (51 slides, thumbnails, speaker notes, timer, fullscreen)
- `/course/workbook` — interactive digital participant workbook
- `/course/attendance` — QR + manual attendance with a live log
- `/course/assessment` — 20-question knowledge assessment, auto-marked, 80% pass mark
- `/course/practical` — trainer-scored 10-point practical rubric
- `/course/roleplay` — guided "Guest Orders a Burger" role play with step scoring
- `/course/followup` — 30-day manager follow-up survey
- `/course/certificate` — certificate viewer with QR verification + print-to-PDF
- `/employees`, `/employees/[id]` — directory + individual learning passport
- `/stores`, `/stores/[id]` — store directory + store dashboard
- `/regional` — cross-store, manager and trainer comparison
- `/executive` — company overview, ROI model, promotion pipeline
- `/analytics` — score distributions, competency heat maps, department/trainer/manager performance
- `/sales-impact` — before/7/30/90-day KPI comparison, employee sales ranking
- `/reports` — generates real PDF (jsPDF), Excel (SheetJS), CSV and PowerPoint (PptxGenJS) exports client-side

## Curriculum architecture — six learning pillars

Every learning object (slide, quiz question, workbook prompt, practical rubric item) is tagged with a `pillarId`. This is what lets Analytics break performance down by pillar, and it's the template future modules (Food Safety, Leadership, Coffee Excellence, Guest Experience, etc.) should reuse — see `src/lib/curriculum/`.

1. The Science of Restaurant Sales
2. The Psychology of Buying
3. Sales Through Hospitality
4. Advanced Selling Techniques
5. Operational Execution
6. Measuring Success

## Project structure

```
src/
  app/                 # routes (App Router)
  components/
    ui/                # hand-built shadcn-style primitives (button, card, dialog, etc.)
    layout/             # sidebar, topbar, app shell
    charts/             # recharts wrappers (trend line, bar, radar, donut, heatmap)
    presentation/        # slide renderer + presentation client
    assessment/, practical/, roleplay/, followup/, certificate/, workbook/, attendance/, reports/
  lib/
    types.ts            # domain types
    curriculum/          # pillars, 51 slides, 36-question bank
    data/                # seeded generator + selectors (DATA singleton)
```

## Notes for extending

- All sample data is generated deterministically at server start (`src/lib/data/dataset.ts`) — there's no real backend. Wire it to Supabase/Postgres by replacing the selectors in `src/lib/data/selectors.ts` with real queries; the page components already consume that layer, not the generator directly.
- Interactive forms (workbook, practical, role play, follow-up) hold state locally and don't persist across reloads — that's the natural place to add real writes once a backend is connected.
- Fonts load from Google Fonts via a `<link>` tag in `src/app/layout.tsx` rather than `next/font`, so the build doesn't require network access to fonts.googleapis.com.
