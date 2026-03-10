// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY — Programme Agent Zod Schema
// ═══════════════════════════════════════════════════════════════════════════

import { z } from 'zod'

const milestoneSchema = z.object({
  weekNumber: z.number(),
  category: z.enum(['product', 'growth', 'fundraise', 'team', 'operations', 'market']),
  title: z.string(),
  description: z.string(),
  successCriteria: z.array(z.string()),
  kpiTargets: z.array(z.object({
    metric: z.string(),
    target: z.union([z.number(), z.string()]),
    unit: z.string(),
    baseline: z.union([z.number(), z.string()]).optional(),
  })),
  mentorSupportNeeded: z.array(z.string()),
  resources: z.array(z.string()),
  dependencies: z.array(z.string()),
})

const phaseSchema = z.object({
  name: z.string(),
  weeks: z.string(),
  focus: z.string(),
  milestones: z.array(milestoneSchema),
})

export const programmeOutputSchema = z.object({
  phases: z.array(phaseSchema),
  mentorMatchingTriggers: z.array(z.object({
    milestone: z.string(),
    expertise: z.array(z.string()),
    urgency: z.enum(['immediate', 'this_week', 'next_phase']),
  })),
  weeklyCheckInSchedule: z.array(z.object({
    weekNumber: z.number(),
    focus: z.string(),
    attendees: z.array(z.string()),
  })),
})
