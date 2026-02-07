// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY API — Founder Progress Endpoint
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
        ...getMockProgressData(),
        isMock: true,
      })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({
        success: true,
        ...getMockProgressData(),
        isMock: true,
      })
    }

    // Get user's startup_id
    const { data: profile } = await supabase
      .from('users')
      .select('startup_id')
      .eq('id', user.id)
      .single()

    if (!profile?.startup_id) {
      return NextResponse.json({
        success: true,
        ...getMockProgressData(),
        isMock: true,
      })
    }

    // Get checkpoints
    const { data: checkpoints, error: checkpointsError } = await supabase
      .from('checkpoints')
      .select('*')
      .eq('startup_id', profile.startup_id)
      .order('due_date', { ascending: true })

    if (checkpointsError) {
      console.error('Checkpoints fetch error:', checkpointsError)
    }

    // Get partner feedback
    const { data: feedback, error: feedbackError } = await supabase
      .from('partner_feedback')
      .select(`
        id,
        message,
        feedback_type,
        created_at,
        from_name,
        checkpoint_id
      `)
      .eq('startup_id', profile.startup_id)
      .eq('is_visible_to_founder', true)
      .order('created_at', { ascending: false })
      .limit(10)

    if (feedbackError) {
      console.error('Feedback fetch error:', feedbackError)
    }

    // Get startup stage info
    const { data: startup } = await supabase
      .from('startups')
      .select('stage, residency_start, residency_end')
      .eq('id', profile.startup_id)
      .single()

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
    const formattedCheckpoints = (checkpoints || []).map((cp: CheckpointRecord) => ({
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
    const formattedFeedback = (feedback || []).map((fb: FeedbackRecord) => ({
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
      ...getMockProgressData(),
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
    const { data: profile } = await supabase
      .from('users')
      .select('startup_id')
      .eq('id', user.id)
      .single()

    if (!profile?.startup_id) {
      return NextResponse.json({ error: 'No startup found' }, { status: 404 })
    }

    // Verify checkpoint belongs to startup
    const { data: checkpoint } = await supabase
      .from('checkpoints')
      .select('id')
      .eq('id', checkpointId)
      .eq('startup_id', profile.startup_id)
      .single()

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
    const { data: updated, error: updateError } = await supabase
      .from('checkpoints')
      .update(updates)
      .eq('id', checkpointId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, checkpoint: updated })
  } catch (error) {
    console.error('Update checkpoint error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getMockProgressData() {
  return {
    checkpoints: [
      {
        id: '1',
        name: 'Problem Validation',
        description: 'Validate the core problem with 10+ customer interviews',
        status: 'completed',
        dueDate: '2026-01-15',
        completedAt: '2026-01-14',
        notes: 'Completed 12 interviews. Key insight: users want automation, not just tracking.',
      },
      {
        id: '2',
        name: 'MVP Launch',
        description: 'Launch minimum viable product to beta users',
        status: 'completed',
        dueDate: '2026-01-29',
        completedAt: '2026-01-28',
        notes: 'Launched to 50 beta users. Initial feedback very positive.',
      },
      {
        id: '3',
        name: 'First Revenue',
        description: 'Convert beta users to paying customers',
        status: 'in_progress',
        dueDate: '2026-02-15',
        completedAt: null,
        notes: null,
      },
      {
        id: '4',
        name: 'Product-Market Fit Survey',
        description: 'Run Sean Ellis survey with existing users',
        status: 'pending',
        dueDate: '2026-02-28',
        completedAt: null,
        notes: null,
      },
      {
        id: '5',
        name: 'Series Seed Preparation',
        description: 'Prepare materials for seed fundraise',
        status: 'pending',
        dueDate: '2026-03-15',
        completedAt: null,
        notes: null,
      },
    ],
    feedback: [
      {
        id: '1',
        message: 'Great progress on customer interviews. The insight about automation vs tracking is valuable.',
        type: 'praise',
        date: '2026-01-28T10:00:00Z',
        from: 'Alex Rivera',
        checkpointId: '1',
      },
      {
        id: '2',
        message: 'Consider focusing on a specific vertical for your first paying customers.',
        type: 'general',
        date: '2026-01-25T14:30:00Z',
        from: 'Sarah Chen',
        checkpointId: null,
      },
    ],
    progress: {
      completed: 2,
      total: 5,
      percent: 40,
    },
    stage: 'solution_shaping',
    programmeStart: '2026-01-01',
    programmeEnd: '2026-05-31',
  }
}
