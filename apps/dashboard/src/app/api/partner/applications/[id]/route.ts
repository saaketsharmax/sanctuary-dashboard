// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY API — Partner Application Detail
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/partner/applications/[id]
 * Get full application details for partner review
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        application: getMockApplication(id),
        isMock: true,
      })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({
        success: true,
        application: getMockApplication(id),
        isMock: true,
      })
    }

    // Check if user is a partner
    const { data: profile } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (profile?.user_type !== 'partner') {
      return NextResponse.json(
        { error: 'Only partners can view application details' },
        { status: 403 }
      )
    }

    // Fetch full application
    const { data: application, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Format for frontend
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
      // Interview data
      interviewTranscript: application.interview_transcript || [],
      interviewCompletedAt: application.interview_completed_at,
      // Assessment data
      aiAssessment: application.ai_assessment,
      aiScore: application.ai_score,
      assessmentCompletedAt: application.assessment_completed_at,
      // Programme data
      proposedProgramme: application.proposed_programme,
      // Research data
      researchData: application.research_data,
      researchCompletedAt: application.research_completed_at,
      // Memo data
      memoData: application.memo_data,
      memoGeneratedAt: application.memo_generated_at,
      // Metadata
      applicationMetadata: application.application_metadata,
    }

    return NextResponse.json({
      success: true,
      application: formattedApplication,
      isMock: false,
    })
  } catch (error) {
    console.error('Partner application detail API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/partner/applications/[id]
 * Update application status (approve/reject)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a partner
    const { data: profile } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (profile?.user_type !== 'partner') {
      return NextResponse.json(
        { error: 'Only partners can update applications' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action, notes } = body

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected'

    const { data: updated, error: updateError } = await supabase
      .from('applications')
      .update({
        status: newStatus,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_notes: notes || null,
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      application: updated,
    })
  } catch (error) {
    console.error('Partner application update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getMockApplication(id: string) {
  return {
    id,
    status: 'submitted',
    companyName: 'Demo Startup',
    companyOneLiner: 'A demo startup for testing',
    companyWebsite: 'https://demo.com',
    companyDescription: 'This is a demo startup for testing the platform.',
    problemDescription: 'Demo problem that needs solving.',
    targetCustomer: 'Demo target customers.',
    solutionDescription: 'Demo solution description.',
    stage: 'mvp',
    userCount: 50,
    mrr: 2000,
    biggestChallenge: 'Demo challenge.',
    whySanctuary: 'Demo reason for Sanctuary.',
    whatTheyWant: 'Demo expectations.',
    founders: [
      {
        name: 'Demo Founder',
        email: 'demo@example.com',
        role: 'CEO',
        isLead: true,
        linkedin: 'https://linkedin.com/in/demo',
        yearsExperience: 5,
        hasStartedBefore: true,
      }
    ],
    submittedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    interviewTranscript: [],
    interviewCompletedAt: null,
    aiAssessment: null,
    aiScore: null,
    assessmentCompletedAt: null,
    proposedProgramme: null,
    researchData: null,
    researchCompletedAt: null,
    memoData: null,
    memoGeneratedAt: null,
    applicationMetadata: null,
  }
}
