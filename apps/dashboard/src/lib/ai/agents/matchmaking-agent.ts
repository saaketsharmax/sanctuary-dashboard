// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY OS — Matchmaking Agent
// Deep mentor-startup and GP-startup matching beyond keyword alignment
// ═══════════════════════════════════════════════════════════════════════════

import Anthropic from '@anthropic-ai/sdk';
import {
  MATCHMAKING_SYSTEM_PROMPT,
  MATCHMAKING_USER_PROMPT,
} from '../prompts/matchmaking-system';
import type {
  MatchmakingInput,
  MatchmakingOutput,
  MatchCandidate,
  MatchResult,
} from '../types/matchmaking';

// ─── Matchmaking Agent ───────────────────────────────────────────────────

export class MatchmakingAgent {
  private client: Anthropic;
  private model = 'claude-sonnet-4-20250514';

  constructor() {
    this.client = new Anthropic();
  }

  async findMatches(input: MatchmakingInput): Promise<MatchmakingOutput> {
    // Pre-filter: remove candidates with hard dealbreakers
    const eligibleCandidates = this.preFilter(input);

    if (eligibleCandidates.length === 0) {
      return {
        requestId: input.request.requesterId,
        matches: [],
        searchStrategy: 'No eligible candidates after applying hard filters (availability, stage, dealbreakers).',
        marketplaceInsights: {
          totalCandidatesEvaluated: input.candidates.length,
          averageScore: 0,
          gapAnalysis: [`No candidates available for ${input.request.needs.join(', ')} in ${input.request.context.industry}`],
          recommendations: ['Expand the mentor/GP network in this domain'],
        },
      };
    }

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: MATCHMAKING_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: MATCHMAKING_USER_PROMPT(
            JSON.stringify(input.request, null, 2),
            JSON.stringify(eligibleCandidates, null, 2),
            JSON.stringify(input.historicalMatches || [], null, 2),
          ),
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const parsed = JSON.parse(text) as MatchmakingOutput;

    // Post-process: ensure proper ranking and scoring
    parsed.matches = parsed.matches
      .sort((a, b) => b.score.overallScore - a.score.overallScore)
      .map((match, idx) => ({ ...match, rank: idx + 1 }));

    parsed.requestId = input.request.requesterId;
    parsed.marketplaceInsights.totalCandidatesEvaluated = input.candidates.length;

    return parsed;
  }

  private preFilter(input: MatchmakingInput): MatchCandidate[] {
    const { request, candidates } = input;

    return candidates.filter((candidate) => {
      // Filter out unavailable candidates for urgent requests
      if (request.urgency === 'immediate' && candidate.availability === 'low') return false;

      // Filter out candidates who've hit their max capacity
      if (candidate.preferences.maxStartups <= 0) return false;

      // Filter out previous mentors (avoid re-matching)
      if (request.context.previousMentors.includes(candidate.id)) return false;

      // Check dealbreakers
      const hasIndustryDealbreaker = candidate.preferences.dealbreakers.some(
        (db) => db.toLowerCase() === request.context.industry.toLowerCase(),
      );
      if (hasIndustryDealbreaker) return false;

      return true;
    });
  }
}

// ─── Mock Agent ──────────────────────────────────────────────────────────

export class MockMatchmakingAgent {
  async findMatches(input: MatchmakingInput): Promise<MatchmakingOutput> {
    const mockMatches: MatchResult[] = input.candidates.slice(0, 3).map((candidate, idx) => ({
      id: `match-${idx + 1}`,
      matchType: input.request.matchType,
      candidate,
      score: {
        overallScore: 85 - idx * 10,
        dimensions: {
          expertiseAlignment: { score: 90 - idx * 5, weight: 0.30, reasoning: `${candidate.name} has relevant experience in ${candidate.expertise[0] || 'this domain'}` },
          stageRelevance: { score: 85 - idx * 5, weight: 0.25, reasoning: 'Has operated at similar stage before' },
          industryFit: { score: 80 - idx * 5, weight: 0.15, reasoning: `Experience in ${candidate.industries[0] || 'related industry'}` },
          availabilityMatch: { score: candidate.availability === 'high' ? 90 : candidate.availability === 'medium' ? 60 : 30, weight: 0.10, reasoning: `${candidate.availability} availability` },
          trackRecordStrength: { score: Math.min(100, candidate.trackRecord.avgRating * 20), weight: 0.15, reasoning: `${candidate.trackRecord.successCount} successful engagements` },
          personalityFit: { score: 70, weight: 0.05, reasoning: 'Inferred compatible communication style' },
        },
        confidence: idx === 0 ? 'high' : 'medium',
        reasoning: `${candidate.name} is a strong match based on expertise alignment and proven track record.`,
        potentialChallenges: ['Time zone differences may require async communication'],
        suggestedEngagementFormat: 'biweekly_1on1',
        expectedOutcomes: [`Help with ${input.request.needs[0] || 'primary challenge'}`, 'Strategic introductions'],
      },
      rank: idx + 1,
      status: 'suggested',
    }));

    return {
      requestId: input.request.requesterId,
      matches: mockMatches,
      searchStrategy: 'Evaluated candidates by expertise alignment, stage relevance, and track record.',
      marketplaceInsights: {
        totalCandidatesEvaluated: input.candidates.length,
        averageScore: mockMatches.reduce((sum, m) => sum + m.score.overallScore, 0) / mockMatches.length,
        gapAnalysis: [],
        recommendations: ['Consider expanding mentor network in the AI/ML domain'],
      },
    };
  }
}

// ─── Factory ─────────────────────────────────────────────────────────────

export function getMatchmakingAgent(): MatchmakingAgent | MockMatchmakingAgent {
  if (process.env.ANTHROPIC_API_KEY) {
    return new MatchmakingAgent();
  }
  return new MockMatchmakingAgent();
}
