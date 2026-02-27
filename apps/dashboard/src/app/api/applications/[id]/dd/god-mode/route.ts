// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY API — God Mode Due Diligence Endpoint
// GET: Return god mode DD report if it exists
// POST: Run god mode DD analysis (requires standard DD to be completed)
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { getGodModeDDAgent } from '@/lib/ai/agents/god-mode-dd-agent'
import type { GodModeDDInput } from '@/lib/ai/types/god-mode-dd'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/applications/[id]/dd/god-mode
 * Return existing god mode DD report
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const supabase = createAdminClient()

  const { data: report, error } = await supabase
    .from('dd_reports')
    .select('report_data')
    .eq('application_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !report) {
    return NextResponse.json({ error: 'No DD report found' }, { status: 404 })
  }

  const godModeData = report.report_data?.godModeAnalysis
  if (!godModeData) {
    return NextResponse.json({ error: 'No god mode analysis found. Run POST first.' }, { status: 404 })
  }

  return NextResponse.json({ godModeReport: godModeData })
}

/**
 * POST /api/applications/[id]/dd/god-mode
 * Run god mode DD analysis
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const supabase = createAdminClient()

  // 1. Fetch application data
  const { data: application, error: appError } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .single()

  if (appError || !application) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  // 2. Check that standard DD is completed
  if (application.dd_status !== 'completed') {
    return NextResponse.json(
      { error: 'Standard DD must be completed before running god mode analysis. Current status: ' + application.dd_status },
      { status: 400 },
    )
  }

  // 3. Fetch DD report
  const { data: ddReport } = await supabase
    .from('dd_reports')
    .select('report_data')
    .eq('application_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // 4. Fetch interview signals
  const { data: signals } = await supabase
    .from('interview_signals')
    .select('*')
    .eq('application_id', id)

  // 5. Build god mode input
  const input: GodModeDDInput = {
    applicationId: id,
    companyName: application.company_name || 'Unknown',
    applicationData: {
      problemDescription: application.problem_description || '',
      solutionDescription: application.solution_description || '',
      targetCustomer: application.target_customer || '',
      stage: application.stage || '',
      userCount: application.user_count || 0,
      mrr: application.mrr || 0,
      biggestChallenge: application.biggest_challenge || '',
      whySanctuary: application.why_sanctuary || '',
      founders: application.founders || [],
      companyWebsite: application.company_website,
    },
    interviewTranscript: application.interview_transcript || [],
    interviewMetadata: application.interview_metadata,
    signals: (signals || []).map((s: Record<string, unknown>) => ({
      type: s.signal_type as string,
      content: s.content as string,
      dimension: s.dimension as string,
      impact: s.impact_score as number,
    })),
    assessment: application.ai_assessment,
    researchData: application.research_data,
    ddReport: ddReport?.report_data,
    existingMemo: application.memo_data,
  }

  // 6. Run god mode analysis
  const agent = getGodModeDDAgent()
  const godModeReport = await agent.analyze(input)

  // 7. Store in DD report (merge with existing report_data)
  if (ddReport) {
    const updatedReportData = {
      ...ddReport.report_data,
      godModeAnalysis: godModeReport,
    }

    await supabase
      .from('dd_reports')
      .update({ report_data: updatedReportData })
      .eq('application_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
  }

  // 8. Log agent run
  await supabase.from('agent_runs').insert({
    agent_type: 'god_mode_dd',
    application_id: id,
    status: 'completed',
    started_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    output_summary: `God mode DD complete. Score: ${godModeReport.godModeScore}/100. Conviction: ${godModeReport.convictionLevel}`,
    run_metadata: {
      analysisDepth: godModeReport.analysisDepth,
      modelUsed: godModeReport.modelUsed,
      alphaSignals: godModeReport.alphaSignals,
    },
  })

  return NextResponse.json({
    godModeReport,
    summary: {
      godModeScore: godModeReport.godModeScore,
      convictionLevel: godModeReport.convictionLevel,
      oneLineVerdict: godModeReport.oneLineVerdict,
      alphaSignals: godModeReport.alphaSignals,
      blindSpots: godModeReport.blindSpots,
    },
  })
}
