# SANCTUARY DASHBOARD — Changelog

All notable changes to this project will be documented in this file.

---

## [0.1.0] - 2026-02-01

### Project Initialization

#### Added
- **Next.js 14 Project**
  - App Router with TypeScript
  - Tailwind CSS v4
  - ESLint configuration
  - Import alias `@/*`

- **Core Dependencies**
  - `zustand` — State management
  - `@tanstack/react-query` — Data fetching
  - `lucide-react` — Icons
  - `date-fns` — Date utilities
  - `zod` — Schema validation
  - `react-hook-form` — Form handling
  - `@hookform/resolvers` — Form validation

- **shadcn/ui Components**
  - button, card, input, label, select, textarea
  - table, tabs, dialog, sheet, dropdown-menu
  - avatar, badge, separator, skeleton
  - progress, tooltip, scroll-area, sonner

- **Folder Structure**
  ```
  src/
  ├── app/
  │   ├── (auth)/login/
  │   └── (dashboard)/
  │       ├── portfolio/
  │       ├── startup/[id]/
  │       ├── programme/
  │       └── settings/
  ├── components/
  │   ├── ui/          # shadcn components
  │   ├── layout/      # sidebar, header
  │   ├── portfolio/   # startup cards, lists
  │   ├── startup/     # profile components
  │   └── programme/   # checkpoint components
  ├── lib/
  │   ├── mock-data/   # sample data
  │   ├── hooks/       # custom hooks
  │   ├── stores/      # zustand stores
  │   └── utils.ts     # utility functions
  └── types/           # TypeScript types
  ```

- **Documentation**
  - `docs/TRACKER.md` — Task tracking
  - `docs/FEATURES.md` — Feature documentation
  - `docs/CHANGELOG.md` — This file
  - `docs/DATA_MODEL.md` — Schema documentation

#### Technical Notes
- Using Next.js App Router for routing
- Tailwind CSS v4 with CSS variables for theming
- shadcn/ui for consistent component design
- Mock data layer for frontend-first development

---

## Upcoming

### [0.2.0] - MVP Core UI
- Auth UI (login page, role selection)
- Dashboard layout (sidebar, header)
- Portfolio view (grid + list)
- Startup profile page
- Founder profiles

### [0.3.0] - MVP Complete
- Checkpoint tracking
- Manual scoring system
- Search and filters
- Edit capabilities

---

## Version History

| Version | Date | Phase | Description |
|---------|------|-------|-------------|
| 0.1.0 | 2026-02-01 | MVP | Project initialization |
| 0.2.0 | TBD | MVP | Core UI components |
| 0.3.0 | TBD | MVP | MVP complete |
| 0.4.0 | TBD | Phase 2 | Metrics + Mentors |
| 0.5.0 | TBD | Phase 2 | Documents + Notifications |
| 0.6.0 | TBD | Phase 3 | AI Agents |
| 1.0.0 | TBD | Phase 3 | Full release |
