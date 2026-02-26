// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY API — Voice Interview Endpoint
// POST: Process voice input, return text response + TTS config
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { getVoiceInterviewAgent } from '@/lib/ai/agents/voice-interview-agent'

export async function POST(request: NextRequest) {
  const body = await request.json()

  const {
    transcribedText,
    voiceMetadata = {},
    session,
  } = body as {
    transcribedText: string
    voiceMetadata?: {
      confidence?: number
      speakingRate?: number
      pauseBefore?: number
      emotionalTone?: string
    }
    session: {
      currentSection: string
      messageCount: number
      transcript: { role: string; content: string }[]
      founderName: string
      applicationContext: string
    }
  }

  if (!transcribedText || !session) {
    return NextResponse.json(
      { error: 'Missing required fields: transcribedText, session' },
      { status: 400 },
    )
  }

  const agent = getVoiceInterviewAgent()

  const response = await agent.processVoiceInput(
    transcribedText,
    {
      confidence: voiceMetadata.confidence ?? 0.9,
      speakingRate: voiceMetadata.speakingRate,
      pauseBefore: voiceMetadata.pauseBefore,
      emotionalTone: voiceMetadata.emotionalTone,
    },
    session,
  )

  const voiceConfig = agent.getVoiceConfig()

  return NextResponse.json({
    response: response.text,
    shouldTransition: response.shouldTransition,
    isComplete: response.isComplete,
    signals: response.signals,
    voice: {
      config: voiceConfig,
      emotion: response.emotion,
      pace: response.pace,
    },
  })
}
