// =====================================================
// SANCTUARY DASHBOARD — TypeScript Types
// Version: MVP
// =====================================================

// -----------------------------------------------------
// AUTH & USER TYPES
// -----------------------------------------------------

export const USER_TYPES = ['founder', 'partner'] as const
export const PARTNER_SUB_TYPES = ['mentor', 'vc', 'startup_manager'] as const
export const SHARED_VIEW_TYPES = ['metrics', 'checkpoint', 'document'] as const
export const SHARED_VIEW_PERMISSIONS = ['view', 'comment', 'download'] as const

export type UserType = (typeof USER_TYPES)[number]
export type PartnerSubType = (typeof PARTNER_SUB_TYPES)[number]
export type SharedViewType = (typeof SHARED_VIEW_TYPES)[number]
export type SharedViewPermission = (typeof SHARED_VIEW_PERMISSIONS)[number]

/**
 * Authenticated user with role information
 */
export interface AuthUser {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  userType: UserType | null       // null = needs role selection
  partnerSubType: PartnerSubType | null
  startupId: string | null        // For founders - their associated startup
  onboardingComplete: boolean     // For founders - have they completed onboarding?
  createdAt: string
}

/**
 * Shared view - allows partners to share specific resources with founders
 */
export interface SharedView {
  id: string
  createdBy: string               // Partner user ID
  targetFounderId: string         // Which founder can see this
  targetStartupId: string         // Associated startup
  viewType: SharedViewType
  resourceIds: string[]           // IDs of metrics, checkpoints, or documents
  permissions: SharedViewPermission[]
  expiresAt: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Document uploaded by a founder
 */
export interface FounderDocument {
  id: string
  startupId: string
  uploadedBy: string              // Founder user ID
  fileName: string
  fileType: string                // e.g., 'pitch_deck', 'financials', 'legal'
  fileUrl: string
  fileSize: number                // bytes
  description: string | null
  isSharedWithPartners: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Feature/mentor request from a founder
 */
export interface FounderRequest {
  id: string
  startupId: string
  requestedBy: string             // Founder user ID
  requestType: 'feature' | 'mentor' | 'feedback' | 'other'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_review' | 'approved' | 'completed' | 'declined'
  assignedTo: string | null       // Partner user ID
  responseNotes: string | null
  createdAt: string
  updatedAt: string
}

// -----------------------------------------------------
// ENUMS & CONSTANTS
// -----------------------------------------------------

export const STAGES = [
  { value: 'problem_discovery', label: 'Problem Discovery', weekRange: '1-4', color: 'purple' },
  { value: 'solution_shaping', label: 'Solution Shaping', weekRange: '5-8', color: 'blue' },
  { value: 'user_value', label: 'User Value', weekRange: '9-12', color: 'cyan' },
  { value: 'growth', label: 'Growth', weekRange: '13-16', color: 'green' },
  { value: 'capital_ready', label: 'Capital Ready', weekRange: '17-20', color: 'orange' },
] as const

export const RISK_LEVELS = [
  { value: 'low', label: 'Low', color: 'green', minScore: 75 },
  { value: 'normal', label: 'Normal', color: 'blue', minScore: 50 },
  { value: 'elevated', label: 'Elevated', color: 'yellow', minScore: 25 },
  { value: 'high', label: 'High', color: 'red', minScore: 0 },
] as const

export const INDUSTRIES = [
  'SaaS',
  'Fintech',
  'Healthtech',
  'Edtech',
  'E-commerce',
  'Marketplace',
  'AI/ML',
  'Climate',
  'Enterprise',
  'Consumer',
  'Other',
] as const

export const BUSINESS_MODELS = ['B2B', 'B2C', 'B2B2C', 'Marketplace', 'Other'] as const

export const STARTUP_STATUSES = ['active', 'paused', 'graduated', 'exited'] as const

export const CHECKPOINT_STATUSES = ['pending', 'in_progress', 'completed', 'blocked'] as const

export const USER_ROLES = ['partner', 'founder', 'mentor', 'admin'] as const

// -----------------------------------------------------
// TYPE DEFINITIONS
// -----------------------------------------------------

export type Stage = (typeof STAGES)[number]['value']
export type RiskLevel = (typeof RISK_LEVELS)[number]['value']
export type Industry = (typeof INDUSTRIES)[number]
export type BusinessModel = (typeof BUSINESS_MODELS)[number]
export type StartupStatus = (typeof STARTUP_STATUSES)[number]
export type CheckpointStatus = (typeof CHECKPOINT_STATUSES)[number]
export type UserRole = (typeof USER_ROLES)[number]

// -----------------------------------------------------
// CORE ENTITIES
// -----------------------------------------------------

export interface Cohort {
  id: string
  name: string
  startDate: string | null
  endDate: string | null
  status: 'upcoming' | 'active' | 'completed'
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface Startup {
  id: string
  slug: string
  name: string
  logoUrl: string | null
  oneLiner: string
  description: string | null

  // Classification
  cohortId: string
  industry: Industry
  subIndustry: string | null
  businessModel: BusinessModel
  stage: Stage

  // Location
  city: string
  country: string
  timezone: string | null

  // Links
  website: string | null
  demoUrl: string | null
  pitchDeckUrl: string | null

  // Product
  problemStatement: string | null
  solutionDescription: string | null
  targetCustomer: string | null

  // Programme
  status: StartupStatus
  residencyStart: string | null
  residencyEnd: string | null

  // Scores (0-100)
  founderScore: number | null
  problemScore: number | null
  userValueScore: number | null
  executionScore: number | null
  overallScore: number | null

  // Risk
  riskLevel: RiskLevel

  // Timestamps
  createdAt: string
  updatedAt: string
}

export interface Founder {
  id: string
  startupId: string

  // Identity
  name: string
  email: string
  role: string
  isLead: boolean
  photoUrl: string | null

  // Background
  bio: string | null
  linkedin: string | null
  twitter: string | null
  personalSite: string | null

  // Experience
  previousCompanies: string[]
  previousExits: boolean
  yearsExperience: number | null
  education: string | null

  // Skills (1-5)
  skillTechnical: number | null
  skillProduct: number | null
  skillSales: number | null
  skillDesign: number | null
  skillLeadership: number | null

  // Motivation
  whyThisProblem: string | null
  longTermAmbition: string | null

  // Timestamps
  createdAt: string
  updatedAt: string
}

export interface CheckpointTask {
  id: string
  title: string
  completed: boolean
}

export interface Checkpoint {
  id: string
  startupId: string
  weekNumber: number

  // Content
  goal: string | null
  checkpointQuestion: string | null
  tasks: CheckpointTask[]
  evidenceUrls: string[]

  // Notes
  founderNotes: string | null
  partnerNotes: string | null

  // Status
  status: CheckpointStatus
  completedAt: string | null

  // Timestamps
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  role: UserRole
  startupId: string | null
  createdAt: string
}

// -----------------------------------------------------
// DERIVED TYPES
// -----------------------------------------------------

export interface StartupWithFounders extends Startup {
  founders: Founder[]
}

export interface StartupWithCheckpoints extends Startup {
  checkpoints: Checkpoint[]
}

export interface StartupFull extends Startup {
  founders: Founder[]
  checkpoints: Checkpoint[]
  cohort: Cohort
}

// -----------------------------------------------------
// FORM TYPES
// -----------------------------------------------------

export interface StartupFormData {
  name: string
  oneLiner: string
  description?: string
  cohortId: string
  industry: Industry
  subIndustry?: string
  businessModel: BusinessModel
  stage: Stage
  city: string
  country: string
  website?: string
  demoUrl?: string
  problemStatement?: string
  solutionDescription?: string
  targetCustomer?: string
}

export interface FounderFormData {
  name: string
  email: string
  role: string
  isLead: boolean
  photoUrl?: string
  bio?: string
  linkedin?: string
  twitter?: string
  yearsExperience?: number
  education?: string
  skillTechnical?: number
  skillProduct?: number
  skillSales?: number
  skillDesign?: number
  skillLeadership?: number
  whyThisProblem?: string
}

export interface ScoreFormData {
  founderScore: number
  problemScore: number
  userValueScore: number
  executionScore: number
}

export interface CheckpointFormData {
  weekNumber: number
  goal: string
  checkpointQuestion?: string
  tasks: { title: string; completed: boolean }[]
  founderNotes?: string
  partnerNotes?: string
  status: CheckpointStatus
  evidenceUrls?: string[]
}

// -----------------------------------------------------
// UTILITY FUNCTIONS
// -----------------------------------------------------

export function calculateOverallScore(
  founderScore: number | null,
  problemScore: number | null,
  userValueScore: number | null,
  executionScore: number | null
): number | null {
  if (
    founderScore === null ||
    problemScore === null ||
    userValueScore === null ||
    executionScore === null
  ) {
    return null
  }

  return Math.round(
    founderScore * 0.25 + problemScore * 0.25 + userValueScore * 0.3 + executionScore * 0.2
  )
}

export function calculateRiskLevel(overallScore: number | null): RiskLevel {
  if (overallScore === null) return 'normal'
  if (overallScore >= 75) return 'low'
  if (overallScore >= 50) return 'normal'
  if (overallScore >= 25) return 'elevated'
  return 'high'
}

export function getStageInfo(stage: Stage) {
  return STAGES.find((s) => s.value === stage) || STAGES[0]
}

export function getRiskInfo(riskLevel: RiskLevel) {
  return RISK_LEVELS.find((r) => r.value === riskLevel) || RISK_LEVELS[1]
}

// -----------------------------------------------------
// METRICS CONSTANTS
// -----------------------------------------------------

export const TREND_DIRECTIONS = [
  { value: 'up', label: 'Increasing', color: 'green' },
  { value: 'down', label: 'Decreasing', color: 'red' },
  { value: 'flat', label: 'Stable', color: 'blue' },
] as const

export type TrendDirection = (typeof TREND_DIRECTIONS)[number]['value']

// -----------------------------------------------------
// METRICS TYPES
// -----------------------------------------------------

/**
 * A single data point for time-series metrics
 */
export interface MetricDataPoint {
  date: string // ISO date string (e.g., "2026-01-15")
  value: number
}

/**
 * Snapshot of all metrics for a startup at a point in time
 */
export interface MetricSnapshot {
  id: string
  startupId: string
  recordedAt: string

  // Revenue metrics
  mrr: number // Monthly Recurring Revenue in cents
  arr: number | null // Annual Recurring Revenue (calculated)

  // User metrics
  totalUsers: number
  activeUsers: number // Monthly Active Users
  newUsers: number // New users this month

  // Retention metrics
  retentionRate: number // Percentage (0-100)
  churnRate: number // Percentage (0-100)

  // Engagement metrics
  nps: number | null // Net Promoter Score (-100 to 100)
  activationRate: number | null // Percentage (0-100)

  // Timestamps
  createdAt: string
  updatedAt: string
}

/**
 * Aggregated metrics with historical data for a startup
 */
export interface StartupMetrics {
  startupId: string
  startupName: string

  // Current values (latest snapshot)
  current: MetricSnapshot

  // Historical data points for charts
  mrrHistory: MetricDataPoint[]
  userHistory: MetricDataPoint[]
  retentionHistory: MetricDataPoint[]

  // Calculated trends
  mrrTrend: TrendDirection
  userTrend: TrendDirection
  retentionTrend: TrendDirection

  // Period-over-period changes
  mrrChange: number // Percentage change
  userChange: number // Percentage change
  retentionChange: number // Absolute change
}

/**
 * Portfolio-wide metrics aggregation
 */
export interface PortfolioMetrics {
  totalMRR: number
  totalARR: number
  totalUsers: number
  averageRetention: number
  averageNPS: number | null

  // Aggregated trends
  topPerformers: { startupId: string; startupName: string; mrrChange: number }[]
  atRisk: { startupId: string; startupName: string; issue: string }[]

  // Historical aggregates
  mrrHistory: MetricDataPoint[]
  userHistory: MetricDataPoint[]
}

// -----------------------------------------------------
// METRICS UTILITY FUNCTIONS
// -----------------------------------------------------

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

export function formatCompactNumber(num: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num)
}

export function calculateTrend(dataPoints: MetricDataPoint[]): TrendDirection {
  if (dataPoints.length < 2) return 'flat'

  const recent = dataPoints.slice(-3)
  const firstValue = recent[0].value
  const lastValue = recent[recent.length - 1].value
  const changePercent = ((lastValue - firstValue) / firstValue) * 100

  if (changePercent > 5) return 'up'
  if (changePercent < -5) return 'down'
  return 'flat'
}

export function calculatePercentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

// -----------------------------------------------------
// MENTOR MATCHMAKING CONSTANTS
// -----------------------------------------------------

export const PROBLEM_ARCHETYPES = [
  { value: 'finding_pmf', label: 'Finding PMF', color: 'purple' },
  { value: 'first_customers', label: 'First Customers', color: 'blue' },
  { value: 'scaling_sales', label: 'Scaling Sales', color: 'green' },
  { value: 'hiring_key_role', label: 'Hiring Key Role', color: 'orange' },
  { value: 'team_dynamics', label: 'Team Dynamics', color: 'pink' },
  { value: 'technical_architecture', label: 'Technical Architecture', color: 'cyan' },
  { value: 'fundraising', label: 'Fundraising', color: 'yellow' },
  { value: 'unit_economics', label: 'Unit Economics', color: 'red' },
  { value: 'market_positioning', label: 'Market Positioning', color: 'indigo' },
  { value: 'channel_strategy', label: 'Channel Strategy', color: 'teal' },
  { value: 'product_prioritization', label: 'Product Prioritization', color: 'violet' },
  { value: 'operational_scaling', label: 'Operational Scaling', color: 'amber' },
  { value: 'pivoting', label: 'Pivoting', color: 'rose' },
  { value: 'other', label: 'Other', color: 'gray' },
] as const

export const BOTTLENECK_STATUSES = ['pending', 'matching', 'matched'] as const

export const MATCH_STATUSES = ['pending', 'approved', 'rejected', 'intro_sent', 'completed'] as const

export const CONFIDENCE_LEVELS = ['high', 'medium', 'low'] as const

// -----------------------------------------------------
// MENTOR MATCHMAKING TYPES
// -----------------------------------------------------

export type ProblemArchetype = (typeof PROBLEM_ARCHETYPES)[number]['value']
export type BottleneckStatus = (typeof BOTTLENECK_STATUSES)[number]
export type MatchStatus = (typeof MATCH_STATUSES)[number]
export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number]

export interface Mentor {
  id: string
  name: string
  email: string
  bio: string
  linkedinUrl: string | null
  photoUrl: string | null
  isActive: boolean
  expertise: ProblemArchetype[]
  // Investment & engagement
  investedStartupIds: string[] // Startups this mentor has invested in
  availableForInvestment: boolean
  checkSize: string | null // e.g., "$25K-$100K"
  // Matching preferences
  preferredStages: Stage[]
  maxActiveMatches: number
  // Timestamps
  createdAt: string
  updatedAt: string
}

export interface MentorExperience {
  id: string
  mentorId: string
  problemArchetype: ProblemArchetype
  problemStatement: string
  context: string
  solution: string
  outcomes: string
  yearOccurred: number
  companyStage: Stage
  createdAt: string
}

export interface Bottleneck {
  id: string
  startupId: string
  problemArchetype: ProblemArchetype
  rawBlocker: string
  rawAttempts: string
  rawSuccessCriteria: string
  status: BottleneckStatus
  createdAt: string
  updatedAt: string
}

export interface MatchReasoning {
  scores: {
    problemShape: number
    constraintAlignment: number
    stageRelevance: number
    experienceDepth: number
    recency: number
  }
  keyAlignments: string[]
  concerns: string[]
}

export interface Match {
  id: string
  bottleneckId: string
  experienceId: string
  mentorId: string
  score: number
  confidence: ConfidenceLevel
  explanation: string
  reasoning: MatchReasoning
  status: MatchStatus
  operatorNotes: string | null
  introSentAt: string | null
  createdAt: string
  updatedAt: string
}

export interface MatchFeedback {
  id: string
  matchId: string
  rating: 'highly_useful' | 'somewhat_useful' | 'not_useful'
  wasRelevant: boolean
  wasActionable: boolean
  wouldRecommend: boolean
  founderNotes: string | null
  createdAt: string
}

// Derived types
export interface MentorWithExperiences extends Mentor {
  experiences: MentorExperience[]
}

export interface BottleneckWithMatches extends Bottleneck {
  matches: Match[]
}

export interface MatchWithDetails extends Match {
  mentor: Mentor
  experience: MentorExperience
  bottleneck: Bottleneck
  startup: Startup
}

// -----------------------------------------------------
// MENTOR MATCHMAKING UTILITY FUNCTIONS
// -----------------------------------------------------

export function getProblemArchetypeInfo(archetype: ProblemArchetype) {
  return PROBLEM_ARCHETYPES.find((a) => a.value === archetype) || PROBLEM_ARCHETYPES[13]
}

export function calculateMatchScore(reasoning: MatchReasoning): number {
  const { scores } = reasoning
  return Math.round(
    scores.problemShape * 0.40 +
    scores.constraintAlignment * 0.25 +
    scores.stageRelevance * 0.20 +
    scores.experienceDepth * 0.10 +
    scores.recency * 0.05
  )
}

export function getConfidenceInfo(confidence: ConfidenceLevel) {
  const configs = {
    high: { label: 'High', color: 'green', multiplier: 1.0 },
    medium: { label: 'Medium', color: 'yellow', multiplier: 0.85 },
    low: { label: 'Low', color: 'red', multiplier: 0.70 },
  }
  return configs[confidence]
}

// -----------------------------------------------------
// ONBOARDING SYSTEM CONSTANTS
// -----------------------------------------------------

export const APPLICATION_STATUSES = [
  'draft',
  'submitted',
  'interview_scheduled',
  'interview_completed',
  'assessment_generated',
  'under_review',
  'approved',
  'rejected',
  'withdrawn',
] as const

export const INTERVIEW_STATUSES = ['not_started', 'in_progress', 'completed', 'abandoned'] as const

export const INTERVIEW_SECTIONS = [
  { value: 'founder_dna', label: 'Founder DNA', duration: '10-15 min', order: 1 },
  { value: 'problem_interrogation', label: 'Problem Interrogation', duration: '15-20 min', order: 2 },
  { value: 'solution_execution', label: 'Solution & Execution', duration: '10-15 min', order: 3 },
  { value: 'market_competition', label: 'Market & Competition', duration: '5-10 min', order: 4 },
  { value: 'sanctuary_fit', label: 'Sanctuary Fit', duration: '5 min', order: 5 },
] as const

export const APPLICATION_STAGES = [
  { value: 'idea', label: 'Idea Stage' },
  { value: 'building_mvp', label: 'Building MVP' },
  { value: 'has_mvp', label: 'Has MVP' },
  { value: 'has_users', label: 'Has Users' },
  { value: 'has_revenue', label: 'Has Revenue' },
] as const

export const RECOMMENDATIONS = [
  { value: 'strong_accept', label: 'Strong Accept', color: 'green' },
  { value: 'accept', label: 'Accept', color: 'blue' },
  { value: 'conditional', label: 'Conditional', color: 'yellow' },
  { value: 'waitlist', label: 'Waitlist', color: 'orange' },
  { value: 'decline', label: 'Decline', color: 'red' },
] as const

export const EXTRACTION_TYPES = [
  'founder_signal',
  'problem_signal',
  'solution_signal',
  'risk_flag',
  'strength',
  'quote',
  'data_point',
  'need',
  'red_flag',
  'green_flag',
] as const

// -----------------------------------------------------
// ONBOARDING SYSTEM TYPES
// -----------------------------------------------------

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]
export type InterviewStatus = (typeof INTERVIEW_STATUSES)[number]
export type InterviewSection = (typeof INTERVIEW_SECTIONS)[number]['value']
export type ApplicationStage = (typeof APPLICATION_STAGES)[number]['value']
export type Recommendation = (typeof RECOMMENDATIONS)[number]['value']
export type ExtractionType = (typeof EXTRACTION_TYPES)[number]

// -----------------------------------------------------
// ONBOARDING ENTITIES
// -----------------------------------------------------

export interface Application {
  id: string
  status: ApplicationStatus

  // Company basics
  companyName: string
  companyOneLiner: string | null
  companyWebsite: string | null
  companyDescription: string | null

  // Problem & Solution
  problemDescription: string | null
  targetCustomer: string | null
  solutionDescription: string | null

  // Current state
  stage: ApplicationStage
  userCount: number | null
  mrr: number | null
  biggestChallenge: string | null

  // Why Sanctuary
  whySanctuary: string | null
  whatTheyWant: string | null

  // Scheduling
  interviewScheduledAt: string | null
  interviewCompletedAt: string | null

  // Timestamps
  submittedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ApplicationFounder {
  id: string
  applicationId: string

  // Basics
  name: string
  email: string
  role: string | null
  isLead: boolean

  // Background
  linkedin: string | null
  yearsExperience: number | null
  hasStartedBefore: boolean
  previousStartupOutcome: string | null

  createdAt: string
}

export interface Interview {
  id: string
  applicationId: string

  // Session info
  status: InterviewStatus
  currentSection: InterviewSection

  // Timing
  startedAt: string | null
  completedAt: string | null
  durationMinutes: number | null

  // AI model used
  aiModel: string

  createdAt: string
  updatedAt: string
}

export interface InterviewMessage {
  id: string
  interviewId: string

  // Message content
  role: 'system' | 'assistant' | 'user'
  content: string

  // Section this message belongs to
  section: InterviewSection

  // Ordering
  sequenceNumber: number

  createdAt: string
}

export interface InterviewExtraction {
  id: string
  interviewId: string

  // Extraction type
  extractionType: ExtractionType

  // Content
  title: string | null
  content: string

  // Source reference
  sourceMessageId: string | null

  // Scoring contribution
  dimension: 'founder' | 'problem' | 'user_value' | 'execution' | null
  scoreImpact: number | null // -5 to +5

  // AI confidence
  confidence: number | null // 0-1

  createdAt: string
}

export interface Assessment {
  id: string
  applicationId: string
  interviewId: string | null

  // Overall recommendation
  recommendation: Recommendation
  recommendationConfidence: number | null
  oneLineSummary: string | null

  // Scores (0-100)
  founderScore: number | null
  founderReasoning: string | null

  problemScore: number | null
  problemReasoning: string | null

  userValueScore: number | null
  userValueReasoning: string | null

  executionScore: number | null
  executionReasoning: string | null

  overallScore: number | null

  // Arrays stored as JSON
  keyStrengths: AssessmentStrength[]
  keyRisks: AssessmentRisk[]
  criticalQuestions: string[]

  // Recommendations
  primaryNeed: string | null
  secondaryNeeds: string[]
  mentorDomains: string[]
  fundraisingTimeline: string | null

  // Programme recommendation
  recommendedStartingStage: Stage | null
  startingStageRationale: string | null

  // Transcript highlights
  transcriptHighlights: TranscriptHighlight[]

  // Timestamps
  generatedAt: string
  createdAt: string
  updatedAt: string
}

export interface AssessmentStrength {
  strength: string
  evidence: string
  impact: string
}

export interface AssessmentRisk {
  risk: string
  evidence: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  mitigation: string
}

export interface TranscriptHighlight {
  timestamp: string
  quote: string
  context: string
}

export interface ProposedProgramme {
  id: string
  assessmentId: string
  applicationId: string

  // Programme overview
  startingStage: Stage
  totalWeeks: number
  programmeRationale: string | null

  // Success metrics
  successMetrics: Record<string, string | number>

  // Conditions
  conditions: ProgrammeCondition[]

  // Mentor recommendations
  mentorRecommendations: MentorRecommendation[]

  // Status
  status: 'draft' | 'sm_reviewed' | 'partner_reviewed' | 'approved' | 'rejected' | 'modified'

  createdAt: string
  updatedAt: string
}

export interface ProgrammeCondition {
  condition: string
  dueByWeek: number
}

export interface MentorRecommendation {
  domain: string
  priority: number
  rationale: string
}

export interface ProposedProgrammeWeek {
  id: string
  proposedProgrammeId: string

  weekNumber: number

  // Content
  title: string | null
  goal: string
  checkpointQuestion: string | null

  // Focus area
  focusArea: Stage | 'buffer'

  // Tasks
  tasks: ProgrammeTask[]

  // Metrics to track this week
  metricsToTrack: string[]

  // Mentor recommendation for this week
  mentorFocus: string | null

  // Custom flags
  isMilestone: boolean
  milestoneName: string | null
  isCustomWeek: boolean
  customRationale: string | null

  createdAt: string
}

export interface ProgrammeTask {
  task: string
  required: boolean
}

export interface OnboardingReview {
  id: string
  applicationId: string
  assessmentId: string | null
  proposedProgrammeId: string | null

  // Reviewer info
  reviewerId: string
  reviewerRole: 'startup_manager' | 'partner'

  // Review content
  scoresValidated: boolean
  risksValidated: boolean
  programmeValidated: boolean

  // Adjustments
  scoreAdjustments: Record<string, { original: number; adjusted: number; reason: string }>
  programmeAdjustments: { week: number; change: string; reason: string }[]

  // Flags for partner
  flagsForPartner: { flag: string; severity: 'low' | 'medium' | 'high' }[]

  // Questions for discussion
  questionsForDiscussion: string[]

  // Recommendation
  recommendation: 'approve' | 'approve_with_conditions' | 'discuss_with_partner' | 'decline' | null
  recommendationNotes: string | null

  // Conditions
  conditions: string[]

  reviewedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface OnboardingDecision {
  id: string
  applicationId: string

  // Decision
  decision: 'accepted' | 'accepted_conditional' | 'waitlisted' | 'declined'
  decisionReason: string | null

  // Who decided
  decidedBy: string
  decidedAt: string

  // Conditions (if conditional)
  conditions: { condition: string; dueBy: string }[]

  // Final programme ID (if accepted)
  finalProgrammeId: string | null

  // Created startup ID (after onboarding complete)
  startupId: string | null

  // Scheduling
  startDate: string | null

  // Communication
  decisionCommunicatedAt: string | null
  founderAcceptedAt: string | null

  createdAt: string
}

// -----------------------------------------------------
// ONBOARDING DERIVED TYPES
// -----------------------------------------------------

export interface ApplicationWithFounders extends Application {
  founders: ApplicationFounder[]
}

export interface InterviewWithMessages extends Interview {
  messages: InterviewMessage[]
}

export interface ApplicationFull extends Application {
  founders: ApplicationFounder[]
  interview: Interview | null
  assessment: Assessment | null
  proposedProgramme: ProposedProgramme | null
}

// -----------------------------------------------------
// ONBOARDING UTILITY FUNCTIONS
// -----------------------------------------------------

export function getInterviewSectionInfo(section: InterviewSection) {
  return INTERVIEW_SECTIONS.find((s) => s.value === section) || INTERVIEW_SECTIONS[0]
}

export function getApplicationStageInfo(stage: ApplicationStage) {
  return APPLICATION_STAGES.find((s) => s.value === stage) || APPLICATION_STAGES[0]
}

export function getRecommendationInfo(recommendation: Recommendation) {
  return RECOMMENDATIONS.find((r) => r.value === recommendation) || RECOMMENDATIONS[4]
}

export function calculateAssessmentOverallScore(assessment: Partial<Assessment>): number | null {
  const { founderScore, problemScore, userValueScore, executionScore } = assessment
  if (
    founderScore === null ||
    founderScore === undefined ||
    problemScore === null ||
    problemScore === undefined ||
    userValueScore === null ||
    userValueScore === undefined ||
    executionScore === null ||
    executionScore === undefined
  ) {
    return null
  }
  return Math.round((founderScore + problemScore + userValueScore + executionScore) / 4)
}
