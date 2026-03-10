// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY — Assessment Agent Zod Schema
// Used by generateObject for type-safe structured output
// ═══════════════════════════════════════════════════════════════════════════

import { z } from 'zod'

const evidenceDensitySchema = z.object({
  positiveSignals: z.number(),
  negativeSignals: z.number(),
  quotes: z.number(),
})

const scoringBreakdownItemSchema = z.object({
  signal: z.string(),
  impact: z.number(),
  quote: z.string().optional(),
})

const dimensionScoringBreakdownSchema = z.object({
  baseScore: z.number(),
  signalsApplied: z.array(scoringBreakdownItemSchema),
  finalScore: z.number(),
})

const strengthItemSchema = z.object({
  strength: z.string(),
  evidence: z.string(),
  impact: z.string(),
})

const riskItemSchema = z.object({
  risk: z.string(),
  evidence: z.string(),
  severity: z.enum(['high', 'medium', 'low']),
  mitigation: z.string(),
})

const gapItemSchema = z.object({
  dimension: z.string(),
  missingInfo: z.string(),
  impactOnConfidence: z.number(),
})

export const assessmentOutputSchema = z.object({
  founderScore: z.number(),
  founderReasoning: z.string(),
  problemScore: z.number(),
  problemReasoning: z.string(),
  userValueScore: z.number(),
  userValueReasoning: z.string(),
  executionScore: z.number(),
  executionReasoning: z.string(),
  overallScore: z.number(),

  recommendation: z.enum(['strong_accept', 'accept', 'conditional', 'lean_decline', 'decline']),
  recommendationConfidence: z.number(),
  oneLineSummary: z.string(),

  keyStrengths: z.array(strengthItemSchema),
  keyRisks: z.array(riskItemSchema),
  criticalQuestions: z.array(z.string()),

  primaryNeed: z.string(),
  secondaryNeeds: z.array(z.string()),
  mentorDomains: z.array(z.string()),

  confidence: z.object({
    overall: z.number(),
    founder: z.number(),
    problem: z.number(),
    userValue: z.number(),
    execution: z.number(),
  }),
  evidenceDensity: z.object({
    founder: evidenceDensitySchema,
    problem: evidenceDensitySchema,
    userValue: evidenceDensitySchema,
    execution: evidenceDensitySchema,
  }),
  gapsIdentified: z.array(gapItemSchema),
  scoringBreakdown: z.object({
    founder: dimensionScoringBreakdownSchema,
    problem: dimensionScoringBreakdownSchema,
    userValue: dimensionScoringBreakdownSchema,
    execution: dimensionScoringBreakdownSchema,
  }),
})
