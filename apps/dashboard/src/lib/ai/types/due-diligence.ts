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
  | 'ai_verification'
  | 'completed'
  | 'failed'

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
  totalSources: number
  verificationCoverage: number // 0-1
  generatedAt: string
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

export interface DDReportInput {
  applicationId: string
  companyName: string
  claims: DDClaim[]
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
