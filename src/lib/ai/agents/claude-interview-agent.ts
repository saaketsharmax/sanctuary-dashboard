// =====================================================
// SANCTUARY INTERVIEW AGENT — Claude API Implementation
// =====================================================

import Anthropic from '@anthropic-ai/sdk'
import type { InterviewSection, InterviewMessage } from '@/types'
import { INTERVIEW_PERSONA, SECTION_PROMPTS, INTERVIEW_CLOSING } from '../prompts/interview-system'

// Types for interview signals extracted in real-time
export interface InterviewSignal {
  type: 'founder_signal' | 'problem_signal' | 'solution_signal' | 'risk_flag' | 'strength' | 'quote' | 'data_point' | 'red_flag' | 'green_flag'
  content: string
  dimension: 'founder' | 'problem' | 'user_value' | 'execution'
  impact: number // -5 to +5
}

export interface ClaudeInterviewResponse {
  response: string
  shouldTransition: boolean
  isComplete: boolean
  signals: InterviewSignal[]
}

interface ApplicationContext {
  companyName: string
  companyOneLiner?: string
  industry?: string
  stage?: string
  problemStatement?: string
  solutionStatement?: string
}

export class ClaudeInterviewAgent {
  private client: Anthropic
  private model: string = 'claude-sonnet-4-20250514'

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }

  /**
   * Get the opening message for an interview
   */
  getOpeningMessage(): string {
    return "Welcome to your Sanctuary interview. I'm going to ask you some direct questions to understand you and your startup better. This will take about 45-60 minutes. Let's begin.\n\nTell me about yourself in 60 seconds. Not your resume — who are you as a person?"
  }

  /**
   * Build the system prompt for the current section
   */
  private buildSystemPrompt(
    section: InterviewSection,
    applicationContext?: ApplicationContext,
    messageHistory: InterviewMessage[] = []
  ): string {
    const sectionPrompt = SECTION_PROMPTS[section]
    const userMessageCount = messageHistory.filter(
      (m) => m.role === 'user' && m.section === section
    ).length

    // Determine if we should consider transitioning
    const minMessagesForSection: Record<InterviewSection, number> = {
      founder_dna: 4,
      problem_interrogation: 5,
      solution_execution: 4,
      market_competition: 3,
      sanctuary_fit: 2,
    }

    const canTransition = userMessageCount >= minMessagesForSection[section]

    return `${INTERVIEW_PERSONA}

## CURRENT SECTION: ${section.replace('_', ' ').toUpperCase()}

${sectionPrompt.intro}

### Questions to cover in this section:
${sectionPrompt.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

### Progress
- Messages in this section: ${userMessageCount}
- Minimum to cover: ${minMessagesForSection[section]}
- Can transition to next section: ${canTransition ? 'YES (if key topics covered)' : 'NO (need more depth)'}

${applicationContext ? `
### Application Context
- Company: ${applicationContext.companyName}
- One-liner: ${applicationContext.companyOneLiner || 'Not provided'}
- Industry: ${applicationContext.industry || 'Not specified'}
- Stage: ${applicationContext.stage || 'Not specified'}
${applicationContext.problemStatement ? `- Problem: ${applicationContext.problemStatement}` : ''}
${applicationContext.solutionStatement ? `- Solution: ${applicationContext.solutionStatement}` : ''}
` : ''}

## OUTPUT FORMAT

You must respond with ONLY valid JSON in this exact format:
{
  "response": "Your conversational response to the founder. Be direct, ask follow-up questions, probe vague answers.",
  "shouldTransition": false,
  "signals": []
}

### Field Explanations:
- **response**: Your actual message to the founder. Write naturally, as a tough but fair interviewer.
- **shouldTransition**: Set to true ONLY when you've thoroughly covered the section and are ready to move on. When true, your response should acknowledge the transition.
- **signals**: Array of notable observations. Each signal:
  {
    "type": "founder_signal" | "problem_signal" | "solution_signal" | "risk_flag" | "strength" | "quote" | "data_point" | "red_flag" | "green_flag",
    "content": "The specific observation",
    "dimension": "founder" | "problem" | "user_value" | "execution",
    "impact": -5 to +5 (negative for concerns, positive for strengths)
  }

## CRITICAL RULES
1. ALWAYS respond with valid JSON only
2. Never break character or reveal you are an AI
3. If the founder gives a vague answer, probe deeper
4. Extract specific numbers, quotes, and examples
5. Don't transition until you've covered the key topics for this section
6. Keep responses conversational but direct (2-4 sentences typically)
7. If this is the last section (sanctuary_fit) and you've covered the key topics, include a closing message`
  }

  /**
   * Process a user message and generate a Claude response
   */
  async processMessage(
    userMessage: string,
    currentSection: InterviewSection,
    messageHistory: InterviewMessage[],
    applicationContext?: ApplicationContext
  ): Promise<ClaudeInterviewResponse> {
    // Check if this is the final section and should complete
    const userMessagesInSection = messageHistory.filter(
      (m) => m.role === 'user' && m.section === currentSection
    ).length

    // Build conversation history for Claude
    const conversationMessages: { role: 'user' | 'assistant'; content: string }[] = []

    // Add previous messages
    for (const msg of messageHistory) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        conversationMessages.push({
          role: msg.role,
          content: msg.content,
        })
      }
    }

    // Add current user message
    conversationMessages.push({
      role: 'user',
      content: userMessage,
    })

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1024,
        system: this.buildSystemPrompt(currentSection, applicationContext, messageHistory),
        messages: conversationMessages,
      })

      // Parse the response
      const textContent = response.content.find((c) => c.type === 'text')
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in response')
      }

      // Parse JSON response
      let parsed: {
        response: string
        shouldTransition: boolean
        signals: InterviewSignal[]
      }

      try {
        // Try to extract JSON from the response (in case there's extra text)
        const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
          throw new Error('No JSON found in response')
        }
        parsed = JSON.parse(jsonMatch[0])
      } catch {
        // If parsing fails, use the raw response
        console.error('Failed to parse Claude response as JSON:', textContent.text)
        parsed = {
          response: textContent.text,
          shouldTransition: false,
          signals: [],
        }
      }

      // Check if interview should complete
      const isComplete =
        currentSection === 'sanctuary_fit' &&
        userMessagesInSection >= 2 &&
        parsed.shouldTransition

      // If completing, ensure we have a proper closing
      if (isComplete) {
        parsed.response = parsed.response + '\n\n' + INTERVIEW_CLOSING
      }

      return {
        response: parsed.response,
        shouldTransition: parsed.shouldTransition && !isComplete,
        isComplete,
        signals: parsed.signals || [],
      }
    } catch (error) {
      console.error('Claude API error:', error)
      throw error
    }
  }

  /**
   * Generate a transition message when moving to a new section
   */
  getTransitionMessage(nextSection: InterviewSection): string {
    const transitions: Record<InterviewSection, string> = {
      founder_dna: "Let's start by getting to know you.",
      problem_interrogation: "Good, I'm getting a sense of who you are. Now let's dig into the problem you're solving.",
      solution_execution: "The problem sounds real. Now let's talk about how you're solving it.",
      market_competition: "Got it. Let's zoom out and look at the bigger picture — the market and competition.",
      sanctuary_fit: "Last section. Let's talk about what you need from Sanctuary and what success looks like.",
    }
    return transitions[nextSection]
  }
}

// Singleton instance
let agentInstance: ClaudeInterviewAgent | null = null

export function getClaudeInterviewAgent(): ClaudeInterviewAgent {
  if (!agentInstance) {
    agentInstance = new ClaudeInterviewAgent()
  }
  return agentInstance
}
