// =====================================================
// SANCTUARY — Due Diligence Types
// =====================================================

// -----------------------------------------------------
// ENUMS
// -----------------------------------------------------

export type DDClaimCategory =
  | 'revenue_metrics'
  | 'user_customer'
  | 'team_background'
  | 'market_size'
  | 'competitive'
  | 'technology_ip'
  | 'customer_reference'
  | 'traction'
  | 'fundraising'

export type DDVerificationStatus =
  | 'unverified'
  | 'ai_verified'
  | 'mentor_verified'
  | 'disputed'
  | 'confirmed'
  | 'refuted'
  | 'unverifiable'

export type DDClaimPriority = 'critical' | 'high' | 'medium' | 'low'

export type DDVerificationVerdict =
  | 'confirmed'
  | 'partially_confirmed'
  | 'unconfirmed'
  | 'disputed'
  | 'refuted'

export type DDVerificationSourceType =
  | 'ai_research'
  | 'document_analysis'
  | 'mentor_review'
  | 'reference_check'

export type DDGrade = 'A' | 'B' | 'C' | 'D' | 'F'

export type DDStatus =
  | 'not_started'
  | 'claims_extracted'
  | 'team_assessment'
  | 'ai_verification'
  | 'completed'
  | 'failed'

export type DDBenchmarkFlag = 'above_benchmark' | 'below_benchmark' | 'unrealistic' | null

export type DDRecommendationVerdict =
  | 'invest'
  | 'conditional_invest'
  | 'pass'
  | 'needs_more_info'

// -----------------------------------------------------
// CORE ENTITIES
// -----------------------------------------------------

export interface DDClaim {
  id: string
  applicationId: string
  category: DDClaimCategory
  claimText: string
  sourceText: string
  sourceType: 'application_form' | 'interview_transcript' | 'research_data'
  sourceReference: string
  status: DDVerificationStatus
  priority: DDClaimPriority
  extractionConfidence: number // 0-1
  verificationConfidence: number | null // 0-1
  contradicts: string[] // claim IDs
  corroborates: string[] // claim IDs
  benchmarkFlag: DDBenchmarkFlag
  verifications?: DDVerification[]
}

export interface DDVerification {
  id: string
  claimId: string
  sourceType: DDVerificationSourceType
  sourceName: string
  sourceCredentials: string | null
  verdict: DDVerificationVerdict
  confidence: number // 0-1
  evidence: string
  evidenceUrls: string[]
  notes: string | null
  sourceCredibilityScore: number | null // 0-1
}

export interface DDCategoryScore {
  category: DDClaimCategory
  totalClaims: number
  confirmedClaims: number
  disputedClaims: number
  refutedClaims: number
  unverifiedClaims: number
  categoryConfidence: number // 0-1
  flaggedIssues: string[]
}

export interface DDRedFlag {
  claimId: string
  claimText: string
  category: DDClaimCategory
  severity: 'critical' | 'high' | 'medium'
  reason: string
  evidence: string
}

export interface DDOmission {
  category: DDClaimCategory | string
  expectedInfo: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  reasoning: string
}

export interface DDFollowUpQuestion {
  category: DDClaimCategory | string
  question: string
  reason: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  source: 'omission' | 'unverified_claim' | 'disputed_claim' | 'benchmark_flag' | 'ai_generated'
}

export interface DDRecommendation {
  verdict: DDRecommendationVerdict
  conditions: string[]
  reasoning: string
}

export interface DueDiligenceReport {
  id: string
  applicationId: string
  companyName: string
  overallDDScore: number // 0-100
  ddGrade: DDGrade
  executiveSummary: string
  categoryScores: DDCategoryScore[]
  claims: DDClaim[]
  redFlags: DDRedFlag[]
  omissions: DDOmission[]
  followUpQuestions: DDFollowUpQuestion[]
  recommendation: DDRecommendation
  teamAssessment?: DDTeamAssessment | null
  marketAssessment?: DDMarketAssessment | null
  totalSources: number
  verificationCoverage: number // 0-1
  generatedAt: string
}

// -----------------------------------------------------
// TEAM ASSESSMENT TYPES
// -----------------------------------------------------

export interface DDFounderProfile {
  name: string
  role: string | null
  founderScore: number              // 0-100
  experienceVerified: boolean
  experienceEvidence: string
  linkedinFound: boolean
  githubFound: boolean
  githubScore: number | null        // 0-100 (null if not technical)
  previousStartups: { name: string; outcome: string; verified: boolean }[]
  redFlags: string[]
  strengths: string[]
  evidenceUrls: string[]
}

export interface DDInterviewSignal {
  signal: string
  sentiment: 'positive' | 'neutral' | 'concerning'
  source: string
}

export interface DDTeamAssessment {
  founderProfiles: DDFounderProfile[]
  teamCompletenessScore: number     // 0-100
  overallTeamScore: number          // 0-100
  teamGrade: DDGrade
  teamRedFlags: DDRedFlag[]
  teamStrengths: string[]
  missingRoles: string[]
  interviewSignals: DDInterviewSignal[]
}

// -----------------------------------------------------
// MARKET ASSESSMENT TYPES
// -----------------------------------------------------

export interface DDTAMValidation {
  claimed: string | null          // what the application stated
  estimated: string               // what research suggests
  confidence: number              // 0-1
  methodology: string             // how the estimate was derived
  sources: string[]               // evidence URLs
}

export type DDCompetitorThreatLevel = 'high' | 'medium' | 'low'

export interface DDCompetitor {
  name: string
  description: string
  funding: string | null          // e.g. "$50M Series B"
  positioning: string             // how they position vs. the company
  threatLevel: DDCompetitorThreatLevel
  differentiator: string          // what makes the company different
  sourceUrl: string | null
}

export interface DDMarketAssessment {
  tamValidation: DDTAMValidation
  competitorMap: DDCompetitor[]
  marketTimingScore: number       // 0-100 (growing=high, declining=low)
  marketTimingReasoning: string
  adjacentMarkets: string[]
  overallMarketScore: number      // 0-100
  marketGrade: DDGrade
  marketRedFlags: DDRedFlag[]
  marketStrengths: string[]
}

// -----------------------------------------------------
// AGENT INPUT/OUTPUT TYPES
// -----------------------------------------------------

export interface ClaimExtractionInput {
  applicationId: string
  companyName: string
  applicationData: {
    companyDescription: string | null
    problemDescription: string | null
    solutionDescription: string | null
    targetCustomer: string | null
    stage: string | null
    userCount: number | null
    mrr: number | null
    biggestChallenge: string | null
    whySanctuary: string | null
    whatTheyWant: string | null
    companyWebsite: string | null
  }
  founders: {
    name: string
    role: string | null
    yearsExperience: number | null
    hasStartedBefore: boolean
    previousStartupOutcome: string | null
    linkedin: string | null
  }[]
  interviewTranscript: { role: string; content: string; section?: string }[] | null
  researchData: Record<string, unknown> | null
}

export interface ClaimExtractionResult {
  success: boolean
  claims: Omit<DDClaim, 'id' | 'verifications'>[]
  omissions: DDOmission[]
  error?: string
  metadata: {
    totalClaims: number
    categoryCounts: Record<DDClaimCategory, number>
    processingTimeMs: number
  }
}

export interface ClaimVerificationInput {
  claims: DDClaim[]
  companyName: string
  companyWebsite: string | null
}

export interface ClaimVerificationResult {
  success: boolean
  verifications: Omit<DDVerification, 'id'>[]
  error?: string
  metadata: {
    totalVerifications: number
    totalSearches: number
    processingTimeMs: number
  }
}

export interface DocumentVerificationInput {
  claims: DDClaim[]
  documents: {
    id: string
    name: string
    type: string
    fileUrl: string
  }[]
  companyName: string
}

export interface DocumentVerificationResult {
  success: boolean
  verifications: Omit<DDVerification, 'id'>[]
  error?: string
  metadata: {
    documentsAnalyzed: number
    processingTimeMs: number
  }
}

export interface DDTeamAssessmentInput {
  applicationId: string
  companyName: string
  founders: {
    name: string
    role: string | null
    yearsExperience: number | null
    hasStartedBefore: boolean
    previousStartupOutcome: string | null
    linkedin: string | null
  }[]
  interviewTranscript: { role: string; content: string; section?: string }[] | null
  companyDescription: string | null
  stage: string | null
}

export interface DDTeamAssessmentResult {
  success: boolean
  assessment: DDTeamAssessment | null
  error?: string
  metadata: {
    foundersEnriched: number
    tavilySearches: number
    processingTimeMs: number
  }
}

export interface DDMarketAssessmentInput {
  applicationId: string
  companyName: string
  companyDescription: string | null
  targetCustomer: string | null
  stage: string | null
  companyWebsite: string | null
  interviewTranscript: { role: string; content: string; section?: string }[] | null
}

export interface DDMarketAssessmentResult {
  success: boolean
  assessment: DDMarketAssessment | null
  error?: string
  metadata: {
    tavilySearches: number
    competitorsFound: number
    processingTimeMs: number
  }
}

export interface DDReportInput {
  applicationId: string
  companyName: string
  claims: DDClaim[]
  omissions: DDOmission[]
  teamAssessment?: DDTeamAssessment | null
  marketAssessment?: DDMarketAssessment | null
}

export interface DDReportResult {
  success: boolean
  report: DueDiligenceReport | null
  error?: string
  metadata: {
    processingTimeMs: number
  }
}

// -----------------------------------------------------
// SOURCE CREDIBILITY TIERS
// -----------------------------------------------------

export interface SourceCredibilityTier {
  pattern: RegExp
  tier: 'tier1' | 'tier2' | 'tier3' | 'tier4'
  weight: number
  label: string
}

export const SOURCE_CREDIBILITY_TIERS: SourceCredibilityTier[] = [
  // Tier 1: Official / authoritative (weight 1.0)
  { pattern: /crunchbase\.com/i, tier: 'tier1', weight: 1.0, label: 'Crunchbase' },
  { pattern: /pitchbook\.com/i, tier: 'tier1', weight: 1.0, label: 'PitchBook' },
  { pattern: /sec\.gov/i, tier: 'tier1', weight: 1.0, label: 'SEC Filing' },
  { pattern: /bloomberg\.com/i, tier: 'tier1', weight: 1.0, label: 'Bloomberg' },
  { pattern: /reuters\.com/i, tier: 'tier1', weight: 1.0, label: 'Reuters' },
  { pattern: /wsj\.com/i, tier: 'tier1', weight: 1.0, label: 'WSJ' },
  { pattern: /ft\.com/i, tier: 'tier1', weight: 1.0, label: 'Financial Times' },
  { pattern: /linkedin\.com/i, tier: 'tier1', weight: 1.0, label: 'LinkedIn' },
  { pattern: /github\.com/i, tier: 'tier1', weight: 1.0, label: 'GitHub' },
  { pattern: /patents\.google\.com/i, tier: 'tier1', weight: 1.0, label: 'Google Patents' },
  // Tier 2: Reputable press / industry (weight 0.85)
  { pattern: /techcrunch\.com/i, tier: 'tier2', weight: 0.85, label: 'TechCrunch' },
  { pattern: /forbes\.com/i, tier: 'tier2', weight: 0.85, label: 'Forbes' },
  { pattern: /businessinsider\.com|insider\.com/i, tier: 'tier2', weight: 0.85, label: 'Business Insider' },
  { pattern: /theinformation\.com/i, tier: 'tier2', weight: 0.85, label: 'The Information' },
  { pattern: /venturebeat\.com/i, tier: 'tier2', weight: 0.85, label: 'VentureBeat' },
  { pattern: /producthunt\.com/i, tier: 'tier2', weight: 0.85, label: 'Product Hunt' },
  { pattern: /ycombinator\.com/i, tier: 'tier2', weight: 0.85, label: 'Y Combinator' },
  { pattern: /statista\.com/i, tier: 'tier2', weight: 0.85, label: 'Statista' },
  { pattern: /gartner\.com/i, tier: 'tier2', weight: 0.85, label: 'Gartner' },
  { pattern: /mckinsey\.com/i, tier: 'tier2', weight: 0.85, label: 'McKinsey' },
  // Tier 3: General web / blogs (weight 0.65)
  { pattern: /medium\.com/i, tier: 'tier3', weight: 0.65, label: 'Medium' },
  { pattern: /substack\.com/i, tier: 'tier3', weight: 0.65, label: 'Substack' },
  { pattern: /twitter\.com|x\.com/i, tier: 'tier3', weight: 0.65, label: 'X/Twitter' },
  { pattern: /reddit\.com/i, tier: 'tier3', weight: 0.65, label: 'Reddit' },
  { pattern: /wikipedia\.org/i, tier: 'tier3', weight: 0.65, label: 'Wikipedia' },
  // Tier 4: Company's own website (weight 0.4 — self-reported)
  // The company website pattern is dynamically added at runtime
]

/**
 * Get the credibility tier for a given URL.
 * Company's own website gets tier4 (self-reported).
 * Unknown domains default to tier3.
 */
export function getSourceCredibilityTier(
  url: string,
  companyWebsite?: string | null
): { tier: SourceCredibilityTier['tier']; weight: number; label: string } {
  // Check if URL matches company's own website (self-reported = low credibility)
  if (companyWebsite) {
    try {
      const companyHost = new URL(companyWebsite).hostname.replace(/^www\./, '')
      const urlHost = new URL(url).hostname.replace(/^www\./, '')
      if (urlHost === companyHost || urlHost.endsWith(`.${companyHost}`)) {
        return { tier: 'tier4', weight: 0.4, label: 'Company Website (self-reported)' }
      }
    } catch {
      // Invalid URL, skip company match
    }
  }

  for (const tier of SOURCE_CREDIBILITY_TIERS) {
    if (tier.pattern.test(url)) {
      return { tier: tier.tier, weight: tier.weight, label: tier.label }
    }
  }

  // Default: tier 3 for unknown domains
  return { tier: 'tier3', weight: 0.65, label: 'General Web' }
}

// -----------------------------------------------------
// STAGE BENCHMARKS
// -----------------------------------------------------

export interface StageBenchmark {
  metric: string
  category: DDClaimCategory
  min: number | null
  max: number | null
  unit: string
  description: string
}

export const STAGE_BENCHMARKS: Record<string, StageBenchmark[]> = {
  'pre-seed': [
    { metric: 'mrr', category: 'revenue_metrics', min: 0, max: 5000, unit: 'USD', description: '$0–$5K MRR' },
    { metric: 'users', category: 'user_customer', min: 0, max: 1000, unit: 'count', description: '0–1K users' },
    { metric: 'team_size', category: 'team_background', min: 1, max: 5, unit: 'people', description: '1–5 people' },
    { metric: 'raise_amount', category: 'fundraising', min: 50000, max: 1000000, unit: 'USD', description: '$50K–$1M raise' },
  ],
  'seed': [
    { metric: 'mrr', category: 'revenue_metrics', min: 1000, max: 50000, unit: 'USD', description: '$1K–$50K MRR' },
    { metric: 'users', category: 'user_customer', min: 100, max: 10000, unit: 'count', description: '100–10K users' },
    { metric: 'team_size', category: 'team_background', min: 3, max: 15, unit: 'people', description: '3–15 people' },
    { metric: 'raise_amount', category: 'fundraising', min: 500000, max: 5000000, unit: 'USD', description: '$500K–$5M raise' },
  ],
  'series-a': [
    { metric: 'mrr', category: 'revenue_metrics', min: 25000, max: 500000, unit: 'USD', description: '$25K–$500K MRR' },
    { metric: 'users', category: 'user_customer', min: 1000, max: 100000, unit: 'count', description: '1K–100K users' },
    { metric: 'team_size', category: 'team_background', min: 10, max: 50, unit: 'people', description: '10–50 people' },
    { metric: 'raise_amount', category: 'fundraising', min: 3000000, max: 20000000, unit: 'USD', description: '$3M–$20M raise' },
  ],
}

/**
 * Get stage benchmarks for a given stage string.
 * Normalizes common stage name variants.
 */
export function getStageBenchmarks(stage: string | null): StageBenchmark[] | null {
  if (!stage) return null
  const normalized = stage.toLowerCase().replace(/[\s_]+/g, '-').replace(/series\s*/i, 'series-')
  if (normalized.includes('pre-seed') || normalized.includes('idea') || normalized.includes('concept')) {
    return STAGE_BENCHMARKS['pre-seed']
  }
  if (normalized.includes('series-a') || normalized.includes('series a')) {
    return STAGE_BENCHMARKS['series-a']
  }
  if (normalized.includes('seed')) {
    return STAGE_BENCHMARKS['seed']
  }
  return null
}

// -----------------------------------------------------
// CATEGORY METADATA
// -----------------------------------------------------

export const DD_CATEGORY_LABELS: Record<DDClaimCategory, string> = {
  revenue_metrics: 'Revenue & Metrics',
  user_customer: 'Users & Customers',
  team_background: 'Team Background',
  market_size: 'Market Size',
  competitive: 'Competitive',
  technology_ip: 'Technology & IP',
  customer_reference: 'Customer References',
  traction: 'Traction',
  fundraising: 'Fundraising',
}

export const DD_CATEGORY_WEIGHTS: Record<DDClaimCategory, number> = {
  revenue_metrics: 1.5,
  traction: 1.4,
  team_background: 1.2,
  user_customer: 1.1,
  fundraising: 1.0,
  competitive: 0.9,
  market_size: 0.8,
  technology_ip: 0.8,
  customer_reference: 0.7,
}

export const DD_PRIORITY_ORDER: Record<DDClaimPriority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
}
