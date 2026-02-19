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

---

## Session: 2026-02-18 — Migration 005 Applied

### What Was Done

Ran migration 005 (Due Diligence schema) against remote Supabase.

**Steps:**
1. Installed Supabase CLI as dev dependency (`npm install -D supabase`)
2. Linked project via `supabase link --project-ref hkncorpplwqxccbjrkmo`
3. Marked migrations 002-004 as already applied (they were run manually before migration tracking was set up)
4. Fixed migration 005:
   - Replaced `uuid_generate_v4()` → `gen_random_uuid()` (not available in remote PG)
   - Added `CREATE OR REPLACE FUNCTION update_updated_at()` (may not exist from migration 002)
   - Wrapped `agent_runs` constraint update in `DO` block with existence check (table doesn't exist in remote)
5. Pushed migration 005 — applied successfully

**Tables created:** `dd_claims`, `dd_verifications`, `dd_reports`
**Columns added to `applications`:** `dd_status`, `dd_report_id`, `dd_started_at`, `dd_completed_at`

**DD Pipeline E2E Test (Spacekayak):**
- Added `createAdminClient()` to `lib/supabase/server.ts` (service-role client, bypasses RLS)
- Updated all 3 DD API routes (`dd/`, `dd/claims/`, `dd/report/`) to use admin client
- Ran full pipeline against Spacekayak application (`106e6699...`)
- **Claim Extraction** (real Claude): Extracted 11 claims from application data across 6 categories
- **Claim Verification** (mock — no Tavily key): 11 mock verifications generated
- **Report Generation** (real Claude): Score 74/100, Grade C, 3 red flags, executive summary
- All data persisted to Supabase: `dd_claims` (11), `dd_verifications` (11), `dd_reports` (1)
- Application `dd_status` updated to `completed`
- All 3 GET endpoints verified working: status, claims (with category filter), report

**Note:** `agent_runs` table doesn't exist in remote (from migration 002 which was never applied). The 3 agent_runs inserts in the DD route fail silently. Non-blocking but should be fixed eventually.

### Current State

- **Migration 005:** Applied ✓
- **DD Pipeline:** E2E tested ✓ (mock verification, real extraction + report)
- **Admin Client:** Added for server-side pipeline routes
- **Supabase CLI:** Installed and linked to project
- **Branch:** `main`, uncommitted changes

### What's Next

1. Add Tavily API key and re-test with real verification
2. Interview Agent V2
3. Apply migration 002 properly (creates `agent_runs` + enriched metadata tables)
4. Phase 2: Mentor review workflow for DD claims

---

## Session: 2026-02-18 — Ship-Ready Fixes (COMPLETE)

### What Was Done

Executing 4-item ship-ready fix plan. Code changes complete, Supabase operations paused.

**Completed:**

1. **Migration 002 fixed** — Replaced 5x `uuid_generate_v4()` → `gen_random_uuid()`. Also added DD agent types (`dd_claim_extraction`, `dd_claim_verification`, `dd_document_verification`, `dd_report_generation`, `memo_generation`) to `agent_runs` CHECK constraint so migration 005's DO block (which skipped because table didn't exist) is covered.

2. **Tavily API key added** — `TAVILY_API_KEY=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` added to `apps/dashboard/.env.local`

3. **Founder dashboard rewritten** — `apps/dashboard/src/app/founder/dashboard/page.tsx`:
   - Fetches applications via `GET /api/applications`
   - No applications → "Apply Now" CTA + quick action cards
   - Has applications → application card with company name, date, status badge
   - 4-step progress indicator: Applied → Interviewed → Under Review → Decision
   - Decision card: green "Congratulations" if approved, neutral "Thank you" if rejected
   - Waiting card: "Application Under Review" message when no decision yet
   - Quick action cards: Documents, Company Profile

4. **Interview complete page updated** — `apps/dashboard/src/app/(onboarding)/interview/[applicationId]/complete/page.tsx`:
   - "Return to Homepage" → "View Application Status" linking to `/founder/dashboard`

5. **Partner PATCH route updated** — `apps/dashboard/src/app/api/partner/applications/[id]/route.ts`:
   - Added `review_decision: action` to update payload so founder can see the decision

6. **Build passes** — `npm run build:dashboard` zero errors

**Remaining (Supabase operations):**

1. **Migrations 002-004**: User ran `supabase migration repair --status reverted` for 002, 003, 004. Next step: `npx supabase db push --linked` (needs DB password).

2. **Documents storage bucket**: After migrations, run SQL to create `documents` bucket (public), add storage policies for upload/read/delete by authenticated users.

   SQL to run:
   ```sql
   INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true) ON CONFLICT (id) DO UPDATE SET public = true;
   CREATE POLICY IF NOT EXISTS "Authenticated users can upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents');
   CREATE POLICY IF NOT EXISTS "Public read access" ON storage.objects FOR SELECT USING (bucket_id = 'documents');
   CREATE POLICY IF NOT EXISTS "Authenticated users can delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'documents');
   ```

### Current State

- **Code changes:** All complete ✓
- **Build:** Passes ✓
- **Supabase CLI:** Linked, access token set (`sbp_...`), migrations 002-004 reverted
- **Pending:** `supabase db push --linked` then storage bucket SQL
- **Branch:** `main`, uncommitted changes

### Resume Checklist

All items completed in session 2026-02-19 — see below.

---

## Session: 2026-02-19 — Migrations Applied + DD E2E with Real Tavily

### What Was Done

Completed the resume checklist from the previous session.

**1. Migrations 002-004 pushed to remote Supabase:**
- Repaired migration tracking (002, 003, 004 marked as reverted)
- Pushed with `--include-all` flag since they preceded already-applied migration 005
- All 3 applied successfully. `IF NOT EXISTS` handled columns that were already added manually
- 8 new tables confirmed: `agent_runs`, `interview_signals`, `assessment_feedback`, `startup_outcomes`, `signal_weights`, `founder_requests`, `partner_feedback`, `shared_metrics`

**2. Documents storage bucket created:**
- Created `documents` bucket (public) via Supabase Storage API
- Added RLS policies via migration 006 (`006_documents_storage_policies.sql`):
  - Authenticated users can upload
  - Public read access
  - Authenticated users can delete

**3. DD pipeline tested with real Tavily verification:**
- Force re-ran full DD pipeline against Spacekayak application
- All 10 claims verified via real Tavily web search (no mock data)
- Results much more nuanced than mock run:
  - Score: 54/100, Grade D (down from 74/C with mocks)
  - Team background: 3/3 confirmed (100% confidence)
  - Traction: 3 claims disputed (inconsistencies between LinkedIn and website)
  - Revenue metrics: unverified ($15k MRR claim)
  - Customer reference: AI-verified
- Executive summary accurately flagged metric inconsistencies as red flags

**4. Build verified:** `npm run build:dashboard` passes with zero errors

**Files Created:**
- `supabase/migrations/006_documents_storage_policies.sql`

### Current State

- **All migrations:** 002-006 applied to remote Supabase ✓
- **Storage:** `documents` bucket created with RLS policies ✓
- **DD Pipeline:** Fully functional with real Tavily verification ✓
- **Build:** Passes ✓
- **Branch:** `main`, uncommitted changes

### What's Next

1. Interview Agent V2 (detailed plan in `docs/INTERVIEW-AGENT-V2-PLAN.md`)
2. Enhanced Application Form V2
3. Phase 2: Document Center, Investment Readiness Score, Notifications
4. Commit all uncommitted changes
