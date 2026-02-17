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
  DDGrade,
  DueDiligenceReport,
  DDReportInput,
  DDReportResult,
  DD_CATEGORY_LABELS,
  DD_CATEGORY_WEIGHTS,
  DD_PRIORITY_ORDER,
} from '../types/due-diligence'
import {
  DD_CATEGORY_LABELS as LABELS,
  DD_CATEGORY_WEIGHTS as WEIGHTS,
  DD_PRIORITY_ORDER as PRIORITY,
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
      const { applicationId, companyName, claims } = input

      // 1. Calculate category scores (deterministic)
      const categoryScores = this.calculateCategoryScores(claims)

      // 2. Calculate overall DD score (deterministic)
      const overallDDScore = this.calculateOverallScore(categoryScores)

      // 3. Determine grade (deterministic)
      const ddGrade = this.calculateGrade(overallDDScore)

      // 4. Identify red flags (deterministic)
      const redFlags = this.identifyRedFlags(claims)

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

      // 7. Generate executive summary with Claude (AI step)
      const executiveSummary = await this.generateExecutiveSummary(
        companyName,
        overallDDScore,
        ddGrade,
        categoryScores,
        redFlags,
        verificationCoverage
      )

      const report: DueDiligenceReport = {
        id: '', // Set by DB
        applicationId,
        companyName,
        overallDDScore,
        ddGrade,
        executiveSummary,
        categoryScores,
        claims,
        redFlags,
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

  private identifyRedFlags(claims: DDClaim[]): DDRedFlag[] {
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
    }

    // Sort by severity
    const severityOrder = { critical: 0, high: 1, medium: 2 }
    flags.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

    return flags
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // AI-GENERATED SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════

  private async generateExecutiveSummary(
    companyName: string,
    score: number,
    grade: DDGrade,
    categoryScores: DDCategoryScore[],
    redFlags: DDRedFlag[],
    verificationCoverage: number
  ): Promise<string> {
    const categoryBreakdown = categoryScores
      .map(cs => {
        const label = LABELS[cs.category]
        return `${label}: ${cs.confirmedClaims}/${cs.totalClaims} confirmed, ${cs.disputedClaims} disputed, ${cs.refutedClaims} refuted (confidence: ${Math.round(cs.categoryConfidence * 100)}%)${cs.flaggedIssues.length > 0 ? ` [FLAGS: ${cs.flaggedIssues.join(', ')}]` : ''}`
      })
      .join('\n')

    const redFlagsDescription = redFlags.length > 0
      ? redFlags.map(f => `- [${f.severity.toUpperCase()}] ${f.claimText}: ${f.reason} — ${f.evidence}`).join('\n')
      : 'No red flags identified.'

    const prompt = DD_EXECUTIVE_SUMMARY_PROMPT(
      companyName,
      score,
      grade,
      categoryBreakdown,
      redFlagsDescription,
      verificationCoverage
    )

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 2048,
        system: DD_REPORT_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      })

      const textContent = response.content.find(c => c.type === 'text')
      if (!textContent || textContent.type !== 'text') {
        return this.fallbackSummary(companyName, score, grade, categoryScores, redFlags)
      }

      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return this.fallbackSummary(companyName, score, grade, categoryScores, redFlags)
      }

      const parsed = JSON.parse(jsonMatch[0])
      return parsed.executiveSummary || this.fallbackSummary(companyName, score, grade, categoryScores, redFlags)
    } catch {
      return this.fallbackSummary(companyName, score, grade, categoryScores, redFlags)
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
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DD REPORT GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

export class MockDDReportGenerator {
  async generateReport(input: DDReportInput): Promise<DDReportResult> {
    await new Promise(resolve => setTimeout(resolve, 1000))

    const { applicationId, companyName, claims } = input

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
