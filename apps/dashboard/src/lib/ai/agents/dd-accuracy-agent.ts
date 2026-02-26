// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY OS — DD Accuracy Agent
// Primarily computational — tracks prediction accuracy, calibration, drift
// ═══════════════════════════════════════════════════════════════════════════

import Anthropic from '@anthropic-ai/sdk';
import type { DDAccuracyInput, DDAccuracyMetrics } from '../types/dd-accuracy';

export class DDAccuracyAgent {
  private client: Anthropic | null;
  private model = 'claude-sonnet-4-20250514';

  constructor() {
    this.client = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;
  }

  async calculateAccuracyMetrics(input: DDAccuracyInput): Promise<DDAccuracyMetrics> {
    const predictionAccuracy = this.calculatePredictionAccuracy(input.decisions);
    const confidenceCalibration = this.calculateConfidenceCalibration(input.decisions);
    const partnerOverrides = this.calculatePartnerOverrides(input.decisions);
    const signalEffectiveness = this.calculateSignalEffectiveness(input.signalHistory);
    const claimVerificationAccuracy = this.calculateClaimAccuracy(input.claimVerifications);
    const driftMetrics = this.calculateDrift(input.decisions);
    const performanceOverTime = this.calculatePerformanceOverTime(input.decisions);

    const totalCorrect = predictionAccuracy.investRecommendations.correctOutcomes +
      predictionAccuracy.passRecommendations.correctOutcomes;
    const totalDecisions = predictionAccuracy.investRecommendations.total +
      predictionAccuracy.passRecommendations.total;
    const overallAccuracy = totalDecisions > 0 ? Math.round((totalCorrect / totalDecisions) * 100) : 0;

    return {
      overallAccuracy,
      totalDecisions: input.decisions.length,
      predictionAccuracy,
      confidenceCalibration,
      partnerOverrides,
      signalEffectiveness,
      claimVerificationAccuracy,
      driftMetrics,
      performanceOverTime,
    };
  }

  private calculatePredictionAccuracy(decisions: DDAccuracyInput['decisions']) {
    const invest = decisions.filter((d) => ['invest', 'conditional_invest'].includes(d.ddVerdict));
    const pass = decisions.filter((d) => d.ddVerdict === 'pass');
    const conditional = decisions.filter((d) => d.ddVerdict === 'conditional_invest');

    const investCorrect = invest.filter((d) =>
      d.outcome && ['graduated_success', 'active', 'acquired'].includes(d.outcome),
    ).length;

    const passCorrect = pass.filter((d) =>
      d.outcome && ['failed', 'dropped_out'].includes(d.outcome),
    ).length;

    const condPositive = conditional.filter((d) =>
      d.partnerDecision === 'approved',
    ).length;

    const condNegative = conditional.filter((d) =>
      d.partnerDecision === 'rejected',
    ).length;

    return {
      investRecommendations: {
        total: invest.length,
        correctOutcomes: investCorrect,
        accuracy: invest.length > 0 ? Math.round((investCorrect / invest.length) * 100) : 0,
      },
      passRecommendations: {
        total: pass.length,
        correctOutcomes: passCorrect,
        accuracy: pass.length > 0 ? Math.round((passCorrect / pass.length) * 100) : 0,
      },
      conditionalRecommendations: {
        total: conditional.length,
        resolvedPositive: condPositive,
        resolvedNegative: condNegative,
      },
    };
  }

  private calculateConfidenceCalibration(decisions: DDAccuracyInput['decisions']) {
    const buckets = [
      { label: '0-20%', min: 0, max: 0.2 },
      { label: '20-40%', min: 0.2, max: 0.4 },
      { label: '40-60%', min: 0.4, max: 0.6 },
      { label: '60-80%', min: 0.6, max: 0.8 },
      { label: '80-100%', min: 0.8, max: 1.0 },
    ];

    return buckets.map((bucket) => {
      const inBucket = decisions.filter(
        (d) => d.ddConfidence >= bucket.min && d.ddConfidence < bucket.max,
      );
      const withOutcomes = inBucket.filter((d) => d.outcome);
      const correct = withOutcomes.filter((d) => d.partnerAgreed).length;
      const actualAccuracy = withOutcomes.length > 0 ? correct / withOutcomes.length : 0;
      const predictedAccuracy = (bucket.min + bucket.max) / 2;

      return {
        bucket: bucket.label,
        predictedAccuracy: Math.round(predictedAccuracy * 100),
        actualAccuracy: Math.round(actualAccuracy * 100),
        sampleSize: inBucket.length,
        calibrationError: Math.round(Math.abs(predictedAccuracy - actualAccuracy) * 100),
      };
    });
  }

  private calculatePartnerOverrides(decisions: DDAccuracyInput['decisions']) {
    const totalReviews = decisions.length;
    const agreed = decisions.filter((d) => d.partnerAgreed).length;

    const dimensions = ['founder', 'problem', 'userValue', 'execution'];
    const dimensionOverrides = dimensions.map((dim) => {
      const adjustments = decisions
        .filter((d) => d.scoreAdjustments[dim] !== undefined && d.scoreAdjustments[dim] !== 0)
        .map((d) => d.scoreAdjustments[dim]);

      const avgAdj = adjustments.length > 0
        ? adjustments.reduce((s, v) => s + v, 0) / adjustments.length
        : 0;

      return {
        dimension: dim,
        overrideRate: totalReviews > 0 ? Math.round((adjustments.length / totalReviews) * 100) : 0,
        avgAdjustment: Math.round(avgAdj * 10) / 10,
        direction: (avgAdj > 2 ? 'ai_too_low' : avgAdj < -2 ? 'ai_too_high' : 'balanced') as 'ai_too_high' | 'ai_too_low' | 'balanced',
      };
    });

    return {
      totalReviews,
      agreementRate: totalReviews > 0 ? Math.round((agreed / totalReviews) * 100) : 0,
      averageScoreAdjustment: Math.round(
        decisions.reduce((sum, d) => {
          const vals = Object.values(d.scoreAdjustments).filter((v) => v !== 0);
          return sum + (vals.length > 0 ? vals.reduce((s, v) => s + Math.abs(v), 0) / vals.length : 0);
        }, 0) / Math.max(totalReviews, 1) * 10,
      ) / 10,
      dimensionOverrides,
      commonMisses: [], // populated with Claude insights if available
    };
  }

  private calculateSignalEffectiveness(signals: DDAccuracyInput['signalHistory']) {
    const byType = new Map<string, typeof signals>();
    for (const signal of signals) {
      const key = `${signal.signalType}:${signal.dimension}`;
      if (!byType.has(key)) byType.set(key, []);
      byType.get(key)!.push(signal);
    }

    return Array.from(byType.entries()).map(([key, group]) => {
      const [signalType, dimension] = key.split(':');
      const withOutcomes = group.filter((s) => s.applicationOutcome);
      const successSignals = withOutcomes.filter((s) =>
        ['graduated_success', 'active', 'acquired'].includes(s.applicationOutcome!),
      );

      const predictivePower = withOutcomes.length > 0
        ? successSignals.length / withOutcomes.length
        : 0;

      return {
        signalType,
        dimension,
        predictivePower: Math.round(predictivePower * 100) / 100,
        frequency: group.length,
        avgImpact: Math.round((group.reduce((s, g) => s + g.impact, 0) / group.length) * 10) / 10,
        trend: 'stable' as const,
      };
    });
  }

  private calculateClaimAccuracy(claims: DDAccuracyInput['claimVerifications']) {
    const byVerdict = new Map<string, typeof claims>();
    for (const claim of claims) {
      if (!byVerdict.has(claim.aiVerdict)) byVerdict.set(claim.aiVerdict, []);
      byVerdict.get(claim.aiVerdict)!.push(claim);
    }

    const verdictAccuracy = Array.from(byVerdict.entries()).map(([verdict, group]) => {
      const withOutcomes = group.filter((c) => c.actualOutcome);
      const correct = withOutcomes.filter((c) => c.actualOutcome === c.aiVerdict).length;
      return {
        verdict,
        totalPredictions: group.length,
        confirmedCorrect: correct,
        accuracy: withOutcomes.length > 0 ? Math.round((correct / withOutcomes.length) * 100) : 0,
      };
    });

    return {
      totalClaimsVerified: claims.length,
      verdictAccuracy,
      sourceReliability: [], // populated from dd_verifications table
    };
  }

  private calculateDrift(decisions: DDAccuracyInput['decisions']) {
    if (decisions.length < 2) {
      return {
        scoreDistributionShift: 0,
        signalWeightDrift: [],
        confidenceDrift: 0,
        alertLevel: 'normal' as const,
        lastChecked: new Date().toISOString(),
      };
    }

    const sorted = [...decisions].sort(
      (a, b) => new Date(a.decisionDate).getTime() - new Date(b.decisionDate).getTime(),
    );

    const midpoint = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, midpoint);
    const secondHalf = sorted.slice(midpoint);

    const avgScoreFirst = firstHalf.reduce((s, d) => s + d.ddScore, 0) / firstHalf.length;
    const avgScoreSecond = secondHalf.reduce((s, d) => s + d.ddScore, 0) / secondHalf.length;
    const scoreShift = Math.abs(avgScoreSecond - avgScoreFirst);

    const avgConfFirst = firstHalf.reduce((s, d) => s + d.ddConfidence, 0) / firstHalf.length;
    const avgConfSecond = secondHalf.reduce((s, d) => s + d.ddConfidence, 0) / secondHalf.length;
    const confDrift = avgConfSecond - avgConfFirst;

    let alertLevel: 'normal' | 'warning' | 'critical' = 'normal';
    if (scoreShift > 15 || Math.abs(confDrift) > 0.15) alertLevel = 'critical';
    else if (scoreShift > 8 || Math.abs(confDrift) > 0.08) alertLevel = 'warning';

    return {
      scoreDistributionShift: Math.round(scoreShift * 10) / 10,
      signalWeightDrift: [],
      confidenceDrift: Math.round(confDrift * 100) / 100,
      alertLevel,
      lastChecked: new Date().toISOString(),
    };
  }

  private calculatePerformanceOverTime(decisions: DDAccuracyInput['decisions']) {
    const byWeek = new Map<string, typeof decisions>();
    for (const d of decisions) {
      const date = new Date(d.decisionDate);
      const year = date.getFullYear();
      const week = Math.ceil(((date.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7);
      const period = `${year}-W${String(week).padStart(2, '0')}`;
      if (!byWeek.has(period)) byWeek.set(period, []);
      byWeek.get(period)!.push(d);
    }

    return Array.from(byWeek.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, group]) => {
        const agreed = group.filter((d) => d.partnerAgreed).length;
        const withOutcomes = group.filter((d) => d.outcome);
        const correct = withOutcomes.filter((d) => d.partnerAgreed).length;

        return {
          period,
          accuracy: withOutcomes.length > 0 ? Math.round((correct / withOutcomes.length) * 100) : 0,
          agreementRate: group.length > 0 ? Math.round((agreed / group.length) * 100) : 0,
          avgConfidence: Math.round((group.reduce((s, d) => s + d.ddConfidence, 0) / group.length) * 100),
          decisionsCount: group.length,
        };
      });
  }

  async generateInsights(metrics: DDAccuracyMetrics): Promise<string[]> {
    if (!this.client) {
      return this.generateDeterministicInsights(metrics);
    }

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `Analyze these DD accuracy metrics and provide 3-5 actionable insights:\n${JSON.stringify(metrics, null, 2)}\n\nReturn a JSON array of strings, each a concise insight.`,
          },
        ],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '[]';
      return JSON.parse(text);
    } catch {
      return this.generateDeterministicInsights(metrics);
    }
  }

  private generateDeterministicInsights(metrics: DDAccuracyMetrics): string[] {
    const insights: string[] = [];

    if (metrics.partnerOverrides.agreementRate < 70) {
      insights.push(`Partner agreement rate is ${metrics.partnerOverrides.agreementRate}% — below the 80% target. Review scoring calibration.`);
    }

    if (metrics.driftMetrics.alertLevel !== 'normal') {
      insights.push(`Score distribution drift detected (${metrics.driftMetrics.scoreDistributionShift} points). ${metrics.driftMetrics.alertLevel === 'critical' ? 'Immediate recalibration needed.' : 'Monitor closely.'}`);
    }

    for (const cal of metrics.confidenceCalibration) {
      if (cal.calibrationError > 20 && cal.sampleSize > 5) {
        insights.push(`Confidence bucket ${cal.bucket}: predicted ${cal.predictedAccuracy}% but actual ${cal.actualAccuracy}% (${cal.calibrationError}% error). Model is ${cal.predictedAccuracy > cal.actualAccuracy ? 'overconfident' : 'underconfident'} in this range.`);
      }
    }

    for (const override of metrics.partnerOverrides.dimensionOverrides) {
      if (override.overrideRate > 30) {
        insights.push(`Partners override ${override.dimension} scores ${override.overrideRate}% of the time (avg adjustment: ${override.avgAdjustment > 0 ? '+' : ''}${override.avgAdjustment}). AI is systematically ${override.direction === 'ai_too_high' ? 'overscoring' : 'underscoring'} this dimension.`);
      }
    }

    if (insights.length === 0) {
      insights.push('DD accuracy metrics are within normal ranges. No immediate action needed.');
    }

    return insights;
  }
}

// ─── Factory ─────────────────────────────────────────────────────────────

export function getDDAccuracyAgent(): DDAccuracyAgent {
  return new DDAccuracyAgent();
}
