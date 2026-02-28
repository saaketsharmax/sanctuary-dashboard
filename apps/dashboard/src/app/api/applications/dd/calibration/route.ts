// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY API — Calibration Engine Endpoint
// GET: Fetch latest calibration report
// POST: Run calibration cycle
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { isSupabaseConfigured } from '@/lib/supabase/server'
import { createDb } from '@sanctuary/database'
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

  const db = createDb({ type: 'admin' })

  // Fetch the most recent calibration report from agent_runs
  const { data: latestRun } = await db.dd.getLatestAgentRun('calibration_engine')

  if (!latestRun) {
    return NextResponse.json({
      success: true,
      report: null,
      message: 'No calibration has been run yet. POST to this endpoint to run one.',
    })
  }

  return NextResponse.json({
    success: true,
    report: (latestRun as any).result,
    runAt: (latestRun as any).completed_at,
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

  const db = createDb({ type: 'admin' })

  // Record agent run start
  const { data: agentRun } = await db.dd.logAgentRun({
    agent_type: 'calibration_engine',
    status: 'running',
    started_at: new Date().toISOString(),
  })

  try {
    // Fetch all assessment feedback
    const { data: feedbackRows } = await db.applications.getAllFeedback()

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
    const { data: lastCalibration } = await db.dd.getLatestAgentRun('calibration_engine')

    const currentWeights = (lastCalibration as any)?.result?.newWeights || {
      founder: 1.2, problem: 1.0, userValue: 1.1, execution: 1.0, market: 0.8, team: 0.9,
    }
    const currentSignalWeights = (lastCalibration as any)?.result?.newSignalWeights || {}

    const engine = getCalibrationEngine()
    const result = await engine.runCalibration({
      config,
      feedbackEntries,
      currentWeights,
      currentSignalWeights,
    })

    // Update agent run
    if (agentRun) {
      await db.dd.updateAgentRun((agentRun as any).id, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        result,
      })
    }

    return NextResponse.json({
      success: true,
      calibration: result,
    })
  } catch (error) {
    // Update agent run as failed
    if (agentRun) {
      await db.dd.updateAgentRun((agentRun as any).id, {
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: error instanceof Error ? error.message : 'Unknown error',
      })
    }

    return NextResponse.json(
      { error: 'Calibration failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 },
    )
  }
}
