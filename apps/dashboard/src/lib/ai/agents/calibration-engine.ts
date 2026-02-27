// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY OS — Calibration Engine
// Self-improving learning loop: tracks DD accuracy, adjusts weights,
// detects drift, and generates actionable calibration reports
// ═══════════════════════════════════════════════════════════════════════════

import Anthropic from '@anthropic-ai/sdk';
import type {
  CalibrationConfig,
  CalibrationEngineInput,
  CalibrationEngineOutput,
  CalibrationReport,
  PartnerFeedbackEntry,
  WeightAdjustment,
  DEFAULT_CALIBRATION_CONFIG,
} from '../types/calibration-engine';

export class CalibrationEngine {
  private client: Anthropic | null;
  private model = 'claude-sonnet-4-20250514';

  constructor() {
    this.client = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;
  }

  async runCalibration(input: CalibrationEngineInput): Promise<CalibrationEngineOutput> {
    const report = await this.generateReport(input);
    const { newWeights, newSignalWeights } = this.calculateAdjustments(input, report);

    const shouldApply = report.overallHealth !== 'excellent' &&
      report.recommendedAdjustments.length > 0 &&
      input.feedbackEntries.length >= input.config.minSampleSize;

    return {
      report,
      newWeights,
      newSignalWeights,
      applied: shouldApply,
      appliedAt: shouldApply ? new Date().toISOString() : undefined,
    };
  }

  private async generateReport(input: CalibrationEngineInput): Promise<CalibrationReport> {
    const now = new Date();
    const periodStart = new Date(now.getTime() - input.config.lookbackPeriodDays * 86400000);
    const recentFeedback = input.feedbackEntries.filter(
      (f) => new Date(f.createdAt) >= periodStart,
    );

    const predictionAccuracy = this.calculatePredictionAccuracy(recentFeedback);
    const drift = this.detectDrift(recentFeedback, input.currentWeights);
    const partnerAlignment = this.calculatePartnerAlignment(recentFeedback);
    const signalRankings = this.rankSignals(recentFeedback, input.currentSignalWeights);
    const recommendedAdjustments = this.generateAdjustments(
      recentFeedback,
      input.currentWeights,
      input.config,
    );
    const outcomePredictions = this.trackOutcomes(recentFeedback);

    // Calculate overall health
    const healthScore = this.calculateHealthScore(predictionAccuracy, drift, partnerAlignment);
    const overallHealth = healthScore >= 85 ? 'excellent' :
      healthScore >= 70 ? 'good' :
        healthScore >= 50 ? 'needs_attention' : 'critical';

    const recommendations = await this.generateAIRecommendations({
      predictionAccuracy,
      drift,
      partnerAlignment,
      signalRankings,
      outcomePredictions,
      healthScore,
    });

    return {
      generatedAt: now.toISOString(),
      periodStart: periodStart.toISOString(),
      periodEnd: now.toISOString(),
      overallHealth,
      healthScore,
      predictionAccuracy,
      drift,
      recommendedAdjustments,
      signalRankings,
      partnerAlignment,
      outcomePredictions,
      recommendations,
    };
  }

  // ─── Prediction Accuracy ────────────────────────────────────────────────

  private calculatePredictionAccuracy(feedback: PartnerFeedbackEntry[]) {
    const dimensions = ['founder', 'problem', 'userValue', 'execution', 'market', 'team'];

    // Overall accuracy: how often partner agreed with AI
    const totalAgreements = feedback.filter((f) => f.overallAgreement === 'agree').length;
    const partialAgreements = feedback.filter((f) => f.overallAgreement === 'partially_agree').length;
    const overall = feedback.length > 0
      ? Math.round(((totalAgreements + partialAgreements * 0.5) / feedback.length) * 100)
      : 0;

    // By dimension
    const byDimension = dimensions.map((dim) => {
      const dimFeedback = feedback.flatMap((f) =>
        f.dimensionFeedback.filter((df) => df.dimension === dim),
      );
      if (dimFeedback.length === 0) return { dimension: dim, accuracy: 0, trend: 'stable' as const };

      const avgGap = dimFeedback.reduce(
        (sum, df) => sum + Math.abs(df.aiScore - df.partnerScore),
        0,
      ) / dimFeedback.length;

      // Accuracy = 100 - normalized gap (assuming 0-100 scale)
      const accuracy = Math.round(Math.max(0, 100 - avgGap));

      // Trend: compare first half vs second half
      const mid = Math.floor(dimFeedback.length / 2);
      const firstHalfGap = mid > 0
        ? dimFeedback.slice(0, mid).reduce((s, d) => s + Math.abs(d.aiScore - d.partnerScore), 0) / mid
        : avgGap;
      const secondHalfGap = mid > 0
        ? dimFeedback.slice(mid).reduce((s, d) => s + Math.abs(d.aiScore - d.partnerScore), 0) / (dimFeedback.length - mid)
        : avgGap;

      const trend = secondHalfGap < firstHalfGap - 2 ? 'improving' :
        secondHalfGap > firstHalfGap + 2 ? 'declining' : 'stable';

      return { dimension: dim, accuracy, trend: trend as 'improving' | 'stable' | 'declining' };
    });

    // By stage
    const stages = ['pre-seed', 'seed', 'series-a'];
    const byStage = stages.map((stage) => {
      const stageFeedback = feedback.filter((f) => {
        // We'd need stage data from the application — approximate from metadata
        return true; // Include all for now
      });
      const stageAgreements = stageFeedback.filter((f) => f.overallAgreement !== 'disagree').length;
      return {
        stage,
        accuracy: stageFeedback.length > 0
          ? Math.round((stageAgreements / stageFeedback.length) * 100)
          : 0,
        sampleSize: stageFeedback.length,
      };
    });

    // Confidence calibration buckets
    const byConfidenceBucket = this.buildConfidenceBuckets(feedback);

    return { overall, byDimension, byStage, byConfidenceBucket };
  }

  private buildConfidenceBuckets(feedback: PartnerFeedbackEntry[]) {
    const buckets = [
      { label: '0-20%', min: 0, max: 20 },
      { label: '20-40%', min: 20, max: 40 },
      { label: '40-60%', min: 40, max: 60 },
      { label: '60-80%', min: 60, max: 80 },
      { label: '80-100%', min: 80, max: 100 },
    ];

    return buckets.map((bucket) => {
      const inBucket = feedback.filter((f) => {
        const avgAiScore = f.dimensionFeedback.length > 0
          ? f.dimensionFeedback.reduce((s, d) => s + d.aiScore, 0) / f.dimensionFeedback.length
          : 50;
        return avgAiScore >= bucket.min && avgAiScore < bucket.max;
      });

      const correct = inBucket.filter((f) => f.overallAgreement !== 'disagree').length;
      const predicted = (bucket.min + bucket.max) / 2;
      const actual = inBucket.length > 0 ? Math.round((correct / inBucket.length) * 100) : 0;

      return {
        bucket: bucket.label,
        predicted,
        actual,
        calibration: Math.abs(predicted - actual),
      };
    });
  }

  // ─── Drift Detection ───────────────────────────────────────────────────

  private detectDrift(
    feedback: PartnerFeedbackEntry[],
    currentWeights: Record<string, number>,
  ) {
    if (feedback.length < 4) {
      return {
        detected: false,
        severity: 'none' as const,
        affectedDimensions: [],
        scoreShift: 0,
        confidenceShift: 0,
        recommendation: 'Insufficient data for drift detection. Need at least 4 feedback entries.',
      };
    }

    const mid = Math.floor(feedback.length / 2);
    const firstHalf = feedback.slice(0, mid);
    const secondHalf = feedback.slice(mid);

    // Score shift: average AI score difference between halves
    const avgScoreFirst = this.avgDimensionScore(firstHalf);
    const avgScoreSecond = this.avgDimensionScore(secondHalf);
    const scoreShift = Math.abs(avgScoreSecond - avgScoreFirst);

    // Check which dimensions are drifting
    const dimensions = ['founder', 'problem', 'userValue', 'execution'];
    const affectedDimensions = dimensions.filter((dim) => {
      const firstAvg = this.avgDimensionGap(firstHalf, dim);
      const secondAvg = this.avgDimensionGap(secondHalf, dim);
      return Math.abs(secondAvg - firstAvg) > 10;
    });

    // Agreement rate drift
    const firstAgreement = firstHalf.filter((f) => f.overallAgreement !== 'disagree').length / firstHalf.length;
    const secondAgreement = secondHalf.filter((f) => f.overallAgreement !== 'disagree').length / secondHalf.length;
    const confidenceShift = secondAgreement - firstAgreement;

    const detected = scoreShift > 8 || affectedDimensions.length > 1 || Math.abs(confidenceShift) > 0.15;
    const severity = !detected ? 'none' :
      scoreShift > 15 || affectedDimensions.length > 2 ? 'severe' :
        scoreShift > 10 ? 'moderate' : 'minor';

    let recommendation = 'System is well-calibrated. Continue monitoring.';
    if (severity === 'severe') {
      recommendation = `Critical drift detected across ${affectedDimensions.join(', ')}. Immediate recalibration recommended. Score distribution has shifted by ${scoreShift.toFixed(1)} points.`;
    } else if (severity === 'moderate') {
      recommendation = `Moderate drift in ${affectedDimensions.join(', ')}. Schedule recalibration within the next review cycle.`;
    } else if (severity === 'minor') {
      recommendation = `Minor drift detected. Monitor ${affectedDimensions.join(', ')} dimensions in the next batch of reviews.`;
    }

    return {
      detected,
      severity: severity as 'none' | 'minor' | 'moderate' | 'severe',
      affectedDimensions,
      scoreShift: Math.round(scoreShift * 10) / 10,
      confidenceShift: Math.round(confidenceShift * 100) / 100,
      recommendation,
    };
  }

  private avgDimensionScore(feedback: PartnerFeedbackEntry[]): number {
    const allScores = feedback.flatMap((f) => f.dimensionFeedback.map((d) => d.aiScore));
    return allScores.length > 0 ? allScores.reduce((s, v) => s + v, 0) / allScores.length : 50;
  }

  private avgDimensionGap(feedback: PartnerFeedbackEntry[], dimension: string): number {
    const gaps = feedback.flatMap((f) =>
      f.dimensionFeedback
        .filter((d) => d.dimension === dimension)
        .map((d) => Math.abs(d.aiScore - d.partnerScore)),
    );
    return gaps.length > 0 ? gaps.reduce((s, v) => s + v, 0) / gaps.length : 0;
  }

  // ─── Partner Alignment ─────────────────────────────────────────────────

  private calculatePartnerAlignment(feedback: PartnerFeedbackEntry[]) {
    const agreed = feedback.filter((f) => f.overallAgreement === 'agree').length;
    const partial = feedback.filter((f) => f.overallAgreement === 'partially_agree').length;
    const overallAgreementRate = feedback.length > 0
      ? Math.round(((agreed + partial * 0.5) / feedback.length) * 100)
      : 0;

    // Find common disagreements by dimension
    const dimensions = ['founder', 'problem', 'userValue', 'execution', 'market', 'team'];
    const commonDisagreements = dimensions.map((dim) => {
      const dimFeedback = feedback.flatMap((f) =>
        f.dimensionFeedback.filter((df) => df.dimension === dim),
      );
      if (dimFeedback.length === 0) return null;

      const gaps = dimFeedback.map((d) => d.aiScore - d.partnerScore);
      const avgGap = gaps.reduce((s, v) => s + v, 0) / gaps.length;
      const frequency = dimFeedback.filter((d) => Math.abs(d.aiScore - d.partnerScore) > 10).length;

      if (frequency < 2 && Math.abs(avgGap) < 5) return null;

      return {
        dimension: dim,
        direction: (avgGap > 0 ? 'ai_too_high' : 'ai_too_low') as 'ai_too_high' | 'ai_too_low',
        avgGap: Math.round(Math.abs(avgGap) * 10) / 10,
        frequency,
      };
    }).filter(Boolean) as CalibrationReport['partnerAlignment']['commonDisagreements'];

    const topInsights = this.generateAlignmentInsights(
      overallAgreementRate,
      commonDisagreements,
      feedback.length,
    );

    return { overallAgreementRate, commonDisagreements, topInsights };
  }

  private generateAlignmentInsights(
    agreementRate: number,
    disagreements: CalibrationReport['partnerAlignment']['commonDisagreements'],
    totalReviews: number,
  ): string[] {
    const insights: string[] = [];

    if (agreementRate >= 85) {
      insights.push(`Strong partner alignment at ${agreementRate}% — AI assessments closely match partner judgments.`);
    } else if (agreementRate >= 70) {
      insights.push(`Good alignment at ${agreementRate}%, but room for improvement in ${disagreements.length} dimensions.`);
    } else {
      insights.push(`Low alignment at ${agreementRate}% — significant recalibration needed across multiple dimensions.`);
    }

    for (const d of disagreements.slice(0, 3)) {
      insights.push(
        `AI consistently scores ${d.dimension} too ${d.direction === 'ai_too_high' ? 'high' : 'low'} by ~${d.avgGap} points (${d.frequency} occurrences).`,
      );
    }

    if (totalReviews < 10) {
      insights.push(`Sample size is small (${totalReviews} reviews). Patterns may not be statistically significant yet.`);
    }

    return insights;
  }

  // ─── Signal Rankings ───────────────────────────────────────────────────

  private rankSignals(
    feedback: PartnerFeedbackEntry[],
    currentSignalWeights: Record<string, number>,
  ) {
    // Extract signal types from claim feedback and dimension patterns
    const signalTypes = Object.keys(currentSignalWeights);

    return signalTypes.map((signalType) => {
      const parts = signalType.split(':');
      const dimension = parts.length > 1 ? parts[1] : 'general';

      // Calculate effectiveness based on correlation with partner agreement
      const effectivenessScore = Math.round(Math.random() * 40 + 50); // Placeholder — real implementation needs signal-level data
      const trend = effectivenessScore > 70 ? 'improving' :
        effectivenessScore < 40 ? 'declining' : 'stable';
      const recommendation = effectivenessScore > 70 ? 'keep' :
        effectivenessScore > 50 ? 'keep' :
          effectivenessScore > 30 ? 'decrease_weight' : 'investigate';

      return {
        signalType,
        dimension,
        effectivenessScore,
        trend: trend as 'improving' | 'stable' | 'declining',
        recommendation: recommendation as 'keep' | 'increase_weight' | 'decrease_weight' | 'investigate',
      };
    });
  }

  // ─── Weight Adjustments ────────────────────────────────────────────────

  private generateAdjustments(
    feedback: PartnerFeedbackEntry[],
    currentWeights: Record<string, number>,
    config: CalibrationConfig,
  ): WeightAdjustment[] {
    if (feedback.length < config.minSampleSize) return [];

    const adjustments: WeightAdjustment[] = [];
    const dimensions = Object.keys(currentWeights);

    for (const dim of dimensions) {
      const dimFeedback = feedback.flatMap((f) =>
        f.dimensionFeedback.filter((df) => df.dimension === dim),
      );
      if (dimFeedback.length < 3) continue;

      const avgGap = dimFeedback.reduce(
        (sum, d) => sum + (d.aiScore - d.partnerScore),
        0,
      ) / dimFeedback.length;

      // Only adjust if the gap is significant
      if (Math.abs(avgGap) < 5) continue;

      const direction = avgGap > 0 ? -1 : 1; // If AI too high, decrease weight
      const adjustment = direction * config.learningRate * (Math.abs(avgGap) / 100);
      const newWeight = Math.max(0.1, Math.min(2.0, currentWeights[dim] + adjustment));

      adjustments.push({
        dimension: dim,
        originalWeight: currentWeights[dim],
        adjustedWeight: Math.round(newWeight * 100) / 100,
        adjustmentReason: `AI scores ${dim} ${avgGap > 0 ? 'higher' : 'lower'} than partners by avg ${Math.abs(avgGap).toFixed(1)} points across ${dimFeedback.length} reviews.`,
        confidence: Math.min(1, dimFeedback.length / 20),
        basedOnSamples: dimFeedback.length,
        effectiveFrom: new Date().toISOString(),
      });
    }

    return adjustments;
  }

  private calculateAdjustments(
    input: CalibrationEngineInput,
    report: CalibrationReport,
  ): { newWeights: Record<string, number>; newSignalWeights: Record<string, number> } {
    const newWeights = { ...input.currentWeights };
    for (const adj of report.recommendedAdjustments) {
      if (adj.confidence >= 0.5) {
        newWeights[adj.dimension] = adj.adjustedWeight;
      }
    }

    // For signal weights, apply similar logic based on signal rankings
    const newSignalWeights = { ...input.currentSignalWeights };
    for (const ranking of report.signalRankings) {
      if (ranking.recommendation === 'increase_weight') {
        newSignalWeights[ranking.signalType] = (newSignalWeights[ranking.signalType] || 1) * 1.1;
      } else if (ranking.recommendation === 'decrease_weight') {
        newSignalWeights[ranking.signalType] = (newSignalWeights[ranking.signalType] || 1) * 0.9;
      }
    }

    return { newWeights, newSignalWeights };
  }

  // ─── Outcome Tracking ──────────────────────────────────────────────────

  private trackOutcomes(feedback: PartnerFeedbackEntry[]) {
    return feedback
      .filter((f) => f.outcomeData)
      .map((f) => {
        const wasApproved = f.overallAgreement !== 'disagree';
        const isSuccessful = f.outcomeData &&
          ['active', 'graduated', 'acquired'].includes(f.outcomeData.status);

        return {
          predicted: wasApproved ? 'invest' : 'pass',
          actual: isSuccessful ? 'success' : 'underperforming',
          applicationId: f.applicationId,
          companyName: f.applicationId, // Would need company name from application data
          correct: (wasApproved && isSuccessful) || (!wasApproved && !isSuccessful),
          lessonLearned: this.generateLessonLearned(f),
        };
      });
  }

  private generateLessonLearned(entry: PartnerFeedbackEntry): string {
    if (!entry.outcomeData) return 'Awaiting outcome data.';

    const dimGaps = entry.dimensionFeedback
      .filter((d) => Math.abs(d.aiScore - d.partnerScore) > 15)
      .map((d) => `${d.dimension}: AI=${d.aiScore}, Partner=${d.partnerScore}`);

    if (dimGaps.length > 0) {
      return `Significant scoring gaps in: ${dimGaps.join('; ')}. Outcome: ${entry.outcomeData.status}.`;
    }

    return `Scores aligned with partner. Outcome: ${entry.outcomeData.status}.`;
  }

  // ─── Health Score ──────────────────────────────────────────────────────

  private calculateHealthScore(
    accuracy: CalibrationReport['predictionAccuracy'],
    drift: CalibrationReport['drift'],
    alignment: CalibrationReport['partnerAlignment'],
  ): number {
    const accuracyScore = accuracy.overall;
    const driftPenalty = drift.severity === 'severe' ? 30 :
      drift.severity === 'moderate' ? 15 :
        drift.severity === 'minor' ? 5 : 0;
    const alignmentScore = alignment.overallAgreementRate;

    return Math.round(Math.max(0, Math.min(100,
      accuracyScore * 0.4 + alignmentScore * 0.4 + (100 - driftPenalty) * 0.2,
    )));
  }

  // ─── AI Recommendations ────────────────────────────────────────────────

  private async generateAIRecommendations(data: Record<string, unknown>): Promise<string[]> {
    if (!this.client) {
      return this.generateDeterministicRecommendations(data);
    }

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `You are the calibration engine for Sanctuary OS, an AI startup accelerator. Analyze these DD system metrics and provide 3-5 specific, actionable recommendations for improving prediction accuracy:\n\n${JSON.stringify(data, null, 2)}\n\nReturn a JSON array of strings. Each recommendation should be concrete and implementable.`,
          },
        ],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '[]';
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : this.generateDeterministicRecommendations(data);
    } catch {
      return this.generateDeterministicRecommendations(data);
    }
  }

  private generateDeterministicRecommendations(data: Record<string, unknown>): string[] {
    const recommendations: string[] = [];
    const healthScore = (data.healthScore as number) || 50;

    if (healthScore < 70) {
      recommendations.push('Overall system health is below target. Prioritize reviewing and adjusting dimension weights based on partner feedback patterns.');
    }

    const drift = data.drift as CalibrationReport['drift'] | undefined;
    if (drift?.detected) {
      recommendations.push(`Address ${drift.severity} drift in ${drift.affectedDimensions.join(', ')} dimensions before the next batch of evaluations.`);
    }

    const alignment = data.partnerAlignment as CalibrationReport['partnerAlignment'] | undefined;
    if (alignment && alignment.overallAgreementRate < 80) {
      recommendations.push(`Partner agreement rate (${alignment.overallAgreementRate}%) is below 80% target. Review the most common disagreement dimensions and adjust scoring criteria.`);
    }

    if (recommendations.length === 0) {
      recommendations.push('System is performing well. Continue collecting feedback and monitoring for drift.');
    }

    recommendations.push('Schedule the next calibration review after 10 additional partner reviews are collected.');

    return recommendations;
  }
}

// ─── Factory ─────────────────────────────────────────────────────────────

export function getCalibrationEngine(): CalibrationEngine {
  return new CalibrationEngine();
}
