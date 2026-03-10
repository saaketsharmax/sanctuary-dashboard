// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY DD — Team Assessment Agent
// Vercel AI SDK + tools + stopWhen for autonomous founder research
// ═══════════════════════════════════════════════════════════════════════════

import { generateText, tool, stepCountIs } from 'ai'
import { z } from 'zod'
import { getModel, MAX_TOKENS, SANCTUARY_MODEL_ID, ANTHROPIC_CACHE_OPTIONS } from '../config'
import { getTavilyClient } from '@/lib/research/tavily-client'
import type {
  DDTeamAssessment,
  DDTeamAssessmentInput,
  DDTeamAssessmentResult,
  DDFounderProfile,
  DDInterviewSignal,
  DDRedFlag,
  DDGrade,
} from '../types/due-diligence'

// ═══════════════════════════════════════════════════════════════════════════
// TEAM ASSESSMENT AGENT CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class TeamAssessmentAgent {
  private tavily = getTavilyClient()

  async assessTeam(input: DDTeamAssessmentInput): Promise<DDTeamAssessmentResult> {
    const startTime = Date.now()
    let tavilySearches = 0

    try {
      const { companyName, founders, interviewTranscript, companyDescription, stage } = input

      if (founders.length === 0) {
        return {
          success: true,
          assessment: this.emptyAssessment(),
          metadata: { foundersEnriched: 0, tavilySearches: 0, processingTimeMs: Date.now() - startTime },
        }
      }

      // ─── Format input data for the prompt ───
      const foundersData = founders.map((f, i) => {
        return `FOUNDER ${i + 1}:
  Name: ${f.name}
  Role: ${f.role || 'Not specified'}
  Years of Experience: ${f.yearsExperience ?? 'Not specified'}
  Has Started Before: ${f.hasStartedBefore ? 'Yes' : 'No'}
  Previous Startup Outcome: ${f.previousStartupOutcome || 'N/A'}
  LinkedIn: ${f.linkedin || 'Not provided'}`
      }).join('\n\n')

      const interviewData = interviewTranscript
        ? interviewTranscript
            .filter(msg => msg.role === 'user')
            .map(msg => `[${msg.section || 'general'}] ${msg.content}`)
            .join('\n\n')
        : null

      // ─── Tavily reference for tool closures ───
      const tavily = this.tavily

      // ─── Run generateText with tools + stopWhen ───
      const result = await generateText({
        model: getModel(),
        maxOutputTokens: MAX_TOKENS.analysis,
        stopWhen: stepCountIs(10),
        providerOptions: ANTHROPIC_CACHE_OPTIONS,
        system: `You are a senior VC analyst specializing in founder and team due diligence at Sanctuary, a venture studio. Your task is to assess the founding team's strength, experience, and fit for building the described company.

You have access to web search tools. For EACH founder, you MUST:
1. Use searchFounderBackground to find their professional background, LinkedIn, and experience
2. If they claim prior startups, use searchPreviousStartups to verify
3. If they have a technical role (CTO, engineer, developer, etc.), use searchGithub to check open source contributions

After gathering all research, produce your final assessment.

## FOUNDER SCORING (0-100 per founder)
- 90-100: Exceptional — serial successful founder, deep domain expertise, strong network
- 70-89: Strong — relevant experience, verified track record, credible background
- 50-69: Average — some experience but gaps, limited public validation
- 30-49: Weak — limited relevant experience, unverified claims, concerning signals
- 0-29: High risk — red flags, fabricated experience, missing critical skills

## TEAM COMPLETENESS
Score the team on whether key roles are covered:
- CEO / Business Lead (vision, fundraising, strategy)
- CTO / Technical Lead (product development, architecture)
- Domain Expert (industry-specific knowledge)
- Growth / Sales (go-to-market, customer acquisition)
Scoring: 100 = all roles filled, 75 = 3 of 4, 50 = 2 of 4, 25 = 1 of 4

## RED FLAG DETECTION
Flag any of: employment gaps not explained, inflated titles, claims not matching web evidence, "advisor inflation" (listing advisors as quasi-founders), inconsistent timelines, prior startup failures not disclosed

## INTERVIEW SIGNALS (if transcript available)
Extract signals about: co-founder alignment, complementary skills, shared history, disagreements on strategy, vision clarity, technical depth

## SCORING FORMULA
Overall team score = 60% weighted average of founder scores + 25% team completeness + 15% interview signals bonus/penalty

Be rigorous but fair. Early-stage founders may have limited public presence — that's not a red flag by itself.

After completing all research, respond with ONLY a valid JSON object (no markdown fences) with this exact structure:
{
  "founderProfiles": [
    {
      "name": "string",
      "role": "string or null",
      "founderScore": 0-100,
      "experienceVerified": true/false,
      "experienceEvidence": "summary of what web search found about this person",
      "linkedinFound": true/false,
      "githubFound": true/false,
      "githubScore": 0-100 or null,
      "previousStartups": [
        { "name": "string", "outcome": "string (exit/acquired/failed/active/unknown)", "verified": true/false }
      ],
      "redFlags": ["string — any concerning findings"],
      "strengths": ["string — verified positive signals"],
      "evidenceUrls": ["string — URLs from search results used as evidence"]
    }
  ],
  "teamCompletenessScore": 0-100,
  "missingRoles": ["string — key roles not covered by current team"],
  "teamRedFlags": [
    {
      "claimId": "team",
      "claimText": "string — what the flag is about",
      "category": "team_background",
      "severity": "critical | high | medium",
      "reason": "string — why this is a red flag",
      "evidence": "string — supporting evidence"
    }
  ],
  "teamStrengths": ["string — team-level strengths"],
  "interviewSignals": [
    {
      "signal": "string — what was observed",
      "sentiment": "positive | neutral | concerning",
      "source": "string — which part of the interview"
    }
  ],
  "overallTeamScore": 0-100,
  "teamGrade": "A | B | C | D | F"
}`,
        tools: {
          searchFounderBackground: tool({
            description: 'Search for a founder\'s professional background, LinkedIn, and experience',
            inputSchema: z.object({
              founderName: z.string().describe('Full name of the founder'),
              companyName: z.string().describe('Name of the company they are founding'),
              linkedinUrl: z.string().optional().describe('LinkedIn URL if available'),
            }),
            execute: async ({ founderName, companyName: cn, linkedinUrl }) => {
              tavilySearches++
              const result = await tavily.searchFounderBackground(
                founderName,
                cn,
                linkedinUrl || undefined
              )
              return {
                answer: result.answer || null,
                results: result.results.map(r => ({
                  title: r.title,
                  url: r.url,
                  content: r.content.slice(0, 500),
                  publishedDate: r.publishedDate || null,
                })),
              }
            },
          }),
          searchPreviousStartups: tool({
            description: 'Search for a founder\'s previous startups and outcomes',
            inputSchema: z.object({
              founderName: z.string().describe('Full name of the founder'),
              startupName: z.string().optional().describe('Name of a specific previous startup to search for'),
            }),
            execute: async ({ founderName, startupName }) => {
              tavilySearches++
              const query = startupName
                ? `"${founderName}" "${startupName}" startup founder CEO exit acquisition outcome`
                : `"${founderName}" startup founder CEO previous company exit acquisition`
              const result = await tavily.search({
                query,
                searchDepth: 'advanced',
                maxResults: 3,
                includeAnswer: true,
              })
              return {
                answer: result.answer || null,
                results: result.results.map(r => ({
                  title: r.title,
                  url: r.url,
                  content: r.content.slice(0, 500),
                  publishedDate: r.publishedDate || null,
                })),
              }
            },
          }),
          searchGithub: tool({
            description: 'Search GitHub for a founder\'s open source contributions',
            inputSchema: z.object({
              founderName: z.string().describe('Full name of the founder'),
              companyName: z.string().describe('Name of the company'),
            }),
            execute: async ({ founderName, companyName: cn }) => {
              tavilySearches++
              const result = await tavily.search({
                query: `"${founderName}" github.com contributions open source repositories`,
                searchDepth: 'basic',
                maxResults: 3,
                includeAnswer: true,
                includeDomains: ['github.com'],
              })
              return {
                answer: result.answer || null,
                results: result.results.map(r => ({
                  title: r.title,
                  url: r.url,
                  content: r.content.slice(0, 500),
                })),
              }
            },
          }),
        },
        messages: [
          {
            role: 'user',
            content: `Assess the founding team for ${companyName}.

COMPANY CONTEXT:
- Description: ${companyDescription || 'Not provided'}
- Stage: ${stage || 'Not specified'}

FOUNDERS FROM APPLICATION:
${foundersData}

${interviewData ? `INTERVIEW TRANSCRIPT EXCERPTS:\n${interviewData}` : 'No interview transcript available.'}

Use the search tools to research each founder, then produce your final DDTeamAssessment JSON.`,
          },
        ],
      })

      // ─── Parse final response ───
      const text = result.text
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in team assessment response')
      }

      const parsed = JSON.parse(jsonMatch[0])
      const assessment = this.parseAssessment(parsed)

      return {
        success: true,
        assessment,
        metadata: {
          foundersEnriched: founders.length,
          tavilySearches,
          processingTimeMs: Date.now() - startTime,
        },
      }
    } catch (error) {
      console.error('Team assessment error:', error)
      return {
        success: false,
        assessment: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          foundersEnriched: 0,
          tavilySearches,
          processingTimeMs: Date.now() - startTime,
        },
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PARSING & VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  private parseAssessment(parsed: any): DDTeamAssessment {
    const founderProfiles: DDFounderProfile[] = (parsed.founderProfiles || []).map((fp: any, i: number) => {
      return {
        name: fp.name || `Founder ${i + 1}`,
        role: fp.role || null,
        founderScore: this.clampScore(fp.founderScore),
        experienceVerified: fp.experienceVerified ?? false,
        experienceEvidence: fp.experienceEvidence || 'No evidence found',
        linkedinFound: fp.linkedinFound ?? false,
        githubFound: fp.githubFound ?? false,
        githubScore: fp.githubScore != null ? this.clampScore(fp.githubScore) : null,
        previousStartups: (fp.previousStartups || []).map((ps: any) => ({
          name: ps.name || 'Unknown',
          outcome: ps.outcome || 'unknown',
          verified: ps.verified ?? false,
        })),
        redFlags: Array.isArray(fp.redFlags) ? fp.redFlags : [],
        strengths: Array.isArray(fp.strengths) ? fp.strengths : [],
        evidenceUrls: Array.isArray(fp.evidenceUrls) ? fp.evidenceUrls : [],
      }
    })

    const teamRedFlags: DDRedFlag[] = (parsed.teamRedFlags || []).map((rf: any) => ({
      claimId: rf.claimId || 'team',
      claimText: rf.claimText || '',
      category: 'team_background' as const,
      severity: this.validateSeverity(rf.severity),
      reason: rf.reason || '',
      evidence: rf.evidence || '',
    }))

    const interviewSignals: DDInterviewSignal[] = (parsed.interviewSignals || []).map((sig: any) => ({
      signal: sig.signal || '',
      sentiment: this.validateSentiment(sig.sentiment),
      source: sig.source || 'interview',
    }))

    const overallTeamScore = this.clampScore(parsed.overallTeamScore)

    return {
      founderProfiles,
      teamCompletenessScore: this.clampScore(parsed.teamCompletenessScore),
      overallTeamScore,
      teamGrade: this.scoreToGrade(overallTeamScore),
      teamRedFlags,
      teamStrengths: Array.isArray(parsed.teamStrengths) ? parsed.teamStrengths : [],
      missingRoles: Array.isArray(parsed.missingRoles) ? parsed.missingRoles : [],
      interviewSignals,
    }
  }

  private emptyAssessment(): DDTeamAssessment {
    return {
      founderProfiles: [],
      teamCompletenessScore: 0,
      overallTeamScore: 0,
      teamGrade: 'F',
      teamRedFlags: [{
        claimId: 'team',
        claimText: 'No founders listed in application',
        category: 'team_background',
        severity: 'critical',
        reason: 'Application contains no founder information',
        evidence: 'The founders array is empty',
      }],
      teamStrengths: [],
      missingRoles: ['CEO', 'CTO', 'Domain Expert', 'Growth Lead'],
      interviewSignals: [],
    }
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

  private validateSeverity(s: string): DDRedFlag['severity'] {
    if (s === 'critical' || s === 'high' || s === 'medium') return s
    return 'medium'
  }

  private validateSentiment(s: string): DDInterviewSignal['sentiment'] {
    if (s === 'positive' || s === 'neutral' || s === 'concerning') return s
    return 'neutral'
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK TEAM ASSESSMENT AGENT
// ═══════════════════════════════════════════════════════════════════════════

export class MockTeamAssessmentAgent {
  async assessTeam(input: DDTeamAssessmentInput): Promise<DDTeamAssessmentResult> {
    await new Promise(resolve => setTimeout(resolve, 1500))

    const { companyName, founders } = input

    const founderProfiles: DDFounderProfile[] = founders.map((f, i) => ({
      name: f.name,
      role: f.role,
      founderScore: 55 + i * 10,
      experienceVerified: i === 0,
      experienceEvidence: `[MOCK] Web search found ${i === 0 ? 'LinkedIn profile and press mentions' : 'limited public information'} for ${f.name}.`,
      linkedinFound: i === 0,
      githubFound: false,
      githubScore: null,
      previousStartups: f.hasStartedBefore ? [{ name: 'Previous Co', outcome: f.previousStartupOutcome || 'unknown', verified: false }] : [],
      redFlags: i === 0 ? [] : ['Limited public presence'],
      strengths: i === 0 ? ['Relevant industry experience', 'Strong LinkedIn profile'] : ['Complementary skills'],
      evidenceUrls: ['https://linkedin.com/in/mock-founder'],
    }))

    const assessment: DDTeamAssessment = {
      founderProfiles,
      teamCompletenessScore: founders.length >= 2 ? 75 : 50,
      overallTeamScore: 60,
      teamGrade: 'C',
      teamRedFlags: [
        {
          claimId: 'team',
          claimText: `${companyName} team has limited public validation`,
          category: 'team_background',
          severity: 'medium',
          reason: 'Most team members have limited public digital footprint',
          evidence: '[MOCK] Web search returned few results for team members',
        },
      ],
      teamStrengths: ['Complementary skill sets', 'Prior startup experience on team'],
      missingRoles: founders.length < 3 ? ['Growth / Sales Lead'] : [],
      interviewSignals: [
        {
          signal: 'Founders demonstrate aligned vision on product strategy',
          sentiment: 'positive',
          source: 'product_vision',
        },
        {
          signal: 'Go-to-market strategy discussion was vague',
          sentiment: 'concerning',
          source: 'go_to_market',
        },
      ],
    }

    return {
      success: true,
      assessment,
      metadata: {
        foundersEnriched: founders.length,
        tavilySearches: founders.length * 2,
        processingTimeMs: 1500,
      },
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FACTORY FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

let agentInstance: TeamAssessmentAgent | MockTeamAssessmentAgent | null = null

export function getTeamAssessmentAgent(): TeamAssessmentAgent | MockTeamAssessmentAgent {
  if (!agentInstance) {
    if (process.env.ANTHROPIC_API_KEY && process.env.TAVILY_API_KEY) {
      agentInstance = new TeamAssessmentAgent()
    } else {
      console.warn('Missing API keys, using mock team assessment agent')
      agentInstance = new MockTeamAssessmentAgent()
    }
  }
  return agentInstance
}
