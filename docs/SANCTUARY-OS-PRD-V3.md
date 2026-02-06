# Sanctuary OS — Product Requirements Document

**Version:** 3.0
**Last Updated:** 2026-02-06
**Status:** Active Development

---

## Executive Summary

Sanctuary OS is an **AI-native startup accelerator platform** that transforms how accelerators evaluate, onboard, and support founders. The system uses a mesh of specialized AI agents that continuously improve through structured feedback loops, creating a flywheel where every interaction makes the platform smarter.

### Core Innovation

Traditional accelerators rely on:
- Manual application reviews (hours per application)
- Inconsistent interview quality
- Gut-feel scoring
- No systematic learning from outcomes

Sanctuary OS delivers:
- **AI-conducted interviews** that probe deeper than humans
- **Evidence-based scoring** with transparent reasoning
- **Self-calibrating assessments** that improve with every decision
- **Rich metadata collection** that enables continuous learning

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SANCTUARY OS ARCHITECTURE                         │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │   FOUNDERS      │
                              │   (Applicants)  │
                              └────────┬────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    │                                      │
                    ▼                                      ▼
          ┌─────────────────┐                   ┌─────────────────┐
          │  Application    │                   │   AI Interview  │
          │  Form + Metadata│                   │   Agent         │
          └────────┬────────┘                   └────────┬────────┘
                   │                                      │
                   │    ┌──────────────────────┐         │
                   └───►│  ENRICHED DATABASE   │◄────────┘
                        │                      │
                        │  • Applications      │
                        │  • Transcripts       │
                        │  • Signals           │
                        │  • Metadata          │
                        └──────────┬───────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                              │
                    ▼                              ▼
          ┌─────────────────┐           ┌─────────────────┐
          │  Assessment     │           │  Programme      │
          │  Agent          │           │  Agent          │
          └────────┬────────┘           └────────┬────────┘
                   │                              │
                   └──────────────┬───────────────┘
                                  │
                                  ▼
                        ┌─────────────────┐
                        │   PARTNERS      │
                        │   (Reviewers)   │
                        └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │  Feedback Loop  │
                        │  • Agree/Override│
                        │  • Score Adjust │
                        │  • Outcomes     │
                        └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │  Calibration    │
                        │  Engine         │
                        │  • Weight adjust│
                        │  • Prompt refine│
                        └─────────────────┘
```

---

## User Journeys

### Journey 1: Founder Application Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FOUNDER JOURNEY                                      │
└─────────────────────────────────────────────────────────────────────────────┘

PHASE 1: DISCOVERY & SIGNUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Landing Page (/)
    │
    ├── "Apply to Sanctuary" CTA
    │
    ▼
Authentication (/auth/signup)
    │
    ├── Email/Password
    ├── Google OAuth
    └── GitHub OAuth
    │
    ▼
Role Selection (/auth/role-select)
    │
    └── Select "I am a Founder"
    │
    ▼
Founder Dashboard (/founder/dashboard)


PHASE 2: APPLICATION
━━━━━━━━━━━━━━━━━━━━
Application Form (/founder/apply)
    │
    ├── Step 1: Company Info
    │   • Company name, one-liner
    │   • Website, description
    │   📊 Metadata: time_on_step, edits_made
    │
    ├── Step 2: Founders
    │   • Names, roles, LinkedIn
    │   • Experience, prior startups
    │   📊 Metadata: founder_count, experience_years
    │
    ├── Step 3: Problem
    │   • Problem description
    │   • Target customer
    │   📊 Metadata: word_count, specificity_score
    │
    ├── Step 4: Solution
    │   • Solution description
    │   • Current stage
    │   📊 Metadata: buzzword_density
    │
    ├── Step 5: Traction
    │   • User count, MRR
    │   • Biggest challenge
    │   📊 Metadata: metrics_mentioned
    │
    └── Step 6: Fit
        • Why Sanctuary
        • What they want
        📊 Metadata: total_time, red_flags, green_flags
    │
    ▼
Application Submitted
    │
    └── Status: "submitted"
        Database: applications table
        Metadata: application_metadata (JSONB)


PHASE 3: AI INTERVIEW
━━━━━━━━━━━━━━━━━━━━━
Interview Start (/founder/interview/[id])
    │
    ├── API: POST /api/applications/[id]/interview {action: "start"}
    │   └── Status → "interviewing"
    │   └── interview_started_at recorded
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    INTERVIEW AGENT (Claude)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Section 1: FOUNDER DNA (10-15 min)                             │
│  ├── "Tell me about yourself in 60 seconds"                     │
│  ├── "What's the hardest thing you've overcome?"                │
│  ├── "How do you and your co-founder resolve disagreements?"    │
│  └── 📊 Signals: prior_exit, domain_expertise, grit             │
│                                                                  │
│  Section 2: PROBLEM INTERROGATION (10-15 min)                   │
│  ├── "How do you know this problem is real?"                    │
│  ├── "Tell me about a specific customer conversation"           │
│  ├── "What happens if they don't solve this?"                   │
│  └── 📊 Signals: customer_discovery, pain_quotes, frequency     │
│                                                                  │
│  Section 3: SOLUTION EXECUTION (10 min)                         │
│  ├── "Walk me through how it works"                             │
│  ├── "What have you built vs what's planned?"                   │
│  ├── "What did you cut and why?"                                │
│  └── 📊 Signals: shipping_speed, smart_cuts, technical_moat     │
│                                                                  │
│  Section 4: MARKET COMPETITION (5-10 min)                       │
│  ├── "Who else is solving this?"                                │
│  ├── "Why will you win?"                                        │
│  └── 📊 Signals: market_awareness, differentiation              │
│                                                                  │
│  Section 5: SANCTUARY FIT (5 min)                               │
│  ├── "What do you need most right now?"                         │
│  ├── "What does success look like in 6 months?"                 │
│  └── 📊 Signals: self_awareness, coachability                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
    │
    ▼
Interview Complete
    │
    ├── API: POST /api/applications/[id]/interview {action: "complete"}
    │   ├── transcript saved as JSONB
    │   ├── signals saved to interview_signals table
    │   ├── interview_metadata computed and saved
    │   └── Status → "under_review"
    │
    ▼
Complete Page (/founder/interview/[id]/complete)
    │
    └── "Thank you! We'll respond within 48 hours"


PHASE 4: ASSESSMENT (AI-Generated)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Assessment Agent (Automatic)
    │
    ├── Input: transcript + signals + application_metadata
    │
    ├── Output:
    │   ├── Founder Score (0-100) + reasoning
    │   ├── Problem Score (0-100) + reasoning
    │   ├── User Value Score (0-100) + reasoning
    │   ├── Execution Score (0-100) + reasoning
    │   ├── Overall Score (weighted)
    │   ├── Recommendation (accept/conditional/decline)
    │   ├── Key Strengths (with evidence)
    │   ├── Key Risks (with severity)
    │   ├── Critical Questions for partner
    │   └── Confidence levels per dimension
    │
    └── Saved: ai_assessment (JSONB), ai_score, assessment_metadata


PHASE 5: DECISION
━━━━━━━━━━━━━━━━━
Partner Review → Decision
    │
    ├── If ACCEPTED:
    │   ├── Status → "accepted"
    │   ├── Startup record created
    │   ├── Founder linked to startup
    │   └── Full dashboard access granted
    │
    └── If REJECTED:
        ├── Status → "rejected"
        └── Founder notified


PHASE 6: POST-ACCEPTANCE (Active Founders)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/founder/dashboard    → Overview, quick actions
/founder/company      → Edit company profile
/founder/documents    → Upload pitch decks, financials
/founder/progress     → Track milestones, checkpoints
/founder/metrics      → View metrics shared by partners
/founder/requests     → Request mentor help, features
/founder/settings     → Account settings
```

---

### Journey 2: Partner Review Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PARTNER JOURNEY                                      │
└─────────────────────────────────────────────────────────────────────────────┘

PHASE 1: AUTHENTICATION
━━━━━━━━━━━━━━━━━━━━━━━
/auth/login → /auth/role-select → "I am a Partner"
    │
    └── Select sub-type:
        ├── Mentor (focus: mentorship matching)
        ├── VC (focus: investment metrics)
        └── Startup Manager (full access)


PHASE 2: APPLICATION REVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━
/partner/applications
    │
    ├── Application List
    │   ├── Filter by status (submitted, interviewing, under_review)
    │   ├── Sort by date, score
    │   └── Quick stats (AI score, stage, MRR)
    │
    ▼
/partner/applications/[id]
    │
    ├── TAB 1: Overview
    │   ├── Company info card
    │   ├── Founder cards (experience, LinkedIn)
    │   ├── Problem/Solution summary
    │   └── Application metadata insights
    │
    ├── TAB 2: Interview
    │   ├── Full transcript viewer
    │   ├── Section navigation (jump to Founder DNA, etc.)
    │   ├── Highlighted quotes (from signals)
    │   ├── Behavioral insights
    │   │   ├── Response time patterns
    │   │   ├── Pause frequency
    │   │   └── Answer depth per section
    │   └── Interview metadata display
    │
    ├── TAB 3: Assessment
    │   ├── Overall score (large, color-coded)
    │   ├── Dimension scores with progress bars
    │   │   ├── Founder: 82 ████████░░
    │   │   ├── Problem: 78 ███████░░░
    │   │   ├── User Value: 72 ███████░░░
    │   │   └── Execution: 80 ████████░░
    │   ├── Reasoning for each score
    │   ├── Confidence indicators
    │   ├── Key Strengths (expandable cards)
    │   ├── Key Risks (with severity badges)
    │   ├── Critical Questions
    │   └── Evidence density indicator
    │
    ├── TAB 4: Programme
    │   ├── Proposed starting stage
    │   ├── Recommended duration
    │   ├── Success metrics
    │   ├── Conditions for acceptance
    │   ├── Mentor recommendations
    │   └── Weekly milestone preview
    │
    └── ACTIONS
        ├── [Approve] → Confirmation modal
        │   ├── Optional conditions
        │   └── Notes for founder
        │
        └── [Reject] → Confirmation modal
            ├── Reason selection
            └── Optional feedback


PHASE 3: FEEDBACK COLLECTION (Critical for Learning)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
After Decision:
    │
    ├── Agreement Checkboxes
    │   ├── ☑ Agree with recommendation
    │   ├── ☑ Agree with Founder score
    │   ├── ☐ Agree with Problem score (override: 80)
    │   ├── ☑ Agree with User Value score
    │   └── ☑ Agree with Execution score
    │
    ├── Qualitative Feedback
    │   ├── "What did AI miss?"
    │   └── "What did AI overweight?"
    │
    └── Saved to: assessment_feedback table
        └── Used for: calibration, weight adjustment


PHASE 4: PORTFOLIO MANAGEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/partner/portfolio         → Grid/list of active startups
/partner/portfolio/[id]    → Startup detail page
/partner/metrics           → Portfolio-wide metrics dashboard
/partner/mentors           → Mentor database
/partner/matches           → Mentor-startup matching
/partner/shared-views      → Control what founders see
```

---

## AI Agent Specifications

### Agent 1: Interview Agent

**Purpose:** Conduct structured, probing interviews that extract maximum signal from founders.

**Technology:**
- Model: Claude Sonnet 4 (claude-sonnet-4-20250514)
- Integration: Anthropic API via `@anthropic-ai/sdk`
- Response format: Structured JSON with response + signals

**Capabilities:**
- Maintains conversation context across sections
- Probes vague answers ("Can you be more specific?")
- Extracts signals in real-time with confidence scores
- Adapts questions based on previous answers
- Knows when to transition between sections
- Handles interview pause/resume

**Output per message:**
```typescript
{
  response: string,           // The actual message to founder
  shouldTransition: boolean,  // Move to next section?
  isComplete: boolean,        // Interview finished?
  signals: [
    {
      type: "founder_signal" | "problem_signal" | "risk_flag" | ...,
      content: "Prior exit to GitLab demonstrates execution ability",
      dimension: "founder" | "problem" | "user_value" | "execution",
      impact: +15  // -5 to +5 scale
    }
  ]
}
```

**Behavioral Metadata Collected:**
- Response times per question
- Pause frequency and duration
- Answer length patterns
- Clarification questions asked
- Topic coverage vs gaps

---

### Agent 2: Assessment Agent

**Purpose:** Analyze interview transcript and generate structured, evidence-based assessment.

**Input:**
- Full interview transcript
- Extracted signals with metadata
- Application form data
- Application metadata (content analysis, flags)

**Output:**
```typescript
{
  // Scores
  founderScore: 82,
  problemScore: 78,
  userValueScore: 72,
  executionScore: 80,
  overallScore: 78,  // Weighted: F×0.30 + P×0.25 + UV×0.25 + E×0.20

  // Recommendation
  recommendation: "accept" | "conditional" | "decline",
  recommendationConfidence: 0.85,

  // Reasoning
  founderReasoning: "Michael has a prior exit (GitLab acquisition)...",
  problemReasoning: "47 customer discovery calls with specific quotes...",
  userValueReasoning: "12 paying users at $200/month average...",
  executionReasoning: "8 months to first paying customer...",

  // Evidence
  keyStrengths: [
    { strength: "Founder-problem fit", evidence: "...", impact: "..." }
  ],
  keyRisks: [
    { risk: "GTM inexperience", evidence: "...", severity: "medium", mitigation: "..." }
  ],
  criticalQuestions: ["Can they hire enterprise sales?", ...],

  // Needs
  primaryNeed: "GTM strategy and sales process",
  mentorDomains: ["B2B Sales", "Developer Tools GTM"],

  // Metadata
  assessmentMetadata: {
    confidence: { overall: 0.82, founder: 0.88, ... },
    evidenceDensity: { founder: { positive: 5, negative: 1, ... }, ... },
    gapsIdentified: [{ dimension: "user_value", missing: "retention_rate" }],
    scoringBreakdown: { founder: { base: 50, signals: [...], final: 82 } }
  }
}
```

**Scoring Methodology:**
- Base score: 50 (neutral)
- Each signal adds/subtracts based on `signal_weights` table
- Diminishing returns (3rd similar signal worth less)
- Confidence adjusted by evidence density
- Missing information lowers confidence, not score

---

### Agent 3: Programme Agent (Planned)

**Purpose:** Generate personalized programme recommendations based on assessment.

**Output:**
- Starting stage (Problem → User Value → Execution → Scale)
- Duration recommendation
- Weekly milestones with tasks
- Checkpoint questions
- Mentor matching recommendations
- Success metrics and conditions

---

### Agent 4: Calibration Engine (Planned)

**Purpose:** Continuously improve agent accuracy using feedback and outcomes.

**Inputs:**
- Partner feedback (agreement, score adjustments)
- Startup outcomes (3/6/12 month checkpoints)
- Signal extraction patterns

**Actions:**
- Adjust signal weights based on outcome correlation
- Refine prompts based on partner overrides
- Flag calibration drift alerts
- Generate weekly calibration reports

---

## Data Model

### Core Tables

```sql
-- Users (extends Supabase auth)
users
├── id (UUID, PK, FK → auth.users)
├── email
├── name
├── avatar_url
├── user_type ('founder' | 'partner')
├── partner_sub_type ('mentor' | 'vc' | 'startup_manager')
├── startup_id (FK → startups, for founders)
├── onboarding_complete
└── timestamps

-- Applications (rich with metadata)
applications
├── id (UUID, PK)
├── user_id (FK → users)
├── status ('draft' | 'submitted' | 'interviewing' | 'under_review' | 'accepted' | 'rejected')
│
├── -- Core Data
├── company_name, company_one_liner, company_website
├── problem_description, target_customer, solution_description
├── stage, user_count, mrr
├── biggest_challenge, why_sanctuary, what_they_want
├── founders (JSONB array)
│
├── -- Interview Data
├── interview_started_at, interview_completed_at
├── interview_transcript (JSONB)
├── interview_metadata (JSONB) ← Behavioral signals, response patterns
│
├── -- Assessment Data
├── ai_assessment (JSONB)
├── ai_score (DECIMAL)
├── assessment_metadata (JSONB) ← Confidence, evidence density
│
├── -- Review Data
├── reviewed_by, reviewed_at, review_decision
├── review_metadata (JSONB) ← Partner feedback, adjustments
│
├── -- Tracking
├── application_metadata (JSONB) ← Form behavior, content analysis
└── timestamps

-- Interview Signals (for analysis)
interview_signals
├── id (UUID, PK)
├── application_id (FK)
├── signal_type, dimension
├── content, source_quote
├── impact_score (-5 to +5)
├── signal_metadata (JSONB) ← Confidence, corroboration
└── created_at

-- Assessment Feedback (for calibration)
assessment_feedback
├── id (UUID, PK)
├── application_id (FK)
├── partner_id (FK)
├── agrees_with_* (booleans)
├── adjusted_*_score (integers)
├── what_ai_missed, what_ai_overweighted
├── feedback_metadata (JSONB)
└── created_at

-- Startup Outcomes (for validation)
startup_outcomes
├── id (UUID, PK)
├── startup_id (FK)
├── application_id (FK)
├── three_month_*, six_month_*, twelve_month_* (checkpoints)
├── outcome ('graduated_success' | 'failed' | 'acquired' | ...)
├── outcome_metadata (JSONB) ← Risk materialization, learnings
└── timestamps

-- Signal Weights (for calibration)
signal_weights
├── id (UUID, PK)
├── signal_type, dimension
├── base_weight, computed_weight, active_weight
├── correlation_with_success
├── version, effective_from, effective_to
├── weight_metadata (JSONB)
└── timestamps

-- Agent Runs (audit trail)
agent_runs
├── id (UUID, PK)
├── agent_type ('interview' | 'assessment' | 'programme' | ...)
├── application_id, startup_id
├── status, started_at, completed_at
├── input_summary, output_summary
├── run_metadata (JSONB) ← Token usage, latency, errors
└── created_at
```

---

## Metadata Structures

### Application Metadata
```typescript
{
  source: {
    referral_code, utm_source, utm_campaign, landing_page
  },
  form_behavior: {
    started_at, completed_at, total_time_seconds,
    time_per_step: { company: 120, founders: 340, ... },
    steps_revisited: ["problem"],
    fields_edited_after_initial: ["mrr"],
    device_type, browser
  },
  content_analysis: {
    total_word_count: 1240,
    specificity_score: 0.78,
    buzzword_density: 0.12,
    metrics_mentioned: ["$2400 MRR", "12 users"],
    named_entities: ["GitLab", "Stripe"]
  },
  red_flags_detected: [
    { type: "inconsistency", description: "MRR doesn't match...", severity: "low" }
  ],
  green_flags_detected: [
    { type: "repeat_founder", description: "Team includes...", confidence: 0.9 }
  ]
}
```

### Interview Metadata
```typescript
{
  session: {
    duration_minutes: 52,
    total_messages: 47,
    pauses_taken: 2,
    total_pause_time_seconds: 340
  },
  sections: {
    founder_dna: {
      messages: 10,
      avg_response_time_seconds: 45,
      avg_response_length: 89,
      topic_coverage: ["background", "motivation"],
      topics_missed: ["failure_experience"]
    },
    // ... other sections
  },
  behavioral_signals: {
    response_time_pattern: "consistent",
    longest_response_time: { seconds: 180, question: "..." },
    questions_asked_to_clarify: 2,
    emotional_markers: ["enthusiasm:high"]
  },
  content_quality: {
    specific_examples_given: 12,
    vague_answers_count: 3,
    data_points_shared: 8,
    customer_quotes_shared: 4
  }
}
```

### Assessment Metadata
```typescript
{
  model_used: "claude-sonnet-4-20250514",
  prompt_version: "v2.3",
  scoring_rubric_version: "v1.0",

  confidence: {
    overall: 0.82,
    founder: 0.88,
    problem: 0.75,
    user_value: 0.79,
    execution: 0.85
  },

  evidence_density: {
    founder: { positive_signals: 5, negative_signals: 1, quotes: 3 }
  },

  gaps_identified: [
    { dimension: "user_value", missing_info: "retention_rate", impact: -0.15 }
  ],

  scoring_breakdown: {
    founder: {
      base_score: 50,
      signals_applied: [
        { signal: "prior_exit", impact: +15 },
        { signal: "domain_expertise", impact: +8 }
      ],
      final_score: 82
    }
  }
}
```

---

## Scoring System

### Dimension Weights
| Dimension | Weight | Rationale |
|-----------|--------|-----------|
| Founder | 30% | Most predictive of success per research |
| Problem | 25% | 42% of startups fail due to no market need |
| User Value | 25% | Evidence of product-market fit |
| Execution | 20% | Shipping speed and decision quality |

### Signal Examples

**Founder Signals:**
| Signal | Impact | Example |
|--------|--------|---------|
| Prior exit | +15 | "We sold to GitLab" |
| Domain expertise (years) | +2/yr | "8 years in DevOps" |
| Relevant company | +5 | "I was at Stripe" |
| Adversity overcome | +5 | "We ran out of money and..." |
| Blames external | -10 | "The market wasn't ready" |
| Gives up easily | -15 | Pattern of abandonment |

**Problem Signals:**
| Signal | Impact | Example |
|--------|--------|---------|
| Customer calls (qty) | +1/call | "47 interviews" |
| Specific pain quote | +5 each | "CTO said 'I'd pay $10k'" |
| Quantified pain | +10 | "20% of sprints lost" |
| Personal experience | +5 | "I dealt with this for 3 years" |
| No validation | -15 | "Haven't talked to customers" |

### Recommendation Thresholds
| Score Range | Recommendation | Action |
|-------------|----------------|--------|
| 85+ | Strong Accept | Fast-track |
| 75-84 | Accept | Standard process |
| 65-74 | Conditional | Requires discussion |
| 55-64 | Lean Decline | Usually reject |
| <55 | Decline | Auto-reject consideration |

---

## Self-Improvement Flywheel

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CONTINUOUS IMPROVEMENT LOOP                          │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │  Application │
    │  Submitted   │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │  Interview   │────► Signals extracted with confidence
    │  Completed   │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │  Assessment  │────► Scores generated with evidence
    │  Generated   │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │  Partner     │────► Agreement/Override recorded
    │  Review      │      └── assessment_feedback table
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │  Decision    │────► Outcome baseline set
    │  Made        │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │  3/6/12 Mo   │────► Actual outcomes recorded
    │  Checkpoints │      └── startup_outcomes table
    └──────┬───────┘
           │
           ▼
    ┌──────────────────────────────────────────────────────┐
    │                 CALIBRATION ENGINE                    │
    ├──────────────────────────────────────────────────────┤
    │                                                       │
    │  1. Compare predictions to outcomes                   │
    │     └── Which signals correlated with success?        │
    │                                                       │
    │  2. Analyze partner overrides                         │
    │     └── Where does AI systematically miss?            │
    │                                                       │
    │  3. Adjust signal weights                             │
    │     └── Update signal_weights table                   │
    │                                                       │
    │  4. Refine prompts                                    │
    │     └── Better question sequencing                    │
    │                                                       │
    │  5. Flag calibration drift                            │
    │     └── Alert if AI/human agreement drops             │
    │                                                       │
    └───────────────────────┬──────────────────────────────┘
                            │
                            ▼
                  ┌───────────────────┐
                  │  Improved Agents  │
                  └─────────┬─────────┘
                            │
                            └────────────► Back to top
```

### Calibration Metrics

**Weekly Dashboard:**
- AI/Partner agreement rate (target: >80%)
- Score drift per dimension
- Signal effectiveness rankings
- Confidence calibration (are 85% confident predictions right 85% of the time?)

**Quarterly Review:**
- Outcome correlation analysis
- Weight adjustment recommendations
- Prompt refinement suggestions
- New signal discovery

---

## Technical Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** Zustand with persistence
- **Forms:** React Hook Form + Zod

### Backend
- **API:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (Email, Google, GitHub)
- **AI:** Anthropic Claude API

### Infrastructure
- **Monorepo:** Turborepo
- **Hosting:** Vercel
- **Database:** Supabase Cloud
- **Monitoring:** Vercel Analytics

---

## Current Implementation Status

### ✅ Completed

| Feature | Status | Notes |
|---------|--------|-------|
| Auth System | ✅ | Email/password, role selection |
| Founder Dashboard | ✅ | All pages with mock data |
| Partner Dashboard | ✅ | All pages with mock data |
| Application Form | ✅ | 6-step form, saves to Supabase |
| Interview Agent | ✅ | Claude API integration |
| Interview → DB | ✅ | Transcript + signals saved |
| Partner Review UI | ✅ | 4-tab detail view |
| Enriched Schema | ✅ | All metadata tables |
| Metadata Collection | ✅ | Application + Interview metadata |

### 🔄 In Progress

| Feature | Status | Notes |
|---------|--------|-------|
| Assessment Agent | 🔄 | Next priority |
| Partner Feedback UI | 🔄 | Feedback collection |

### 📋 Planned

| Feature | Priority | Notes |
|---------|----------|-------|
| Programme Agent | P1 | Milestone generation |
| Calibration Engine | P1 | Weight adjustment |
| Outcome Tracking UI | P1 | Checkpoint recording |
| Real-time Updates | P2 | Supabase subscriptions |
| Analytics Dashboard | P2 | Calibration metrics |
| Matching Agent | P2 | Mentor-startup matching |

---

## Success Metrics

### Platform Metrics
- **Application-to-interview rate:** >90%
- **Interview completion rate:** >85%
- **Time to decision:** <48 hours
- **Partner review time:** <15 min per application

### AI Quality Metrics
- **AI/Partner agreement:** >80%
- **Score prediction accuracy:** Within 10 points of partner adjustment
- **Confidence calibration:** 85% confident = 85% accurate

### Outcome Metrics
- **Accepted startup survival (12mo):** >70%
- **Graduated startup success rate:** >40%
- **Signal-to-outcome correlation:** Statistically significant

---

## Appendix: API Reference

### Application Endpoints

```
POST   /api/applications                 Create application
GET    /api/applications                 List user's applications
POST   /api/applications/[id]/interview  Start/complete interview
GET    /api/applications/[id]/interview  Get interview data
```

### Interview Endpoints

```
POST   /api/interview/chat               Send message, get AI response
```

### Upcoming Endpoints

```
POST   /api/applications/[id]/assess     Trigger assessment
GET    /api/applications/[id]/assessment Get assessment
POST   /api/applications/[id]/feedback   Submit partner feedback
POST   /api/applications/[id]/decision   Record accept/reject
GET    /api/calibration/metrics          Get calibration dashboard
```

---

*This document is the source of truth for Sanctuary OS product requirements. Update version number and date when making changes.*
