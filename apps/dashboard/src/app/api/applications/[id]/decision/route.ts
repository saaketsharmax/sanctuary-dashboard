// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY API — Application Decision Endpoint
// POST: Partner approve/reject decision with auto startup creation
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { requirePartnerAuth } from '@/lib/api-auth'
import { createDb } from '@sanctuary/database'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

const decisionSchema = z.object({
  decision: z.enum(['approved', 'rejected']),
  notes: z.string().max(5000).optional(),
  conditions: z.array(z.string().max(500)).max(20).optional(),
})

/**
 * POST /api/applications/[id]/decision
 * Handle partner approve/reject decisions
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requirePartnerAuth()
    if (!auth.ok) return auth.response

    const { id } = await params

    const body = await request.json()
    const parsed = decisionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { decision, notes, conditions } = parsed.data

    // Use admin DB for cross-table operations (startup creation, investment allocation)
    const adminDb = createDb({ type: 'admin' })

    // 1. Fetch the application
    const { data: application, error: appError } = await adminDb.applications.getById(id)

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
    const { error: updateError } = await adminDb.applications.update(id, {
      status: decision,
      review_decision: decision,
      reviewed_by: auth.user.id,
      reviewed_at: now,
      decision_made_at: now,
      decision_notes: notes || null,
      review_metadata: {
        conditions: conditions || [],
        decided_at: now,
        decided_by: auth.user.id,
      },
    })

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update application' }, { status: 500 })
    }

    let startup = null

    // 3. On approval: auto-create startup + link founder + allocate investment
    if (decision === 'approved') {
      const assessment = (application as any).ai_assessment
      const startingStage = assessment?.startingStage || 'problem_discovery'

      const { data: newStartup, error: startupError } = await adminDb.startups.create({
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
        console.error('Failed to create startup:', startupError instanceof Error ? startupError.message : 'Unknown error')
      } else {
        startup = newStartup

        // Link founder to startup
        if ((application as any).user_id) {
          await adminDb.users.update((application as any).user_id, {
            startup_id: (newStartup as any).id,
          })
        }

        // Auto-allocate investment: $50k cash + $50k credits
        await adminDb.investments.create({
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
        : `Application rejected.`,
    })
  } catch (error) {
    console.error('Decision error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
