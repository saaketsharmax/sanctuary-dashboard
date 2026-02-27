// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY OS — Programme Agent Types
// 90-day accelerator programme with milestones, KPIs, and mentor matching
// ═══════════════════════════════════════════════════════════════════════════

export type MilestoneStatus = 'upcoming' | 'active' | 'completed' | 'overdue' | 'skipped';
export type MilestoneCategory = 'product' | 'growth' | 'fundraise' | 'team' | 'operations' | 'market';

export interface Milestone {
  id: string;
  weekNumber: number; // 1-12 (90 days = ~12 weeks)
  category: MilestoneCategory;
  title: string;
  description: string;
  successCriteria: string[];
  kpiTargets: {
    metric: string;
    target: number | string;
    unit: string;
    baseline?: number | string;
  }[];
  mentorSupportNeeded: string[]; // Types of mentor support for this milestone
  resources: string[]; // Links, tools, templates
  dependencies: string[]; // Milestone IDs that must be completed first
  status: MilestoneStatus;
  dueDate: string;
  completedAt?: string;
  completionNotes?: string;
}

export interface ProgrammePhase {
  name: string;
  weeks: string; // e.g., "1-4"
  focus: string;
  milestones: Milestone[];
}

export interface Programme {
  id: string;
  startupId: string;
  applicationId: string;
  companyName: string;
  startDate: string;
  endDate: string;
  currentWeek: number;
  phases: ProgrammePhase[];
  overallProgress: number; // 0-100
  riskLevel: 'on_track' | 'at_risk' | 'behind';
  nextMilestone: Milestone | null;
  mentorMatchingTriggers: {
    milestone: string;
    expertise: string[];
    urgency: 'immediate' | 'this_week' | 'next_phase';
  }[];
  weeklyCheckInSchedule: {
    weekNumber: number;
    focus: string;
    attendees: string[];
  }[];
  generatedAt: string;
  modelUsed: string;
}

export interface ProgrammeInput {
  applicationId: string;
  companyName: string;
  stage: string;
  industry: string;
  applicationData: {
    problemDescription: string;
    solutionDescription: string;
    targetCustomer: string;
    userCount: number;
    mrr: number;
    biggestChallenge: string;
    whatTheyWant: string;
  };
  founders: {
    name: string;
    role: string | null;
    yearsExperience: number | null;
    hasStartedBefore: boolean;
  }[];
  aiAssessment?: {
    founderScore: number;
    problemScore: number;
    userValueScore: number;
    executionScore: number;
    overallScore: number;
    keyStrengths: string[];
    keyRisks: string[];
    startingStage?: string;
  };
  ddReport?: {
    overallDDScore: number;
    redFlags: { claimText: string; severity: string }[];
    recommendation: { verdict: string; conditions: string[] };
  };
}
