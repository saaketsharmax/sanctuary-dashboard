// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY API — Calibration Engine Endpoint
// GET: Fetch latest calibration report
// POST: Run calibration cycle
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { getCalibrationEngine } from '@/lib/ai/agents/calibration-engine'
import { DEFAULT_CALIBRATION_CONFIG } from '@/lib/ai/types/calibration-engine'
import type { PartnerFeedbackEntry } from '@/lib/ai/types/calibration-engine'

/**
 * GET /api/applications/dd/calibration
 * Fetch the latest calibration report
 */
export async function GET() {
  if (!isSupabaseConfigured()) {
    // Return mock calibration report
    return NextResponse.json({
      success: true,
      report: {
        generatedAt: new Date().toISOString(),
        overallHealth: 'good',
        healthScore: 78,
        predictionAccuracy: { overall: 76, byDimension: [], byStage: [], byConfidenceBucket: [] },
        drift: { detected: false, severity: 'none', affectedDimensions: [], scoreShift: 0, confidenceShift: 0, recommendation: 'Insufficient data.' },
        recommendedAdjustments: [],
        signalRankings: [],
        partnerAlignment: { overallAgreementRate: 78, commonDisagreements: [], topInsights: ['Collecting initial data.'] },
        outcomePredictions: [],
        recommendations: ['Continue collecting partner feedback to improve calibration accuracy.'],
      },
      isMock: true,
    })
  }

  const supabase = createAdminClient()

  // Fetch the most recent calibration report from agent_runs
  const { data: latestRun } = await supabase
    .from('agent_runs')
    .select('*')
    .eq('agent_type', 'calibration_engine')
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1)
    .single()

  if (!latestRun) {
    return NextResponse.json({
      success: true,
      report: null,
      message: 'No calibration has been run yet. POST to this endpoint to run one.',
    })
  }

  return NextResponse.json({
    success: true,
    report: latestRun.result,
    runAt: latestRun.completed_at,
  })
}

/**
 * POST /api/applications/dd/calibration
 * Run a calibration cycle
 */
export async function POST(request: NextRequest) {
  const config = DEFAULT_CALIBRATION_CONFIG

  if (!isSupabaseConfigured()) {
    // Run with empty data for demo
    const engine = getCalibrationEngine()
    const result = await engine.runCalibration({
      config,
      feedbackEntries: [],
      currentWeights: { founder: 1.2, problem: 1.0, userValue: 1.1, execution: 1.0, market: 0.8, team: 0.9 },
      currentSignalWeights: {},
    })

    return NextResponse.json({
      success: true,
      calibration: result,
      isMock: true,
    })
  }

  const supabase = createAdminClient()

  // Record agent run start
  const { data: agentRun } = await supabase
    .from('agent_runs')
    .insert({
      agent_type: 'calibration_engine',
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .select()
    .single()

  try {
    // Fetch all assessment feedback
    const { data: feedbackRows } = await supabase
      .from('assessment_feedback')
      .select('*')
      .order('created_at', { ascending: true })

    // Transform to PartnerFeedbackEntry format
    const feedbackEntries: PartnerFeedbackEntry[] = (feedbackRows || []).map((row: any) => ({
      applicationId: row.application_id,
      partnerId: row.partner_id || 'unknown',
      ddReportId: row.dd_report_id || '',
      dimensionFeedback: row.dimension_feedback || [],
      overallAgreement: row.overall_agreement || 'partially_agree',
      overallNotes: row.notes || '',
      claimFeedback: row.claim_feedback || [],
      outcomeData: row.outcome_data || undefined,
      createdAt: row.created_at,
    }))

    // Get current weights (from last calibration or defaults)
    const { data: lastCalibration } = await supabase
      .from('agent_runs')
      .select('result')
      .eq('agent_type', 'calibration_engine')
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single()

    const currentWeights = lastCalibration?.result?.newWeights || {
      founder: 1.2, problem: 1.0, userValue: 1.1, execution: 1.0, market: 0.8, team: 0.9,
    }
    const currentSignalWeights = lastCalibration?.result?.newSignalWeights || {}

    const engine = getCalibrationEngine()
    const result = await engine.runCalibration({
      config,
      feedbackEntries,
      currentWeights,
      currentSignalWeights,
    })

    // Update agent run
    if (agentRun) {
      await supabase
        .from('agent_runs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          result,
        })
        .eq('id', agentRun.id)
    }

    return NextResponse.json({
      success: true,
      calibration: result,
    })
  } catch (error) {
    // Update agent run as failed
    if (agentRun) {
      await supabase
        .from('agent_runs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: error instanceof Error ? error.message : 'Unknown error',
        })
        .eq('id', agentRun.id)
    }

    return NextResponse.json(
      { error: 'Calibration failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 },
    )
  }
}
