// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY MEMO GENERATOR — Synthesize All Data into Investment Memo
// ═══════════════════════════════════════════════════════════════════════════

import Anthropic from '@anthropic-ai/sdk'
import { MEMO_SYSTEM_PROMPT, MEMO_GENERATION_PROMPT } from '../prompts/memo-system'
import type {
  StartupMemo,
  ApplicationWithFounders,
  Interview,
  InterviewMessage,
  Assessment,
  ResearchOutput,
} from '@/types'

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface MemoInput {
  application: ApplicationWithFounders
  interview?: Interview | null
  messages?: InterviewMessage[]
  assessment?: Assessment | null
  research?: ResearchOutput | null
}

export interface MemoResult {
  success: boolean
  memo: StartupMemo | null
  error?: string
  metadata: {
    processingTimeMs: number
    model: string
    version: string
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MEMO GENERATOR CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class MemoGenerator {
  private client: Anthropic
  private model = 'claude-sonnet-4-20250514'
  private version = '1.0'

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }

  /**
   * Generate a comprehensive startup memo
   */
  async generateMemo(input: MemoInput): Promise<MemoResult> {
    const startTime = Date.now()

    try {
      const { application, interview, messages, assessment, research } = input

      // Format all data for the prompt
      const applicationData = this.formatApplicationData(application)
      const transcriptSummary = this.formatTranscript(messages || [])
      const assessmentData = this.formatAssessment(assessment)
      const researchData = this.formatResearch(research)

      // Generate the prompt
      const prompt = MEMO_GENERATION_PROMPT(
        application.companyName,
        applicationData,
        transcriptSummary,
        assessmentData,
        researchData
      )

      // Call Claude
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 8192,
        system: MEMO_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      })

      // Extract text content
      const textContent = response.content.find(c => c.type === 'text')
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in response')
      }

      // Parse JSON response
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const memoData = JSON.parse(jsonMatch[0])

      // Add metadata
      const memo: StartupMemo = {
        generatedAt: new Date().toISOString(),
        version: this.version,
        applicationId: application.id,
        companyName: application.companyName,
        ...memoData,
      }

      return {
        success: true,
        memo,
        metadata: {
          processingTimeMs: Date.now() - startTime,
          model: this.model,
          version: this.version,
        },
      }
    } catch (error) {
      console.error('Memo generation error:', error)
      return {
        success: false,
        memo: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          processingTimeMs: Date.now() - startTime,
          model: this.model,
          version: this.version,
        },
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FORMAT METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  private formatApplicationData(application: ApplicationWithFounders): string {
    const founders = application.founders
      .map(f => {
        const parts = [`- ${f.name}`]
        if (f.role) parts.push(`(${f.role})`)
        if (f.isLead) parts.push('[Lead]')
        parts.push(`\n  Experience: ${f.yearsExperience || 0} years`)
        if (f.hasStartedBefore) parts.push(`\n  Previous startup: ${f.previousStartupOutcome || 'Yes'}`)
        if (f.linkedin) parts.push(`\n  LinkedIn: ${f.linkedin}`)
        return parts.join('')
      })
      .join('\n')

    return `COMPANY: ${application.companyName}
ONE-LINER: ${application.companyOneLiner || 'Not provided'}
WEBSITE: ${application.companyWebsite || 'Not provided'}
STAGE: ${application.stage}

DESCRIPTION:
${application.companyDescription || 'Not provided'}

PROBLEM:
${application.problemDescription || 'Not provided'}

TARGET CUSTOMER:
${application.targetCustomer || 'Not provided'}

SOLUTION:
${application.solutionDescription || 'Not provided'}

CURRENT METRICS:
- Users: ${application.userCount || 0}
- MRR: $${application.mrr || 0}

BIGGEST CHALLENGE:
${application.biggestChallenge || 'Not provided'}

WHY SANCTUARY:
${application.whySanctuary || 'Not provided'}

WHAT THEY WANT:
${application.whatTheyWant || 'Not provided'}

FOUNDERS:
${founders}`
  }

  private formatTranscript(messages: InterviewMessage[]): string {
    if (messages.length === 0) {
      return 'No interview transcript available.'
    }

    // Group by section and extract key quotes
    const sections: Record<string, string[]> = {}
    let currentSection = ''

    for (const msg of messages) {
      if (msg.section !== currentSection) {
        currentSection = msg.section
        sections[currentSection] = []
      }

      // Only include founder responses (user messages)
      if (msg.role === 'user') {
        sections[currentSection].push(msg.content)
      }
    }

    const lines: string[] = []
    for (const [section, contents] of Object.entries(sections)) {
      lines.push(`\n[${section.replace(/_/g, ' ').toUpperCase()}]`)
      // Include first 2 responses per section for brevity
      contents.slice(0, 2).forEach(c => {
        lines.push(`"${c.slice(0, 500)}${c.length > 500 ? '...' : ''}"`)
      })
    }

    return lines.join('\n')
  }

  private formatAssessment(assessment: Assessment | null | undefined): string {
    if (!assessment) {
      return 'No AI assessment available.'
    }

    const strengths = assessment.keyStrengths
      .map(s => `- ${s.strength}: ${s.evidence}`)
      .join('\n')

    const risks = assessment.keyRisks
      .map(r => `- [${r.severity.toUpperCase()}] ${r.risk}: ${r.evidence}`)
      .join('\n')

    return `RECOMMENDATION: ${assessment.recommendation} (${Math.round((assessment.recommendationConfidence || 0) * 100)}% confidence)

ONE-LINE SUMMARY:
${assessment.oneLineSummary || 'Not available'}

SCORES:
- Founder: ${assessment.founderScore}/100 - ${assessment.founderReasoning}
- Problem: ${assessment.problemScore}/100 - ${assessment.problemReasoning}
- User Value: ${assessment.userValueScore}/100 - ${assessment.userValueReasoning}
- Execution: ${assessment.executionScore}/100 - ${assessment.executionReasoning}
- OVERALL: ${assessment.overallScore}/100

KEY STRENGTHS:
${strengths}

KEY RISKS:
${risks}

CRITICAL QUESTIONS:
${assessment.criticalQuestions.map(q => `- ${q}`).join('\n')}

PRIMARY NEED: ${assessment.primaryNeed || 'Not specified'}
SECONDARY NEEDS: ${assessment.secondaryNeeds?.join(', ') || 'None'}
MENTOR DOMAINS: ${assessment.mentorDomains?.join(', ') || 'None'}`
  }

  private formatResearch(research: ResearchOutput | null | undefined): string {
    if (!research) {
      return 'No external research available.'
    }

    const competitors = research.competitors
      .map(c => `- ${c.name} [${c.threatLevel.toUpperCase()}]: ${c.description} (Funding: ${c.funding})`)
      .join('\n')

    const news = research.recentNews
      .map(n => `- [${n.sentiment.toUpperCase()}] ${n.title} (${n.source}, ${n.date})`)
      .join('\n')

    const validations = research.validationFindings
      .map(v => `- ${v.claim}: ${v.verified ? '✓ Verified' : '✗ Not verified'} (${v.notes})`)
      .join('\n')

    return `MARKET ANALYSIS:
- TAM: ${research.marketAnalysis.tamEstimate.value} (${research.marketAnalysis.tamEstimate.confidence} confidence)
- SAM: ${research.marketAnalysis.samEstimate.value}
- SOM: ${research.marketAnalysis.somEstimate.value}
- Growth Rate: ${research.marketAnalysis.growthRate}
- Key Trends: ${research.marketAnalysis.keyTrends.join(', ')}

COMPETITORS:
${competitors || 'No competitors identified'}

FOUNDER VALIDATION:
${research.founderProfiles.map(f =>
  `- ${f.name}: ${f.linkedinData ? 'LinkedIn validated' : 'Not validated'}${
    f.discrepancies.length > 0 ? ` (Discrepancies: ${f.discrepancies.join(', ')})` : ''
  }`
).join('\n')}

CLAIM VALIDATIONS:
${validations || 'No validations performed'}

RECENT NEWS:
${news || 'No recent news found'}

SOURCES:
${research.sources.slice(0, 5).join('\n')}`
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK MEMO GENERATOR (for demo mode)
// ═══════════════════════════════════════════════════════════════════════════

export class MockMemoGenerator {
  private version = '1.0-mock'

  async generateMemo(input: MemoInput): Promise<MemoResult> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 3000))

    const { application, assessment, research } = input

    // Calculate scores based on assessment or generate mock
    const founderScore = assessment?.founderScore ?? 75
    const problemScore = assessment?.problemScore ?? 70
    const userValueScore = assessment?.userValueScore ?? 65
    const executionScore = assessment?.executionScore ?? 72
    const overallScore = Math.round((founderScore + problemScore + userValueScore + executionScore) / 4)

    let recommendation: StartupMemo['executiveSummary']['recommendation'] = 'conditional'
    if (overallScore >= 85) recommendation = 'strong_accept'
    else if (overallScore >= 75) recommendation = 'accept'
    else if (overallScore >= 65) recommendation = 'conditional'
    else if (overallScore >= 55) recommendation = 'lean_decline'
    else recommendation = 'decline'

    const memo: StartupMemo = {
      generatedAt: new Date().toISOString(),
      version: this.version,
      applicationId: application.id,
      companyName: application.companyName,

      executiveSummary: {
        oneLiner: application.companyOneLiner || `${application.companyName} is building a solution for ${application.targetCustomer || 'their target market'}.`,
        recommendation,
        confidence: 0.75,
        keyThesis: `${application.companyName} addresses a real pain point with ${application.founders.length > 1 ? 'a complementary founding team' : 'a dedicated founder'}. ${assessment?.oneLineSummary || 'The team shows promising early traction and clear understanding of their market.'} [DEMO MODE]`,
        criticalRisks: [
          'Go-to-market strategy needs validation',
          'Competitive landscape is evolving',
          'Fundraising timeline may be aggressive',
        ],
      },

      founderProfile: {
        summary: `The founding team of ${application.founders.length} brings ${application.founders.some(f => f.hasStartedBefore) ? 'repeat founder experience' : 'fresh perspective'} to the problem space. [DEMO]`,
        backgrounds: application.founders.map(f => ({
          name: f.name,
          role: f.role || 'Founder',
          background: `${f.yearsExperience || 0} years of experience${f.hasStartedBefore ? ' with previous startup experience' : ''}.`,
          domainExpertise: ['Product Development', 'Technical Architecture'],
          validatedViaLinkedIn: !!f.linkedin,
        })),
        teamDynamics: 'The team appears to have complementary skills and healthy decision-making processes. [DEMO]',
        gaps: ['Sales/GTM expertise', 'Enterprise relationships'],
        score: founderScore,
        scoreReasoning: assessment?.founderReasoning || 'Founders demonstrate relevant experience and strong problem understanding. [DEMO]',
      },

      problemAndMarket: {
        problemStatement: application.problemDescription || 'Problem statement not provided.',
        icp: {
          description: application.targetCustomer || 'Target customer not specified.',
          painPoints: [
            'Time wasted on manual processes',
            'Lack of integrated solutions',
            'High cost of existing alternatives',
          ],
          currentSolutions: [
            'Manual spreadsheets',
            'Legacy enterprise software',
            'Competitors',
          ],
          willingnessToPay: application.mrr && application.mrr > 0
            ? `Demonstrated with $${application.mrr} MRR`
            : 'Not yet validated with revenue',
        },
        marketSize: {
          tam: research?.marketAnalysis.tamEstimate.value || '$15B',
          sam: research?.marketAnalysis.samEstimate.value || '$3B',
          som: research?.marketAnalysis.somEstimate.value || '$50M',
          methodology: 'Based on industry reports and comparable company analysis. [DEMO]',
        },
        validationEvidence: [
          `${application.userCount || 0} users acquired`,
          application.mrr && application.mrr > 0 ? `$${application.mrr} MRR` : 'Pre-revenue',
          'Customer discovery interviews conducted',
        ],
        score: problemScore,
        scoreReasoning: assessment?.problemReasoning || 'Problem is clearly defined with evidence of market need. [DEMO]',
      },

      solutionAndTraction: {
        productDescription: application.solutionDescription || 'Solution description not provided.',
        differentiation: [
          'Technical approach',
          'Focus on user experience',
          'Pricing model',
        ],
        currentMetrics: {
          users: application.userCount,
          mrr: application.mrr,
          growth: 'Early stage, metrics developing',
          retention: 'Insufficient data for retention analysis',
        },
        evidenceQuality: application.mrr && application.mrr > 0
          ? 'Revenue provides strong evidence of value'
          : 'Pre-revenue, need more validation',
        score: userValueScore,
        scoreReasoning: assessment?.userValueReasoning || 'Product shows promise but needs more validation. [DEMO]',
      },

      competitiveLandscape: {
        directCompetitors: (research?.competitors || []).slice(0, 3).map(c => ({
          name: c.name,
          description: c.description,
          funding: c.funding,
          positioning: c.differentiator,
          threatLevel: c.threatLevel,
        })),
        indirectAlternatives: [
          'Manual processes',
          'General-purpose tools (spreadsheets, etc.)',
          'Internal development',
        ],
        positioning: 'Positioned as a focused solution for the specific use case, competing on experience and price.',
        sustainableAdvantage: 'Technical depth and founder domain expertise provide early moat. [DEMO]',
      },

      executionAssessment: {
        shippingVelocity: 'Product shipped and in market with users. [DEMO]',
        decisionQuality: 'Evidence of thoughtful prioritization in feature development. [DEMO]',
        resourceEfficiency: 'Lean team making progress on limited resources. [DEMO]',
        teamGaps: ['Sales leadership', 'Marketing/growth'],
        score: executionScore,
        scoreReasoning: assessment?.executionReasoning || 'Team shows ability to ship but needs support on go-to-market. [DEMO]',
      },

      riskAnalysis: {
        redFlags: (assessment?.keyRisks || []).slice(0, 2).map(r => ({
          title: r.risk,
          description: r.evidence,
          severity: r.severity as 'low' | 'medium' | 'high' | 'critical',
          source: 'assessment' as const,
          mitigation: r.mitigation,
        })),
        marketRisks: [
          {
            title: 'Market timing',
            description: 'Market may not be ready for this solution',
            severity: 'medium' as const,
            source: 'research' as const,
            mitigation: 'Focus on early adopter segment first',
          },
        ],
        executionRisks: [
          {
            title: 'GTM execution',
            description: 'Team lacks sales experience',
            severity: 'medium' as const,
            source: 'interview' as const,
            mitigation: 'Pair with sales mentor in programme',
          },
        ],
        mitigationStrategies: [
          'Assign B2B sales mentor immediately',
          'Focus first 4 weeks on GTM strategy',
          'Set clear metrics milestones',
        ],
      },

      recommendation: {
        decision: `${recommendation.replace(/_/g, ' ').toUpperCase()}: ${application.companyName} shows ${overallScore >= 70 ? 'strong' : 'promising'} potential and would benefit from Sanctuary's programme. [DEMO]`,
        confidence: 0.75,
        keyQuestions: [
          'Can the team develop sales capabilities quickly?',
          'Is the market timing right?',
          'What is the path to next funding round?',
        ],
        suggestedNextSteps: [
          'Schedule partner discussion call',
          'Assign sales mentor',
          'Set 90-day milestone plan',
        ],
      },

      appendix: {
        interviewTranscriptUrl: null,
        signalsSummary: {
          positiveSignals: 8,
          negativeSignals: 3,
          totalQuotes: 12,
          strongestSignals: [
            'Strong founder-problem fit',
            'Technical differentiation',
            'Early customer traction',
          ],
        },
        researchSources: research?.sources || ['[MOCK] No research sources'],
      },
    }

    return {
      success: true,
      memo,
      metadata: {
        processingTimeMs: 3000,
        model: 'mock-generator',
        version: this.version,
      },
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FACTORY FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

let generatorInstance: MemoGenerator | MockMemoGenerator | null = null

export function getMemoGenerator(): MemoGenerator | MockMemoGenerator {
  if (!generatorInstance) {
    if (process.env.ANTHROPIC_API_KEY) {
      generatorInstance = new MemoGenerator()
    } else {
      console.log('No ANTHROPIC_API_KEY found, using mock memo generator')
      generatorInstance = new MockMemoGenerator()
    }
  }
  return generatorInstance
}
