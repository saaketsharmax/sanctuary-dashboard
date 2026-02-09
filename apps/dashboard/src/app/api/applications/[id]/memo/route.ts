// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY API — Memo Generation Endpoint
// Generates and stores startup memos
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
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

    // Get application with memo data
    const { data: application, error } = await supabase
      .from('applications')
      .select('id, memo_data, memo_generated_at')
      .eq('id', id)
      .single()

    if (error || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      memo: application.memo_data,
      generatedAt: application.memo_generated_at,
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

    // Check if user is a partner
    const { data: profile } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (profile?.user_type !== 'partner') {
      return NextResponse.json(
        { error: 'Only partners can generate memos' },
        { status: 403 }
      )
    }

    // Get full application data
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .single()

    if (appError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Check if memo already exists
    const body = await request.json().catch(() => ({}))
    if (application.memo_data && !body.force) {
      return NextResponse.json({
        success: true,
        memo: application.memo_data,
        generatedAt: application.memo_generated_at,
        message: 'Memo already exists. Use force=true to regenerate.',
      })
    }

    // Format data for memo generator (cast to any to avoid complex type issues)
    const formattedApplication = {
      id: application.id,
      status: application.status,
      companyName: application.company_name,
      companyOneLiner: application.company_one_liner,
      companyWebsite: application.company_website,
      companyDescription: application.company_description,
      problemDescription: application.problem_description,
      targetCustomer: application.target_customer,
      solutionDescription: application.solution_description,
      stage: application.stage,
      userCount: application.user_count,
      mrr: application.mrr,
      biggestChallenge: application.biggest_challenge,
      whySanctuary: application.why_sanctuary,
      whatTheyWant: application.what_they_want,
      founders: application.founders || [],
      submittedAt: application.submitted_at,
      createdAt: application.created_at,
      updatedAt: application.submitted_at || application.created_at,
      interviewScheduledAt: application.interview_completed_at,
      interviewCompletedAt: application.interview_completed_at,
    } as any

    // Get interview data (cast to any to avoid complex type issues)
    const interview = application.interview_transcript?.length > 0 ? {
      id: `${id}-interview`,
      applicationId: id,
      status: 'completed',
      completedAt: application.interview_completed_at,
      currentSection: 'completed',
      startedAt: application.created_at,
      durationMinutes: 30,
      aiModel: 'claude-3-5-sonnet',
      signals: [],
      metadata: {},
    } as any : null

    const messages = application.interview_transcript || []

    // Get assessment data
    const assessment = application.ai_assessment || null

    // Get research data
    const research = application.research_data || null

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
    const { error: updateError } = await supabase
      .from('applications')
      .update({
        memo_data: result.memo,
        memo_generated_at: generatedAt,
      })
      .eq('id', id)

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
