# Changelog

All notable changes to the Sanctuary Dashboard will be documented in this file.

## [0.3.0] - 2026-02-02

### Added
- **Landing Page**: New role selection landing page at `/` with Founder and Partner options
- **Bifurcated User Flow**: Separate dashboard experiences for Founders and Partners
- **Founder Portal** (`/founder/*`):
  - Dashboard with company overview, metrics, and quick actions
  - Company profile management
  - Document upload system
  - Mentor/support request system
  - Metrics view (read-only)
  - Progress tracking
  - Settings page
- **Partner Portal** (`/partner/*`):
  - Dashboard with portfolio overview, pending applications, at-risk alerts
  - Portfolio management
  - Metrics and analytics
  - Mentor database
  - Mentor-startup matching
  - Application review system
  - Shared views management
  - Settings page
- **Switch UI Component**: Added `@radix-ui/react-switch` for settings toggles

### Changed
- Simplified auth system to role-based store (no login required)
- Removed authentication checks from layouts
- Updated dashboards to use mock user data directly
- Restructured routes from `/(dashboard)/*` to `/founder/*` and `/partner/*`

### Archived
- Old auth system (`/src/app/_archived/auth/`)
- Old dashboard routes (`/src/app/_archived/(dashboard)_old/`)

---

## [0.2.0] - 2026-02-02

### Added
- **AI Interview System**: Claude API integration for founder interviews
- **Interview API Route**: `/api/interview/chat` endpoint
- **Mock Fallback Mode**: Demo mode when API key unavailable
- **Claude Interview Agent**: `src/lib/ai/agents/claude-interview-agent.ts`

### Changed
- InterviewChat component now calls API instead of mock agent directly
- Added mode indicator (AI/Demo) badge to interview UI

---

## [0.1.0] - 2026-02-01

### Added
- Initial MVP with portfolio management
- Startup profiles and founder details
- Checkpoint tracking system
- Scoring and risk assessment
- Metrics dashboard with charts
- Mentor database and matching system
- Onboarding flow with application and interview
- Mock data for all entities

---

## Version Format

This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes (backwards compatible)
