# Sanctuary OS — User Journeys & Screen Flows

> **Version:** 1.0
> **Last Updated:** 2026-03-05
> **Product:** Sanctuary OS — AI-Native Startup Accelerator Platform
> **ICPs:** Founders (Applicants) | Partners (Reviewers/Investors)

---

## Table of Contents

1. [User Personas](#1-user-personas)
2. [Founder User Journey](#2-founder-user-journey)
3. [Partner User Journey](#3-partner-user-journey)
4. [Screen Inventory & Wireframe Map](#4-screen-inventory--wireframe-map)
5. [Screen-by-Screen Wireframe Descriptions](#5-screen-by-screen-wireframe-descriptions)
6. [Flow Diagrams](#6-flow-diagrams)
7. [State Machines](#7-state-machines)
8. [Cross-Role Interactions](#8-cross-role-interactions)

---

## 1. User Personas

### 1.1 Founder (ICP-1)

| Attribute | Detail |
|-----------|--------|
| **Who** | Early-stage startup founder (solo or co-founding team) |
| **Goal** | Get accepted into the accelerator, secure $100k ($50k cash + $50k credits), receive mentorship, and hit growth milestones |
| **Pain Points** | Opaque application processes, slow feedback loops, unclear evaluation criteria, difficulty accessing capital |
| **Motivation** | Validation, capital, structured programme, mentor network, credibility |
| **Tech Comfort** | High — building a tech product themselves |
| **Key Metric** | Time from application to decision; clarity of feedback |

### 1.2 Partner (ICP-2)

| Attribute | Detail |
|-----------|--------|
| **Who** | Accelerator partner, GP, programme manager, or senior mentor |
| **Goal** | Efficiently evaluate deal flow, make evidence-based investment decisions, manage portfolio, and track startup progress |
| **Pain Points** | Manual application review, inconsistent scoring, no learning loop, scattered data across tools |
| **Motivation** | Find high-quality startups, deploy capital wisely, demonstrate portfolio returns |
| **Tech Comfort** | Moderate to high — comfortable with dashboards and data tools |
| **Key Metric** | Review throughput; decision quality (tracked via calibration engine) |

---

## 2. Founder User Journey

### Phase 0: Awareness & Landing

```
TRIGGER: Founder discovers Sanctuary via referral, social media, or search

  [Marketing Site]
       |
       v
  "Apply to Sanctuary" CTA
       |
       v
  /auth/signup
```

**Touchpoints:** Marketing site, social proof, programme details
**Emotion:** Curious, hopeful
**Goal:** Understand what Sanctuary offers and decide to apply

---

### Phase 1: Signup & Role Selection

```
/auth/signup
    |
    ├── Email + Password
    │   └── Email verification link sent
    │
    └── OAuth (Google)
        └── Instant access
    |
    v
/auth/role-select
    |
    └── Selects "I am a Founder"
    |
    v
/founder/dashboard (empty state)
```

**Screens:** `/auth/signup` → `/auth/role-select` → `/founder/dashboard`
**Emotion:** Motivated, slightly anxious about the process
**Data Created:** User account, role assignment
**Duration:** ~2 minutes

---

### Phase 2: Application Submission

This is a 6-step multi-page form with progress tracking, draft saving, and metadata collection (time-on-step, edit counts, word counts).

```
/founder/apply

  ┌─────────────────────────────────────────────────────────────┐
  │  Step 1: COMPANY INFO                                       │
  │  ├── Company name                                           │
  │  ├── One-liner (elevator pitch)                             │
  │  ├── Website URL                                            │
  │  └── Company description                                    │
  │                                                    [Next →] │
  ├─────────────────────────────────────────────────────────────┤
  │  Step 2: FOUNDERS                                           │
  │  ├── Founder name(s)                                        │
  │  ├── Role (CEO, CTO, COO, etc.)                             │
  │  ├── LinkedIn URL                                           │
  │  └── Relevant experience                                    │
  │                                          [← Back] [Next →] │
  ├─────────────────────────────────────────────────────────────┤
  │  Step 3: THE PROBLEM                                        │
  │  ├── Problem description                                    │
  │  └── Target customer profile                                │
  │                                          [← Back] [Next →] │
  ├─────────────────────────────────────────────────────────────┤
  │  Step 4: THE SOLUTION                                       │
  │  ├── Solution description                                   │
  │  └── Current stage (idea → revenue)                         │
  │                                          [← Back] [Next →] │
  ├─────────────────────────────────────────────────────────────┤
  │  Step 5: TRACTION                                           │
  │  ├── Number of users                                        │
  │  ├── Monthly recurring revenue (MRR)                        │
  │  └── Biggest challenge right now                            │
  │                                          [← Back] [Next →] │
  ├─────────────────────────────────────────────────────────────┤
  │  Step 6: WHY SANCTUARY                                      │
  │  ├── Why is Sanctuary the right fit?                        │
  │  └── What do you expect from the programme?                 │
  │                                      [← Back] [Submit →]   │
  └─────────────────────────────────────────────────────────────┘
```

**Screens:** `/founder/apply` (6-step wizard)
**Emotion:** Invested, focused — completing a meaningful application
**Data Created:** Application record with status `submitted`
**Metadata Collected:** Time on each step, number of edits, word counts, specificity scores
**Duration:** 20–45 minutes
**Exit Point:** Can save draft and return later

---

### Phase 3: AI Interview

After submission, the founder is invited to a structured AI interview. The interview probes deeper than the written application across 5 sections.

```
/founder/interview/[applicationId]

  ┌──────────────────────────────────────────────────────────────┐
  │                                                              │
  │  SECTION 1: FOUNDER DNA (10-15 min)                         │
  │  ┌─────────────────────────────────────────────────────────┐ │
  │  │  AI: "Tell me about a time you faced a major setback    │ │
  │  │       and how you navigated it..."                      │ │
  │  │                                                         │ │
  │  │  [Founder types response]                               │ │
  │  │                                                         │ │
  │  │  AI: "That's interesting. When you say [X], can you     │ │
  │  │       quantify the impact..."                           │ │
  │  │                                                         │ │
  │  │  3-4 exchanges per section                              │ │
  │  └─────────────────────────────────────────────────────────┘ │
  │  Signals extracted: prior_exit, domain_expertise, grit       │
  │                                                              │
  │  SECTION 2: PROBLEM INTERROGATION (10-15 min)               │
  │  Signals: customer_discovery, pain_quotes, frequency         │
  │                                                              │
  │  SECTION 3: SOLUTION EXECUTION (10 min)                     │
  │  Signals: shipping_speed, smart_cuts, technical_moat         │
  │                                                              │
  │  SECTION 4: MARKET & COMPETITION (5-10 min)                 │
  │  Signals: market_awareness, differentiation                  │
  │                                                              │
  │  SECTION 5: SANCTUARY FIT (5 min)                           │
  │  Signals: cultural_fit, growth_mindset                       │
  │                                                              │
  │  ──── Interview Complete ────                               │
  │  "Thank you! Your responses are being analyzed..."           │
  └──────────────────────────────────────────────────────────────┘
```

**Interview Modes:**
- **Text Chat** — Default. Claude-powered conversational interview with streaming responses.
- **Voice** — Eleven Labs TTS/STT. Captures behavioral signals (pause duration, confidence, speaking pace).

**Screens:** `/founder/interview/[id]`
**Emotion:** Engaged but nervous — feels like a real conversation
**Data Created:** Interview transcript, section scores, extracted signals
**Duration:** 40–60 minutes
**Status Change:** `submitted` → `interview_completed`

---

### Phase 4: Waiting for Decision

The founder sees their dashboard update to reflect current status. Behind the scenes, the AI pipeline runs assessment, research, and due diligence.

```
/founder/dashboard

  ┌──────────────────────────────────────────────────────────┐
  │  Application Status: UNDER REVIEW                        │
  │  ┌────────────────────────────────────────────────────┐  │
  │  │  Applied ──── Interviewed ──── Under Review ─── ?  │  │
  │  │    ✓              ✓               ◉            │  │  │
  │  └────────────────────────────────────────────────────┘  │
  │                                                          │
  │  "Our team is reviewing your application.                │
  │   You'll hear back within 5 business days."              │
  │                                                          │
  │  Quick Links:                                            │
  │  ├── View your application                               │
  │  ├── Review your interview transcript                    │
  │  └── Update your company profile                         │
  └──────────────────────────────────────────────────────────┘
```

**Screens:** `/founder/dashboard` (status view)
**Emotion:** Anxious, checking frequently
**Duration:** 1–5 business days
**Status Change:** `interview_completed` → `assessment_generated` → `under_review`

---

### Phase 5: Decision & Onboarding (if approved)

```
                    ┌── APPROVED ──────────────────────────┐
                    │                                       │
/founder/dashboard  │  Congratulations! You're in.         │
                    │                                       │
                    │  Investment Allocated:                │
                    │  ├── $50,000 Cash                     │
                    │  └── $50,000 Credits                  │
                    │                                       │
                    │  Next Steps:                          │
                    │  1. Complete your company profile      │
                    │  2. Upload pitch deck & financials     │
                    │  3. Begin Week 1 checkpoint            │
                    │                                       │
                    │  [Go to Dashboard →]                  │
                    └───────────────────────────────────────┘

                    ┌── REJECTED ──────────────────────────┐
                    │                                       │
                    │  Thank you for applying.              │
                    │                                       │
                    │  Summary of feedback:                 │
                    │  [AI-generated constructive feedback] │
                    │                                       │
                    │  You may reapply in 6 months.         │
                    └───────────────────────────────────────┘
```

**Status Change:** `under_review` → `approved` or `rejected`
**Data Created (if approved):** Startup record, founder records, investment allocation, 20-week checkpoints

---

### Phase 6: Active Programme (20 Weeks)

Once accepted, the founder's dashboard becomes a full operating environment.

```
/founder/dashboard (active state)

  ┌──────────────────────────────────────────────────────────────┐
  │  SANCTUARY DASHBOARD                              [Settings] │
  ├──────────────────────────────────────────────────────────────┤
  │                                                              │
  │  Welcome back, [Founder Name]                                │
  │  Week 4 of 20 — Problem Discovery Phase                     │
  │                                                              │
  │  ┌─────────┐  ┌─────────┐  ┌──────────┐  ┌──────────────┐  │
  │  │ Overall  │  │  Cash   │  │ Credits  │  │  Documents   │  │
  │  │ Score    │  │ Balance │  │ Balance  │  │  Uploaded    │  │
  │  │  78/100  │  │ $47,200 │  │ $50,000  │  │    4/6       │  │
  │  └─────────┘  └─────────┘  └──────────┘  └──────────────┘  │
  │                                                              │
  │  Current Week Checkpoint:                                    │
  │  ┌──────────────────────────────────────────────────────┐   │
  │  │  Week 4: Customer Interview Synthesis                 │   │
  │  │  Goal: Compile insights from 10+ interviews           │   │
  │  │  Status: In Progress                                  │   │
  │  │  Tasks: [■■■□□] 3/5 complete                         │   │
  │  │  [View Details →]                                     │   │
  │  └──────────────────────────────────────────────────────┘   │
  │                                                              │
  │  Navigation:                                                 │
  │  ├── Company Profile                                         │
  │  ├── Documents                                               │
  │  ├── Investment (Cash | Credits)                              │
  │  ├── Metrics                                                 │
  │  ├── Progress (20-week tracker)                              │
  │  └── Requests                                                │
  └──────────────────────────────────────────────────────────────┘
```

#### Sub-Journeys During Active Programme:

**6A. Company Profile Management**
```
/founder/company
├── Edit company details (name, description, stage, etc.)
├── Update founder bios and skills
├── Add team members
└── Upload logo
```

**6B. Document Management**
```
/founder/documents
├── Upload pitch deck (PDF/PPT)
├── Upload financials (spreadsheet)
├── Upload founder resumes
├── Upload other supporting documents
└── Grid view with download/delete actions
```

**6C. Investment — Cash**
```
/founder/investment/cash

  ┌──────────────────────────────────────────────────────┐
  │  CASH ALLOCATION                                     │
  │                                                      │
  │  Total: $50,000                                      │
  │  Used:  $2,800                                       │
  │  Available: $47,200                                  │
  │                                                      │
  │  ┌────────────────────────────────────────────────┐  │
  │  │  Category Breakdown (donut chart)              │  │
  │  │  ├── Salaries: $1,200                          │  │
  │  │  ├── Equipment: $800                           │  │
  │  │  ├── Services: $500                            │  │
  │  │  └── Consulting: $300                          │  │
  │  └────────────────────────────────────────────────┘  │
  │                                                      │
  │  [+ Request Funds]                                   │
  │                                                      │
  │  Transaction History:                                │
  │  ┌──────────┬──────────┬─────────┬────────┐         │
  │  │ Date     │ Category │ Amount  │ Status │         │
  │  ├──────────┼──────────┼─────────┼────────┤         │
  │  │ Mar 1    │ Salaries │ $1,200  │ ✓ Appr │         │
  │  │ Feb 25   │ Equip.   │ $800    │ ✓ Appr │         │
  │  │ Feb 20   │ Services │ $500    │ ⏳ Pend │         │
  │  └──────────┴──────────┴─────────┴────────┘         │
  └──────────────────────────────────────────────────────┘
```

**6D. Investment — Credits**
```
/founder/investment/credits
├── Same layout as Cash but for credits allocation
├── Credits can be used for: cloud services, tools, subscriptions
└── Request and approval workflow identical to cash
```

**6E. Progress Tracker (20-Week Programme)**
```
/founder/progress

  ┌──────────────────────────────────────────────────────────────┐
  │  20-WEEK PROGRAMME TRACKER                                   │
  │                                                              │
  │  Stage 1: Problem Discovery (Weeks 1-4)        ████████░░  │
  │  Stage 2: Solution Shaping (Weeks 5-8)         ░░░░░░░░░░  │
  │  Stage 3: User Value (Weeks 9-12)              ░░░░░░░░░░  │
  │  Stage 4: Growth (Weeks 13-16)                 ░░░░░░░░░░  │
  │  Stage 5: Capital Ready (Weeks 17-20)          ░░░░░░░░░░  │
  │                                                              │
  │  Week Details:                                               │
  │  ┌────┬──────────────────────┬───────────┬────────────────┐ │
  │  │ Wk │ Goal                 │ Status    │ Partner Notes  │ │
  │  ├────┼──────────────────────┼───────────┼────────────────┤ │
  │  │  1 │ Define ICP           │ Completed │ "Strong start" │ │
  │  │  2 │ 5 customer interviews│ Completed │ "Good depth"   │ │
  │  │  3 │ Pain point ranking   │ Completed │ —              │ │
  │  │  4 │ Interview synthesis  │ In Prog.  │ —              │ │
  │  │  5 │ MVP scope definition │ Pending   │ —              │ │
  │  └────┴──────────────────────┴───────────┴────────────────┘ │
  └──────────────────────────────────────────────────────────────┘
```

**6F. Metrics Dashboard**
```
/founder/metrics
├── User count (time series chart)
├── MRR (time series chart)
├── Burn rate
├── Growth rate
└── Custom KPIs based on stage
```

**6G. Service Requests**
```
/founder/requests
├── Request types: Mentorship, Equipment, Consulting, Legal, Recruiting
├── Form: Title, description, category, estimated amount
├── Status tracking: Pending → Approved/Denied
└── Realtime notification on approval
```

---

### Founder Journey Summary Timeline

```
Day 0          Day 1-2         Day 2-3        Day 3-8        Day 8+
  |               |               |              |              |
  v               v               v              v              v
SIGNUP ──→ APPLICATION ──→ AI INTERVIEW ──→ DECISION ──→ 20-WEEK PROGRAMME
           (20-45 min)     (40-60 min)     (1-5 days)    (ongoing)
                                                          │
                                                          ├── Company Profile
                                                          ├── Documents
                                                          ├── Investment Mgmt
                                                          ├── Weekly Checkpoints
                                                          ├── Metrics Tracking
                                                          ├── Service Requests
                                                          └── Mentor Sessions
```

---

## 3. Partner User Journey

### Phase 0: Onboarding

```
/auth/signup → /auth/role-select → "I am a Partner"

  Partners are typically invited via direct link or admin provisioning.
  After signup, they land on the partner dashboard.
```

---

### Phase 1: Dashboard Overview

The partner's home screen provides a command-center view of the entire pipeline.

```
/partner/dashboard

  ┌──────────────────────────────────────────────────────────────────┐
  │  SANCTUARY OS — PARTNER DASHBOARD                    [Settings] │
  ├──────────────────────────────────────────────────────────────────┤
  │                                                                  │
  │  Welcome back, [Partner Name]                                    │
  │                                                                  │
  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌─────────────┐  │
  │  │ Total     │  │ Pending   │  │ Portfolio  │  │ Total       │  │
  │  │ Apps      │  │ Reviews   │  │ Companies  │  │ Invested    │  │
  │  │    42     │  │     7     │  │    12      │  │  $600K      │  │
  │  └───────────┘  └───────────┘  └───────────┘  └─────────────┘  │
  │                                                                  │
  │  Needs Your Attention:                                           │
  │  ┌────────────────────────────────────────────────────────────┐  │
  │  │  1. NovaPay — Assessment ready, awaiting review            │  │
  │  │  2. HealthBridge — DD report generated                     │  │
  │  │  3. DataMesh — Investment request pending ($2,400)          │  │
  │  └────────────────────────────────────────────────────────────┘  │
  │                                                                  │
  │  Quick Actions:                                                  │
  │  [Review Applications]  [View Portfolio]  [Check Investments]    │
  │                                                                  │
  │  Pipeline Funnel:                                                │
  │  Applied(42) → Interviewed(28) → Assessed(22) → Approved(12)    │
  └──────────────────────────────────────────────────────────────────┘
```

**Screens:** `/partner/dashboard`
**Emotion:** In control, productive
**Goal:** Quickly identify what needs attention

---

### Phase 2: Application Review Pipeline

```
/partner/applications

  ┌──────────────────────────────────────────────────────────────┐
  │  APPLICATIONS                                    [Refresh]   │
  ├──────────────────────────────────────────────────────────────┤
  │                                                              │
  │  [Needs Review (7)]  [In Progress (14)]  [Decided (21)]     │
  │  ═══════════════                                             │
  │                                                              │
  │  ┌────────────────────────────────────────────────────────┐  │
  │  │  NovaPay                          Score: 82/100        │  │
  │  │  "AI-powered payment reconciliation"                    │  │
  │  │  Status: Assessment Generated     Applied: Feb 28      │  │
  │  │  Stage: Revenue    MRR: $4,200                         │  │
  │  │                                    [Review →]          │  │
  │  ├────────────────────────────────────────────────────────┤  │
  │  │  HealthBridge                     Score: 71/100        │  │
  │  │  "Remote patient monitoring for rural clinics"          │  │
  │  │  Status: DD Complete              Applied: Feb 25      │  │
  │  │  Stage: MVP        MRR: $0                             │  │
  │  │                                    [Review →]          │  │
  │  ├────────────────────────────────────────────────────────┤  │
  │  │  ... more applications ...                              │  │
  │  └────────────────────────────────────────────────────────┘  │
  │                                                              │
  │  Tab: "In Progress" shows:                                   │
  │  ├── Submitted (awaiting interview)                          │
  │  └── Interview scheduled / in progress                       │
  │                                                              │
  │  Tab: "Decided" shows:                                       │
  │  ├── Approved (with score)                                   │
  │  └── Rejected (with reason)                                  │
  └──────────────────────────────────────────────────────────────┘
```

**Screens:** `/partner/applications`
**Emotion:** Focused, systematic
**Goal:** Triage and prioritize which applications to review

---

### Phase 3: Deep Application Review

```
/partner/applications/[id]

  ┌──────────────────────────────────────────────────────────────────┐
  │  APPLICATION: NovaPay                                            │
  │  Status: Assessment Generated                                    │
  ├──────────────────────────────────────────────────────────────────┤
  │                                                                  │
  │  COMPANY INFO                                                    │
  │  ├── Name: NovaPay                                               │
  │  ├── One-liner: AI-powered payment reconciliation                │
  │  ├── Website: novapay.io                                         │
  │  ├── Stage: Revenue                                              │
  │  ├── MRR: $4,200                                                 │
  │  └── Users: 340                                                  │
  │                                                                  │
  │  FOUNDERS                                                        │
  │  ├── Sarah Chen (CEO) — 8 yrs fintech, prev. Stripe             │
  │  └── Marcus Webb (CTO) — 6 yrs ML engineering, prev. Google     │
  │                                                                  │
  │  AI ASSESSMENT                                                   │
  │  ┌────────────────────────────────────────────────────────────┐  │
  │  │  Overall Score: 82/100                                     │  │
  │  │                                                            │  │
  │  │  Founder Score:     ████████░░  85/100  (25% weight)      │  │
  │  │  Problem Score:     ████████░░  80/100  (25% weight)      │  │
  │  │  User Value Score:  ████████░░  84/100  (30% weight)      │  │
  │  │  Execution Score:   ███████░░░  76/100  (20% weight)      │  │
  │  │                                                            │  │
  │  │  Strengths:                                                │  │
  │  │  • Strong domain expertise in fintech                      │  │
  │  │  • Clear customer pain point with paying customers         │  │
  │  │  • Technical moat in ML reconciliation engine              │  │
  │  │                                                            │  │
  │  │  Risks:                                                    │  │
  │  │  • Concentration risk — 60% revenue from 2 customers       │  │
  │  │  • No prior founding experience                            │  │
  │  │                                                            │  │
  │  │  Gaps:                                                     │  │
  │  │  • Go-to-market strategy unclear beyond warm intros        │  │
  │  └────────────────────────────────────────────────────────────┘  │
  │                                                                  │
  │  INTERVIEW TRANSCRIPT                                            │
  │  [Expand to read full transcript]                                │
  │                                                                  │
  │  ACTIONS                                                         │
  │  [✓ Approve]  [✗ Reject]  [↻ Re-interview]  [→ Run DD]         │
  └──────────────────────────────────────────────────────────────────┘
```

**Screens:** `/partner/applications/[id]`
**Emotion:** Analytical, deliberate
**Goal:** Understand the founder and startup deeply before making a decision

---

### Phase 4: Due Diligence Deep Dive

When a partner wants more signal, they trigger or view the DD pipeline.

```
/partner/applications/[id]/dd

  ┌──────────────────────────────────────────────────────────────────┐
  │  DUE DILIGENCE: NovaPay                                         │
  ├──────────────────────────────────────────────────────────────────┤
  │                                                                  │
  │  DD SCORE HEADER                                                 │
  │  ┌────────────────────────────────────────────────────────────┐  │
  │  │  Overall DD Score: 78/100  |  Grade: B+                   │  │
  │  │  Claims: 24 total | 18 verified | 2 refuted | 4 unclear   │  │
  │  │  Verification Coverage: 75%                                │  │
  │  └────────────────────────────────────────────────────────────┘  │
  │                                                                  │
  │  CATEGORY BREAKDOWN                                              │
  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
  │  │Financial │ │  Team    │ │ Market   │ │ Product  │           │
  │  │  72/100  │ │  85/100  │ │  80/100  │ │  76/100  │           │
  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
  │                                                                  │
  │  CLAIMS VERIFICATION TABLE                                       │
  │  ┌───────────────────────────────┬────────┬──────────┬───────┐  │
  │  │ Claim                         │ Source │ Status   │ Conf. │  │
  │  ├───────────────────────────────┼────────┼──────────┼───────┤  │
  │  │ "$4,200 MRR"                  │ App    │ Verified │  92%  │  │
  │  │ "340 active users"            │ App    │ Verified │  88%  │  │
  │  │ "Prev. at Stripe"            │ Intrv  │ Verified │  95%  │  │
  │  │ "Patent pending"             │ App    │ Refuted  │  15%  │  │
  │  │ "SOC 2 compliant"            │ Doc    │ Unclear  │  45%  │  │
  │  └───────────────────────────────┴────────┴──────────┴───────┘  │
  │                                                                  │
  │  RED FLAGS                                                       │
  │  ├── ⚠ Patent claim could not be verified                       │
  │  └── ⚠ Revenue concentration (2 customers = 60%)                │
  │                                                                  │
  │  FOLLOW-UP QUESTIONS                                             │
  │  ├── Can you provide patent application number?                  │
  │  └── What's your strategy to diversify revenue?                  │
  │                                                                  │
  │  ────────────────────────────────────────────────────────────    │
  │                                                                  │
  │  GOD MODE DD REPORT                                              │
  │  ┌────────────────────────────────────────────────────────────┐  │
  │  │  God Mode Composite Score: 74/100                          │  │
  │  │  Conviction Level: INVESTIGATE                             │  │
  │  │                                                            │  │
  │  │  Behavioral Fingerprint:    ████████░░  81                │  │
  │  │  Signal Consistency Index:  ███████░░░  72                │  │
  │  │  Revenue Quality Score:     ██████░░░░  62                │  │
  │  │  Capital Efficiency:        ████████░░  79                │  │
  │  │  Network Effect Potential:  █████░░░░░  55                │  │
  │  │  Moat Durability (12mo):    ███████░░░  68                │  │
  │  │  Moat Durability (36mo):    █████░░░░░  52                │  │
  │  │  Market Timing Index:       █████████░  88                │  │
  │  │  Contrarian Signal Score:   ██████░░░░  65                │  │
  │  │                                                            │  │
  │  │  Alpha Signals:                                            │  │
  │  │  1. ML reconciliation tech has compounding data moat       │  │
  │  │  2. Founder-market fit unusually strong (Stripe + fintech) │  │
  │  │  3. Regulatory tailwinds in payment compliance space       │  │
  │  │                                                            │  │
  │  │  Pattern Match: "Technical Founder in Regulated Market"    │  │
  │  │  Historical parallels: Plaid (early), Stripe (2012)        │  │
  │  │                                                            │  │
  │  │  One-Line Verdict:                                         │  │
  │  │  "Strong technical founders in a timing-perfect market     │  │
  │  │   but revenue concentration must be addressed pre-invest." │  │
  │  └────────────────────────────────────────────────────────────┘  │
  │                                                                  │
  │  RECOMMENDATION: CONDITIONAL ACCEPT                              │
  │  Condition: Address revenue concentration risk before funding     │
  │                                                                  │
  │  [✓ Approve]  [✗ Reject]  [↻ Regenerate DD]  [← Back]          │
  └──────────────────────────────────────────────────────────────────┘
```

**Screens:** `/partner/applications/[id]/dd`
**Emotion:** Data-driven confidence in decision
**Goal:** Validate or challenge the AI assessment with deeper evidence

---

### Phase 5: Decision & Investment Allocation

After reviewing application + assessment + DD, the partner makes a decision.

```
DECISION FLOW:

  Partner clicks [Approve] on /partner/applications/[id]
       |
       v
  Confirmation modal:
  "Approve NovaPay? This will:
   - Create a startup profile
   - Allocate $50k cash + $50k credits
   - Generate 20-week programme
   - Notify the founder"
       |
       ├── [Confirm] → Status: approved
       │   └── Auto-creates: Startup, Founders, Investment, Checkpoints
       │
       └── [Cancel] → Return to review

  Partner clicks [Reject]:
       |
       v
  "Reject NovaPay? Add feedback:"
  [Textarea for rejection reason]
  [Confirm Rejection]
```

---

### Phase 6: Portfolio Management

Once startups are accepted, partners manage the portfolio.

```
/partner/portfolio

  ┌──────────────────────────────────────────────────────────────┐
  │  PORTFOLIO                              [Grid] [List] view   │
  ├──────────────────────────────────────────────────────────────┤
  │                                                              │
  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
  │  │  NovaPay     │  │  MindFlow    │  │  GreenGrid   │      │
  │  │  ──────────  │  │  ──────────  │  │  ──────────  │      │
  │  │  Score: 82   │  │  Score: 76   │  │  Score: 88   │      │
  │  │  Stage: Rev  │  │  Stage: MVP  │  │  Stage: Rev  │      │
  │  │  Week: 4/20  │  │  Week: 8/20  │  │  Week: 12/20 │      │
  │  │  Risk: Low   │  │  Risk: Med   │  │  Risk: Low   │      │
  │  │  [View →]    │  │  [View →]    │  │  [View →]    │      │
  │  └──────────────┘  └──────────────┘  └──────────────┘      │
  │                                                              │
  │  ... more startup cards ...                                  │
  └──────────────────────────────────────────────────────────────┘
```

```
/partner/portfolio/[id]

  ┌──────────────────────────────────────────────────────────────┐
  │  NovaPay — Startup Detail                                    │
  ├──────────────────────────────────────────────────────────────┤
  │                                                              │
  │  Company Overview:                                           │
  │  ├── Industry: Fintech                                       │
  │  ├── Model: B2B SaaS                                         │
  │  ├── City: San Francisco                                     │
  │  └── Cohort: Spring 2026                                     │
  │                                                              │
  │  Founders:                                                   │
  │  ├── Sarah Chen (CEO) — Skills: Tech 4, Sales 3, Leadership 5│
  │  └── Marcus Webb (CTO) — Skills: Tech 5, Product 4           │
  │                                                              │
  │  Programme Progress:                                         │
  │  Week 4/20 — Problem Discovery                               │
  │  ████████████████░░░░░░░░░░░░░░░░ 20%                       │
  │                                                              │
  │  Investment Status:                                          │
  │  ├── Cash: $47,200 / $50,000 remaining                      │
  │  └── Credits: $50,000 / $50,000 remaining                   │
  │                                                              │
  │  Key Metrics:                                                │
  │  ├── MRR: $4,200 → $5,800 (+38%)                            │
  │  ├── Users: 340 → 512 (+50%)                                 │
  │  └── Burn: $8,200/mo                                         │
  │                                                              │
  │  Recent Checkpoints:                                         │
  │  [Week 4 details...]                                         │
  └──────────────────────────────────────────────────────────────┘
```

**Screens:** `/partner/portfolio`, `/partner/portfolio/[id]`
**Emotion:** Engaged, invested in outcomes
**Goal:** Monitor startup health and progress

---

### Phase 7: Investment Oversight

```
/partner/investments

  ┌──────────────────────────────────────────────────────────────┐
  │  INVESTMENT MANAGEMENT                                       │
  ├──────────────────────────────────────────────────────────────┤
  │                                                              │
  │  Portfolio Summary:                                          │
  │  ├── Total Allocated: $1,200,000                             │
  │  ├── Cash Deployed: $156,400                                 │
  │  ├── Credits Deployed: $42,000                               │
  │  └── Pending Requests: 3 ($7,800 total)                      │
  │                                                              │
  │  PENDING REQUESTS (requires action)                          │
  │  ┌──────────────┬──────────┬─────────┬────────┬───────────┐ │
  │  │ Startup      │ Category │ Amount  │ Date   │ Action    │ │
  │  ├──────────────┼──────────┼─────────┼────────┼───────────┤ │
  │  │ NovaPay      │ Equip.   │ $2,400  │ Mar 3  │ [✓] [✗]  │ │
  │  │ MindFlow     │ Services │ $3,200  │ Mar 2  │ [✓] [✗]  │ │
  │  │ GreenGrid    │ Consult. │ $2,200  │ Mar 1  │ [✓] [✗]  │ │
  │  └──────────────┴──────────┴─────────┴────────┴───────────┘ │
  │                                                              │
  │  RECENT TRANSACTIONS                                         │
  │  ├── NovaPay — Salaries — $1,200 — Approved (Mar 1)          │
  │  ├── GreenGrid — Equipment — $4,500 — Approved (Feb 28)      │
  │  └── MindFlow — Services — $800 — Approved (Feb 27)          │
  │                                                              │
  │  🔔 Realtime: New requests appear instantly via push          │
  └──────────────────────────────────────────────────────────────┘
```

**Screens:** `/partner/investments`, `/partner/investments/[id]`
**Emotion:** Responsible, attentive to spend
**Goal:** Approve legitimate requests quickly, flag concerns

---

### Phase 8: Mentor Matching

```
/partner/matches

  ┌──────────────────────────────────────────────────────────────┐
  │  MENTOR-STARTUP MATCHING                                     │
  ├──────────────────────────────────────────────────────────────┤
  │                                                              │
  │  [Pending (4)]  [Approved (8)]  [Completed (3)]  [All (15)] │
  │  ═══════════                                                 │
  │                                                              │
  │  SUGGESTED MATCH:                                            │
  │  ┌────────────────────────────────────────────────────────┐  │
  │  │  Lisa Park (Mentor) ←→ NovaPay (Startup)              │  │
  │  │                                                        │  │
  │  │  Match Score: 87/100                                   │  │
  │  │                                                        │  │
  │  │  Scoring Breakdown:                                    │  │
  │  │  ├── Expertise:    █████████░  92  (30% weight)       │  │
  │  │  ├── Stage Fit:    ████████░░  84  (25% weight)       │  │
  │  │  ├── Industry:     █████████░  90  (15% weight)       │  │
  │  │  ├── Track Record: ████████░░  82  (15% weight)       │  │
  │  │  ├── Availability: ████████░░  80  (10% weight)       │  │
  │  │  └── Personality:  █████████░  88  ( 5% weight)       │  │
  │  │                                                        │  │
  │  │  Why this match:                                       │  │
  │  │  "Lisa's 10 years in fintech payments + prior          │  │
  │  │   mentorship of 3 B2B SaaS startups aligns            │  │
  │  │   perfectly with NovaPay's needs."                     │  │
  │  │                                                        │  │
  │  │  [✓ Approve Match]  [✗ Decline]  [→ View Detail]      │  │
  │  └────────────────────────────────────────────────────────┘  │
  │                                                              │
  │  MARKETPLACE INSIGHTS:                                       │
  │  ├── Mentors available: 24                                   │
  │  ├── Startups seeking mentors: 8                             │
  │  ├── Gaps: No mentors with biotech expertise                 │
  │  └── Top match rate: 91% satisfaction                        │
  └──────────────────────────────────────────────────────────────┘
```

**Screens:** `/partner/matches`, `/partner/matches/[id]`
**Emotion:** Strategic, connecting the dots
**Goal:** Ensure high-quality mentor-startup pairings

---

### Phase 9: Metrics & Analytics

```
/partner/metrics

  ┌──────────────────────────────────────────────────────────────┐
  │  PORTFOLIO METRICS                                           │
  ├──────────────────────────────────────────────────────────────┤
  │                                                              │
  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌──────────┐ │
  │  │ Total     │  │ Startups  │  │ Avg Score │  │ At Risk  │ │
  │  │ Invested  │  │ Active    │  │           │  │          │ │
  │  │  $600K    │  │    12     │  │   79/100  │  │    2     │ │
  │  └───────────┘  └───────────┘  └───────────┘  └──────────┘ │
  │                                                              │
  │  Portfolio MRR (aggregate):                                  │
  │  ┌──────────────────────────────────────────────┐            │
  │  │  $                                            │            │
  │  │  60k ─                              ╭─────   │            │
  │  │  40k ─                     ╭────────╯        │            │
  │  │  20k ─            ╭────────╯                 │            │
  │  │   0  ─ ───────────╯                          │            │
  │  │       Jan   Feb   Mar   Apr   May   Jun      │            │
  │  └──────────────────────────────────────────────┘            │
  │                                                              │
  │  Score Distribution:                                         │
  │  80-100: ████████ 4 startups                                │
  │  60-79:  ██████████████ 6 startups                          │
  │  40-59:  ████ 2 startups                                    │
  │  <40:    0 startups                                          │
  │                                                              │
  │  Risk Heatmap:                                               │
  │  [Low: 8] [Normal: 2] [Elevated: 1] [High: 1]              │
  └──────────────────────────────────────────────────────────────┘
```

**Screens:** `/partner/metrics`
**Emotion:** Confident, data-backed
**Goal:** Understand portfolio health at a glance

---

### Partner Journey Summary Timeline

```
ONGOING (Daily/Weekly Cycle):

  ┌──────────┐     ┌─────────────────┐     ┌──────────────┐
  │Dashboard │────→│ Review Pipeline  │────→│ Deep Review   │
  │Overview  │     │ (Applications)   │     │ (App Detail)  │
  └──────────┘     └─────────────────┘     └──────┬───────┘
       ↑                                          │
       │           ┌─────────────────┐            │
       │           │  Due Diligence  │←───────────┤
       │           │  (DD Report)    │            │
       │           └────────┬────────┘            │
       │                    │                     │
       │                    v                     v
       │           ┌─────────────────┐     ┌──────────────┐
       │           │  Decision       │     │ Investment   │
       │           │  (Approve/Rej.) │     │ Approval     │
       │           └────────┬────────┘     └──────────────┘
       │                    │
       │                    v
       │           ┌─────────────────┐     ┌──────────────┐
       ├───────────│  Portfolio      │────→│ Startup      │
       │           │  Management     │     │ Detail       │
       │           └─────────────────┘     └──────────────┘
       │
       │           ┌─────────────────┐     ┌──────────────┐
       ├───────────│  Matches        │────→│ Match Detail │
       │           │  (Mentor Pairs) │     │              │
       │           └─────────────────┘     └──────────────┘
       │
       │           ┌─────────────────┐
       └───────────│  Metrics &      │
                   │  Analytics      │
                   └─────────────────┘
```

---

## 4. Screen Inventory & Wireframe Map

### Complete Site Map

```
sanctuary.vc
│
├── PUBLIC
│   ├── /auth/login ..................... Login (email/password + OAuth)
│   ├── /auth/signup ................... Registration
│   ├── /auth/role-select .............. Choose Founder or Partner
│   └── /auth/callback ................. OAuth redirect handler
│
├── FOUNDER PORTAL (/founder/*)
│   ├── /founder/dashboard ............. Home — status overview, quick stats
│   ├── /founder/apply ................. 6-step application wizard
│   ├── /founder/interview/[id] ........ AI interview (text or voice)
│   ├── /founder/company ............... Company profile editor
│   ├── /founder/documents ............. Document upload & management
│   ├── /founder/investment/cash ....... Cash allocation & requests
│   ├── /founder/investment/credits .... Credits allocation & requests
│   ├── /founder/metrics ............... KPI tracking & charts
│   ├── /founder/progress .............. 20-week checkpoint tracker
│   ├── /founder/requests .............. Service request management
│   └── /founder/settings .............. Profile & preferences
│
├── PARTNER PORTAL (/partner/*)
│   ├── /partner/dashboard ............. Home — pipeline overview, action items
│   ├── /partner/applications .......... Application list (3 tabs)
│   ├── /partner/applications/[id] ..... Application deep-dive + assessment
│   ├── /partner/applications/[id]/dd .. Due diligence + God Mode report
│   ├── /partner/portfolio ............. Startup grid/list
│   ├── /partner/portfolio/[id] ........ Individual startup detail
│   ├── /partner/investments ........... Investment overview + approvals
│   ├── /partner/investments/[id] ...... Individual investment detail
│   ├── /partner/matches ............... Mentor-startup matching
│   ├── /partner/matches/[id] .......... Match detail
│   ├── /partner/mentors ............... Mentor database
│   ├── /partner/mentors/[id] .......... Mentor profile
│   ├── /partner/metrics ............... Portfolio analytics
│   ├── /partner/shared-views .......... Internal reports
│   └── /partner/settings .............. Partner preferences
│
└── API ROUTES (/api/*)
    ├── /api/interview/chat ............ Streaming interview endpoint
    ├── /api/assessment/* .............. Assessment pipeline
    ├── /api/research/* ................ Tavily web research
    ├── /api/dd/* ...................... Due diligence pipeline
    └── /api/memo/* .................... Investment memo generation
```

---

## 5. Screen-by-Screen Wireframe Descriptions

### 5.1 Auth Screens

#### `/auth/login`
```
┌──────────────────────────────────────────┐
│              SANCTUARY                    │
│          ─────────────────               │
│                                          │
│  Email:    [_________________________]   │
│  Password: [_________________________]   │
│                                          │
│            [    Log In    ]              │
│                                          │
│         ─── or continue with ───         │
│                                          │
│            [  Google OAuth  ]            │
│                                          │
│  Don't have an account? Sign up →        │
└──────────────────────────────────────────┘
```

**Layout:** Centered card, minimal. Logo at top.
**Components:** Input fields, primary button, OAuth button, link.
**Responsive:** Single column at all breakpoints.

#### `/auth/signup`
```
┌──────────────────────────────────────────┐
│              SANCTUARY                    │
│        Create your account               │
│                                          │
│  Name:     [_________________________]   │
│  Email:    [_________________________]   │
│  Password: [_________________________]   │
│                                          │
│            [   Sign Up    ]              │
│                                          │
│         ─── or continue with ───         │
│                                          │
│            [  Google OAuth  ]            │
│                                          │
│  Already have an account? Log in →       │
└──────────────────────────────────────────┘
```

#### `/auth/role-select`
```
┌──────────────────────────────────────────────────────────┐
│                    SANCTUARY                              │
│              How will you use Sanctuary?                  │
│                                                          │
│  ┌─────────────────────┐  ┌─────────────────────┐       │
│  │                     │  │                     │       │
│  │    🏢 FOUNDER       │  │    🤝 PARTNER       │       │
│  │                     │  │                     │       │
│  │  I'm building a     │  │  I review and       │       │
│  │  startup and want   │  │  invest in          │       │
│  │  to apply to the    │  │  startups in the    │       │
│  │  accelerator.       │  │  accelerator.       │       │
│  │                     │  │                     │       │
│  │    [Select →]       │  │    [Select →]       │       │
│  └─────────────────────┘  └─────────────────────┘       │
└──────────────────────────────────────────────────────────┘
```

**Layout:** Two-card selection. Centered.
**Interaction:** Click selects role and redirects to respective dashboard.

---

### 5.2 Founder Screens

#### `/founder/dashboard` — Empty State (Pre-Application)
```
┌─[Sidebar]──┬────────────────────────────────────────────────┐
│             │                                                │
│  Dashboard  │  Welcome to Sanctuary, [Name]!                │
│  Apply      │                                                │
│  Company    │  ┌──────────────────────────────────────────┐  │
│  Documents  │  │                                          │  │
│  Investment │  │  You haven't applied yet.                │  │
│  Metrics    │  │                                          │  │
│  Progress   │  │  The Sanctuary accelerator provides:     │  │
│  Requests   │  │  • $50K cash + $50K credits              │  │
│  Settings   │  │  • 20-week structured programme          │  │
│  ───────    │  │  • AI-powered mentor matching            │  │
│  Log out    │  │  • Evidence-based growth support         │  │
│             │  │                                          │  │
│             │  │       [Start Your Application →]         │  │
│             │  │                                          │  │
│             │  └──────────────────────────────────────────┘  │
│             │                                                │
└─────────────┴────────────────────────────────────────────────┘
```

#### `/founder/dashboard` — Active State (In Programme)
```
┌─[Sidebar]──┬────────────────────────────────────────────────────────┐
│             │                                                        │
│  Dashboard  │  Welcome back, Sarah                                  │
│  Company    │  Week 4 of 20 — Problem Discovery                     │
│  Documents  │                                                        │
│  Cash       │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  Credits    │  │ Score    │ │ Cash     │ │ Credits  │ │ Docs     ││
│  Metrics    │  │ 82/100   │ │ $47.2K   │ │ $50.0K   │ │ 4/6      ││
│  Progress   │  └──────────┘ └──────────┘ └──────────┘ └──────────┘│
│  Requests   │                                                        │
│  Settings   │  Current Checkpoint:                                   │
│             │  ┌──────────────────────────────────────────────────┐  │
│             │  │ Week 4: Customer Interview Synthesis              │  │
│             │  │ ████████████░░░░░░░░ 60%                        │  │
│             │  │ Tasks: 3/5 complete                               │  │
│             │  │ [View Details →]                                  │  │
│             │  └──────────────────────────────────────────────────┘  │
│             │                                                        │
│             │  Recent Activity:                                      │
│             │  • Investment request approved ($1,200) — Mar 1       │
│             │  • Week 3 checkpoint completed — Feb 28               │
│             │  • Mentor match: Lisa Park — Feb 25                   │
│             │                                                        │
└─────────────┴────────────────────────────────────────────────────────┘
```

#### `/founder/apply` — Application Wizard
```
┌─[Sidebar]──┬────────────────────────────────────────────────────────┐
│             │                                                        │
│  Dashboard  │  Apply to Sanctuary                                   │
│  ► Apply    │                                                        │
│  ...        │  Progress: ●───●───●───◉───○───○                      │
│             │            1   2   3   4   5   6                      │
│             │                                                        │
│             │  Step 4 of 6: Your Solution                           │
│             │  ──────────────────────────                            │
│             │                                                        │
│             │  Describe your solution: *                             │
│             │  ┌──────────────────────────────────────────────┐     │
│             │  │                                              │     │
│             │  │  [Multi-line text area]                      │     │
│             │  │                                              │     │
│             │  └──────────────────────────────────────────────┘     │
│             │                                                        │
│             │  Current stage: *                                      │
│             │  ( ) Idea                                              │
│             │  ( ) Prototype                                         │
│             │  (●) MVP                                               │
│             │  ( ) Revenue                                           │
│             │  ( ) Growth                                            │
│             │                                                        │
│             │                        [← Back]   [Next: Traction →]  │
│             │                                                        │
│             │  ◻ Draft auto-saved 2 seconds ago                     │
│             │                                                        │
└─────────────┴────────────────────────────────────────────────────────┘
```

#### `/founder/interview/[id]` — AI Interview
```
┌──────────────────────────────────────────────────────────────────────┐
│  AI INTERVIEW                        Section 2/5: Problem           │
│  ════════════════════════════════════════════════════════════════    │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                                                              │   │
│  │  AI: "You mentioned your target customers are mid-size      │   │
│  │  e-commerce companies. Can you walk me through a specific   │   │
│  │  interaction where a customer described their payment        │   │
│  │  reconciliation pain?"                                      │   │
│  │                                                              │   │
│  │  ─────────────────────────────────────────                   │   │
│  │                                                              │   │
│  │  You: "Sure. Last month, the CFO at RetailCo told us they  │   │
│  │  spend 3 full days each month manually matching payments    │   │
│  │  across Stripe, PayPal, and their bank. They've tried       │   │
│  │  building internal tools but the edge cases kept growing."  │   │
│  │                                                              │   │
│  │  ─────────────────────────────────────────                   │   │
│  │                                                              │   │
│  │  AI: "That's a compelling example. When you say '3 full    │   │
│  │  days' — what's the cost of that in terms of their          │   │
│  │  operations? And how many similar companies have you..."     │   │
│  │  ▌ (streaming)                                              │   │
│  │                                                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────┐  [Send →]     │
│  │ Type your response...                            │               │
│  └──────────────────────────────────────────────────┘               │
│                                                                      │
│  Section progress: ████████████░░░░░░░░ Exchange 3/4                │
│  [🎙 Switch to Voice Mode]                                          │
└──────────────────────────────────────────────────────────────────────┘
```

#### `/founder/investment/cash`
```
┌─[Sidebar]──┬────────────────────────────────────────────────────────┐
│             │                                                        │
│  Dashboard  │  Cash Investment                                      │
│  Company    │                                                        │
│  Documents  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐    │
│  ► Cash     │  │ Total    │  │ Used     │  │ Available        │    │
│  Credits    │  │ $50,000  │  │ $2,800   │  │ $47,200          │    │
│  ...        │  └──────────┘  └──────────┘  └──────────────────┘    │
│             │                                                        │
│             │  Category Breakdown:     [+ Request Funds]            │
│             │  ┌─────────────────────────────────────────┐          │
│             │  │     ╭───────╮                           │          │
│             │  │    /Salaries\  $1,200                   │          │
│             │  │   │Equipment │  $800                    │          │
│             │  │    \Services/  $500                     │          │
│             │  │     ╰Consult╯  $300                     │          │
│             │  └─────────────────────────────────────────┘          │
│             │                                                        │
│             │  Transaction History:                                  │
│             │  ┌──────────┬──────────┬─────────┬────────┐          │
│             │  │ Date     │ Category │ Amount  │ Status │          │
│             │  ├──────────┼──────────┼─────────┼────────┤          │
│             │  │ Mar 1    │ Salaries │ $1,200  │ ✓ Appr │          │
│             │  │ Feb 25   │ Equip.   │ $800    │ ✓ Appr │          │
│             │  │ Feb 20   │ Services │ $500    │ Pending│          │
│             │  └──────────┴──────────┴─────────┴────────┘          │
│             │                                                        │
└─────────────┴────────────────────────────────────────────────────────┘
```

#### `/founder/progress` — 20-Week Tracker
```
┌─[Sidebar]──┬────────────────────────────────────────────────────────┐
│             │                                                        │
│  Dashboard  │  Programme Progress                                   │
│  ...        │                                                        │
│  ► Progress │  ┌────────────────────────────────────────────────┐   │
│  ...        │  │  Problem Discovery    ████████████░░  Wk 1-4  │   │
│             │  │  Solution Shaping     ░░░░░░░░░░░░░░  Wk 5-8  │   │
│             │  │  User Value           ░░░░░░░░░░░░░░  Wk 9-12 │   │
│             │  │  Growth               ░░░░░░░░░░░░░░  Wk 13-16│   │
│             │  │  Capital Ready        ░░░░░░░░░░░░░░  Wk 17-20│   │
│             │  └────────────────────────────────────────────────┘   │
│             │                                                        │
│             │  ┌────┬─────────────────────┬───────────┬───────────┐ │
│             │  │ Wk │ Goal                │ Status    │ Notes     │ │
│             │  ├────┼─────────────────────┼───────────┼───────────┤ │
│             │  │  1 │ Define ICP          │ ✓ Done    │ "Strong"  │ │
│             │  │  2 │ 5 interviews        │ ✓ Done    │ "Good"    │ │
│             │  │  3 │ Pain point ranking  │ ✓ Done    │ —         │ │
│             │  │  4 │ Interview synthesis │ ◉ Active  │ —         │ │
│             │  │  5 │ MVP scope           │ ○ Pending │ —         │ │
│             │  │ .. │ ...                 │ ...       │ ...       │ │
│             │  └────┴─────────────────────┴───────────┴───────────┘ │
│             │                                                        │
│             │  [Expand Week 4 ↓]                                    │
│             │  ┌──────────────────────────────────────────────────┐ │
│             │  │ Goal: Compile insights from 10+ interviews       │ │
│             │  │ Question: What patterns emerged?                  │ │
│             │  │ Tasks:                                            │ │
│             │  │  ✓ Transcribe all interviews                     │ │
│             │  │  ✓ Tag recurring themes                          │ │
│             │  │  ✓ Identify top 3 pains                         │ │
│             │  │  □ Create pain-frequency matrix                  │ │
│             │  │  □ Write synthesis doc                           │ │
│             │  │ Founder Notes: [editable textarea]               │ │
│             │  │ Partner Notes: "Focus on quantifying pain" (RO)  │ │
│             │  │ Evidence: [+ Add link]                           │ │
│             │  └──────────────────────────────────────────────────┘ │
│             │                                                        │
└─────────────┴────────────────────────────────────────────────────────┘
```

---

### 5.3 Partner Screens

(Wireframes for partner screens are included inline within the Partner User Journey sections above — Phases 1 through 9.)

Additional detail:

#### `/partner/settings`
```
┌─[Sidebar]──┬────────────────────────────────────────────────────────┐
│             │                                                        │
│  Dashboard  │  Settings                                             │
│  ...        │                                                        │
│  ► Settings │  Profile                                              │
│             │  ├── Name: [_________________]                        │
│             │  ├── Email: [_________________]                       │
│             │  └── Avatar: [Upload]                                  │
│             │                                                        │
│             │  Notifications                                         │
│             │  ├── ✓ New applications                               │
│             │  ├── ✓ Assessment complete                            │
│             │  ├── ✓ Investment requests                            │
│             │  └── ✓ Checkpoint updates                             │
│             │                                                        │
│             │  Preferences                                           │
│             │  ├── Default view: [Grid ▼]                           │
│             │  └── Timezone: [America/New_York ▼]                   │
│             │                                                        │
│             │                               [Save Changes]          │
│             │                                                        │
└─────────────┴────────────────────────────────────────────────────────┘
```

---

## 6. Flow Diagrams

### 6.1 Application-to-Decision Flow (Full Pipeline)

```
FOUNDER                           SYSTEM (AI AGENTS)                    PARTNER
───────                           ─────────────────                    ───────

Signs up
    │
    v
Selects "Founder"
    │
    v
Fills 6-step application ──────→ Application stored
    │                            Status: submitted
    v                                │
Enters AI interview                  │
    │                                │
    │ ←── 5-section dialogue ──→ Interview Agent
    │                            (Claude + streaming)
    │                                │
    v                                v
Interview complete ──────────→ Transcript stored
                               Status: interview_completed
                                     │
                                     ├──→ Assessment Agent
                                     │    (4-dimension scoring)
                                     │         │
                                     ├──→ Research Agent
                                     │    (Tavily web search)
                                     │         │
                                     ├──→ Memo Generator
                                     │    (Investment memo)
                                     │         │
                                     v         v
                               Status: assessment_generated
                                     │
                                     │                        Sees in "Needs Review"
                                     │                              │
                                     │                              v
                                     │                        Reviews assessment
                                     │                              │
                                     │                        Clicks [Run DD]
                                     │                              │
                                     ├──→ Claim Extraction ────→ Claims table
                                     ├──→ Claim Verification       │
                                     ├──→ Document Verification    │
                                     ├──→ Team Assessment          │
                                     ├──→ Market Assessment        │
                                     ├──→ DD Report Generator      │
                                     └──→ God Mode DD Agent        │
                                          │                        │
                                          v                        v
                                     DD Report complete      Reviews DD report
                                                                   │
                                                             ┌─────┴──────┐
                                                             │            │
                                                          APPROVE     REJECT
                                                             │            │
                                                             v            v
Receives approval ←──── Startup created            Receives feedback
notification              Investment allocated       with AI-generated
    │                     Programme generated         constructive notes
    v                     Checkpoints created              │
Begins 20-week                   │                         v
programme                        │                    Can reapply
    │                            v                    in 6 months
    └──────────────→ Calibration Engine records
                     decision for self-improvement
```

### 6.2 Investment Request Flow

```
FOUNDER                          SYSTEM                           PARTNER
───────                          ──────                           ───────

Clicks [Request Funds]
    │
    v
Fills request form:
├── Category (salaries/equip/etc)
├── Amount
├── Title & description
    │
    v
    ──────────────────────────→ Transaction created
                                Status: pending
                                     │
                                     ├───→ Realtime push ────→ 🔔 Toast notification
                                     │                             │
                                     │                             v
                                     │                        Sees in Investments
                                     │                             │
                                     │                        ┌────┴─────┐
                                     │                        │          │
                                     │                     APPROVE    DENY
                                     │                        │          │
                                     v                        v          v
🔔 Notified of approval ←── Status: approved     🔔 Notified of denial
Balance updated                                   Status: denied
```

### 6.3 Mentor Matching Flow

```
SYSTEM                                              PARTNER
──────                                              ───────

Matchmaking Agent runs:
├── Scans mentor profiles
├── Scans startup needs
├── 6-dimension scoring
│   ├── Expertise (30%)
│   ├── Stage Fit (25%)
│   ├── Industry (15%)
│   ├── Track Record (15%)
│   ├── Availability (10%)
│   └── Personality (5%)
│
v
Match suggestions generated ──────────────────→ Views in /partner/matches
                                                     │
                                               ┌─────┴──────┐
                                               │            │
                                            APPROVE      DECLINE
                                               │            │
                                               v            v
                                         Status: approved   Match removed
                                               │
                                               v
                                         Intro email sent
                                         Status: intro_sent
                                               │
                                               v
                                         First meeting
                                         Status: completed
```

---

## 7. State Machines

### 7.1 Application Status Machine

```
                    ┌───────────┐
                    │   draft   │  (saved but not submitted)
                    └─────┬─────┘
                          │ Submit
                          v
                    ┌───────────┐
                    │ submitted │
                    └─────┬─────┘
                          │ Interview scheduled
                          v
               ┌────────────────────┐
               │interview_scheduled │
               └─────────┬──────────┘
                         │ Interview completed
                         v
              ┌─────────────────────┐
              │interview_completed  │
              └─────────┬───────────┘
                        │ AI assessment runs
                        v
             ┌──────────────────────┐
             │assessment_generated  │
             └─────────┬────────────┘
                       │ Partner opens review
                       v
                ┌──────────────┐
                │ under_review │
                └───────┬──────┘
                        │
                  ┌─────┴──────┐
                  │            │
                  v            v
            ┌──────────┐ ┌──────────┐
            │ approved │ │ rejected │
            └──────────┘ └──────────┘
```

### 7.2 Investment Transaction Status Machine

```
            ┌─────────┐
            │ pending │  ←── Founder submits request
            └────┬────┘
                 │
           ┌─────┴──────┐
           │            │
           v            v
     ┌──────────┐ ┌──────────┐
     │ approved │ │  denied  │  ←── Partner decides
     └──────────┘ └──────────┘

     ┌───────────┐
     │ cancelled │  ←── Founder can cancel while pending
     └───────────┘
```

### 7.3 Checkpoint Status Machine

```
     ┌─────────┐
     │ pending │  ←── Auto-created on startup approval
     └────┬────┘
          │ Founder starts working
          v
    ┌─────────────┐
    │ in_progress │
    └──────┬──────┘
           │
     ┌─────┴──────┐
     │            │
     v            v
┌───────────┐ ┌─────────┐
│ completed │ │ blocked │  ←── External dependency
└───────────┘ └────┬────┘
                   │ Unblocked
                   v
             ┌─────────────┐
             │ in_progress │ (returns to in_progress)
             └─────────────┘
```

### 7.4 Match Status Machine

```
     ┌───────────┐
     │ suggested │  ←── AI generates match
     └─────┬─────┘
           │ Partner reviews
     ┌─────┴──────┐
     │            │
     v            v
┌──────────┐ ┌──────────┐
│ approved │ │ declined │
└────┬─────┘ └──────────┘
     │ Intro sent
     v
┌────────────┐
│ intro_sent │
└─────┬──────┘
      │ First meeting held
      v
┌───────────┐
│ completed │
└───────────┘
```

---

## 8. Cross-Role Interactions

These are moments where Founder and Partner journeys intersect.

### 8.1 Application Review Handoff

```
FOUNDER submits application
         │
         │ ──── Async boundary (1-5 days) ────
         │
         v
PARTNER reviews in /partner/applications/[id]
         │
         v
Decision flows back to FOUNDER dashboard
```

### 8.2 Investment Request Cycle

```
FOUNDER requests funds (/founder/investment/cash)
         │
         │ ──── Realtime notification ────
         │
         v
PARTNER approves/denies (/partner/investments)
         │
         │ ──── Realtime notification ────
         │
         v
FOUNDER sees updated balance
```

### 8.3 Checkpoint Collaboration

```
FOUNDER updates checkpoint notes & evidence (/founder/progress)
         │
         │ ──── Visible to partner ────
         │
         v
PARTNER adds notes (/partner/portfolio/[id])
         │
         │ ──── Visible to founder (read-only) ────
         │
         v
FOUNDER reads partner feedback
```

### 8.4 Mentor Introduction

```
AI generates match suggestion
         │
         v
PARTNER approves match (/partner/matches)
         │
         v
Both FOUNDER and MENTOR receive intro notification
         │
         v
Meeting scheduled outside platform
         │
         v
PARTNER marks match as completed
```

---

## Appendix A: Screen Count Summary

| Portal | Screens | Status |
|--------|---------|--------|
| Auth | 4 | Live |
| Founder | 11 | Live |
| Partner | 15 | Live (some stubs) |
| **Total** | **30** | |

## Appendix B: Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | 375px | Sidebar collapses to hamburger menu. Single column. |
| Tablet | 768px | Sidebar visible. Content area adapts to 2 columns where applicable. |
| Desktop | 1280px+ | Full sidebar + multi-column content. Charts and tables fully expanded. |

## Appendix C: Realtime Features

| Feature | Trigger | Channel |
|---------|---------|---------|
| Investment request notification | Founder submits request | Supabase Realtime |
| Approval/denial notification | Partner decides | Supabase Realtime |
| Application status update | Pipeline stage change | Supabase Realtime |
| Interview streaming | AI response generation | Server-Sent Events (SSE) |

---

*Document generated: 2026-03-05*
*Product: Sanctuary OS v1.0*
