// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY OS — Calibration Engine Types
// Self-improving learning loop for DD prediction accuracy
// ═══════════════════════════════════════════════════════════════════════════

export interface CalibrationConfig {
  learningRate: number; // How fast to adjust weights (0.01-0.1)
  minSampleSize: number; // Min samples before adjusting
  recalibrationThreshold: number; // Drift threshold to trigger recalibration
  lookbackPeriodDays: number; // How far back to look for patterns
}

export const DEFAULT_CALIBRATION_CONFIG: CalibrationConfig = {
  learningRate: 0.05,
  minSampleSize: 10,
  recalibrationThreshold: 0.15,
  lookbackPeriodDays: 90,
};

// ─── Feedback Loop ───────────────────────────────────────────────────────

export interface PartnerFeedbackEntry {
  applicationId: string;
  partnerId: string;
  ddReportId: string;
  // Partner's assessment of each dimension
  dimensionFeedback: {
    dimension: string;
    aiScore: number;
    partnerScore: number;
    partnerNotes?: string;
  }[];
  // Overall assessment
  overallAgreement: 'agree' | 'partially_agree' | 'disagree';
  overallNotes?: string;
  // Specific claim feedback
  claimFeedback?: {
    claimId: string;
    partnerVerdict: 'correct' | 'incorrect' | 'uncertain';
    notes?: string;
  }[];
  // Outcome tracking (filled in later)
  outcomeData?: {
    status: 'active' | 'graduated' | 'acquired' | 'failed' | 'dropped_out';
    actualMetrics?: {
      mrrAtMonth3?: number;
      mrrAtMonth6?: number;
      mrrAtMonth12?: number;
      userGrowthRate?: number;
      retentionRate?: number;
      cashBurnRate?: number;
    };
    reportedAt: string;
  };
  createdAt: string;
}

// ─── Weight Adjustments ──────────────────────────────────────────────────

export interface WeightAdjustment {
  dimension: string;
  originalWeight: number;
  adjustedWeight: number;
  adjustmentReason: string;
  confidence: number; // How confident we are in this adjustment
  basedOnSamples: number;
  effectiveFrom: string;
}

export interface SignalAdjustment {
  signalType: string;
  originalImpact: number;
  adjustedImpact: number;
  predictiveCorrelation: number; // How well this signal predicts outcomes
  sampleSize: number;
}

// ─── Calibration Report ──────────────────────────────────────────────────

export interface CalibrationReport {
  generatedAt: string;
  periodStart: string;
  periodEnd: string;

  // Summary
  overallHealth: 'excellent' | 'good' | 'needs_attention' | 'critical';
  healthScore: number; // 0-100

  // Accuracy breakdown
  predictionAccuracy: {
    overall: number;
    byDimension: { dimension: string; accuracy: number; trend: 'improving' | 'stable' | 'declining' }[];
    byStage: { stage: string; accuracy: number; sampleSize: number }[];
    byConfidenceBucket: { bucket: string; predicted: number; actual: number; calibration: number }[];
  };

  // Drift detection
  drift: {
    detected: boolean;
    severity: 'none' | 'minor' | 'moderate' | 'severe';
    affectedDimensions: string[];
    scoreShift: number;
    confidenceShift: number;
    recommendation: string;
  };

  // Weight adjustments recommended
  recommendedAdjustments: WeightAdjustment[];

  // Signal effectiveness ranking
  signalRankings: {
    signalType: string;
    dimension: string;
    effectivenessScore: number;
    trend: 'improving' | 'stable' | 'declining';
    recommendation: 'keep' | 'increase_weight' | 'decrease_weight' | 'investigate';
  }[];

  // Partner alignment
  partnerAlignment: {
    overallAgreementRate: number;
    commonDisagreements: {
      dimension: string;
      direction: 'ai_too_high' | 'ai_too_low';
      avgGap: number;
      frequency: number;
    }[];
    topInsights: string[];
  };

  // Outcome predictions vs reality
  outcomePredictions: {
    predicted: string;
    actual: string;
    applicationId: string;
    companyName: string;
    correct: boolean;
    lessonLearned: string;
  }[];

  // AI-generated recommendations
  recommendations: string[];
}

// ─── Calibration Engine Input ────────────────────────────────────────────

export interface CalibrationEngineInput {
  config: CalibrationConfig;
  feedbackEntries: PartnerFeedbackEntry[];
  currentWeights: Record<string, number>;
  currentSignalWeights: Record<string, number>;
  historicalReports?: CalibrationReport[];
}

// ─── Calibration Engine Output ───────────────────────────────────────────

export interface CalibrationEngineOutput {
  report: CalibrationReport;
  newWeights: Record<string, number>;
  newSignalWeights: Record<string, number>;
  applied: boolean;
  appliedAt?: string;
}
