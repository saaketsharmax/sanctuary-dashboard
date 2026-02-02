# Sanctuary Dashboard - Product Requirements Document

**Version:** 1.0
**Date:** February 2, 2026
**Status:** MVP Complete

---

## Executive Summary

Sanctuary Dashboard is a web application for managing an accelerator program. It connects **Founders** (seeking acceleration support) with **Partners** (mentors, investors, and program operators).

**Tech Stack:** Next.js 16, NextAuth.js v5, TypeScript, Tailwind CSS, Radix UI

---

## 1. User Types & Authentication

### 1.1 User Roles

| Role | Sub-types | Access Level |
|------|-----------|--------------|
| **Founder** | - | Own startup data, application, progress |
| **Partner** | Mentor | Matched startups, mentor system |
| **Partner** | VC | Portfolio view, investment metrics |
| **Partner** | Startup Manager | Full access to all features |

### 1.2 Authentication Methods

- Email/Password
- Google OAuth
- GitHub OAuth
- Auto-provisioning for `@sanctuary.vc` emails (auto-partner)

### 1.3 Auth Flow

```
Signup → Role Selection → Dashboard (Founder or Partner)
```

### 1.4 Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| `partner@sanctuary.vc` | `demo` | Partner (Startup Manager) |
| `sarah@techflow.ai` | `demo` | Founder (with startup data) |
| `emma@greencommute.co` | `demo` | Founder (with startup data) |

---

## 2. Route Structure

### Authentication Routes
```
/login              - Login page
/signup             - Sign up page
/auth/role-select   - Role selection (founder vs partner)
```

### Founder Routes (`/founder/*`)
```
/founder/dashboard      - Main dashboard with stats & quick actions
/founder/apply          - 6-step application form
/founder/interview/[id] - AI interview session
/founder/company        - Company profile management
/founder/documents      - Document uploads
/founder/requests       - Request mentors or features
/founder/metrics        - View shared metrics
/founder/progress       - Checkpoint tracking
/founder/settings       - Account settings
```

### Partner Routes (`/partner/*`)
```
/partner/dashboard      - Portfolio overview & alerts
/partner/applications   - Review founder applications
/partner/portfolio      - All startups (grid/list view)
/partner/portfolio/[id] - Startup detail page
/partner/mentors        - Mentor database & matching
/partner/matches        - Match management
/partner/matches/[id]   - Match details
/partner/metrics        - Portfolio-wide analytics
/partner/shared-views   - Manage what founders can see
/partner/settings       - Account settings
```

---

## 3. Founder Features

### 3.1 Dashboard
- Company overview card
- Quick stats: MRR, Active Users, Progress, Score
- Current checkpoint with status
- Quick action cards (Company, Documents, Get Help)
- Onboarding prompt if no startup linked

### 3.2 Application Form (6 Steps)
1. **Company** - Name, one-liner, website, description
2. **Founders** - Add multiple founders with details
3. **Problem** - Problem, target customer, solution
4. **Traction** - Stage, users, MRR, biggest challenge
5. **Why Us** - Why Sanctuary, what they want
6. **Review** - Review and submit

### 3.3 AI Interview
- 5 sections (~45 min total):
  1. Founder DNA (10-15 min)
  2. Problem Interrogation (15-20 min)
  3. Solution & Execution (10-15 min)
  4. Market & Competition (5-10 min)
  5. Sanctuary Fit (5 min)
- Conversational format
- Can pause and resume
- Generates assessment post-completion

### 3.4 Company Profile
- View/edit company details
- Industry, stage, location
- Problem/solution statements
- Website and pitch deck links

### 3.5 Documents
- Upload pitch decks, financials, legal docs
- Toggle sharing with partners
- View upload history

### 3.6 Metrics (Read-Only)
- Current metrics: MRR, users, retention
- Trend indicators
- Partner-shared insights and benchmarks

### 3.7 Progress
- Programme progress overview
- Checkpoint timeline
- Task completion tracking
- Founder notes
- Partner feedback (read-only)

### 3.8 Requests
- Request types: Mentor, Feature, Feedback, Other
- Priority levels: Low, Medium, High
- Status tracking: Pending → In Review → Approved/Declined → Completed

---

## 4. Partner Features

### 4.1 Dashboard
- Quick stats: Startups, MRR, Pending Reviews, At-Risk
- Pending applications queue
- Pending mentor matches
- At-risk startups alert
- Quick action cards

### 4.2 Applications
- Filter tabs: All, Needs Review, In Progress, Decided
- Application cards with status badges
- View interview transcripts
- Review assessments
- Approve/decline decisions

### 4.3 Portfolio
- Grid/List view toggle
- Filter by stage, risk level
- Startup cards with key metrics
- Add new startup

### 4.4 Startup Detail Page
**Tabs:**
1. **Overview** - Company info, stats, problem/solution
2. **Scores** - Founder, Problem, User Value, Execution scores
3. **Founders** - Team members with skills
4. **Checkpoints** - Progress timeline
5. **Metrics** - Charts and trends

### 4.5 Mentor Matching
- Mentor directory with search/filter
- Expertise tags (14 problem archetypes)
- Bottleneck identification
- AI-generated matches with scores
- Approve/reject/send intro actions
- Match feedback collection

### 4.6 Portfolio Metrics
- Total MRR, ARR, Users
- Average retention and NPS
- Time-series charts
- Top performers
- At-risk dashboard

### 4.7 Shared Views
- Create shared views for founders
- Select: metrics, checkpoints, or documents
- Set permissions: view, comment, download
- Set expiration dates
- Activate/deactivate sharing

---

## 5. Scoring System

### 5.1 Score Dimensions (0-100)
- **Founder Score** - Team quality, experience, skills
- **Problem Score** - Problem clarity, market size
- **User Value Score** - Solution fit, traction
- **Execution Score** - Ability to deliver

### 5.2 Overall Score Formula
```
Overall = (Founder × 0.25) + (Problem × 0.25) + (UserValue × 0.30) + (Execution × 0.20)
```

### 5.3 Risk Levels
| Level | Score Range | Color |
|-------|-------------|-------|
| Low | 75-100 | Green |
| Normal | 50-74 | Blue |
| Elevated | 25-49 | Yellow |
| High | 0-24 | Red |

---

## 6. Programme Stages

| Stage | Weeks | Focus |
|-------|-------|-------|
| Problem Discovery | 1-4 | Validate problem |
| Solution Shaping | 5-8 | Build MVP |
| User Value | 9-12 | Get traction |
| Growth | 13-16 | Scale |
| Capital Ready | 17-20 | Fundraise |

---

## 7. Mentor Matching System

### 7.1 Problem Archetypes
- Finding PMF
- First Customers
- Scaling Sales
- Hiring Key Role
- Team Dynamics
- Technical Architecture
- Fundraising
- Unit Economics
- Market Positioning
- Channel Strategy
- Product Prioritization
- Operational Scaling
- Pivoting
- Other

### 7.2 Match Score Formula
```
Score = (ProblemShape × 0.40) + (ConstraintAlignment × 0.25) +
        (StageRelevance × 0.20) + (ExperienceDepth × 0.10) + (Recency × 0.05)
```

### 7.3 Confidence Levels
- **High** - Strong match, recommend immediately
- **Medium** - Good match, review recommended
- **Low** - Possible match, needs validation

---

## 8. Data Models

### 8.1 Core Entities
- **Cohort** - Programme cohort grouping
- **Startup** - Company profile with scores
- **Founder** - Team member profiles
- **Checkpoint** - Weekly progress milestones
- **MetricSnapshot** - Point-in-time metrics

### 8.2 Onboarding Entities
- **Application** - Founder application
- **ApplicationFounder** - Founders on application
- **Interview** - AI interview session
- **InterviewMessage** - Chat messages
- **Assessment** - AI-generated evaluation
- **ProposedProgramme** - Recommended programme

### 8.3 Mentor Entities
- **Mentor** - Mentor profile
- **MentorExperience** - Past problem-solving
- **Bottleneck** - Startup problem needing help
- **Match** - Mentor-bottleneck pairing
- **MatchFeedback** - Post-match feedback

### 8.4 Other Entities
- **SharedView** - Partner-to-founder data sharing
- **FounderDocument** - Uploaded documents
- **FounderRequest** - Mentor/feature requests

---

## 9. Application Lifecycle

```
draft → submitted → interview_scheduled → interview_completed →
assessment_generated → under_review → approved/rejected/withdrawn
```

---

## 10. Assessment Output

After AI interview, generates:
- **Recommendation:** Strong Accept / Accept / Conditional / Waitlist / Decline
- **Scores:** Founder, Problem, User Value, Execution (0-100 each)
- **Key Strengths:** Evidence-based strengths
- **Key Risks:** Severity-rated risks with mitigations
- **Critical Questions:** Follow-up questions
- **Mentor Domains:** Recommended expertise areas
- **Starting Stage:** Recommended programme entry point

---

## 11. Technical Architecture

### 11.1 Frontend
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Radix UI components

### 11.2 Authentication
- NextAuth.js v5
- JWT sessions
- OAuth (Google, GitHub)
- Role-based middleware

### 11.3 State Management
- Zustand (client state)
- React Hook Form (forms)
- Zod (validation)

### 11.4 Data Layer
- In-memory mock data (MVP)
- Ready for database migration
- Helper functions for data access

### 11.5 UI Components
- Recharts (charts)
- Lucide React (icons)
- Sonner (toasts)
- next-themes (dark mode)

---

## 12. Feature Status

| Feature | Status |
|---------|--------|
| Authentication (Email + OAuth) | Complete |
| Role Selection | Complete |
| Founder Dashboard | Complete |
| Partner Dashboard | Complete |
| Application Form | Complete |
| Interview UI | Complete |
| Portfolio Management | Complete |
| Mentor Matching UI | Complete |
| Metrics Dashboard | Complete |
| Checkpoint Tracking | Complete |
| Document Management | Complete |
| Request System | Complete |
| Shared Views | Complete |
| Settings Pages | Complete |

---

## 13. Future Roadmap

### Phase 2 (Post-MVP)
- [ ] Database integration (PostgreSQL/Supabase)
- [ ] AI interview integration (Claude API)
- [ ] Automated assessment generation
- [ ] Real-time notifications
- [ ] Email notifications

### Phase 3 (Scale)
- [ ] Team/workspace management
- [ ] Advanced reporting & exports
- [ ] Public API
- [ ] Mobile app
- [ ] Audit logging

---

## 14. Sample Data

### Startups in Demo
- TechFlow AI (AI/ML, San Francisco)
- GreenCommute (Climate, London)
- HealthBridge (Healthtech, Boston)
- FinLit (Fintech, NYC)

### Mentors in Demo
- Alex Rivera (Fundraising, PMF, Sales)
- Dr. Maya Patel (Sales, Customer Acquisition)
- James Chen (Technical Architecture, Hiring)
- Sarah Mitchell (Marketing, Growth)
- Marcus Johnson (Operations, Unit Economics)

---

## 15. Environment Variables

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3005
NEXTAUTH_SECRET=your-secret-key

# OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_ID=
GITHUB_SECRET=

# Supabase (optional - for database)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## 16. Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
open http://localhost:3005

# Login with demo account
# Email: sarah@techflow.ai
# Password: demo
```

---

**Document Version:** 1.0
**Last Updated:** February 2, 2026
