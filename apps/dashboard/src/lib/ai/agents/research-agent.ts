// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY RESEARCH AGENT — External Data Gathering & Validation
// ═══════════════════════════════════════════════════════════════════════════

import Anthropic from '@anthropic-ai/sdk'
import { getTavilyClient, type TavilySearchResponse } from '@/lib/research/tavily-client'
import {
  COMPETITOR_ANALYSIS_PROMPT,
  MARKET_ANALYSIS_PROMPT,
  FOUNDER_VALIDATION_PROMPT,
  NEWS_SENTIMENT_PROMPT,
  RESEARCH_SYNTHESIS_PROMPT,
  RESEARCH_ANALYSIS_SYSTEM_PROMPT,
} from '../prompts/research-system'
import type {
  ResearchOutput,
  FounderProfile,
  MarketAnalysis,
  CompetitorInfo,
  ValidationFinding,
  NewsItem,
  ApplicationWithFounders,
} from '@/types'

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ResearchInput {
  application: ApplicationWithFounders
}

export interface ResearchResult {
  success: boolean
  research: ResearchOutput | null
  error?: string
  metadata: {
    totalSearches: number
    totalSources: number
    processingTimeMs: number
    model: string
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// RESEARCH AGENT CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class ResearchAgent {
  private client: Anthropic
  private tavily = getTavilyClient()
  private model = 'claude-sonnet-4-20250514'

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }

  /**
   * Run comprehensive research on a startup application
   */
  async runResearch(input: ResearchInput): Promise<ResearchResult> {
    const startTime = Date.now()
    let totalSearches = 0
    const allSources: string[] = []

    try {
      const { application } = input
      const companyName = application.companyName
      const description = application.companyDescription || application.companyOneLiner || ''
      const industry = this.inferIndustry(description)

      // Run searches in parallel
      const [competitorResults, marketResults, newsResults, ...founderResults] = await Promise.all([
        this.searchCompetitors(companyName, industry, description),
        this.searchMarket(industry, application.targetCustomer || ''),
        this.searchNews(companyName, application.companyWebsite || undefined),
        ...application.founders.map(f =>
          this.searchFounder(f.name, companyName, f.linkedin || undefined)
        ),
      ])

      totalSearches = 3 + application.founders.length

      // Collect sources
      competitorResults.results.forEach(r => allSources.push(r.url))
      marketResults.results.forEach(r => allSources.push(r.url))
      newsResults.results.forEach(r => allSources.push(r.url))
      founderResults.forEach(fr => fr.results.forEach(r => allSources.push(r.url)))

      // Analyze results with Claude
      const [competitors, marketAnalysis, newsItems, founderProfiles] = await Promise.all([
        this.analyzeCompetitors(companyName, description, competitorResults),
        this.analyzeMarket(industry, application.targetCustomer || '', marketResults),
        this.analyzeNews(companyName, newsResults),
        this.analyzeFounders(application.founders, founderResults),
      ])

      // Compile validation findings
      const validationFindings = this.compileValidationFindings(
        application,
        founderProfiles,
        competitors
      )

      const research: ResearchOutput = {
        founderProfiles,
        marketAnalysis,
        competitors,
        validationFindings,
        recentNews: newsItems,
        researchedAt: new Date().toISOString(),
        sources: [...new Set(allSources)],
      }

      return {
        success: true,
        research,
        metadata: {
          totalSearches,
          totalSources: research.sources.length,
          processingTimeMs: Date.now() - startTime,
          model: this.model,
        },
      }
    } catch (error) {
      console.error('Research agent error:', error)
      return {
        success: false,
        research: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          totalSearches,
          totalSources: allSources.length,
          processingTimeMs: Date.now() - startTime,
          model: this.model,
        },
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SEARCH METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  private async searchCompetitors(
    companyName: string,
    industry: string,
    description: string
  ): Promise<TavilySearchResponse> {
    return this.tavily.searchCompetitors(companyName, industry, description)
  }

  private async searchMarket(
    industry: string,
    targetCustomer: string
  ): Promise<TavilySearchResponse> {
    return this.tavily.searchMarketData(industry, targetCustomer)
  }

  private async searchNews(
    companyName: string,
    website?: string
  ): Promise<TavilySearchResponse> {
    return this.tavily.searchCompanyNews(companyName, website)
  }

  private async searchFounder(
    founderName: string,
    companyName: string,
    linkedinUrl?: string
  ): Promise<TavilySearchResponse> {
    return this.tavily.searchFounderBackground(founderName, companyName, linkedinUrl)
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ANALYSIS METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  private async analyzeCompetitors(
    companyName: string,
    description: string,
    searchResults: TavilySearchResponse
  ): Promise<CompetitorInfo[]> {
    const searchResultsStr = this.formatSearchResults(searchResults)
    const prompt = COMPETITOR_ANALYSIS_PROMPT(companyName, description, searchResultsStr)

    const response = await this.callClaude(prompt)
    try {
      const parsed = JSON.parse(response)
      return (parsed.competitors || []).map((c: any) => ({
        name: c.name || 'Unknown',
        website: c.website || '',
        description: c.description || '',
        funding: c.funding || 'Unknown',
        differentiator: c.differentiator || '',
        threatLevel: c.threatLevel || 'medium',
      }))
    } catch {
      console.error('Failed to parse competitor analysis')
      return []
    }
  }

  private async analyzeMarket(
    industry: string,
    targetCustomer: string,
    searchResults: TavilySearchResponse
  ): Promise<MarketAnalysis> {
    const searchResultsStr = this.formatSearchResults(searchResults)
    const prompt = MARKET_ANALYSIS_PROMPT(industry, targetCustomer, searchResultsStr)

    const response = await this.callClaude(prompt)
    try {
      const parsed = JSON.parse(response)
      return {
        tamEstimate: parsed.tamEstimate || { value: 'Unknown', source: 'N/A', confidence: 'low' },
        samEstimate: parsed.samEstimate || { value: 'Unknown', source: 'N/A', confidence: 'low' },
        somEstimate: parsed.somEstimate || { value: 'Unknown', source: 'N/A', confidence: 'low' },
        growthRate: parsed.growthRate || 'Unknown',
        keyTrends: parsed.keyTrends || [],
        sources: parsed.sources || [],
      }
    } catch {
      console.error('Failed to parse market analysis')
      return {
        tamEstimate: { value: 'Unknown', source: 'N/A', confidence: 'low' },
        samEstimate: { value: 'Unknown', source: 'N/A', confidence: 'low' },
        somEstimate: { value: 'Unknown', source: 'N/A', confidence: 'low' },
        growthRate: 'Unknown',
        keyTrends: [],
        sources: [],
      }
    }
  }

  private async analyzeNews(
    companyName: string,
    searchResults: TavilySearchResponse
  ): Promise<NewsItem[]> {
    const searchResultsStr = this.formatSearchResults(searchResults)
    const prompt = NEWS_SENTIMENT_PROMPT(companyName, searchResultsStr)

    const response = await this.callClaude(prompt)
    try {
      const parsed = JSON.parse(response)
      return (parsed.newsItems || []).map((n: any) => ({
        title: n.title || 'Untitled',
        source: n.source || 'Unknown',
        date: n.date || 'Unknown',
        sentiment: n.sentiment || 'neutral',
        summary: n.summary || '',
        url: n.url || '',
      }))
    } catch {
      console.error('Failed to parse news analysis')
      return []
    }
  }

  private async analyzeFounders(
    founders: ApplicationWithFounders['founders'],
    searchResults: TavilySearchResponse[]
  ): Promise<FounderProfile[]> {
    const profiles: FounderProfile[] = []

    for (let i = 0; i < founders.length; i++) {
      const founder = founders[i]
      const results = searchResults[i]

      if (!results) {
        profiles.push({
          name: founder.name,
          linkedinData: null,
          discrepancies: [],
        })
        continue
      }

      const claimedBackground = `${founder.yearsExperience || 0} years experience, ${
        founder.hasStartedBefore ? 'repeat founder' : 'first-time founder'
      }${founder.previousStartupOutcome ? `, previous outcome: ${founder.previousStartupOutcome}` : ''}`

      const searchResultsStr = this.formatSearchResults(results)
      const prompt = FOUNDER_VALIDATION_PROMPT(founder.name, claimedBackground, searchResultsStr)

      const response = await this.callClaude(prompt)
      try {
        const parsed = JSON.parse(response)
        profiles.push({
          name: founder.name,
          linkedinData: parsed.validated ? parsed.linkedinData : null,
          discrepancies: parsed.discrepancies || [],
        })
      } catch {
        profiles.push({
          name: founder.name,
          linkedinData: null,
          discrepancies: [],
        })
      }
    }

    return profiles
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  private async callClaude(prompt: string): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2048,
      system: RESEARCH_ANALYSIS_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    })

    const textContent = response.content.find(c => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in Claude response')
    }

    // Extract JSON from response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    return jsonMatch[0]
  }

  private formatSearchResults(results: TavilySearchResponse): string {
    const lines: string[] = []

    if (results.answer) {
      lines.push(`SUMMARY: ${results.answer}`)
      lines.push('')
    }

    for (const result of results.results) {
      lines.push(`TITLE: ${result.title}`)
      lines.push(`URL: ${result.url}`)
      lines.push(`CONTENT: ${result.content}`)
      if (result.publishedDate) {
        lines.push(`DATE: ${result.publishedDate}`)
      }
      lines.push('')
    }

    return lines.join('\n')
  }

  private inferIndustry(description: string): string {
    const desc = description.toLowerCase()
    if (desc.includes('developer') || desc.includes('api') || desc.includes('sdk')) {
      return 'Developer Tools'
    }
    if (desc.includes('fintech') || desc.includes('payment') || desc.includes('bank')) {
      return 'Fintech'
    }
    if (desc.includes('health') || desc.includes('medical') || desc.includes('patient')) {
      return 'Healthtech'
    }
    if (desc.includes('ai') || desc.includes('machine learning') || desc.includes('ml')) {
      return 'AI/ML'
    }
    if (desc.includes('enterprise') || desc.includes('b2b')) {
      return 'Enterprise SaaS'
    }
    if (desc.includes('consumer') || desc.includes('app')) {
      return 'Consumer'
    }
    return 'B2B SaaS'
  }

  private compileValidationFindings(
    application: ApplicationWithFounders,
    founderProfiles: FounderProfile[],
    competitors: CompetitorInfo[]
  ): ValidationFinding[] {
    const findings: ValidationFinding[] = []

    // Check founder discrepancies
    for (const profile of founderProfiles) {
      if (profile.discrepancies.length > 0) {
        findings.push({
          claim: `Founder ${profile.name}'s background claims`,
          source: 'LinkedIn / Web Research',
          verified: false,
          notes: profile.discrepancies.join('; '),
        })
      } else if (profile.linkedinData) {
        findings.push({
          claim: `Founder ${profile.name}'s background claims`,
          source: 'LinkedIn / Web Research',
          verified: true,
          notes: 'Background verified through public records',
        })
      }
    }

    // Check if claimed competitors match research
    if (competitors.length > 0) {
      findings.push({
        claim: 'Competitive landscape',
        source: 'Web Research',
        verified: true,
        notes: `Found ${competitors.length} relevant competitors through research`,
      })
    }

    // Check user/revenue claims if present
    if (application.userCount && application.userCount > 0) {
      findings.push({
        claim: `${application.userCount} users`,
        source: 'Self-reported',
        verified: false,
        notes: 'User count is self-reported, not externally verified',
      })
    }

    if (application.mrr && application.mrr > 0) {
      findings.push({
        claim: `$${application.mrr} MRR`,
        source: 'Self-reported',
        verified: false,
        notes: 'MRR is self-reported, not externally verified',
      })
    }

    return findings
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK RESEARCH AGENT (for demo mode)
// ═══════════════════════════════════════════════════════════════════════════

export class MockResearchAgent {
  async runResearch(input: ResearchInput): Promise<ResearchResult> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000))

    const { application } = input

    const mockResearch: ResearchOutput = {
      founderProfiles: application.founders.map(f => ({
        name: f.name,
        linkedinData: {
          headline: `${f.role || 'Founder'} at ${application.companyName}`,
          experience: [
            {
              company: application.companyName,
              title: f.role || 'Founder',
              startDate: '2024',
              endDate: null,
              description: 'Current venture',
            },
            {
              company: 'Previous Company',
              title: 'Senior Engineer',
              startDate: '2020',
              endDate: '2024',
              description: 'Built and scaled engineering team',
            },
          ],
          education: [
            {
              institution: 'University',
              degree: "Bachelor's",
              field: 'Computer Science',
              graduationYear: 2018,
            },
          ],
          connections: 500,
          validated: true,
        },
        discrepancies: [],
      })),

      marketAnalysis: {
        tamEstimate: {
          value: '$15B',
          source: 'Industry reports [MOCK]',
          confidence: 'medium',
        },
        samEstimate: {
          value: '$3B',
          source: 'Market segment analysis [MOCK]',
          confidence: 'medium',
        },
        somEstimate: {
          value: '$50M',
          source: 'Addressable market calculation [MOCK]',
          confidence: 'low',
        },
        growthRate: '18% CAGR (2024-2028)',
        keyTrends: [
          'Increasing adoption of AI-powered solutions',
          'Shift to usage-based pricing',
          'Growing demand for developer-first products',
          'Enterprise adoption accelerating',
        ],
        sources: [
          'https://grandviewresearch.com/industry-analysis [MOCK]',
          'https://gartner.com/market-report [MOCK]',
        ],
      },

      competitors: [
        {
          name: 'Competitor Alpha',
          website: 'https://competitoralpha.com',
          description: 'Established player in the space with enterprise focus',
          funding: 'Series B - $45M',
          differentiator: 'Enterprise-grade features and integrations',
          threatLevel: 'high',
        },
        {
          name: 'Competitor Beta',
          website: 'https://competitorbeta.io',
          description: 'SMB-focused alternative with simpler pricing',
          funding: 'Seed - $5M',
          differentiator: 'Lower price point, simpler setup',
          threatLevel: 'medium',
        },
        {
          name: 'Big Tech Solution',
          website: 'https://bigtech.com/product',
          description: 'Basic solution from major cloud provider',
          funding: 'N/A - Big Tech',
          differentiator: 'Bundle with existing cloud services',
          threatLevel: 'low',
        },
      ],

      validationFindings: [
        {
          claim: 'Prior startup experience',
          source: 'LinkedIn [MOCK]',
          verified: true,
          notes: 'Founder background verified through public records',
        },
        {
          claim: `${application.userCount || 0} users`,
          source: 'Self-reported',
          verified: false,
          notes: 'User count is self-reported, not externally verified',
        },
        {
          claim: 'Market size estimates',
          source: 'Industry reports [MOCK]',
          verified: true,
          notes: 'Market size estimates align with third-party research',
        },
      ],

      recentNews: [
        {
          title: `${application.companyName} Launches New Product Feature`,
          source: 'TechCrunch [MOCK]',
          date: '2026-01-15',
          sentiment: 'positive',
          summary: 'The company announced a new feature that improves user experience.',
          url: 'https://techcrunch.com/mock-article',
        },
        {
          title: 'Industry Analysis: Emerging Players to Watch',
          source: 'Forbes [MOCK]',
          date: '2026-01-10',
          sentiment: 'neutral',
          summary: 'Annual roundup of promising startups in the B2B space.',
          url: 'https://forbes.com/mock-article',
        },
      ],

      researchedAt: new Date().toISOString(),
      sources: [
        'https://linkedin.com [MOCK]',
        'https://crunchbase.com [MOCK]',
        'https://techcrunch.com [MOCK]',
        'https://grandviewresearch.com [MOCK]',
      ],
    }

    return {
      success: true,
      research: mockResearch,
      metadata: {
        totalSearches: 5,
        totalSources: 4,
        processingTimeMs: 2000,
        model: 'mock-agent',
      },
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FACTORY FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

let agentInstance: ResearchAgent | MockResearchAgent | null = null

export function getResearchAgent(): ResearchAgent | MockResearchAgent {
  if (!agentInstance) {
    if (process.env.ANTHROPIC_API_KEY && process.env.TAVILY_API_KEY) {
      agentInstance = new ResearchAgent()
    } else {
      console.log('Missing API keys, using mock research agent')
      agentInstance = new MockResearchAgent()
    }
  }
  return agentInstance
}
