# Sanctuary Dashboard — Claude Context

> This file is auto-loaded at the start of every Claude Code session.
> Do NOT re-explore the codebase from scratch. Read `docs/SESSION-LOG.md` for latest state.

## Project

Sanctuary OS — AI-native startup accelerator platform. Monorepo (Turborepo + npm workspaces).

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 4, Radix UI, shadcn/ui
- **Auth:** Supabase Auth (email + OAuth)
- **Database:** Supabase (PostgreSQL + RLS)
- **State:** Zustand (client), React Hook Form + Zod (forms)
- **AI:** Anthropic Claude SDK, Vercel AI SDK
- **Research:** Tavily API (web search)
- **Charts:** Recharts
- **Deployment:** Vercel

## Monorepo Structure

```
apps/
  dashboard/     → Main app (port 3005) — ACTIVE
  community/     → Events hub — PLANNED
  marketing/     → Public site — PLANNED
packages/
  ui/            → Shared UI components
  database/      → Supabase client & types
  config/        → Shared TS/ESLint config
```

## Dashboard App Layout

```
apps/dashboard/src/
  app/
    (onboarding)/          → Public apply + interview flow
    auth/                  → Login, signup, role-select, callback
    founder/               → Founder portal (dashboard, apply, interview, company, docs, metrics, progress, requests, settings)
    partner/               → Partner portal (dashboard, applications, portfolio, mentors, matches, metrics, shared-views, settings)
    api/
      applications/        → CRUD + research/assess/interview/memo/dd sub-routes
      founder/             → company, documents, metrics, progress, requests
      partner/             → applications
      interview/chat/      → Streaming interview chat
  components/
    dd/                    → Due diligence UI (score header, category cards, claim rows, red flags, badges)
    layout/                → Sidebar, Header
    matching/              → Match cards, score breakdown
    metrics/               → Charts, KPI cards
    mentors/               → Mentor cards, expertise badges
    onboarding/            → Apply form, interview chat
    portfolio/             → Startup cards, tables
    startup/               → Profile, scores, checkpoints, founders
    ui/                    → shadcn primitives
  lib/
    ai/
      agents/              → interview-agent, claude-interview-agent, assessment-agent, research-agent, memo-generator, claim-extraction-agent, claim-verification-agent, document-verification-agent, dd-report-generator
      prompts/             → interview-system, assessment-system, research-system, memo-system, claim-extraction-system, claim-verification-system, dd-report-system
      types/               → due-diligence.ts (DD-specific types, kept separate from main types/index.ts)
    mock-data/             → Legacy mock data (mostly stripped, empty states used)
    research/              → tavily-client
    stores/                → auth-store, interview-store
    supabase/              → client, server, middleware, auth, index
  types/                   → index.ts, metadata.ts
  middleware.ts            → Auth + route protection
```

## Key Commands

```bash
npm run dev:dashboard      # Start dev server (port 3005)
npm run build:dashboard    # Production build
npm run dev                # Start all apps
npm run build              # Build all apps
```

## Git

- Main branch: `main` (deployed to Vercel)
- Remote branches: `bifurcated-version`, `design-system-version`, `supabase-integration`

## Key Docs

- `PRD.md` — Product requirements (MVP spec)
- `docs/TRACKER.md` — Task tracker (MVP complete, Phase 2/3 items)
- `docs/MVP-ROADMAP-STREAMLINED.md` — Streamlined agent MVP plan
- `docs/INTERVIEW-AGENT-V2-PLAN.md` — Interview Agent V2 upgrade plan
- `docs/SANCTUARY-OS-PRD-V3.md` — Full Sanctuary OS vision
- `docs/SESSION-LOG.md` — **Read this for latest project state**

## AI Agent Pipeline

```
Application → Interview → Assessment → Research → Memo → Due Diligence
```

**Due Diligence (built 2026-02-17):**
- Pipeline: Claim Extraction → Claim Verification (Tavily) → Document Verification → DD Report
- API: `/api/applications/[id]/dd` (POST runs full pipeline, GET returns status)
- API: `/api/applications/[id]/dd/claims` (GET filterable claims)
- API: `/api/applications/[id]/dd/report` (GET report, POST regenerate)
- UI: `/partner/applications/[id]/dd` (dedicated DD dashboard page)
- Types: `lib/ai/types/due-diligence.ts` (DDClaim, DDVerification, DueDiligenceReport, etc.)
- DB: `supabase/migrations/005_due_diligence_schema.sql` (dd_claims, dd_verifications, dd_reports tables)
- **Migration 005 must be run in Supabase before DD works with real data**

## Rules

- Always read `docs/SESSION-LOG.md` before starting work
- After completing work in a session, append a new entry to `docs/SESSION-LOG.md`
- Never re-scan the full codebase; use this file + session log for context
- The dashboard app is the only active app; community and marketing are stubs
