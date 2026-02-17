# Session Log

> Append-only log of work done per session. Read top-to-bottom for full history.
> Latest entry = current project state.

---

## Session: 2026-02-12 — Initial State Capture

### What Was Done Before This Log Existed

**Build-out (chronological from git history):**

1. **v0.1.0** — Initial MVP: portfolio management, startup profiles, checkpoints, scoring, metrics, mentor matching, onboarding flow, all with mock data
2. **v0.2.0** — AI Interview System: Claude API integration, interview chat API route, mock fallback mode
3. **v0.3.0** — Bifurcated user flow: separate Founder (`/founder/*`) and Partner (`/partner/*`) portals with full feature set
4. **v0.4.0** — Supabase integration: auth, database schema, RLS policies, browser/server clients
5. **v1.0.0** — Monorepo restructure: Turborepo, `apps/` + `packages/`, `@sanctuary/*` namespace

**Post-monorepo work (latest commits on `main`):**

- Connected apply form, interview flow, founder dashboard, and partner applications to Supabase
- Built AI agent pipeline: Interview Agent → Assessment Agent → Research Agent (Tavily) → Memo Generator
- Added self-improving agent mesh with enriched metadata collection
- Removed all mock data (empty states for real data)
- Fixed auth flow: role-based route guards, smart login redirect, partner store sync
- Fixed Vercel deployment: auth timeout, error handling, env vars

### Current State

- **Deployed:** Yes, on Vercel with Supabase backend
- **Auth:** Working (Supabase Auth, email + OAuth)
- **Data:** Real Supabase data (mock data stripped)
- **AI Pipeline:** Interview → Assessment → Research → Memo (all built, all have API routes)
- **Branch:** `main`, clean working tree

### What's Next (Prioritized)

1. **Interview Agent V2** — Upgrade from basic Q&A to surgical assessment (detailed plan in `docs/INTERVIEW-AGENT-V2-PLAN.md`):
   - 8 dimensions (from 5), 10 questioning techniques, founder chemistry assessment, Startup DNA Report output
   - Files to create/modify: `lib/ai/prompts/interview-system-v2.ts`, `lib/ai/agents/claude-interview-agent-v2.ts`, `lib/ai/types/interview-v2.ts`, etc.

2. **Enhanced Application Form V2** — 9-section comprehensive form (plan in `docs/MVP-ROADMAP-STREAMLINED.md`)

3. **Phase 2 tracker items** (from `docs/TRACKER.md`):
   - Document Center (upload/organize pitch decks)
   - Investment Readiness Score
   - Notifications (checkpoint alerts)

4. **Phase 3** — Sentinel Agent, Compass Agent, Integrations, GTM Module, Hiring Tracker, Predictive Scoring

### Open Questions / Decisions Needed

- None currently — Interview Agent V2 plan is approved and ready to build

---

## Session: 2026-02-17 — Due Diligence Layer

### What Was Done

Built the full Due Diligence layer — AI-powered claim extraction, multi-source verification, and DD report generation.

**Files Created:**

1. **Types:** `lib/ai/types/due-diligence.ts` — DDClaim, DDVerification, DDCategoryScore, DueDiligenceReport, all agent input/output types, category weights/labels/priorities
2. **Migration:** `supabase/migrations/005_due_diligence_schema.sql` — dd_claims, dd_verifications, dd_reports tables + RLS + dd_status columns on applications + updated agent_runs constraint
3. **Claim Extraction Agent:** `lib/ai/agents/claim-extraction-agent.ts` + `lib/ai/prompts/claim-extraction-system.ts` — Extracts every verifiable factual claim from application data, interview transcript, and research data
4. **Claim Verification Agent:** `lib/ai/agents/claim-verification-agent.ts` + `lib/ai/prompts/claim-verification-system.ts` — Verifies claims via Tavily web search + Claude analysis, batched by category
5. **Document Verification Agent:** `lib/ai/agents/document-verification-agent.ts` — Cross-references uploaded documents against claims using Tavily extract + Claude
6. **DD Report Generator:** `lib/ai/agents/dd-report-generator.ts` + `lib/ai/prompts/dd-report-system.ts` — Deterministic scoring (weighted category confidence) + Claude executive summary
7. **API Routes:**
   - `app/api/applications/[id]/dd/route.ts` — GET status, POST full pipeline
   - `app/api/applications/[id]/dd/claims/route.ts` — GET claims (filterable by category/status/priority)
   - `app/api/applications/[id]/dd/report/route.ts` — GET report, POST regenerate
8. **UI Components:**
   - `components/dd/dd-score-header.tsx` — Grade badge + score + metrics
   - `components/dd/dd-category-card.tsx` — Per-category confidence card
   - `components/dd/dd-red-flags.tsx` — Red flags panel
   - `components/dd/claim-row.tsx` — Expandable claim row with verifications
   - `components/dd/verification-badge.tsx` — Color-coded verdict/status/priority badges
   - `components/dd/index.ts` — Barrel export
9. **DD Page:** `app/partner/applications/[id]/dd/page.tsx` — Full DD dashboard with Overview/Claims/Red Flags tabs
10. **Integration:** Added DD tab link to `app/partner/applications/[id]/page.tsx`, added ddStatus to partner application API response

**All agents follow the existing pattern:** Class + MockAgent + singleton factory. Mock mode activates when API keys are missing.

**Build:** `npm run build:dashboard` passes with zero errors.

### Current State

- **AI Pipeline:** Interview → Assessment → Research → Memo → **Due Diligence** (all built)
- **DD Pipeline:** Claim Extraction → Claim Verification → Document Verification → Report Generation
- **Migration:** 005 needs to be run in Supabase SQL Editor before DD works with real data
- **Branch:** `main`, uncommitted DD changes

### What's Next

1. Run migration 005 in Supabase
2. Test DD pipeline end-to-end with a real application
3. Phase 2: Mentor review workflow for DD claims
4. Interview Agent V2 (from previous session plan)
