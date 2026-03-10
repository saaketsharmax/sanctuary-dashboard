// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY — God Mode DD Zod Schema
// ═══════════════════════════════════════════════════════════════════════════

import { z } from 'zod'

export const godModeDDOutputSchema = z.object({
  behavioralFingerprint: z.object({
    confidenceConsistency: z.number(),
    specificityScore: z.number(),
    deflectionPatterns: z.array(z.object({
      topic: z.string(),
      deflectionType: z.enum(['blame_external', 'pivot_topic', 'vague_response', 'hypothetical_answer']),
      count: z.number(),
      examples: z.array(z.string()),
    })),
    responseLatencySignals: z.array(z.object({
      section: z.string(),
      avgResponseTime: z.number(),
      anomalies: z.array(z.string()),
    })),
    emotionalArcMap: z.array(z.object({
      section: z.string(),
      sentiment: z.enum(['passionate', 'confident', 'uncertain', 'defensive', 'evasive']),
      intensity: z.number(),
      keyMoments: z.array(z.string()),
    })),
    deceptionRiskScore: z.number(),
    authenticityMarkers: z.array(z.string()),
    founderArchetype: z.string(),
  }),
  signalConsistency: z.object({
    overallConsistency: z.number(),
    sourceComparisons: z.array(z.object({
      source1: z.string(),
      source2: z.string(),
      consistentClaims: z.number(),
      inconsistentClaims: z.number(),
      contradictions: z.array(z.object({
        claim: z.string(),
        source1Says: z.string(),
        source2Says: z.string(),
        severity: z.enum(['minor', 'major', 'critical']),
      })),
    })),
    storyEvolutionTracker: z.array(z.object({
      claim: z.string(),
      applicationVersion: z.string(),
      interviewVersion: z.string(),
      delta: z.string(),
      interpretation: z.enum(['natural_refinement', 'concerning_shift', 'outright_contradiction']),
    })),
    trustScore: z.number(),
  }),
  revenueQuality: z.object({
    score: z.number(),
    concentration: z.object({
      top1CustomerPct: z.number(),
      top3CustomerPct: z.number(),
      risk: z.enum(['low', 'medium', 'high']),
    }),
    expansionPotential: z.number(),
    churnPrediction: z.object({ estimatedMonthlyChurn: z.number(), basis: z.string() }),
    revenueType: z.enum(['recurring', 'transactional', 'usage_based', 'hybrid']),
    pricingPowerIndicators: z.array(z.string()),
    revenueHealthGrade: z.enum(['A', 'B', 'C', 'D', 'F']),
    organicVsPaid: z.object({ estimatedOrganicPct: z.number(), basis: z.string() }),
  }),
  capitalEfficiency: z.object({
    burnMultiple: z.number(),
    predictedRunway: z.number(),
    efficiencyScore: z.number(),
    teamCostRatio: z.number(),
    suggestedBurnRate: z.object({ amount: z.number(), basis: z.string() }),
    comparableCompanies: z.array(z.object({
      name: z.string(),
      burnMultipleAtSameStage: z.number(),
      outcome: z.string(),
    })),
    capitalStrategy: z.string(),
  }),
  networkEffectPotential: z.object({
    score: z.number(),
    type: z.enum(['none', 'weak_indirect', 'strong_indirect', 'direct', 'data_network', 'marketplace']),
    evidenceFromProduct: z.array(z.string()),
    lockInMechanisms: z.array(z.string()),
    switchingCostEstimate: z.enum(['trivial', 'low', 'medium', 'high', 'very_high']),
    viralCoefficient: z.object({ estimated: z.number(), basis: z.string() }),
    dataFlywheel: z.object({ exists: z.boolean(), description: z.string(), strength: z.number() }),
  }),
  moatDurability: z.object({
    currentMoatScore: z.number(),
    projectedMoatIn12Months: z.number(),
    projectedMoatIn36Months: z.number(),
    moatTypes: z.array(z.object({
      type: z.string(),
      strength: z.number(),
      durability: z.enum(['increasing', 'stable', 'eroding']),
      evidence: z.string(),
    })),
    biggestMoatThreat: z.string(),
    timeToCompetitorParity: z.object({ months: z.number(), basis: z.string() }),
    moatTrajectory: z.enum(['strengthening', 'stable', 'weakening']),
  }),
  marketTiming: z.object({
    score: z.number(),
    technologyReadiness: z.object({ score: z.number(), enablers: z.array(z.string()) }),
    regulatoryTailwinds: z.object({ score: z.number(), factors: z.array(z.string()) }),
    economicCycleAlignment: z.object({ score: z.number(), reasoning: z.string() }),
    competitorActivitySignal: z.object({
      recentFundings: z.number(),
      totalRaised: z.string(),
      signal: z.enum(['heating_up', 'established', 'cooling', 'nascent']),
    }),
    adoptionCurvePosition: z.enum(['innovators', 'early_adopters', 'early_majority', 'late_majority']),
    timingVerdict: z.string(),
    windowOfOpportunity: z.object({ months: z.number(), reasoning: z.string() }),
  }),
  contrarianSignals: z.object({
    unconventionalStrengths: z.array(z.object({
      signal: z.string(),
      whyCounterIntuitive: z.string(),
      historicalPrecedent: z.string(),
      potentialUpside: z.string(),
    })),
    hiddenRisks: z.array(z.object({
      signal: z.string(),
      whyOverlooked: z.string(),
      potentialDownside: z.string(),
    })),
    nonObviousPatterns: z.array(z.object({
      pattern: z.string(),
      dataPoints: z.array(z.string()),
      implication: z.string(),
    })),
    founderEdgeCases: z.array(z.object({
      trait: z.string(),
      conventionalView: z.string(),
      actualCorrelation: z.string(),
    })),
  }),
  patternMatch: z.object({
    closestHistoricalMatches: z.array(z.object({
      companyName: z.string(),
      similarity: z.number(),
      outcome: z.string(),
      keyParallels: z.array(z.string()),
      keyDifferences: z.array(z.string()),
    })),
    archetypeMatch: z.object({
      archetype: z.string(),
      description: z.string(),
      typicalOutcome: z.string(),
      survivalRate: z.number(),
    }),
    outlierFactors: z.array(z.string()),
  }),
  alphaSignals: z.array(z.string()),
  blindSpots: z.array(z.string()),
  oneLineVerdict: z.string(),
  memoAddendum: z.string(),
})
