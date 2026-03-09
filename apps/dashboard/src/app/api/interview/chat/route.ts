// =====================================================
// SANCTUARY INTERVIEW CHAT API
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
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
    const auth = await requireAuth()
    if (!auth.ok) return auth.response

    const body: ChatRequest = await request.json()

    const { message, currentSection, messageHistory, applicationContext } = body

    // Validate required fields
    if (!message || !currentSection) {
      return NextResponse.json(
        { error: 'Missing required fields: message and currentSection' },
        { status: 400 }
      )
    }

    // Require API key in production — no mock fallback
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Interview service temporarily unavailable' },
        { status: 503 }
      )
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
    console.error('Interview chat error:', error instanceof Error ? error.message : 'Unknown error')

    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}
