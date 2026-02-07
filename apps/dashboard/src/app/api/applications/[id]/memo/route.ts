// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY API — Memo Generation Endpoint
// Generates and stores startup memos
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { getMemoGenerator } from '@/lib/ai/agents/memo-generator'
import {
  getApplicationWithFounders,
  getInterviewByApplicationId,
  getInterviewMessages,
  getAssessmentByApplicationId,
} from '@/lib/mock-data/onboarding'
import type { StartupMemo, ResearchOutput } from '@/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

// In-memory storage for demo (would be Supabase in production)
const memoCache = new Map<string, { data: StartupMemo; generatedAt: string }>()
const researchCache = new Map<string, { data: ResearchOutput; completedAt: string }>()

/**
 * GET /api/applications/[id]/memo
 * Retrieve existing memo
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  // Check cache
  const cached = memoCache.get(id)
  if (cached) {
    return NextResponse.json({
      success: true,
      memo: cached.data,
      generatedAt: cached.generatedAt,
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
    memo: null,
    message: 'No memo available. POST to this endpoint to generate one.',
  })
}

/**
 * POST /api/applications/[id]/memo
 * Generate a startup memo
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

  // Check if memo already exists
  const cached = memoCache.get(id)
  if (cached) {
    const body = await request.json().catch(() => ({}))
    if (!body.force) {
      return NextResponse.json({
        success: true,
        memo: cached.data,
        generatedAt: cached.generatedAt,
        message: 'Memo already exists. Use force=true to regenerate.',
      })
    }
  }

  try {
    // Gather all available data
    const interview = getInterviewByApplicationId(id)
    const messages = interview ? getInterviewMessages(interview.id) : []
    const assessment = getAssessmentByApplicationId(id)

    // Check for research data
    const research = researchCache.get(id)?.data || null

    // Generate memo
    const generator = getMemoGenerator()
    const result = await generator.generateMemo({
      application,
      interview,
      messages,
      assessment,
      research,
    })

    if (!result.success || !result.memo) {
      return NextResponse.json(
        {
          error: 'Memo generation failed',
          details: result.error,
        },
        { status: 500 }
      )
    }

    // Store in cache (would be Supabase in production)
    const generatedAt = new Date().toISOString()
    memoCache.set(id, {
      data: result.memo,
      generatedAt,
    })

    // In production, this would update the application record in Supabase:
    // await supabase
    //   .from('applications')
    //   .update({
    //     memo_data: result.memo,
    //     memo_generated_at: generatedAt,
    //   })
    //   .eq('id', id)

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

/**
 * Utility to set research data (called from research endpoint)
 */
export function setResearchCache(id: string, data: ResearchOutput, completedAt: string) {
  researchCache.set(id, { data, completedAt })
}
