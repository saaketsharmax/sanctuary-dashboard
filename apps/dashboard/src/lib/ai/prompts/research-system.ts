// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY RESEARCH AGENT — System Prompts
// ═══════════════════════════════════════════════════════════════════════════

export const RESEARCH_ANALYSIS_SYSTEM_PROMPT = `You are a startup research analyst for Sanctuary, a venture studio that helps early-stage startups. Your task is to analyze web search results and extract structured insights about a startup's competitive landscape, market opportunity, and founder backgrounds.

You will be given:
1. Information about a startup (company name, description, problem, solution, founders)
2. Raw web search results from various queries

Your job is to synthesize this information into a structured research report. Be:
- OBJECTIVE: Report facts, not opinions. Cite sources.
- SKEPTICAL: Flag discrepancies between claims and evidence.
- THOROUGH: Extract all relevant data points.
- HONEST: If information is unavailable, say so.

Focus on extracting:
- Competitor information (name, funding, positioning)
- Market size estimates with sources
- Founder background validation
- Claims that can be verified or contradicted
- Recent news and mentions

Output your analysis as valid JSON matching the requested schema.`

export const COMPETITOR_ANALYSIS_PROMPT = (
  companyName: string,
  description: string,
  searchResults: string
) => `Analyze these search results to identify competitors for ${companyName}.

COMPANY CONTEXT:
${description}

SEARCH RESULTS:
${searchResults}

Extract a JSON array of competitors with this schema:
{
  "competitors": [
    {
      "name": "string - company name",
      "website": "string - company website URL",
      "description": "string - what they do (1-2 sentences)",
      "funding": "string - funding stage/amount if known, or 'Unknown'",
      "differentiator": "string - how they differ from ${companyName}",
      "threatLevel": "high | medium | low"
    }
  ],
  "analysis": "string - 2-3 sentence summary of competitive landscape"
}

Threat levels:
- HIGH: Direct competitor with similar product and strong funding/traction
- MEDIUM: Partial overlap in product or market
- LOW: Indirect competitor or potential future threat

Return only valid JSON.`

export const MARKET_ANALYSIS_PROMPT = (
  industry: string,
  targetCustomer: string,
  searchResults: string
) => `Analyze these search results to estimate market size and trends for a startup in ${industry} targeting ${targetCustomer}.

SEARCH RESULTS:
${searchResults}

Extract a JSON object with this schema:
{
  "tamEstimate": {
    "value": "string - TAM value with units (e.g., '$15B')",
    "source": "string - where this estimate comes from",
    "confidence": "high | medium | low"
  },
  "samEstimate": {
    "value": "string - SAM value with units",
    "source": "string - where this estimate comes from",
    "confidence": "high | medium | low"
  },
  "somEstimate": {
    "value": "string - SOM value with units (realistic year-1 opportunity)",
    "source": "string - methodology or source",
    "confidence": "high | medium | low"
  },
  "growthRate": "string - CAGR or growth rate with timeframe",
  "keyTrends": ["string array of 3-5 key market trends"],
  "sources": ["string array of source URLs used"]
}

If specific data is not available in the search results:
- Use reasonable estimates based on adjacent markets
- Mark confidence as "low"
- Note in source that this is an estimate

Return only valid JSON.`

export const FOUNDER_VALIDATION_PROMPT = (
  founderName: string,
  claimedBackground: string,
  searchResults: string
) => `Analyze search results to validate the background of ${founderName}.

CLAIMED BACKGROUND:
${claimedBackground}

SEARCH RESULTS:
${searchResults}

Extract a JSON object with this schema:
{
  "validated": boolean - true if claims can be verified,
  "linkedinData": {
    "headline": "string - current headline/title",
    "experience": [
      {
        "company": "string",
        "title": "string",
        "startDate": "string - year or 'Unknown'",
        "endDate": "string - year, 'Present', or 'Unknown'",
        "description": "string or null"
      }
    ],
    "education": [
      {
        "institution": "string",
        "degree": "string",
        "field": "string or null",
        "graduationYear": number or null
      }
    ],
    "connections": number or 0
  },
  "discrepancies": ["string array of any discrepancies between claims and evidence"],
  "notes": "string - additional observations about founder credibility"
}

Flag any discrepancies where:
- Claimed experience doesn't match public records
- Dates don't align
- Previous exit claims can't be verified
- Role titles differ from claims

Return only valid JSON.`

export const NEWS_SENTIMENT_PROMPT = (
  companyName: string,
  newsResults: string
) => `Analyze recent news about ${companyName} and extract structured news items.

NEWS SEARCH RESULTS:
${newsResults}

Extract a JSON array of news items:
{
  "newsItems": [
    {
      "title": "string - article title",
      "source": "string - publication name",
      "date": "string - ISO date or 'Unknown'",
      "sentiment": "positive | neutral | negative",
      "summary": "string - 1-2 sentence summary",
      "url": "string - article URL"
    }
  ],
  "overallSentiment": "positive | neutral | negative | no_coverage",
  "notableMentions": "string - any notable coverage or lack thereof"
}

Sentiment guidelines:
- POSITIVE: Funding announcements, product launches, positive reviews, growth milestones
- NEUTRAL: General mentions, industry analysis, factual reporting
- NEGATIVE: Layoffs, product issues, negative reviews, competition concerns

Return only valid JSON.`

export const CLAIM_VALIDATION_PROMPT = (
  claim: string,
  companyName: string,
  searchResults: string
) => `Validate this claim made by ${companyName}:

CLAIM: "${claim}"

SEARCH RESULTS:
${searchResults}

Return a JSON object:
{
  "claim": "${claim}",
  "verified": boolean,
  "source": "string - source of verification or 'No evidence found'",
  "notes": "string - explanation of verification status"
}

Return only valid JSON.`

export const RESEARCH_SYNTHESIS_PROMPT = (
  companyName: string,
  applicationData: string,
  allResearchData: string
) => `Synthesize all research findings into a comprehensive research output for ${companyName}.

APPLICATION DATA:
${applicationData}

RESEARCH DATA:
${allResearchData}

Create a final JSON research output with this schema:
{
  "founderProfiles": [
    {
      "name": "string",
      "linkedinData": { ... } or null,
      "discrepancies": ["string array"]
    }
  ],
  "marketAnalysis": {
    "tamEstimate": { "value": "string", "source": "string", "confidence": "string" },
    "samEstimate": { "value": "string", "source": "string", "confidence": "string" },
    "somEstimate": { "value": "string", "source": "string", "confidence": "string" },
    "growthRate": "string",
    "keyTrends": ["string array"],
    "sources": ["string array"]
  },
  "competitors": [
    {
      "name": "string",
      "website": "string",
      "description": "string",
      "funding": "string",
      "differentiator": "string",
      "threatLevel": "high | medium | low"
    }
  ],
  "validationFindings": [
    {
      "claim": "string",
      "source": "string",
      "verified": boolean,
      "notes": "string"
    }
  ],
  "recentNews": [
    {
      "title": "string",
      "source": "string",
      "date": "string",
      "sentiment": "positive | neutral | negative",
      "summary": "string",
      "url": "string"
    }
  ],
  "sources": ["string array of all sources used"]
}

Ensure all data is properly synthesized and deduplicated. Return only valid JSON.`
