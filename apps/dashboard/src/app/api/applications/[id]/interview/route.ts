import { NextRequest, NextResponse } from 'next/server'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { z } from 'zod'

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

// Validation schema for starting an interview
const startInterviewSchema = z.object({
  action: z.literal('start'),
})

// Validation schema for completing an interview
const completeInterviewSchema = z.object({
  action: z.literal('complete'),
  transcript: z.array(messageSchema),
  startedAt: z.string(),
  completedAt: z.string(),
  durationMinutes: z.number(),
  aiModel: z.string().optional(),
})

// Combined schema with discriminated union
const interviewActionSchema = z.discriminatedUnion('action', [
  startInterviewSchema,
  completeInterviewSchema,
])

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

    // Verify the user owns this application
    const { data: application, error: fetchError } = await supabase
      .from('applications')
      .select('id, user_id, status')
      .eq('id', applicationId)
      .single()

    if (fetchError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    if (application.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to access this application' },
        { status: 403 }
      )
    }

    if (data.action === 'start') {
      // Update application to mark interview as started
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          status: 'interviewing',
          interview_started_at: new Date().toISOString(),
        })
        .eq('id', applicationId)

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
      // Save the completed interview
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          status: 'under_review',
          interview_completed_at: data.completedAt,
          interview_transcript: data.transcript,
        })
        .eq('id', applicationId)

      if (updateError) {
        console.error('Database error:', updateError)
        return NextResponse.json(
          { error: 'Failed to save interview', details: updateError.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        applicationId,
        action: 'complete',
        message: 'Interview saved successfully',
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

    // Fetch application with interview data
    const { data: application, error } = await supabase
      .from('applications')
      .select('id, user_id, status, interview_started_at, interview_completed_at, interview_transcript')
      .eq('id', applicationId)
      .single()

    if (error || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Check if user owns this application or is a partner
    const { data: userProfile } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', user.id)
      .single()

    const isOwner = application.user_id === user.id
    const isPartner = userProfile?.user_type === 'partner'

    if (!isOwner && !isPartner) {
      return NextResponse.json(
        { error: 'You do not have permission to access this application' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      applicationId: application.id,
      status: application.status,
      interview_started_at: application.interview_started_at,
      interview_completed_at: application.interview_completed_at,
      interview_transcript: application.interview_transcript,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
