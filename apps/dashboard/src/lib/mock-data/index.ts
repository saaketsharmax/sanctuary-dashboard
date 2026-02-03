// =====================================================
// SANCTUARY DASHBOARD — Mock Data
// Central export for all mock data
// =====================================================

export * from './cohorts'
export * from './startups'
export * from './founders'
export * from './checkpoints'
export * from './metrics'
export * from './mentors'
export * from './onboarding'

// Re-export commonly used getters
import { cohorts, getCohortById, getActiveCohort } from './cohorts'
import {
  startups,
  getStartupById,
  getStartupBySlug,
  getStartupWithFounders,
  getStartupsByCohort,
  getStartupsByStage,
  getStartupsByRiskLevel,
  getAllStartupsWithFounders,
} from './startups'
import { founders, getFoundersByStartupId, getFounderById, getLeadFounder } from './founders'
import {
  checkpoints,
  getCheckpointsByStartupId,
  getCheckpointById,
  getLatestCheckpoint,
  getCheckpointsByStatus,
} from './checkpoints'
import {
  metricSnapshots,
  getMetricSnapshotByStartupId,
  getStartupMetrics,
  getAllStartupMetrics,
  getPortfolioMetrics,
} from './metrics'
import {
  mentors,
  mentorExperiences,
  bottlenecks,
  matches,
  getMentorById,
  getMentorWithExperiences,
  getActiveMentors,
  getMentorsByExpertise,
  getExperiencesByMentorId,
  getBottleneckById,
  getBottlenecksByStartupId,
  getBottleneckWithMatches,
  getMatchById,
  getMatchesByBottleneckId,
  getPendingMatches,
  getPendingMatchesWithNames,
  getAllMatchesWithNames,
  getMatchWithDetails,
  getMatchStats,
} from './mentors'
import {
  applications,
  applicationFounders,
  interviews,
  interviewMessages,
  assessments,
  proposedProgrammes,
  proposedProgrammeWeeks,
  getApplicationById,
  getApplicationsByStatus,
  getApplicationFounders,
  getApplicationWithFounders,
  getAllApplicationsWithFounders,
  getInterviewById,
  getInterviewByApplicationId,
  getInterviewMessages,
  getInterviewWithMessages,
  getAssessmentById,
  getAssessmentByApplicationId,
  getProposedProgrammeById,
  getProposedProgrammeByApplicationId,
  getProgrammeWeeks,
  getOnboardingStats,
} from './onboarding'

// Mock users for auth
export interface MockUser {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  role: 'partner' | 'founder' | 'mentor' | 'admin'
  startupId: string | null
}

export const mockUsers: MockUser[] = [
  {
    id: 'user-partner-1',
    email: 'partner@sanctuary.vc',
    name: 'Alex Thompson',
    avatarUrl: null,
    role: 'partner',
    startupId: null,
  },
  {
    id: 'user-founder-1',
    email: 'sarah@techflow.ai',
    name: 'Sarah Chen',
    avatarUrl: null,
    role: 'founder',
    startupId: 'startup-1',
  },
  {
    id: 'user-founder-2',
    email: 'emma@greencommute.co',
    name: 'Emma Johansson',
    avatarUrl: null,
    role: 'founder',
    startupId: 'startup-2',
  },
]

export function getMockUserByEmail(email: string): MockUser | undefined {
  return mockUsers.find((u) => u.email === email)
}

// Summary statistics
export function getPortfolioStats() {
  const activeStartups = startups.filter((s) => s.status === 'active')
  const riskCounts = {
    low: startups.filter((s) => s.riskLevel === 'low').length,
    normal: startups.filter((s) => s.riskLevel === 'normal').length,
    elevated: startups.filter((s) => s.riskLevel === 'elevated').length,
    high: startups.filter((s) => s.riskLevel === 'high').length,
  }
  const avgScore =
    activeStartups.reduce((sum, s) => sum + (s.overallScore || 0), 0) / activeStartups.length

  // Get metrics data from the metrics module
  const portfolioMetrics = getPortfolioMetrics()

  return {
    totalStartups: startups.length,
    activeStartups: activeStartups.length,
    totalFounders: founders.length,
    avgOverallScore: Math.round(avgScore),
    // Add metrics data
    totalMRR: portfolioMetrics.totalMRR,
    totalUsers: portfolioMetrics.totalUsers,
    avgRetention: portfolioMetrics.averageRetention,
    riskCounts,
    stageDistribution: {
      problem_discovery: startups.filter((s) => s.stage === 'problem_discovery').length,
      solution_shaping: startups.filter((s) => s.stage === 'solution_shaping').length,
      user_value: startups.filter((s) => s.stage === 'user_value').length,
      growth: startups.filter((s) => s.stage === 'growth').length,
      capital_ready: startups.filter((s) => s.stage === 'capital_ready').length,
    },
  }
}

// Export all for convenience
export const mockData = {
  cohorts,
  startups,
  founders,
  checkpoints,
  metricSnapshots,
  mentors,
  mentorExperiences,
  bottlenecks,
  matches,
  users: mockUsers,
  // Onboarding
  applications,
  applicationFounders,
  interviews,
  interviewMessages,
  assessments,
  proposedProgrammes,
  proposedProgrammeWeeks,
  // Cohorts
  getCohortById,
  getActiveCohort,
  // Startups
  getStartupById,
  getStartupBySlug,
  getStartupWithFounders,
  getStartupsByCohort,
  getStartupsByStage,
  getStartupsByRiskLevel,
  getAllStartupsWithFounders,
  // Founders
  getFoundersByStartupId,
  getFounderById,
  getLeadFounder,
  // Checkpoints
  getCheckpointsByStartupId,
  getCheckpointById,
  getLatestCheckpoint,
  getCheckpointsByStatus,
  // Metrics
  getMetricSnapshotByStartupId,
  getStartupMetrics,
  getAllStartupMetrics,
  getPortfolioMetrics,
  // Mentors
  getMentorById,
  getMentorWithExperiences,
  getActiveMentors,
  getMentorsByExpertise,
  getExperiencesByMentorId,
  getBottleneckById,
  getBottlenecksByStartupId,
  getBottleneckWithMatches,
  getMatchById,
  getMatchesByBottleneckId,
  getPendingMatches,
  getPendingMatchesWithNames,
  getAllMatchesWithNames,
  getMatchWithDetails,
  getMatchStats,
  // Onboarding
  getApplicationById,
  getApplicationsByStatus,
  getApplicationFounders,
  getApplicationWithFounders,
  getAllApplicationsWithFounders,
  getInterviewById,
  getInterviewByApplicationId,
  getInterviewMessages,
  getInterviewWithMessages,
  getAssessmentById,
  getAssessmentByApplicationId,
  getProposedProgrammeById,
  getProposedProgrammeByApplicationId,
  getProgrammeWeeks,
  getOnboardingStats,
  // Auth
  getMockUserByEmail,
  getPortfolioStats,
}
