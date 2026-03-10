// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY — Memo Generator Zod Schema
// ═══════════════════════════════════════════════════════════════════════════

import { z } from 'zod'

const riskSchema = z.object({
  title: z.string(),
  description: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  source: z.enum(['assessment', 'research', 'interview']),
  mitigation: z.string().nullable(),
})

export const memoOutputSchema = z.object({
  executiveSummary: z.object({
    oneLiner: z.string(),
    recommendation: z.enum(['strong_accept', 'accept', 'conditional', 'lean_decline', 'decline']),
    confidence: z.number(),
    keyThesis: z.string(),
    criticalRisks: z.array(z.string()),
  }),
  founderProfile: z.object({
    summary: z.string(),
    backgrounds: z.array(z.object({
      name: z.string(),
      role: z.string(),
      background: z.string(),
      domainExpertise: z.array(z.string()),
      validatedViaLinkedIn: z.boolean(),
    })),
    teamDynamics: z.string(),
    gaps: z.array(z.string()),
    score: z.number(),
    scoreReasoning: z.string(),
  }),
  problemAndMarket: z.object({
    problemStatement: z.string(),
    icp: z.object({
      description: z.string(),
      painPoints: z.array(z.string()),
      currentSolutions: z.array(z.string()),
      willingnessToPay: z.string(),
    }),
    marketSize: z.object({
      tam: z.string(),
      sam: z.string(),
      som: z.string(),
      methodology: z.string(),
    }),
    validationEvidence: z.array(z.string()),
    score: z.number(),
    scoreReasoning: z.string(),
  }),
  solutionAndTraction: z.object({
    productDescription: z.string(),
    differentiation: z.array(z.string()),
    currentMetrics: z.object({
      users: z.number().nullable(),
      mrr: z.number().nullable(),
      growth: z.string(),
      retention: z.string(),
    }),
    evidenceQuality: z.string(),
    score: z.number(),
    scoreReasoning: z.string(),
  }),
  competitiveLandscape: z.object({
    directCompetitors: z.array(z.object({
      name: z.string(),
      description: z.string(),
      funding: z.string(),
      positioning: z.string(),
      threatLevel: z.enum(['low', 'medium', 'high']),
    })),
    indirectAlternatives: z.array(z.string()),
    positioning: z.string(),
    sustainableAdvantage: z.string(),
  }),
  executionAssessment: z.object({
    shippingVelocity: z.string(),
    decisionQuality: z.string(),
    resourceEfficiency: z.string(),
    teamGaps: z.array(z.string()),
    score: z.number(),
    scoreReasoning: z.string(),
  }),
  riskAnalysis: z.object({
    redFlags: z.array(riskSchema),
    marketRisks: z.array(riskSchema),
    executionRisks: z.array(riskSchema),
    mitigationStrategies: z.array(z.string()),
  }),
  recommendation: z.object({
    decision: z.string(),
    confidence: z.number(),
    keyQuestions: z.array(z.string()),
    suggestedNextSteps: z.array(z.string()),
  }),
  appendix: z.object({
    signalsSummary: z.object({
      positiveSignals: z.number(),
      negativeSignals: z.number(),
      totalQuotes: z.number(),
      strongestSignals: z.array(z.string()),
    }),
    researchSources: z.array(z.string()),
  }),
})
