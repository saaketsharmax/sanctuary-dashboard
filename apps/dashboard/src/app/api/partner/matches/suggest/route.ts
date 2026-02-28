// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY API — Matchmaking Suggestions Endpoint
// POST: Run matchmaking agent to find best matches
// GET: Return existing match suggestions
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { isSupabaseConfigured } from '@/lib/supabase/server'
import { createDb } from '@sanctuary/database'
import { getMatchmakingAgent } from '@/lib/ai/agents/matchmaking-agent'
import type { MatchRequest, MatchCandidate } from '@/lib/ai/types/matchmaking'

/**
 * POST /api/partner/matches/suggest
 * Find best matches for a startup
 */
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { matchRequest } = body as { matchRequest: MatchRequest }

  if (!matchRequest) {
    return NextResponse.json({ error: 'Missing matchRequest' }, { status: 400 })
  }

  // Fetch candidates from database if configured, otherwise use empty array
  let candidates: MatchCandidate[] = []
  let historicalMatches: { candidateId: string; startupId: string; outcome: 'successful' | 'neutral' | 'unsuccessful'; feedback: string }[] = []

  if (isSupabaseConfigured()) {
    const db = createDb({ type: 'admin' })

    // Fetch mentors as candidates
    const { data: mentors } = await db.mentors.getCandidates()

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
    const { data: matches } = await db.mentors.getHistoricalMatches(['completed', 'rejected'])

    if (matches) {
      historicalMatches = matches.map((m: Record<string, unknown>) => ({
        candidateId: m.mentor_id as string,
        startupId: m.startup_id as string,
        outcome: (m.status === 'completed' ? 'successful' : 'unsuccessful') as 'successful' | 'neutral' | 'unsuccessful',
        feedback: (m.feedback as string) || '',
      }))
    }
  }

  const agent = getMatchmakingAgent()
  const result = await agent.findMatches({
    request: matchRequest,
    candidates,
    historicalMatches,
  })

  return NextResponse.json(result)
}

/**
 * GET /api/partner/matches/suggest
 * Return existing suggestions for a startup
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const startupId = searchParams.get('startupId')

  if (!startupId) {
    return NextResponse.json({ error: 'Missing startupId query param' }, { status: 400 })
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ matches: [], message: 'Database not configured' })
  }

  const db = createDb({ type: 'admin' })

  const { data: matches, error } = await db.mentors.getMatches(startupId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ matches: matches || [] })
}
