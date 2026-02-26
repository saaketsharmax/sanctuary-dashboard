# Session Log

> Append-only log of work done per session. Read top-to-bottom for full history.
> Latest entry = current project state.

---

## Session: 2026-02-25 (b) — Design System Migration (applied then reverted)

### What Was Done

**Import migration** (commit `b7a5248`, reverted in `b9efd46`):
- Rewrote 116 files: all `@/components/ui/*` → `@sanctuary/ui` (single consolidated import per file)
- Migrated `cn()` imports from `@/lib/utils` → `@sanctuary/ui`
- Deleted 24 duplicate component files from `apps/dashboard/src/components/ui/`
- Deleted `apps/dashboard/src/lib/utils.ts` (no remaining consumers)
- Added `"@sanctuary/ui": "*"` workspace dependency to dashboard `package.json`

**Color conversion** (commit `d709418`, reverted in `b734a5a`):
- Replaced 806 hardcoded Tailwind color classes across 73 files
- green → `success`, blue → `info`, red → `destructive`, yellow/orange/amber → `warning`, gray → `muted`/`muted-foreground`/`foreground`
- Removed redundant `dark:` overrides (now handled by CSS custom properties in globals.css)
- Kept purple/indigo/cyan/teal/pink/rose/violet for decorative variety

**Reverted both** at user request. Commits are in history and can be cherry-picked back:
- `git cherry-pick b7a5248` (import migration)
- `git cherry-pick d709418` (color conversion)

### Current State

- **Branch:** `design-merge` at `b9efd46` (pushed to GitHub)
- **Codebase:** back to pre-migration state (same as `292e8af` functionally)
- **Build:** clean
- **Vercel CLI:** installed but token expired — needs `vercel login`

### What's Next

1. **Re-apply design migration** when ready (cherry-pick `b7a5248` + `d709418`)
2. **Implement backend plan** — migration 009, PATCH handler refactor, feedback API
3. **Authenticate `gh`** and create PR for `design-merge` → `main`
4. **Programme Agent** (P1) — after decision flow is complete

---

## Session: 2026-02-25 — Backend Planning: Migration 009 + Decision Flow

### What Was Done

Planning session only — no code changes made. Explored codebase thoroughly and produced a ready-to-execute implementation plan.

**Installed `gh` CLI:** Downloaded v2.87.3 directly (no Homebrew) to `~/bin/gh`. Not yet authenticated — user needs to run `~/bin/gh auth login` in a separate terminal.

**Plan produced (saved to `.claude/plans/atomic-watching-pancake.md`):**

1. **Migration 009** (`supabase/migrations/009_expand_application_statuses.sql`):
   - Data migration: `'accepted'` -> `'approved'`, `'interviewing'` -> `'interview_completed'`
   - Drop old CHECK, add new constraint matching TypeScript `APPLICATION_STATUSES`: `('draft', 'submitted', 'interview_scheduled', 'interview_completed', 'assessment_generated', 'under_review', 'approved', 'rejected', 'withdrawn')`
   - Add missing columns: `assessment_completed_at`, `proposed_programme`

2. **Startup auto-creation on approval** (modify `apps/dashboard/src/app/api/partner/applications/[id]/route.ts`):
   - On approve: create startup record from application data, link founder (`users.startup_id`), link application (`applications.startup_id`), create investment with `startup_id`
   - Idempotency guard, stage mapping helper, fire-and-forget pattern

3. **Partner feedback API** (new `apps/dashboard/src/app/api/applications/[id]/feedback/route.ts`):
   - POST: insert into `assessment_feedback` table (agreement booleans, adjusted scores, qualitative text)
   - GET: retrieve all feedback for an application

4. **Schema sync** — update `supabase/schema.sql` line 95 to match new constraint

### Current State

- **Branch:** `design-merge` (no new commits this session)
- **Only uncommitted change:** `docs/SESSION-LOG.md`
- **Plan file:** `.claude/plans/atomic-watching-pancake.md` — approved plan ready to implement
- **gh CLI:** installed at `~/bin/gh`, needs `gh auth login` before PR creation
- **Frontend design merge:** running in parallel by user separately

### What's Next

1. **Implement the plan** — migration 009, PATCH handler refactor, feedback API, schema.sql sync
2. **Authenticate `gh`** and create PR for `design-merge` -> `main`
3. **Programme Agent** (P1) — after decision flow is complete
4. **Calibration Engine** (P1) — partner feedback -> signal weight adjustment

---

## Session: 2026-02-24 (b) — OS-Style Dashboard Merge + DD Phase 2

### What Was Done

Merged designer's OS-style desktop metaphor into the engineering codebase, preserving all real data wiring (APIs, Supabase, auth, stores).

**Design tokens & theme:**
- Created `apps/dashboard/src/app/theme.css` — OKLCH gray scale, spacing, shadows, focus rings, transitions
- Updated `apps/dashboard/src/app/globals.css` — warm OKLCH palette (hue 85 tint), 6 new semantic tokens (`--success`, `--warning`, `--info` + foregrounds), radius changed to 0.5rem
- Added warm utility classes: `.text-warm`, `.bg-warm`, `.border-warm`

**OS components copied from designer (20+ files):**
- `components/os/`: os-layout, home-screen, bottom-nav, wallpaper-selector, my-day-panel, widget-card, draggable-widget, window-view
- `components/os/widgets/`: carousel, chart, list, news, progress, stats, welcome
- `components/os/window-content/`: founder-company, founder-documents, founder-progress, partner-applications, partner-portfolio
- `components/chat/`: ChatWidget, DynamicComponents
- Fixed `window-view.tsx`: converted `require()` calls to ES imports

**Dashboard pages rewritten with OS layout:**
- `founder/dashboard/page.tsx` — OS layout + HomeScreen + ChatWidget, wired to `/api/applications`
- `partner/dashboard/page.tsx` — Same OS pattern, wired to `/api/partner/applications`
- Both show real data (company names, statuses, pending counts)

**Layout hybrid approach:**
- `founder/layout.tsx` + `partner/layout.tsx` — dashboard route renders children directly (OS layout), all other routes use sidebar
- Updated sidebar styling (bg-card, hover states, user card)

**Other:**
- Updated `badge.tsx` with designer's softer CVA variants
- Copied 4 wallpaper images to `public/assets/wallpapers/`
- DD Phase 2 agents (team/market assessment) included in commit

**Commit:** `292e8af` on `design-merge`, pushed to `origin/design-merge`

### Current State

- **Branch:** `design-merge` (pushed to origin)
- **Only uncommitted change:** This session log update
- **PR not created:** `gh` CLI not installed (Homebrew also missing). Create PR manually at: `https://github.com/saaketsharmax/sanctuary-dashboard/compare/main...design-merge`

### What's Next

1. Create PR for `design-merge` → `main` (install `gh` or create manually on GitHub)
2. Convert ~269 hardcoded Tailwind colors to semantic tokens (Task #7, deferred)
3. Per-page restyling with designer screenshots as input
4. Responsive pass (768px, 375px)
5. Migrate `apps/dashboard/` imports to `@sanctuary/ui` package

---

## Session: 2026-02-24 — Extract Shubhy Design System into @sanctuary/ui

### What Was Done

Extracted the full design system from `sanctuary-shubhy` into `packages/ui/` as a standalone `@sanctuary/ui` package.

**Files created/updated in `packages/ui/`:**
- `package.json` — Updated with 14 Radix UI primitives, lucide-react, sonner, next-themes deps + CSS export paths
- `src/styles/theme.css` — Foundation tokens (OKLCH gray scale, spacing, border-radius, shadows, focus rings, transitions)
- `src/styles/globals.css` — Tailwind setup + warm OKLCH palette (light + dark mode) + utility classes
- `src/components/` — 24 UI components:
  - 20 from shubhy: avatar, badge, button, card, checkbox, collapsible, dialog, dropdown-menu, input, label, progress, radio-group, scroll-area, select, separator, skeleton, sonner, table, tabs, textarea
  - 4 from dashboard: sheet, slider, switch, tooltip
- `src/index.ts` — Barrel exports all 24 components + `cn()` utility
- All imports rewired: `@/lib/utils` → `../utils`, `@/components/ui/button` → `./button`

**Verification:** TypeScript compiles clean, `npm run build:dashboard` passes, zero changes to `apps/dashboard/`.

**Commit:** `a281a6e` on `design-merge` branch, pushed to origin.

### Current State

- **Branch:** `design-merge` (pushed to origin, PR not yet created — `gh` CLI not installed)
- **Unstaged changes:** DD Phase 2 work (team/market assessment agents, migration 011) — not part of this commit
- **Blocker for PR:** Need `gh` CLI installed (Homebrew also not installed on this machine)

### What's Next

1. Install Homebrew + `gh` CLI, then create PR for `design-merge`
2. Future: Migrate `apps/dashboard/` imports from `@/components/ui/*` → `@sanctuary/ui` and delete duplicated components
3. Continue DD Phase 2 work (team/market assessment agents) on separate branch

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

---

## Session: 2026-02-24 (b) — DD Phase 2A: Team Assessment Agent

### What Was Done

Built the Team Assessment Agent — the first of 4 new DD agents (Team → Market → Finance → Pattern). This adds structured team analysis to the DD pipeline, covering founder enrichment, experience verification, team completeness scoring, red flag detection, and interview signal extraction.

**Files Created (4):**

1. `lib/ai/prompts/team-assessment-system.ts` — System prompt + user prompt for team analysis. Covers founder scoring (0-100), team completeness (key roles: CEO/CTO/Domain Expert/Growth), red flag detection, interview signal extraction. Scoring formula: 60% founder scores + 25% completeness + 15% interview signals.
2. `lib/ai/agents/team-assessment-agent.ts` — Full agent with:
   - Tavily enrichment per founder: background search, prior startup search (if claimed), GitHub search (if technical role)
   - Claude analysis with structured JSON output
   - Parsing & validation with score clamping, severity validation, sentiment validation
   - Empty assessment fallback when no founders
   - Mock agent for no-API mode
   - Factory function (same pattern as all other agents)
3. `components/dd/dd-team-assessment.tsx` — Team assessment UI with:
   - Team score header (grade badge, overall score, completeness score, founder count, red flag count)
   - Strengths & missing roles cards (2-column grid)
   - Founder profile cards (avatar, score, experience verification, GitHub score, previous startups, strengths, red flags, evidence URLs)
   - Team red flags panel
   - Interview signals panel (sentiment badges: positive/neutral/concerning)
4. `supabase/migrations/011_dd_phase2_team_market.sql` — Outcome tracking columns on applications (outcome, outcome_notes, outcome_updated_at) for future Pattern Agent + updated agent_runs constraint with new DD agent types

**Files Modified (7):**

5. `lib/ai/types/due-diligence.ts` — Added `DDFounderProfile`, `DDInterviewSignal`, `DDTeamAssessment`, `DDTeamAssessmentInput`, `DDTeamAssessmentResult` types. Added `team_assessment` to `DDStatus`. Extended `DueDiligenceReport` with `teamAssessment` field. Extended `DDReportInput` with optional `teamAssessment`.
6. `app/api/applications/[id]/dd/route.ts` — Team assessment runs **in parallel** with claim extraction via `Promise.all`. Team assessment is non-blocking (pipeline continues if it fails). Results passed to report generator. Agent run logged. Response metadata includes team score/grade.
7. `lib/ai/agents/dd-report-generator.ts` — Team assessment integrated into:
   - Score blending: 75% claims-based + 25% team score
   - Red flags: team red flags merged into report red flags
   - Recommendation logic: Team grade D/F downgrades verdict; Team grade A/B relaxes high-flag threshold for 'invest'
   - Follow-up questions: team-sourced questions (unverified founders, missing roles, concerning interview signals)
   - Executive summary: team context passed to Claude for richer summaries
   - Source counting: includes team evidence URLs
   - Mock generator updated
8. `lib/ai/prompts/dd-report-system.ts` — System prompt updated to mention team assessment. Executive summary prompt accepts optional `teamContext` parameter.
9. `app/api/applications/[id]/dd/report/route.ts` — Regeneration route recovers team assessment from existing report_data JSONB
10. `components/dd/index.ts` — Added `DDTeamAssessment` export
11. `app/partner/applications/[id]/dd/page.tsx` — Added Team tab (shows team grade in tab label). New `DDTeamAssessment` component rendered in tab content.

**Pipeline now:**
```
Extract Claims ─┐
                 ├─→ Verify Claims → Document Verify → Generate Report
Team Assessment ─┘                                         ↑
  (parallel)                                    (team feeds into report)
```

**Build:** `npm run build:dashboard` passes with zero errors.

### Current State

- **Team Assessment Agent:** Fully built ✓
- **Migration 011:** Created, needs to be applied to remote Supabase
- **Build:** Passes ✓
- **Branch:** `main`, uncommitted changes

### What's Next

1. Apply migrations 010 + 011 to remote Supabase
2. Fix `applications_status_check` constraint (migration 009) — still a blocker
3. Test DD pipeline (with team + market assessment) on a real application
4. DD Phase 2C: Finance Assessment Agent
5. DD Phase 2D: Pattern Assessment Agent
6. Interview Agent V2

---

## Session: 2026-02-24 (c) — DD Phase 2B: Market Assessment Agent

### What Was Done

Built the Market Assessment Agent — validates market opportunity via Tavily research + Claude analysis. Covers TAM validation, competitive landscape mapping, market timing scoring, adjacent market identification, and market-specific red flags.

**Files Created (3):**

1. `lib/ai/prompts/market-assessment-system.ts` — System prompt + user prompt for market analysis. Instructs Claude to validate TAM (bottom-up + top-down), map competitors (name, funding, positioning, threat level, differentiator), score market timing (0-100), identify adjacent markets, and flag market red flags. Output is structured JSON.
2. `lib/ai/agents/market-assessment-agent.ts` — Full agent with:
   - Tavily enrichment: market sizing search, trend/CAGR search, competitor search, funding search, optional company website search (4-5 Tavily calls)
   - Industry extraction heuristic from company description
   - Claude analysis with structured JSON output
   - Parsing & validation: TAM validation, competitor map, threat levels, severity validation, score clamping, grade derivation
   - Mock agent for no-API mode (2 mock competitors, TAM estimate, timing score)
   - Factory function (same singleton pattern as all other agents)
3. `components/dd/dd-market-assessment.tsx` — Market assessment UI with:
   - Market score header (grade badge, overall score, market timing, competitor count, red flag count)
   - TAM Validation card (claimed vs. estimated, confidence bar, methodology, source links)
   - Market Timing card (score gauge, timing label, market strengths list)
   - Competitive Landscape section (CompetitorRow cards with threat level badge, positioning, differentiator, funding, source link)
   - Adjacent Markets card (badge list)
   - Market Red Flags card (severity badges, evidence)

**Files Modified (6):**

4. `lib/ai/types/due-diligence.ts` — Added `DDTAMValidation`, `DDCompetitor`, `DDCompetitorThreatLevel`, `DDMarketAssessment`, `DDMarketAssessmentInput`, `DDMarketAssessmentResult` types. Extended `DueDiligenceReport` with `marketAssessment` field. Extended `DDReportInput` with optional `marketAssessment`.
5. `app/api/applications/[id]/dd/route.ts` — Market assessment runs **in parallel** with claim extraction + team assessment via `Promise.all`. Non-blocking (pipeline continues if it fails). Results passed to report generator. Agent run logged. Response metadata includes market score/grade.
6. `lib/ai/agents/dd-report-generator.ts` — Market assessment integrated into:
   - Score blending: 55% claims + 25% team + 20% market (with fallbacks: 80/20 market-only, 75/25 team-only)
   - Red flags: market red flags merged into report red flags
   - Recommendation logic: Market grade F → pass; Market grade D + not A/B → needs_more_info; Market grade A/B relaxes high-flag threshold
   - Follow-up questions: `addMarketFollowUps()` — low-confidence TAM, high-threat competitors, low timing score
   - Executive summary: market context (TAM, competitors, timing, strengths) passed to Claude
   - Source counting: includes TAM sources + competitor source URLs
   - Mock generator updated with `marketAssessment` field
7. `lib/ai/prompts/dd-report-system.ts` — System prompt mentions market assessment. Executive summary prompt accepts optional `marketContext` parameter.
8. `app/api/applications/[id]/dd/report/route.ts` — Regeneration route recovers `marketAssessment` from existing report_data JSONB
9. `components/dd/index.ts` — Added `DDMarketAssessment` export
10. `app/partner/applications/[id]/dd/page.tsx` — Added Market tab (shows market grade in tab label). `DDMarketAssessment` component rendered in tab content.

**Pipeline now:**
```
Extract Claims ──┐
                 ├─→ Verify Claims → Document Verify → Generate Report
Team Assessment ─┤                                         ↑
                 │                              (team + market feed
Market Assessment┘                                into report)
  (all 3 parallel)
```

**Build:** `npm run build:dashboard` passes with zero errors.

### Current State

- **Market Assessment Agent:** Fully built ✓
- **Build:** Passes ✓
- **Branch:** `main`, uncommitted changes

### What's Next

1. Apply migrations 010 + 011 to remote Supabase
2. Fix `applications_status_check` constraint (migration 009) — still a blocker
3. Test DD pipeline (with team + market assessment) on a real application
4. DD Phase 2C: Finance Assessment Agent
5. DD Phase 2D: Pattern Assessment Agent
6. Interview Agent V2

---

## Session: 2026-02-24 (d) — Design Merge: OS-Style Dashboard

### What Was Done

Merged the designer's frontend code (from `sanctuary-shubhy/packages/ui`) into the engineering codebase. Created `design-merge` branch. This is a **reskin, not a rebuild** — all existing functionality (APIs, Supabase, AI pipelines, investment system) is preserved.

**Branch:** `design-merge` (off `main`)

**Token Foundation (globals.css):**

1. Created `apps/dashboard/src/app/theme.css` — Designer's theme layer with custom gray scale (OKLCH), spacing tokens, border radius, shadows, focus rings, transitions
2. Updated `apps/dashboard/src/app/globals.css`:
   - Imported `theme.css`
   - Changed `:root` tokens to designer's warm OKLCH palette (hue 85 tint on background, foreground, muted, accent, border, input, ring)
   - Changed `--radius` from `0.625rem` to `0.5rem`
   - Added 6 new semantic status tokens: `--success`, `--success-foreground`, `--warning`, `--warning-foreground`, `--info`, `--info-foreground` (light + dark mode)
   - Registered all 6 new tokens in `@theme inline` block (enables `text-success`, `bg-warning`, etc.)
   - Added warm utility classes: `.text-warm`, `.bg-warm`, `.border-warm`

**OS Components (15 new files copied from designer):**

3. `components/os/os-layout.tsx` — Full-screen OS layout with wallpaper background, window overlay, bottom nav, wallpaper selector, My Day panel
4. `components/os/home-screen.tsx` — Greeting, AI input box, quick action buttons, recent sections grid
5. `components/os/bottom-nav.tsx` — Fixed bottom navigation bar (glass morphism, role-aware: founder vs partner)
6. `components/os/window-view.tsx` — macOS-style window overlay (cream containers, traffic lights, title bar). Fixed: converted `require()` calls to proper ES imports
7. `components/os/wallpaper-selector.tsx` — Wallpaper picker with thumbnail grid, prev/next arrows, localStorage persistence
8. `components/os/my-day-panel.tsx` — Side panel with schedule, tasks, AI insights
9. `components/os/widget-card.tsx` — Glass morphism widget wrapper
10. `components/os/draggable-widget.tsx` — Drag/resize widget infrastructure with grid snapping
11. `components/os/widgets/` — 7 widget types: carousel, chart, list, news, progress, stats, welcome
12. `components/os/window-content/` — 5 window content views: founder-company, founder-documents, founder-progress, partner-applications, partner-portfolio
13. `components/chat/ChatWidget.tsx` — AI chat widget (floating button + expandable window)
14. `components/chat/DynamicComponents.tsx` — Dynamic component renderer (MetricCard, TaskItem, GoalProgress, ChartCard, DocumentRef)

**Wallpaper Assets (4 images):**

15. Copied to `public/assets/wallpapers/`: wallpaper-bg.jpg (4MB), wallpaper-bg-2.png (14MB), wallpaper-bg-3.jpg (1.6MB), wallpaper-bg-4.jpg (1.5MB)

**Layout Updates:**

16. `app/founder/layout.tsx` — Dashboard route (`/founder/dashboard`) skips sidebar and renders children directly (OS layout handles its own chrome). All other founder routes keep the existing sidebar. Updated sidebar styling to match designer's patterns (bg-card, h-16 header, font-medium nav items, bg-accent/50 user card)
17. `app/partner/layout.tsx` — Same pattern: dashboard skips sidebar, all other routes keep sidebar

**Dashboard Pages (merged design + engineering):**

18. `app/founder/dashboard/page.tsx` — Replaced card-based dashboard with OS-style home screen. Preserves real data fetching (`/api/applications`, `/api/founder/investment`). Quick actions navigate to real routes. Recent sections show real application status. Chat widget integrated.
19. `app/partner/dashboard/page.tsx` — Same pattern: OS home screen with real data from `/api/partner/applications`. Application cards show real company names and statuses. Quick actions navigate to real partner routes.

**Component Restyling:**

20. `components/ui/badge.tsx` — Updated CVA variants to designer's softer style (bg-muted/50, bg-destructive/10 instead of solid colors, transition-colors duration-150)

**Build:** `npm run build:dashboard` passes with zero errors. All 46 routes compile.

### Key Design Decisions

- **Hybrid layout:** Dashboard pages use full-screen OS layout (wallpaper + bottom nav), all other pages keep the traditional sidebar layout. This preserves all existing page functionality while giving dashboards the new look.
- **Real data in OS home screen:** Quick actions navigate to real Next.js routes (not the window overlay system). Recent sections show real application data from APIs.
- **Chat widget uses `/api/chat/ollama`:** The designer's chat widget calls a local Ollama endpoint we don't have. It gracefully handles the error. Can be swapped to use our Claude-based interview API later.
- **Window content is static:** The window-view overlay content (company, documents, progress, portfolio, applications) uses static mock data from the designer. These are secondary to the real page content accessed via sidebar navigation.

### Current State

- **Design merge:** OS dashboard + token foundation complete ✓
- **Build:** Passes ✓
- **Branch:** `design-merge`, uncommitted changes

### What's Next (Design Merge Continuation)

1. **Commit** all design merge changes on `design-merge` branch
2. **Hardcoded color conversion** — Convert ~269 instances of `text-green-600`, `bg-red-100`, etc. across 40+ files to use new semantic tokens (`text-success`, `bg-destructive/10`, `text-info`, `text-warning`)
3. **Designer review checkpoint** — Get designer approval on token foundation + OS dashboard before proceeding to per-page restyling
4. **Per-page restyling** (with designer screenshots as input): founder pages, partner pages, onboarding flow
5. **Responsive pass** — Mobile/tablet designs (768px, 375px)
6. **Merge `design-merge` → `main`** after final review

---

## Session: 2026-02-27 — God Mode Build (Parallel Execution)

### What Was Done

**Migration 009** — `supabase/migrations/009_fix_application_status_constraint.sql`
- Drops old `applications_status_check` constraint
- Adds new constraint with: draft, submitted, interviewing, under_review, approved, rejected, withdrawn
- Adds `decision_made_at` and `decision_notes` columns
- Adds indexes on `status` and `decision_made_at`
- **Unblocks the full investment + decision flow**

**Migration 012** — `supabase/migrations/012_decision_flow.sql`
- Adds `application_id` to startups table (for linking on auto-creation)
- Updates `agent_runs` constraint for all new agent types
- Adds outcome tracking columns to applications (for accuracy metrics)
- Adds RLS policies for partner decisions and startup creation

**God Mode DD Agent** (4 new files):
- Types: `lib/ai/types/god-mode-dd.ts` — 9 unique metric interfaces + composite GodModeDDReport
- Prompt: `lib/ai/prompts/god-mode-dd-system.ts` — 1500+ word system prompt as contrarian first-principles thinker
- Agent: `lib/ai/agents/god-mode-dd-agent.ts` — GodModeDDAgent + MockGodModeDDAgent + factory
- API: `app/api/applications/[id]/dd/god-mode/route.ts` — POST runs analysis, GET returns report
- **9 Unique Metrics**: Behavioral Fingerprint, Signal Consistency Index, Revenue Quality Score, Capital Efficiency Predictor, Network Effect Potential, Competitive Moat Durability (12-36mo projection), Market Timing Index, Contrarian Signals, Pattern Matching
- Composite godModeScore calculated as weighted average of all sub-scores

**DD Accuracy Metrics** (3 new files):
- Types: `lib/ai/types/dd-accuracy.ts` — DDAccuracyMetrics + DDAccuracyInput
- Agent: `lib/ai/agents/dd-accuracy-agent.ts` — Primarily computational (no LLM for math), Claude for insight generation
- API: `app/api/applications/dd/accuracy/route.ts` — GET with ?period=weekly|monthly|quarterly
- Tracks: prediction accuracy, confidence calibration, partner overrides, signal effectiveness, claim verification accuracy, drift detection, performance over time

**Voice Interview Agent** (4 new files):
- Types: `lib/ai/types/voice-interview.ts` — VoiceConfig, VoiceTranscriptEntry, ElevenLabsWebSocketMessage
- Prompt: `lib/ai/prompts/voice-interview-system.ts` — Voice-optimized prompts (<60 words per response)
- Agent: `lib/ai/agents/voice-interview-agent.ts` — VoiceInterviewAgent + MockVoiceInterviewAgent + factory
- API: `app/api/interview/voice/route.ts` — POST processes transcribed text + voice metadata
- Voice-specific signals: hesitation detection, speaking rate, emotional tone, STT confidence
- Server-side logic only; client handles Eleven Labs WebSocket + TTS

**Matchmaking Agent** (4 new files):
- Types: `lib/ai/types/matchmaking.ts` — MatchCandidate, MatchRequest, MatchScore, MatchResult
- Prompt: `lib/ai/prompts/matchmaking-system.ts` — Deep matching beyond keywords
- Agent: `lib/ai/agents/matchmaking-agent.ts` — MatchmakingAgent + MockMatchmakingAgent + factory
- API: `app/api/partner/matches/suggest/route.ts` — POST runs matching, GET returns suggestions
- 6 scoring dimensions: Expertise (30%), Stage (25%), Industry (15%), Track Record (15%), Availability (10%), Personality (5%)
- Pre-filters by hard constraints, anti-pattern detection, gap analysis

**Decision API** — `app/api/applications/[id]/decision/route.ts`
- POST: partner approve/reject with auto startup creation
- On approval: creates startup record, links founder, allocates $50k cash + $50k credits
- Single API call for the entire decision flow

**Feedback API** — `app/api/applications/[id]/feedback/route.ts`
- POST: partner assessment feedback (agreement checkboxes + score overrides + qualitative)
- GET: retrieve existing feedback
- Feeds into DD accuracy metrics and calibration engine

**Documentation**:
- Created `docs/SANCTUARY-OS-LATEST.md` — comprehensive platform document (v4.0)
- Updated this session log

### Files Created (21 total)

```
supabase/migrations/009_fix_application_status_constraint.sql
supabase/migrations/012_decision_flow.sql
apps/dashboard/src/lib/ai/types/god-mode-dd.ts
apps/dashboard/src/lib/ai/types/voice-interview.ts
apps/dashboard/src/lib/ai/types/matchmaking.ts
apps/dashboard/src/lib/ai/types/dd-accuracy.ts
apps/dashboard/src/lib/ai/prompts/god-mode-dd-system.ts
apps/dashboard/src/lib/ai/prompts/voice-interview-system.ts
apps/dashboard/src/lib/ai/prompts/matchmaking-system.ts
apps/dashboard/src/lib/ai/agents/god-mode-dd-agent.ts
apps/dashboard/src/lib/ai/agents/voice-interview-agent.ts
apps/dashboard/src/lib/ai/agents/matchmaking-agent.ts
apps/dashboard/src/lib/ai/agents/dd-accuracy-agent.ts
apps/dashboard/src/app/api/applications/[id]/dd/god-mode/route.ts
apps/dashboard/src/app/api/applications/[id]/decision/route.ts
apps/dashboard/src/app/api/applications/[id]/feedback/route.ts
apps/dashboard/src/app/api/applications/dd/accuracy/route.ts
apps/dashboard/src/app/api/interview/voice/route.ts
apps/dashboard/src/app/api/partner/matches/suggest/route.ts
docs/SANCTUARY-OS-LATEST.md
```

### Agent Count: 15

| # | Agent | Status |
|---|-------|--------|
| 1 | Interview Agent (Text) | Existing |
| 2 | Claude Interview Agent | Existing |
| 3 | Assessment Agent | Existing |
| 4 | Research Agent | Existing |
| 5 | Memo Generator | Existing |
| 6 | Claim Extraction Agent | Existing |
| 7 | Claim Verification Agent | Existing |
| 8 | Document Verification Agent | Existing |
| 9 | Team Assessment Agent | Existing |
| 10 | Market Assessment Agent | Existing |
| 11 | DD Report Generator | Existing |
| 12 | **God Mode DD Agent** | NEW |
| 13 | **DD Accuracy Agent** | NEW |
| 14 | **Voice Interview Agent** | NEW |
| 15 | **Matchmaking Agent** | NEW |

### Current State

- **Branch:** `design-merge`
- **New files:** 21 uncommitted files
- **Migrations pending:** 009 (status constraint), 012 (decision flow)
- **Build:** Not yet verified with new files

### What's Next

1. **Run build** to verify all new files compile
2. **Deploy migrations** 009 + 012 to Supabase
3. **Wire God Mode DD** into the partner DD dashboard UI (new tab/section)
4. **Client-side voice** — Eleven Labs WebSocket integration in interview page
5. **Calibration Engine** — use accuracy metrics + feedback to auto-adjust weights
6. **Programme Agent** — milestone generation for accepted startups
7. **Auth `gh` CLI** + create PR for all this work
