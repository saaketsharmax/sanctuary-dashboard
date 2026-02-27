// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY OS — God Mode Due Diligence Types
// Metrics and patterns that traditional DD cannot derive
// ═══════════════════════════════════════════════════════════════════════════

// Founder Behavioral Fingerprint — analyze interview transcript patterns for authenticity
export interface FounderBehavioralFingerprint {
  confidenceConsistency: number; // 0-100: consistency of confidence across topics
  specificityScore: number; // 0-100: ratio of data points vs vague claims
  deflectionPatterns: {
    topic: string;
    deflectionType: 'blame_external' | 'pivot_topic' | 'vague_response' | 'hypothetical_answer';
    count: number;
    examples: string[];
  }[];
  responseLatencySignals: {
    section: string;
    avgResponseTime: number;
    anomalies: string[];
  }[];
  emotionalArcMap: {
    section: string;
    sentiment: 'passionate' | 'confident' | 'uncertain' | 'defensive' | 'evasive';
    intensity: number; // 0-10
    keyMoments: string[];
  }[];
  deceptionRiskScore: number; // 0-100: composite of all behavioral flags
  authenticityMarkers: string[]; // quotes/moments showing genuine passion/knowledge
  founderArchetype: string; // e.g. "technical-visionary", "sales-driven-operator", "domain-expert-turned-founder"
}

// Signal Consistency Index — cross-reference ALL sources for truth
export interface SignalConsistencyIndex {
  overallConsistency: number; // 0-100
  sourceComparisons: {
    source1: 'application_form' | 'interview_transcript' | 'research_findings' | 'documents' | 'public_data';
    source2: 'application_form' | 'interview_transcript' | 'research_findings' | 'documents' | 'public_data';
    consistentClaims: number;
    inconsistentClaims: number;
    contradictions: {
      claim: string;
      source1Says: string;
      source2Says: string;
      severity: 'minor' | 'major' | 'critical';
    }[];
  }[];
  storyEvolutionTracker: {
    claim: string;
    applicationVersion: string;
    interviewVersion: string;
    delta: string;
    interpretation: 'natural_refinement' | 'concerning_shift' | 'outright_contradiction';
  }[];
  trustScore: number; // 0-100 overall trustworthiness
}

// Revenue Quality Score — not just MRR but the quality of that revenue
export interface RevenueQualityScore {
  score: number; // 0-100
  concentration: {
    top1CustomerPct: number;
    top3CustomerPct: number;
    risk: 'low' | 'medium' | 'high';
  };
  expansionPotential: number; // 0-100 estimated NRR potential
  churnPrediction: { estimatedMonthlyChurn: number; basis: string };
  revenueType: 'recurring' | 'transactional' | 'usage_based' | 'hybrid';
  pricingPowerIndicators: string[];
  revenueHealthGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  organicVsPaid: { estimatedOrganicPct: number; basis: string };
}

// Capital Efficiency Predictor
export interface CapitalEfficiencyPredictor {
  burnMultiple: number; // net burn / net new ARR
  predictedRunway: number; // months
  efficiencyScore: number; // 0-100 vs stage benchmarks
  teamCostRatio: number; // team cost / total burn
  suggestedBurnRate: { amount: number; basis: string };
  comparableCompanies: {
    name: string;
    burnMultipleAtSameStage: number;
    outcome: string;
  }[];
  capitalStrategy: string; // recommendation
}

// Network Effect Potential
export interface NetworkEffectPotential {
  score: number; // 0-100
  type: 'none' | 'weak_indirect' | 'strong_indirect' | 'direct' | 'data_network' | 'marketplace';
  evidenceFromProduct: string[];
  lockInMechanisms: string[];
  switchingCostEstimate: 'trivial' | 'low' | 'medium' | 'high' | 'very_high';
  viralCoefficient: { estimated: number; basis: string };
  dataFlywheel: { exists: boolean; description: string; strength: number };
}

// Competitive Moat Durability — time-decay analysis
export interface CompetitiveMoatDurability {
  currentMoatScore: number; // 0-100
  projectedMoatIn12Months: number;
  projectedMoatIn36Months: number;
  moatTypes: {
    type: 'technology' | 'network_effects' | 'data' | 'brand' | 'switching_costs' | 'regulatory' | 'cost_advantage' | 'none';
    strength: number; // 0-100
    durability: 'increasing' | 'stable' | 'eroding';
    evidence: string;
  }[];
  biggestMoatThreat: string;
  timeToCompetitorParity: { months: number; basis: string };
  moatTrajectory: 'strengthening' | 'stable' | 'weakening';
}

// Market Timing Index — cross-reference macro signals
export interface MarketTimingIndex {
  score: number; // 0-100
  technologyReadiness: { score: number; enablers: string[] };
  regulatoryTailwinds: { score: number; factors: string[] };
  economicCycleAlignment: { score: number; reasoning: string };
  competitorActivitySignal: {
    recentFundings: number;
    totalRaised: string;
    signal: 'heating_up' | 'established' | 'cooling' | 'nascent';
  };
  adoptionCurvePosition: 'innovators' | 'early_adopters' | 'early_majority' | 'late_majority';
  timingVerdict: string;
  windowOfOpportunity: { months: number; reasoning: string };
}

// Contrarian Signal Detection — what traditional DD misses
export interface ContrarianSignals {
  unconventionalStrengths: {
    signal: string;
    whyCounterIntuitive: string;
    historicalPrecedent: string;
    potentialUpside: string;
  }[];
  hiddenRisks: {
    signal: string;
    whyOverlooked: string;
    potentialDownside: string;
  }[];
  nonObviousPatterns: {
    pattern: string;
    dataPoints: string[];
    implication: string;
  }[];
  founderEdgeCases: {
    trait: string;
    conventionalView: string;
    actualCorrelation: string;
  }[];
}

// Pattern Matching — compare against historical cohorts
export interface PatternMatch {
  closestHistoricalMatches: {
    companyName: string;
    similarity: number; // 0-100
    outcome: string;
    keyParallels: string[];
    keyDifferences: string[];
  }[];
  archetypeMatch: {
    archetype: string;
    description: string;
    typicalOutcome: string;
    survivalRate: number;
  };
  outlierFactors: string[]; // what makes this startup different from any pattern
}

// The God Mode DD Report — the full picture
export interface GodModeDDReport {
  behavioralFingerprint: FounderBehavioralFingerprint;
  signalConsistency: SignalConsistencyIndex;
  revenueQuality: RevenueQualityScore;
  capitalEfficiency: CapitalEfficiencyPredictor;
  networkEffectPotential: NetworkEffectPotential;
  moatDurability: CompetitiveMoatDurability;
  marketTiming: MarketTimingIndex;
  contrarianSignals: ContrarianSignals;
  patternMatch: PatternMatch;

  // Composite scores
  godModeScore: number; // 0-100 weighted composite
  convictionLevel: 'strong_conviction_invest' | 'conviction_invest' | 'neutral' | 'conviction_pass' | 'strong_conviction_pass';
  alphaSignals: string[]; // top 3 signals traditional DD would miss
  blindSpots: string[]; // what we still can't find out

  // The killer insight
  oneLineVerdict: string;
  memoAddendum: string; // 2-3 paragraphs for the investment memo

  // Metadata
  generatedAt: string;
  modelUsed: string;
  analysisDepth: number; // how many data sources were cross-referenced
}

// Agent input
export interface GodModeDDInput {
  applicationId: string;
  companyName: string;
  applicationData: {
    problemDescription: string;
    solutionDescription: string;
    targetCustomer: string;
    stage: string;
    userCount: number;
    mrr: number;
    biggestChallenge: string;
    whySanctuary: string;
    founders: { name: string; role: string; experience: string; linkedin?: string }[];
    companyWebsite?: string;
  };
  interviewTranscript: { role: string; content: string; timestamp?: string }[];
  interviewMetadata?: {
    duration?: number;
    totalMessages?: number;
    responsePatterns?: Record<string, unknown>;
  };
  signals: { type: string; content: string; dimension: string; impact: number }[];
  assessment?: {
    founderScore: number;
    problemScore: number;
    userValueScore: number;
    executionScore: number;
    overallScore: number;
    recommendation: string;
    keyStrengths: { strength: string; evidence: string }[];
    keyRisks: { risk: string; severity: string; evidence: string }[];
  };
  researchData?: Record<string, unknown>;
  ddReport?: Record<string, unknown>;
  existingMemo?: Record<string, unknown>;
}
