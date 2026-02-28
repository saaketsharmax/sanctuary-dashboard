// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY API — Application Decision Endpoint
// POST: Partner approve/reject decision with auto startup creation
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { isSupabaseConfigured } from '@/lib/supabase/server'
import { createDb } from '@sanctuary/database'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/applications/[id]/decision
 * Handle partner approve/reject decisions
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const body = await request.json()
  const { decision, notes, conditions } = body as {
    decision: 'approved' | 'rejected'
    notes?: string
    conditions?: string[]
  }

  if (!decision || !['approved', 'rejected'].includes(decision)) {
    return NextResponse.json(
      { error: 'Invalid decision. Must be "approved" or "rejected".' },
      { status: 400 },
    )
  }

  const db = createDb({ type: 'admin' })

  // 1. Fetch the application
  const { data: application, error: appError } = await db.applications.getById(id)

  if (appError || !application) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  if (['approved', 'rejected'].includes((application as any).status)) {
    return NextResponse.json(
      { error: `Application already ${(application as any).status}` },
      { status: 400 },
    )
  }

  // 2. Update application status
  const now = new Date().toISOString()
  const { error: updateError } = await db.applications.update(id, {
    status: decision,
    review_decision: decision,
    reviewed_at: now,
    decision_made_at: now,
    decision_notes: notes || null,
    review_metadata: {
      conditions: conditions || [],
      decided_at: now,
    },
  })

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update application: ' + updateError.message }, { status: 500 })
  }

  let startup = null

  // 3. On approval: auto-create startup + link founder + allocate investment
  if (decision === 'approved') {
    // Determine starting stage from assessment
    const assessment = (application as any).ai_assessment
    const startingStage = assessment?.startingStage || 'problem_discovery'

    // Create startup record
    const { data: newStartup, error: startupError } = await db.startups.create({
      name: (application as any).company_name,
      one_liner: (application as any).company_one_liner,
      website: (application as any).company_website,
      description: (application as any).solution_description,
      industry: (application as any).target_customer,
      stage: startingStage,
      status: 'active',
      application_id: id,
      founder_score: assessment?.founderScore || null,
      problem_score: assessment?.problemScore || null,
      user_value_score: assessment?.userValueScore || null,
      execution_score: assessment?.executionScore || null,
      overall_score: (application as any).ai_score || null,
    })

    if (startupError) {
      console.error('Failed to create startup:', startupError)
    } else {
      startup = newStartup

      // Link founder to startup
      if ((application as any).user_id) {
        await db.users.update((application as any).user_id, {
          startup_id: (newStartup as any).id,
        })
      }

      // Auto-allocate investment: $50k cash + $50k credits
      await db.investments.create({
        application_id: id,
        startup_id: (newStartup as any).id,
        cash_total: 50000,
        cash_disbursed: 0,
        credits_total: 50000,
        credits_used: 0,
        status: 'active',
      })
    }
  }

  return NextResponse.json({
    success: true,
    application: { id, status: decision, decision_made_at: now },
    startup: startup ? { id: (startup as any).id, name: (startup as any).name } : null,
    message: decision === 'approved'
      ? `Application approved. Startup "${(application as any).company_name}" created with $50k cash + $50k credits.`
      : `Application rejected.${notes ? ' Notes: ' + notes : ''}`,
  })
}
