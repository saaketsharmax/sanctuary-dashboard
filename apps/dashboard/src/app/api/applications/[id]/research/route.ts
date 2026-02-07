// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY API — Research Endpoint
// Triggers research agent and stores results
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { getResearchAgent } from '@/lib/ai/agents/research-agent'
import { getApplicationWithFounders } from '@/lib/mock-data/onboarding'
import type { ResearchOutput } from '@/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

// In-memory storage for demo (would be Supabase in production)
const researchCache = new Map<string, { data: ResearchOutput; completedAt: string }>()

/**
 * GET /api/applications/[id]/research
 * Retrieve existing research results
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  // Check cache
  const cached = researchCache.get(id)
  if (cached) {
    return NextResponse.json({
      success: true,
      research: cached.data,
      completedAt: cached.completedAt,
    })
  }

  // Get application to check if it exists
  const application = getApplicationWithFounders(id)
  if (!application) {
    return NextResponse.json(
      { error: 'Application not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    research: null,
    message: 'No research data available. POST to this endpoint to trigger research.',
  })
}

/**
 * POST /api/applications/[id]/research
 * Trigger research agent for an application
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  // Get application with founders
  const application = getApplicationWithFounders(id)
  if (!application) {
    return NextResponse.json(
      { error: 'Application not found' },
      { status: 404 }
    )
  }

  // Check if research already exists
  const cached = researchCache.get(id)
  if (cached) {
    // Check if force refresh is requested
    const body = await request.json().catch(() => ({}))
    if (!body.force) {
      return NextResponse.json({
        success: true,
        research: cached.data,
        completedAt: cached.completedAt,
        message: 'Research already exists. Use force=true to regenerate.',
      })
    }
  }

  try {
    // Run research agent
    const agent = getResearchAgent()
    const result = await agent.runResearch({ application })

    if (!result.success || !result.research) {
      return NextResponse.json(
        {
          error: 'Research failed',
          details: result.error,
        },
        { status: 500 }
      )
    }

    // Store in cache (would be Supabase in production)
    const completedAt = new Date().toISOString()
    researchCache.set(id, {
      data: result.research,
      completedAt,
    })

    // In production, this would update the application record in Supabase:
    // await supabase
    //   .from('applications')
    //   .update({
    //     research_data: result.research,
    //     research_completed_at: completedAt,
    //   })
    //   .eq('id', id)

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
