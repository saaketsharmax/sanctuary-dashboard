// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY DD — Claim Verification Agent
// Verifies claims using Tavily web search + Claude analysis (Vercel AI SDK)
// ═══════════════════════════════════════════════════════════════════════════

import { generateText, tool, stepCountIs } from 'ai'
import { z } from 'zod'
import { getTavilyClient } from '@/lib/research/tavily-client'
import { getModel, MAX_TOKENS, ANTHROPIC_CACHE_OPTIONS } from '../config'
import { getSourceCredibilityTier } from '../types/due-diligence'
import type {
  DDClaim,
  DDVerification,
  ClaimVerificationInput,
  ClaimVerificationResult,
} from '../types/due-diligence'

// ═══════════════════════════════════════════════════════════════════════════
// CLAIM VERIFICATION AGENT CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class ClaimVerificationAgent {
  private tavily = getTavilyClient()

  async verifyClaims(input: ClaimVerificationInput): Promise<ClaimVerificationResult> {
    const startTime = Date.now()
    let totalSearches = 0

    try {
      const { claims, companyName, companyWebsite } = input

      // Build structured claim data for the system prompt
      const claimsData = claims.map((claim, idx) => ({
        index: idx,
        claimId: claim.id,
        claimText: claim.claimText,
        category: claim.category,
        priority: claim.priority,
      }))

      const { text } = await generateText({
        model: getModel(),
        maxOutputTokens: MAX_TOKENS.analysis,
        stopWhen: stepCountIs(15),
        providerOptions: ANTHROPIC_CACHE_OPTIONS,
        system: `You are a due diligence analyst verifying startup claims for an investment fund.
You have access to web search tools. Use them to find evidence for or against each claim.

COMPANY: "${companyName}"
${companyWebsite ? `WEBSITE: ${companyWebsite}` : ''}

CLAIMS TO VERIFY:
${JSON.stringify(claimsData, null, 2)}

INSTRUCTIONS:
1. For each claim, use the searchWeb tool to find evidence. Use "advanced" searchDepth for critical/high priority claims.
2. For team_background claims that mention a person's name, use the searchFounderBackground tool instead.
3. Search strategically — you can combine related claims into a single search query when they share a category.
4. After gathering evidence, return your analysis as a JSON array.

RESPONSE FORMAT — return ONLY a JSON array (no markdown fences, no wrapper object):
[
  {
    "claimIndex": <number>,
    "claimId": "<string>",
    "verdict": "confirmed" | "partially_confirmed" | "unconfirmed" | "disputed" | "refuted",
    "confidence": <number 0-1>,
    "evidence": "<summary of evidence found>",
    "evidenceUrls": ["<url1>", "<url2>"],
    "notes": "<optional additional context>"
  }
]

Every claim must have exactly one entry in the array. Be rigorous — only mark "confirmed" if you found strong corroborating evidence from credible sources.`,
        prompt: `Verify all ${claims.length} claims listed above for "${companyName}". Search the web for evidence and return your verdicts as a JSON array.`,
        tools: {
          searchWeb: tool({
            description: 'Search the web to verify a claim',
            inputSchema: z.object({
              query: z.string(),
              searchDepth: z.enum(['basic', 'advanced']).optional(),
            }),
            execute: async ({ query, searchDepth }) => {
              const result = await this.tavily.search({
                query,
                searchDepth: searchDepth || 'basic',
                maxResults: 3,
                includeAnswer: true,
              })
              totalSearches++
              return {
                answer: result.answer,
                results: result.results.map(r => ({
                  title: r.title,
                  url: r.url,
                  content: r.content.slice(0, 500),
                  score: r.score,
                })),
              }
            },
          }),
          searchFounderBackground: tool({
            description: 'Search for a founder by name to verify team claims',
            inputSchema: z.object({
              founderName: z.string(),
              companyName: z.string(),
            }),
            execute: async ({ founderName, companyName: coName }) => {
              const result = await this.tavily.searchFounderBackground(founderName, coName)
              totalSearches++
              return {
                answer: result.answer,
                results: result.results.map(r => ({
                  title: r.title,
                  url: r.url,
                  content: r.content.slice(0, 500),
                })),
              }
            },
          }),
        },
      })

      // Parse the final text response as a JSON array of verifications
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error('No JSON array found in verification response')
      }

      const rawVerifications = JSON.parse(jsonMatch[0])

      const verifications: Omit<DDVerification, 'id'>[] = rawVerifications.map((v: any) => {
        const claim = claims[v.claimIndex] || claims.find(c => c.id === v.claimId) || claims[0]
        const urls: string[] = v.evidenceUrls || []
        const rawConfidence = Math.min(1, Math.max(0, v.confidence || 0.5))

        // Compute source credibility score as average weight of evidence URLs
        const sourceCredibilityScore = this.computeSourceCredibilityScore(urls, companyWebsite)

        // Adjust confidence: rawConfidence * avgSourceWeight (clamped 0-1)
        const adjustedConfidence = Math.min(1, Math.max(0, rawConfidence * sourceCredibilityScore))

        return {
          claimId: claim.id,
          sourceType: 'ai_research' as const,
          sourceName: 'Tavily Web Search + Claude Analysis',
          sourceCredentials: null,
          verdict: this.validateVerdict(v.verdict),
          confidence: adjustedConfidence,
          evidence: v.evidence || 'No evidence summary provided',
          evidenceUrls: urls,
          notes: v.notes || null,
          sourceCredibilityScore,
        }
      })

      return {
        success: true,
        verifications,
        metadata: {
          totalVerifications: verifications.length,
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
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  private computeSourceCredibilityScore(urls: string[], companyWebsite: string | null): number {
    if (urls.length === 0) return 0.65 // default tier3 weight when no URLs
    let totalWeight = 0
    for (const url of urls) {
      const { weight } = getSourceCredibilityTier(url, companyWebsite)
      totalWeight += weight
    }
    return totalWeight / urls.length
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
      sourceCredibilityScore: 0.65,
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
      console.warn('Missing API keys, using mock claim verification agent')
      agentInstance = new MockClaimVerificationAgent()
    }
  }
  return agentInstance
}
