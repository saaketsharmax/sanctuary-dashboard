import type { Startup, StartupWithFounders } from '@/types'
import { getFoundersByStartupId } from './founders'

export const startups: Startup[] = [
  {
    id: 'startup-1',
    slug: 'techflow-ai',
    name: 'TechFlow AI',
    logoUrl: null,
    oneLiner: 'MLOps platform that makes deploying AI models as easy as deploying websites',
    description:
      'TechFlow AI provides enterprise-grade MLOps infrastructure that reduces model deployment time from weeks to hours. Our platform handles versioning, monitoring, and scaling automatically.',
    cohortId: 'cohort-1',
    industry: 'AI/ML',
    subIndustry: 'MLOps',
    businessModel: 'B2B',
    stage: 'user_value',
    city: 'San Francisco',
    country: 'USA',
    timezone: 'America/Los_Angeles',
    website: 'https://techflow.ai',
    demoUrl: 'https://demo.techflow.ai',
    pitchDeckUrl: null,
    problemStatement:
      'Enterprises waste 80% of ML engineering time on deployment and maintenance, not building models.',
    solutionDescription:
      'One-click deployment platform with automatic scaling, monitoring, and rollback capabilities.',
    targetCustomer: 'ML teams at enterprises with 50+ engineers',
    status: 'active',
    residencyStart: '2026-02-01',
    residencyEnd: '2026-06-30',
    founderScore: 85,
    problemScore: 78,
    userValueScore: 72,
    executionScore: 80,
    overallScore: 78,
    riskLevel: 'low',
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'startup-2',
    slug: 'greencommute',
    name: 'GreenCommute',
    logoUrl: null,
    oneLiner: 'Carbon accounting for corporate commute and travel',
    description:
      'GreenCommute helps companies track, reduce, and offset their Scope 3 emissions from employee commuting and business travel. Integrates with HR and expense systems.',
    cohortId: 'cohort-1',
    industry: 'Climate',
    subIndustry: 'Carbon Accounting',
    businessModel: 'B2B',
    stage: 'solution_shaping',
    city: 'London',
    country: 'UK',
    timezone: 'Europe/London',
    website: 'https://greencommute.co',
    demoUrl: null,
    pitchDeckUrl: null,
    problemStatement:
      'Companies are mandated to report Scope 3 emissions but have no way to accurately measure commute impact.',
    solutionDescription:
      'Automated carbon tracking integrated with calendar, expense, and HR systems.',
    targetCustomer: 'Sustainability teams at companies with 500+ employees',
    status: 'active',
    residencyStart: '2026-02-01',
    residencyEnd: '2026-06-30',
    founderScore: 75,
    problemScore: 82,
    userValueScore: 58,
    executionScore: 65,
    overallScore: 70,
    riskLevel: 'normal',
    createdAt: '2026-01-22T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'startup-3',
    slug: 'healthbridge',
    name: 'HealthBridge',
    logoUrl: null,
    oneLiner: 'Patient-provider communication platform for better health outcomes',
    description:
      'HealthBridge connects patients with their care teams through secure messaging, appointment management, and health tracking. Reduces no-shows by 40% and improves medication adherence.',
    cohortId: 'cohort-1',
    industry: 'Healthtech',
    subIndustry: 'Patient Engagement',
    businessModel: 'B2B',
    stage: 'growth',
    city: 'Boston',
    country: 'USA',
    timezone: 'America/New_York',
    website: 'https://healthbridge.io',
    demoUrl: 'https://demo.healthbridge.io',
    pitchDeckUrl: null,
    problemStatement:
      'Poor patient-provider communication leads to 125,000 preventable deaths annually in the US.',
    solutionDescription:
      'HIPAA-compliant communication platform with EHR integration and smart reminders.',
    targetCustomer: 'Mid-size healthcare practices (10-100 providers)',
    status: 'active',
    residencyStart: '2026-02-01',
    residencyEnd: '2026-06-30',
    founderScore: 90,
    problemScore: 88,
    userValueScore: 82,
    executionScore: 75,
    overallScore: 84,
    riskLevel: 'low',
    createdAt: '2026-01-23T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'startup-4',
    slug: 'finlit',
    name: 'FinLit',
    logoUrl: null,
    oneLiner: 'Gamified financial literacy for Gen Z',
    description:
      'FinLit teaches financial concepts through bite-sized games and challenges. Users learn budgeting, investing, and credit management while earning rewards.',
    cohortId: 'cohort-1',
    industry: 'Edtech',
    subIndustry: 'Financial Education',
    businessModel: 'B2C',
    stage: 'problem_discovery',
    city: 'New York',
    country: 'USA',
    timezone: 'America/New_York',
    website: 'https://finlit.app',
    demoUrl: null,
    pitchDeckUrl: null,
    problemStatement:
      'Only 17% of teens can pass a basic financial literacy test. Schools don\'t teach money skills.',
    solutionDescription:
      'Mobile app with daily challenges, social features, and real-world rewards for learning.',
    targetCustomer: '16-24 year olds starting their financial journey',
    status: 'active',
    residencyStart: '2026-02-01',
    residencyEnd: '2026-06-30',
    founderScore: 70,
    problemScore: 65,
    userValueScore: 45,
    executionScore: 55,
    overallScore: 58,
    riskLevel: 'elevated',
    createdAt: '2026-01-24T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'startup-5',
    slug: 'buildright',
    name: 'BuildRight',
    logoUrl: null,
    oneLiner: 'Project management platform built for construction',
    description:
      'BuildRight digitizes construction project management with real-time collaboration, progress tracking, and automated compliance documentation.',
    cohortId: 'cohort-1',
    industry: 'Enterprise',
    subIndustry: 'Construction Tech',
    businessModel: 'B2B',
    stage: 'user_value',
    city: 'Austin',
    country: 'USA',
    timezone: 'America/Chicago',
    website: 'https://buildright.co',
    demoUrl: 'https://app.buildright.co/demo',
    pitchDeckUrl: null,
    problemStatement:
      'Construction projects run 80% over budget on average due to poor coordination and documentation.',
    solutionDescription:
      'Cloud platform connecting office and field teams with real-time updates and AI-powered scheduling.',
    targetCustomer: 'General contractors managing $10M-$100M projects',
    status: 'active',
    residencyStart: '2026-02-01',
    residencyEnd: '2026-06-30',
    founderScore: 88,
    problemScore: 85,
    userValueScore: 76,
    executionScore: 82,
    overallScore: 82,
    riskLevel: 'low',
    createdAt: '2026-01-25T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
]

export function getStartupById(id: string): Startup | undefined {
  return startups.find((s) => s.id === id)
}

export function getStartupBySlug(slug: string): Startup | undefined {
  return startups.find((s) => s.slug === slug)
}

export function getStartupWithFounders(id: string): StartupWithFounders | undefined {
  const startup = getStartupById(id)
  if (!startup) return undefined

  return {
    ...startup,
    founders: getFoundersByStartupId(id),
  }
}

export function getStartupsByCohort(cohortId: string): Startup[] {
  return startups.filter((s) => s.cohortId === cohortId)
}

export function getStartupsByStage(stage: Startup['stage']): Startup[] {
  return startups.filter((s) => s.stage === stage)
}

export function getStartupsByRiskLevel(riskLevel: Startup['riskLevel']): Startup[] {
  return startups.filter((s) => s.riskLevel === riskLevel)
}

export function getAllStartupsWithFounders(): StartupWithFounders[] {
  return startups.map((startup) => ({
    ...startup,
    founders: getFoundersByStartupId(startup.id),
  }))
}
