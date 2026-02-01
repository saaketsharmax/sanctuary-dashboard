# Sanctuary Design System

**Version:** 1.0.0
**Last Updated:** 2026-02-02

---

## Overview

Sanctuary's design system embodies a **brutalist, terminal-inspired aesthetic** that communicates precision, security, and technical sophistication. The visual language draws from command-line interfaces, system monitoring dashboards, and data visualization systems.

### Core Principles

1. **Sharp Edges** - No border-radius anywhere. Every element has crisp, 90-degree corners.
2. **Technical Typography** - Monospace fonts for data, system labels, and navigation.
3. **High Contrast** - Deep black backgrounds with cream/off-white text.
4. **Structured Grids** - Technical grid patterns and precise alignment.
5. **Minimal Animation** - Subtle transitions only. No gratuitous effects.
6. **Data-Forward** - Large numbers, metrics displayed prominently.

---

## Color Palette

### Primary Colors

| Token | Hex | CSS Variable | Usage |
|-------|-----|--------------|-------|
| Deep Black | `#050505` | `--deep-black` | Primary background |
| Cream | `#F5F5F0` | `--cream` | Primary text, borders |
| Olive Green | `#808000` | `--olive` | Accent, active states, CTAs |
| Dark Olive | `#556B2F` | `--dark-olive` | Hover state for olive |

### Secondary Colors

| Token | Hex | CSS Variable | Usage |
|-------|-----|--------------|-------|
| Muted Gray | `#2A2A2A` | `--muted-gray` | Secondary backgrounds |
| Data BG | `#0A0A0A` | `--data-bg` | Card backgrounds |
| Grid Line | `rgba(245,245,240,0.15)` | `--grid-line` | Borders, dividers |
| Warning | `#FF3B30` | `--warning` | Alerts, overdue items |

### Opacity Scale

Used with cream color for hierarchy:
- `cream/60` - Secondary text
- `cream/40` - Tertiary text, labels
- `cream/20` - Borders, dividers
- `cream/10` - Subtle borders, backgrounds
- `cream/5` - Hover states

---

## Typography

### Font Families

```css
--font-mono: 'JetBrains Mono', monospace;
--font-sans: 'Inter', sans-serif;
```

### Font Usage

| Context | Font | Weight | Style |
|---------|------|--------|-------|
| Headlines | JetBrains Mono | 800 (extrabold) | Uppercase, tracking-tighter |
| Navigation | JetBrains Mono | 700 (bold) | Uppercase, tracking-widest |
| Labels | JetBrains Mono | 400-500 | Uppercase, tracking-[0.2em] |
| Body Text | Inter | 400 | Normal |
| Data Values | JetBrains Mono | 700-800 | Normal |

### Type Scale

| Name | Size | Line Height | Usage |
|------|------|-------------|-------|
| massive | 8rem-18rem | 0.8-0.85 | Hero scores, massive numbers |
| display-xl | 4rem-6rem | 0.9 | Page titles |
| display-lg | 2rem-3rem | 1.0 | Section headers |
| heading | 1.25rem-1.5rem | 1.2 | Card titles |
| body | 0.875rem | 1.5 | Paragraphs |
| micro | 10px-11px | 1.4 | Labels, metadata |
| nano | 9px | 1.3 | Status text, tiny labels |

### Text Styles

```css
/* Label Caps - Primary label style */
.label-caps {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-family: 'JetBrains Mono', monospace;
}

/* Micro Type - Secondary labels */
.micro-type {
  font-size: 10px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-family: 'JetBrains Mono', monospace;
}
```

---

## Spacing

Based on a 4px grid with emphasis on generous padding:

| Token | Value | Usage |
|-------|-------|-------|
| space-1 | 4px | Tight gaps |
| space-2 | 8px | Icon gaps |
| space-3 | 12px | Small padding |
| space-4 | 16px | Default padding |
| space-6 | 24px | Card padding |
| space-8 | 32px | Section spacing |
| space-10 | 40px | Large padding |
| space-12 | 48px | Page margins |
| space-16 | 64px | Major sections |

---

## Borders & Dividers

### Border Style

```css
.technical-border {
  border: 1px solid rgba(245, 245, 240, 0.15);
}
```

### Border Usage

- Cards: `border border-cream/20` or `border border-cream/10`
- Active/Hover: `border border-olive` or `border border-cream`
- Dividers: `border-b border-cream/10`
- Highlighted: `border-2 border-olive`

### Sharp Edges

**Critical:** All elements must have `border-radius: 0`. Apply globally:

```css
* {
  border-radius: 0 !important;
}
```

---

## Components

### Buttons

#### Primary Button (Olive)
```css
.btn-primary {
  background-color: var(--olive);
  color: var(--deep-black);
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 0.5rem 1.5rem;
  border: none;
  transition: background-color 0.15s;
}
.btn-primary:hover {
  background-color: var(--cream);
}
```

#### Secondary Button (Outline)
```css
.btn-secondary {
  background-color: transparent;
  color: var(--cream);
  border: 1px solid rgba(245, 245, 240, 0.2);
  /* Same typography as primary */
}
.btn-secondary:hover {
  background-color: var(--cream);
  color: var(--deep-black);
}
```

### Cards

```css
.card {
  background-color: var(--data-bg); /* #0A0A0A */
  border: 1px solid rgba(245, 245, 240, 0.15);
  padding: 2.5rem;
}
```

### Inputs

```css
.input {
  background-color: transparent;
  border: 1px solid rgba(245, 245, 240, 0.2);
  color: var(--cream);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  text-transform: uppercase;
  padding: 0.5rem 1rem;
}
.input:focus {
  border-color: var(--olive);
  outline: none;
}
.input::placeholder {
  color: rgba(245, 245, 240, 0.3);
}
```

### Badges/Tags

```css
.badge {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.125rem 0.5rem;
  border: 1px solid rgba(245, 245, 240, 0.2);
}

.badge-olive {
  background-color: var(--olive);
  color: var(--deep-black);
  border: none;
}
```

### Score Blocks

Large metric displays:

```css
.score-block {
  background-color: var(--cream);
  color: var(--deep-black);
  font-family: 'JetBrains Mono', monospace;
  font-weight: 800;
  text-align: center;
  padding: 0.25rem 0;
}
```

### Status Indicators

```css
.status-dot {
  width: 8px;
  height: 8px;
  background-color: var(--olive); /* or var(--warning) for alerts */
}

.status-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
```

---

## Layout Patterns

### Sidebar (Icon-only)

```
┌────┐
│ □  │ ← Logo (olive icon)
├────┤
│ □  │ ← Nav icon (active: olive)
│ □  │ ← Nav icon (inactive: cream/60)
│ □  │
│    │
├────┤
│ □  │ ← Settings
│ ○  │ ← Avatar
└────┘
Width: 64px (w-16)
Border: right border only
```

### Header

```
┌─────────────────────────────────────────────────────────┐
│ [Breadcrumb / Title]          [Search] [Primary Action] │
└─────────────────────────────────────────────────────────┘
Height: ~80px
Border: bottom border only
```

### Stats Grid

```
┌─────────────┬─────────────┬─────────────┐
│ Label       │ Label       │ Label       │
│ 42          │ SUMMER_24   │ 94.2        │
│ /60         │ PHASE:EXEC  │ ↑ trending  │
└─────────────┴─────────────┴─────────────┘
```

### Data Table

```
┌──────────────────────────────────────────────────────────┐
│ Header Row (bg: cream/5, text: cream/40)                 │
├──────────────────────────────────────────────────────────┤
│ Row (hover: bg-cream/5 or bg-[#111])                     │
├──────────────────────────────────────────────────────────┤
│ Row                                                      │
└──────────────────────────────────────────────────────────┘
```

---

## Navigation Patterns

### Breadcrumb

```
Directory / Portfolio / Startup_Name
         ↑         ↑
    cream/40   cream/40  → olive (current)
```

Style: `text-[10px] mono uppercase tracking-[0.3em]`

### Tab Navigation

```
[ACTIVE_TAB]  [Inactive]  [Inactive]
     ↓
border-b-2 border-olive, text-olive
```

### Sidebar Navigation

```
01. Overview      ← cream/40
02. Checkpoints   ← olive (active, underline)
03. Metrics       ← cream/40
04. Documents     ← cream/40
```

---

## Charts & Data Visualization

### Line Charts
- Stroke: `var(--olive)` or `var(--cream)`
- Stroke width: 1-2px
- Background: transparent or subtle grid
- Data points: Small circles on hover

### Radar Charts
- Grid: `stroke: cream, opacity: 0.15`
- Data shape: `fill: olive/15, stroke: olive`

### Progress Bars
```css
.progress-track {
  height: 2px;
  background-color: rgba(245, 245, 240, 0.1);
}
.progress-fill {
  background-color: var(--olive);
}
```

### Technical Grid Background

```css
.technical-grid {
  background-image:
    linear-gradient(to right, #111 1px, transparent 1px),
    linear-gradient(to bottom, #111 1px, transparent 1px);
  background-size: 40px 40px;
}
```

---

## Scrollbar Styling

```css
::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-track {
  background: var(--deep-black);
}
::-webkit-scrollbar-thumb {
  background: var(--cream);
}
```

---

## Animations & Transitions

### Allowed Transitions
- Color/background: `transition-colors` (150ms)
- Opacity: `transition-opacity` (150ms)
- Filter (grayscale): `transition-all` (500ms for reveal effects)

### Hover Effects
- Buttons: Color change only
- Cards: Subtle background shift (`bg-cream/5` or `bg-[#111]`)
- Icons: Grayscale to color on hover
- Links: Color change to olive

### Forbidden
- Transform animations (scale, rotate)
- Bounce/spring effects
- Drop shadows
- Blur effects

---

## Iconography

### Primary Icon Set
Use **Material Symbols Outlined** with these settings:

```css
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 200-400, 'GRAD' 0, 'opsz' 20-24;
}
```

### Icon Sizes
- Navigation: 24px
- Inline: 16-20px
- Small: 14-16px

### Common Icons
- Dashboard: `dashboard`
- Analytics: `analytics`
- Portfolio: `layers` or `grid_view`
- Settings: `settings`
- Search: `search`
- Expand: `expand_more`
- External link: `open_in_new` or `north_east`
- Document: `description` or `draft`
- Warning: `warning` (FILL: 1)
- Check: `check_circle`
- Lock: `lock`

---

## Responsive Behavior

### Breakpoints
- Mobile: `< 768px`
- Tablet: `768px - 1024px`
- Desktop: `> 1024px`
- Wide: `> 1440px`

### Mobile Adaptations
- Hide icon sidebar, use hamburger menu
- Stack stats cards vertically
- Reduce massive typography (8rem → 4rem)
- Full-width tables with horizontal scroll

---

## Copy & Tone

### Naming Conventions
Use technical, system-like naming:
- `SANCTUARY_MGMT_V.4.2`
- `Portfolio.Node_042`
- `STATUS_STABLE`
- `METRIC_ID: REVENUE_MRR`
- `Execution trajectory: 12/20 nodes activated`

### Labels
Always uppercase with underscores:
- `ACTIVE_ENTITIES`
- `Add_New_Entity`
- `Export_Report`
- `GROWTH_STAGE`

### Status Messages
- `System Status: Optimal`
- `SYNC_STATUS: ACTIVE [OK]`
- `STATUS_STABLE`
- `AT_RISK_WARN`
- `CRIT_BLOCKED`

---

## Implementation Checklist

When implementing a new page/component:

- [ ] Background is `#050505` or `#000000`
- [ ] Text is cream (`#F5F5F0`) with proper hierarchy
- [ ] All corners are sharp (no border-radius)
- [ ] Using JetBrains Mono for labels, navigation, data
- [ ] Using Inter for body text only
- [ ] Borders are `cream/10` to `cream/20` opacity
- [ ] Buttons follow primary/secondary patterns
- [ ] Labels are uppercase with proper tracking
- [ ] Numbers/metrics are displayed prominently
- [ ] Hover states are subtle (color changes only)
- [ ] Icons use Material Symbols Outlined

---

## File References

Design source files located at:
```
/design-system-source/stitch/
├── sanctuary_login/
├── partner_portfolio_dashboard/
├── startup_detail_-_overview/
├── startup_detail_-_founders/
├── startup_detail_-_checkpoints/
├── startup_detail_-_metrics/
├── startup_detail_-_documents/
└── programme_timeline_overview/
```

Each folder contains:
- `code.html` - Reference implementation
- `screen.png` - Visual reference

---

*Design System maintained by the Sanctuary Platform Team*
