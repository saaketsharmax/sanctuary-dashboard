// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY API — Research Endpoint
// Triggers research agent and stores results
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { getResearchAgent } from '@/lib/ai/agents/research-agent'
import type { ResearchOutput } from '@/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/applications/[id]/research
 * Retrieve existing research results
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    )
  }

  try {
    const supabase = await createClient()

    // Fetch application with research data
    const { data: application, error } = await supabase
      .from('applications')
      .select('id, research_data, research_completed_at')
      .eq('id', id)
      .single()

    if (error || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    if (application.research_data) {
      return NextResponse.json({
        success: true,
        research: application.research_data,
        completedAt: application.research_completed_at,
      })
    }

    return NextResponse.json({
      success: true,
      research: null,
      message: 'No research data available. POST to this endpoint to trigger research.',
    })
  } catch (error) {
    console.error('Research GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/applications/[id]/research
 * Trigger research agent for an application
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    )
  }

  try {
    const supabase = await createClient()

    // Fetch application
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

    // Check if research already exists
    if (application.research_data) {
      const body = await request.json().catch(() => ({}))
      if (!body.force) {
        return NextResponse.json({
          success: true,
          research: application.research_data,
          completedAt: application.research_completed_at,
          message: 'Research already exists. Use force=true to regenerate.',
        })
      }
    }

    // Format application for research agent - cast to any to allow partial data
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
      userCount: application.user_count || 0,
      mrr: application.mrr || 0,
      biggestChallenge: application.biggest_challenge,
      whySanctuary: application.why_sanctuary,
      whatTheyWant: application.what_they_want,
      founders: application.founders || [],
      submittedAt: application.submitted_at,
      createdAt: application.created_at,
    }

    // Run research agent
    const agent = getResearchAgent()
    const result = await agent.runResearch({ application: formattedApplication as any })

    if (!result.success || !result.research) {
      return NextResponse.json(
        {
          error: 'Research failed',
          details: result.error,
        },
        { status: 500 }
      )
    }

    // Store in database
    const completedAt = new Date().toISOString()
    const { error: updateError } = await supabase
      .from('applications')
      .update({
        research_data: result.research,
        research_completed_at: completedAt,
      })
      .eq('id', id)

    if (updateError) {
      console.error('Research update error:', updateError)
    }

    return NextResponse.json({
      success: true,
      research: result.research,
      completedAt,
      metadata: result.metadata,
    })
  } catch (error) {
    console.error('Research API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
