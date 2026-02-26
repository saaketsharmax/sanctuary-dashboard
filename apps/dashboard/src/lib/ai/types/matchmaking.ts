// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY OS — Matchmaking Agent Types
// Powers mentor-startup and GP-startup matching
// ═══════════════════════════════════════════════════════════════════════════

export type MatchType = 'mentor_startup' | 'gp_startup' | 'founder_founder' | 'startup_startup';

export interface MatchCandidate {
  id: string;
  type: 'mentor' | 'gp' | 'founder' | 'startup';
  name: string;
  expertise: string[];
  industries: string[];
  stagePreference: string[];
  location: string;
  availability: 'high' | 'medium' | 'low';
  trackRecord: {
    successCount: number;
    totalEngagements: number;
    avgRating: number;
  };
  preferences: {
    maxStartups: number;
    preferredStage: string[];
    dealbreakers: string[];
  };
  bio?: string;
  linkedinUrl?: string;
}

export interface MatchRequest {
  requesterId: string;
  requesterType: 'startup' | 'founder';
  matchType: MatchType;
  needs: string[];
  urgency: 'immediate' | 'soon' | 'flexible';
  context: {
    stage: string;
    industry: string;
    currentChallenges: string[];
    previousMentors: string[];
    assessment?: Record<string, unknown>;
    ddReport?: Record<string, unknown>;
  };
}

export interface MatchScore {
  overallScore: number; // 0-100
  dimensions: {
    expertiseAlignment: { score: number; weight: number; reasoning: string };
    stageRelevance: { score: number; weight: number; reasoning: string };
    industryFit: { score: number; weight: number; reasoning: string };
    availabilityMatch: { score: number; weight: number; reasoning: string };
    trackRecordStrength: { score: number; weight: number; reasoning: string };
    personalityFit: { score: number; weight: number; reasoning: string };
  };
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  potentialChallenges: string[];
  suggestedEngagementFormat: 'weekly_1on1' | 'biweekly_1on1' | 'monthly_advisory' | 'project_based' | 'on_demand';
  expectedOutcomes: string[];
}

export interface MatchResult {
  id: string;
  matchType: MatchType;
  candidate: MatchCandidate;
  score: MatchScore;
  rank: number;
  status: 'suggested' | 'pending_review' | 'approved' | 'intro_sent' | 'active' | 'completed' | 'declined';
}

export interface MatchmakingOutput {
  requestId: string;
  matches: MatchResult[];
  searchStrategy: string;
  marketplaceInsights: {
    totalCandidatesEvaluated: number;
    averageScore: number;
    gapAnalysis: string[];
    recommendations: string[];
  };
}

export interface MatchmakingInput {
  request: MatchRequest;
  candidates: MatchCandidate[];
  historicalMatches?: {
    candidateId: string;
    startupId: string;
    outcome: 'successful' | 'neutral' | 'unsuccessful';
    feedback: string;
  }[];
}
