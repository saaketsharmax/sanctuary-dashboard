// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY API — Founder Progress Endpoint
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createDb } from '@sanctuary/database'

/**
 * GET /api/founder/progress
 * Get checkpoints and partner feedback for the founder's startup
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json({
        success: true,
        ...getEmptyProgressData(),
        isMock: true,
      })
    }

    const db = createDb({ type: 'supabase-client', client: supabase })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({
        success: true,
        ...getEmptyProgressData(),
        isMock: true,
      })
    }

    // Get user's startup_id
    const { data: profile } = await db.users.getById(user.id)

    if (!profile?.startup_id) {
      return NextResponse.json({
        success: true,
        ...getEmptyProgressData(),
        isMock: true,
      })
    }

    // Get checkpoints
    const { data: checkpoints, error: checkpointsError } = await db.startups.getCheckpoints(profile.startup_id)

    if (checkpointsError) {
      console.error('Checkpoints fetch error:', checkpointsError)
    }

    // Get partner feedback
    const { data: feedback, error: feedbackError } = await db.startups.getPartnerFeedback(profile.startup_id, {
      visibleToFounder: true,
      limit: 10,
    })

    if (feedbackError) {
      console.error('Feedback fetch error:', feedbackError)
    }

    // Get startup stage info
    const { data: startup } = await db.startups.getById(profile.startup_id)

    // Format checkpoints
    interface CheckpointRecord {
      id: string
      name: string
      description: string | null
      status: string
      due_date: string
      completed_at: string | null
      notes: string | null
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedCheckpoints = (checkpoints || []).map((cp: any) => ({
      id: cp.id,
      name: cp.name,
      description: cp.description,
      status: cp.status,
      dueDate: cp.due_date,
      completedAt: cp.completed_at,
      notes: cp.notes,
    }))

    // Calculate progress
    const completed = formattedCheckpoints.filter((cp: { status: string }) => cp.status === 'completed').length
    const total = formattedCheckpoints.length
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0

    // Format feedback
    interface FeedbackRecord {
      id: string
      message: string
      feedback_type: string
      created_at: string
      from_name: string
      checkpoint_id: string | null
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedFeedback = (feedback || []).map((fb: any) => ({
      id: fb.id,
      message: fb.message,
      type: fb.feedback_type,
      date: fb.created_at,
      from: fb.from_name,
      checkpointId: fb.checkpoint_id,
    }))

    return NextResponse.json({
      success: true,
      checkpoints: formattedCheckpoints,
      feedback: formattedFeedback,
      progress: {
        completed,
        total,
        percent: progressPercent,
      },
      stage: startup?.stage || 'unknown',
      programmeStart: startup?.residency_start,
      programmeEnd: startup?.residency_end,
      isMock: false,
    })
  } catch (error) {
    console.error('Founder progress API error:', error)
    return NextResponse.json({
      success: true,
      ...getEmptyProgressData(),
      isMock: true,
    })
  }
}

/**
 * PATCH /api/founder/progress
 * Update a checkpoint (add notes, mark complete)
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const db = createDb({ type: 'supabase-client', client: supabase })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { checkpointId, notes, status } = body

    if (!checkpointId) {
      return NextResponse.json({ error: 'Checkpoint ID required' }, { status: 400 })
    }

    // Get user's startup_id
    const { data: profile } = await db.users.getById(user.id)

    if (!profile?.startup_id) {
      return NextResponse.json({ error: 'No startup found' }, { status: 404 })
    }

    // Verify checkpoint belongs to startup
    const { data: checkpoint } = await db.startups.getCheckpointById(checkpointId, profile.startup_id)

    if (!checkpoint) {
      return NextResponse.json({ error: 'Checkpoint not found' }, { status: 404 })
    }

    // Build update object
    const updates: Record<string, any> = {}
    if (notes !== undefined) updates.notes = notes
    if (status !== undefined) {
      updates.status = status
      if (status === 'completed') {
        updates.completed_at = new Date().toISOString()
      }
    }

    // Update checkpoint
    const { data: updated, error: updateError } = await db.startups.updateCheckpoint(checkpointId, updates)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, checkpoint: updated })
  } catch (error) {
    console.error('Update checkpoint error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getEmptyProgressData() {
  return {
    checkpoints: [],
    feedback: [],
    progress: {
      completed: 0,
      total: 0,
      percent: 0,
    },
    stage: null,
    programmeStart: null,
    programmeEnd: null,
  }
}
