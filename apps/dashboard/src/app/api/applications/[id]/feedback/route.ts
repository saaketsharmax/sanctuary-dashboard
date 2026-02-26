// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY API — Partner Assessment Feedback Endpoint
// POST: Submit partner feedback on AI assessment
// GET: Retrieve existing feedback for an application
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/applications/[id]/feedback
 * Submit partner assessment feedback
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const body = await request.json()
  const {
    agrees_with_recommendation,
    agrees_with_founder_score,
    agrees_with_problem_score,
    agrees_with_user_value_score,
    agrees_with_execution_score,
    adjusted_founder_score,
    adjusted_problem_score,
    adjusted_user_value_score,
    adjusted_execution_score,
    what_ai_missed,
    what_ai_overweighted,
    additional_notes,
    partner_id,
  } = body

  if (agrees_with_recommendation === undefined) {
    return NextResponse.json(
      { error: 'Missing required field: agrees_with_recommendation' },
      { status: 400 },
    )
  }

  const supabase = createAdminClient()

  // Verify application exists
  const { data: application, error: appError } = await supabase
    .from('applications')
    .select('id')
    .eq('id', id)
    .single()

  if (appError || !application) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  // Insert feedback
  const { data: feedback, error: insertError } = await supabase
    .from('assessment_feedback')
    .insert({
      application_id: id,
      partner_id: partner_id || null,
      agrees_with_recommendation,
      agrees_with_founder_score: agrees_with_founder_score ?? true,
      agrees_with_problem_score: agrees_with_problem_score ?? true,
      agrees_with_user_value_score: agrees_with_user_value_score ?? true,
      agrees_with_execution_score: agrees_with_execution_score ?? true,
      adjusted_founder_score: adjusted_founder_score ?? null,
      adjusted_problem_score: adjusted_problem_score ?? null,
      adjusted_user_value_score: adjusted_user_value_score ?? null,
      adjusted_execution_score: adjusted_execution_score ?? null,
      what_ai_missed: what_ai_missed || null,
      what_ai_overweighted: what_ai_overweighted || null,
      feedback_metadata: {
        additional_notes: additional_notes || null,
        submitted_at: new Date().toISOString(),
      },
    })
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ error: 'Failed to save feedback: ' + insertError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, feedback })
}

/**
 * GET /api/applications/[id]/feedback
 * Retrieve existing feedback for an application
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const supabase = createAdminClient()

  const { data: feedback, error } = await supabase
    .from('assessment_feedback')
    .select('*')
    .eq('application_id', id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ feedback: feedback || [] })
}
