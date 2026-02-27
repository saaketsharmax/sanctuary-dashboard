// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY DD — Market Assessment Agent
// Validates market opportunity via Tavily research + Claude analysis
// ═══════════════════════════════════════════════════════════════════════════

import Anthropic from '@anthropic-ai/sdk'
import { getTavilyClient, type TavilySearchResponse } from '@/lib/research/tavily-client'
import {
  MARKET_ASSESSMENT_SYSTEM_PROMPT,
  MARKET_ASSESSMENT_USER_PROMPT,
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
  private client: Anthropic
  private tavily = getTavilyClient()
  private model = 'claude-sonnet-4-20250514'

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }

  async assessMarket(input: DDMarketAssessmentInput): Promise<DDMarketAssessmentResult> {
    const startTime = Date.now()
    let tavilySearches = 0

    try {
      const { companyName, companyDescription, targetCustomer, stage, companyWebsite, interviewTranscript } = input

      // ─── Step 1: Market sizing research ───
      const industry = this.extractIndustry(companyDescription, targetCustomer)

      const marketResult = await this.tavily.searchMarketData(
        industry,
        targetCustomer || companyName
      )
      tavilySearches++

      // Broader market trends search
      const trendResult = await this.tavily.search({
        query: `${industry} market trends growth forecast 2025 2026 CAGR`,
        searchDepth: 'advanced',
        maxResults: 5,
        includeAnswer: true,
      })
      tavilySearches++

      // ─── Step 2: Competitor research ───
      const competitorResult = await this.tavily.searchCompetitors(
        companyName,
        industry,
        companyDescription || ''
      )
      tavilySearches++

      // Targeted competitor funding search
      const fundingResult = await this.tavily.search({
        query: `${industry} startup funding rounds 2024 2025 2026 competitors "${companyName}" alternatives`,
        searchDepth: 'advanced',
        maxResults: 8,
        includeAnswer: true,
      })
      tavilySearches++

      // If company website is available, search for their stated competitors
      let companyClaimsResult: TavilySearchResponse | null = null
      if (companyWebsite) {
        companyClaimsResult = await this.tavily.search({
          query: `site:${companyWebsite} competitors market`,
          searchDepth: 'basic',
          maxResults: 3,
          includeAnswer: false,
        })
        tavilySearches++
      }

      // ─── Step 3: Format data for Claude ───
      const marketResearchData = this.formatSearchResults([marketResult, trendResult])
      const competitorResearchData = this.formatSearchResults(
        [competitorResult, fundingResult, companyClaimsResult].filter(Boolean) as TavilySearchResponse[]
      )

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

      // ─── Step 4: Claude analysis ───
      const prompt = MARKET_ASSESSMENT_USER_PROMPT(
        companyName,
        companyDescription,
        targetCustomer,
        stage,
        marketResearchData,
        competitorResearchData,
        interviewData && interviewData.length > 0 ? interviewData : null
      )

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 4096,
        system: MARKET_ASSESSMENT_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      })

      const textContent = response.content.find(c => c.type === 'text')
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in market assessment response')
      }

      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
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
    // Extract a rough industry label from description for search queries
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
    // Fallback: use the first meaningful phrase from description
    return description?.split('.')[0]?.slice(0, 50) || 'technology startup'
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
      console.log('Missing API keys, using mock market assessment agent')
      agentInstance = new MockMarketAssessmentAgent()
    }
  }
  return agentInstance
}
