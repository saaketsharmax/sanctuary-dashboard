import { NextRequest, NextResponse } from 'next/server'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { createDb } from '@sanctuary/database'
import { z } from 'zod'
import type { InterviewMetadata, InterviewSectionMetadata } from '@/types/metadata'

// Validation schema for interview message
const messageSchema = z.object({
  id: z.string(),
  interviewId: z.string(),
  role: z.enum(['system', 'assistant', 'user']),
  content: z.string(),
  section: z.string(),
  sequenceNumber: z.number(),
  createdAt: z.string(),
})

// Validation schema for interview signal
const signalSchema = z.object({
  type: z.string(),
  content: z.string(),
  dimension: z.enum(['founder', 'problem', 'user_value', 'execution']),
  impact: z.number().min(-5).max(5),
  sourceQuote: z.string().optional(),
  sourceMessageId: z.string().optional(),
  section: z.string(),
  confidence: z.number().min(0).max(1).optional(),
})

// Validation schema for starting an interview
const startInterviewSchema = z.object({
  action: z.literal('start'),
})

// Validation schema for completing an interview
const completeInterviewSchema = z.object({
  action: z.literal('complete'),
  transcript: z.array(messageSchema),
  signals: z.array(signalSchema).optional(),
  startedAt: z.string(),
  completedAt: z.string(),
  durationMinutes: z.number(),
  aiModel: z.string().optional(),
  // Behavioral metadata
  pauses: z.number().optional(),
  totalPauseTime: z.number().optional(),
})

// Combined schema with discriminated union
const interviewActionSchema = z.discriminatedUnion('action', [
  startInterviewSchema,
  completeInterviewSchema,
])

// Helper to build interview metadata from transcript
function buildInterviewMetadata(
  transcript: z.infer<typeof messageSchema>[],
  signals: z.infer<typeof signalSchema>[],
  durationMinutes: number,
  aiModel: string,
  pauses: number = 0,
  totalPauseTime: number = 0
): InterviewMetadata {
  const userMessages = transcript.filter(m => m.role === 'user')
  const aiMessages = transcript.filter(m => m.role === 'assistant')

  // Group messages by section
  const sections = ['founder_dna', 'problem_interrogation', 'solution_execution', 'market_competition', 'sanctuary_fit']
  const sectionMetadata: Record<string, InterviewSectionMetadata> = {}

  for (const section of sections) {
    const sectionMessages = transcript.filter(m => m.section === section)
    const sectionUserMessages = sectionMessages.filter(m => m.role === 'user')

    // Calculate response times (time between messages)
    const responseTimes: number[] = []
    for (let i = 1; i < sectionMessages.length; i++) {
      const prev = new Date(sectionMessages[i - 1].createdAt).getTime()
      const curr = new Date(sectionMessages[i].createdAt).getTime()
      if (sectionMessages[i].role === 'user') {
        responseTimes.push((curr - prev) / 1000)
      }
    }

    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0

    const avgResponseLength = sectionUserMessages.length > 0
      ? sectionUserMessages.reduce((sum, m) => sum + m.content.split(/\s+/).length, 0) / sectionUserMessages.length
      : 0

    sectionMetadata[section] = {
      messages: sectionMessages.length,
      duration_minutes: Math.round(durationMinutes / sections.length), // Estimate
      avg_response_time_seconds: Math.round(avgResponseTime),
      avg_response_length: Math.round(avgResponseLength),
      probing_questions_asked: aiMessages.filter(m => m.section === section && m.content.includes('?')).length,
      topic_coverage: [], // Would need NLP to determine
      topics_missed: [],
    }
  }

  // Calculate overall behavioral signals
  const allResponseTimes: { seconds: number; question: string }[] = []
  for (let i = 1; i < transcript.length; i++) {
    if (transcript[i].role === 'user' && transcript[i - 1].role === 'assistant') {
      const prev = new Date(transcript[i - 1].createdAt).getTime()
      const curr = new Date(transcript[i].createdAt).getTime()
      allResponseTimes.push({
        seconds: (curr - prev) / 1000,
        question: transcript[i - 1].content.substring(0, 100),
      })
    }
  }

  const avgResponseTime = allResponseTimes.length > 0
    ? allResponseTimes.reduce((sum, r) => sum + r.seconds, 0) / allResponseTimes.length
    : 0

  const sortedTimes = [...allResponseTimes].sort((a, b) => b.seconds - a.seconds)
  const longest = sortedTimes[0] || { seconds: 0, question: '' }
  const shortest = sortedTimes[sortedTimes.length - 1] || { seconds: 0, question: '' }

  // Detect vague answers (short responses to open questions)
  const vagueAnswers = userMessages.filter(m => m.content.split(/\s+/).length < 10).length

  // Count specific examples and data points
  const allUserText = userMessages.map(m => m.content).join(' ')
  const specificExamples = (allUserText.match(/for example|such as|specifically|like when/gi) || []).length
  const dataPoints = (allUserText.match(/\d+(?:%|k|K|users?|customers?|\$|MRR|ARR)/g) || []).length
  const customerQuotes = (allUserText.match(/"[^"]+"|they said|told me|mentioned/gi) || []).length

  // Extract metrics mentioned
  const metricsRegex = /\$?\d+(?:,\d{3})*(?:\.\d+)?(?:\s*(?:k|K|m|M|%|users?|customers?|MRR|ARR))?/g
  const metrics = allUserText.match(metricsRegex) || []

  return {
    session: {
      duration_minutes: durationMinutes,
      total_messages: transcript.length,
      user_messages: userMessages.length,
      ai_messages: aiMessages.length,
      pauses_taken: pauses,
      total_pause_time_seconds: totalPauseTime,
    },
    sections: sectionMetadata as InterviewMetadata['sections'],
    behavioral_signals: {
      response_time_pattern: 'consistent', // Would need more analysis
      avg_response_time_seconds: Math.round(avgResponseTime),
      longest_response_time: longest,
      shortest_response_time: shortest,
      questions_asked_to_clarify: userMessages.filter(m => m.content.includes('?')).length,
      times_went_off_topic: 0, // Would need NLP
      emotional_markers: [], // Would need sentiment analysis
    },
    content_quality: {
      specific_examples_given: specificExamples,
      vague_answers_count: vagueAnswers,
      contradictions_detected: signals.filter(s => s.type === 'contradiction').length,
      data_points_shared: dataPoints,
      customer_quotes_shared: customerQuotes,
      metrics_mentioned: metrics.slice(0, 10),
    },
    ai_model_used: aiModel,
    mode: 'live',
  }
}

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST - Start or complete interview
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: applicationId } = await params
    const body = await request.json()

    // Validate the request body
    const validationResult = interviewActionSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // If Supabase is not configured, return demo response
    if (!isSupabaseConfigured()) {
      console.log(`Demo mode: Interview ${data.action} for application ${applicationId}`)
      return NextResponse.json({
        success: true,
        applicationId,
        action: data.action,
        message: `Interview ${data.action === 'start' ? 'started' : 'completed'} (demo mode)`,
      })
    }

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Please sign in to continue' },
        { status: 401 }
      )
    }

    const db = createDb({ type: 'supabase-client', client: supabase })

    // Verify the user owns this application
    const { data: application, error: fetchError } = await db.applications.getByIdWithFields(
      applicationId,
      'id, user_id, status'
    )

    if (fetchError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    if ((application as any).user_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to access this application' },
        { status: 403 }
      )
    }

    if (data.action === 'start') {
      // Update application to mark interview as started
      const { error: updateError } = await db.applications.update(applicationId, {
        status: 'interviewing',
        interview_started_at: new Date().toISOString(),
      })

      if (updateError) {
        console.error('Database error:', updateError)
        return NextResponse.json(
          { error: 'Failed to start interview', details: updateError.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        applicationId,
        action: 'start',
        message: 'Interview started successfully',
      })
    }

    if (data.action === 'complete') {
      // Build interview metadata
      const interviewMetadata = buildInterviewMetadata(
        data.transcript,
        data.signals || [],
        data.durationMinutes,
        data.aiModel || 'claude-sonnet-4-20250514',
        data.pauses || 0,
        data.totalPauseTime || 0
      )

      // Save the completed interview with metadata
      const { error: updateError } = await db.applications.update(applicationId, {
        status: 'under_review',
        interview_completed_at: data.completedAt,
        interview_transcript: data.transcript,
        interview_metadata: interviewMetadata,
      })

      if (updateError) {
        console.error('Database error:', updateError)
        return NextResponse.json(
          { error: 'Failed to save interview', details: updateError.message },
          { status: 500 }
        )
      }

      // Save signals to interview_signals table (if signals provided and table exists)
      if (data.signals && data.signals.length > 0) {
        const signalsToInsert = data.signals.map(signal => ({
          application_id: applicationId,
          interview_id: data.transcript[0]?.interviewId || `interview-${applicationId}`,
          signal_type: signal.type,
          dimension: signal.dimension,
          content: signal.content,
          source_quote: signal.sourceQuote || null,
          source_message_id: signal.sourceMessageId || null,
          section: signal.section,
          impact_score: signal.impact,
          signal_metadata: {
            extraction_confidence: signal.confidence || 0.8,
            context: '',
            corroborating_evidence: [],
            contradicts: null,
            follow_up_asked: false,
            follow_up_response_quality: null,
            semantic_tags: [],
            entities_mentioned: [],
            weight_at_extraction: Math.abs(signal.impact) * 3,
            model_used: data.aiModel || 'claude-sonnet-4-20250514',
          },
        }))

        // Try to insert signals (table may not exist yet)
        const { error: signalsError } = await db.applications.insertSignals(signalsToInsert)

        if (signalsError) {
          // Log but don't fail - signals table may not exist yet
          console.warn('Could not save signals (table may not exist):', signalsError.message)
        }
      }

      return NextResponse.json({
        success: true,
        applicationId,
        action: 'complete',
        message: 'Interview saved successfully',
        signalsSaved: data.signals?.length || 0,
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - Fetch interview data for an application
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: applicationId } = await params

    // If Supabase is not configured, return empty response
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        applicationId,
        interview_started_at: null,
        interview_completed_at: null,
        interview_transcript: null,
      })
    }

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const db = createDb({ type: 'supabase-client', client: supabase })

    // Fetch application with interview data
    const { data: application, error } = await db.applications.getByIdWithFields(
      applicationId,
      'id, user_id, status, interview_started_at, interview_completed_at, interview_transcript'
    )

    if (error || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Check if user owns this application or is a partner
    const { data: userProfile } = await db.users.getUserType(user.id)

    const isOwner = (application as any).user_id === user.id
    const isPartner = userProfile?.user_type === 'partner'

    if (!isOwner && !isPartner) {
      return NextResponse.json(
        { error: 'You do not have permission to access this application' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      applicationId: (application as any).id,
      status: (application as any).status,
      interview_started_at: (application as any).interview_started_at,
      interview_completed_at: (application as any).interview_completed_at,
      interview_transcript: (application as any).interview_transcript,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
