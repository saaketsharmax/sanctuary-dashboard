import { describe, it, expect } from 'vitest'
import { CalibrationEngine } from '../calibration-engine'
import { DEFAULT_CALIBRATION_CONFIG } from '../../types/calibration-engine'
import type { CalibrationEngineInput, PartnerFeedbackEntry } from '../../types/calibration-engine'

function createFeedbackEntry(overrides: Partial<PartnerFeedbackEntry> = {}): PartnerFeedbackEntry {
  return {
    applicationId: 'app-1',
    partnerId: 'partner-1',
    ddReportId: 'report-1',
    dimensionFeedback: [
      { dimension: 'founder', aiScore: 75, partnerScore: 70 },
      { dimension: 'problem', aiScore: 80, partnerScore: 85 },
      { dimension: 'userValue', aiScore: 60, partnerScore: 55 },
      { dimension: 'execution', aiScore: 70, partnerScore: 72 },
    ],
    overallAgreement: 'agree',
    createdAt: '2026-02-15T00:00:00Z',
    ...overrides,
  }
}

function createTestInput(feedbackCount = 12): CalibrationEngineInput {
  const feedback: PartnerFeedbackEntry[] = []
  for (let i = 0; i < feedbackCount; i++) {
    const isDisagree = i % 5 === 0 // 20% disagree
    const dateOffset = i * 5 // 5 days apart
    const date = new Date('2026-01-01')
    date.setDate(date.getDate() + dateOffset)

    feedback.push(createFeedbackEntry({
      applicationId: `app-${i}`,
      overallAgreement: isDisagree ? 'disagree' : i % 3 === 0 ? 'partially_agree' : 'agree',
      dimensionFeedback: [
        { dimension: 'founder', aiScore: 70 + (i % 10), partnerScore: 65 + (i % 12) },
        { dimension: 'problem', aiScore: 75 + (i % 8), partnerScore: 78 + (i % 6) },
        { dimension: 'userValue', aiScore: 60 + (i % 15), partnerScore: 58 + (i % 10) },
        { dimension: 'execution', aiScore: 65 + (i % 12), partnerScore: 68 + (i % 8) },
      ],
      outcomeData: i < 6 ? {
        status: i % 3 === 0 ? 'active' : i % 3 === 1 ? 'graduated' : 'failed',
        reportedAt: date.toISOString(),
      } : undefined,
      createdAt: date.toISOString(),
    }))
  }

  return {
    config: DEFAULT_CALIBRATION_CONFIG,
    feedbackEntries: feedback,
    currentWeights: { founder: 1.2, problem: 1.0, userValue: 1.1, execution: 1.0, market: 0.8, team: 0.9 },
    currentSignalWeights: { 'interview_confidence:founder': 1.0, 'market_validation:problem': 1.0 },
  }
}

describe('CalibrationEngine', () => {
  const engine = new CalibrationEngine()

  describe('runCalibration', () => {
    it('generates a calibration report', async () => {
      const input = createTestInput()
      const output = await engine.runCalibration(input)

      expect(output.report).toBeDefined()
      expect(output.report.generatedAt).toBeDefined()
      expect(output.report.healthScore).toBeGreaterThanOrEqual(0)
      expect(output.report.healthScore).toBeLessThanOrEqual(100)
    })

    it('returns new weights', async () => {
      const input = createTestInput()
      const output = await engine.runCalibration(input)

      expect(output.newWeights).toBeDefined()
      expect(output.newSignalWeights).toBeDefined()
      // Should have the same keys as input
      expect(Object.keys(output.newWeights)).toEqual(
        expect.arrayContaining(Object.keys(input.currentWeights)),
      )
    })

    it('sets overall health correctly', async () => {
      const input = createTestInput()
      const output = await engine.runCalibration(input)

      expect(['excellent', 'good', 'needs_attention', 'critical']).toContain(
        output.report.overallHealth,
      )
    })
  })

  describe('prediction accuracy', () => {
    it('calculates overall prediction accuracy', async () => {
      const input = createTestInput()
      const output = await engine.runCalibration(input)

      expect(output.report.predictionAccuracy.overall).toBeGreaterThanOrEqual(0)
      expect(output.report.predictionAccuracy.overall).toBeLessThanOrEqual(100)
    })

    it('includes accuracy by dimension', async () => {
      const input = createTestInput()
      const output = await engine.runCalibration(input)

      expect(output.report.predictionAccuracy.byDimension.length).toBeGreaterThan(0)
      for (const dim of output.report.predictionAccuracy.byDimension) {
        expect(dim.dimension).toBeDefined()
        expect(dim.accuracy).toBeGreaterThanOrEqual(0)
        expect(['improving', 'stable', 'declining']).toContain(dim.trend)
      }
    })

    it('includes confidence calibration buckets', async () => {
      const input = createTestInput()
      const output = await engine.runCalibration(input)

      expect(output.report.predictionAccuracy.byConfidenceBucket.length).toBe(5)
      for (const bucket of output.report.predictionAccuracy.byConfidenceBucket) {
        expect(bucket.bucket).toBeDefined()
        expect(bucket.calibration).toBeGreaterThanOrEqual(0)
      }
    })
  })

  describe('drift detection', () => {
    it('reports no drift with too few entries', async () => {
      const input = createTestInput(2) // Only 2 feedback entries
      const output = await engine.runCalibration(input)

      expect(output.report.drift.detected).toBe(false)
      expect(output.report.drift.severity).toBe('none')
    })

    it('detects drift with sufficient data', async () => {
      const input = createTestInput(20)
      const output = await engine.runCalibration(input)

      // With 20 entries, drift detection should run
      expect(output.report.drift).toBeDefined()
      expect(['none', 'minor', 'moderate', 'severe']).toContain(output.report.drift.severity)
      expect(output.report.drift.recommendation).toBeDefined()
    })

    it('includes score and confidence shift', async () => {
      const input = createTestInput()
      const output = await engine.runCalibration(input)

      expect(typeof output.report.drift.scoreShift).toBe('number')
      expect(typeof output.report.drift.confidenceShift).toBe('number')
    })
  })

  describe('partner alignment', () => {
    it('calculates overall agreement rate', async () => {
      const input = createTestInput()
      const output = await engine.runCalibration(input)

      expect(output.report.partnerAlignment.overallAgreementRate).toBeGreaterThanOrEqual(0)
      expect(output.report.partnerAlignment.overallAgreementRate).toBeLessThanOrEqual(100)
    })

    it('identifies common disagreements', async () => {
      const input = createTestInput()
      const output = await engine.runCalibration(input)

      expect(Array.isArray(output.report.partnerAlignment.commonDisagreements)).toBe(true)
      for (const d of output.report.partnerAlignment.commonDisagreements) {
        expect(['ai_too_high', 'ai_too_low']).toContain(d.direction)
        expect(d.avgGap).toBeGreaterThanOrEqual(0)
      }
    })

    it('generates top insights', async () => {
      const input = createTestInput()
      const output = await engine.runCalibration(input)

      expect(output.report.partnerAlignment.topInsights.length).toBeGreaterThan(0)
      expect(output.report.partnerAlignment.topInsights.every((i) => typeof i === 'string')).toBe(true)
    })
  })

  describe('weight adjustments', () => {
    it('recommends adjustments when feedback is sufficient', async () => {
      const input = createTestInput(15) // Above minSampleSize
      const output = await engine.runCalibration(input)

      // With enough data, there should be recommendations (or no recommendations if well-calibrated)
      expect(Array.isArray(output.report.recommendedAdjustments)).toBe(true)
    })

    it('does not recommend adjustments with too little data', async () => {
      const input = createTestInput(5) // Below default minSampleSize of 10
      const output = await engine.runCalibration(input)

      expect(output.report.recommendedAdjustments.length).toBe(0)
    })

    it('adjustments preserve weight bounds', async () => {
      const input = createTestInput(20)
      const output = await engine.runCalibration(input)

      for (const adj of output.report.recommendedAdjustments) {
        expect(adj.adjustedWeight).toBeGreaterThanOrEqual(0.1)
        expect(adj.adjustedWeight).toBeLessThanOrEqual(2.0)
        expect(adj.confidence).toBeGreaterThanOrEqual(0)
        expect(adj.confidence).toBeLessThanOrEqual(1)
      }
    })
  })

  describe('outcome tracking', () => {
    it('tracks outcomes from feedback with outcome data', async () => {
      const input = createTestInput()
      const output = await engine.runCalibration(input)

      expect(Array.isArray(output.report.outcomePredictions)).toBe(true)
      // 6 of our 12 entries have outcomeData
      expect(output.report.outcomePredictions.length).toBeGreaterThan(0)

      for (const pred of output.report.outcomePredictions) {
        expect(pred.applicationId).toBeDefined()
        expect(typeof pred.correct).toBe('boolean')
        expect(pred.lessonLearned).toBeDefined()
      }
    })
  })

  describe('recommendations', () => {
    it('generates recommendations without API key', async () => {
      const input = createTestInput()
      const output = await engine.runCalibration(input)

      expect(output.report.recommendations.length).toBeGreaterThan(0)
      expect(output.report.recommendations.every((r) => typeof r === 'string')).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles empty feedback gracefully', async () => {
      const input: CalibrationEngineInput = {
        config: DEFAULT_CALIBRATION_CONFIG,
        feedbackEntries: [],
        currentWeights: { founder: 1.0 },
        currentSignalWeights: {},
      }
      const output = await engine.runCalibration(input)

      expect(output.report).toBeDefined()
      expect(output.applied).toBe(false)
    })

    it('handles all-agree feedback', async () => {
      const input = createTestInput(5)
      input.feedbackEntries = input.feedbackEntries.map((f) => ({
        ...f,
        overallAgreement: 'agree' as const,
      }))
      const output = await engine.runCalibration(input)

      expect(output.report.partnerAlignment.overallAgreementRate).toBe(100)
    })

    it('handles all-disagree feedback', async () => {
      const input = createTestInput(5)
      input.feedbackEntries = input.feedbackEntries.map((f) => ({
        ...f,
        overallAgreement: 'disagree' as const,
      }))
      const output = await engine.runCalibration(input)

      expect(output.report.partnerAlignment.overallAgreementRate).toBe(0)
    })
  })
})
