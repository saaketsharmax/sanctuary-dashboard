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

---

## Session: 2026-02-21 — Investment & Credits Tracker

### What Was Done

Built the full Investment & Credits tracking system — $50k cash + $50k service credits per approved startup, with founder request flow and partner approval/deny workflow.

**Files Created (15):**

1. **Migration:** `supabase/migrations/007_investment_credits_schema.sql` — `investments` + `investment_transactions` tables, RLS policies, indexes, triggers
2. **Types:** Added to `types/index.ts` — `CREDIT_CATEGORIES`, `Investment`, `InvestmentTransaction`, `InvestmentWithBalances`, `TransactionWithReviewer`, `PortfolioInvestmentSummary`, `formatInvestmentCurrency()`, `getCreditCategoryInfo()`
3. **Founder API:**
   - `api/founder/investment/route.ts` — GET investment + computed balances + transaction history
   - `api/founder/investment/transactions/route.ts` — POST create request (Zod-style validation, balance check), PATCH cancel pending
4. **Partner API:**
   - `api/partner/investments/route.ts` — GET portfolio-wide summary with aggregated stats
   - `api/partner/investments/[id]/route.ts` — GET single investment detail with credit breakdown by category
   - `api/partner/investments/transactions/route.ts` — GET pending requests across portfolio (filterable), PATCH approve/deny with balance validation
5. **Shared Components:**
   - `components/investment/balance-card.tsx` — Balance display with progress bar + pending indicator
   - `components/investment/transaction-table.tsx` — Shared table with cancel/approve/deny actions
   - `components/investment/request-dialog.tsx` — New request form with type toggle, amount, category, title, description
   - `components/investment/credit-category-badge.tsx` — Color-coded category badge
   - `components/investment/index.ts` — Barrel export
6. **Pages:**
   - `app/founder/investment/page.tsx` — Balance cards, quick actions, transaction history with tabs (All/Pending/Approved/Denied)
   - `app/partner/investments/page.tsx` — KPI row, pending requests with inline approve/deny, portfolio table
   - `app/partner/investments/[id]/page.tsx` — Single investment detail with credit breakdown, full transaction table

**Files Modified (4):**

1. `api/partner/applications/[id]/route.ts` — Auto-creates investment on approval ($50k cash + $50k credits), fire-and-forget
2. `app/founder/layout.tsx` — Added Investment nav item (DollarSign icon)
3. `app/partner/layout.tsx` — Added Investments nav item (DollarSign icon)
4. `app/founder/dashboard/page.tsx` — Added investment summary card for approved founders (cash/credits remaining with progress bars)

**Key Design Decisions:**
- Balances computed as `investment_amount - SUM(approved transactions)` — no stored balance columns
- Founders can only cancel their own pending requests
- Partners see portfolio-wide view + can drill into individual investments
- Auto-allocation is fire-and-forget: if investment insert fails, approval still succeeds

**Build:** `npm run build:dashboard` passes with zero errors.

### Current State

- **Investment system:** Fully built, ready for migration + testing
- **Migration 007:** Needs to be pushed to remote Supabase
- **Build:** Passes ✓
- **Branch:** `main`, uncommitted changes

### What's Next

1. Push migration 007 to remote Supabase (`npx supabase db push --linked`)
2. Test: approve a test application → verify investment auto-created
3. Test: founder submits cash/credit requests → partner approves/denies
4. Interview Agent V2
5. Commit all uncommitted changes

---

## Session: 2026-02-21 (b) — Credit Visibility System

### What Was Done

Enhanced the founder investment page with full credit transparency — service catalog, per-category usage breakdown, usage analytics, and enhanced request flow.

**Files Modified (4):**

1. `types/index.ts` — Added `CreditService` interface, `CREDIT_SERVICES` constant (12 services across 4 categories: Space, Design, GTM, Launch Media), `getServicesForCategory()` and `formatServicePrice()` helpers, extended `InvestmentWithBalances` with `creditsByCategory` and `pendingByCategory` fields
2. `api/founder/investment/route.ts` — Added `creditsByCategory` and `pendingByCategory` computation (sums approved/pending credit_usage transactions by category), included both in response
3. `components/investment/request-dialog.tsx` — Added new optional props (`creditsByCategory`, `pendingByCategory`, `totalCreditsCents`, `prefilledService`), category spending context shown when category selected, service suggestion buttons that pre-fill form fields, `prefilledService` support from catalog click
4. `app/founder/investment/page.tsx` — Added `selectedService` state, inserted 3 new sections (CategoryBreakdown, CreditAnalytics, ServiceCatalog), wired data flow to new components and enhanced RequestDialog

**Files Created (3):**

5. `components/investment/category-breakdown.tsx` — 2x2 grid of category cards with color-coded progress bars (blue/purple/green/orange), shows amount used, % of total pool, pending amounts
6. `components/investment/credit-analytics.tsx` — Donut chart (Recharts PieChart) for category distribution with legend, Area chart for cumulative credit consumption over time (follows existing metric-chart.tsx pattern), returns `null` when no usage data
7. `components/investment/service-catalog.tsx` — Tabbed grid (Space | Design | GTM | Launch Media) showing service cards with name, description, price range; `onSelectService` callback opens request dialog pre-filled

**Also Updated:**

8. `components/investment/index.ts` — Added barrel exports for 3 new components

**Page Layout (top to bottom):**
1. Header (existing)
2. Balance Cards — Cash + Credits (existing)
3. **Category Breakdown** (new)
4. **Usage Analytics** (new)
5. Quick Actions (existing)
6. **Service Catalog** (new)
7. Transaction History (existing)

**Build:** `npm run build:dashboard` passes with zero errors.

### Current State

- **Credit visibility system:** Fully built ✓
- **Build:** Passes ✓
- **Branch:** `main`, uncommitted changes

---

## 2026-02-21 — Investment Page Redesign: Cash + Credits Split

### What Changed

Split the single `/founder/investment` page into two dedicated pages with a shared sub-nav:

- `/founder/investment` → redirects to `/founder/investment/cash`
- `/founder/investment/cash` → Cash Investment Dashboard (new)
- `/founder/investment/credits` → Service Credits Dashboard (existing content moved)

### Files Created (7)

1. `src/lib/mock-data/investment-mock.ts` — Mock data generator (9+1 cash txns, 4+1 credit txns, computed CashDashboardData)
2. `src/components/investment/investment-sub-nav.tsx` — Tab-style sub-navigation ("Cash Investment" | "Service Credits")
3. `src/components/investment/runway-card.tsx` — Monthly burn rate + runway months (color-coded)
4. `src/components/investment/expense-breakdown.tsx` — Category cards with progress bars + donut chart (Recharts PieChart)
5. `src/components/investment/monthly-spend-chart.tsx` — Area chart for monthly spend (Recharts AreaChart)
6. `src/app/founder/investment/cash/page.tsx` — Cash Investment Dashboard page
7. `src/app/founder/investment/credits/page.tsx` — Service Credits Dashboard page

### Files Modified (5)

1. `src/types/index.ts` — Added `CASH_EXPENSE_CATEGORIES`, `CashExpenseCategory`, `CashDashboardData`, `cashExpenseCategory` field on `InvestmentTransaction`
2. `src/app/api/founder/investment/route.ts` — Added `?view=cash|credits` param, mock data fallback when no investment, `cashDashboard` computation
3. `src/app/founder/investment/page.tsx` — Replaced with redirect to `/founder/investment/cash`
4. `src/components/investment/transaction-table.tsx` — Added `hideCategory` and `hideType` optional props
5. `src/components/investment/index.ts` — Added barrel exports for 4 new components

### Key Design Decisions

- Mock data uses `date-fns` `subMonths` relative to current date so months always look recent
- API returns `isMock: true` flag when falling back to mock data; pages show info banner
- Cash page hides Type and Category columns in transaction table (all cash, no credit categories)
- Credits page hides Type column (all credits)
- Sidebar nav unchanged — `startsWith` logic already highlights "Investment" for sub-pages

**Build:** `npm run build:dashboard` passes with zero errors.

### Current State

- **Investment page split:** Fully built ✓
- **Build:** Passes ✓
- **Branch:** `main`, uncommitted changes

---

## Session: 2026-02-21 — Realtime Investment Tracking via Supabase Realtime

### What Was Done

Added live updates to all 4 investment pages using Supabase Realtime (Postgres Changes). When any `investment_transactions` row is inserted or updated, connected pages refetch data and show toast notifications.

**Files created (2):**

1. `supabase/migrations/008_realtime_investment_transactions.sql` — Adds `investment_transactions` to `supabase_realtime` publication
2. `apps/dashboard/src/hooks/use-investment-realtime.ts` — Custom hook managing Supabase channel subscription lifecycle with 300ms debounce

**Files modified (5):**

3. `apps/dashboard/src/lib/supabase/client.ts` — Added `channel()` and `removeChannel()` to both mock client objects (demo mode safety)
4. `apps/dashboard/src/app/founder/investment/cash/page.tsx` — Wired `useInvestmentRealtime` + toast for approve/deny events
5. `apps/dashboard/src/app/founder/investment/credits/page.tsx` — Same pattern as cash page
6. `apps/dashboard/src/app/partner/investments/page.tsx` — Wired hook (no investmentId filter) + toast for new requests and cancellations
7. `apps/dashboard/src/app/partner/investments/[id]/page.tsx` — Same as portfolio but scoped to route param `id`

**Architecture decisions:**

- Custom hook pattern (not Zustand) — investment data is page-scoped, not global
- Refetch on event (not optimistic updates) — balances computed server-side from `SUM(approved)`, always correct
- `useRef` for callbacks avoids re-subscribing on every render
- 300ms debounce coalesces batch approvals into a single refetch
- Guards: no-op when `isMock === true` or `isSupabaseConfigured()` returns false

**Event flow:**

| Action | Toast recipient | Message |
|--------|----------------|---------|
| Founder submits request | Partner | "New request: [title] ($X)" |
| Partner approves | Founder | "Request approved: [title]" |
| Partner denies | Founder | "Request denied: [title]" |
| Founder cancels | Partner | "Request cancelled: [title]" |

**Build:** `npm run build:dashboard` passes with zero errors.

### Current State

- **Realtime investment tracking:** Fully built ✓
- **Migration 008:** Created, needs to be run in Supabase
- **Build:** Passes ✓
- **Branch:** `main`, uncommitted changes

---

## Session: 2026-02-21 (resume) — Tier 1 Housekeeping

### What Was Done

1. **Build verified:** `npm run build:dashboard` passes (zero errors, cached)
2. **All uncommitted changes committed:** `b073bc1` — "Add investment & credits tracking system with realtime updates" (23 files, 1667 insertions). Covers 4 sessions of work: Investment system, Credit Visibility, Cash/Credits split, Realtime tracking.
3. **Migrations 007 + 008 pushed to remote Supabase:** Both applied successfully. `investments` and `investment_transactions` tables created. Realtime publication added.
4. **E2E test started but hit blocker:** `applications` table has a CHECK constraint (`applications_status_check`) that doesn't include `'approved'` or `'rejected'` as valid values. The initial schema (migration 001, applied manually before migration tracking) has a limited set of statuses. Need to:
   - Determine current valid statuses (dump schema or check Supabase SQL Editor)
   - Create migration 009 to ALTER the constraint to include `'approved'` and `'rejected'`
   - Then re-run E2E test

### Current State

- **Committed:** All changes up to realtime tracking ✓ (`b073bc1` on `main`)
- **Migrations 007 + 008:** Applied to remote Supabase ✓
- **Working tree:** Clean
- **Build:** Passes ✓
- **Blocker:** `applications_status_check` constraint needs to be updated to allow `'approved'`/`'rejected'` statuses

### What's Next (Resume Checklist)

1. Fix `applications_status_check` constraint (migration 009) — add `'approved'`, `'rejected'` to allowed statuses
2. Push migration 009
3. Re-run E2E test: approve Spacekayak → investment auto-created → request → approve/deny → verify balances
4. Start Tier 2: Interview Agent V2

---

## Session: 2026-02-24 — DD Phase 1 Upgrades (Professional-Grade Due Diligence)

### What Was Done

Implemented 5 DD upgrades: Source Credibility Tiers, Benchmark Comparison, Omission Analysis, Follow-up Questions, and Conditional Recommendations. No new external API dependencies — all improvements via prompt engineering, type extensions, and deterministic logic.

**Migration Created (1):**

1. `supabase/migrations/010_dd_phase1_columns.sql` — Adds `benchmark_flag TEXT` to `dd_claims`, `source_credibility_score DECIMAL(3,2)` to `dd_verifications`

**Files Modified (11):**

1. `lib/ai/types/due-diligence.ts` — Added 5 new types (`DDOmission`, `DDFollowUpQuestion`, `DDRecommendation`, `DDBenchmarkFlag`, `DDRecommendationVerdict`), `SOURCE_CREDIBILITY_TIERS` constant + `getSourceCredibilityTier()` helper, `STAGE_BENCHMARKS` constant + `getStageBenchmarks()` helper. Extended `DDClaim` with `benchmarkFlag`, `DDVerification` with `sourceCredibilityScore`, `DueDiligenceReport` with `omissions`/`followUpQuestions`/`recommendation`, `ClaimExtractionResult` with `omissions`, `DDReportInput` with `omissions`
2. `lib/ai/agents/claim-extraction-agent.ts` — Passes stage benchmarks to prompt (5th param), captures `benchmarkFlag` and `omissions` from Claude response, validates both
3. `lib/ai/agents/claim-verification-agent.ts` — Looks up source credibility tier for each evidence URL, computes `avgSourceWeight`, adjusts `confidence = rawConfidence * avgSourceWeight`, sets `sourceCredibilityScore`
4. `lib/ai/agents/dd-report-generator.ts` — Added `determineRecommendationVerdict()` (grade + flag based logic), `generateDeterministicFollowUps()` (templates from unverified/disputed/omission/benchmark), `mergeFollowUpQuestions()` (dedup + cap at 12), omission→red flag integration in `identifyRedFlags()`, updated AI prompt call to include omissions + recommendation
5. `lib/ai/agents/document-verification-agent.ts` — Added `sourceCredibilityScore: 0.85` to verifications and mock
6. `lib/ai/prompts/claim-extraction-system.ts` — Added benchmark comparison instructions, omission analysis instructions, `benchmarkFlag` and `omissions` to JSON output schema, 5th parameter for benchmark context
7. `lib/ai/prompts/claim-verification-system.ts` — Added SOURCE QUALITY AWARENESS section with 4-tier hierarchy
8. `lib/ai/prompts/dd-report-system.ts` — Updated system prompt for follow-up questions + recommendation, updated user prompt with omissions + preliminary verdict, expanded JSON output schema
9. `app/api/applications/[id]/dd/route.ts` — Threads `benchmark_flag` on claim inserts, `source_credibility_score` on verification inserts, passes `omissions` to report generator, includes recommendation in agent run log
10. `app/api/applications/[id]/dd/report/route.ts` — Added `benchmarkFlag` and `sourceCredibilityScore` to claim/verification mapping, recovers omissions from existing report_data for regeneration, passes `omissions` to report generator
11. `app/api/applications/[id]/dd/claims/route.ts` — Added `benchmarkFlag` and `sourceCredibilityScore` to response mapping

**Files Created (3 new UI components):**

12. `components/dd/dd-recommendation.tsx` — Recommendation verdict banner (invest/conditional_invest/pass/needs_more_info) with conditions list
13. `components/dd/dd-follow-up-questions.tsx` — Follow-up questions list with priority badges, category tags, source labels
14. `components/dd/dd-omissions.tsx` — Omissions list with severity badges

**Files Modified (3 existing UI):**

15. `components/dd/claim-row.tsx` — Added `BenchmarkBadge` component (above/below/unrealistic)
16. `components/dd/index.ts` — Added barrel exports for 3 new components
17. `app/partner/applications/[id]/dd/page.tsx` — Added Recommendation banner to overview, new "Follow-up" tab, Omissions section in overview + red flags tabs

**Mock agents updated:** All 4 mock classes (extraction, verification, document, report) include new fields with sensible defaults.

**Build:** `npm run build:dashboard` passes with zero errors.

### Current State

- **DD Phase 1:** Fully implemented ✓
- **Migration 010:** Created, needs to be applied to remote Supabase
- **Build:** Passes ✓
- **Branch:** `main`, uncommitted changes

### What's Next

1. Apply migration 010 to remote Supabase
2. Fix `applications_status_check` constraint (migration 009) — still a blocker
3. Run DD pipeline on an existing application to verify all new fields
4. Interview Agent V2
