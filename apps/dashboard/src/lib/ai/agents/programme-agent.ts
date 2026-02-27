// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY OS — Programme Agent
// Generates tailored 90-day accelerator programmes with milestones, KPIs,
// mentor matching triggers, and weekly check-in schedules
// ═══════════════════════════════════════════════════════════════════════════

import Anthropic from '@anthropic-ai/sdk';
import {
  PROGRAMME_SYSTEM_PROMPT,
  PROGRAMME_USER_PROMPT,
} from '../prompts/programme-system';
import type {
  Programme,
  ProgrammeInput,
  ProgrammePhase,
  Milestone,
} from '../types/programme';

// ─── Programme Agent ─────────────────────────────────────────────────────

export class ProgrammeAgent {
  private client: Anthropic;
  private model = 'claude-sonnet-4-20250514';

  constructor() {
    this.client = new Anthropic();
  }

  async generateProgramme(input: ProgrammeInput): Promise<Programme> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: PROGRAMME_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: PROGRAMME_USER_PROMPT(
            input.companyName,
            JSON.stringify(input.applicationData, null, 2),
            JSON.stringify(input.founders, null, 2),
            input.aiAssessment ? JSON.stringify(input.aiAssessment, null, 2) : 'Not available',
            input.ddReport ? JSON.stringify(input.ddReport, null, 2) : 'Not available',
          ),
        },
      ],
    });

    const text = response.content?.[0]?.type === 'text' ? response.content[0].text : '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsed: any = {};
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
    } catch {
      console.error('Programme agent: failed to parse response JSON');
    }

    // Post-process: fill in computed fields
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 90 * 86400000);

    const programme: Programme = {
      id: `prog-${input.applicationId}`,
      startupId: '', // Filled by the API route
      applicationId: input.applicationId,
      companyName: input.companyName,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      currentWeek: 1,
      phases: Array.isArray(parsed.phases) ? parsed.phases : [],
      overallProgress: 0,
      riskLevel: this.assessRisk(input),
      nextMilestone: this.findNextMilestone(parsed.phases || []),
      mentorMatchingTriggers: parsed.mentorMatchingTriggers || [],
      weeklyCheckInSchedule: parsed.weeklyCheckInSchedule || this.generateDefaultSchedule(),
      generatedAt: new Date().toISOString(),
      modelUsed: this.model,
    };

    // Ensure milestone IDs and dates
    let milestoneIdx = 0;
    for (const phase of programme.phases || []) {
      if (!phase.milestones) phase.milestones = [];
      for (const milestone of phase.milestones) {
        if (!milestone.id) milestone.id = `ms-${++milestoneIdx}`;
        if (!milestone.status) milestone.status = 'upcoming';
        if (!milestone.dueDate) {
          const dueWeek = milestone.weekNumber || milestoneIdx;
          milestone.dueDate = new Date(
            startDate.getTime() + dueWeek * 7 * 86400000,
          ).toISOString();
        }
      }
    }

    return programme;
  }

  private assessRisk(input: ProgrammeInput): Programme['riskLevel'] {
    const assessment = input.aiAssessment;
    if (!assessment) return 'at_risk';

    if (assessment.overallScore >= 75) return 'on_track';
    if (assessment.overallScore >= 50) return 'at_risk';
    return 'behind';
  }

  private findNextMilestone(phases: ProgrammePhase[]): Milestone | null {
    for (const phase of phases) {
      for (const milestone of phase.milestones) {
        if (milestone.status === 'upcoming' || milestone.status === 'active') {
          return milestone;
        }
      }
    }
    return null;
  }

  private generateDefaultSchedule() {
    return Array.from({ length: 12 }, (_, i) => ({
      weekNumber: i + 1,
      focus: i < 4 ? 'Foundation check-in' : i < 8 ? 'Growth metrics review' : 'Launch preparation',
      attendees: ['founder', 'programme_manager'],
    }));
  }
}

// ─── Mock Agent ──────────────────────────────────────────────────────────

export class MockProgrammeAgent {
  async generateProgramme(input: ProgrammeInput): Promise<Programme> {
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 90 * 86400000);

    const phases: ProgrammePhase[] = [
      {
        name: 'Foundation',
        weeks: '1-4',
        focus: 'Establish baselines, address critical gaps, set up tracking',
        milestones: [
          {
            id: 'ms-1',
            weekNumber: 1,
            category: 'operations',
            title: 'Baseline Metrics Setup',
            description: 'Implement analytics tracking and establish baseline KPIs for all key metrics.',
            successCriteria: ['Analytics dashboard live', 'Weekly reporting cadence established', 'Baseline numbers documented'],
            kpiTargets: [
              { metric: 'tracking_coverage', target: '100%', unit: 'percent', baseline: '0%' },
            ],
            mentorSupportNeeded: ['analytics_setup', 'metric_definition'],
            resources: ['Mixpanel/Amplitude setup guide', 'KPI framework template'],
            dependencies: [],
            status: 'upcoming',
            dueDate: new Date(startDate.getTime() + 7 * 86400000).toISOString(),
          },
          {
            id: 'ms-2',
            weekNumber: 2,
            category: 'product',
            title: 'Customer Discovery Sprint',
            description: `Conduct 15 customer interviews to validate ${input.applicationData.problemDescription.slice(0, 50)}...`,
            successCriteria: ['15 interviews completed', 'Pain points ranked by frequency', 'Top 3 feature requests identified'],
            kpiTargets: [
              { metric: 'interviews_completed', target: 15, unit: 'count', baseline: 0 },
              { metric: 'insights_documented', target: 10, unit: 'count' },
            ],
            mentorSupportNeeded: ['customer_development', 'interview_techniques'],
            resources: ['Customer interview script template', 'Insight synthesis framework'],
            dependencies: [],
            status: 'upcoming',
            dueDate: new Date(startDate.getTime() + 14 * 86400000).toISOString(),
          },
          {
            id: 'ms-3',
            weekNumber: 4,
            category: 'growth',
            title: 'Growth Channel Validation',
            description: 'Test 3 growth channels with minimum viable experiments.',
            successCriteria: ['3 channels tested', 'CAC calculated per channel', 'Winner identified'],
            kpiTargets: [
              { metric: 'channels_tested', target: 3, unit: 'count' },
              { metric: 'mrr', target: Math.round((input.applicationData.mrr || 0) * 1.2), unit: 'USD', baseline: input.applicationData.mrr },
            ],
            mentorSupportNeeded: ['growth_marketing', 'channel_strategy'],
            resources: ['Growth experiment template', 'Channel scoring matrix'],
            dependencies: ['ms-1'],
            status: 'upcoming',
            dueDate: new Date(startDate.getTime() + 28 * 86400000).toISOString(),
          },
        ],
      },
      {
        name: 'Acceleration',
        weeks: '5-8',
        focus: 'Execute on validated channels, iterate product, scale operations',
        milestones: [
          {
            id: 'ms-4',
            weekNumber: 5,
            category: 'product',
            title: 'Product Iteration Cycle',
            description: 'Ship top 3 features from customer discovery. Run A/B tests on key flows.',
            successCriteria: ['3 features shipped', 'A/B tests running on onboarding flow', 'NPS survey deployed'],
            kpiTargets: [
              { metric: 'features_shipped', target: 3, unit: 'count' },
              { metric: 'user_count', target: Math.round((input.applicationData.userCount || 0) * 1.5), unit: 'users', baseline: input.applicationData.userCount },
            ],
            mentorSupportNeeded: ['product_management', 'ux_design'],
            resources: ['Feature prioritization framework', 'A/B testing guide'],
            dependencies: ['ms-2'],
            status: 'upcoming',
            dueDate: new Date(startDate.getTime() + 35 * 86400000).toISOString(),
          },
          {
            id: 'ms-5',
            weekNumber: 6,
            category: 'growth',
            title: 'Scale Winning Channel',
            description: 'Double down on the best-performing growth channel from Phase 1.',
            successCriteria: ['2x spend on winning channel', 'Conversion funnel optimized', 'Retention cohort analysis done'],
            kpiTargets: [
              { metric: 'mrr', target: Math.round((input.applicationData.mrr || 0) * 1.8), unit: 'USD' },
              { metric: 'user_count', target: Math.round((input.applicationData.userCount || 0) * 2), unit: 'users' },
            ],
            mentorSupportNeeded: ['paid_acquisition', 'funnel_optimization'],
            resources: ['Funnel optimization playbook'],
            dependencies: ['ms-3'],
            status: 'upcoming',
            dueDate: new Date(startDate.getTime() + 42 * 86400000).toISOString(),
          },
          {
            id: 'ms-6',
            weekNumber: 8,
            category: 'team',
            title: 'Key Hire #1',
            description: 'Make first strategic hire to address the biggest team gap.',
            successCriteria: ['Job posted and promoted', 'Pipeline of 10+ candidates', 'Offer extended or contractor engaged'],
            kpiTargets: [
              { metric: 'candidates_screened', target: 10, unit: 'count' },
            ],
            mentorSupportNeeded: ['recruiting', 'org_design'],
            resources: ['Hiring scorecard template', 'Early-stage comp benchmarks'],
            dependencies: [],
            status: 'upcoming',
            dueDate: new Date(startDate.getTime() + 56 * 86400000).toISOString(),
          },
        ],
      },
      {
        name: 'Launch Pad',
        weeks: '9-12',
        focus: 'Demonstrate trajectory, prepare fundraise materials, graduate',
        milestones: [
          {
            id: 'ms-7',
            weekNumber: 9,
            category: 'fundraise',
            title: 'Investor Materials Prep',
            description: 'Create pitch deck, financial model, and data room for next raise.',
            successCriteria: ['Pitch deck completed and reviewed', 'Financial model with 3 scenarios', 'Data room organized'],
            kpiTargets: [
              { metric: 'deck_reviews', target: 3, unit: 'count' },
              { metric: 'practice_pitches', target: 5, unit: 'count' },
            ],
            mentorSupportNeeded: ['fundraising', 'financial_modeling', 'pitch_coaching'],
            resources: ['Pitch deck template', 'Financial model template', 'Data room checklist'],
            dependencies: ['ms-5'],
            status: 'upcoming',
            dueDate: new Date(startDate.getTime() + 63 * 86400000).toISOString(),
          },
          {
            id: 'ms-8',
            weekNumber: 10,
            category: 'market',
            title: 'Strategic Partnerships',
            description: 'Establish 2-3 strategic partnerships or integrations.',
            successCriteria: ['3 partnership conversations initiated', '1+ LOI or integration agreement signed'],
            kpiTargets: [
              { metric: 'partnerships_initiated', target: 3, unit: 'count' },
              { metric: 'partnerships_signed', target: 1, unit: 'count' },
            ],
            mentorSupportNeeded: ['business_development', 'partnership_strategy'],
            resources: ['Partnership pitch template'],
            dependencies: [],
            status: 'upcoming',
            dueDate: new Date(startDate.getTime() + 70 * 86400000).toISOString(),
          },
          {
            id: 'ms-9',
            weekNumber: 12,
            category: 'growth',
            title: 'Demo Day Preparation',
            description: 'Final metrics push and demo day pitch preparation.',
            successCriteria: ['Metrics hit demo day targets', 'Pitch rehearsed 5+ times', 'Investor list prepared'],
            kpiTargets: [
              { metric: 'mrr', target: Math.round((input.applicationData.mrr || 0) * 3), unit: 'USD' },
              { metric: 'user_count', target: Math.round((input.applicationData.userCount || 0) * 3), unit: 'users' },
            ],
            mentorSupportNeeded: ['pitch_coaching', 'storytelling'],
            resources: ['Demo day playbook'],
            dependencies: ['ms-7'],
            status: 'upcoming',
            dueDate: new Date(startDate.getTime() + 84 * 86400000).toISOString(),
          },
        ],
      },
    ];

    return {
      id: `prog-${input.applicationId}`,
      startupId: '',
      applicationId: input.applicationId,
      companyName: input.companyName,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      currentWeek: 1,
      phases,
      overallProgress: 0,
      riskLevel: 'on_track',
      nextMilestone: phases[0].milestones[0],
      mentorMatchingTriggers: [
        { milestone: 'ms-1', expertise: ['analytics', 'data'], urgency: 'immediate' },
        { milestone: 'ms-2', expertise: ['customer_development'], urgency: 'immediate' },
        { milestone: 'ms-3', expertise: ['growth_marketing'], urgency: 'this_week' },
        { milestone: 'ms-7', expertise: ['fundraising', 'pitch_coaching'], urgency: 'next_phase' },
      ],
      weeklyCheckInSchedule: Array.from({ length: 12 }, (_, i) => ({
        weekNumber: i + 1,
        focus: i < 4 ? 'Foundation progress' : i < 8 ? 'Growth metrics' : 'Launch prep',
        attendees: ['founder', 'programme_manager'],
      })),
      generatedAt: new Date().toISOString(),
      modelUsed: 'mock',
    };
  }
}

// ─── Factory ─────────────────────────────────────────────────────────────

export function getProgrammeAgent(): ProgrammeAgent | MockProgrammeAgent {
  if (process.env.ANTHROPIC_API_KEY) {
    return new ProgrammeAgent();
  }
  return new MockProgrammeAgent();
}
