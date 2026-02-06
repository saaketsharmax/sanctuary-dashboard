// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY ASSESSMENT AGENT — Claude API Implementation
// ═══════════════════════════════════════════════════════════════════════════

import Anthropic from '@anthropic-ai/sdk'
import { ASSESSMENT_SYSTEM_PROMPT, ASSESSMENT_USER_PROMPT } from '../prompts/assessment-system'
import type { AssessmentMetadata } from '@/types/metadata'

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface AssessmentInput {
  applicationId: string
  companyName: string
  applicationData: {
    companyOneLiner?: string
    companyDescription?: string
    problemDescription: string
    targetCustomer: string
    solutionDescription: string
    stage: string
    userCount?: number
    mrr?: number
    biggestChallenge: string
    whySanctuary: string
    whatTheyWant: string
    founders: Array<{
      name: string
      role?: string
      isLead: boolean
      yearsExperience?: number
      hasStartedBefore: boolean
    }>
  }
  transcript: Array<{
    role: 'system' | 'assistant' | 'user'
    content: string
    section: string
  }>
  signals?: Array<{
    type: string
    content: string
    dimension: string
    impact: number
  }>
}

export interface StrengthItem {
  strength: string
  evidence: string
  impact: string
}

export interface RiskItem {
  risk: string
  evidence: string
  severity: 'high' | 'medium' | 'low'
  mitigation: string
}

export interface EvidenceDensity {
  positiveSignals: number
  negativeSignals: number
  quotes: number
}

export interface ScoringBreakdownItem {
  signal: string
  impact: number
  quote?: string
}

export interface DimensionScoringBreakdown {
  baseScore: number
  signalsApplied: ScoringBreakdownItem[]
  finalScore: number
}

export interface GapItem {
  dimension: string
  missingInfo: string
  impactOnConfidence: number
}

export interface AssessmentOutput {
  // Scores
  founderScore: number
  founderReasoning: string
  problemScore: number
  problemReasoning: string
  userValueScore: number
  userValueReasoning: string
  executionScore: number
  executionReasoning: string
  overallScore: number

  // Recommendation
  recommendation: 'strong_accept' | 'accept' | 'conditional' | 'lean_decline' | 'decline'
  recommendationConfidence: number
  oneLineSummary: string

  // Analysis
  keyStrengths: StrengthItem[]
  keyRisks: RiskItem[]
  criticalQuestions: string[]

  // Needs
  primaryNeed: string
  secondaryNeeds: string[]
  mentorDomains: string[]

  // Metadata for calibration
  confidence: {
    overall: number
    founder: number
    problem: number
    userValue: number
    execution: number
  }
  evidenceDensity: {
    founder: EvidenceDensity
    problem: EvidenceDensity
    userValue: EvidenceDensity
    execution: EvidenceDensity
  }
  gapsIdentified: GapItem[]
  scoringBreakdown: {
    founder: DimensionScoringBreakdown
    problem: DimensionScoringBreakdown
    userValue: DimensionScoringBreakdown
    execution: DimensionScoringBreakdown
  }
}

export interface AssessmentResult {
  success: boolean
  assessment: AssessmentOutput | null
  metadata: AssessmentMetadata
  error?: string
}

// ═══════════════════════════════════════════════════════════════════════════
// AGENT CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class AssessmentAgent {
  private client: Anthropic
  private model: string = 'claude-sonnet-4-20250514'
  private promptVersion: string = 'v1.0'
  private rubricVersion: string = 'v1.0'

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }

  /**
   * Format application data for the prompt
   */
  private formatApplicationData(data: AssessmentInput['applicationData']): string {
    const founders = data.founders.map(f =>
      `- ${f.name}${f.role ? ` (${f.role})` : ''}${f.isLead ? ' [Lead]' : ''}: ${f.yearsExperience || 0} years experience, ${f.hasStartedBefore ? 'repeat founder' : 'first-time founder'}`
    ).join('\n')

    return `Company One-Liner: ${data.companyOneLiner || 'Not provided'}
Description: ${data.companyDescription || 'Not provided'}

FOUNDERS:
${founders}

PROBLEM:
${data.problemDescription}

TARGET CUSTOMER:
${data.targetCustomer}

SOLUTION:
${data.solutionDescription}

STAGE: ${data.stage}
USERS: ${data.userCount || 0}
MRR: $${data.mrr || 0}

BIGGEST CHALLENGE:
${data.biggestChallenge}

WHY SANCTUARY:
${data.whySanctuary}

WHAT THEY WANT:
${data.whatTheyWant}`
  }

  /**
   * Format transcript for the prompt
   */
  private formatTranscript(transcript: AssessmentInput['transcript']): string {
    let currentSection = ''
    const lines: string[] = []

    for (const msg of transcript) {
      if (msg.section !== currentSection) {
        currentSection = msg.section
        lines.push(`\n--- ${currentSection.replace('_', ' ').toUpperCase()} ---\n`)
      }

      const role = msg.role === 'assistant' ? 'INTERVIEWER' : msg.role === 'user' ? 'FOUNDER' : 'SYSTEM'
      lines.push(`[${role}]: ${msg.content}\n`)
    }

    return lines.join('')
  }

  /**
   * Format signals for the prompt
   */
  private formatSignals(signals: AssessmentInput['signals']): string {
    if (!signals || signals.length === 0) {
      return 'No pre-extracted signals available.'
    }

    const grouped: Record<string, typeof signals> = {}
    for (const signal of signals) {
      if (!grouped[signal.dimension]) {
        grouped[signal.dimension] = []
      }
      grouped[signal.dimension].push(signal)
    }

    const lines: string[] = []
    for (const [dimension, dimensionSignals] of Object.entries(grouped)) {
      lines.push(`\n${dimension.toUpperCase()}:`)
      for (const signal of dimensionSignals) {
        const impact = signal.impact > 0 ? `+${signal.impact}` : signal.impact.toString()
        lines.push(`  [${impact}] ${signal.type}: ${signal.content}`)
      }
    }

    return lines.join('\n')
  }

  /**
   * Generate assessment for an application
   */
  async generateAssessment(input: AssessmentInput): Promise<AssessmentResult> {
    const startTime = Date.now()

    // Initialize metadata
    const metadata: AssessmentMetadata = {
      model_used: this.model,
      generated_at: new Date().toISOString(),
      generation_time_ms: 0,
      prompt_version: this.promptVersion,
      scoring_rubric_version: this.rubricVersion,
      confidence: { overall: 0, founder: 0, problem: 0, user_value: 0, execution: 0 },
      evidence_density: {
        founder: { positive_signals: 0, negative_signals: 0, quotes_extracted: 0, data_points: 0 },
        problem: { positive_signals: 0, negative_signals: 0, quotes_extracted: 0, data_points: 0 },
        user_value: { positive_signals: 0, negative_signals: 0, quotes_extracted: 0, data_points: 0 },
        execution: { positive_signals: 0, negative_signals: 0, quotes_extracted: 0, data_points: 0 },
      },
      gaps_identified: [],
      scoring_breakdown: {
        founder: { base_score: 50, signals_applied: [], adjustments: 0, final_score: 50 },
        problem: { base_score: 50, signals_applied: [], adjustments: 0, final_score: 50 },
        user_value: { base_score: 50, signals_applied: [], adjustments: 0, final_score: 50 },
        execution: { base_score: 50, signals_applied: [], adjustments: 0, final_score: 50 },
      },
      similar_applications: [],
    }

    try {
      // Format inputs
      const applicationDataStr = this.formatApplicationData(input.applicationData)
      const transcriptStr = this.formatTranscript(input.transcript)
      const signalsStr = this.formatSignals(input.signals)

      // Build the user prompt
      const userPrompt = ASSESSMENT_USER_PROMPT(
        input.companyName,
        applicationDataStr,
        transcriptStr,
        signalsStr
      )

      // Call Claude
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 4096,
        system: ASSESSMENT_SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: userPrompt }
        ],
      })

      // Extract text content
      const textContent = response.content.find(c => c.type === 'text')
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in response')
      }

      // Parse JSON response
      let assessment: AssessmentOutput
      try {
        // Try to extract JSON from response
        const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
          throw new Error('No JSON found in response')
        }
        assessment = JSON.parse(jsonMatch[0]) as AssessmentOutput
      } catch (parseError) {
        console.error('Failed to parse assessment JSON:', textContent.text)
        throw new Error('Failed to parse assessment response as JSON')
      }

      // Update metadata with results
      metadata.generation_time_ms = Date.now() - startTime
      metadata.confidence = {
        overall: assessment.confidence.overall,
        founder: assessment.confidence.founder,
        problem: assessment.confidence.problem,
        user_value: assessment.confidence.userValue,
        execution: assessment.confidence.execution,
      }

      // Map evidence density
      metadata.evidence_density = {
        founder: {
          positive_signals: assessment.evidenceDensity.founder.positiveSignals,
          negative_signals: assessment.evidenceDensity.founder.negativeSignals,
          quotes_extracted: assessment.evidenceDensity.founder.quotes,
          data_points: 0,
        },
        problem: {
          positive_signals: assessment.evidenceDensity.problem.positiveSignals,
          negative_signals: assessment.evidenceDensity.problem.negativeSignals,
          quotes_extracted: assessment.evidenceDensity.problem.quotes,
          data_points: 0,
        },
        user_value: {
          positive_signals: assessment.evidenceDensity.userValue.positiveSignals,
          negative_signals: assessment.evidenceDensity.userValue.negativeSignals,
          quotes_extracted: assessment.evidenceDensity.userValue.quotes,
          data_points: 0,
        },
        execution: {
          positive_signals: assessment.evidenceDensity.execution.positiveSignals,
          negative_signals: assessment.evidenceDensity.execution.negativeSignals,
          quotes_extracted: assessment.evidenceDensity.execution.quotes,
          data_points: 0,
        },
      }

      // Map gaps
      metadata.gaps_identified = assessment.gapsIdentified.map(g => ({
        dimension: g.dimension as 'founder' | 'problem' | 'user_value' | 'execution',
        missing_info: g.missingInfo,
        impact_on_confidence: g.impactOnConfidence,
      }))

      // Map scoring breakdown
      const mapBreakdown = (breakdown: DimensionScoringBreakdown) => ({
        base_score: breakdown.baseScore,
        signals_applied: breakdown.signalsApplied.map(s => ({
          signal: s.signal,
          impact: s.impact,
          confidence: 0.8,
          source_quote: s.quote,
        })),
        adjustments: 0,
        final_score: breakdown.finalScore,
      })

      metadata.scoring_breakdown = {
        founder: mapBreakdown(assessment.scoringBreakdown.founder),
        problem: mapBreakdown(assessment.scoringBreakdown.problem),
        user_value: mapBreakdown(assessment.scoringBreakdown.userValue),
        execution: mapBreakdown(assessment.scoringBreakdown.execution),
      }

      return {
        success: true,
        assessment,
        metadata,
      }
    } catch (error) {
      console.error('Assessment generation error:', error)
      metadata.generation_time_ms = Date.now() - startTime

      return {
        success: false,
        assessment: null,
        metadata,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK ASSESSMENT AGENT (for demo mode)
// ═══════════════════════════════════════════════════════════════════════════

export class MockAssessmentAgent {
  async generateAssessment(input: AssessmentInput): Promise<AssessmentResult> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Generate mock scores based on input data
    const hasRevenue = (input.applicationData.mrr || 0) > 0
    const hasUsers = (input.applicationData.userCount || 0) > 0
    const isRepeatFounder = input.applicationData.founders.some(f => f.hasStartedBefore)
    const hasExperience = input.applicationData.founders.some(f => (f.yearsExperience || 0) > 5)

    // Calculate scores based on available data
    let founderScore = 50
    if (isRepeatFounder) founderScore += 15
    if (hasExperience) founderScore += 10
    founderScore = Math.min(100, Math.max(0, founderScore + Math.random() * 20))

    let problemScore = 50 + Math.random() * 30
    let userValueScore = 40
    if (hasRevenue) userValueScore += 25
    if (hasUsers) userValueScore += 15
    userValueScore = Math.min(100, Math.max(0, userValueScore + Math.random() * 15))

    let executionScore = 50 + Math.random() * 25

    const overallScore = Math.round(
      founderScore * 0.30 +
      problemScore * 0.25 +
      userValueScore * 0.25 +
      executionScore * 0.20
    )

    let recommendation: AssessmentOutput['recommendation'] = 'conditional'
    if (overallScore >= 85) recommendation = 'strong_accept'
    else if (overallScore >= 75) recommendation = 'accept'
    else if (overallScore >= 65) recommendation = 'conditional'
    else if (overallScore >= 55) recommendation = 'lean_decline'
    else recommendation = 'decline'

    const assessment: AssessmentOutput = {
      founderScore: Math.round(founderScore),
      founderReasoning: `Based on the application and interview, the founder demonstrates ${isRepeatFounder ? 'prior startup experience' : 'first-time founder energy'} with ${hasExperience ? 'significant' : 'some'} relevant experience. [DEMO MODE - This is mock reasoning]`,
      problemScore: Math.round(problemScore),
      problemReasoning: `The problem appears to be ${problemScore > 70 ? 'well-validated' : 'partially validated'} based on customer discovery efforts. [DEMO MODE]`,
      userValueScore: Math.round(userValueScore),
      userValueReasoning: `${hasRevenue ? `With $${input.applicationData.mrr} MRR, there's evidence of willingness to pay.` : 'No revenue yet, but'} ${hasUsers ? `${input.applicationData.userCount} users show initial traction.` : 'Need to validate user value.'} [DEMO MODE]`,
      executionScore: Math.round(executionScore),
      executionReasoning: `The team has demonstrated ${executionScore > 70 ? 'strong' : 'reasonable'} execution capabilities based on their progress. [DEMO MODE]`,
      overallScore,
      recommendation,
      recommendationConfidence: 0.7,
      oneLineSummary: `${input.companyName} shows ${overallScore >= 70 ? 'promising' : 'early'} potential with ${isRepeatFounder ? 'experienced' : 'first-time'} founders tackling a ${problemScore > 70 ? 'validated' : 'emerging'} problem. [DEMO]`,
      keyStrengths: [
        {
          strength: isRepeatFounder ? 'Repeat founder' : 'Domain expertise',
          evidence: 'Based on application data [DEMO]',
          impact: 'Increases likelihood of execution',
        },
        {
          strength: hasRevenue ? 'Revenue traction' : 'User engagement',
          evidence: hasRevenue ? `$${input.applicationData.mrr} MRR` : `${input.applicationData.userCount} users`,
          impact: 'Shows market validation',
        },
      ],
      keyRisks: [
        {
          risk: 'Market timing',
          evidence: 'Market analysis needed [DEMO]',
          severity: 'medium',
          mitigation: 'Connect with industry mentors',
        },
      ],
      criticalQuestions: [
        'What is the path to $100k MRR?',
        'How will you acquire enterprise customers?',
      ],
      primaryNeed: 'Go-to-market strategy',
      secondaryNeeds: ['Fundraising preparation', 'Team building'],
      mentorDomains: ['B2B Sales', 'Product Strategy'],
      confidence: {
        overall: 0.65,
        founder: 0.7,
        problem: 0.6,
        userValue: hasRevenue ? 0.75 : 0.5,
        execution: 0.6,
      },
      evidenceDensity: {
        founder: { positiveSignals: 3, negativeSignals: 1, quotes: 2 },
        problem: { positiveSignals: 2, negativeSignals: 1, quotes: 1 },
        userValue: { positiveSignals: hasRevenue ? 3 : 1, negativeSignals: 1, quotes: 1 },
        execution: { positiveSignals: 2, negativeSignals: 1, quotes: 1 },
      },
      gapsIdentified: [
        { dimension: 'userValue', missingInfo: 'Retention metrics', impactOnConfidence: -0.1 },
      ],
      scoringBreakdown: {
        founder: {
          baseScore: 50,
          signalsApplied: [
            { signal: isRepeatFounder ? 'repeat_founder' : 'domain_expertise', impact: isRepeatFounder ? 15 : 8 },
          ],
          finalScore: Math.round(founderScore),
        },
        problem: {
          baseScore: 50,
          signalsApplied: [
            { signal: 'problem_clarity', impact: Math.round(problemScore - 50) },
          ],
          finalScore: Math.round(problemScore),
        },
        userValue: {
          baseScore: 50,
          signalsApplied: [
            { signal: hasRevenue ? 'has_revenue' : 'has_users', impact: hasRevenue ? 20 : 10 },
          ],
          finalScore: Math.round(userValueScore),
        },
        execution: {
          baseScore: 50,
          signalsApplied: [
            { signal: 'shipping_speed', impact: Math.round(executionScore - 50) },
          ],
          finalScore: Math.round(executionScore),
        },
      },
    }

    const metadata: AssessmentMetadata = {
      model_used: 'mock-agent',
      generated_at: new Date().toISOString(),
      generation_time_ms: 2000,
      prompt_version: 'mock-v1',
      scoring_rubric_version: 'v1.0',
      confidence: {
        overall: assessment.confidence.overall,
        founder: assessment.confidence.founder,
        problem: assessment.confidence.problem,
        user_value: assessment.confidence.userValue,
        execution: assessment.confidence.execution,
      },
      evidence_density: {
        founder: {
          positive_signals: assessment.evidenceDensity.founder.positiveSignals,
          negative_signals: assessment.evidenceDensity.founder.negativeSignals,
          quotes_extracted: 2,
          data_points: 1
        },
        problem: {
          positive_signals: assessment.evidenceDensity.problem.positiveSignals,
          negative_signals: assessment.evidenceDensity.problem.negativeSignals,
          quotes_extracted: 1,
          data_points: 0
        },
        user_value: {
          positive_signals: assessment.evidenceDensity.userValue.positiveSignals,
          negative_signals: assessment.evidenceDensity.userValue.negativeSignals,
          quotes_extracted: 1,
          data_points: 2
        },
        execution: {
          positive_signals: assessment.evidenceDensity.execution.positiveSignals,
          negative_signals: assessment.evidenceDensity.execution.negativeSignals,
          quotes_extracted: 1,
          data_points: 1
        },
      },
      gaps_identified: assessment.gapsIdentified.map(g => ({
        dimension: g.dimension as 'founder' | 'problem' | 'user_value' | 'execution',
        missing_info: g.missingInfo,
        impact_on_confidence: g.impactOnConfidence,
      })),
      scoring_breakdown: {
        founder: {
          base_score: assessment.scoringBreakdown.founder.baseScore,
          signals_applied: [],
          adjustments: 0,
          final_score: assessment.scoringBreakdown.founder.finalScore,
        },
        problem: {
          base_score: assessment.scoringBreakdown.problem.baseScore,
          signals_applied: [],
          adjustments: 0,
          final_score: assessment.scoringBreakdown.problem.finalScore,
        },
        user_value: {
          base_score: assessment.scoringBreakdown.userValue.baseScore,
          signals_applied: [],
          adjustments: 0,
          final_score: assessment.scoringBreakdown.userValue.finalScore,
        },
        execution: {
          base_score: assessment.scoringBreakdown.execution.baseScore,
          signals_applied: [],
          adjustments: 0,
          final_score: assessment.scoringBreakdown.execution.finalScore,
        },
      },
      similar_applications: [],
    }

    return {
      success: true,
      assessment,
      metadata,
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FACTORY FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

let agentInstance: AssessmentAgent | MockAssessmentAgent | null = null

export function getAssessmentAgent(): AssessmentAgent | MockAssessmentAgent {
  if (!agentInstance) {
    // Use real agent if API key is available, otherwise mock
    if (process.env.ANTHROPIC_API_KEY) {
      agentInstance = new AssessmentAgent()
    } else {
      console.log('No ANTHROPIC_API_KEY found, using mock assessment agent')
      agentInstance = new MockAssessmentAgent()
    }
  }
  return agentInstance
}
