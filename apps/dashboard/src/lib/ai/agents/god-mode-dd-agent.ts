// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY OS — God Mode Due Diligence Agent
// Finds what traditional DD misses: behavioral patterns, signal consistency,
// contrarian signals, moat durability, and non-obvious correlations
// ═══════════════════════════════════════════════════════════════════════════

import Anthropic from '@anthropic-ai/sdk';
import {
  GOD_MODE_DD_SYSTEM_PROMPT,
  GOD_MODE_DD_USER_PROMPT,
} from '../prompts/god-mode-dd-system';
import type { GodModeDDInput, GodModeDDReport } from '../types/god-mode-dd';

// ─── God Mode DD Agent ───────────────────────────────────────────────────

export class GodModeDDAgent {
  private client: Anthropic;
  private model = 'claude-sonnet-4-20250514';

  constructor() {
    this.client = new Anthropic();
  }

  async analyze(input: GodModeDDInput): Promise<GodModeDDReport> {
    // Format all input data for the prompt
    const applicationData = JSON.stringify(input.applicationData, null, 2);
    const interviewTranscript = this.formatTranscript(input.interviewTranscript);
    const signals = JSON.stringify(input.signals, null, 2);
    const assessment = input.assessment ? JSON.stringify(input.assessment, null, 2) : 'No assessment available';
    const researchData = input.researchData ? JSON.stringify(input.researchData, null, 2) : 'No research data available';
    const ddReport = input.ddReport ? JSON.stringify(input.ddReport, null, 2) : 'No standard DD report available';
    const existingMemo = input.existingMemo ? JSON.stringify(input.existingMemo, null, 2) : 'No existing memo available';

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 8192,
      system: GOD_MODE_DD_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: GOD_MODE_DD_USER_PROMPT(
            input.companyName,
            applicationData,
            interviewTranscript,
            signals,
            assessment,
            researchData,
            ddReport,
            existingMemo,
          ),
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const parsed = JSON.parse(text) as GodModeDDReport;

    // Post-process: calculate composite godModeScore if not already set
    parsed.godModeScore = this.calculateGodModeScore(parsed);
    parsed.convictionLevel = this.determineConviction(parsed.godModeScore);
    parsed.generatedAt = new Date().toISOString();
    parsed.modelUsed = this.model;
    parsed.analysisDepth = this.countDataSources(input);

    return parsed;
  }

  private formatTranscript(transcript: { role: string; content: string; timestamp?: string }[]): string {
    if (!transcript || transcript.length === 0) return 'No transcript available';
    return transcript
      .map((msg, i) => `[${msg.role}] ${msg.content}`)
      .join('\n\n');
  }

  private calculateGodModeScore(report: GodModeDDReport): number {
    const weights = {
      behavioral: 0.15,
      consistency: 0.15,
      revenueQuality: 0.10,
      capitalEfficiency: 0.10,
      networkEffect: 0.10,
      moatDurability: 0.15,
      marketTiming: 0.10,
      patternMatch: 0.05,
      contrarian: 0.10, // contrarian signals can significantly shift score
    };

    const scores = {
      behavioral: 100 - (report.behavioralFingerprint?.deceptionRiskScore || 50), // invert — low deception = good
      consistency: report.signalConsistency?.overallConsistency || 50,
      revenueQuality: report.revenueQuality?.score || 50,
      capitalEfficiency: report.capitalEfficiency?.efficiencyScore || 50,
      networkEffect: report.networkEffectPotential?.score || 50,
      moatDurability: report.moatDurability?.currentMoatScore || 50,
      marketTiming: report.marketTiming?.score || 50,
      patternMatch: report.patternMatch?.archetypeMatch?.survivalRate || 50,
      contrarian: this.scoreContrarianSignals(report.contrarianSignals),
    };

    let composite = 0;
    for (const [key, weight] of Object.entries(weights)) {
      composite += (scores[key as keyof typeof scores] || 50) * weight;
    }

    return Math.round(Math.min(100, Math.max(0, composite)));
  }

  private scoreContrarianSignals(signals: GodModeDDReport['contrarianSignals']): number {
    if (!signals) return 50;
    const strengths = (signals.unconventionalStrengths?.length || 0) * 10;
    const risks = (signals.hiddenRisks?.length || 0) * -8;
    return Math.min(100, Math.max(0, 50 + strengths + risks));
  }

  private determineConviction(score: number): GodModeDDReport['convictionLevel'] {
    if (score >= 85) return 'strong_conviction_invest';
    if (score >= 70) return 'conviction_invest';
    if (score >= 45) return 'neutral';
    if (score >= 30) return 'conviction_pass';
    return 'strong_conviction_pass';
  }

  private countDataSources(input: GodModeDDInput): number {
    let count = 0;
    if (input.applicationData) count++;
    if (input.interviewTranscript?.length > 0) count++;
    if (input.signals?.length > 0) count++;
    if (input.assessment) count++;
    if (input.researchData) count++;
    if (input.ddReport) count++;
    if (input.existingMemo) count++;
    if (input.interviewMetadata) count++;
    return count;
  }
}

// ─── Mock Agent ──────────────────────────────────────────────────────────

export class MockGodModeDDAgent {
  async analyze(input: GodModeDDInput): Promise<GodModeDDReport> {
    return {
      behavioralFingerprint: {
        confidenceConsistency: 72,
        specificityScore: 68,
        deflectionPatterns: [
          {
            topic: 'competition',
            deflectionType: 'vague_response',
            count: 2,
            examples: ['We don\'t really have direct competitors'],
          },
        ],
        responseLatencySignals: [
          { section: 'founder_dna', avgResponseTime: 12, anomalies: [] },
          { section: 'problem_interrogation', avgResponseTime: 18, anomalies: ['Long pause on customer count question'] },
        ],
        emotionalArcMap: [
          { section: 'founder_dna', sentiment: 'passionate', intensity: 8, keyMoments: ['Described personal experience with the problem'] },
          { section: 'market_competition', sentiment: 'defensive', intensity: 6, keyMoments: ['Dismissive of competitors'] },
        ],
        deceptionRiskScore: 28,
        authenticityMarkers: [
          'Founder described a specific customer conversation with exact quotes',
          'Admitted to a pivot that didn\'t work and explained lessons learned',
        ],
        founderArchetype: 'domain-expert-turned-founder',
      },
      signalConsistency: {
        overallConsistency: 78,
        sourceComparisons: [
          {
            source1: 'application_form',
            source2: 'interview_transcript',
            consistentClaims: 12,
            inconsistentClaims: 2,
            contradictions: [
              {
                claim: 'Number of customer calls',
                source1Says: '47 customer discovery calls',
                source2Says: 'around 30-40 conversations',
                severity: 'minor',
              },
            ],
          },
        ],
        storyEvolutionTracker: [
          {
            claim: 'MRR figure',
            applicationVersion: '$2,400 MRR',
            interviewVersion: '$2,400 monthly recurring revenue from 12 paying customers',
            delta: 'Added specificity — consistent',
            interpretation: 'natural_refinement',
          },
        ],
        trustScore: 82,
      },
      revenueQuality: {
        score: 65,
        concentration: { top1CustomerPct: 35, top3CustomerPct: 70, risk: 'high' },
        expansionPotential: 60,
        churnPrediction: { estimatedMonthlyChurn: 5, basis: 'Early stage B2B typical range' },
        revenueType: 'recurring',
        pricingPowerIndicators: ['Customers mentioned willingness to pay more for additional features'],
        revenueHealthGrade: 'C',
        organicVsPaid: { estimatedOrganicPct: 80, basis: 'Founder described word-of-mouth growth' },
      },
      capitalEfficiency: {
        burnMultiple: 4.2,
        predictedRunway: 14,
        efficiencyScore: 62,
        teamCostRatio: 0.75,
        suggestedBurnRate: { amount: 30000, basis: 'Pre-seed stage benchmark for 3-person team' },
        comparableCompanies: [
          { name: 'Similar B2B SaaS (pre-seed)', burnMultipleAtSameStage: 5.0, outcome: 'Raised seed at 18 months' },
        ],
        capitalStrategy: 'Focus on reducing burn multiple below 3x before raising seed',
      },
      networkEffectPotential: {
        score: 35,
        type: 'weak_indirect',
        evidenceFromProduct: ['Integration marketplace could create indirect network effects'],
        lockInMechanisms: ['Data accumulation over time', 'Workflow customization'],
        switchingCostEstimate: 'medium',
        viralCoefficient: { estimated: 0.3, basis: 'B2B products typically have low viral coefficient' },
        dataFlywheel: { exists: true, description: 'Usage data improves recommendations', strength: 40 },
      },
      moatDurability: {
        currentMoatScore: 45,
        projectedMoatIn12Months: 55,
        projectedMoatIn36Months: 65,
        moatTypes: [
          { type: 'data', strength: 50, durability: 'increasing', evidence: 'Proprietary dataset growing with each customer' },
          { type: 'switching_costs', strength: 40, durability: 'stable', evidence: 'Workflow integration creates stickiness' },
        ],
        biggestMoatThreat: 'Well-funded competitor could replicate the data advantage within 12-18 months',
        timeToCompetitorParity: { months: 18, basis: 'Data collection rate and API integration depth' },
        moatTrajectory: 'strengthening',
      },
      marketTiming: {
        score: 72,
        technologyReadiness: { score: 85, enablers: ['AI/ML maturity', 'Cloud infrastructure costs declining'] },
        regulatoryTailwinds: { score: 60, factors: ['No significant regulatory barriers or enablers'] },
        economicCycleAlignment: { score: 65, reasoning: 'B2B efficiency tools perform well in any economic cycle' },
        competitorActivitySignal: { recentFundings: 3, totalRaised: '$25M', signal: 'heating_up' },
        adoptionCurvePosition: 'early_adopters',
        timingVerdict: 'Good timing — market is validated but not yet crowded. 12-18 month window before leaders emerge.',
        windowOfOpportunity: { months: 15, reasoning: 'Competitor funding suggests 12-18 months before market consolidation' },
      },
      contrarianSignals: {
        unconventionalStrengths: [
          {
            signal: 'Founder has no VC experience',
            whyCounterIntuitive: 'Typically seen as a weakness',
            historicalPrecedent: 'Bootstrapped founders who raise later tend to be more capital efficient',
            potentialUpside: 'Will be disciplined with accelerator resources',
          },
        ],
        hiddenRisks: [
          {
            signal: 'Strong early traction',
            whyOverlooked: 'Traction is usually seen as purely positive',
            potentialDownside: 'Could be serving early adopters whose needs diverge from mainstream market',
          },
        ],
        nonObviousPatterns: [
          {
            pattern: 'Founder asks clarifying questions during interview',
            dataPoints: ['Asked for clarification 3 times', 'Questions showed active listening'],
            implication: 'Correlates with coachability and intellectual honesty',
          },
        ],
        founderEdgeCases: [
          {
            trait: 'Solo founder',
            conventionalView: 'Higher risk — no co-founder to share burden',
            actualCorrelation: 'Solo founders with domain expertise and clear hiring plan can move faster in early stages',
          },
        ],
      },
      patternMatch: {
        closestHistoricalMatches: [
          {
            companyName: 'Notion (early stage)',
            similarity: 62,
            outcome: '$10B+ valuation',
            keyParallels: ['Tool-based SaaS', 'Bottom-up adoption', 'Workflow lock-in'],
            keyDifferences: ['Notion targeted broader market', 'Different founding team size'],
          },
        ],
        archetypeMatch: {
          archetype: 'domain-expert-goes-digital',
          description: 'Industry expert who identifies a problem from personal experience and builds a software solution',
          typicalOutcome: 'Strong product-market fit when domain expertise is genuine. Key risk is ability to scale beyond niche.',
          survivalRate: 68,
        },
        outlierFactors: [
          'Unusually high customer engagement for the stage (12 paying users at pre-seed)',
        ],
      },
      godModeScore: 67,
      convictionLevel: 'neutral',
      alphaSignals: [
        'Behavioral analysis shows genuine domain expertise — not performing, actually knows the space deeply',
        'Signal consistency is high (78%) suggesting trustworthy founder narrative',
        'Moat trajectory is strengthening — data advantage compounds over time',
      ],
      blindSpots: [
        'No visibility into actual financial statements — all revenue data is self-reported',
        'Cannot verify customer satisfaction beyond founder claims without direct customer interviews',
        'Competitive landscape may be more active than public data suggests (stealth startups)',
      ],
      oneLineVerdict: 'A credible domain expert building a real product with real traction, but revenue concentration and weak moat need to be addressed before the market heats up further.',
      memoAddendum: `Deep behavioral analysis reveals a founder whose confidence is authentic rather than performed. Across the interview, specificity scores remained consistently high (68/100), with the founder providing concrete customer quotes, specific revenue figures, and detailed product decisions. The two deflection instances occurred around competitive positioning — a common blind spot for technical founders, not a red flag.

The most compelling signal from this analysis is the signal consistency index: claims made in the application form align with interview statements at a 78% rate, with discrepancies limited to natural refinements (e.g., "47 calls" becoming "30-40 conversations" — likely reflecting a shift from total outreach to meaningful conversations). This level of consistency, combined with unprompted admissions of a failed pivot, suggests high founder trustworthiness.

The primary concern is revenue quality. With top-1 customer concentration at 35% and top-3 at 70%, the $2,400 MRR is fragile. However, the organic acquisition pattern (80% estimated word-of-mouth) and emerging data flywheel suggest the foundation for more diversified growth. The 12-18 month market timing window gives adequate runway to address concentration risk if the team executes on their stated hiring plan.`,
      generatedAt: new Date().toISOString(),
      modelUsed: 'mock',
      analysisDepth: 5,
    };
  }
}

// ─── Factory ─────────────────────────────────────────────────────────────

export function getGodModeDDAgent(): GodModeDDAgent | MockGodModeDDAgent {
  if (process.env.ANTHROPIC_API_KEY) {
    return new GodModeDDAgent();
  }
  return new MockGodModeDDAgent();
}
