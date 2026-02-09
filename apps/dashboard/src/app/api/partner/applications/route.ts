// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY API — Partner Applications List
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'

/**
 * GET /api/partner/applications
 * Get all applications for partner review
 */
export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        applications: [],
        message: 'Database not configured',
      })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        applications: [],
        error: 'Not authenticated',
      }, { status: 401 })
    }

    // Check if user is a partner
    const { data: profile } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (profile?.user_type !== 'partner') {
      return NextResponse.json(
        { success: false, error: 'Only partners can view applications', applications: [] },
        { status: 403 }
      )
    }

    // Fetch all applications
    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        id,
        status,
        company_name,
        company_one_liner,
        company_website,
        stage,
        user_count,
        mrr,
        founders,
        submitted_at,
        created_at,
        interview_completed_at,
        assessment_completed_at,
        ai_score
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Applications fetch error:', error)
      return NextResponse.json({
        success: false,
        applications: [],
        error: 'Failed to fetch applications',
      }, { status: 500 })
    }

    // Format for frontend
    interface ApplicationRecord {
      id: string
      status: string
      company_name: string
      company_one_liner: string
      company_website: string | null
      stage: string
      user_count: number
      mrr: number
      founders: Array<{
        name: string
        email: string
        role?: string
        isLead: boolean
        linkedin?: string
        yearsExperience?: number
        hasStartedBefore: boolean
      }>
      submitted_at: string | null
      created_at: string
      interview_completed_at: string | null
      assessment_completed_at: string | null
      ai_score: number | null
    }

    const formattedApplications = (applications || []).map((app: ApplicationRecord) => ({
      id: app.id,
      status: app.status,
      companyName: app.company_name,
      companyOneLiner: app.company_one_liner,
      companyWebsite: app.company_website,
      stage: app.stage,
      userCount: app.user_count,
      mrr: app.mrr,
      founders: app.founders || [],
      submittedAt: app.submitted_at,
      createdAt: app.created_at,
      interviewCompletedAt: app.interview_completed_at,
      assessmentCompletedAt: app.assessment_completed_at,
      aiScore: app.ai_score,
    }))

    return NextResponse.json({
      success: true,
      applications: formattedApplications,
    })
  } catch (error) {
    console.error('Partner applications API error:', error)
    return NextResponse.json({
      success: false,
      applications: [],
      error: 'Internal server error',
    }, { status: 500 })
  }
}
