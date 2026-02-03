# Sanctuary Ecosystem

A monorepo containing all Sanctuary products.

## Structure

```
sanctuary-ecosystem/
├── apps/
│   ├── dashboard/      # app.sanctuary.vc - Portfolio management
│   ├── community/      # community.sanctuary.vc - Events & engagement
│   └── marketing/      # sanctuary.vc - Marketing website
│
├── packages/
│   ├── ui/            # Shared UI components
│   ├── database/      # Supabase client & types
│   └── config/        # Shared configs
│
├── docs/              # Documentation
└── turbo.json         # Turborepo config
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 10+

### Installation

```bash
# Install all dependencies
npm install

# Start all apps in development
npm run dev

# Start specific app
npm run dev:dashboard
npm run dev:community
npm run dev:marketing
```

### Building

```bash
# Build all apps
npm run build

# Build specific app
npm run build:dashboard
```

## Apps

### Dashboard (`apps/dashboard`)
- **URL:** http://localhost:3005
- **Purpose:** Portfolio management, founder/partner portals
- **Status:** Active development

### Community Hub (`apps/community`)
- **URL:** http://localhost:3006
- **Purpose:** Events, engagement, "The Sanctuary Times"
- **Status:** Planned

### Marketing (`apps/marketing`)
- **URL:** http://localhost:3007
- **Purpose:** Public website, applications
- **Status:** Planned

## Packages

### @sanctuary/ui
Shared UI components built with shadcn/ui and Tailwind CSS.

### @sanctuary/database
Supabase client, types, and database utilities.

### @sanctuary/config
Shared TypeScript and ESLint configurations.

## Environment Variables

Each app has its own `.env.local` file. Copy `.env.example` to get started:

```bash
cp apps/dashboard/.env.example apps/dashboard/.env.local
```

## Documentation

- [Ecosystem PRD](./docs/ECOSYSTEM-PRD.md)
- [Changelog](./CHANGELOG.md)
- [Features](./docs/FEATURES.md)
- [Data Model](./docs/DATA_MODEL.md)

## License

Private - Sanctuary VC
