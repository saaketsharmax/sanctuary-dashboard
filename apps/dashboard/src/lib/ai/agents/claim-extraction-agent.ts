// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY DD — Claim Extraction Agent
// Extracts verifiable factual claims from application materials
// ═══════════════════════════════════════════════════════════════════════════

import Anthropic from '@anthropic-ai/sdk'
import {
  CLAIM_EXTRACTION_SYSTEM_PROMPT,
  CLAIM_EXTRACTION_PROMPT,
} from '../prompts/claim-extraction-system'
import type {
  DDClaim,
  DDClaimCategory,
  DDOmission,
  DDBenchmarkFlag,
  ClaimExtractionInput,
  ClaimExtractionResult,
} from '../types/due-diligence'
import { getStageBenchmarks } from '../types/due-diligence'

// ═══════════════════════════════════════════════════════════════════════════
// CLAIM EXTRACTION AGENT CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class ClaimExtractionAgent {
  private client: Anthropic
  private model = 'claude-sonnet-4-20250514'

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }

  async extractClaims(input: ClaimExtractionInput): Promise<ClaimExtractionResult> {
    const startTime = Date.now()

    try {
      const applicationData = this.formatApplicationData(input)
      const interviewData = this.formatInterviewData(input.interviewTranscript)
      const researchData = this.formatResearchData(input.researchData)
      const benchmarkContext = this.formatBenchmarkContext(input.applicationData.stage)

      const prompt = CLAIM_EXTRACTION_PROMPT(
        input.companyName,
        applicationData,
        interviewData,
        researchData,
        benchmarkContext
      )

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 4096,
        system: CLAIM_EXTRACTION_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      })

      const textContent = response.content.find(c => c.type === 'text')
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in Claude response')
      }

      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const parsed = JSON.parse(jsonMatch[0])
      const rawClaims = parsed.claims || []
      const contradictions = parsed.contradictions || []
      const rawOmissions = parsed.omissions || []

      // Build claims with contradiction links
      const claims: Omit<DDClaim, 'id' | 'verifications'>[] = rawClaims.map(
        (c: any, idx: number) => {
          const contradictingIndices = contradictions
            .filter((ct: any) => ct.claimA === idx || ct.claimB === idx)
            .map((ct: any) => (ct.claimA === idx ? ct.claimB : ct.claimA))

          return {
            applicationId: input.applicationId,
            category: this.validateCategory(c.category),
            claimText: c.claimText || '',
            sourceText: c.sourceText || '',
            sourceType: c.sourceType || 'application_form',
            sourceReference: c.sourceReference || '',
            status: 'unverified' as const,
            priority: c.priority || 'medium',
            extractionConfidence: Math.min(1, Math.max(0, c.extractionConfidence || 0.5)),
            verificationConfidence: null,
            contradicts: contradictingIndices.map((i: number) => `__idx_${i}`), // placeholder
            corroborates: [],
            benchmarkFlag: this.validateBenchmarkFlag(c.benchmarkFlag),
          }
        }
      )

      // Parse omissions
      const omissions: DDOmission[] = rawOmissions.map((o: any) => ({
        category: this.validateCategory(o.category || 'traction'),
        expectedInfo: o.expectedInfo || '',
        severity: this.validateSeverity(o.severity),
        reasoning: o.reasoning || '',
      }))

      // Calculate category counts
      const categoryCounts = {} as Record<DDClaimCategory, number>
      for (const claim of claims) {
        categoryCounts[claim.category] = (categoryCounts[claim.category] || 0) + 1
      }

      return {
        success: true,
        claims,
        omissions,
        metadata: {
          totalClaims: claims.length,
          categoryCounts,
          processingTimeMs: Date.now() - startTime,
        },
      }
    } catch (error) {
      console.error('Claim extraction error:', error)
      return {
        success: false,
        claims: [],
        omissions: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          totalClaims: 0,
          categoryCounts: {} as Record<DDClaimCategory, number>,
          processingTimeMs: Date.now() - startTime,
        },
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FORMATTING HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  private formatApplicationData(input: ClaimExtractionInput): string {
    const { applicationData, founders } = input
    const lines: string[] = []

    lines.push(`Company: ${input.companyName}`)
    if (applicationData.companyDescription) lines.push(`Description: ${applicationData.companyDescription}`)
    if (applicationData.problemDescription) lines.push(`Problem: ${applicationData.problemDescription}`)
    if (applicationData.solutionDescription) lines.push(`Solution: ${applicationData.solutionDescription}`)
    if (applicationData.targetCustomer) lines.push(`Target Customer: ${applicationData.targetCustomer}`)
    if (applicationData.stage) lines.push(`Stage: ${applicationData.stage}`)
    if (applicationData.userCount !== null) lines.push(`User Count: ${applicationData.userCount}`)
    if (applicationData.mrr !== null) lines.push(`MRR: $${applicationData.mrr}`)
    if (applicationData.biggestChallenge) lines.push(`Biggest Challenge: ${applicationData.biggestChallenge}`)
    if (applicationData.whySanctuary) lines.push(`Why Sanctuary: ${applicationData.whySanctuary}`)
    if (applicationData.whatTheyWant) lines.push(`What They Want: ${applicationData.whatTheyWant}`)
    if (applicationData.companyWebsite) lines.push(`Website: ${applicationData.companyWebsite}`)

    if (founders.length > 0) {
      lines.push('')
      lines.push('FOUNDERS:')
      for (const f of founders) {
        lines.push(`- ${f.name} (${f.role || 'Founder'})`)
        if (f.yearsExperience) lines.push(`  Years Experience: ${f.yearsExperience}`)
        if (f.hasStartedBefore) lines.push(`  Repeat Founder: Yes`)
        if (f.previousStartupOutcome) lines.push(`  Previous Outcome: ${f.previousStartupOutcome}`)
        if (f.linkedin) lines.push(`  LinkedIn: ${f.linkedin}`)
      }
    }

    return lines.join('\n')
  }

  private formatInterviewData(
    transcript: ClaimExtractionInput['interviewTranscript']
  ): string {
    if (!transcript || transcript.length === 0) {
      return 'No interview transcript available.'
    }

    return transcript
      .map(msg => `[${msg.role}${msg.section ? ` / ${msg.section}` : ''}]: ${msg.content}`)
      .join('\n\n')
  }

  private formatResearchData(data: Record<string, unknown> | null): string {
    if (!data || Object.keys(data).length === 0) {
      return 'No existing research data available.'
    }
    return JSON.stringify(data, null, 2)
  }

  private formatBenchmarkContext(stage: string | null): string {
    const benchmarks = getStageBenchmarks(stage)
    if (!benchmarks) {
      return 'No stage benchmarks available (stage not specified or not recognized).'
    }

    const lines = [`Stage: ${stage}`, '', 'Typical ranges for this stage:']
    for (const b of benchmarks) {
      lines.push(`- ${b.metric} (${b.category}): ${b.description}`)
    }
    lines.push('')
    lines.push('Use these ranges to set benchmarkFlag on quantitative claims. Claims wildly outside these ranges (>3x above max or <0.3x below min) should be flagged as "unrealistic".')
    return lines.join('\n')
  }

  private validateCategory(cat: string): DDClaimCategory {
    const valid: DDClaimCategory[] = [
      'revenue_metrics', 'user_customer', 'team_background', 'market_size',
      'competitive', 'technology_ip', 'customer_reference', 'traction', 'fundraising',
    ]
    return valid.includes(cat as DDClaimCategory) ? (cat as DDClaimCategory) : 'traction'
  }

  private validateBenchmarkFlag(flag: any): DDBenchmarkFlag {
    const valid = ['above_benchmark', 'below_benchmark', 'unrealistic']
    if (typeof flag === 'string' && valid.includes(flag)) return flag as DDBenchmarkFlag
    return null
  }

  private validateSeverity(severity: any): DDOmission['severity'] {
    const valid = ['critical', 'high', 'medium', 'low']
    if (typeof severity === 'string' && valid.includes(severity)) return severity as DDOmission['severity']
    return 'medium'
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK CLAIM EXTRACTION AGENT
// ═══════════════════════════════════════════════════════════════════════════

export class MockClaimExtractionAgent {
  async extractClaims(input: ClaimExtractionInput): Promise<ClaimExtractionResult> {
    await new Promise(resolve => setTimeout(resolve, 1500))

    const claims: Omit<DDClaim, 'id' | 'verifications'>[] = [
      {
        applicationId: input.applicationId,
        category: 'revenue_metrics',
        claimText: `${input.companyName} has $${input.applicationData.mrr || 0} MRR`,
        sourceText: `MRR: $${input.applicationData.mrr || 0}`,
        sourceType: 'application_form',
        sourceReference: 'application.mrr',
        status: 'unverified',
        priority: 'critical',
        extractionConfidence: 0.95,
        verificationConfidence: null,
        contradicts: [],
        corroborates: [],
        benchmarkFlag: null,
      },
      {
        applicationId: input.applicationId,
        category: 'user_customer',
        claimText: `${input.companyName} has ${input.applicationData.userCount || 0} users`,
        sourceText: `User Count: ${input.applicationData.userCount || 0}`,
        sourceType: 'application_form',
        sourceReference: 'application.userCount',
        status: 'unverified',
        priority: 'critical',
        extractionConfidence: 0.95,
        verificationConfidence: null,
        contradicts: [],
        corroborates: [],
        benchmarkFlag: null,
      },
      {
        applicationId: input.applicationId,
        category: 'market_size',
        claimText: `${input.companyName} targets ${input.applicationData.targetCustomer || 'unknown market'}`,
        sourceText: input.applicationData.targetCustomer || 'Not specified',
        sourceType: 'application_form',
        sourceReference: 'application.targetCustomer',
        status: 'unverified',
        priority: 'medium',
        extractionConfidence: 0.8,
        verificationConfidence: null,
        contradicts: [],
        corroborates: [],
        benchmarkFlag: null,
      },
      ...input.founders.map(f => ({
        applicationId: input.applicationId,
        category: 'team_background' as const,
        claimText: `${f.name} has ${f.yearsExperience || 0} years of experience${f.hasStartedBefore ? ' and is a repeat founder' : ''}`,
        sourceText: `${f.name}: ${f.yearsExperience || 0} years, ${f.hasStartedBefore ? 'repeat founder' : 'first-time founder'}`,
        sourceType: 'application_form' as const,
        sourceReference: 'application.founders',
        status: 'unverified' as const,
        priority: 'high' as const,
        extractionConfidence: 0.9,
        verificationConfidence: null,
        contradicts: [] as string[],
        corroborates: [] as string[],
        benchmarkFlag: null as DDBenchmarkFlag,
      })),
      {
        applicationId: input.applicationId,
        category: 'traction',
        claimText: `${input.companyName} is at ${input.applicationData.stage || 'unknown'} stage`,
        sourceText: `Stage: ${input.applicationData.stage || 'Not specified'}`,
        sourceType: 'application_form',
        sourceReference: 'application.stage',
        status: 'unverified',
        priority: 'high',
        extractionConfidence: 0.85,
        verificationConfidence: null,
        contradicts: [],
        corroborates: [],
        benchmarkFlag: null,
      },
    ]

    const omissions: DDOmission[] = [
      {
        category: 'revenue_metrics',
        expectedInfo: 'Burn rate / monthly expenses',
        severity: 'high',
        reasoning: 'Without burn rate, runway cannot be assessed — critical for investment timing.',
      },
      {
        category: 'competitive',
        expectedInfo: 'Named competitors and differentiation',
        severity: 'medium',
        reasoning: 'No competitive landscape provided; difficult to assess market positioning.',
      },
    ]

    return {
      success: true,
      claims,
      omissions,
      metadata: {
        totalClaims: claims.length,
        categoryCounts: {
          revenue_metrics: 1,
          user_customer: 1,
          team_background: input.founders.length,
          market_size: 1,
          competitive: 0,
          technology_ip: 0,
          customer_reference: 0,
          traction: 1,
          fundraising: 0,
        },
        processingTimeMs: 1500,
      },
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FACTORY FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

let agentInstance: ClaimExtractionAgent | MockClaimExtractionAgent | null = null

export function getClaimExtractionAgent(): ClaimExtractionAgent | MockClaimExtractionAgent {
  if (!agentInstance) {
    if (process.env.ANTHROPIC_API_KEY) {
      agentInstance = new ClaimExtractionAgent()
    } else {
      console.log('Missing API keys, using mock claim extraction agent')
      agentInstance = new MockClaimExtractionAgent()
    }
  }
  return agentInstance
}
