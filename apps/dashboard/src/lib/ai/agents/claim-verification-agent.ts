// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY DD — Claim Verification Agent
// Verifies claims using Tavily web search + Claude analysis
// ═══════════════════════════════════════════════════════════════════════════

import Anthropic from '@anthropic-ai/sdk'
import { getTavilyClient, type TavilySearchResponse } from '@/lib/research/tavily-client'
import {
  CLAIM_VERIFICATION_SYSTEM_PROMPT,
  BATCH_VERIFICATION_PROMPT,
} from '../prompts/claim-verification-system'
import type {
  DDClaim,
  DDVerification,
  DDClaimCategory,
  ClaimVerificationInput,
  ClaimVerificationResult,
} from '../types/due-diligence'

// ═══════════════════════════════════════════════════════════════════════════
// CLAIM VERIFICATION AGENT CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class ClaimVerificationAgent {
  private client: Anthropic
  private tavily = getTavilyClient()
  private model = 'claude-sonnet-4-20250514'

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }

  async verifyClaims(input: ClaimVerificationInput): Promise<ClaimVerificationResult> {
    const startTime = Date.now()
    let totalSearches = 0

    try {
      const { claims, companyName } = input

      // Group claims by category for efficient searching
      const categoryGroups = this.groupByCategory(claims)
      const allVerifications: Omit<DDVerification, 'id'>[] = []

      // Process each category group
      for (const [category, categoryClaims] of Object.entries(categoryGroups)) {
        const { verifications, searches } = await this.verifyCategoryBatch(
          companyName,
          category as DDClaimCategory,
          categoryClaims,
          input.companyWebsite
        )
        allVerifications.push(...verifications)
        totalSearches += searches
      }

      return {
        success: true,
        verifications: allVerifications,
        metadata: {
          totalVerifications: allVerifications.length,
          totalSearches,
          processingTimeMs: Date.now() - startTime,
        },
      }
    } catch (error) {
      console.error('Claim verification error:', error)
      return {
        success: false,
        verifications: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          totalVerifications: 0,
          totalSearches,
          processingTimeMs: Date.now() - startTime,
        },
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORY-SPECIFIC VERIFICATION
  // ═══════════════════════════════════════════════════════════════════════════

  private async verifyCategoryBatch(
    companyName: string,
    category: DDClaimCategory,
    claims: DDClaim[],
    companyWebsite: string | null
  ): Promise<{ verifications: Omit<DDVerification, 'id'>[]; searches: number }> {
    // Get shared search results for the category
    const searchResults = await this.getCategorySearchResults(
      companyName,
      category,
      claims,
      companyWebsite
    )

    const searchCount = searchResults.length

    // For each claim, also do a targeted search
    const claimSearches = await Promise.all(
      claims
        .filter(c => c.priority === 'critical' || c.priority === 'high')
        .map(async claim => {
          const depth = claim.priority === 'critical' ? 'advanced' : 'basic'
          const result = await this.tavily.search({
            query: `"${companyName}" ${claim.claimText} verify evidence`,
            searchDepth: depth as 'basic' | 'advanced',
            maxResults: 3,
            includeAnswer: true,
          })
          return { claimId: claim.id, result }
        })
    )

    // Format all evidence for batch verification
    const claimsWithEvidence = claims.map((claim, idx) => {
      const categoryEvidence = this.formatSearchResults(searchResults)
      const claimSpecific = claimSearches.find(cs => cs.claimId === claim.id)
      const specificEvidence = claimSpecific
        ? this.formatSearchResults([claimSpecific.result])
        : ''

      return `═══ CLAIM ${idx} ═══
CLAIM: "${claim.claimText}"
CATEGORY: ${claim.category}
PRIORITY: ${claim.priority}
CLAIM ID: ${claim.id}

CATEGORY-LEVEL EVIDENCE:
${categoryEvidence}

${specificEvidence ? `CLAIM-SPECIFIC EVIDENCE:\n${specificEvidence}` : ''}`
    }).join('\n\n')

    // Send to Claude for batch analysis
    const prompt = BATCH_VERIFICATION_PROMPT(companyName, claimsWithEvidence)

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: CLAIM_VERIFICATION_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    })

    const textContent = response.content.find(c => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in verification response')
    }

    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in verification response')
    }

    const parsed = JSON.parse(jsonMatch[0])
    const rawVerifications = parsed.verifications || []

    const verifications: Omit<DDVerification, 'id'>[] = rawVerifications.map((v: any) => {
      const claim = claims[v.claimIndex] || claims[0]
      return {
        claimId: claim.id,
        sourceType: 'ai_research' as const,
        sourceName: 'Tavily Web Search + Claude Analysis',
        sourceCredentials: null,
        verdict: this.validateVerdict(v.verdict),
        confidence: Math.min(1, Math.max(0, v.confidence || 0.5)),
        evidence: v.evidence || 'No evidence summary provided',
        evidenceUrls: v.evidenceUrls || [],
        notes: v.notes || null,
      }
    })

    return {
      verifications,
      searches: searchCount + claimSearches.length,
    }
  }

  private async getCategorySearchResults(
    companyName: string,
    category: DDClaimCategory,
    claims: DDClaim[],
    companyWebsite: string | null
  ): Promise<TavilySearchResponse[]> {
    const results: TavilySearchResponse[] = []

    switch (category) {
      case 'revenue_metrics':
      case 'traction':
      case 'fundraising': {
        const result = await this.tavily.search({
          query: `"${companyName}" funding revenue traction startup metrics Crunchbase`,
          searchDepth: 'advanced',
          maxResults: 8,
          includeAnswer: true,
        })
        results.push(result)
        break
      }
      case 'team_background': {
        // Search each unique founder mentioned in claims
        const founderNames = [...new Set(
          claims
            .map(c => c.claimText.match(/^([A-Z][a-z]+ [A-Z][a-z]+)/)?.[1])
            .filter(Boolean) as string[]
        )]
        for (const name of founderNames.slice(0, 3)) {
          const result = await this.tavily.searchFounderBackground(name, companyName)
          results.push(result)
        }
        break
      }
      case 'market_size': {
        const marketClaim = claims[0]?.claimText || ''
        const result = await this.tavily.search({
          query: `${marketClaim} market size TAM 2025 2026 research report`,
          searchDepth: 'advanced',
          maxResults: 5,
          includeAnswer: true,
        })
        results.push(result)
        break
      }
      case 'competitive': {
        const result = await this.tavily.search({
          query: `"${companyName}" competitors market landscape alternative`,
          searchDepth: 'advanced',
          maxResults: 8,
          includeAnswer: true,
        })
        results.push(result)
        break
      }
      case 'technology_ip': {
        const result = await this.tavily.search({
          query: `"${companyName}" patent technology product github`,
          searchDepth: 'basic',
          maxResults: 5,
          includeAnswer: true,
        })
        results.push(result)
        break
      }
      case 'customer_reference': {
        const result = await this.tavily.search({
          query: `"${companyName}" customer case study testimonial review`,
          searchDepth: 'basic',
          maxResults: 5,
          includeAnswer: true,
        })
        results.push(result)
        break
      }
      default: {
        const result = await this.tavily.validateClaim(claims[0]?.claimText || companyName, companyName)
        results.push(result)
      }
    }

    return results
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  private groupByCategory(claims: DDClaim[]): Record<string, DDClaim[]> {
    const groups: Record<string, DDClaim[]> = {}
    for (const claim of claims) {
      if (!groups[claim.category]) groups[claim.category] = []
      groups[claim.category].push(claim)
    }
    return groups
  }

  private formatSearchResults(responses: TavilySearchResponse[]): string {
    const lines: string[] = []
    for (const response of responses) {
      if (response.answer) {
        lines.push(`SUMMARY: ${response.answer}`)
        lines.push('')
      }
      for (const result of response.results) {
        lines.push(`TITLE: ${result.title}`)
        lines.push(`URL: ${result.url}`)
        lines.push(`CONTENT: ${result.content}`)
        if (result.publishedDate) lines.push(`DATE: ${result.publishedDate}`)
        lines.push('')
      }
    }
    return lines.join('\n') || 'No search results found.'
  }

  private validateVerdict(verdict: string): DDVerification['verdict'] {
    const valid = ['confirmed', 'partially_confirmed', 'unconfirmed', 'disputed', 'refuted']
    return valid.includes(verdict) ? (verdict as DDVerification['verdict']) : 'unconfirmed'
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK CLAIM VERIFICATION AGENT
// ═══════════════════════════════════════════════════════════════════════════

export class MockClaimVerificationAgent {
  async verifyClaims(input: ClaimVerificationInput): Promise<ClaimVerificationResult> {
    await new Promise(resolve => setTimeout(resolve, 2000))

    const verdicts: DDVerification['verdict'][] = [
      'confirmed', 'partially_confirmed', 'unconfirmed', 'disputed',
    ]

    const verifications: Omit<DDVerification, 'id'>[] = input.claims.map((claim, idx) => ({
      claimId: claim.id,
      sourceType: 'ai_research' as const,
      sourceName: 'Tavily Web Search [MOCK]',
      sourceCredentials: null,
      verdict: verdicts[idx % verdicts.length],
      confidence: 0.5 + Math.random() * 0.4,
      evidence: `[MOCK] Evidence for: "${claim.claimText}". Based on web search results, this claim has been evaluated.`,
      evidenceUrls: ['https://example.com/mock-source'],
      notes: '[MOCK] This is a simulated verification result.',
    }))

    return {
      success: true,
      verifications,
      metadata: {
        totalVerifications: verifications.length,
        totalSearches: input.claims.length,
        processingTimeMs: 2000,
      },
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FACTORY FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

let agentInstance: ClaimVerificationAgent | MockClaimVerificationAgent | null = null

export function getClaimVerificationAgent(): ClaimVerificationAgent | MockClaimVerificationAgent {
  if (!agentInstance) {
    if (process.env.ANTHROPIC_API_KEY && process.env.TAVILY_API_KEY) {
      agentInstance = new ClaimVerificationAgent()
    } else {
      console.log('Missing API keys, using mock claim verification agent')
      agentInstance = new MockClaimVerificationAgent()
    }
  }
  return agentInstance
}
