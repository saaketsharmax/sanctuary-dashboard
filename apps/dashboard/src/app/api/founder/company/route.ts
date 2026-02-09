// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY API — Founder Company Endpoint
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/founder/company
 * Get the founder's company/startup data
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if Supabase is configured
    if (!supabase) {
      return NextResponse.json({
        success: true,
        company: getEmptyCompanyData(),
        isMock: true,
      })
    }

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({
        success: true,
        company: getEmptyCompanyData(),
        isMock: true,
      })
    }

    // Get user profile with startup_id
    const { data: profile } = await supabase
      .from('users')
      .select('startup_id')
      .eq('id', user.id)
      .single()

    if (!profile?.startup_id) {
      // User might be in application phase, get from applications
      const { data: application } = await supabase
        .from('applications')
        .select('*')
        .eq('id', user.id)
        .single()

      if (application) {
        return NextResponse.json({
          success: true,
          company: {
            id: application.id,
            name: application.company_name,
            oneLiner: application.company_one_liner,
            description: application.company_description,
            website: application.company_website,
            problem: application.problem_description,
            solution: application.solution_description,
            targetCustomer: application.target_customer,
            stage: application.stage || 'applied',
            industry: 'Not specified',
            location: 'Not specified',
            founded: new Date(application.created_at).getFullYear().toString(),
            metrics: {
              users: application.user_count || 0,
              mrr: application.mrr || 0,
            },
            isApplication: true,
          },
          isMock: false,
        })
      }

      return NextResponse.json({
        success: true,
        company: getEmptyCompanyData(),
        isMock: true,
      })
    }

    // Get startup data
    const { data: startup, error: startupError } = await supabase
      .from('startups')
      .select(`
        *,
        cohorts (name, start_date, end_date)
      `)
      .eq('id', profile.startup_id)
      .single()

    if (startupError || !startup) {
      return NextResponse.json({
        success: true,
        company: getEmptyCompanyData(),
        isMock: true,
      })
    }

    // Get latest metrics
    const { data: latestMetrics } = await supabase
      .from('metrics')
      .select('*')
      .eq('startup_id', profile.startup_id)
      .order('date', { ascending: false })
      .limit(1)
      .single()

    return NextResponse.json({
      success: true,
      company: {
        id: startup.id,
        name: startup.name,
        oneLiner: startup.one_liner,
        description: startup.description,
        website: startup.website,
        problem: startup.problem_statement,
        solution: startup.solution_description,
        targetCustomer: startup.target_customer,
        stage: startup.stage,
        industry: startup.industry,
        location: startup.city ? `${startup.city}, ${startup.country}` : startup.country,
        founded: startup.founded_date ? new Date(startup.founded_date).getFullYear().toString() : 'Unknown',
        logoUrl: startup.logo_url,
        cohort: startup.cohorts?.name,
        status: startup.status,
        metrics: latestMetrics ? {
          users: latestMetrics.active_users || latestMetrics.total_users || 0,
          mrr: latestMetrics.mrr || 0,
          retention: latestMetrics.churn_rate ? 100 - latestMetrics.churn_rate : null,
          nps: latestMetrics.nps_score,
        } : null,
      },
      isMock: false,
    })
  } catch (error) {
    console.error('Founder company API error:', error)
    return NextResponse.json({
      success: true,
      company: getEmptyCompanyData(),
      isMock: true,
    })
  }
}

/**
 * PATCH /api/founder/company
 * Update company data
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

    // Get user's startup_id
    const { data: profile } = await supabase
      .from('users')
      .select('startup_id')
      .eq('id', user.id)
      .single()

    if (!profile?.startup_id) {
      return NextResponse.json({ error: 'No startup found' }, { status: 404 })
    }

    // Update startup
    const { data: updated, error: updateError } = await supabase
      .from('startups')
      .update({
        name: body.name,
        one_liner: body.oneLiner,
        description: body.description,
        website: body.website,
        problem_statement: body.problem,
        solution_description: body.solution,
        target_customer: body.targetCustomer,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.startup_id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, company: updated })
  } catch (error) {
    console.error('Update company error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getEmptyCompanyData() {
  return null
}
