// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY API — Research Endpoint
// Triggers research agent and stores results
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { createDb } from '@sanctuary/database'
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
    const db = createDb({ type: 'supabase-client', client: supabase })

    // Fetch application with research data
    const { data: application, error } = await db.applications.getByIdWithFields(
      id,
      'id, research_data, research_completed_at'
    )

    if (error || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    if ((application as any).research_data) {
      return NextResponse.json({
        success: true,
        research: (application as any).research_data,
        completedAt: (application as any).research_completed_at,
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
    const db = createDb({ type: 'supabase-client', client: supabase })

    // Fetch application
    const { data: application, error } = await db.applications.getById(id)

    if (error || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Check if research already exists
    if ((application as any).research_data) {
      const body = await request.json().catch(() => ({}))
      if (!body.force) {
        return NextResponse.json({
          success: true,
          research: (application as any).research_data,
          completedAt: (application as any).research_completed_at,
          message: 'Research already exists. Use force=true to regenerate.',
        })
      }
    }

    // Format application for research agent - cast to any to allow partial data
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
      userCount: (application as any).user_count || 0,
      mrr: (application as any).mrr || 0,
      biggestChallenge: (application as any).biggest_challenge,
      whySanctuary: (application as any).why_sanctuary,
      whatTheyWant: (application as any).what_they_want,
      founders: (application as any).founders || [],
      submittedAt: (application as any).submitted_at,
      createdAt: (application as any).created_at,
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
    const { error: updateError } = await db.applications.update(id, {
      research_data: result.research,
      research_completed_at: completedAt,
    })

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
