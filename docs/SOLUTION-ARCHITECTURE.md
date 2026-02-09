# Sanctuary Ecosystem — Solution Architecture

**Version:** 1.0
**Date:** 2026-02-03

---

## High-Level System Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              SANCTUARY ECOSYSTEM                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│   ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐             │
│   │   MARKETING      │    │    DASHBOARD     │    │  COMMUNITY HUB   │             │
│   │   (sanctuary.vc) │    │   (OS/Portal)    │    │ (Sanctuary Times)│             │
│   │                  │    │                  │    │                  │             │
│   │  • Landing Page  │    │  • Founder View  │    │  • Events        │             │
│   │  • About/Team    │    │  • Partner View  │    │  • Residents     │             │
│   │  • Apply CTA     │    │  • AI Interview  │    │  • Check-ins     │             │
│   │  • Blog/News     │    │  • Metrics       │    │  • Board         │             │
│   └────────┬─────────┘    └────────┬─────────┘    └────────┬─────────┘             │
│            │                       │                       │                        │
│            └───────────────────────┼───────────────────────┘                        │
│                                    │                                                │
│                          ┌─────────▼─────────┐                                      │
│                          │   SHARED AUTH     │                                      │
│                          │   (Supabase)      │                                      │
│                          └─────────┬─────────┘                                      │
│                                    │                                                │
│                          ┌─────────▼─────────┐                                      │
│                          │    DATABASE       │                                      │
│                          │   (Supabase)      │                                      │
│                          └─────────┬─────────┘                                      │
│                                    │                                                │
│                          ┌─────────▼─────────┐                                      │
│                          │   AI SERVICES     │                                      │
│                          │   (Claude API)    │                                      │
│                          └───────────────────┘                                      │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## User Types & Access Matrix

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              USER HIERARCHY                                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│                              ┌─────────────┐                                         │
│                              │    USER     │                                         │
│                              └──────┬──────┘                                         │
│                                     │                                                │
│                    ┌────────────────┼────────────────┐                              │
│                    │                │                │                              │
│            ┌───────▼───────┐ ┌──────▼──────┐ ┌──────▼──────┐                       │
│            │   FOUNDER     │ │   PARTNER   │ │  RESIDENT   │                       │
│            │   (Startup)   │ │             │ │ (Community) │                       │
│            └───────┬───────┘ └──────┬──────┘ └─────────────┘                       │
│                    │                │                                               │
│                    │         ┌──────┼──────┐                                        │
│                    │         │      │      │                                        │
│                    │    ┌────▼──┐ ┌─▼───┐ ┌▼────────┐                              │
│                    │    │MENTOR │ │ VC  │ │ STARTUP │                              │
│                    │    │       │ │     │ │ MANAGER │                              │
│                    │    └───────┘ └─────┘ └─────────┘                              │
│                    │                                                                │
│            ┌───────▼───────────────────────────────────────┐                       │
│            │              STARTUP ENTITY                    │                       │
│            │  (Company Profile, Metrics, Documents, etc.)   │                       │
│            └────────────────────────────────────────────────┘                       │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘

ACCESS MATRIX:
┌──────────────────┬───────────┬───────────┬────────┬─────────────────┬───────────┐
│ Feature          │ Founder   │ Mentor    │ VC     │ Startup Manager │ Resident  │
├──────────────────┼───────────┼───────────┼────────┼─────────────────┼───────────┤
│ Own Profile      │ RW        │ RW        │ RW     │ RW              │ RW        │
│ Company Profile  │ RW        │ R (match) │ R      │ RW              │ -         │
│ Metrics          │ R (shared)│ R (match) │ RW     │ RW              │ -         │
│ Documents        │ RW (own)  │ R (shared)│ R      │ RW              │ -         │
│ AI Interview     │ RW        │ -         │ R      │ RW              │ -         │
│ Mentor Matching  │ Request   │ Accept    │ View   │ Manage          │ -         │
│ Portfolio View   │ -         │ Matched   │ All    │ All             │ -         │
│ Applications     │ Submit    │ -         │ Review │ Review          │ -         │
│ Community Events │ RW        │ RW        │ RW     │ RW              │ RW        │
│ Check-in         │ RW        │ RW        │ RW     │ RW              │ RW        │
│ KYR Profile      │ RW        │ RW        │ RW     │ RW              │ RW        │
└──────────────────┴───────────┴───────────┴────────┴─────────────────┴───────────┘

R = Read, W = Write, RW = Read/Write, - = No Access
```

---

## Data Flow Architecture

### 1. Founder Onboarding Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                         FOUNDER ONBOARDING FLOW                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌─────────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐   │
│  │ Landing │ ──▶  │ Sign Up │ ──▶  │  Role   │ ──▶  │  Apply  │ ──▶  │   AI    │   │
│  │  Page   │      │ (Auth)  │      │ Select  │      │  Form   │      │Interview│   │
│  └─────────┘      └─────────┘      └─────────┘      └─────────┘      └────┬────┘   │
│                                                                           │         │
│                                                                           ▼         │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                        AI INTERVIEW AGENT                                    │   │
│  │  ┌──────────────────────────────────────────────────────────────────────┐   │   │
│  │  │  INPUT:                                                               │   │   │
│  │  │  • Application form data (company name, stage, industry)              │   │   │
│  │  │  • Founder info (name, role, background)                              │   │   │
│  │  │  • Problem statement, solution, traction                              │   │   │
│  │  └──────────────────────────────────────────────────────────────────────┘   │   │
│  │                               │                                              │   │
│  │                               ▼                                              │   │
│  │  ┌──────────────────────────────────────────────────────────────────────┐   │   │
│  │  │  PROCESSING (Claude API):                                             │   │   │
│  │  │  • Contextual questions based on industry/stage                       │   │   │
│  │  │  • Deep dive on problem/solution fit                                  │   │   │
│  │  │  • Team assessment                                                    │   │   │
│  │  │  • Market opportunity validation                                      │   │   │
│  │  └──────────────────────────────────────────────────────────────────────┘   │   │
│  │                               │                                              │   │
│  │                               ▼                                              │   │
│  │  ┌──────────────────────────────────────────────────────────────────────┐   │   │
│  │  │  OUTPUT:                                                              │   │   │
│  │  │  • Full interview transcript                                          │   │   │
│  │  │  • AI-generated assessment scores                                     │   │   │
│  │  │  • Risk flags & opportunities                                         │   │   │
│  │  │  • Recommended next steps                                             │   │   │
│  │  └──────────────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                         │                                           │
│                                         ▼                                           │
│  ┌───────────────┐      ┌───────────────┐      ┌───────────────┐                   │
│  │   PENDING     │ ──▶  │   APPROVED    │ ──▶  │   FOUNDER     │                   │
│  │   REVIEW      │      │   (Partner)   │      │   DASHBOARD   │                   │
│  └───────────────┘      └───────────────┘      └───────────────┘                   │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 2. Startup Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           STARTUP DATA FLOW                                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│                         ┌─────────────────────────────┐                             │
│                         │      STARTUP ENTITY         │                             │
│                         │  (Central Data Object)      │                             │
│                         └──────────────┬──────────────┘                             │
│                                        │                                            │
│        ┌───────────────┬───────────────┼───────────────┬───────────────┐           │
│        │               │               │               │               │           │
│        ▼               ▼               ▼               ▼               ▼           │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐        │
│  │  PROFILE  │  │  METRICS  │  │ DOCUMENTS │  │CHECKPOINTS│  │  MATCHES  │        │
│  │           │  │           │  │           │  │           │  │           │        │
│  │• Name     │  │• MRR      │  │• Pitch    │  │• Progress │  │• Mentors  │        │
│  │• Stage    │  │• Burn     │  │• Financials│ │• Goals    │  │• Sessions │        │
│  │• Industry │  │• Runway   │  │• Legal    │  │• Notes    │  │• Feedback │        │
│  │• Team     │  │• Users    │  │• Cap Table│  │• Blockers │  │• Ratings  │        │
│  │• Problem  │  │• Growth   │  │           │  │           │  │           │        │
│  │• Solution │  │           │  │           │  │           │  │           │        │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘        │
│        │               │               │               │               │           │
│        └───────────────┴───────────────┴───────────────┴───────────────┘           │
│                                        │                                            │
│                                        ▼                                            │
│                    ┌───────────────────────────────────────┐                       │
│                    │          WHO CAN ACCESS?              │                       │
│                    ├───────────────────────────────────────┤                       │
│                    │                                       │                       │
│                    │  FOUNDER ───────▶ Own startup only    │                       │
│                    │                   Full read/write     │                       │
│                    │                                       │                       │
│                    │  VC ────────────▶ All startups        │                       │
│                    │                   Read + metrics edit │                       │
│                    │                                       │                       │
│                    │  MENTOR ────────▶ Matched startups    │                       │
│                    │                   Read (shared docs)  │                       │
│                    │                                       │                       │
│                    │  STARTUP MGR ───▶ All startups        │                       │
│                    │                   Full admin access   │                       │
│                    │                                       │                       │
│                    └───────────────────────────────────────┘                       │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 3. Mentor Matching Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                          MENTOR MATCHING FLOW                                        │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│   FOUNDER SIDE                           │           MENTOR/PARTNER SIDE            │
│                                          │                                          │
│   ┌─────────────┐                        │           ┌─────────────┐               │
│   │  Identify   │                        │           │   Mentor    │               │
│   │   Blocker   │                        │           │   Profile   │               │
│   └──────┬──────┘                        │           └──────┬──────┘               │
│          │                               │                  │                       │
│          ▼                               │                  ▼                       │
│   ┌─────────────┐                        │           ┌─────────────┐               │
│   │  Request    │                        │           │  Expertise  │               │
│   │   Help      │                        │           │  • Domain   │               │
│   │             │                        │           │  • Skills   │               │
│   │ • Problem   │                        │           │  • Industry │               │
│   │ • Context   │                        │           │  • Stage    │               │
│   │ • Urgency   │                        │           └──────┬──────┘               │
│   └──────┬──────┘                        │                  │                       │
│          │                               │                  │                       │
│          └───────────────┬───────────────┴──────────────────┘                       │
│                          │                                                          │
│                          ▼                                                          │
│          ┌───────────────────────────────────────────┐                             │
│          │        MATCHING AGENT (Future)            │                             │
│          │                                           │                             │
│          │  INPUT:                                   │                             │
│          │  • Blocker/problem description            │                             │
│          │  • Startup context (stage, industry)      │                             │
│          │  • All mentor profiles + expertise        │                             │
│          │                                           │                             │
│          │  PROCESSING:                              │                             │
│          │  • Classify problem type                  │                             │
│          │  • Match expertise to need                │                             │
│          │  • Rank by relevance + availability       │                             │
│          │                                           │                             │
│          │  OUTPUT:                                  │                             │
│          │  • Top 3-5 mentor recommendations         │                             │
│          │  • Match reasoning                        │                             │
│          │  • Suggested talking points               │                             │
│          └───────────────┬───────────────────────────┘                             │
│                          │                                                          │
│                          ▼                                                          │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│   │   Match     │───▶│   Session   │───▶│  Feedback   │───▶│   Update    │        │
│   │  Created    │    │  Scheduled  │    │  Captured   │    │   Profile   │        │
│   └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘        │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 4. Community Hub Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        COMMUNITY HUB DATA FLOW                                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│                           ┌─────────────────────────┐                               │
│                           │      RESIDENT           │                               │
│                           │   (Any authenticated    │                               │
│                           │    Sanctuary member)    │                               │
│                           └───────────┬─────────────┘                               │
│                                       │                                             │
│       ┌─────────────┬─────────────────┼─────────────────┬─────────────┐            │
│       │             │                 │                 │             │            │
│       ▼             ▼                 ▼                 ▼             ▼            │
│  ┌─────────┐  ┌─────────┐      ┌─────────────┐   ┌─────────┐  ┌─────────┐         │
│  │   KYR   │  │ CHECK-  │      │   EVENTS    │   │  BOARD  │  │ CELEBS  │         │
│  │ PROFILE │  │   IN    │      │             │   │  POSTS  │  │         │         │
│  └────┬────┘  └────┬────┘      └──────┬──────┘   └────┬────┘  └────┬────┘         │
│       │            │                  │               │            │              │
│       ▼            ▼                  ▼               ▼            ▼              │
│  ┌─────────────────────────────────────────────────────────────────────────┐      │
│  │                         DATA ENTITIES                                    │      │
│  ├─────────────────────────────────────────────────────────────────────────┤      │
│  │                                                                          │      │
│  │  KYR_PROFILE              CHECK_IN                EVENT                  │      │
│  │  ┌──────────────┐         ┌──────────────┐       ┌──────────────┐       │      │
│  │  │ • Name       │         │ • User ID    │       │ • Title      │       │      │
│  │  │ • Pronouns   │         │ • Location   │       │ • Date/Time  │       │      │
│  │  │ • Role       │         │ • Status     │       │ • Location   │       │      │
│  │  │ • Company    │         │ • Check-in   │       │ • Category   │       │      │
│  │  │ • Working On │         │   Time       │       │ • Host       │       │      │
│  │  │ • Expertise  │         │ • Check-out  │       │ • Capacity   │       │      │
│  │  │ • Seeking    │         │   Time       │       │ • RSVPs      │       │      │
│  │  │ • Work Style │         └──────────────┘       └──────────────┘       │      │
│  │  │ • Coffee     │                                                        │      │
│  │  │ • Hobbies    │         BOARD_POST              RSVP                   │      │
│  │  │ • Superpower │         ┌──────────────┐       ┌──────────────┐       │      │
│  │  └──────────────┘         │ • Author     │       │ • Event ID   │       │      │
│  │                           │ • Title      │       │ • User ID    │       │      │
│  │  VISITOR                  │ • Content    │       │ • Status     │       │      │
│  │  ┌──────────────┐         │ • Category   │       │ • (attending/│       │      │
│  │  │ • Name       │         │ • Reactions  │       │   maybe/no)  │       │      │
│  │  │ • Company    │         │ • Comments   │       └──────────────┘       │      │
│  │  │ • Purpose    │         │ • Pinned     │                               │      │
│  │  │ • Host       │         └──────────────┘       CELEBRATION             │      │
│  │  │ • Badge #    │                                ┌──────────────┐       │      │
│  │  └──────────────┘                                │ • User ID    │       │      │
│  │                                                  │ • Type       │       │      │
│  │                                                  │ • Date       │       │      │
│  │                                                  │ • Message    │       │      │
│  │                                                  └──────────────┘       │      │
│  │                                                                          │      │
│  └─────────────────────────────────────────────────────────────────────────┘      │
│                                       │                                            │
│                                       ▼                                            │
│                    ┌───────────────────────────────────────┐                      │
│                    │         COMMUNITY INSIGHTS            │                      │
│                    │                                       │                      │
│                    │  • Live Occupancy (who's here now)    │                      │
│                    │  • Popular Events (high RSVPs)        │                      │
│                    │  • Active Community (post engagement) │                      │
│                    │  • Skill Graph (who knows what)       │                      │
│                    │  • Connection Suggestions             │                      │
│                    └───────────────────────────────────────┘                      │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE SCHEMA                                            │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                              CORE ENTITIES                                   │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│      ┌────────────────┐           ┌────────────────┐          ┌────────────────┐   │
│      │     USERS      │           │    STARTUPS    │          │    MENTORS     │   │
│      ├────────────────┤           ├────────────────┤          ├────────────────┤   │
│      │ id (PK)        │     ┌────▶│ id (PK)        │     ┌───▶│ id (PK)        │   │
│      │ email          │     │     │ name           │     │    │ user_id (FK)   │──┐│
│      │ name           │     │     │ stage          │     │    │ expertise []   │  ││
│      │ avatar_url     │     │     │ industry       │     │    │ bio            │  ││
│      │ user_type      │     │     │ problem        │     │    │ availability   │  ││
│      │ partner_subtype│     │     │ solution       │     │    │ rating         │  ││
│      │ onboarding_done│     │     │ team_size      │     │    └────────────────┘  ││
│      └───────┬────────┘     │     │ founded_date   │     │                        ││
│              │              │     │ status         │     │                        ││
│              │              │     └────────────────┘     │                        ││
│              │              │                            │                        ││
│  ┌───────────┴──────────────┼────────────────────────────┼────────────────────────┘│
│  │                          │                            │                         │
│  │  ┌────────────────┐      │   ┌────────────────┐       │   ┌────────────────┐   │
│  │  │   FOUNDERS     │      │   │    METRICS     │       │   │    MATCHES     │   │
│  │  ├────────────────┤      │   ├────────────────┤       │   ├────────────────┤   │
│  └─▶│ id (PK)        │      │   │ id (PK)        │       │   │ id (PK)        │   │
│     │ user_id (FK)   │──────┘   │ startup_id(FK) │◀──────┘   │ startup_id(FK) │   │
│     │ startup_id(FK) │─────────▶│ mrr            │           │ mentor_id (FK) │◀──┘
│     │ role           │          │ burn_rate      │           │ problem        │   │
│     │ linkedin       │          │ runway_months  │           │ status         │   │
│     └────────────────┘          │ active_users   │           │ session_date   │   │
│                                 │ growth_rate    │           │ feedback       │   │
│                                 │ recorded_at    │           └────────────────┘   │
│                                 └────────────────┘                                 │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                           DASHBOARD ENTITIES                                 │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│      ┌────────────────┐     ┌────────────────┐     ┌────────────────┐             │
│      │  CHECKPOINTS   │     │   DOCUMENTS    │     │  APPLICATIONS  │             │
│      ├────────────────┤     ├────────────────┤     ├────────────────┤             │
│      │ id (PK)        │     │ id (PK)        │     │ id (PK)        │             │
│      │ startup_id(FK) │     │ startup_id(FK) │     │ startup_id(FK) │             │
│      │ title          │     │ name           │     │ status         │             │
│      │ description    │     │ type           │     │ form_data      │             │
│      │ target_date    │     │ url            │     │ interview_id   │             │
│      │ status         │     │ uploaded_at    │     │ reviewed_by    │             │
│      │ notes          │     │ shared_with [] │     │ decision       │             │
│      └────────────────┘     └────────────────┘     └────────────────┘             │
│                                                                                      │
│      ┌────────────────┐     ┌────────────────┐                                     │
│      │   INTERVIEWS   │     │   AI_SCORES    │                                     │
│      ├────────────────┤     ├────────────────┤                                     │
│      │ id (PK)        │     │ id (PK)        │                                     │
│      │ application_id │     │ interview_id   │                                     │
│      │ transcript []  │     │ dimension      │                                     │
│      │ started_at     │     │ score          │                                     │
│      │ completed_at   │     │ reasoning      │                                     │
│      │ status         │     │ flags []       │                                     │
│      └────────────────┘     └────────────────┘                                     │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                          COMMUNITY ENTITIES                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│      ┌────────────────┐     ┌────────────────┐     ┌────────────────┐             │
│      │  KYR_PROFILES  │     │    EVENTS      │     │    CHECK_INS   │             │
│      ├────────────────┤     ├────────────────┤     ├────────────────┤             │
│      │ id (PK)        │     │ id (PK)        │     │ id (PK)        │             │
│      │ user_id (FK)   │     │ title          │     │ user_id (FK)   │             │
│      │ preferred_name │     │ description    │     │ location       │             │
│      │ pronouns       │     │ date           │     │ status_msg     │             │
│      │ role           │     │ start_time     │     │ check_in_time  │             │
│      │ company        │     │ end_time       │     │ check_out_time │             │
│      │ working_on     │     │ location       │     └────────────────┘             │
│      │ expertise []   │     │ category       │                                     │
│      │ seeking []     │     │ host_id (FK)   │     ┌────────────────┐             │
│      │ work_style     │     │ capacity       │     │  BOARD_POSTS   │             │
│      │ coffee_order   │     └────────────────┘     ├────────────────┤             │
│      │ superpower     │                            │ id (PK)        │             │
│      │ hobbies []     │     ┌────────────────┐     │ author_id (FK) │             │
│      └────────────────┘     │     RSVPS      │     │ title          │             │
│                             ├────────────────┤     │ content        │             │
│      ┌────────────────┐     │ id (PK)        │     │ category       │             │
│      │    VISITORS    │     │ event_id (FK)  │     │ is_pinned      │             │
│      ├────────────────┤     │ user_id (FK)   │     │ reactions {}   │             │
│      │ id (PK)        │     │ status         │     └────────────────┘             │
│      │ name           │     └────────────────┘                                     │
│      │ company        │                                                            │
│      │ purpose        │                                                            │
│      │ host_id (FK)   │                                                            │
│      │ badge_number   │                                                            │
│      │ check_in_time  │                                                            │
│      └────────────────┘                                                            │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Integration Points

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                          INTEGRATION ARCHITECTURE                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│                              ┌─────────────────┐                                    │
│                              │   NEXT.JS APP   │                                    │
│                              │   (Frontend)    │                                    │
│                              └────────┬────────┘                                    │
│                                       │                                             │
│                                       ▼                                             │
│                              ┌─────────────────┐                                    │
│                              │   API ROUTES    │                                    │
│                              │  /api/...       │                                    │
│                              └────────┬────────┘                                    │
│                                       │                                             │
│         ┌─────────────────────────────┼─────────────────────────────┐              │
│         │                             │                             │              │
│         ▼                             ▼                             ▼              │
│  ┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐      │
│  │    SUPABASE     │         │   CLAUDE API    │         │     SLACK       │      │
│  │                 │         │                 │         │                 │      │
│  │ • Auth          │         │ • Interview     │         │ • /sanc checkin │      │
│  │ • Database      │         │   Agent         │         │ • /sanc whoshere│      │
│  │ • Storage       │         │ • Assessment    │         │ • /sanc events  │      │
│  │ • Realtime      │         │   Agent         │         │ • /sanc coffee  │      │
│  │                 │         │ • Matching      │         │ • Webhooks      │      │
│  │                 │         │   Agent         │         │                 │      │
│  └────────┬────────┘         └────────┬────────┘         └────────┬────────┘      │
│           │                           │                           │               │
│           └───────────────────────────┼───────────────────────────┘               │
│                                       │                                            │
│                                       ▼                                            │
│                          ┌─────────────────────────┐                              │
│                          │    DATA FLOW SUMMARY    │                              │
│                          ├─────────────────────────┤                              │
│                          │                         │                              │
│                          │  Supabase:              │                              │
│                          │  • User auth & sessions │                              │
│                          │  • All persistent data  │                              │
│                          │  • File storage (docs)  │                              │
│                          │  • Realtime updates     │                              │
│                          │                         │                              │
│                          │  Claude API:            │                              │
│                          │  • AI Interview chat    │                              │
│                          │  • Score generation     │                              │
│                          │  • Mentor matching      │                              │
│                          │  • Insights generation  │                              │
│                          │                         │                              │
│                          │  Slack:                 │                              │
│                          │  • Quick check-ins      │                              │
│                          │  • Event notifications  │                              │
│                          │  • Community engagement │                              │
│                          │                         │                              │
│                          └─────────────────────────┘                              │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Cross-Product Data Sharing

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                      CROSS-PRODUCT DATA RELATIONSHIPS                                │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│   DASHBOARD                          COMMUNITY HUB                                  │
│   ┌─────────────────────┐            ┌─────────────────────┐                       │
│   │                     │            │                     │                       │
│   │  USER               │◀──────────▶│  RESIDENT           │                       │
│   │  (Auth identity)    │   Same     │  (Community profile)│                       │
│   │                     │   User     │                     │                       │
│   └──────────┬──────────┘            └──────────┬──────────┘                       │
│              │                                  │                                   │
│              │                                  │                                   │
│   ┌──────────▼──────────┐            ┌──────────▼──────────┐                       │
│   │                     │            │                     │                       │
│   │  FOUNDER            │───────────▶│  KYR_PROFILE        │                       │
│   │  • Startup info     │  Enriches  │  • Personal details │                       │
│   │  • Professional     │            │  • Preferences      │                       │
│   │                     │            │  • Social           │                       │
│   └──────────┬──────────┘            └──────────┬──────────┘                       │
│              │                                  │                                   │
│              │                                  │                                   │
│   ┌──────────▼──────────┐            ┌──────────▼──────────┐                       │
│   │                     │            │                     │                       │
│   │  STARTUP            │───────────▶│  EVENTS             │                       │
│   │  • Achievements     │  Headlines │  • Announcements    │                       │
│   │  • Milestones       │            │  • Celebrations     │                       │
│   │                     │            │                     │                       │
│   └─────────────────────┘            └─────────────────────┘                       │
│                                                                                      │
│   ┌─────────────────────────────────────────────────────────────────────────────┐  │
│   │                        SHARED DATA EXAMPLES                                  │  │
│   ├─────────────────────────────────────────────────────────────────────────────┤  │
│   │                                                                              │  │
│   │  1. User signs up → Creates AUTH user                                        │  │
│   │                   → Auto-creates KYR_PROFILE stub                            │  │
│   │                                                                              │  │
│   │  2. Founder completes onboarding → STARTUP created                           │  │
│   │                                  → KYR_PROFILE.company populated             │  │
│   │                                                                              │  │
│   │  3. Startup raises funding → METRICS updated                                 │  │
│   │                            → CELEBRATION created                             │  │
│   │                            → BOARD_POST (announcement) auto-generated        │  │
│   │                                                                              │  │
│   │  4. Founder checks in (Community) → CHECK_IN created                         │  │
│   │                                   → Dashboard shows "Founder is in office"   │  │
│   │                                                                              │  │
│   │  5. Mentor session completed → MATCH updated                                 │  │
│   │                              → CHECKPOINT may be updated                     │  │
│   │                              → Notification to founder                       │  │
│   │                                                                              │  │
│   └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                          DEPLOYMENT ARCHITECTURE                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│                              ┌─────────────────┐                                    │
│                              │     VERCEL      │                                    │
│                              │   (Hosting)     │                                    │
│                              └────────┬────────┘                                    │
│                                       │                                             │
│              ┌────────────────────────┼────────────────────────┐                   │
│              │                        │                        │                   │
│              ▼                        ▼                        ▼                   │
│     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐           │
│     │   DASHBOARD     │     │  COMMUNITY HUB  │     │   MARKETING     │           │
│     │                 │     │                 │     │                 │           │
│     │ dashboard.      │     │ community.      │     │ sanctuary.vc    │           │
│     │ sanctuary.vc    │     │ sanctuary.vc    │     │                 │           │
│     │                 │     │                 │     │                 │           │
│     │ Port: 3005      │     │ Port: 3006      │     │ Port: 3000      │           │
│     └────────┬────────┘     └────────┬────────┘     └────────┬────────┘           │
│              │                       │                       │                     │
│              └───────────────────────┼───────────────────────┘                     │
│                                      │                                             │
│                                      ▼                                             │
│                          ┌───────────────────────┐                                 │
│                          │      SUPABASE         │                                 │
│                          │   (Backend-as-Service)│                                 │
│                          ├───────────────────────┤                                 │
│                          │                       │                                 │
│                          │  ┌─────────────────┐  │                                 │
│                          │  │  PostgreSQL DB  │  │                                 │
│                          │  └─────────────────┘  │                                 │
│                          │                       │                                 │
│                          │  ┌─────────────────┐  │                                 │
│                          │  │  Auth Service   │  │                                 │
│                          │  └─────────────────┘  │                                 │
│                          │                       │                                 │
│                          │  ┌─────────────────┐  │                                 │
│                          │  │  File Storage   │  │                                 │
│                          │  └─────────────────┘  │                                 │
│                          │                       │                                 │
│                          │  ┌─────────────────┐  │                                 │
│                          │  │  Realtime       │  │                                 │
│                          │  └─────────────────┘  │                                 │
│                          │                       │                                 │
│                          └───────────────────────┘                                 │
│                                      │                                             │
│                                      ▼                                             │
│                          ┌───────────────────────┐                                 │
│                          │    EXTERNAL APIs      │                                 │
│                          ├───────────────────────┤                                 │
│                          │  • Claude API (AI)    │                                 │
│                          │  • Slack API          │                                 │
│                          │  • Google OAuth       │                                 │
│                          │  • GitHub OAuth       │                                 │
│                          └───────────────────────┘                                 │
│                                                                                     │
│   ENVIRONMENT VARIABLES:                                                           │
│   ┌─────────────────────────────────────────────────────────────────────────────┐  │
│   │  NEXT_PUBLIC_SUPABASE_URL          # Supabase project URL                   │  │
│   │  NEXT_PUBLIC_SUPABASE_ANON_KEY     # Supabase public key                    │  │
│   │  SUPABASE_SERVICE_ROLE_KEY         # Supabase admin key (server only)       │  │
│   │  ANTHROPIC_API_KEY                 # Claude API key                         │  │
│   │  SLACK_BOT_TOKEN                   # Slack bot token                        │  │
│   │  SLACK_SIGNING_SECRET              # Slack webhook verification             │  │
│   │  GOOGLE_CLIENT_ID                  # OAuth                                  │  │
│   │  GOOGLE_CLIENT_SECRET              # OAuth                                  │  │
│   │  GITHUB_ID                         # OAuth                                  │  │
│   │  GITHUB_SECRET                     # OAuth                                  │  │
│   └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Summary

| Component | Purpose | Data Owned | Integrations |
|-----------|---------|------------|--------------|
| **Dashboard** | Startup management, metrics, onboarding | Startups, Founders, Metrics, Documents, Interviews | Supabase, Claude AI |
| **Community Hub** | Daily life, events, social | KYR Profiles, Events, Check-ins, Posts | Supabase, Slack |
| **Marketing** | Public landing, content | Blog posts, Team info | CMS (optional) |
| **Supabase** | Backend services | All persistent data | All apps |
| **Claude API** | AI capabilities | None (stateless) | Dashboard |
| **Slack** | Async engagement | None (proxies to Supabase) | Community Hub |

---

**Document maintained by:** Sanctuary Engineering
**Last updated:** 2026-02-03
