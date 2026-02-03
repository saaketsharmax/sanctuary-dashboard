// =====================================================
// SANCTUARY INTERVIEW CHAT API
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { getClaudeInterviewAgent } from '@/lib/ai/agents/claude-interview-agent'
import type { InterviewSection, InterviewMessage } from '@/types'

interface ChatRequest {
  interviewId: string
  applicationId: string
  message: string
  currentSection: InterviewSection
  messageHistory: InterviewMessage[]
  applicationContext?: {
    companyName: string
    companyOneLiner?: string
    industry?: string
    stage?: string
    problemStatement?: string
    solutionStatement?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()

    const { message, currentSection, messageHistory, applicationContext } = body

    // Validate required fields
    if (!message || !currentSection) {
      return NextResponse.json(
        { error: 'Missing required fields: message and currentSection' },
        { status: 400 }
      )
    }

    // Check if Claude API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      // Fall back to mock mode if no API key
      console.warn('ANTHROPIC_API_KEY not configured, using mock mode')
      return NextResponse.json({
        response: getMockResponse(currentSection, messageHistory),
        shouldTransition: shouldMockTransition(currentSection, messageHistory),
        isComplete: false,
        signals: [],
        mode: 'mock',
      })
    }

    // Use Claude Interview Agent
    const agent = getClaudeInterviewAgent()

    const result = await agent.processMessage(
      message,
      currentSection,
      messageHistory,
      applicationContext
    )

    return NextResponse.json({
      ...result,
      mode: 'live',
    })
  } catch (error) {
    console.error('Interview chat error:', error)

    // Return a graceful error response
    return NextResponse.json(
      {
        error: 'Failed to process message',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Mock responses for when API key is not configured
function getMockResponse(section: InterviewSection, messageHistory: InterviewMessage[]): string {
  const userMessagesInSection = messageHistory.filter(
    (m) => m.role === 'user' && m.section === section
  ).length

  const mockQuestions: Record<InterviewSection, string[]> = {
    founder_dna: [
      "Tell me about yourself in 60 seconds. Not your resume — who are you as a person?",
      "Interesting. What's the hardest thing you've ever done? Something that really tested you.",
      "Why THIS problem? Of all the problems in the world, why did you pick this one?",
      "What are you bad at? Be honest — I want to know your weaknesses.",
      "Tell me about your co-founder. How did you meet, and how do you handle disagreements?",
    ],
    problem_interrogation: [
      "Good. Now let's talk about the problem. Explain it to me like I'm 12 years old.",
      "How do you KNOW this is a real problem? What evidence have you gathered?",
      "How many user interviews have you done? Give me a specific number.",
      "Tell me about one of those conversations. What did they say, in their exact words?",
      "How do people solve this problem today, without you?",
      "What would make you realize you're wrong? What would kill this idea?",
    ],
    solution_execution: [
      "The problem sounds real. Now walk me through your solution. What does a user actually experience?",
      "Why this approach? Couldn't you solve this more simply?",
      "What features did you consciously decide NOT to build?",
      "How long did it take to build what you have? Be specific about the timeline.",
      "What's the most uncertain thing about your product right now?",
    ],
    market_competition: [
      "Let's zoom out. Who else is trying to solve this problem?",
      "Why will you win? What do you have that they don't?",
      "How big is this market, realistically? Not the TAM slide — your honest take.",
    ],
    sanctuary_fit: [
      "Last section. What do you need most from Sanctuary in the next 5 months?",
      "What kind of mentors would be most helpful?",
      "What does success look like at the end of the program? Be specific with metrics.",
    ],
  }

  const questions = mockQuestions[section]
  const index = Math.min(userMessagesInSection, questions.length - 1)
  return questions[index]
}

function shouldMockTransition(section: InterviewSection, messageHistory: InterviewMessage[]): boolean {
  const userMessagesInSection = messageHistory.filter(
    (m) => m.role === 'user' && m.section === section
  ).length

  const thresholds: Record<InterviewSection, number> = {
    founder_dna: 4,
    problem_interrogation: 5,
    solution_execution: 4,
    market_competition: 3,
    sanctuary_fit: 3,
  }

  return userMessagesInSection >= thresholds[section]
}
