# Sanctuary Agent Mesh — Gap Analysis

## Your Vision vs. Current Plan

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         COVERAGE MATRIX                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  AGENT              │ YOUR MESH  │ CURRENT PLAN │ GAP                   │
│  ───────────────────┼────────────┼──────────────┼─────────────────────  │
│                     │            │              │                       │
│  Interview Agent    │     ✅     │      ✅      │ ✅ Aligned            │
│  (Deep conv)        │            │ (V2 upgrade) │ (Building now)        │
│                     │            │              │                       │
│  Research Agent     │     ✅     │      ❌      │ 🔴 NOT COVERED        │
│  (Market context)   │            │              │ (New agent needed)    │
│                     │            │              │                       │
│  Pattern Agent      │     ✅     │      ❌      │ 🔴 NOT COVERED        │
│  (Profile matching) │            │              │ (New agent + data)    │
│                     │            │              │                       │
│  Diligence Agent    │     ✅     │      ❌      │ 🔴 NOT COVERED        │
│  (Verify claims)    │            │              │ (New agent needed)    │
│                     │            │              │                       │
│  Mentor Matching    │     ✅     │      ⏳      │ 🟡 PLANNED            │
│  Agent              │            │ (High-level) │ (Needs detail)        │
│                     │            │              │                       │
│  Human Interface    │     ✅     │      ⏳      │ 🟡 PARTIAL            │
│  (Rich brief)       │            │ (DNA Report) │ (Needs enhancement)   │
│                     │            │              │                       │
│  Shared Knowledge   │     ✅     │      ❌      │ 🔴 NOT COVERED        │
│  Graph              │            │              │ (Architecture needed) │
│                     │            │              │                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## The Full Agent Mesh Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           SANCTUARY AGENT MESH                                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ╔════════════════════════════════════════════════════════════════════════════════╗ │
│  ║                           LAYER 1: DATA COLLECTION                             ║ │
│  ╚════════════════════════════════════════════════════════════════════════════════╝ │
│                                                                                      │
│     ┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐  │
│     │  📝 INTERVIEW    │         │  🔍 RESEARCH     │         │  ✓ DILIGENCE     │  │
│     │     AGENT        │         │     AGENT        │         │     AGENT        │  │
│     ├──────────────────┤         ├──────────────────┤         ├──────────────────┤  │
│     │                  │         │                  │         │                  │  │
│     │ INPUT:           │         │ INPUT:           │         │ INPUT:           │  │
│     │ • Founder convo  │         │ • Company name   │         │ • Claims made    │  │
│     │ • Application    │         │ • Industry       │         │ • References     │  │
│     │                  │         │ • Competitors    │         │ • Metrics cited  │  │
│     │                  │         │                  │         │                  │  │
│     │ DOES:            │         │ DOES:            │         │ DOES:            │  │
│     │ • YC+ interview  │         │ • Market sizing  │         │ • Verify metrics │  │
│     │ • Extract prims  │         │ • Competitor scan│         │ • Check refs     │  │
│     │ • Chemistry test │         │ • Trend analysis │         │ • LinkedIn scrape│  │
│     │ • Quote capture  │         │ • News/funding   │         │ • Crunchbase     │  │
│     │                  │         │                  │         │                  │  │
│     │ OUTPUT:          │         │ OUTPUT:          │         │ OUTPUT:          │  │
│     │ • Primitives     │         │ • Market report  │         │ • Verification   │  │
│     │ • Signals        │         │ • Competitor map │         │   status         │  │
│     │ • Transcript     │         │ • Timing score   │         │ • Red flags      │  │
│     │                  │         │                  │         │                  │  │
│     └────────┬─────────┘         └────────┬─────────┘         └────────┬─────────┘  │
│              │                            │                            │            │
│              └────────────────────────────┼────────────────────────────┘            │
│                                           │                                         │
│                                           ▼                                         │
│  ╔════════════════════════════════════════════════════════════════════════════════╗ │
│  ║                      LAYER 2: SHARED KNOWLEDGE GRAPH                           ║ │
│  ╚════════════════════════════════════════════════════════════════════════════════╝ │
│                                                                                      │
│     ┌───────────────────────────────────────────────────────────────────────────┐   │
│     │                         STARTUP KNOWLEDGE ENTITY                          │   │
│     ├───────────────────────────────────────────────────────────────────────────┤   │
│     │                                                                           │   │
│     │  FOUNDER DATA           MARKET DATA            VALIDATION DATA            │   │
│     │  ─────────────          ───────────            ───────────────            │   │
│     │  • Primitives           • TAM/SAM/SOM          • Claims verified ✓/✗      │   │
│     │  • Conviction signals   • Competitor map       • References checked       │   │
│     │  • Chemistry score      • Timing indicators    • Metrics confirmed        │   │
│     │  • Quotes (verbatim)    • Funding landscape    • Discrepancies            │   │
│     │  • Red/green flags      • Trend data           • Trust score              │   │
│     │                                                                           │   │
│     │  PATTERN DATA           NETWORK DATA           HISTORICAL DATA            │   │
│     │  ────────────           ────────────           ───────────────            │   │
│     │  • Similar founders     • Mentor matches       • Past applications        │   │
│     │  • Similar startups     • Investor fits        • Cohort outcomes          │   │
│     │  • Success predictors   • Warm intros          • Pattern correlations     │   │
│     │  • Risk patterns        • Community ties       • What worked/failed       │   │
│     │                                                                           │   │
│     └───────────────────────────────────────────────────────────────────────────┘   │
│                                           │                                         │
│                                           ▼                                         │
│  ╔════════════════════════════════════════════════════════════════════════════════╗ │
│  ║                         LAYER 3: ANALYSIS & MATCHING                           ║ │
│  ╚════════════════════════════════════════════════════════════════════════════════╝ │
│                                                                                      │
│     ┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐  │
│     │  🧬 PATTERN      │         │  🤝 MENTOR       │         │  📊 SCORING      │  │
│     │     AGENT        │         │  MATCHING AGENT  │         │     AGENT        │  │
│     ├──────────────────┤         ├──────────────────┤         ├──────────────────┤  │
│     │                  │         │                  │         │                  │  │
│     │ DOES:            │         │ DOES:            │         │ DOES:            │  │
│     │ • Compare to     │         │ • Match blockers │         │ • Weighted score │  │
│     │   past founders  │         │   to expertise   │         │   across dims    │  │
│     │ • Find similar   │         │ • Rank mentors   │         │ • Confidence     │  │
│     │   startups       │         │ • Suggest intros │         │   intervals      │  │
│     │ • Predict risks  │         │ • Session topics │         │ • Recommendation │  │
│     │                  │         │                  │         │                  │  │
│     │ OUTPUT:          │         │ OUTPUT:          │         │ OUTPUT:          │  │
│     │ • "Similar to X" │         │ • Top 5 mentors  │         │ • Final score    │  │
│     │ • Risk patterns  │         │ • Match reasons  │         │ • Accept/Wait/No │  │
│     │ • Success odds   │         │ • Talking points │         │ • Key factors    │  │
│     │                  │         │                  │         │                  │  │
│     └────────┬─────────┘         └────────┬─────────┘         └────────┬─────────┘  │
│              │                            │                            │            │
│              └────────────────────────────┼────────────────────────────┘            │
│                                           │                                         │
│                                           ▼                                         │
│  ╔════════════════════════════════════════════════════════════════════════════════╗ │
│  ║                       LAYER 4: HUMAN PARTNER INTERFACE                         ║ │
│  ╚════════════════════════════════════════════════════════════════════════════════╝ │
│                                                                                      │
│     ┌───────────────────────────────────────────────────────────────────────────┐   │
│     │                          RICH DECISION BRIEF                              │   │
│     ├───────────────────────────────────────────────────────────────────────────┤   │
│     │                                                                           │   │
│     │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│     │  │ 1-PAGE      │  │ KEY QUOTES  │  │ PATTERN     │  │ RECOMMENDED │      │   │
│     │  │ SUMMARY     │  │ & EVIDENCE  │  │ MATCHES     │  │ MENTORS     │      │   │
│     │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│     │                                                                           │   │
│     │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│     │  │ RISK        │  │ MARKET      │  │ DILIGENCE   │  │ AI          │      │   │
│     │  │ MATRIX      │  │ CONTEXT     │  │ STATUS      │  │ RECOMMEND   │      │   │
│     │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│     │                                                                           │   │
│     │  Partner sees: Synthesized intelligence, not raw data                    │   │
│     │  Partner does: Final judgment call with full context                     │   │
│     │                                                                           │   │
│     └───────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Detailed Agent Specifications

### Agent 1: Interview Agent (V2) ✅ BUILDING NOW

```
PURPOSE: Extract startup primitives through deep conversation

INPUT:
  • Application form data
  • Founder in conversation

CAPABILITIES:
  • YC+ style questioning (10 techniques)
  • Real-time primitive extraction
  • Founder chemistry assessment
  • Quote capture (verbatim)
  • Signal flagging (red/green)

OUTPUT → Knowledge Graph:
  • 40+ primitives
  • Chemistry score
  • Conviction signals
  • Verbatim quotes
  • Risk flags
```

### Agent 2: Research Agent 🔴 NEW

```
PURPOSE: Enrich startup data with external market context

INPUT:
  • Company name, industry
  • Competitor names mentioned
  • Market claims made

CAPABILITIES:
  • Market size research (TAM/SAM/SOM)
  • Competitor analysis
    - Who are they?
    - Funding raised?
    - Positioning?
  • Trend detection
    - Is market growing?
    - Recent news?
    - Regulatory changes?
  • Timing assessment
    - Why now viable?
    - What changed?

DATA SOURCES:
  • Web search (Tavily/Perplexity API)
  • Crunchbase API
  • LinkedIn Sales Navigator
  • News APIs
  • Industry reports

OUTPUT → Knowledge Graph:
  • Market size estimate
  • Competitor map
  • Timing score
  • Market momentum indicators
  • "Why now" evidence
```

### Agent 3: Pattern Agent 🔴 NEW

```
PURPOSE: Match this startup/founder to historical patterns

INPUT:
  • Founder primitives
  • Startup characteristics
  • Historical cohort data

CAPABILITIES:
  • Founder archetype matching
    - "This founder is similar to [successful founder X]"
    - "Watch out: similar profile to [failed founder Y]"
  • Startup pattern matching
    - Similar business models
    - Similar market entries
    - Similar team compositions
  • Success/failure correlation
    - What signals predict success?
    - What red flags predict failure?
  • Cohort comparison
    - How does this compare to current cohort?
    - Portfolio gaps/overlaps?

REQUIRES:
  • Historical data on past applications
  • Outcome data (success/failure/pivot)
  • Labeled training data

OUTPUT → Knowledge Graph:
  • Similar founder profiles
  • Pattern match scores
  • Risk correlations
  • Success probability estimate
  • Portfolio fit assessment
```

### Agent 4: Diligence Agent 🔴 NEW

```
PURPOSE: Verify claims and check references

INPUT:
  • Metrics claimed in interview
  • References provided
  • Founder backgrounds

CAPABILITIES:
  • Metric verification
    - "They said $50K MRR — can we verify?"
    - Check for public evidence
  • Reference checking
    - Previous employers
    - Co-founder history
    - Investor references
  • Background verification
    - LinkedIn profile accuracy
    - Education claims
    - Previous startup outcomes
  • Red flag detection
    - Inconsistencies
    - Exaggerations
    - Missing information

DATA SOURCES:
  • LinkedIn API
  • Crunchbase
  • Public records
  • News archives
  • Social media

OUTPUT → Knowledge Graph:
  • Verification status per claim
  • Trust score
  • Discrepancies found
  • Background summary
  • Reference feedback
```

### Agent 5: Mentor Matching Agent 🟡 PLANNED

```
PURPOSE: Match startup needs to mentor expertise

INPUT:
  • Startup blockers (from interview)
  • Stage and industry
  • Founder preferences
  • Mentor database

CAPABILITIES:
  • Problem classification
    - Technical vs. Business
    - Stage-specific
    - Domain-specific
  • Expertise matching
    - Mentor skills → Startup needs
    - Industry experience match
    - Stage experience match
  • Availability checking
    - Mentor capacity
    - Schedule fit
  • Chemistry prediction
    - Communication style match
    - Personality fit

OUTPUT → Knowledge Graph:
  • Top 5 mentor recommendations
  • Match reasoning
  • Suggested session topics
  • Warm intro paths
```

### Agent 6: Scoring Agent 🟡 PARTIAL (in DNA Report)

```
PURPOSE: Generate final weighted assessment

INPUT:
  • All data from Knowledge Graph
  • Scoring rubric
  • Portfolio strategy

CAPABILITIES:
  • Multi-dimensional scoring
    - Founder (30%)
    - Problem (20%)
    - Solution (15%)
    - Market (15%)
    - Traction (10%)
    - Team (10%)
  • Confidence intervals
    - High/medium/low confidence per dimension
  • Recommendation engine
    - Accept / Waitlist / Decline
    - Reasoning
  • Comparative ranking
    - vs. current applicants
    - vs. historical cohorts

OUTPUT → Human Interface:
  • Final score with breakdown
  • Recommendation + reasoning
  • Key decision factors
  • Minority opinion (if applicable)
```

---

## Shared Knowledge Graph Schema

```typescript
interface StartupKnowledgeEntity {
  id: string
  applicationId: string
  createdAt: Date
  updatedAt: Date

  // === FROM INTERVIEW AGENT ===
  interview: {
    transcript: Message[]
    primitives: {
      problem: ProblemPrimitives
      solution: SolutionPrimitives
      market: MarketPrimitives
      founder: FounderPrimitives
      team: TeamPrimitives
      traction: TractionPrimitives
      economics: EconomicsPrimitives
    }
    quotes: VerbatimQuote[]
    signals: Signal[]
    chemistryScore: number
    convictionScore: number
  }

  // === FROM RESEARCH AGENT ===
  research: {
    marketSize: {
      tam: number
      sam: number
      som: number
      source: string
      confidence: 'high' | 'medium' | 'low'
    }
    competitors: Competitor[]
    marketTrends: Trend[]
    timingScore: number
    timingEvidence: string[]
    recentNews: NewsItem[]
  }

  // === FROM PATTERN AGENT ===
  patterns: {
    similarFounders: SimilarEntity[]
    similarStartups: SimilarEntity[]
    successPredictors: Predictor[]
    riskPatterns: RiskPattern[]
    portfolioFit: 'strong' | 'moderate' | 'weak' | 'overlap'
  }

  // === FROM DILIGENCE AGENT ===
  diligence: {
    claimsVerified: ClaimVerification[]
    backgroundChecks: BackgroundCheck[]
    references: ReferenceCheck[]
    trustScore: number
    discrepancies: Discrepancy[]
    redFlags: string[]
  }

  // === FROM MENTOR MATCHING AGENT ===
  mentorMatches: {
    recommendations: MentorMatch[]
    blockerClassification: string[]
    sessionTopics: string[]
  }

  // === FROM SCORING AGENT ===
  assessment: {
    overallScore: number
    dimensionScores: Record<string, DimensionScore>
    recommendation: 'accept' | 'waitlist' | 'decline'
    reasoning: string
    keyFactors: string[]
    confidence: 'high' | 'medium' | 'low'
  }
}
```

---

## Implementation Roadmap

### Phase 1: Interview Agent V2 (NOW)
**Status:** 🔄 Starting
**Effort:** 3-4 days

- Upgraded prompts + question bank
- Primitive extraction
- Chemistry assessment
- DNA Report output

### Phase 2: Knowledge Graph Schema
**Status:** ⏳ Next
**Effort:** 1 day

- Define TypeScript interfaces
- Database schema (Supabase)
- API for agents to write/read

### Phase 3: Research Agent
**Status:** ⏳ Planned
**Effort:** 2-3 days

- Web search integration (Tavily/Perplexity)
- Competitor analysis
- Market sizing
- News/trend detection

### Phase 4: Diligence Agent
**Status:** ⏳ Planned
**Effort:** 2-3 days

- Claim verification logic
- LinkedIn integration
- Background checking
- Trust scoring

### Phase 5: Pattern Agent
**Status:** ⏳ Planned
**Effort:** 3-4 days
**Dependency:** Historical data needed

- Similarity matching
- Success/failure correlations
- Portfolio fit analysis

### Phase 6: Mentor Matching Agent
**Status:** ⏳ Planned
**Effort:** 2 days

- Problem classification
- Expertise matching
- Recommendation engine

### Phase 7: Human Interface
**Status:** ⏳ Planned
**Effort:** 2 days

- Rich Decision Brief UI
- All agent outputs synthesized
- Partner action interface

---

## Revised Timeline

```
WEEK 1:
├── Day 1-2: Interview Agent V2 (prompts, questions)
├── Day 3: Interview Agent V2 (chemistry, signals)
├── Day 4: Knowledge Graph Schema
└── Day 5: Interview Agent V2 (DNA Report)

WEEK 2:
├── Day 1-2: Research Agent
├── Day 3-4: Diligence Agent
└── Day 5: Integration testing

WEEK 3:
├── Day 1-2: Pattern Agent (if historical data available)
├── Day 3: Mentor Matching Agent
├── Day 4-5: Human Interface (Rich Brief)
└── Polish + Testing

TOTAL: ~3 weeks for full mesh
```

---

## What We Should Build NOW

Given the scope, I recommend:

### Immediate (This Session):
1. **Interview Agent V2** — The foundation everything else builds on
2. **Knowledge Graph Schema** — So we have the data structure ready

### Next Session:
3. **Research Agent** — High value, enriches every application
4. **Scoring Agent** — Makes the DNA Report actionable

### Future Sessions:
5. **Diligence Agent** — Important but can be manual initially
6. **Pattern Agent** — Needs historical data to be useful
7. **Mentor Matching Agent** — Can enhance existing system

---

## Decision Point

**Option A:** Build full Interview Agent V2 now, then add other agents incrementally

**Option B:** Build lighter versions of multiple agents in parallel

**Recommendation:** Option A — Interview Agent V2 is the foundation. Other agents consume its output. Get this right first.

---

Proceed with Interview Agent V2 build?
