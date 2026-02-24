// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY DD — Report Generator
// Aggregates claims + verifications into a structured DD report
// ═══════════════════════════════════════════════════════════════════════════

import Anthropic from '@anthropic-ai/sdk'
import {
  DD_REPORT_SYSTEM_PROMPT,
  DD_EXECUTIVE_SUMMARY_PROMPT,
} from '../prompts/dd-report-system'
import type {
  DDClaim,
  DDClaimCategory,
  DDCategoryScore,
  DDRedFlag,
  DDOmission,
  DDFollowUpQuestion,
  DDRecommendation,
  DDRecommendationVerdict,
  DDGrade,
  DueDiligenceReport,
  DDReportInput,
  DDReportResult,
} from '../types/due-diligence'
import {
  DD_CATEGORY_LABELS as LABELS,
  DD_CATEGORY_WEIGHTS as WEIGHTS,
} from '../types/due-diligence'

// ═══════════════════════════════════════════════════════════════════════════
// DD REPORT GENERATOR CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class DDReportGenerator {
  private client: Anthropic
  private model = 'claude-sonnet-4-20250514'

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }

  async generateReport(input: DDReportInput): Promise<DDReportResult> {
    const startTime = Date.now()

    try {
      const { applicationId, companyName, claims, omissions } = input

      // 1. Calculate category scores (deterministic)
      const categoryScores = this.calculateCategoryScores(claims)

      // 2. Calculate overall DD score (deterministic)
      const overallDDScore = this.calculateOverallScore(categoryScores)

      // 3. Determine grade (deterministic)
      const ddGrade = this.calculateGrade(overallDDScore)

      // 4. Identify red flags (deterministic) — including omission-based flags
      const redFlags = this.identifyRedFlags(claims, omissions)

      // 5. Calculate verification coverage (deterministic)
      const claimsWithVerification = claims.filter(
        c => c.verifications && c.verifications.length > 0
      ).length
      const verificationCoverage = claims.length > 0
        ? claimsWithVerification / claims.length
        : 0

      // 6. Count total sources
      const allUrls = new Set<string>()
      for (const claim of claims) {
        for (const v of claim.verifications || []) {
          for (const url of v.evidenceUrls) {
            allUrls.add(url)
          }
        }
      }
      const totalSources = allUrls.size

      // 7. Determine preliminary recommendation verdict (deterministic)
      const preliminaryVerdict = this.determineRecommendationVerdict(ddGrade, redFlags)

      // 8. Generate deterministic follow-up questions from structured data
      const deterministicQuestions = this.generateDeterministicFollowUps(claims, omissions)

      // 9. Generate executive summary + AI follow-ups + recommendation with Claude
      const aiResult = await this.generateExecutiveSummaryAndExtras(
        companyName,
        overallDDScore,
        ddGrade,
        categoryScores,
        redFlags,
        verificationCoverage,
        omissions,
        preliminaryVerdict
      )

      // 10. Merge follow-up questions (deterministic + AI), deduplicate, cap at 12
      const followUpQuestions = this.mergeFollowUpQuestions(deterministicQuestions, aiResult.followUpQuestions)

      // 11. Build recommendation
      const recommendation: DDRecommendation = {
        verdict: preliminaryVerdict,
        conditions: aiResult.recommendationConditions,
        reasoning: aiResult.recommendationReasoning,
      }

      const report: DueDiligenceReport = {
        id: '', // Set by DB
        applicationId,
        companyName,
        overallDDScore,
        ddGrade,
        executiveSummary: aiResult.executiveSummary,
        categoryScores,
        claims,
        redFlags,
        omissions,
        followUpQuestions,
        recommendation,
        totalSources,
        verificationCoverage,
        generatedAt: new Date().toISOString(),
      }

      return {
        success: true,
        report,
        metadata: {
          processingTimeMs: Date.now() - startTime,
        },
      }
    } catch (error) {
      console.error('DD report generation error:', error)
      return {
        success: false,
        report: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          processingTimeMs: Date.now() - startTime,
        },
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DETERMINISTIC SCORING
  // ═══════════════════════════════════════════════════════════════════════════

  private calculateCategoryScores(claims: DDClaim[]): DDCategoryScore[] {
    const categories = [
      'revenue_metrics', 'user_customer', 'team_background', 'market_size',
      'competitive', 'technology_ip', 'customer_reference', 'traction', 'fundraising',
    ] as DDClaimCategory[]

    return categories
      .map(category => {
        const categoryClaims = claims.filter(c => c.category === category)
        if (categoryClaims.length === 0) {
          return {
            category,
            totalClaims: 0,
            confirmedClaims: 0,
            disputedClaims: 0,
            refutedClaims: 0,
            unverifiedClaims: 0,
            categoryConfidence: 0,
            flaggedIssues: [],
          }
        }

        const confirmed = categoryClaims.filter(
          c => c.status === 'confirmed' || c.status === 'ai_verified'
        ).length
        const disputed = categoryClaims.filter(c => c.status === 'disputed').length
        const refuted = categoryClaims.filter(c => c.status === 'refuted').length
        const unverified = categoryClaims.filter(
          c => c.status === 'unverified' || c.status === 'unverifiable'
        ).length

        // Weighted confidence: confirmed claims boost, refuted claims penalize
        const total = categoryClaims.length
        const weightedScore =
          (confirmed * 1.0 + (total - confirmed - disputed - refuted) * 0.5 - disputed * 0.3 - refuted * 0.8) / total
        const categoryConfidence = Math.max(0, Math.min(1, weightedScore))

        const flaggedIssues: string[] = []
        if (refuted > 0) flaggedIssues.push(`${refuted} claim(s) refuted`)
        if (disputed > 0) flaggedIssues.push(`${disputed} claim(s) disputed`)
        const criticalUnverified = categoryClaims.filter(
          c => c.priority === 'critical' && c.status === 'unverified'
        ).length
        if (criticalUnverified > 0) {
          flaggedIssues.push(`${criticalUnverified} critical claim(s) unverified`)
        }

        return {
          category,
          totalClaims: total,
          confirmedClaims: confirmed,
          disputedClaims: disputed,
          refutedClaims: refuted,
          unverifiedClaims: unverified,
          categoryConfidence,
          flaggedIssues,
        }
      })
      .filter(cs => cs.totalClaims > 0)
  }

  private calculateOverallScore(categoryScores: DDCategoryScore[]): number {
    if (categoryScores.length === 0) return 0

    let weightedSum = 0
    let totalWeight = 0

    for (const cs of categoryScores) {
      const weight = WEIGHTS[cs.category] || 1.0
      weightedSum += cs.categoryConfidence * weight * 100
      totalWeight += weight
    }

    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0
  }

  private calculateGrade(score: number): DDGrade {
    if (score >= 90) return 'A'
    if (score >= 75) return 'B'
    if (score >= 60) return 'C'
    if (score >= 40) return 'D'
    return 'F'
  }

  private identifyRedFlags(claims: DDClaim[], omissions: DDOmission[]): DDRedFlag[] {
    const flags: DDRedFlag[] = []

    for (const claim of claims) {
      // Refuted claims are always red flags
      if (claim.status === 'refuted') {
        const evidence = claim.verifications
          ?.find(v => v.verdict === 'refuted')?.evidence || 'Evidence contradicts this claim'
        flags.push({
          claimId: claim.id,
          claimText: claim.claimText,
          category: claim.category,
          severity: claim.priority === 'critical' ? 'critical' : 'high',
          reason: 'Claim refuted by external evidence',
          evidence,
        })
      }

      // Disputed claims with high/critical priority
      if (claim.status === 'disputed' && (claim.priority === 'critical' || claim.priority === 'high')) {
        const evidence = claim.verifications
          ?.find(v => v.verdict === 'disputed')?.evidence || 'Evidence disputes this claim'
        flags.push({
          claimId: claim.id,
          claimText: claim.claimText,
          category: claim.category,
          severity: claim.priority === 'critical' ? 'high' : 'medium',
          reason: 'High-priority claim disputed',
          evidence,
        })
      }

      // Critical claims that remain unverified
      if (claim.priority === 'critical' && claim.status === 'unverified') {
        flags.push({
          claimId: claim.id,
          claimText: claim.claimText,
          category: claim.category,
          severity: 'medium',
          reason: 'Critical claim could not be externally verified',
          evidence: 'No external evidence found to confirm or deny this claim',
        })
      }

      // Internal contradictions
      if (claim.contradicts.length > 0) {
        flags.push({
          claimId: claim.id,
          claimText: claim.claimText,
          category: claim.category,
          severity: 'high',
          reason: 'Internal contradiction detected',
          evidence: `This claim contradicts ${claim.contradicts.length} other claim(s) in the application`,
        })
      }

      // Unrealistic benchmark flags
      if (claim.benchmarkFlag === 'unrealistic') {
        flags.push({
          claimId: claim.id,
          claimText: claim.claimText,
          category: claim.category,
          severity: 'high',
          reason: 'Metric is unrealistic for reported stage',
          evidence: `This claim falls wildly outside the expected benchmark range for the company's stage`,
        })
      }
    }

    // Critical/high omissions become red flags
    for (const omission of omissions) {
      if (omission.severity === 'critical' || omission.severity === 'high') {
        flags.push({
          claimId: 'omission',
          claimText: `Missing: ${omission.expectedInfo}`,
          category: omission.category as DDClaimCategory,
          severity: omission.severity === 'critical' ? 'high' : 'medium',
          reason: 'Key information omitted from application',
          evidence: omission.reasoning,
        })
      }
    }

    // Sort by severity
    const severityOrder = { critical: 0, high: 1, medium: 2 }
    flags.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

    return flags
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RECOMMENDATION LOGIC
  // ═══════════════════════════════════════════════════════════════════════════

  determineRecommendationVerdict(grade: DDGrade, redFlags: DDRedFlag[]): DDRecommendationVerdict {
    const criticalFlags = redFlags.filter(f => f.severity === 'critical').length
    const highFlags = redFlags.filter(f => f.severity === 'high').length
    const totalSignificantFlags = criticalFlags + highFlags

    // Grade A/B + no critical flags → invest
    if ((grade === 'A' || grade === 'B') && criticalFlags === 0 && highFlags <= 1) {
      return 'invest'
    }

    // Grade A/B + critical flags OR Grade C → conditional_invest
    if ((grade === 'A' || grade === 'B') || grade === 'C') {
      return 'conditional_invest'
    }

    // Grade D + few flags → needs_more_info
    if (grade === 'D' && totalSignificantFlags <= 2) {
      return 'needs_more_info'
    }

    // Grade D + many flags or Grade F → pass
    return 'pass'
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FOLLOW-UP QUESTION GENERATION (DETERMINISTIC)
  // ═══════════════════════════════════════════════════════════════════════════

  private generateDeterministicFollowUps(claims: DDClaim[], omissions: DDOmission[]): DDFollowUpQuestion[] {
    const questions: DDFollowUpQuestion[] = []

    // From unverified critical claims
    const unverifiedCritical = claims.filter(c => c.priority === 'critical' && c.status === 'unverified')
    for (const claim of unverifiedCritical) {
      questions.push({
        category: claim.category,
        question: `Can you provide third-party evidence or documentation to support: "${claim.claimText}"?`,
        reason: `This critical claim could not be verified through external research`,
        priority: 'critical',
        source: 'unverified_claim',
      })
    }

    // From disputed claims
    const disputedClaims = claims.filter(c => c.status === 'disputed')
    for (const claim of disputedClaims) {
      const disputeEvidence = claim.verifications?.find(v => v.verdict === 'disputed')?.evidence || 'external evidence'
      questions.push({
        category: claim.category,
        question: `External evidence disputes "${claim.claimText}". Can you clarify or provide updated data?`,
        reason: `Dispute found: ${disputeEvidence}`,
        priority: claim.priority === 'critical' ? 'critical' : 'high',
        source: 'disputed_claim',
      })
    }

    // From omissions (critical and high)
    for (const omission of omissions.filter(o => o.severity === 'critical' || o.severity === 'high')) {
      questions.push({
        category: omission.category,
        question: `Your application did not include ${omission.expectedInfo.toLowerCase()}. Can you provide this information?`,
        reason: omission.reasoning,
        priority: omission.severity === 'critical' ? 'high' : 'medium',
        source: 'omission',
      })
    }

    // From benchmark flags (unrealistic or above_benchmark)
    const flaggedClaims = claims.filter(c => c.benchmarkFlag === 'unrealistic' || c.benchmarkFlag === 'above_benchmark')
    for (const claim of flaggedClaims) {
      const label = claim.benchmarkFlag === 'unrealistic' ? 'unusually high for your reported stage' : 'above typical benchmarks'
      questions.push({
        category: claim.category,
        question: `"${claim.claimText}" appears ${label}. Can you explain the methodology or provide supporting data?`,
        reason: `Benchmark analysis flagged this metric as ${claim.benchmarkFlag}`,
        priority: claim.benchmarkFlag === 'unrealistic' ? 'high' : 'medium',
        source: 'benchmark_flag',
      })
    }

    return questions
  }

  private mergeFollowUpQuestions(
    deterministic: DDFollowUpQuestion[],
    aiGenerated: DDFollowUpQuestion[]
  ): DDFollowUpQuestion[] {
    const all = [...deterministic, ...aiGenerated]

    // Deduplicate by similar question text (simple substring match)
    const seen = new Set<string>()
    const unique: DDFollowUpQuestion[] = []
    for (const q of all) {
      const key = q.question.toLowerCase().slice(0, 60)
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(q)
      }
    }

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    unique.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

    // Cap at 12
    return unique.slice(0, 12)
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // AI-GENERATED SUMMARY + EXTRAS
  // ═══════════════════════════════════════════════════════════════════════════

  private async generateExecutiveSummaryAndExtras(
    companyName: string,
    score: number,
    grade: DDGrade,
    categoryScores: DDCategoryScore[],
    redFlags: DDRedFlag[],
    verificationCoverage: number,
    omissions: DDOmission[],
    preliminaryVerdict: DDRecommendationVerdict
  ): Promise<{
    executiveSummary: string
    followUpQuestions: DDFollowUpQuestion[]
    recommendationConditions: string[]
    recommendationReasoning: string
  }> {
    const categoryBreakdown = categoryScores
      .map(cs => {
        const label = LABELS[cs.category]
        return `${label}: ${cs.confirmedClaims}/${cs.totalClaims} confirmed, ${cs.disputedClaims} disputed, ${cs.refutedClaims} refuted (confidence: ${Math.round(cs.categoryConfidence * 100)}%)${cs.flaggedIssues.length > 0 ? ` [FLAGS: ${cs.flaggedIssues.join(', ')}]` : ''}`
      })
      .join('\n')

    const redFlagsDescription = redFlags.length > 0
      ? redFlags.map(f => `- [${f.severity.toUpperCase()}] ${f.claimText}: ${f.reason} — ${f.evidence}`).join('\n')
      : 'No red flags identified.'

    const omissionsDescription = omissions.length > 0
      ? omissions.map(o => `- [${o.severity.toUpperCase()}] ${o.category}: ${o.expectedInfo} — ${o.reasoning}`).join('\n')
      : 'No significant omissions identified.'

    const verdictLabel = {
      invest: 'INVEST — Strong DD profile',
      conditional_invest: 'CONDITIONAL INVEST — Issues to resolve first',
      pass: 'PASS — Too many concerns',
      needs_more_info: 'NEEDS MORE INFO — Insufficient data for decision',
    }[preliminaryVerdict]

    const prompt = DD_EXECUTIVE_SUMMARY_PROMPT(
      companyName,
      score,
      grade,
      categoryBreakdown,
      redFlagsDescription,
      verificationCoverage,
      omissionsDescription,
      verdictLabel
    )

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 3072,
        system: DD_REPORT_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      })

      const textContent = response.content.find(c => c.type === 'text')
      if (!textContent || textContent.type !== 'text') {
        return this.fallbackResult(companyName, score, grade, categoryScores, redFlags, preliminaryVerdict)
      }

      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return this.fallbackResult(companyName, score, grade, categoryScores, redFlags, preliminaryVerdict)
      }

      const parsed = JSON.parse(jsonMatch[0])

      const aiFollowUps: DDFollowUpQuestion[] = (parsed.followUpQuestions || []).map((q: any) => ({
        category: q.category || 'traction',
        question: q.question || '',
        reason: q.reason || '',
        priority: q.priority || 'medium',
        source: 'ai_generated' as const,
      }))

      return {
        executiveSummary: parsed.executiveSummary || this.fallbackSummary(companyName, score, grade, categoryScores, redFlags),
        followUpQuestions: aiFollowUps,
        recommendationConditions: parsed.recommendationConditions || [],
        recommendationReasoning: parsed.recommendationReasoning || this.fallbackReasoningText(preliminaryVerdict),
      }
    } catch {
      return this.fallbackResult(companyName, score, grade, categoryScores, redFlags, preliminaryVerdict)
    }
  }

  private fallbackResult(
    companyName: string,
    score: number,
    grade: DDGrade,
    categoryScores: DDCategoryScore[],
    redFlags: DDRedFlag[],
    verdict: DDRecommendationVerdict
  ) {
    return {
      executiveSummary: this.fallbackSummary(companyName, score, grade, categoryScores, redFlags),
      followUpQuestions: [],
      recommendationConditions: verdict === 'conditional_invest' ? ['Resolve all identified red flags'] : [],
      recommendationReasoning: this.fallbackReasoningText(verdict),
    }
  }

  private fallbackSummary(
    companyName: string,
    score: number,
    grade: DDGrade,
    categoryScores: DDCategoryScore[],
    redFlags: DDRedFlag[]
  ): string {
    const totalClaims = categoryScores.reduce((sum, cs) => sum + cs.totalClaims, 0)
    const totalConfirmed = categoryScores.reduce((sum, cs) => sum + cs.confirmedClaims, 0)
    return `Due diligence on ${companyName} produced a score of ${score}/100 (Grade: ${grade}). Of ${totalClaims} claims extracted, ${totalConfirmed} were confirmed through external verification. ${redFlags.length} red flag(s) were identified requiring attention.`
  }

  private fallbackReasoningText(verdict: DDRecommendationVerdict): string {
    switch (verdict) {
      case 'invest': return 'Strong DD profile with verified claims and minimal red flags. Proceed with standard investment terms.'
      case 'conditional_invest': return 'DD reveals some concerns that should be addressed before finalizing investment. Resolution of flagged items is recommended.'
      case 'needs_more_info': return 'Insufficient verified data to make a confident investment decision. Additional information from the founders is needed.'
      case 'pass': return 'DD reveals significant concerns including multiple red flags. Investment is not recommended at this time.'
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DD REPORT GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

export class MockDDReportGenerator {
  async generateReport(input: DDReportInput): Promise<DDReportResult> {
    await new Promise(resolve => setTimeout(resolve, 1000))

    const { applicationId, companyName, claims, omissions } = input

    const categoryScores: DDCategoryScore[] = [
      {
        category: 'revenue_metrics',
        totalClaims: 1,
        confirmedClaims: 0,
        disputedClaims: 0,
        refutedClaims: 0,
        unverifiedClaims: 1,
        categoryConfidence: 0.5,
        flaggedIssues: ['1 critical claim(s) unverified'],
      },
      {
        category: 'team_background',
        totalClaims: 2,
        confirmedClaims: 1,
        disputedClaims: 0,
        refutedClaims: 0,
        unverifiedClaims: 1,
        categoryConfidence: 0.7,
        flaggedIssues: [],
      },
      {
        category: 'user_customer',
        totalClaims: 1,
        confirmedClaims: 0,
        disputedClaims: 0,
        refutedClaims: 0,
        unverifiedClaims: 1,
        categoryConfidence: 0.5,
        flaggedIssues: ['1 critical claim(s) unverified'],
      },
    ]

    const report: DueDiligenceReport = {
      id: '',
      applicationId,
      companyName,
      overallDDScore: 58,
      ddGrade: 'C',
      executiveSummary: `[MOCK] Due diligence on ${companyName} yielded a score of 58/100 (Grade: C). The team background claims were partially verified, while revenue and user metrics remain unconfirmed as is typical for early-stage startups. No claims were refuted. Further verification recommended before investment decision.`,
      categoryScores,
      claims,
      redFlags: [
        {
          claimId: claims[0]?.id || 'mock',
          claimText: `${companyName} revenue claims`,
          category: 'revenue_metrics',
          severity: 'medium',
          reason: 'Critical claim could not be externally verified',
          evidence: 'No external evidence found to confirm or deny this claim',
        },
      ],
      omissions: omissions.length > 0 ? omissions : [
        {
          category: 'revenue_metrics',
          expectedInfo: 'Burn rate / monthly expenses',
          severity: 'high',
          reasoning: 'Without burn rate, runway cannot be assessed.',
        },
      ],
      followUpQuestions: [
        {
          category: 'revenue_metrics',
          question: `Can you provide third-party evidence for ${companyName}'s revenue claims?`,
          reason: 'Revenue metrics could not be verified externally',
          priority: 'critical',
          source: 'unverified_claim',
        },
        {
          category: 'revenue_metrics',
          question: 'What is your current burn rate and runway?',
          reason: 'Burn rate was not disclosed in the application',
          priority: 'high',
          source: 'omission',
        },
      ],
      recommendation: {
        verdict: 'conditional_invest',
        conditions: ['Provide verified revenue documentation', 'Disclose burn rate and runway'],
        reasoning: '[MOCK] DD reveals a mixed picture. Core team claims verified but financial metrics need third-party confirmation. Conditional investment recommended pending documentation.',
      },
      totalSources: 4,
      verificationCoverage: 0.6,
      generatedAt: new Date().toISOString(),
    }

    return {
      success: true,
      report,
      metadata: { processingTimeMs: 1000 },
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FACTORY FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

let agentInstance: DDReportGenerator | MockDDReportGenerator | null = null

export function getDDReportGenerator(): DDReportGenerator | MockDDReportGenerator {
  if (!agentInstance) {
    if (process.env.ANTHROPIC_API_KEY) {
      agentInstance = new DDReportGenerator()
    } else {
      console.log('Missing API keys, using mock DD report generator')
      agentInstance = new MockDDReportGenerator()
    }
  }
  return agentInstance
}
