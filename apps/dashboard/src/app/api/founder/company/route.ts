// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY API — Founder Company Endpoint
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createDb } from '@sanctuary/database'

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

    const db = createDb({ type: 'supabase-client', client: supabase })

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
    const { data: profile } = await db.users.getById(user.id)

    if (!profile?.startup_id) {
      // User might be in application phase, get from applications
      const { data: application } = await db.applications.getByUserId(user.id)

      const singleApplication = Array.isArray(application) ? application[0] : application

      if (singleApplication) {
        return NextResponse.json({
          success: true,
          company: {
            id: singleApplication.id,
            name: singleApplication.company_name,
            oneLiner: singleApplication.company_one_liner,
            description: singleApplication.company_description,
            website: singleApplication.company_website,
            problem: singleApplication.problem_description,
            solution: singleApplication.solution_description,
            targetCustomer: singleApplication.target_customer,
            stage: singleApplication.stage || 'applied',
            industry: 'Not specified',
            location: 'Not specified',
            founded: new Date(singleApplication.created_at).getFullYear().toString(),
            metrics: {
              users: singleApplication.user_count || 0,
              mrr: singleApplication.mrr || 0,
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
    const { data: startup, error: startupError } = await db.startups.getByIdWithCohort(profile.startup_id)

    if (startupError || !startup) {
      return NextResponse.json({
        success: true,
        company: getEmptyCompanyData(),
        isMock: true,
      })
    }

    // Get latest metrics
    const { data: latestMetrics } = await db.startups.getLatestMetrics(profile.startup_id)

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

    const db = createDb({ type: 'supabase-client', client: supabase })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Get user's startup_id
    const { data: profile } = await db.users.getById(user.id)

    if (!profile?.startup_id) {
      return NextResponse.json({ error: 'No startup found' }, { status: 404 })
    }

    // Update startup
    const { data: updated, error: updateError } = await db.startups.update(profile.startup_id, {
      name: body.name,
      one_liner: body.oneLiner,
      description: body.description,
      website: body.website,
      problem_statement: body.problem,
      solution_description: body.solution,
      target_customer: body.targetCustomer,
      updated_at: new Date().toISOString(),
    })

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
