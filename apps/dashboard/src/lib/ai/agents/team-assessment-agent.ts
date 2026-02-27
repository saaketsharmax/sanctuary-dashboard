// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY DD — Team Assessment Agent
// Enriches founder profiles via Tavily, analyzes team via Claude
// ═══════════════════════════════════════════════════════════════════════════

import Anthropic from '@anthropic-ai/sdk'
import { getTavilyClient, type TavilySearchResponse } from '@/lib/research/tavily-client'
import {
  TEAM_ASSESSMENT_SYSTEM_PROMPT,
  TEAM_ASSESSMENT_USER_PROMPT,
} from '../prompts/team-assessment-system'
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
  private client: Anthropic
  private tavily = getTavilyClient()
  private model = 'claude-sonnet-4-20250514'

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }

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

      // ─── Step 1: Enrich each founder via Tavily ───
      const enrichmentResults: { name: string; results: TavilySearchResponse[] }[] = []

      for (const founder of founders) {
        const founderResults: TavilySearchResponse[] = []

        // General background search
        const bgResult = await this.tavily.searchFounderBackground(
          founder.name,
          companyName,
          founder.linkedin || undefined
        )
        founderResults.push(bgResult)
        tavilySearches++

        // If they claim prior startups, search for those
        if (founder.hasStartedBefore && founder.previousStartupOutcome) {
          const startupResult = await this.tavily.search({
            query: `"${founder.name}" startup founder CEO previous company exit acquisition`,
            searchDepth: 'advanced',
            maxResults: 5,
            includeAnswer: true,
          })
          founderResults.push(startupResult)
          tavilySearches++
        }

        // GitHub search for technical founders
        const role = (founder.role || '').toLowerCase()
        if (role.includes('cto') || role.includes('tech') || role.includes('engineer') || role.includes('developer')) {
          const ghResult = await this.tavily.search({
            query: `"${founder.name}" github.com contributions open source repositories`,
            searchDepth: 'basic',
            maxResults: 3,
            includeAnswer: true,
            includeDomains: ['github.com'],
          })
          founderResults.push(ghResult)
          tavilySearches++
        }

        enrichmentResults.push({ name: founder.name, results: founderResults })
      }

      // ─── Step 2: Format data for Claude ───
      const foundersData = founders.map((f, i) => {
        return `FOUNDER ${i + 1}:
  Name: ${f.name}
  Role: ${f.role || 'Not specified'}
  Years of Experience: ${f.yearsExperience ?? 'Not specified'}
  Has Started Before: ${f.hasStartedBefore ? 'Yes' : 'No'}
  Previous Startup Outcome: ${f.previousStartupOutcome || 'N/A'}
  LinkedIn: ${f.linkedin || 'Not provided'}`
      }).join('\n\n')

      const enrichmentData = enrichmentResults.map(er => {
        const allResults = er.results.flatMap(r => r.results)
        const answers = er.results.map(r => r.answer).filter(Boolean)
        if (allResults.length === 0 && answers.length === 0) {
          return `═══ ${er.name} ═══\nNo web results found.`
        }
        const lines: string[] = [`═══ ${er.name} ═══`]
        for (const answer of answers) {
          lines.push(`SUMMARY: ${answer}`)
        }
        for (const result of allResults) {
          lines.push(`TITLE: ${result.title}`)
          lines.push(`URL: ${result.url}`)
          lines.push(`CONTENT: ${result.content}`)
          if (result.publishedDate) lines.push(`DATE: ${result.publishedDate}`)
          lines.push('')
        }
        return lines.join('\n')
      }).join('\n\n')

      const interviewData = interviewTranscript
        ? interviewTranscript
            .filter(msg => msg.role === 'user')
            .map(msg => `[${msg.section || 'general'}] ${msg.content}`)
            .join('\n\n')
        : null

      // ─── Step 3: Claude analysis ───
      const prompt = TEAM_ASSESSMENT_USER_PROMPT(
        companyName,
        companyDescription,
        stage,
        foundersData,
        enrichmentData,
        interviewData
      )

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 4096,
        system: TEAM_ASSESSMENT_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      })

      const textContent = response.content.find(c => c.type === 'text')
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in team assessment response')
      }

      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in team assessment response')
      }

      const parsed = JSON.parse(jsonMatch[0])
      const assessment = this.parseAssessment(parsed, enrichmentResults)

      return {
        success: true,
        assessment,
        metadata: {
          foundersEnriched: enrichmentResults.length,
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

  private parseAssessment(
    parsed: any,
    enrichmentResults: { name: string; results: TavilySearchResponse[] }[]
  ): DDTeamAssessment {
    const founderProfiles: DDFounderProfile[] = (parsed.founderProfiles || []).map((fp: any, i: number) => {
      // Collect evidence URLs from enrichment
      const enrichment = enrichmentResults[i]
      const evidenceUrls = enrichment
        ? enrichment.results.flatMap(r => r.results.map(res => res.url))
        : []

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
        evidenceUrls,
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
      console.log('Missing API keys, using mock team assessment agent')
      agentInstance = new MockTeamAssessmentAgent()
    }
  }
  return agentInstance
}
