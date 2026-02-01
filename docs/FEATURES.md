# SANCTUARY DASHBOARD — Feature Documentation

**Version:** MVP
**Last Updated:** 2026-02-01

---

## MVP Features

### 1. Authentication (UI)

**Status:** Planned

**Description:**
Simple login interface with role selection. MVP uses mock auth state; Supabase integration comes later.

**Files:**
- `src/app/(auth)/login/page.tsx`
- `src/lib/stores/auth-store.ts`

**User Roles:**
- Partner: Full portfolio access, can edit all startups
- Founder: Own startup access only

**UI Components:**
- Login form (email + password)
- Role selector (Partner/Founder)
- Remember me checkbox

---

### 2. Portfolio View

**Status:** Planned

**Description:**
Central hub showing all startups in the accelerator. Supports Grid and List views with filtering.

**Files:**
- `src/app/(dashboard)/portfolio/page.tsx`
- `src/components/portfolio/startup-card.tsx`
- `src/components/portfolio/startup-table.tsx`
- `src/components/portfolio/portfolio-filters.tsx`

**Views:**
| View | Description |
|------|-------------|
| Grid | Visual cards with logo, name, stage, overall score |
| List | Table with sortable columns |

**Filters:**
- Stage (Problem Discovery → Capital Ready)
- Cohort
- Risk Level (Low, Normal, Elevated, High)
- Search (name, industry)

**Card Display:**
- Company logo
- Company name
- One-liner
- Current stage badge
- Overall score (0-100)
- Risk indicator (color coded)

---

### 3. Startup Profile

**Status:** Planned

**Description:**
Detailed view of a single startup with all company information, founders, scores, and activity.

**Files:**
- `src/app/(dashboard)/startup/[id]/page.tsx`
- `src/components/startup/profile-header.tsx`
- `src/components/startup/company-details.tsx`
- `src/components/startup/scores-display.tsx`
- `src/components/startup/founders-section.tsx`

**Sections:**
1. **Header:** Logo, name, one-liner, stage, quick actions
2. **Company Details:** Industry, business model, location, links
3. **Product:** Problem statement, solution, target customer
4. **Scores:** 4 dimension scores + overall
5. **Founders:** List with profile cards
6. **Checkpoints:** Recent progress (links to programme view)

**Actions:**
- Edit startup details
- Add/remove founders
- Update scores
- View full checkpoint history

---

### 4. Founder Profiles

**Status:** Planned

**Description:**
Individual founder information including background, skills, and contact details.

**Files:**
- `src/components/startup/founder-card.tsx`
- `src/components/startup/founder-detail.tsx`
- `src/components/startup/founder-form.tsx`

**Profile Fields:**
| Field | Type | Description |
|-------|------|-------------|
| name | string | Full name |
| email | string | Contact email |
| role | string | CEO, CTO, etc. |
| is_lead | boolean | Lead founder flag |
| photo_url | string | Profile photo |
| bio | text | Short biography |
| linkedin | string | LinkedIn URL |
| twitter | string | Twitter handle |
| years_experience | number | Years in industry |
| previous_exits | boolean | Has previous exit |
| education | string | Education background |
| skill_technical | 1-5 | Technical skill rating |
| skill_product | 1-5 | Product skill rating |
| skill_sales | 1-5 | Sales skill rating |
| skill_design | 1-5 | Design skill rating |
| skill_leadership | 1-5 | Leadership skill rating |
| why_this_problem | text | Founder motivation |

**Display:**
- Card view: Photo, name, role, key skills
- Detail view: Full profile in modal/sheet

---

### 5. Checkpoints (Manual)

**Status:** Planned

**Description:**
Weekly progress tracking against the 20-week programme. Manual input for MVP.

**Files:**
- `src/app/(dashboard)/programme/page.tsx`
- `src/components/programme/checkpoint-list.tsx`
- `src/components/programme/checkpoint-form.tsx`
- `src/components/programme/checkpoint-card.tsx`

**Checkpoint Fields:**
| Field | Type | Description |
|-------|------|-------------|
| week_number | 1-20 | Week in programme |
| goal | string | Primary objective |
| checkpoint_question | string | Key question to answer |
| tasks | json array | List of tasks with status |
| founder_notes | text | Founder's update |
| partner_notes | text | Partner feedback |
| status | enum | pending, in_progress, completed, blocked |
| evidence_urls | array | Links to evidence |

**Status Indicators:**
- 🟢 Completed
- 🟡 In Progress
- 🔴 Blocked
- ⚪ Pending

---

### 6. Scoring System (Manual)

**Status:** Planned

**Description:**
Four-dimension scoring system with manual input. Scores range 0-100.

**Files:**
- `src/components/startup/score-input.tsx`
- `src/components/startup/score-card.tsx`
- `src/components/startup/scores-display.tsx`

**Dimensions:**
| Dimension | Weight | Description |
|-----------|--------|-------------|
| Founder Score | 25% | Team quality, skills, commitment |
| Problem Score | 25% | Problem validity, market size |
| User Value Score | 30% | Product-market fit indicators |
| Execution Score | 20% | Speed, quality of execution |

**Overall Score Calculation:**
```
Overall = (Founder × 0.25) + (Problem × 0.25) + (UserValue × 0.30) + (Execution × 0.20)
```

**Risk Level Mapping:**
| Overall Score | Risk Level |
|---------------|------------|
| 75-100 | Low |
| 50-74 | Normal |
| 25-49 | Elevated |
| 0-24 | High |

---

## Phase 2 Features (Planned)

- Metrics Dashboard
- Mentor Database
- Mentor Matching
- Document Center
- Investment Readiness Index (Auto-calculated)
- Notifications

## Phase 3 Features (Planned)

- Sentinel Agent
- Compass Agent
- External Integrations
- Matchmaker Agent
- GTM Module
- Hiring Tracker
- Predictive Scoring
