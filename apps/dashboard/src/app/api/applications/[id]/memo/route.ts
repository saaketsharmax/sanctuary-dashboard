// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY API — Memo Generation Endpoint
// Generates and stores startup memos
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { createDb } from '@sanctuary/database'
import { getMemoGenerator } from '@/lib/ai/agents/memo-generator'
import type { StartupMemo } from '@/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/applications/[id]/memo
 * Retrieve existing memo
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        memo: null,
        message: 'Demo mode - no memo available',
      })
    }

    const supabase = await createClient()
    const db = createDb({ type: 'supabase-client', client: supabase })

    // Get application with memo data
    const { data: application, error } = await db.applications.getByIdWithFields(
      id,
      'id, memo_data, memo_generated_at'
    )

    if (error || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      memo: (application as any).memo_data,
      generatedAt: (application as any).memo_generated_at,
    })
  } catch (error) {
    console.error('Memo GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/applications/[id]/memo
 * Generate a startup memo
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const db = createDb({ type: 'supabase-client', client: supabase })

    // Check if user is a partner
    const { data: profile } = await db.users.getUserType(user.id)

    if (profile?.user_type !== 'partner') {
      return NextResponse.json(
        { error: 'Only partners can generate memos' },
        { status: 403 }
      )
    }

    // Get full application data
    const { data: application, error: appError } = await db.applications.getById(id)

    if (appError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Check if memo already exists
    const body = await request.json().catch(() => ({}))
    if ((application as any).memo_data && !body.force) {
      return NextResponse.json({
        success: true,
        memo: (application as any).memo_data,
        generatedAt: (application as any).memo_generated_at,
        message: 'Memo already exists. Use force=true to regenerate.',
      })
    }

    // Format data for memo generator (cast to any to avoid complex type issues)
    const formattedApplication = {
      id: (application as any).id,
      status: (application as any).status,
      companyName: (application as any).company_name,
      companyOneLiner: (application as any).company_one_liner,
      companyWebsite: (application as any).company_website,
      companyDescription: (application as any).company_description,
      problemDescription: (application as any).problem_description,
      targetCustomer: (application as any).target_customer,
      solutionDescription: (application as any).solution_description,
      stage: (application as any).stage,
      userCount: (application as any).user_count,
      mrr: (application as any).mrr,
      biggestChallenge: (application as any).biggest_challenge,
      whySanctuary: (application as any).why_sanctuary,
      whatTheyWant: (application as any).what_they_want,
      founders: (application as any).founders || [],
      submittedAt: (application as any).submitted_at,
      createdAt: (application as any).created_at,
      updatedAt: (application as any).submitted_at || (application as any).created_at,
      interviewScheduledAt: (application as any).interview_completed_at,
      interviewCompletedAt: (application as any).interview_completed_at,
    } as any

    // Get interview data (cast to any to avoid complex type issues)
    const interview = (application as any).interview_transcript?.length > 0 ? {
      id: `${id}-interview`,
      applicationId: id,
      status: 'completed',
      completedAt: (application as any).interview_completed_at,
      currentSection: 'completed',
      startedAt: (application as any).created_at,
      durationMinutes: 30,
      aiModel: 'claude-3-5-sonnet',
      signals: [],
      metadata: {},
    } as any : null

    const messages = (application as any).interview_transcript || []

    // Get assessment data
    const assessment = (application as any).ai_assessment || null

    // Get research data
    const research = (application as any).research_data || null

    // Generate memo
    const generator = getMemoGenerator()
    const result = await generator.generateMemo({
      application: formattedApplication,
      interview,
      messages,
      assessment,
      research,
    } as any)

    if (!result.success || !result.memo) {
      return NextResponse.json(
        {
          error: 'Memo generation failed',
          details: result.error,
        },
        { status: 500 }
      )
    }

    // Save memo to database
    const generatedAt = new Date().toISOString()
    const { error: updateError } = await db.applications.update(id, {
      memo_data: result.memo,
      memo_generated_at: generatedAt,
    })

    if (updateError) {
      console.error('Failed to save memo:', updateError)
      // Still return the memo even if save failed
    }

    return NextResponse.json({
      success: true,
      memo: result.memo,
      generatedAt,
      metadata: result.metadata,
    })
  } catch (error) {
    console.error('Memo API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
