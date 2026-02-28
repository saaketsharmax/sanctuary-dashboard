// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY API — DD Accuracy Metrics Endpoint
// GET: Compute and return accuracy metrics across all applications
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { isSupabaseConfigured } from '@/lib/supabase/server'
import { createDb } from '@sanctuary/database'
import { getDDAccuracyAgent } from '@/lib/ai/agents/dd-accuracy-agent'
import type { DDAccuracyInput } from '@/lib/ai/types/dd-accuracy'

/**
 * GET /api/applications/dd/accuracy
 * Compute accuracy metrics
 * Query params: ?period=weekly|monthly|quarterly&includeInsights=true
 */
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') || 'monthly'
  const includeInsights = searchParams.get('includeInsights') === 'true'

  const db = createDb({ type: 'admin' })

  // Calculate date filter
  const now = new Date()
  let dateFilter = new Date()
  switch (period) {
    case 'weekly':
      dateFilter.setDate(now.getDate() - 7)
      break
    case 'monthly':
      dateFilter.setMonth(now.getMonth() - 1)
      break
    case 'quarterly':
      dateFilter.setMonth(now.getMonth() - 3)
      break
    default:
      dateFilter.setMonth(now.getMonth() - 1)
  }

  // Fetch decisions (applications with DD reports and partner reviews)
  const { data: applications } = await db.applications.getAllFiltered(
    {
      reviewDecisionNotNull: true,
      reviewedAtGte: dateFilter.toISOString(),
    },
    'id, ai_score, ai_assessment, review_decision, reviewed_at, dd_status, outcome, outcome_notes'
  )

  // Fetch assessment feedback
  const { data: feedbackRecords } = await db.applications.getAllFeedbackFiltered({
    createdAtGte: dateFilter.toISOString(),
  })

  // Fetch DD claims with verifications
  const { data: claims } = await db.dd.getClaimsFiltered({
    createdAtGte: dateFilter.toISOString(),
  })

  // Fetch interview signals
  const { data: signals } = await db.applications.getSignalsFiltered({
    createdAtGte: dateFilter.toISOString(),
  })

  // Build accuracy input
  const feedbackMap = new Map<string, Record<string, unknown>>()
  for (const fb of feedbackRecords || []) {
    feedbackMap.set((fb as any).application_id, fb as Record<string, unknown>)
  }

  const decisions: DDAccuracyInput['decisions'] = (applications || []).map((app) => {
    const fb = feedbackMap.get((app as any).id) as Record<string, unknown> | undefined
    const assessment = (app as any).ai_assessment as Record<string, unknown> | null

    return {
      applicationId: (app as any).id,
      ddVerdict: assessment?.recommendation as string || 'unknown',
      ddScore: ((app as any).ai_score as number) || 0,
      ddConfidence: (assessment?.recommendationConfidence as number) || 0.5,
      partnerDecision: (app as any).review_decision || 'unknown',
      partnerAgreed: fb ? (fb.agrees_with_recommendation as boolean) : true,
      scoreAdjustments: fb ? {
        founder: ((fb.adjusted_founder_score as number) || 0) - ((assessment?.founderScore as number) || 0),
        problem: ((fb.adjusted_problem_score as number) || 0) - ((assessment?.problemScore as number) || 0),
        userValue: ((fb.adjusted_user_value_score as number) || 0) - ((assessment?.userValueScore as number) || 0),
        execution: ((fb.adjusted_execution_score as number) || 0) - ((assessment?.executionScore as number) || 0),
      } : { founder: 0, problem: 0, userValue: 0, execution: 0 },
      outcome: (app as any).outcome as string || undefined,
      decisionDate: (app as any).reviewed_at || new Date().toISOString(),
    }
  })

  const claimVerifications: DDAccuracyInput['claimVerifications'] = (claims || []).map((c) => ({
    claimId: (c as any).id,
    aiVerdict: (c as any).status || 'unverified',
    aiConfidence: ((c as any).verification_confidence as number) || 0,
  }))

  const signalHistory: DDAccuracyInput['signalHistory'] = (signals || []).map((s) => ({
    signalType: (s as any).signal_type || '',
    dimension: (s as any).dimension || '',
    impact: ((s as any).impact_score as number) || 0,
  }))

  // Calculate metrics
  const agent = getDDAccuracyAgent()
  const metrics = await agent.calculateAccuracyMetrics({
    decisions,
    claimVerifications,
    signalHistory,
  })

  // Generate insights if requested
  let insights: string[] = []
  if (includeInsights) {
    insights = await agent.generateInsights(metrics)
  }

  return NextResponse.json({
    period,
    metrics,
    insights,
    meta: {
      applicationsAnalyzed: decisions.length,
      claimsAnalyzed: claimVerifications.length,
      signalsAnalyzed: signalHistory.length,
      generatedAt: new Date().toISOString(),
    },
  })
}
