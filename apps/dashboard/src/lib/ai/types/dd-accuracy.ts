// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY OS — DD Accuracy Metrics Types
// Tracks prediction accuracy, confidence calibration, partner overrides
// ═══════════════════════════════════════════════════════════════════════════

export interface DDAccuracyMetrics {
  overallAccuracy: number; // 0-100
  totalDecisions: number;

  predictionAccuracy: {
    investRecommendations: { total: number; correctOutcomes: number; accuracy: number };
    passRecommendations: { total: number; correctOutcomes: number; accuracy: number };
    conditionalRecommendations: { total: number; resolvedPositive: number; resolvedNegative: number };
  };

  confidenceCalibration: {
    bucket: string; // e.g., "80-90%"
    predictedAccuracy: number;
    actualAccuracy: number;
    sampleSize: number;
    calibrationError: number; // abs(predicted - actual)
  }[];

  partnerOverrides: {
    totalReviews: number;
    agreementRate: number;
    averageScoreAdjustment: number;
    dimensionOverrides: {
      dimension: string;
      overrideRate: number;
      avgAdjustment: number;
      direction: 'ai_too_high' | 'ai_too_low' | 'balanced';
    }[];
    commonMisses: { description: string; frequency: number }[];
  };

  signalEffectiveness: {
    signalType: string;
    dimension: string;
    predictivePower: number; // correlation 0-1
    frequency: number;
    avgImpact: number;
    trend: 'improving' | 'stable' | 'declining';
  }[];

  claimVerificationAccuracy: {
    totalClaimsVerified: number;
    verdictAccuracy: {
      verdict: string;
      totalPredictions: number;
      confirmedCorrect: number;
      accuracy: number;
    }[];
    sourceReliability: {
      sourceTier: string;
      totalVerifications: number;
      accurateVerifications: number;
      reliability: number;
    }[];
  };

  driftMetrics: {
    scoreDistributionShift: number;
    signalWeightDrift: {
      signal: string;
      originalWeight: number;
      effectiveWeight: number;
      drift: number;
    }[];
    confidenceDrift: number;
    alertLevel: 'normal' | 'warning' | 'critical';
    lastChecked: string;
  };

  performanceOverTime: {
    period: string;
    accuracy: number;
    agreementRate: number;
    avgConfidence: number;
    decisionsCount: number;
  }[];
}

export interface DDAccuracyInput {
  decisions: {
    applicationId: string;
    ddVerdict: string;
    ddScore: number;
    ddConfidence: number;
    partnerDecision: string;
    partnerAgreed: boolean;
    scoreAdjustments: Record<string, number>;
    outcome?: string;
    decisionDate: string;
  }[];
  claimVerifications: {
    claimId: string;
    aiVerdict: string;
    aiConfidence: number;
    actualOutcome?: string;
  }[];
  signalHistory: {
    signalType: string;
    dimension: string;
    impact: number;
    applicationOutcome?: string;
  }[];
}
