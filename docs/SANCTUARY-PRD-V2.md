# Sanctuary Ecosystem — Product Requirements Document V2

**Version:** 2.0
**Date:** 2026-02-04
**Status:** MVP Development

---

## Executive Summary

Sanctuary is an AI-powered startup accelerator platform with three core products:

1. **Sanctuary Dashboard** — Startup management for founders and partners
2. **Community Hub** — "The Sanctuary Times" for daily community life
3. **Agent Mesh** — AI agents for interview, research, and analysis

This PRD focuses on the **MVP release** with emphasis on the Agent Mesh.

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [User Types](#2-user-types)
3. [MVP Scope](#3-mvp-scope)
4. [Agent Mesh Architecture](#4-agent-mesh-architecture)
5. [Application Flow](#5-application-flow)
6. [Interview Agent V2](#6-interview-agent-v2)
7. [Research Agent](#7-research-agent)
8. [Data Models](#8-data-models)
9. [Partner Review Interface](#9-partner-review-interface)
10. [Technical Architecture](#10-technical-architecture)
11. [Build Timeline](#11-build-timeline)
12. [Success Metrics](#12-success-metrics)
13. [Future Roadmap](#13-future-roadmap)

---

## 1. Product Vision

### The Problem

Traditional accelerator application processes are:
- **Manual** — Partners spend hours reading applications
- **Inconsistent** — Different reviewers focus on different things
- **Surface-level** — Hard to assess founder quality from forms
- **Unvalidated** — Claims aren't verified against reality

### The Solution

An AI-powered application system that:
- **Structures** data collection comprehensively
- **Interviews** founders with YC+ rigor
- **Researches** market claims with external validation
- **Synthesizes** everything for partner decision-making

### Vision Statement

> "Every startup application gets the depth of analysis a $100M fund would do, delivered in minutes instead of weeks."

---

## 2. User Types

### Primary Users

| User | Role | Access |
|------|------|--------|
| **Founder** | Applies to Sanctuary, manages startup | Application, Interview, Dashboard |
| **Partner (VC)** | Reviews applications, investment decisions | Full portfolio, all analytics |
| **Partner (Startup Manager)** | Manages cohort, day-to-day | Full access, admin functions |
| **Partner (Mentor)** | Advises startups | Matched startups only |
| **Resident** | Community member | Community Hub only |

### User Journey

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        FOUNDER JOURNEY                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  APPLY              INTERVIEW           REVIEW            ONBOARD       │
│    │                    │                  │                  │         │
│    ▼                    ▼                  ▼                  ▼         │
│  ┌────────┐        ┌────────┐        ┌────────┐        ┌────────┐      │
│  │Complete│   ───► │45-min  │   ───► │Partner │   ───► │Founder │      │
│  │Form    │        │AI Chat │        │Reviews │        │Dashboard│     │
│  │        │        │        │        │        │        │        │      │
│  │All data│        │Deep    │        │Complete│        │Full    │      │
│  │upfront │        │dive    │        │picture │        │access  │      │
│  └────────┘        └────────┘        └────────┘        └────────┘      │
│                                           │                             │
│                         ┌─────────────────┼─────────────────┐          │
│                         ▼                 ▼                 ▼          │
│                    [ACCEPT]          [WAITLIST]        [DECLINE]       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. MVP Scope

### In Scope (MVP)

| Component | Description | Priority |
|-----------|-------------|----------|
| **Application Form V2** | Comprehensive structured data collection | P0 |
| **Interview Agent V2** | YC+ style AI interviewer | P0 |
| **Research Agent** | Market validation and competitor analysis | P0 |
| **Partner Review UI** | Unified view for decision-making | P0 |
| **Startup Profile** | Combined view of all data | P0 |

### Out of Scope (Post-MVP)

| Component | Reason |
|-----------|--------|
| Pattern Agent | Requires historical data |
| Diligence Agent | Can be manual initially |
| Mentor Matching Agent | Existing system sufficient |
| Voice Interview | Complexity, cost |
| Mobile App | Web-first |

---

## 4. Agent Mesh Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      SANCTUARY AGENT MESH (MVP)                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    DATA COLLECTION LAYER                         │   │
│   │                                                                  │   │
│   │   ┌──────────────────┐           ┌──────────────────┐           │   │
│   │   │   APPLICATION    │           │    INTERVIEW     │           │   │
│   │   │      FORM        │    ───►   │      AGENT       │           │   │
│   │   │                  │           │                  │           │   │
│   │   │  • Founder info  │           │  • Deep dive     │           │   │
│   │   │  • Problem/Soln  │           │  • Chemistry     │           │   │
│   │   │  • Market claims │           │  • Conviction    │           │   │
│   │   │  • Traction data │           │  • Quotes        │           │   │
│   │   │  • Funding info  │           │  • Flags         │           │   │
│   │   └────────┬─────────┘           └────────┬─────────┘           │   │
│   │            │                              │                      │   │
│   │            └──────────────┬───────────────┘                      │   │
│   │                           │                                      │   │
│   └───────────────────────────┼──────────────────────────────────────┘   │
│                               │                                          │
│   ┌───────────────────────────┼──────────────────────────────────────┐   │
│   │                    ANALYSIS LAYER                                │   │
│   │                           │                                      │   │
│   │                           ▼                                      │   │
│   │              ┌──────────────────┐                               │   │
│   │              │    RESEARCH      │                               │   │
│   │              │      AGENT       │                               │   │
│   │              │                  │                               │   │
│   │              │  • Market size   │                               │   │
│   │              │  • Competitors   │                               │   │
│   │              │  • Timing        │                               │   │
│   │              │  • Background    │                               │   │
│   │              └────────┬─────────┘                               │   │
│   │                       │                                          │   │
│   └───────────────────────┼──────────────────────────────────────────┘   │
│                           │                                              │
│   ┌───────────────────────┼──────────────────────────────────────────┐   │
│   │                    OUTPUT LAYER                                  │   │
│   │                       │                                          │   │
│   │                       ▼                                          │   │
│   │   ┌─────────────────────────────────────────────────────────┐   │   │
│   │   │                 STARTUP PROFILE                          │   │   │
│   │   │                                                          │   │   │
│   │   │   Form Data    Interview Output    Research Output       │   │   │
│   │   │   (claimed)      (validated)         (external)          │   │   │
│   │   │                                                          │   │   │
│   │   └─────────────────────────┬───────────────────────────────┘   │   │
│   │                             │                                    │   │
│   │                             ▼                                    │   │
│   │   ┌─────────────────────────────────────────────────────────┐   │   │
│   │   │                 PARTNER REVIEW                           │   │   │
│   │   │                                                          │   │   │
│   │   │   [Summary] [Evidence] [Risks] [Recommendation]          │   │   │
│   │   │                                                          │   │   │
│   │   │   [ACCEPT]      [WAITLIST]      [DECLINE]                │   │   │
│   │   │                                                          │   │   │
│   │   └─────────────────────────────────────────────────────────┘   │   │
│   │                                                                  │   │
│   └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Application Flow

### 5.1 Application Form V2

#### Form Structure

```
SECTION 1: FOUNDER & TEAM
─────────────────────────
• Full Name *
• Email *
• LinkedIn URL *
• Role (CEO/CTO/etc.) *
• Brief Bio (2-3 sentences) *
• Previous Startups
• Relevant Experience

Co-Founder(s):
• Name(s)
• LinkedIn(s)
• How did you meet?
• Equity split (%) *
• Is everyone full-time? *

SECTION 2: COMPANY BASICS
─────────────────────────
• Company Name *
• One-liner (10 words max) *
• Website URL
• Founded Date *
• Location *
• Stage * [Dropdown: Idea → Scaling]
• Industry *
• Business Model *

SECTION 3: THE PROBLEM
──────────────────────
• What problem are you solving? *
• Who has this problem? *
• Pain intensity * [1-10 scale]
• Pain frequency * [Daily/Weekly/Monthly/Yearly]
• Current workaround *
• Current spend on workaround ($/month or hours/week)

SECTION 4: YOUR SOLUTION
────────────────────────
• What is your solution? *
• Why is it 10x better? *
• What's your unique insight? *
• Product demo link

SECTION 5: MARKET & COMPETITION
───────────────────────────────
• Top 3 competitors + how you're different *
• TAM (your estimate) *
• TAM calculation (show math) *
• SAM *
• SOM (Year 1 target) *
• Why now? *

SECTION 6: TRACTION & METRICS
─────────────────────────────
• Live product? [Yes/No]

If Yes:
• Total users *
• Active users (30 days) *
• Paying customers *
• MRR *
• MRR 3 months ago *
• MoM growth rate *
• CAC
• LTV
• Churn rate

If No:
• Waitlist size
• LOIs
• Pilot commitments

• User interviews conducted *
• Most surprising user insight *

SECTION 7: FUNDING & RUNWAY
───────────────────────────
• Raised money? [Yes/No]

If Yes:
• Total raised *
• Last round type
• Key investors

• Monthly burn rate *
• Runway (months) *
• Raising now? How much?

SECTION 8: SANCTUARY FIT
────────────────────────
• What do you need? * [Multi-select]
• Success in 6 months? *
• Biggest blocker? *
• Why Sanctuary? *

SECTION 9: ATTACHMENTS
──────────────────────
• Pitch deck (PDF) *
• Product demo (video link)
• Financial model
```

#### Form Data Model

```typescript
interface ApplicationFormData {
  // Section 1: Founder & Team
  founder: {
    fullName: string
    email: string
    linkedIn: string
    role: string
    bio: string
    previousStartups?: string
    relevantExperience?: string
  }
  coFounders: {
    name: string
    linkedIn: string
    howMet: string
  }[]
  equitySplit: string
  allFullTime: boolean

  // Section 2: Company
  company: {
    name: string
    oneLiner: string
    website?: string
    foundedDate: string
    location: string
    stage: 'idea' | 'building_mvp' | 'mvp_live' | 'early_revenue' | 'growing' | 'scaling'
    industry: string
    businessModel: string
  }

  // Section 3: Problem
  problem: {
    statement: string
    targetPersona: string
    painIntensity: number // 1-10
    painFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
    currentWorkaround: string
    currentSpend?: string
  }

  // Section 4: Solution
  solution: {
    statement: string
    tenXBetter: string
    uniqueInsight: string
    demoLink?: string
  }

  // Section 5: Market
  market: {
    competitors: {
      name: string
      differentiation: string
    }[]
    tam: number
    tamUnit: 'million' | 'billion'
    tamCalculation: string
    sam: number
    samUnit: 'million' | 'billion'
    som: number
    somUnit: 'thousand' | 'million'
    whyNow: string
  }

  // Section 6: Traction
  traction: {
    hasProduct: boolean
    // If has product
    totalUsers?: number
    activeUsers?: number
    payingCustomers?: number
    mrr?: number
    mrrThreeMonthsAgo?: number
    momGrowth?: number
    cac?: number
    ltv?: number
    churnRate?: number
    // If no product
    waitlistSize?: number
    lois?: number
    pilotCommitments?: number
    // Both
    userInterviews: number
    surprisingInsight: string
  }

  // Section 7: Funding
  funding: {
    hasRaised: boolean
    totalRaised?: number
    lastRoundType?: string
    keyInvestors?: string
    monthlyBurn: number
    runwayMonths: number
    raisingNow?: number
  }

  // Section 8: Sanctuary Fit
  sanctuaryFit: {
    needs: string[]
    sixMonthSuccess: string
    biggestBlocker: string
    whySanctuary: string
  }

  // Section 9: Attachments
  attachments: {
    pitchDeck: string // URL
    productDemo?: string
    financialModel?: string
  }
}
```

---

## 6. Interview Agent V2

### 6.1 Purpose

The Interview Agent conducts a 45-minute AI-powered interview that:
- Validates founder conviction and depth
- Assesses team chemistry
- Extracts verbatim user quotes
- Identifies red and green flags
- Tests intellectual honesty

### 6.2 Interview Sections

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    INTERVIEW STRUCTURE                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  SECTION 1: FOUNDER DEPTH (10 min)                                      │
│  ─────────────────────────────────                                      │
│  Goal: Understand founder-market fit and conviction                     │
│                                                                          │
│  Questions:                                                             │
│  • "You mentioned [X experience]. How does that help HERE?"             │
│  • "What do you know about this problem that others don't?"             │
│  • "Tell me about a time you were wrong about something important."     │
│  • "What would make you quit this startup?"                             │
│  • "Why will YOU win, not just 'why will this idea win'?"               │
│                                                                          │
│  Signals to extract:                                                    │
│  ✓ Founder-market fit evidence                                          │
│  ✓ Unique insight articulation                                          │
│  ✓ Self-awareness level                                                 │
│  ✓ Commitment indicators                                                │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  SECTION 2: PROBLEM VALIDATION (10 min)                                 │
│  ──────────────────────────────────────                                 │
│  Goal: Verify deep user understanding                                   │
│                                                                          │
│  Questions:                                                             │
│  • "You said users spend [X]. Walk me through one specific user's day." │
│  • "Give me the EXACT words a user used to describe this pain."         │
│  • "Tell me about your most skeptical user interview."                  │
│  • "How would users solve this if you didn't exist?"                    │
│  • "What would kill this problem? Make it go away?"                     │
│                                                                          │
│  Signals to extract:                                                    │
│  ✓ Verbatim user quotes                                                 │
│  ✓ Day-in-life clarity                                                  │
│  ✓ Problem depth vs surface understanding                               │
│  ✓ User interview quality                                               │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  SECTION 3: SOLUTION STRESS TEST (10 min)                               │
│  ────────────────────────────────────────                               │
│  Goal: Pressure-test the solution and strategy                          │
│                                                                          │
│  Questions:                                                             │
│  • "Why this approach and not something simpler?"                       │
│  • "What's the weakest part of your product right now?"                 │
│  • "[Competitor X] just raised $50M. What do you do?"                   │
│  • "What would make you pivot?"                                         │
│  • "If you had to 10x your price, who would still pay?"                 │
│                                                                          │
│  Signals to extract:                                                    │
│  ✓ Strategic thinking quality                                           │
│  ✓ Competitive awareness                                                │
│  ✓ Pricing power indicators                                             │
│  ✓ Adaptability                                                         │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  SECTION 4: TEAM CHEMISTRY (10 min)                                     │
│  ──────────────────────────────────                                     │
│  Goal: Assess co-founder dynamics and team health                       │
│                                                                          │
│  Questions:                                                             │
│  • "Tell me about your biggest disagreement with your co-founder."      │
│  • "How did you decide on the equity split?"                            │
│  • "What does your co-founder do better than you?"                      │
│  • "If they got a $2M offer from Google tomorrow, what happens?"        │
│  • "When was the last time you changed your mind because of them?"      │
│                                                                          │
│  Signals to extract:                                                    │
│  ✓ Conflict resolution style                                            │
│  ✓ Equity discussion health                                             │
│  ✓ Mutual respect evidence                                              │
│  ✓ Commitment alignment                                                 │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  SECTION 5: INTELLECTUAL HONESTY (5 min)                                │
│  ───────────────────────────────────────                                │
│  Goal: Test self-awareness and honesty                                  │
│                                                                          │
│  Questions:                                                             │
│  • "What's the thing you're most worried I'll ask about?"               │
│  • "What would a smart skeptic say about your startup?"                 │
│  • "Where are you probably wrong?"                                      │
│  • "What's the most likely reason this fails?"                          │
│                                                                          │
│  Signals to extract:                                                    │
│  ✓ Self-awareness level                                                 │
│  ✓ Hidden concerns surfaced                                             │
│  ✓ Intellectual honesty                                                 │
│  ✓ Risk acknowledgment                                                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.3 System Prompt

```
You are conducting a deep-dive interview for Sanctuary, an elite startup
accelerator. Your style is direct, curious, and rigorous — similar to a
YC interview but with more depth.

## YOUR ROLE
- You already have all the application data (provided in context)
- Your job is to go DEEPER — understand the "why" behind the "what"
- You're looking for the spark that makes this founder special
- You're also looking for red flags that could derail them
- You are tough but fair, never rude or dismissive

## BEHAVIOR RULES

1. **Reference their application data:**
   "You said your TAM is $50B. Walk me through that calculation live."
   "You mentioned [competitor X]. What happens when they do [Y]?"

2. **Probe vague answers:**
   "You said 'a lot of users'. How many exactly?"
   "What do you mean by 'significant traction'? Give me numbers."

3. **Challenge concerning answers:**
   "That's a red flag for me. Tell me more."
   "I'm skeptical. Convince me."

4. **Acknowledge strong answers:**
   "That's a great answer. Let's move on."

5. **Extract specific evidence:**
   - Exact user quotes
   - Specific numbers
   - Named examples
   - Timeline details

6. **Test intellectual honesty:**
   - Do they acknowledge weaknesses?
   - Can they steelman the opposing view?
   - Do they change their mind when presented with good arguments?

## OUTPUT FORMAT

Respond with JSON:
{
  "response": "Your message to the founder",
  "shouldTransition": false,
  "signals": [
    {
      "type": "green_flag" | "red_flag" | "quote" | "data_point" | "concern",
      "content": "What you observed",
      "dimension": "founder" | "problem" | "solution" | "team" | "honesty",
      "impact": -5 to +5
    }
  ]
}
```

### 6.4 Interview Output

```typescript
interface InterviewOutput {
  // Metadata
  applicationId: string
  startedAt: string
  completedAt: string
  duration: number // minutes

  // Transcript
  transcript: {
    role: 'agent' | 'founder'
    content: string
    timestamp: string
    section: string
  }[]

  // Extracted Signals
  signals: {
    type: 'green_flag' | 'red_flag' | 'yellow_flag' | 'quote' | 'data_point'
    content: string
    dimension: 'founder' | 'problem' | 'solution' | 'team' | 'honesty'
    impact: number // -5 to +5
    context: string // surrounding conversation
  }[]

  // Section Scores
  scores: {
    founderDepth: {
      score: number // 1-10
      evidence: string[]
      concerns: string[]
    }
    problemValidation: {
      score: number
      userQuotes: string[]
      dayInLifeClarity: 'clear' | 'vague' | 'missing'
    }
    solutionStrength: {
      score: number
      tenXEvidence: string
      competitiveAwareness: 'strong' | 'moderate' | 'weak'
    }
    teamChemistry: {
      score: number
      conflictStyle: string
      equityHealth: 'healthy' | 'concerning' | 'red_flag'
      commitmentMatch: boolean
    }
    intellectualHonesty: {
      score: number
      selfAwareness: 'high' | 'medium' | 'low'
      hiddenConcerns: string[]
    }
  }

  // Key Quotes
  keyQuotes: {
    strongest: string
    mostConcerning: string
    mostRevealing: string
    userVoice: string[] // verbatim user quotes they shared
  }

  // Overall Assessment
  overallConviction: number // 1-10
  topStrengths: string[]
  topConcerns: string[]
  recommendation: 'strong_yes' | 'yes' | 'maybe' | 'no' | 'strong_no'
}
```

---

## 7. Research Agent

### 7.1 Purpose

The Research Agent validates claims from the application with external data:
- Cross-references market size claims
- Analyzes competitors (including ones they missed)
- Validates "why now" timing claims
- Checks founder backgrounds

### 7.2 Research Capabilities

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    RESEARCH AGENT CAPABILITIES                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. MARKET SIZE VALIDATION                                              │
│  ─────────────────────────                                              │
│                                                                          │
│  Input: TAM claim from application ($50B)                               │
│  Process:                                                               │
│    • Search industry reports (Gartner, Forrester, IBISWorld)            │
│    • Find comparable public companies                                   │
│    • Cross-reference VC market maps                                     │
│  Output:                                                                │
│    • Validated TAM with source                                          │
│    • Discrepancy ratio (claimed vs actual)                              │
│    • Market growth rate                                                 │
│    • Assessment: accurate / optimistic / unrealistic                    │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  2. COMPETITOR ANALYSIS                                                 │
│  ──────────────────────                                                 │
│                                                                          │
│  Input: Competitors listed in application                               │
│  Process:                                                               │
│    • Research each listed competitor                                    │
│    • Search for competitors they MISSED                                 │
│    • Find failed companies in space                                     │
│  Output per competitor:                                                 │
│    • Funding raised                                                     │
│    • Employee count                                                     │
│    • Recent news                                                        │
│    • Product positioning                                                │
│  Output overall:                                                        │
│    • Competitive landscape map                                          │
│    • Missed competitors                                                 │
│    • Dead companies (why they failed)                                   │
│    • Biggest threat assessment                                          │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  3. TIMING VALIDATION                                                   │
│  ────────────────────                                                   │
│                                                                          │
│  Input: "Why now" claim from application                                │
│  Process:                                                               │
│    • Search for similar attempts in past                                │
│    • Identify what changed (tech, regulation, behavior)                 │
│    • Find supporting evidence for timing claim                          │
│  Output:                                                                │
│    • Similar past attempts + outcomes                                   │
│    • Evidence for/against timing claim                                  │
│    • Timing score (1-10)                                                │
│    • Critical timing questions                                          │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  4. FOUNDER BACKGROUND                                                  │
│  ────────────────────                                                   │
│                                                                          │
│  Input: Founder LinkedIn URLs                                           │
│  Process:                                                               │
│    • Verify employment claims                                           │
│    • Check previous startup outcomes                                    │
│    • Find public reputation signals                                     │
│  Output:                                                                │
│    • Background verification status                                     │
│    • Previous startup outcomes                                          │
│    • Notable connections                                                │
│    • Red/green flags                                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.3 Data Sources

| Source | Used For | Integration |
|--------|----------|-------------|
| **Tavily API** | Web search, market research | API |
| **Crunchbase** | Funding data, competitors | API |
| **LinkedIn** | Background verification | Manual/API |
| **Gartner/Forrester** | Market sizing | Web search |
| **News APIs** | Recent news, trends | API |

### 7.4 Research Output

```typescript
interface ResearchOutput {
  // Metadata
  applicationId: string
  researchedAt: string

  // Market Validation
  marketAnalysis: {
    claimed: {
      tam: number
      tamCalculation: string
    }
    validated: {
      tam: number
      source: string
      confidence: 'high' | 'medium' | 'low'
    }
    discrepancyRatio: number // validated / claimed
    marketGrowth: string
    assessment: 'accurate' | 'optimistic' | 'unrealistic'
    marketMomentum: 'growing' | 'stable' | 'declining'
  }

  // Competitor Analysis
  competitors: {
    listed: {
      name: string
      funding: string
      employees: string
      recentNews: string[]
      positioning: string
      threat: 'high' | 'medium' | 'low'
    }[]
    missed: {
      name: string
      why_relevant: string
      funding: string
    }[]
    failed: {
      name: string
      why_failed: string
      lessons: string
    }[]
    landscapeAssessment: string
    biggestThreat: string
  }

  // Timing Analysis
  timing: {
    claimed: string
    validation: {
      status: 'confirmed' | 'partial' | 'unverified'
      evidence: string[]
    }
    similarAttempts: {
      company: string
      year: string
      outcome: string
    }[]
    timingScore: number // 1-10
    criticalQuestions: string[]
  }

  // Founder Background
  founderBackground: {
    founder: string
    linkedInVerified: boolean
    previousStartups: {
      name: string
      role: string
      outcome: string
    }[]
    notableConnections: string[]
    redFlags: string[]
    greenFlags: string[]
  }[]

  // Overall
  marketRealityScore: number // 1-10
  keyRisks: string[]
  keyOpportunities: string[]
  criticalQuestionsForPartner: string[]
}
```

---

## 8. Data Models

### 8.1 Core Entities

```typescript
// Application
interface Application {
  id: string
  status: 'draft' | 'submitted' | 'interviewing' | 'researching' | 'review' | 'decided'
  formData: ApplicationFormData
  interviewOutput?: InterviewOutput
  researchOutput?: ResearchOutput
  decision?: {
    status: 'accepted' | 'waitlisted' | 'declined'
    decidedBy: string
    decidedAt: string
    notes: string
  }
  createdAt: string
  updatedAt: string
}

// Startup (created after acceptance)
interface Startup {
  id: string
  applicationId: string
  name: string
  oneLiner: string
  stage: string
  industry: string
  founders: Founder[]
  metrics: Metrics
  // ... rest of startup data
}

// User
interface User {
  id: string
  email: string
  name: string
  userType: 'founder' | 'partner'
  partnerSubType?: 'vc' | 'mentor' | 'startup_manager'
  applicationId?: string // for founders
  startupId?: string // for accepted founders
}
```

### 8.2 Database Schema (Supabase)

```sql
-- Applications
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'draft',
  form_data JSONB NOT NULL,
  interview_output JSONB,
  research_output JSONB,
  decision JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interview Sessions
CREATE TABLE interview_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id),
  transcript JSONB NOT NULL,
  signals JSONB NOT NULL,
  scores JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Research Results
CREATE TABLE research_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id),
  market_analysis JSONB,
  competitor_analysis JSONB,
  timing_analysis JSONB,
  founder_background JSONB,
  researched_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 9. Partner Review Interface

### 9.1 Review Dashboard

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PARTNER REVIEW DASHBOARD                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  PENDING REVIEW (5)    IN PROGRESS (2)    DECIDED (23)          │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                  │    │
│  │  Company          Stage      Interview   Research   Score       │    │
│  │  ────────────────────────────────────────────────────────────── │    │
│  │  TechFlow AI      Seed       ✅ Done     ✅ Done    8.2        │    │
│  │  DataSync         Pre-seed   ✅ Done     🔄 Running  —         │    │
│  │  GreenMetrics     Series A   ✅ Done     ✅ Done    7.5        │    │
│  │  FinFlow          MVP        🔄 In prog  ⏳ Pending  —         │    │
│  │  CloudAI          Idea       ⏳ Pending  ⏳ Pending  —         │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Application Review Page

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    APPLICATION REVIEW: TechFlow AI                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  EXECUTIVE SUMMARY                                               │    │
│  │                                                                  │    │
│  │  One-liner: AI-powered legal document analysis for SMBs          │    │
│  │  Stage: Seed | Industry: LegalTech | MRR: $45K                  │    │
│  │                                                                  │    │
│  │  Interview Score: 8.2/10    Research Score: 7.5/10              │    │
│  │                                                                  │    │
│  │  AI Recommendation: ACCEPT (Strong founder, validated market)    │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌──────────────────┬──────────────────┬──────────────────┐            │
│  │ 📋 APPLICATION   │ 🎤 INTERVIEW     │ 🔍 RESEARCH      │            │
│  └──────────────────┴──────────────────┴──────────────────┘            │
│                                                                          │
│  ═══════════════════════════════════════════════════════════════════    │
│  INTERVIEW HIGHLIGHTS                                                   │
│  ═══════════════════════════════════════════════════════════════════    │
│                                                                          │
│  ✅ GREEN FLAGS:                                                        │
│  • Strong founder-market fit (8 years in legal industry)               │
│  • Clear user quotes: "I spend 3 hours daily on document review"       │
│  • Healthy co-founder dynamic (met at law school, friends 10 years)    │
│                                                                          │
│  🚩 RED FLAGS:                                                          │
│  • No technical co-founder                                             │
│  • TAM claim 3x higher than validated                                  │
│                                                                          │
│  💬 KEY QUOTES:                                                         │
│  "A partner at Baker McKenzie told me she'd pay $500/month tomorrow"   │
│  "Our biggest weakness is we're slow to ship — I know we need to fix"  │
│                                                                          │
│  ═══════════════════════════════════════════════════════════════════    │
│  RESEARCH FINDINGS                                                      │
│  ═══════════════════════════════════════════════════════════════════    │
│                                                                          │
│  MARKET:                                                               │
│  • Claimed TAM: $50B → Validated: $18B (Gartner 2024)                 │
│  • Market growing 12% YoY                                              │
│  • Assessment: Optimistic but reasonable                               │
│                                                                          │
│  COMPETITORS:                                                          │
│  • Listed: Kira, Luminance, Ironclad                                   │
│  • MISSED: Harvey AI ($80M raised, direct competitor)                  │
│  • Failed: LawGeex (acquired cheap, couldn't scale)                    │
│                                                                          │
│  TIMING:                                                               │
│  • Claim validated: GPT-4 did enable this in 2024                      │
│  • 5 similar startups launched since 2023                              │
│  • Window exists but competition fierce                                │
│                                                                          │
│  ═══════════════════════════════════════════════════════════════════    │
│  DECISION                                                               │
│  ═══════════════════════════════════════════════════════════════════    │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │   ACCEPT     │  │  WAITLIST    │  │   DECLINE    │                  │
│  │              │  │              │  │              │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
│                                                                          │
│  Notes: _______________________________________________                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Technical Architecture

### 10.1 System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    TECHNICAL ARCHITECTURE                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                         ┌─────────────────┐                             │
│                         │     VERCEL      │                             │
│                         │    (Hosting)    │                             │
│                         └────────┬────────┘                             │
│                                  │                                      │
│              ┌───────────────────┼───────────────────┐                 │
│              │                   │                   │                 │
│              ▼                   ▼                   ▼                 │
│     ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐       │
│     │   DASHBOARD     │ │  COMMUNITY HUB  │ │   MARKETING     │       │
│     │   Next.js       │ │   Next.js       │ │   Next.js       │       │
│     │   Port 3005     │ │   Port 3006     │ │   Port 3007     │       │
│     └────────┬────────┘ └────────┬────────┘ └─────────────────┘       │
│              │                   │                                      │
│              └─────────┬─────────┘                                      │
│                        │                                                │
│                        ▼                                                │
│              ┌─────────────────────────────┐                           │
│              │        API ROUTES           │                           │
│              │                             │                           │
│              │  /api/application/*         │                           │
│              │  /api/interview/*           │                           │
│              │  /api/research/*            │                           │
│              │  /api/auth/*                │                           │
│              └────────────┬────────────────┘                           │
│                           │                                            │
│         ┌─────────────────┼─────────────────┐                         │
│         │                 │                 │                         │
│         ▼                 ▼                 ▼                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                   │
│  │  SUPABASE   │  │ CLAUDE API  │  │ TAVILY API  │                   │
│  │             │  │             │  │             │                   │
│  │ • Auth      │  │ • Interview │  │ • Web search│                   │
│  │ • Database  │  │   Agent     │  │ • Market    │                   │
│  │ • Storage   │  │ • Analysis  │  │   research  │                   │
│  └─────────────┘  └─────────────┘  └─────────────┘                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 10.2 API Endpoints

```
# Application
POST   /api/application              # Submit application
GET    /api/application/:id          # Get application
PATCH  /api/application/:id          # Update application
GET    /api/applications             # List applications (partners)

# Interview
POST   /api/interview/start          # Start interview session
POST   /api/interview/message        # Send message in interview
POST   /api/interview/complete       # Complete interview
GET    /api/interview/:id            # Get interview results

# Research
POST   /api/research/start           # Start research
GET    /api/research/:applicationId  # Get research results

# Partner Actions
POST   /api/decision                 # Submit decision
GET    /api/dashboard/stats          # Dashboard stats
```

### 10.3 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Claude API
ANTHROPIC_API_KEY=

# Tavily API (for research)
TAVILY_API_KEY=

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

---

## 11. Build Timeline

### MVP Timeline (5 Days)

```
DAY 1: APPLICATION FORM
───────────────────────
□ Define form schema (TypeScript)
□ Build form UI (all 9 sections)
□ Add validation
□ File upload (pitch deck)
□ Save to Supabase
□ Test form submission

DAY 2: INTERVIEW AGENT V2
─────────────────────────
□ Write system prompt (focused version)
□ Create question bank (5 sections)
□ Build interview API route
□ Context injection from form
□ Signal extraction logic
□ Interview UI (chat interface)
□ Test interview flow

DAY 3: RESEARCH AGENT
─────────────────────
□ Integrate Tavily API
□ Market size validation
□ Competitor analysis
□ Timing validation
□ Build research API route
□ Test with sample applications

DAY 4: INTEGRATION + PARTNER UI
───────────────────────────────
□ Connect form → interview → research flow
□ Build partner dashboard
□ Build application review page
□ Display all outputs together
□ Decision actions (accept/waitlist/decline)
□ Test end-to-end

DAY 5: TESTING + POLISH
───────────────────────
□ End-to-end testing
□ Edge case handling
□ Error states
□ Loading states
□ UI polish
□ Deploy to Vercel
□ Test production
```

---

## 12. Success Metrics

### MVP Success Criteria

| Metric | Target |
|--------|--------|
| Application completion rate | >80% |
| Interview completion rate | >90% |
| Research accuracy (TAM) | Within 2x |
| Partner review time | <10 min per application |
| Decision confidence | Partners report higher confidence |

### Key Performance Indicators

```
FOUNDER METRICS:
• Time to complete application: <30 min
• Interview satisfaction: >4/5
• Clarity of process: >4/5

PARTNER METRICS:
• Applications reviewed per hour: 4+ (vs 1-2 before)
• Data completeness: >95%
• Decision confidence: >4/5

SYSTEM METRICS:
• Interview agent uptime: >99%
• Research agent accuracy: >80%
• End-to-end latency: <5 min total
```

---

## 13. Future Roadmap

### Post-MVP Agents

| Agent | Purpose | Timeline |
|-------|---------|----------|
| **Pattern Agent** | Match to historical successes/failures | Month 2 |
| **Diligence Agent** | Automated claim verification | Month 2 |
| **Mentor Matching Agent** | Smart mentor recommendations | Month 3 |
| **AI Companion** | Ongoing founder support | Month 4+ |

### Post-MVP Features

| Feature | Description | Timeline |
|---------|-------------|----------|
| Voice interview | Vapi/Retell integration | Month 3 |
| Real-time collaboration | Multiple partners review | Month 2 |
| Automated follow-ups | Email sequences | Month 2 |
| Portfolio analytics | Cross-cohort insights | Month 3 |
| Mobile app | iOS/Android | Month 4+ |

### Agent Mesh Evolution

```
MVP (Now)              MONTH 2                MONTH 3+
─────────              ───────                ────────

┌──────────┐          ┌──────────┐          ┌──────────┐
│Interview │          │Interview │          │Interview │
│  Agent   │          │  Agent   │          │  Agent   │
└──────────┘          └──────────┘          └──────────┘
     │                     │                     │
     ▼                     ▼                     ▼
┌──────────┐          ┌──────────┐          ┌──────────┐
│ Research │          │ Research │          │ Research │
│  Agent   │          │  Agent   │          │  Agent   │
└──────────┘          └──────────┘          └──────────┘
                           │                     │
                           ▼                     ▼
                      ┌──────────┐          ┌──────────┐
                      │ Pattern  │          │ Pattern  │
                      │  Agent   │          │  Agent   │
                      └──────────┘          └──────────┘
                           │                     │
                           ▼                     ▼
                      ┌──────────┐          ┌──────────┐
                      │Diligence │          │Diligence │
                      │  Agent   │          │  Agent   │
                      └──────────┘          └──────────┘
                                                 │
                                                 ▼
                                            ┌──────────┐
                                            │ Mentor   │
                                            │ Matching │
                                            └──────────┘
                                                 │
                                                 ▼
                                            ┌──────────┐
                                            │   AI     │
                                            │Companion │
                                            └──────────┘
```

---

## Appendix A: File Structure

```
sanctuary-dashboard/
├── apps/
│   ├── dashboard/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (auth)/
│   │   │   │   ├── (onboarding)/
│   │   │   │   │   ├── apply/
│   │   │   │   │   │   └── page.tsx       # Application form
│   │   │   │   │   └── interview/
│   │   │   │   │       └── [id]/
│   │   │   │   │           └── page.tsx   # Interview UI
│   │   │   │   ├── (founder)/
│   │   │   │   ├── (partner)/
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   ├── applications/
│   │   │   │   │   │   ├── page.tsx       # Applications list
│   │   │   │   │   │   └── [id]/
│   │   │   │   │   │       └── page.tsx   # Review page
│   │   │   │   │   └── ...
│   │   │   │   └── api/
│   │   │   │       ├── application/
│   │   │   │       ├── interview/
│   │   │   │       │   ├── start/route.ts
│   │   │   │       │   ├── message/route.ts
│   │   │   │       │   └── complete/route.ts
│   │   │   │       ├── research/
│   │   │   │       │   └── route.ts
│   │   │   │       └── decision/
│   │   │   ├── lib/
│   │   │   │   ├── ai/
│   │   │   │   │   ├── agents/
│   │   │   │   │   │   ├── interview-agent-v2.ts
│   │   │   │   │   │   └── research-agent.ts
│   │   │   │   │   └── prompts/
│   │   │   │   │       ├── interview-system-v2.ts
│   │   │   │   │       └── research-system.ts
│   │   │   │   └── ...
│   │   │   └── types/
│   │   │       ├── application.ts
│   │   │       ├── interview.ts
│   │   │       └── research.ts
│   │   └── ...
│   └── community/
│       └── ...
├── docs/
│   ├── SANCTUARY-PRD-V2.md          # This document
│   ├── MVP-ROADMAP-STREAMLINED.md
│   ├── INTERVIEW-AGENT-V2-PLAN.md
│   ├── AGENT-MESH-ANALYSIS.md
│   └── SOLUTION-ARCHITECTURE.md
└── ...
```

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **Agent Mesh** | Interconnected AI agents working together |
| **Primitive** | Atomic unit of startup data (e.g., pain intensity) |
| **Signal** | Extracted insight from interview (red/green flag) |
| **TAM** | Total Addressable Market |
| **SAM** | Serviceable Addressable Market |
| **SOM** | Serviceable Obtainable Market |
| **Knowledge Graph** | Unified data layer all agents read/write |
| **DNA Report** | Comprehensive startup assessment document |

---

**Document Owner:** Sanctuary Engineering
**Last Updated:** 2026-02-04
**Next Review:** After MVP Launch
