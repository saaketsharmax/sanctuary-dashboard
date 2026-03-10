// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY — Matchmaking Zod Schema
// ═══════════════════════════════════════════════════════════════════════════

import { z } from 'zod'

const matchScoreDimensionSchema = z.object({
  score: z.number(),
  weight: z.number(),
  reasoning: z.string(),
})

const matchScoreSchema = z.object({
  overallScore: z.number(),
  dimensions: z.object({
    expertiseAlignment: matchScoreDimensionSchema,
    stageRelevance: matchScoreDimensionSchema,
    industryFit: matchScoreDimensionSchema,
    availabilityMatch: matchScoreDimensionSchema,
    trackRecordStrength: matchScoreDimensionSchema,
    personalityFit: matchScoreDimensionSchema,
  }),
  confidence: z.enum(['high', 'medium', 'low']),
  reasoning: z.string(),
  potentialChallenges: z.array(z.string()),
  suggestedEngagementFormat: z.enum(['weekly_1on1', 'biweekly_1on1', 'monthly_advisory', 'project_based', 'on_demand']),
  expectedOutcomes: z.array(z.string()),
})

const matchResultSchema = z.object({
  candidateId: z.string(),
  score: matchScoreSchema,
})

export const matchmakingOutputSchema = z.object({
  matches: z.array(matchResultSchema),
  searchStrategy: z.string(),
  marketplaceInsights: z.object({
    averageScore: z.number(),
    gapAnalysis: z.array(z.string()),
    recommendations: z.array(z.string()),
  }),
})
