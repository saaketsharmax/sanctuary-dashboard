// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY RESEARCH — Tavily Web Search Client
// ═══════════════════════════════════════════════════════════════════════════

export interface TavilySearchOptions {
  query: string
  searchDepth?: 'basic' | 'advanced'
  includeAnswer?: boolean
  includeRawContent?: boolean
  maxResults?: number
  includeDomains?: string[]
  excludeDomains?: string[]
  topic?: 'general' | 'news'
}

export interface TavilySearchResult {
  title: string
  url: string
  content: string
  score: number
  publishedDate?: string
  rawContent?: string
}

export interface TavilySearchResponse {
  query: string
  answer?: string
  results: TavilySearchResult[]
  responseTime: number
}

export interface TavilyExtractOptions {
  urls: string[]
}

export interface TavilyExtractResult {
  url: string
  rawContent: string
}

export interface TavilyExtractResponse {
  results: TavilyExtractResult[]
  failedResults: { url: string; error: string }[]
}

// ═══════════════════════════════════════════════════════════════════════════
// TAVILY CLIENT CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class TavilyClient {
  private apiKey: string
  private baseUrl = 'https://api.tavily.com'

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.TAVILY_API_KEY || ''
    if (!this.apiKey) {
      console.warn('TavilyClient: No API key provided, using mock mode')
    }
  }

  /**
   * Perform a web search using Tavily API
   */
  async search(options: TavilySearchOptions): Promise<TavilySearchResponse> {
    if (!this.apiKey) {
      return this.mockSearch(options)
    }

    const response = await fetch(`${this.baseUrl}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: this.apiKey,
        query: options.query,
        search_depth: options.searchDepth || 'basic',
        include_answer: options.includeAnswer ?? true,
        include_raw_content: options.includeRawContent ?? false,
        max_results: options.maxResults || 10,
        include_domains: options.includeDomains,
        exclude_domains: options.excludeDomains,
        topic: options.topic || 'general',
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Tavily search failed: ${error}`)
    }

    const data = await response.json()
    return {
      query: options.query,
      answer: data.answer,
      results: data.results.map((r: any) => ({
        title: r.title,
        url: r.url,
        content: r.content,
        score: r.score,
        publishedDate: r.published_date,
        rawContent: r.raw_content,
      })),
      responseTime: data.response_time,
    }
  }

  /**
   * Search for competitor information
   */
  async searchCompetitors(
    companyName: string,
    industry: string,
    productDescription: string
  ): Promise<TavilySearchResponse> {
    const query = `${industry} competitors to "${companyName}" ${productDescription} startup companies funding`
    return this.search({
      query,
      searchDepth: 'advanced',
      maxResults: 10,
      includeAnswer: true,
    })
  }

  /**
   * Search for market size and trends
   */
  async searchMarketData(
    industry: string,
    targetMarket: string
  ): Promise<TavilySearchResponse> {
    const query = `${industry} market size TAM SAM ${targetMarket} 2025 2026 growth rate trends forecast`
    return this.search({
      query,
      searchDepth: 'advanced',
      maxResults: 8,
      includeAnswer: true,
    })
  }

  /**
   * Search for news about a company
   */
  async searchCompanyNews(
    companyName: string,
    companyWebsite?: string
  ): Promise<TavilySearchResponse> {
    const query = companyWebsite
      ? `"${companyName}" OR site:${companyWebsite} news funding announcement`
      : `"${companyName}" startup news funding announcement`
    return this.search({
      query,
      topic: 'news',
      maxResults: 5,
      includeAnswer: false,
    })
  }

  /**
   * Search for founder background validation
   */
  async searchFounderBackground(
    founderName: string,
    companyName: string,
    linkedinUrl?: string
  ): Promise<TavilySearchResponse> {
    const query = linkedinUrl
      ? `"${founderName}" ${companyName} background experience education startup founder`
      : `"${founderName}" ${companyName} founder CEO CTO linkedin experience`
    return this.search({
      query,
      searchDepth: 'advanced',
      maxResults: 5,
      includeAnswer: true,
      includeDomains: linkedinUrl ? ['linkedin.com'] : undefined,
    })
  }

  /**
   * Validate a specific claim made in the application
   */
  async validateClaim(
    claim: string,
    companyName: string
  ): Promise<TavilySearchResponse> {
    const query = `"${companyName}" ${claim} verify evidence`
    return this.search({
      query,
      searchDepth: 'basic',
      maxResults: 3,
      includeAnswer: true,
    })
  }

  /**
   * Extract content from specific URLs
   */
  async extract(options: TavilyExtractOptions): Promise<TavilyExtractResponse> {
    if (!this.apiKey) {
      return this.mockExtract(options)
    }

    const response = await fetch(`${this.baseUrl}/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: this.apiKey,
        urls: options.urls,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Tavily extract failed: ${error}`)
    }

    const data = await response.json()
    return {
      results: data.results.map((r: any) => ({
        url: r.url,
        rawContent: r.raw_content,
      })),
      failedResults: data.failed_results || [],
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MOCK IMPLEMENTATIONS (for demo mode)
  // ═══════════════════════════════════════════════════════════════════════════

  private mockSearch(options: TavilySearchOptions): TavilySearchResponse {
    const isTopic = options.topic === 'news'
    const isCompetitor = options.query.toLowerCase().includes('competitor')
    const isMarket = options.query.toLowerCase().includes('market size')
    const isFounder = options.query.toLowerCase().includes('founder')

    let mockResults: TavilySearchResult[] = []
    let mockAnswer: string | undefined

    if (isCompetitor) {
      mockAnswer = 'Based on the search, there are several competitors in this space including established players and emerging startups. Key competitors focus on similar problem spaces with varying approaches.'
      mockResults = [
        {
          title: 'Top 10 Competitors in Developer Tools Space',
          url: 'https://techcrunch.com/2025/developer-tools-landscape',
          content: 'The developer tools market continues to grow with new entrants. Major players include Vercel, Netlify, and Railway, while newer startups are focusing on specific niches.',
          score: 0.95,
        },
        {
          title: 'B2B SaaS Competitive Landscape 2025',
          url: 'https://saastr.com/competitive-analysis',
          content: 'Analysis of the competitive landscape shows increasing consolidation. Key differentiators include pricing, integrations, and developer experience.',
          score: 0.88,
        },
        {
          title: 'Startup Funding in Infrastructure Tools',
          url: 'https://crunchbase.com/lists/infrastructure-startups',
          content: 'Recent funding rounds in infrastructure tooling have ranged from $5M to $50M Series A rounds. Investors are particularly interested in AI-enabled tools.',
          score: 0.82,
        },
      ]
    } else if (isMarket) {
      mockAnswer = 'The market shows strong growth potential with an estimated TAM of $15-50B depending on segment definition. Growth rates are projected at 15-25% CAGR through 2028.'
      mockResults = [
        {
          title: 'Developer Tools Market Size Report 2025',
          url: 'https://grandviewresearch.com/industry-analysis/devtools',
          content: 'The global developer tools market was valued at $15.4 billion in 2024 and is expected to grow at a CAGR of 18.2% from 2025 to 2030.',
          score: 0.96,
        },
        {
          title: 'B2B SaaS Market Trends and Forecasts',
          url: 'https://gartner.com/b2b-saas-forecast',
          content: 'B2B SaaS continues rapid growth with enterprise adoption accelerating. Key trends include AI integration, usage-based pricing, and platform consolidation.',
          score: 0.91,
        },
      ]
    } else if (isFounder) {
      mockAnswer = 'Based on available information, the founder has relevant experience in the space with a background in technology and entrepreneurship.'
      mockResults = [
        {
          title: 'LinkedIn Profile Summary',
          url: 'https://linkedin.com/in/founder',
          content: 'Experienced technology leader with 8+ years in B2B SaaS. Previous experience at major tech companies including roles in product and engineering.',
          score: 0.89,
        },
      ]
    } else if (isTopic) {
      mockResults = [
        {
          title: 'Startup Announces New Funding Round',
          url: 'https://techcrunch.com/2026/01/funding-news',
          content: 'The company announced a new funding round to accelerate growth in their core market.',
          score: 0.85,
          publishedDate: '2026-01-15',
        },
        {
          title: 'Industry Analysis: Emerging Players to Watch',
          url: 'https://forbes.com/emerging-startups-2026',
          content: 'Several promising startups are making waves in the B2B space with innovative approaches to common problems.',
          score: 0.78,
          publishedDate: '2026-01-10',
        },
      ]
    } else {
      mockAnswer = 'Based on the available information, the search results provide relevant context for the query.'
      mockResults = [
        {
          title: 'General Search Result',
          url: 'https://example.com/result',
          content: 'Relevant information found for the search query. Additional context may be needed for comprehensive analysis.',
          score: 0.75,
        },
      ]
    }

    return {
      query: options.query,
      answer: mockAnswer,
      results: mockResults.slice(0, options.maxResults || 10),
      responseTime: 0.5,
    }
  }

  private mockExtract(options: TavilyExtractOptions): TavilyExtractResponse {
    return {
      results: options.urls.map(url => ({
        url,
        rawContent: `[MOCK] Extracted content from ${url}. In production, this would contain the full page content.`,
      })),
      failedResults: [],
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FACTORY FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

let clientInstance: TavilyClient | null = null

export function getTavilyClient(): TavilyClient {
  if (!clientInstance) {
    clientInstance = new TavilyClient()
  }
  return clientInstance
}
