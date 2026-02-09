# Sanctuary Agent MVP — Streamlined Roadmap

**Goal:** Get to working MVP ASAP with Interview Agent + Research Agent

---

## MVP Architecture (Simplified)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MVP FLOW                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   STEP 1                 STEP 2                 STEP 3                  │
│   ───────                ───────                ───────                  │
│                                                                          │
│   ┌──────────────┐      ┌──────────────┐      ┌──────────────┐         │
│   │  STRUCTURED  │      │  INTERVIEW   │      │   RESEARCH   │         │
│   │    FORM      │ ───► │    AGENT     │ ───► │    AGENT     │         │
│   │              │      │              │      │              │         │
│   │ Founder fills│      │ Deep dive on │      │ Validate     │         │
│   │ ALL data     │      │ the "why"    │      │ claims with  │         │
│   │ upfront      │      │ and founder  │      │ real data    │         │
│   │              │      │ chemistry    │      │              │         │
│   └──────────────┘      └──────────────┘      └──────────────┘         │
│          │                     │                     │                  │
│          ▼                     ▼                     ▼                  │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │                    STARTUP PROFILE                            │     │
│   │                                                               │     │
│   │  Form Data + Interview Primitives + Research Validation      │     │
│   │                                                               │     │
│   └──────────────────────────────────────────────────────────────┘     │
│                                │                                        │
│                                ▼                                        │
│                    ┌──────────────────┐                                │
│                    │  PARTNER REVIEW  │                                │
│                    │                  │                                │
│                    │ Complete picture │                                │
│                    │ with AI insights │                                │
│                    └──────────────────┘                                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Step 1: Structured Application Form (Enhanced)

### What Founders Submit Upfront

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    SANCTUARY APPLICATION FORM V2                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ═══════════════════════════════════════════════════════════════════    │
│  SECTION 1: FOUNDER & TEAM                                              │
│  ═══════════════════════════════════════════════════════════════════    │
│                                                                          │
│  • Full Name *                                                          │
│  • Email *                                                              │
│  • LinkedIn URL *                                                       │
│  • Role (CEO, CTO, etc.) *                                              │
│  • Brief Bio (2-3 sentences) *                                          │
│  • Previous Startups (if any)                                           │
│  • Relevant Experience (why you for this problem)                       │
│                                                                          │
│  ─── CO-FOUNDER(S) ───                                                  │
│  • Co-founder Name(s)                                                   │
│  • Co-founder LinkedIn(s)                                               │
│  • How did you meet?                                                    │
│  • Equity split (%) *                                                   │
│  • Is everyone full-time? *                                             │
│                                                                          │
│  ═══════════════════════════════════════════════════════════════════    │
│  SECTION 2: COMPANY BASICS                                              │
│  ═══════════════════════════════════════════════════════════════════    │
│                                                                          │
│  • Company Name *                                                       │
│  • One-liner (10 words max) *                                           │
│  • Website URL                                                          │
│  • Founded Date *                                                       │
│  • Location (HQ) *                                                      │
│  • Stage * [Dropdown]                                                   │
│    ○ Idea                                                               │
│    ○ Building MVP                                                       │
│    ○ MVP Live (pre-revenue)                                             │
│    ○ Early Revenue (<$10K MRR)                                          │
│    ○ Growing ($10K-$50K MRR)                                            │
│    ○ Scaling ($50K+ MRR)                                                │
│                                                                          │
│  • Industry * [Dropdown]                                                │
│  • Business Model * [Dropdown]                                          │
│    ○ SaaS                                                               │
│    ○ Marketplace                                                        │
│    ○ E-commerce                                                         │
│    ○ Fintech                                                            │
│    ○ Hardware                                                           │
│    ○ Services                                                           │
│    ○ Other                                                              │
│                                                                          │
│  ═══════════════════════════════════════════════════════════════════    │
│  SECTION 3: THE PROBLEM                                                 │
│  ═══════════════════════════════════════════════════════════════════    │
│                                                                          │
│  • What problem are you solving? (2-3 sentences) *                      │
│  • Who has this problem? (specific persona) *                           │
│  • How painful is this problem? * [1-10 scale]                          │
│  • How often do they experience it? * [Daily/Weekly/Monthly/Yearly]     │
│  • How do they solve it today? (current workaround) *                   │
│  • How much do they spend on current solution? ($/month or hours/week)  │
│                                                                          │
│  ═══════════════════════════════════════════════════════════════════    │
│  SECTION 4: YOUR SOLUTION                                               │
│  ═══════════════════════════════════════════════════════════════════    │
│                                                                          │
│  • What is your solution? (2-3 sentences) *                             │
│  • Why is it 10x better than alternatives? *                            │
│  • What's your unique insight? (What do you know that others don't?) *  │
│  • Product demo link (Loom, video, or live URL)                         │
│                                                                          │
│  ═══════════════════════════════════════════════════════════════════    │
│  SECTION 5: MARKET & COMPETITION                                        │
│  ═══════════════════════════════════════════════════════════════════    │
│                                                                          │
│  • Who are your top 3 competitors? *                                    │
│    1. [Name] - [How you're different]                                   │
│    2. [Name] - [How you're different]                                   │
│    3. [Name] - [How you're different]                                   │
│                                                                          │
│  • Total Addressable Market (TAM) - Your estimate *                     │
│    $ __________ [Dropdown: Million/Billion]                             │
│                                                                          │
│  • How did you calculate TAM? (show your math) *                        │
│    [Text area - e.g., "50M SMBs globally × $100/month = $60B"]          │
│                                                                          │
│  • Serviceable Addressable Market (SAM) *                               │
│    $ __________ [Dropdown: Million/Billion]                             │
│                                                                          │
│  • Your realistic Year 1 target market (SOM) *                          │
│    $ __________ [Dropdown: Thousand/Million]                            │
│                                                                          │
│  • Why now? What changed that makes this possible today? *              │
│                                                                          │
│  ═══════════════════════════════════════════════════════════════════    │
│  SECTION 6: TRACTION & METRICS                                          │
│  ═══════════════════════════════════════════════════════════════════    │
│                                                                          │
│  • Do you have a live product? * [Yes/No]                               │
│                                                                          │
│  IF YES:                                                                │
│  • Total users/customers *                                              │
│  • Active users (last 30 days) *                                        │
│  • Paying customers *                                                   │
│  • Monthly Recurring Revenue (MRR) * $________                          │
│  • MRR 3 months ago * $________                                         │
│  • Month-over-month growth rate * ________%                             │
│  • Customer Acquisition Cost (CAC) $________                            │
│  • Lifetime Value (LTV) estimate $________                              │
│  • Churn rate (monthly) ________%                                       │
│                                                                          │
│  IF NO:                                                                 │
│  • Waitlist size                                                        │
│  • Letters of Intent (LOIs)                                             │
│  • Pilot commitments                                                    │
│                                                                          │
│  • User interviews conducted * [Number]                                 │
│  • Most surprising thing you learned from users *                       │
│                                                                          │
│  ═══════════════════════════════════════════════════════════════════    │
│  SECTION 7: FUNDING & RUNWAY                                            │
│  ═══════════════════════════════════════════════════════════════════    │
│                                                                          │
│  • Have you raised money? * [Yes/No]                                    │
│                                                                          │
│  IF YES:                                                                │
│  • Total raised to date * $________                                     │
│  • Last round type [Pre-seed/Seed/Series A]                             │
│  • Key investors                                                        │
│                                                                          │
│  • Current monthly burn rate * $________                                │
│  • Current runway (months) * ________                                   │
│  • How much are you raising now? $________                              │
│                                                                          │
│  ═══════════════════════════════════════════════════════════════════    │
│  SECTION 8: SANCTUARY FIT                                               │
│  ═══════════════════════════════════════════════════════════════════    │
│                                                                          │
│  • What do you need most from Sanctuary? * [Multi-select]               │
│    □ Mentorship                                                         │
│    □ Fundraising help                                                   │
│    □ Customer introductions                                             │
│    □ Technical guidance                                                 │
│    □ Go-to-market strategy                                              │
│    □ Hiring                                                             │
│    □ Community                                                          │
│    □ Workspace                                                          │
│                                                                          │
│  • What does success look like in 6 months? *                           │
│  • What's your biggest blocker right now? *                             │
│  • Why Sanctuary specifically? *                                        │
│                                                                          │
│  ═══════════════════════════════════════════════════════════════════    │
│  SECTION 9: ATTACHMENTS                                                 │
│  ═══════════════════════════════════════════════════════════════════    │
│                                                                          │
│  • Pitch deck (PDF) *                                                   │
│  • Product demo (video link)                                            │
│  • Financial model (optional)                                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

* = Required field
```

---

## Step 2: Interview Agent V2 (Focused)

### What Interview Agent Does (Given Form Data)

The Interview Agent already HAS all the data. Now it focuses on:

```
┌─────────────────────────────────────────────────────────────────────────┐
│               INTERVIEW AGENT V2 — FOCUSED SCOPE                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ALREADY KNOW (from form):        │  NEED TO DISCOVER (in interview):   │
│  ────────────────────────────────│──────────────────────────────────── │
│                                   │                                      │
│  ✓ Company basics                 │  ? WHY this founder for THIS problem│
│  ✓ Problem statement              │  ? Depth of user understanding      │
│  ✓ Solution description           │  ? Conviction level                 │
│  ✓ Market size claims             │  ? Decision-making quality          │
│  ✓ Competitor list                │  ? Co-founder chemistry             │
│  ✓ Traction numbers               │  ? Resilience & adaptability        │
│  ✓ Funding status                 │  ? Intellectual honesty             │
│  ✓ Team composition               │  ? Hidden risks & concerns          │
│                                   │  ? Coachability                     │
│                                   │  ? What they're NOT telling us      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Interview Sections (Streamlined for MVP)

```
SECTION 1: FOUNDER DEPTH (10 min)
─────────────────────────────────
• "You said [X experience]. How does that specifically help here?"
• "What do you know about this problem that others don't?"
• "Tell me about a time you were wrong about something important."
• "What would make you quit this startup?"

SECTION 2: PROBLEM VALIDATION (10 min)
──────────────────────────────────────
• "You said users spend [X]. Walk me through one specific user's day."
• "Give me the exact words a user used to describe this pain."
• "How would users solve this if you didn't exist?"
• "What would kill this problem? Make it go away?"

SECTION 3: SOLUTION STRESS TEST (10 min)
────────────────────────────────────────
• "Why this approach and not something simpler?"
• "What's the weakest part of your product right now?"
• "Your competitor [X] just raised $50M. What do you do?"
• "What would make you pivot?"

SECTION 4: TEAM CHEMISTRY (10 min)
──────────────────────────────────
• "Tell me about your biggest disagreement with your co-founder."
• "What does your co-founder do better than you?"
• "How did you decide on [X% / Y%] equity split?"
• "If they got a $2M offer from Google tomorrow, what happens?"

SECTION 5: INTELLECTUAL HONESTY (5 min)
───────────────────────────────────────
• "What's the thing you're most worried I'll ask about?"
• "What would a smart skeptic say about your startup?"
• "Where are you probably wrong?"

TOTAL: ~45 minutes (vs. 60 in full version)
```

### Interview Output

```typescript
interface InterviewOutput {
  // Conviction Signals
  founderConviction: {
    score: 1-10
    evidence: string[]
    concerns: string[]
  }

  // Problem Understanding
  problemDepth: {
    score: 1-10
    userQuotes: string[]
    dayInLifeClarity: 'clear' | 'vague' | 'missing'
  }

  // Team Assessment
  teamChemistry: {
    score: 1-10
    conflictStyle: string
    equityDiscussion: 'healthy' | 'concerning' | 'red_flag'
    commitmentMatch: boolean
  }

  // Intellectual Honesty
  honesty: {
    score: 1-10
    selfAwareness: 'high' | 'medium' | 'low'
    hiddenConcerns: string[]
  }

  // Key Quotes
  quotes: {
    strongest: string
    mostConcerning: string
    mostRevealing: string
  }

  // Red/Green Flags
  flags: {
    red: string[]
    yellow: string[]
    green: string[]
  }
}
```

---

## Step 3: Research Agent (Critical Analysis)

### What Research Agent Does

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    RESEARCH AGENT — SCOPE                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  INPUT:                          │  OUTPUT:                             │
│  ───────────────────────────────│─────────────────────────────────────  │
│                                  │                                       │
│  From Application Form:          │  MARKET REALITY CHECK:               │
│  • TAM claim: $50B               │  • Actual TAM: $12B (Gartner 2024)   │
│  • Competitors: A, B, C          │  • Discrepancy: 4x overestimate      │
│  • Industry: EdTech              │  • Assessment: Optimistic but not    │
│  • Why now: "AI enables..."      │    unreasonable                      │
│                                  │                                       │
│  Research Tasks:                 │  COMPETITOR ANALYSIS:                │
│  1. Verify market size           │  • Competitor A: $50M raised, 100    │
│  2. Analyze competitors          │    employees, Series B               │
│  3. Check timing claims          │  • Competitor B: Acquired for $200M  │
│  4. Find what they missed        │  • Competitor C: Shut down 2023      │
│                                  │  • Gap: None mentioned [X] which has │
│                                  │    $10M ARR                          │
│                                  │                                       │
│                                  │  TIMING ANALYSIS:                    │
│                                  │  • Claim: "AI enables this now"      │
│                                  │  • Reality: 3 similar startups       │
│                                  │    launched in 2023                  │
│                                  │  • Assessment: Timing is right but   │
│                                  │    not unique insight                │
│                                  │                                       │
│                                  │  CRITICAL QUESTIONS:                 │
│                                  │  • Why did Competitor C fail?        │
│                                  │  • How will they compete with A's    │
│                                  │    $50M war chest?                   │
│                                  │  • Market growing or consolidating?  │
│                                  │                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

### Research Agent Capabilities

```
1. MARKET SIZE VALIDATION
   ─────────────────────
   • Cross-reference TAM with:
     - Industry reports (Gartner, Forrester, IBISWorld)
     - Public company filings
     - VC market maps
   • Flag discrepancies > 2x
   • Provide corrected estimate with source

2. COMPETITOR DEEP DIVE
   ────────────────────
   • For each competitor listed:
     - Funding raised (Crunchbase)
     - Employee count (LinkedIn)
     - Recent news
     - Product positioning
   • Find competitors they MISSED
   • Identify competitive moat/weakness

3. TIMING VALIDATION
   ─────────────────
   • Check "why now" claim
   • Find similar attempts that failed
   • Identify market momentum signals
   • Regulatory/technology shifts

4. FOUNDER BACKGROUND
   ─────────────────
   • Verify LinkedIn claims
   • Previous startup outcomes
   • Public reputation
   • Network connections

5. NEWS & SIGNALS
   ─────────────
   • Recent industry news
   • Funding trends in space
   • Acquisition activity
   • Regulatory changes
```

### Research Output

```typescript
interface ResearchOutput {
  // Market Validation
  marketAnalysis: {
    claimedTAM: number
    validatedTAM: number
    tamSource: string
    discrepancyRatio: number
    assessment: 'accurate' | 'optimistic' | 'unrealistic'
    marketMomentum: 'growing' | 'stable' | 'declining'
  }

  // Competitor Analysis
  competitors: {
    listed: CompetitorProfile[]    // From form
    missed: CompetitorProfile[]    // We found
    deadCompetitors: string[]      // Failed attempts
    biggestThreat: string
    competitiveGap: string         // Their potential edge
  }

  // Timing Analysis
  timing: {
    claimedCatalyst: string
    validationStatus: 'confirmed' | 'partial' | 'unverified'
    similarAttempts: string[]
    timingScore: 1-10
    assessment: string
  }

  // Background Check
  founderBackground: {
    linkedInVerified: boolean
    previousStartups: StartupOutcome[]
    redFlags: string[]
    greenFlags: string[]
  }

  // Critical Questions
  criticalQuestions: string[]      // For partner to ask

  // Overall Assessment
  marketRealityScore: 1-10
  keyRisks: string[]
  keyOpportunities: string[]
}
```

---

## MVP Build Plan (Compressed)

### Day 1: Enhanced Application Form
```
□ Create new application form schema
□ Build form UI with all sections
□ Validation + required fields
□ File upload (pitch deck)
□ Save to database
```

### Day 2: Interview Agent V2
```
□ New system prompt (focused version)
□ Context injection from form data
□ 5-section interview flow
□ Signal extraction
□ Output structure
```

### Day 3: Research Agent
```
□ Web search integration (Tavily API)
□ Market size research function
□ Competitor analysis function
□ Timing validation function
□ Output structure
```

### Day 4: Integration + Partner View
```
□ Connect form → Interview → Research
□ Build Partner Review page
□ Display all outputs together
□ Accept/Waitlist/Decline actions
```

### Day 5: Testing + Polish
```
□ End-to-end testing
□ Edge cases
□ UI polish
□ Deploy
```

---

## Data Flow Summary

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MVP DATA FLOW                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  FOUNDER                                                                │
│     │                                                                   │
│     ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    APPLICATION FORM                               │  │
│  │  Founder, Team, Problem, Solution, Market, Traction, Funding     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│     │                                                                   │
│     ├─────────────────────────────────┐                                │
│     │                                 │                                │
│     ▼                                 ▼                                │
│  ┌────────────────────┐    ┌────────────────────┐                     │
│  │  INTERVIEW AGENT   │    │  RESEARCH AGENT    │                     │
│  │                    │    │                    │                     │
│  │  • Founder depth   │    │  • Market validate │                     │
│  │  • Problem probe   │    │  • Competitor scan │                     │
│  │  • Team chemistry  │    │  • Timing check    │                     │
│  │  • Honesty test    │    │  • Background      │                     │
│  │                    │    │                    │                     │
│  │  OUTPUT:           │    │  OUTPUT:           │                     │
│  │  Conviction score  │    │  Reality score     │                     │
│  │  Quotes & flags    │    │  Risks & gaps      │                     │
│  └─────────┬──────────┘    └─────────┬──────────┘                     │
│            │                         │                                 │
│            └────────────┬────────────┘                                 │
│                         │                                              │
│                         ▼                                              │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    STARTUP PROFILE                                │  │
│  │                                                                   │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │  │
│  │  │ Form Data   │  │ Interview   │  │ Research    │              │  │
│  │  │ (claimed)   │  │ (validated) │  │ (external)  │              │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘              │  │
│  │                                                                   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                         │                                              │
│                         ▼                                              │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    PARTNER REVIEW                                 │  │
│  │                                                                   │  │
│  │  Complete picture: What they said + What we found + AI analysis  │  │
│  │                                                                   │  │
│  │  [ACCEPT]     [WAITLIST]     [DECLINE]                           │  │
│  │                                                                   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## What We're NOT Building in MVP

To ship fast, we're deferring:

| Feature | Why Defer |
|---------|-----------|
| Pattern Agent | Needs historical data |
| Diligence Agent | Can verify manually initially |
| Mentor Matching | Existing system works |
| Knowledge Graph | Simple DB schema is enough |
| Real-time scoring | Partner can judge |

---

## Success Criteria for MVP

```
✓ Founder can submit comprehensive application
✓ Interview Agent conducts focused 45-min interview
✓ Research Agent validates market claims
✓ Partner sees unified view of all data
✓ Partner can make decision with full context
```

---

## Ready to Build?

**Order:**
1. Application Form (captures everything)
2. Interview Agent V2 (focused version)
3. Research Agent (market validation)
4. Partner Review UI

**Estimated time:** 5 days focused work

Start with which component?
