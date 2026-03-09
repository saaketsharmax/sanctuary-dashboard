// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY API — Matchmaking Suggestions Endpoint
// POST: Run matchmaking agent to find best matches
// GET: Return existing match suggestions
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { requirePartnerAuth } from '@/lib/api-auth'
import { createDb } from '@sanctuary/database'
import { getMatchmakingAgent } from '@/lib/ai/agents/matchmaking-agent'
import type { MatchRequest, MatchCandidate } from '@/lib/ai/types/matchmaking'

/**
 * POST /api/partner/matches/suggest
 * Find best matches for a startup
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requirePartnerAuth()
    if (!auth.ok) return auth.response

    const body = await request.json()
    const { matchRequest } = body as { matchRequest: MatchRequest }

    if (!matchRequest) {
      return NextResponse.json({ error: 'Missing matchRequest' }, { status: 400 })
    }

    // Use admin DB for cross-user queries (candidates from all mentors)
    const adminDb = createDb({ type: 'admin' })

    let candidates: MatchCandidate[] = []
    let historicalMatches: { candidateId: string; startupId: string; outcome: 'successful' | 'neutral' | 'unsuccessful'; feedback: string }[] = []

    // Fetch mentors as candidates
    const { data: mentors } = await adminDb.mentors.getCandidates()

    if (mentors) {
      candidates = mentors.map((m: Record<string, unknown>) => ({
        id: m.id as string,
        type: (m.partner_sub_type as string) === 'vc' ? 'gp' as const : 'mentor' as const,
        name: (m.name as string) || 'Unknown',
        expertise: (m.expertise as string[]) || [],
        industries: (m.industries as string[]) || [],
        stagePreference: (m.stage_preference as string[]) || [],
        location: (m.location as string) || '',
        availability: 'medium' as const,
        trackRecord: { successCount: 0, totalEngagements: 0, avgRating: 4.0 },
        preferences: { maxStartups: 5, preferredStage: [], dealbreakers: [] },
      }))
    }

    // Fetch historical match outcomes
    const { data: matches } = await adminDb.mentors.getHistoricalMatches(['completed', 'rejected'])

    if (matches) {
      historicalMatches = matches.map((m: Record<string, unknown>) => ({
        candidateId: m.mentor_id as string,
        startupId: m.startup_id as string,
        outcome: (m.status === 'completed' ? 'successful' : 'unsuccessful') as 'successful' | 'neutral' | 'unsuccessful',
        feedback: (m.feedback as string) || '',
      }))
    }

    const agent = getMatchmakingAgent()
    const result = await agent.findMatches({
      request: matchRequest,
      candidates,
      historicalMatches,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Matchmaking error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Failed to generate match suggestions' }, { status: 500 })
  }
}

/**
 * GET /api/partner/matches/suggest
 * Return existing suggestions for a startup
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requirePartnerAuth()
    if (!auth.ok) return auth.response

    const { searchParams } = new URL(request.url)
    const startupId = searchParams.get('startupId')

    if (!startupId) {
      return NextResponse.json({ error: 'Missing startupId query param' }, { status: 400 })
    }

    const adminDb = createDb({ type: 'admin' })

    const { data: matches, error } = await adminDb.mentors.getMatches(startupId)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 })
    }

    return NextResponse.json({ matches: matches || [] })
  } catch (error) {
    console.error('Fetch matches error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
