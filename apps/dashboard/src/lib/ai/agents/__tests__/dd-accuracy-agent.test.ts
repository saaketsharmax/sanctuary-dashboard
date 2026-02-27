import { describe, it, expect } from 'vitest'
import { DDAccuracyAgent } from '../dd-accuracy-agent'
import type { DDAccuracyInput } from '../../types/dd-accuracy'

function createTestInput(overrides: Partial<DDAccuracyInput> = {}): DDAccuracyInput {
  return {
    decisions: [
      {
        applicationId: 'app-1',
        ddVerdict: 'invest',
        ddScore: 75,
        ddConfidence: 0.85,
        partnerDecision: 'approved',
        partnerAgreed: true,
        scoreAdjustments: { founder: 5, problem: -3, userValue: 0, execution: 2 },
        outcome: 'active',
        decisionDate: '2026-01-15',
      },
      {
        applicationId: 'app-2',
        ddVerdict: 'pass',
        ddScore: 35,
        ddConfidence: 0.7,
        partnerDecision: 'rejected',
        partnerAgreed: true,
        scoreAdjustments: { founder: 0, problem: 0, userValue: 0, execution: 0 },
        outcome: 'failed',
        decisionDate: '2026-01-20',
      },
      {
        applicationId: 'app-3',
        ddVerdict: 'invest',
        ddScore: 68,
        ddConfidence: 0.6,
        partnerDecision: 'approved',
        partnerAgreed: false,
        scoreAdjustments: { founder: -10, problem: 5, userValue: 8, execution: -5 },
        outcome: 'dropped_out',
        decisionDate: '2026-02-01',
      },
      {
        applicationId: 'app-4',
        ddVerdict: 'conditional_invest',
        ddScore: 55,
        ddConfidence: 0.5,
        partnerDecision: 'approved',
        partnerAgreed: true,
        scoreAdjustments: { founder: 0, problem: 0, userValue: 0, execution: 0 },
        decisionDate: '2026-02-10',
      },
    ],
    claimVerifications: [
      { claimId: 'c-1', aiVerdict: 'confirmed', aiConfidence: 0.9, actualOutcome: 'confirmed' },
      { claimId: 'c-2', aiVerdict: 'disputed', aiConfidence: 0.7, actualOutcome: 'disputed' },
      { claimId: 'c-3', aiVerdict: 'confirmed', aiConfidence: 0.8, actualOutcome: 'refuted' },
    ],
    signalHistory: [
      { signalType: 'interview_confidence', dimension: 'founder', impact: 7, applicationOutcome: 'active' },
      { signalType: 'market_validation', dimension: 'problem', impact: 8, applicationOutcome: 'active' },
      { signalType: 'interview_confidence', dimension: 'founder', impact: 3, applicationOutcome: 'failed' },
    ],
    ...overrides,
  }
}

describe('DDAccuracyAgent', () => {
  const agent = new DDAccuracyAgent()

  describe('calculateAccuracyMetrics', () => {
    it('calculates overall accuracy correctly', async () => {
      const input = createTestInput()
      const metrics = await agent.calculateAccuracyMetrics(input)

      expect(metrics.totalDecisions).toBe(4)
      expect(metrics.overallAccuracy).toBeGreaterThanOrEqual(0)
      expect(metrics.overallAccuracy).toBeLessThanOrEqual(100)
    })

    it('calculates prediction accuracy for invest recommendations', async () => {
      const input = createTestInput()
      const metrics = await agent.calculateAccuracyMetrics(input)

      // 3 invest/conditional_invest verdicts (app-1 active=correct, app-3 dropped_out=incorrect, app-4 conditional no outcome)
      expect(metrics.predictionAccuracy.investRecommendations.total).toBe(3)
      expect(metrics.predictionAccuracy.investRecommendations.correctOutcomes).toBe(1) // only app-1 is active
    })

    it('calculates prediction accuracy for pass recommendations', async () => {
      const input = createTestInput()
      const metrics = await agent.calculateAccuracyMetrics(input)

      // 1 pass verdict (app-2 failed=correct)
      expect(metrics.predictionAccuracy.passRecommendations.total).toBe(1)
      expect(metrics.predictionAccuracy.passRecommendations.correctOutcomes).toBe(1)
      expect(metrics.predictionAccuracy.passRecommendations.accuracy).toBe(100)
    })

    it('calculates conditional recommendations', async () => {
      const input = createTestInput()
      const metrics = await agent.calculateAccuracyMetrics(input)

      expect(metrics.predictionAccuracy.conditionalRecommendations.total).toBe(1)
      expect(metrics.predictionAccuracy.conditionalRecommendations.resolvedPositive).toBe(1) // approved
    })

    it('handles empty input gracefully', async () => {
      const input = createTestInput({
        decisions: [],
        claimVerifications: [],
        signalHistory: [],
      })
      const metrics = await agent.calculateAccuracyMetrics(input)

      expect(metrics.totalDecisions).toBe(0)
      expect(metrics.overallAccuracy).toBe(0)
      expect(metrics.predictionAccuracy.investRecommendations.total).toBe(0)
    })
  })

  describe('confidence calibration', () => {
    it('distributes decisions into correct confidence buckets', async () => {
      const input = createTestInput()
      const metrics = await agent.calculateAccuracyMetrics(input)

      expect(metrics.confidenceCalibration).toHaveLength(5) // 5 buckets
      const totalSamples = metrics.confidenceCalibration.reduce((s, b) => s + b.sampleSize, 0)
      expect(totalSamples).toBe(4) // all 4 decisions
    })

    it('calculates calibration error as absolute difference', async () => {
      const input = createTestInput()
      const metrics = await agent.calculateAccuracyMetrics(input)

      for (const bucket of metrics.confidenceCalibration) {
        expect(bucket.calibrationError).toBeGreaterThanOrEqual(0)
        expect(bucket.calibrationError).toBeLessThanOrEqual(100)
      }
    })
  })

  describe('partner overrides', () => {
    it('calculates agreement rate', async () => {
      const input = createTestInput()
      const metrics = await agent.calculateAccuracyMetrics(input)

      // 3 out of 4 agreed
      expect(metrics.partnerOverrides.agreementRate).toBe(75)
      expect(metrics.partnerOverrides.totalReviews).toBe(4)
    })

    it('identifies dimension override patterns', async () => {
      const input = createTestInput()
      const metrics = await agent.calculateAccuracyMetrics(input)

      // Check that dimension overrides are calculated for founder, problem, userValue, execution
      expect(metrics.partnerOverrides.dimensionOverrides.length).toBeGreaterThan(0)

      const founderOverride = metrics.partnerOverrides.dimensionOverrides.find(
        (d) => d.dimension === 'founder',
      )
      expect(founderOverride).toBeDefined()
      // founder has adjustments: 5, 0, -10, 0 → 2 non-zero → override rate = 50%
      expect(founderOverride!.overrideRate).toBe(50)
    })
  })

  describe('signal effectiveness', () => {
    it('groups signals by type and dimension', async () => {
      const input = createTestInput()
      const metrics = await agent.calculateAccuracyMetrics(input)

      expect(metrics.signalEffectiveness.length).toBeGreaterThan(0)

      const founderSignal = metrics.signalEffectiveness.find(
        (s) => s.signalType === 'interview_confidence' && s.dimension === 'founder',
      )
      expect(founderSignal).toBeDefined()
      expect(founderSignal!.frequency).toBe(2) // 2 signals of this type
    })

    it('calculates predictive power as success ratio', async () => {
      const input = createTestInput()
      const metrics = await agent.calculateAccuracyMetrics(input)

      for (const signal of metrics.signalEffectiveness) {
        expect(signal.predictivePower).toBeGreaterThanOrEqual(0)
        expect(signal.predictivePower).toBeLessThanOrEqual(1)
      }
    })
  })

  describe('drift detection', () => {
    it('detects no drift with insufficient data', async () => {
      const input = createTestInput({ decisions: [createTestInput().decisions[0]] })
      const metrics = await agent.calculateAccuracyMetrics(input)

      expect(metrics.driftMetrics.alertLevel).toBe('normal')
      expect(metrics.driftMetrics.scoreDistributionShift).toBe(0)
    })

    it('calculates score distribution shift between halves', async () => {
      const input = createTestInput()
      const metrics = await agent.calculateAccuracyMetrics(input)

      expect(metrics.driftMetrics.scoreDistributionShift).toBeGreaterThanOrEqual(0)
      expect(metrics.driftMetrics.lastChecked).toBeDefined()
    })

    it('sets correct alert level based on drift magnitude', async () => {
      const input = createTestInput()
      const metrics = await agent.calculateAccuracyMetrics(input)

      expect(['normal', 'warning', 'critical']).toContain(metrics.driftMetrics.alertLevel)
    })
  })

  describe('claim verification accuracy', () => {
    it('calculates verdict accuracy per verdict type', async () => {
      const input = createTestInput()
      const metrics = await agent.calculateAccuracyMetrics(input)

      expect(metrics.claimVerificationAccuracy.totalClaimsVerified).toBe(3)

      const confirmedVerdict = metrics.claimVerificationAccuracy.verdictAccuracy.find(
        (v) => v.verdict === 'confirmed',
      )
      expect(confirmedVerdict).toBeDefined()
      expect(confirmedVerdict!.totalPredictions).toBe(2) // c-1 and c-3
      expect(confirmedVerdict!.confirmedCorrect).toBe(1) // only c-1 matches
    })
  })

  describe('performance over time', () => {
    it('groups decisions by week', async () => {
      const input = createTestInput()
      const metrics = await agent.calculateAccuracyMetrics(input)

      expect(metrics.performanceOverTime.length).toBeGreaterThan(0)

      for (const period of metrics.performanceOverTime) {
        expect(period.period).toMatch(/^\d{4}-W\d{2}$/)
        expect(period.decisionsCount).toBeGreaterThan(0)
      }
    })
  })

  describe('generateInsights', () => {
    it('generates deterministic insights without API key', async () => {
      const input = createTestInput()
      const metrics = await agent.calculateAccuracyMetrics(input)
      const insights = await agent.generateInsights(metrics)

      expect(insights.length).toBeGreaterThan(0)
      expect(insights.every((i) => typeof i === 'string')).toBe(true)
    })

    it('flags low agreement rate', async () => {
      // Create input where only 1 out of 4 agrees
      const input = createTestInput({
        decisions: createTestInput().decisions.map((d, i) => ({
          ...d,
          partnerAgreed: i === 0, // only first agrees
        })),
      })
      const metrics = await agent.calculateAccuracyMetrics(input)
      const insights = await agent.generateInsights(metrics)

      const hasAgreementInsight = insights.some((i) => i.includes('agreement rate'))
      expect(hasAgreementInsight).toBe(true)
    })
  })
})
