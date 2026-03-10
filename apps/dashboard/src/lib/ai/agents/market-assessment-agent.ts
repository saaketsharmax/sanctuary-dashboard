// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY DD — Market Assessment Agent
// Validates market opportunity via Tavily research + Claude analysis
// Uses Vercel AI SDK generateText with tools + stopWhen
// ═══════════════════════════════════════════════════════════════════════════

import { generateText, tool, stepCountIs } from 'ai'
import { z } from 'zod'
import { getModel, MAX_TOKENS, SANCTUARY_MODEL_ID, ANTHROPIC_CACHE_OPTIONS } from '../config'
import { getTavilyClient } from '@/lib/research/tavily-client'
import {
  MARKET_ASSESSMENT_SYSTEM_PROMPT,
} from '../prompts/market-assessment-system'
import type {
  DDMarketAssessment,
  DDMarketAssessmentInput,
  DDMarketAssessmentResult,
  DDCompetitor,
  DDCompetitorThreatLevel,
  DDTAMValidation,
  DDRedFlag,
  DDGrade,
} from '../types/due-diligence'

// ═══════════════════════════════════════════════════════════════════════════
// MARKET ASSESSMENT AGENT CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class MarketAssessmentAgent {
  private tavily = getTavilyClient()

  async assessMarket(input: DDMarketAssessmentInput): Promise<DDMarketAssessmentResult> {
    const startTime = Date.now()
    let tavilySearches = 0

    try {
      const { companyName, companyDescription, targetCustomer, stage, companyWebsite, interviewTranscript } = input

      const industry = this.extractIndustry(companyDescription, targetCustomer)

      // Filter interview transcript for market-related excerpts
      const interviewData = interviewTranscript
        ? interviewTranscript
            .filter(msg => {
              const section = (msg.section || '').toLowerCase()
              const content = msg.content.toLowerCase()
              return msg.role === 'user' && (
                section.includes('market') ||
                section.includes('compet') ||
                section.includes('customer') ||
                content.includes('market') ||
                content.includes('competitor') ||
                content.includes('tam') ||
                content.includes('total addressable')
              )
            })
            .map(msg => `[${msg.section || 'general'}] ${msg.content}`)
            .join('\n\n')
        : null

      const tavily = this.tavily

      const result = await generateText({
        model: getModel(),
        maxOutputTokens: MAX_TOKENS.analysis,
        stopWhen: stepCountIs(10),
        providerOptions: ANTHROPIC_CACHE_OPTIONS,
        system: `${MARKET_ASSESSMENT_SYSTEM_PROMPT}

You have access to web search and extraction tools. Use them to research the market opportunity before generating your assessment.

Research strategy:
1. Search for TAM/SAM market size data and CAGR for the industry
2. Search for market trends and growth forecasts
3. Search for competitors, their funding, and positioning
4. Search for recent funding activity in the sector
5. If a company website is provided, extract content from it

After gathering research data, produce your final assessment as a JSON object with this exact structure:
{
  "tamValidation": {
    "claimed": "string or null — what the company claims their TAM is",
    "estimated": "string — your estimate based on research (e.g., '$15B by 2028')",
    "confidence": 0.0-1.0,
    "methodology": "string — how you derived the estimate (bottom-up + top-down)",
    "sources": ["string — URLs of key sources used"]
  },
  "competitorMap": [
    {
      "name": "string",
      "description": "string — 1-2 sentence description",
      "funding": "string or null — e.g., '$50M Series B'",
      "positioning": "string — how they compare to ${companyName}",
      "threatLevel": "high | medium | low",
      "differentiator": "string — what makes ${companyName} different from this competitor",
      "sourceUrl": "string or null"
    }
  ],
  "marketTimingScore": 0-100,
  "marketTimingReasoning": "string — 2-3 sentences explaining the timing score",
  "adjacentMarkets": ["string — realistic adjacent markets for expansion"],
  "marketRedFlags": [
    {
      "claimId": "market",
      "claimText": "string — what the flag is about",
      "category": "market_size",
      "severity": "critical | high | medium",
      "reason": "string",
      "evidence": "string"
    }
  ],
  "marketStrengths": ["string — market-level strengths"],
  "overallMarketScore": 0-100,
  "marketGrade": "A | B | C | D | F"
}

Validate TAM estimates using both bottom-up and top-down approaches.
Map competitors with name, funding, positioning, threat level, and differentiator.
Score market timing 0-100.
Identify adjacent markets.
Flag market red flags.
Score the overall market as: TAM attractiveness (30%) + competitive positioning (30%) + market timing (25%) + expansion potential (15%).

Return only valid JSON as your final answer.`,
        prompt: `Assess the market opportunity for ${companyName}.

COMPANY CONTEXT:
- Description: ${companyDescription || 'Not provided'}
- Target Customer: ${targetCustomer || 'Not specified'}
- Stage: ${stage || 'Not specified'}
- Industry: ${industry}
${companyWebsite ? `- Website: ${companyWebsite}` : ''}

${interviewData && interviewData.length > 0 ? `INTERVIEW EXCERPTS (market-related):\n${interviewData}` : 'No interview transcript available.'}

Use your search tools to gather market data, then provide your assessment as JSON.`,
        tools: {
          searchMarketSize: tool({
            description: 'Search for TAM/SAM market size data and CAGR for an industry and target customer segment',
            inputSchema: z.object({
              industry: z.string().describe('The industry or sector to search for'),
              targetCustomer: z.string().describe('The target customer segment'),
            }),
            execute: async ({ industry: ind, targetCustomer: tc }) => {
              tavilySearches++
              const response = await tavily.searchMarketData(ind, tc)
              return {
                answer: response.answer || null,
                results: response.results.map(r => ({
                  title: r.title,
                  url: r.url,
                  content: r.content.slice(0, 500),
                  publishedDate: r.publishedDate || null,
                })),
              }
            },
          }),
          searchMarketTrends: tool({
            description: 'Search for market trends and growth forecasts for an industry',
            inputSchema: z.object({
              industry: z.string().describe('The industry or sector to search trends for'),
            }),
            execute: async ({ industry: ind }) => {
              tavilySearches++
              const response = await tavily.search({
                query: `${ind} market trends growth forecast 2025 2026 CAGR`,
                searchDepth: 'advanced',
                maxResults: 5,
                includeAnswer: true,
              })
              return {
                answer: response.answer || null,
                results: response.results.map(r => ({
                  title: r.title,
                  url: r.url,
                  content: r.content.slice(0, 500),
                  publishedDate: r.publishedDate || null,
                })),
              }
            },
          }),
          searchCompetitors: tool({
            description: 'Search for competitors in a space, their funding levels, and market positioning',
            inputSchema: z.object({
              companyName: z.string().describe('The company name to find competitors for'),
              industry: z.string().describe('The industry or sector'),
            }),
            execute: async ({ companyName: cn, industry: ind }) => {
              tavilySearches++
              const response = await tavily.searchCompetitors(cn, ind, companyDescription || '')
              return {
                answer: response.answer || null,
                results: response.results.map(r => ({
                  title: r.title,
                  url: r.url,
                  content: r.content.slice(0, 500),
                  publishedDate: r.publishedDate || null,
                })),
              }
            },
          }),
          searchFunding: tool({
            description: 'Search for recent funding activity and investment rounds in a sector',
            inputSchema: z.object({
              industry: z.string().describe('The industry or sector to search funding for'),
            }),
            execute: async ({ industry: ind }) => {
              tavilySearches++
              const response = await tavily.search({
                query: `${ind} startup funding rounds 2024 2025 2026 competitors "${companyName}" alternatives`,
                searchDepth: 'advanced',
                maxResults: 5,
                includeAnswer: true,
              })
              return {
                answer: response.answer || null,
                results: response.results.map(r => ({
                  title: r.title,
                  url: r.url,
                  content: r.content.slice(0, 500),
                  publishedDate: r.publishedDate || null,
                })),
              }
            },
          }),
          searchCompanyWebsite: tool({
            description: 'Extract content from a company website URL to understand their positioning and claims',
            inputSchema: z.object({
              url: z.string().describe('The URL to extract content from'),
            }),
            execute: async ({ url }) => {
              tavilySearches++
              const response = await tavily.extract({ urls: [url] })
              return { content: response.results[0]?.rawContent || 'Could not extract content' }
            },
          }),
        },
      })

      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in market assessment response')
      }

      const parsed = JSON.parse(jsonMatch[0])
      const assessment = this.parseAssessment(parsed)

      return {
        success: true,
        assessment,
        metadata: {
          tavilySearches,
          competitorsFound: assessment.competitorMap.length,
          processingTimeMs: Date.now() - startTime,
        },
      }
    } catch (error) {
      console.error('Market assessment error:', error)
      return {
        success: false,
        assessment: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          tavilySearches,
          competitorsFound: 0,
          processingTimeMs: Date.now() - startTime,
        },
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PARSING & VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  private parseAssessment(parsed: any): DDMarketAssessment {
    const tamValidation: DDTAMValidation = {
      claimed: parsed.tamValidation?.claimed || null,
      estimated: parsed.tamValidation?.estimated || 'Unable to estimate',
      confidence: Math.max(0, Math.min(1, Number(parsed.tamValidation?.confidence) || 0.3)),
      methodology: parsed.tamValidation?.methodology || 'Insufficient data for reliable estimate',
      sources: Array.isArray(parsed.tamValidation?.sources) ? parsed.tamValidation.sources : [],
    }

    const competitorMap: DDCompetitor[] = (parsed.competitorMap || []).map((c: any) => ({
      name: c.name || 'Unknown',
      description: c.description || '',
      funding: c.funding || null,
      positioning: c.positioning || '',
      threatLevel: this.validateThreatLevel(c.threatLevel),
      differentiator: c.differentiator || '',
      sourceUrl: c.sourceUrl || null,
    }))

    const marketRedFlags: DDRedFlag[] = (parsed.marketRedFlags || []).map((rf: any) => ({
      claimId: rf.claimId || 'market',
      claimText: rf.claimText || '',
      category: 'market_size' as const,
      severity: this.validateSeverity(rf.severity),
      reason: rf.reason || '',
      evidence: rf.evidence || '',
    }))

    const overallMarketScore = this.clampScore(parsed.overallMarketScore)

    return {
      tamValidation,
      competitorMap,
      marketTimingScore: this.clampScore(parsed.marketTimingScore),
      marketTimingReasoning: parsed.marketTimingReasoning || 'No timing analysis available',
      adjacentMarkets: Array.isArray(parsed.adjacentMarkets) ? parsed.adjacentMarkets : [],
      overallMarketScore,
      marketGrade: this.scoreToGrade(overallMarketScore),
      marketRedFlags,
      marketStrengths: Array.isArray(parsed.marketStrengths) ? parsed.marketStrengths : [],
    }
  }

  private extractIndustry(description: string | null, targetCustomer: string | null): string {
    const text = `${description || ''} ${targetCustomer || ''}`.toLowerCase()
    if (text.includes('fintech') || text.includes('financial') || text.includes('banking')) return 'fintech'
    if (text.includes('healthtech') || text.includes('health') || text.includes('medical')) return 'healthtech'
    if (text.includes('edtech') || text.includes('education') || text.includes('learning')) return 'edtech'
    if (text.includes('saas') || text.includes('software')) return 'B2B SaaS'
    if (text.includes('ecommerce') || text.includes('e-commerce') || text.includes('retail')) return 'ecommerce'
    if (text.includes('ai') || text.includes('artificial intelligence') || text.includes('machine learning')) return 'AI/ML'
    if (text.includes('cybersecurity') || text.includes('security')) return 'cybersecurity'
    if (text.includes('marketplace')) return 'marketplace'
    if (text.includes('devtool') || text.includes('developer')) return 'developer tools'
    if (text.includes('climate') || text.includes('clean') || text.includes('energy')) return 'cleantech'
    return description?.split('.')[0]?.slice(0, 50) || 'technology startup'
  }

  private clampScore(score: any): number {
    const n = Number(score) || 0
    return Math.round(Math.max(0, Math.min(100, n)))
  }

  private scoreToGrade(score: number): DDGrade {
    if (score >= 90) return 'A'
    if (score >= 75) return 'B'
    if (score >= 60) return 'C'
    if (score >= 40) return 'D'
    return 'F'
  }

  private validateThreatLevel(t: string): DDCompetitorThreatLevel {
    if (t === 'high' || t === 'medium' || t === 'low') return t
    return 'medium'
  }

  private validateSeverity(s: string): DDRedFlag['severity'] {
    if (s === 'critical' || s === 'high' || s === 'medium') return s
    return 'medium'
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK MARKET ASSESSMENT AGENT
// ═══════════════════════════════════════════════════════════════════════════

export class MockMarketAssessmentAgent {
  async assessMarket(input: DDMarketAssessmentInput): Promise<DDMarketAssessmentResult> {
    await new Promise(resolve => setTimeout(resolve, 1500))

    const { companyName } = input

    const assessment: DDMarketAssessment = {
      tamValidation: {
        claimed: null,
        estimated: '$12B by 2028',
        confidence: 0.5,
        methodology: '[MOCK] Top-down estimate from industry reports. Limited data available for validation.',
        sources: ['https://statista.com/mock-market-report'],
      },
      competitorMap: [
        {
          name: 'Competitor Alpha',
          description: 'Well-funded direct competitor with similar product offering',
          funding: '$25M Series B',
          positioning: 'More enterprise-focused, higher price point',
          threatLevel: 'high',
          differentiator: `${companyName} targets SMBs with simpler onboarding`,
          sourceUrl: 'https://crunchbase.com/mock-competitor',
        },
        {
          name: 'Competitor Beta',
          description: 'Earlier-stage competitor with open-source approach',
          funding: '$5M Seed',
          positioning: 'Developer-first, freemium model',
          threatLevel: 'medium',
          differentiator: `${companyName} offers more complete solution out of the box`,
          sourceUrl: null,
        },
      ],
      marketTimingScore: 70,
      marketTimingReasoning: '[MOCK] Market is growing at ~15% CAGR with increasing enterprise adoption. Recent AI advancements are creating new tailwinds. Timing appears favorable for market entry.',
      adjacentMarkets: ['Enterprise automation', 'Data analytics', 'Workflow management'],
      overallMarketScore: 65,
      marketGrade: 'C',
      marketRedFlags: [
        {
          claimId: 'market',
          claimText: `${companyName} faces well-funded competition`,
          category: 'market_size',
          severity: 'medium',
          reason: 'Multiple competitors have raised significant funding',
          evidence: '[MOCK] At least 2 competitors have raised $25M+ in recent rounds',
        },
      ],
      marketStrengths: [
        'Growing market with strong tailwinds',
        'Clear differentiation from existing players',
        'Multiple adjacent market opportunities',
      ],
    }

    return {
      success: true,
      assessment,
      metadata: {
        tavilySearches: 5,
        competitorsFound: 2,
        processingTimeMs: 1500,
      },
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FACTORY FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

let agentInstance: MarketAssessmentAgent | MockMarketAssessmentAgent | null = null

export function getMarketAssessmentAgent(): MarketAssessmentAgent | MockMarketAssessmentAgent {
  if (!agentInstance) {
    if (process.env.ANTHROPIC_API_KEY && process.env.TAVILY_API_KEY) {
      agentInstance = new MarketAssessmentAgent()
    } else {
      console.warn('Missing API keys, using mock market assessment agent')
      agentInstance = new MockMarketAssessmentAgent()
    }
  }
  return agentInstance
}
