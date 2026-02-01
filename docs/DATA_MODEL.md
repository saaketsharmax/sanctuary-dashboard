# SANCTUARY DASHBOARD — Data Model

**Version:** MVP
**Last Updated:** 2026-02-01

---

## Overview

This document defines all data structures used in Sanctuary Dashboard. For MVP, data is stored in mock files; Phase 2+ will migrate to Supabase.

---

## Core Entities

### 1. Startup

The central entity representing a company in the accelerator.

```typescript
interface Startup {
  // Identity
  id: string
  slug: string
  name: string
  logo_url: string | null
  one_liner: string
  description: string | null

  // Classification
  cohort_id: string
  industry: string
  sub_industry: string | null
  business_model: 'B2B' | 'B2C' | 'B2B2C' | 'Marketplace' | 'Other'
  stage: 'problem_discovery' | 'solution_shaping' | 'user_value' | 'growth' | 'capital_ready'

  // Location
  city: string
  country: string
  timezone: string | null

  // Links
  website: string | null
  demo_url: string | null
  pitch_deck_url: string | null

  // Product
  problem_statement: string | null
  solution_description: string | null
  target_customer: string | null

  // Programme
  status: 'active' | 'paused' | 'graduated' | 'exited'
  residency_start: string | null  // ISO date
  residency_end: string | null    // ISO date

  // Scores (0-100)
  founder_score: number | null
  problem_score: number | null
  user_value_score: number | null
  execution_score: number | null
  overall_score: number | null    // Calculated

  // Risk
  risk_level: 'low' | 'normal' | 'elevated' | 'high'

  // Timestamps
  created_at: string
  updated_at: string
}
```

**Stage Definitions:**
| Stage | Week | Description |
|-------|------|-------------|
| problem_discovery | 1-4 | Validating problem via interviews |
| solution_shaping | 5-8 | Building and testing MVP |
| user_value | 9-12 | Proving retention and WTP |
| growth | 13-16 | Finding growth model |
| capital_ready | 17-20 | Preparing for investment |

---

### 2. Founder

Individual founder associated with a startup.

```typescript
interface Founder {
  id: string
  startup_id: string

  // Identity
  name: string
  email: string
  role: string              // CEO, CTO, COO, etc.
  is_lead: boolean
  photo_url: string | null

  // Background
  bio: string | null
  linkedin: string | null
  twitter: string | null
  personal_site: string | null

  // Experience
  previous_companies: string[]
  previous_exits: boolean
  years_experience: number | null
  education: string | null

  // Skills (1-5 scale)
  skill_technical: number | null
  skill_product: number | null
  skill_sales: number | null
  skill_design: number | null
  skill_leadership: number | null

  // Motivation
  why_this_problem: string | null
  long_term_ambition: string | null

  // Timestamps
  created_at: string
  updated_at: string
}
```

---

### 3. Cohort

Batch of startups going through the programme together.

```typescript
interface Cohort {
  id: string
  name: string              // "Cohort 1", "Spring 2026"
  start_date: string | null // ISO date
  end_date: string | null   // ISO date
  status: 'upcoming' | 'active' | 'completed'
  description: string | null

  created_at: string
  updated_at: string
}
```

---

### 4. Checkpoint

Weekly progress tracking for a startup.

```typescript
interface Checkpoint {
  id: string
  startup_id: string
  week_number: number       // 1-20

  // Content
  goal: string | null
  checkpoint_question: string | null
  tasks: CheckpointTask[]
  evidence_urls: string[]

  // Notes
  founder_notes: string | null
  partner_notes: string | null

  // Status
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
  completed_at: string | null

  created_at: string
  updated_at: string
}

interface CheckpointTask {
  id: string
  title: string
  completed: boolean
}
```

---

### 5. User (Auth)

For MVP, simplified user representation.

```typescript
interface User {
  id: string
  email: string
  name: string
  avatar_url: string | null
  role: 'partner' | 'founder' | 'mentor' | 'admin'

  // Associations
  startup_id: string | null   // If founder

  created_at: string
}
```

---

## Enums & Constants

### Stages
```typescript
const STAGES = [
  { value: 'problem_discovery', label: 'Problem Discovery', week_range: '1-4' },
  { value: 'solution_shaping', label: 'Solution Shaping', week_range: '5-8' },
  { value: 'user_value', label: 'User Value', week_range: '9-12' },
  { value: 'growth', label: 'Growth', week_range: '13-16' },
  { value: 'capital_ready', label: 'Capital Ready', week_range: '17-20' },
] as const
```

### Risk Levels
```typescript
const RISK_LEVELS = [
  { value: 'low', label: 'Low', color: 'green', min_score: 75 },
  { value: 'normal', label: 'Normal', color: 'blue', min_score: 50 },
  { value: 'elevated', label: 'Elevated', color: 'yellow', min_score: 25 },
  { value: 'high', label: 'High', color: 'red', min_score: 0 },
] as const
```

### Industries
```typescript
const INDUSTRIES = [
  'SaaS',
  'Fintech',
  'Healthtech',
  'Edtech',
  'E-commerce',
  'Marketplace',
  'AI/ML',
  'Climate',
  'Enterprise',
  'Consumer',
  'Other',
] as const
```

### Business Models
```typescript
const BUSINESS_MODELS = [
  'B2B',
  'B2C',
  'B2B2C',
  'Marketplace',
  'Other',
] as const
```

---

## Relationships

```
Cohort (1) ─────< (N) Startup
Startup (1) ────< (N) Founder
Startup (1) ────< (N) Checkpoint
User (1) ───────< (1) Startup (if founder)
```

---

## Score Calculation

### Overall Score
```typescript
function calculateOverallScore(startup: Startup): number {
  const { founder_score, problem_score, user_value_score, execution_score } = startup

  if (!founder_score || !problem_score || !user_value_score || !execution_score) {
    return 0
  }

  return Math.round(
    (founder_score * 0.25) +
    (problem_score * 0.25) +
    (user_value_score * 0.30) +
    (execution_score * 0.20)
  )
}
```

### Risk Level
```typescript
function calculateRiskLevel(overallScore: number): RiskLevel {
  if (overallScore >= 75) return 'low'
  if (overallScore >= 50) return 'normal'
  if (overallScore >= 25) return 'elevated'
  return 'high'
}
```

---

## Phase 2 Additions

These entities will be added in Phase 2:

- **Metric** — KPI tracking (MRR, users, retention)
- **Mentor** — Mentor profiles
- **MentorMatch** — Startup-mentor relationships
- **Document** — Uploaded files and docs
- **Notification** — Alerts and reminders

---

## Phase 3 Additions

These entities will be added in Phase 3:

- **AIInsight** — Agent-generated insights
- **Integration** — External API connections
- **GTMPipeline** — Sales pipeline tracking
- **HiringRole** — Open positions
