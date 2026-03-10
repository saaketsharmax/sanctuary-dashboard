// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY RESEARCH AGENT — Vercel AI SDK + Tool-Use Implementation
// Claude decides what to search, loops via stepCountIs, produces structured output
// ═══════════════════════════════════════════════════════════════════════════

import { generateText, tool, stepCountIs } from 'ai'
import { z } from 'zod'
import { getModel, MAX_TOKENS, SANCTUARY_MODEL_ID, ANTHROPIC_CACHE_OPTIONS } from '../config'
import { getTavilyClient } from '@/lib/research/tavily-client'
import { RESEARCH_ANALYSIS_SYSTEM_PROMPT } from '../prompts/research-system'
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
  private tavily = getTavilyClient()

  /**
   * Run comprehensive research on a startup application.
   * Claude autonomously decides which tools to call and in what order.
   */
  async runResearch(input: ResearchInput): Promise<ResearchResult> {
    const startTime = Date.now()
    let totalSearches = 0

    try {
      const { application } = input
      const tavily = this.tavily

      // Track searches across tool invocations
      const searchTracker = { count: 0 }

      const result = await generateText({
        model: getModel(),
        maxOutputTokens: MAX_TOKENS.deep,
        stopWhen: stepCountIs(10),
        system: buildSystemPrompt(),
        providerOptions: ANTHROPIC_CACHE_OPTIONS,
        messages: [
          {
            role: 'user',
            content: buildUserPrompt(application),
          },
        ],
        tools: {
          searchCompetitors: tool({
            description: 'Search for competitors in a specific industry',
            inputSchema: z.object({
              companyName: z.string(),
              industry: z.string(),
              productDescription: z.string(),
            }),
            execute: async ({ companyName, industry, productDescription }) => {
              searchTracker.count++
              const res = await tavily.searchCompetitors(companyName, industry, productDescription)
              return {
                answer: res.answer,
                results: res.results.map(r => ({
                  title: r.title,
                  url: r.url,
                  content: r.content.slice(0, 500),
                })),
              }
            },
          }),
          searchMarket: tool({
            description: 'Search for market size, TAM/SAM data, and trends',
            inputSchema: z.object({
              industry: z.string(),
              targetMarket: z.string(),
            }),
            execute: async ({ industry, targetMarket }) => {
              searchTracker.count++
              const res = await tavily.searchMarketData(industry, targetMarket)
              return {
                answer: res.answer,
                results: res.results.map(r => ({
                  title: r.title,
                  url: r.url,
                  content: r.content.slice(0, 500),
                })),
              }
            },
          }),
          searchCompanyNews: tool({
            description: 'Search for recent news about a company',
            inputSchema: z.object({
              companyName: z.string(),
              companyWebsite: z.string().optional(),
            }),
            execute: async ({ companyName, companyWebsite }) => {
              searchTracker.count++
              const res = await tavily.searchCompanyNews(companyName, companyWebsite)
              return {
                results: res.results.map(r => ({
                  title: r.title,
                  url: r.url,
                  content: r.content.slice(0, 500),
                  publishedDate: r.publishedDate,
                })),
              }
            },
          }),
          searchFounderBackground: tool({
            description: 'Search for a founder\'s background, experience, and LinkedIn',
            inputSchema: z.object({
              founderName: z.string(),
              companyName: z.string(),
              linkedinUrl: z.string().optional(),
            }),
            execute: async ({ founderName, companyName, linkedinUrl }) => {
              searchTracker.count++
              const res = await tavily.searchFounderBackground(founderName, companyName, linkedinUrl)
              return {
                answer: res.answer,
                results: res.results.map(r => ({
                  title: r.title,
                  url: r.url,
                  content: r.content.slice(0, 500),
                })),
              }
            },
          }),
          validateClaim: tool({
            description: 'Validate a specific claim by searching the web',
            inputSchema: z.object({
              claim: z.string(),
              companyName: z.string(),
            }),
            execute: async ({ claim, companyName }) => {
              searchTracker.count++
              const res = await tavily.validateClaim(claim, companyName)
              return {
                answer: res.answer,
                results: res.results.map(r => ({
                  title: r.title,
                  url: r.url,
                  content: r.content.slice(0, 500),
                })),
              }
            },
          }),
        },
      })

      totalSearches = searchTracker.count

      // Parse Claude's final text response as JSON
      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in Claude response')
      }

      const parsed = JSON.parse(jsonMatch[0])

      // Normalize into ResearchOutput with safe defaults
      const research: ResearchOutput = {
        founderProfiles: (parsed.founderProfiles || []).map((fp: any): FounderProfile => ({
          name: fp.name || 'Unknown',
          linkedinData: fp.linkedinData || null,
          discrepancies: fp.discrepancies || [],
        })),
        marketAnalysis: normalizeMarketAnalysis(parsed.marketAnalysis),
        competitors: (parsed.competitors || []).map((c: any): CompetitorInfo => ({
          name: c.name || 'Unknown',
          website: c.website || '',
          description: c.description || '',
          funding: c.funding || 'Unknown',
          differentiator: c.differentiator || '',
          threatLevel: c.threatLevel || 'medium',
        })),
        validationFindings: (parsed.validationFindings || []).map((v: any): ValidationFinding => ({
          claim: v.claim || '',
          source: v.source || 'Web Research',
          verified: v.verified ?? false,
          notes: v.notes || '',
        })),
        recentNews: (parsed.recentNews || []).map((n: any): NewsItem => ({
          title: n.title || 'Untitled',
          source: n.source || 'Unknown',
          date: n.date || 'Unknown',
          sentiment: n.sentiment || 'neutral',
          summary: n.summary || '',
          url: n.url || '',
        })),
        researchedAt: new Date().toISOString(),
        sources: parsed.sources || [],
      }

      return {
        success: true,
        research,
        metadata: {
          totalSearches,
          totalSources: research.sources.length,
          processingTimeMs: Date.now() - startTime,
          model: SANCTUARY_MODEL_ID,
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
          totalSources: 0,
          processingTimeMs: Date.now() - startTime,
          model: SANCTUARY_MODEL_ID,
        },
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PROMPT BUILDERS
// ═══════════════════════════════════════════════════════════════════════════

function buildSystemPrompt(): string {
  return `${RESEARCH_ANALYSIS_SYSTEM_PROMPT}

You have access to web search tools. Use them to research the startup thoroughly before producing your final output.

WORKFLOW:
1. Search for competitors in the company's industry
2. Search for market size and TAM/SAM data
3. Search for recent news about the company
4. Search for each founder's background
5. If any claims seem notable, use validateClaim to check them
6. After gathering all research, produce your final JSON output

You may call multiple tools and loop as needed. When you have gathered enough data, output your final analysis as a single JSON object (no markdown fences) with this exact schema:

{
  "founderProfiles": [
    {
      "name": "string",
      "linkedinData": {
        "headline": "string",
        "experience": [{ "company": "string", "title": "string", "startDate": "string", "endDate": "string or null", "description": "string or null" }],
        "education": [{ "institution": "string", "degree": "string", "field": "string or null", "graduationYear": "number or null" }],
        "connections": 0,
        "validated": true
      } or null,
      "discrepancies": ["string array"]
    }
  ],
  "marketAnalysis": {
    "tamEstimate": { "value": "string", "source": "string", "confidence": "high|medium|low" },
    "samEstimate": { "value": "string", "source": "string", "confidence": "high|medium|low" },
    "somEstimate": { "value": "string", "source": "string", "confidence": "high|medium|low" },
    "growthRate": "string",
    "keyTrends": ["string array"],
    "sources": ["string array of URLs"]
  },
  "competitors": [
    {
      "name": "string",
      "website": "string",
      "description": "string",
      "funding": "string",
      "differentiator": "string",
      "threatLevel": "high|medium|low"
    }
  ],
  "validationFindings": [
    {
      "claim": "string",
      "source": "string",
      "verified": true/false,
      "notes": "string"
    }
  ],
  "recentNews": [
    {
      "title": "string",
      "source": "string",
      "date": "string",
      "sentiment": "positive|neutral|negative",
      "summary": "string",
      "url": "string"
    }
  ],
  "sources": ["string array of all source URLs used across all searches"]
}

IMPORTANT: Your final message must contain ONLY the JSON object — no prose, no markdown code fences.`
}

function buildUserPrompt(application: ApplicationWithFounders): string {
  const founders = application.founders
    .map(f => {
      const parts = [`- ${f.name} (${f.role || 'Founder'})`]
      if (f.yearsExperience) parts.push(`  Experience: ${f.yearsExperience} years`)
      if (f.hasStartedBefore) parts.push(`  Repeat founder: yes`)
      if (f.previousStartupOutcome) parts.push(`  Previous outcome: ${f.previousStartupOutcome}`)
      if (f.linkedin) parts.push(`  LinkedIn: ${f.linkedin}`)
      return parts.join('\n')
    })
    .join('\n')

  return `Research the following startup application:

COMPANY: ${application.companyName}
ONE-LINER: ${application.companyOneLiner || 'N/A'}
DESCRIPTION: ${application.companyDescription || 'N/A'}
WEBSITE: ${application.companyWebsite || 'N/A'}
PROBLEM: ${application.problemDescription || 'N/A'}
SOLUTION: ${application.solutionDescription || 'N/A'}
TARGET CUSTOMER: ${application.targetCustomer || 'N/A'}
STAGE: ${application.stage || 'N/A'}
USERS: ${application.userCount ?? 'N/A'}
MRR: ${application.mrr ? `$${application.mrr}` : 'N/A'}

FOUNDERS:
${founders || 'No founder data'}

Please use the search tools to research this company's competitive landscape, market opportunity, founder backgrounds, and recent news. Then produce the final JSON research output.`
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function normalizeMarketAnalysis(raw: any): MarketAnalysis {
  const defaultEstimate = { value: 'Unknown', source: 'N/A', confidence: 'low' }
  if (!raw) {
    return {
      tamEstimate: defaultEstimate,
      samEstimate: defaultEstimate,
      somEstimate: defaultEstimate,
      growthRate: 'Unknown',
      keyTrends: [],
      sources: [],
    }
  }
  return {
    tamEstimate: raw.tamEstimate || defaultEstimate,
    samEstimate: raw.samEstimate || defaultEstimate,
    somEstimate: raw.somEstimate || defaultEstimate,
    growthRate: raw.growthRate || 'Unknown',
    keyTrends: raw.keyTrends || [],
    sources: raw.sources || [],
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
      console.warn('Missing API keys, using mock research agent')
      agentInstance = new MockResearchAgent()
    }
  }
  return agentInstance
}
