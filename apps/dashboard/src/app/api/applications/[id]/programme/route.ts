// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY API — Programme Generation Endpoint
// GET: Fetch existing programme for an application
// POST: Generate a new 90-day programme
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { getProgrammeAgent } from '@/lib/ai/agents/programme-agent'
import type { ProgrammeInput } from '@/lib/ai/types/programme'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/applications/[id]/programme
 * Fetch the existing programme for an application
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  if (!isSupabaseConfigured()) {
    // Generate mock programme on the fly
    const agent = getProgrammeAgent()
    const programme = await agent.generateProgramme({
      applicationId: id,
      companyName: 'Demo Startup',
      stage: 'pre-seed',
      industry: 'SaaS',
      applicationData: {
        problemDescription: 'Manual processes slow down teams',
        solutionDescription: 'AI-powered workflow automation',
        targetCustomer: 'SMB operations teams',
        userCount: 150,
        mrr: 2400,
        biggestChallenge: 'Scaling customer acquisition',
        whatTheyWant: 'Growth strategy and fundraise support',
      },
      founders: [{ name: 'Demo Founder', role: 'CEO', yearsExperience: 8, hasStartedBefore: true }],
    })

    return NextResponse.json({ success: true, programme, isMock: true })
  }

  const supabase = createAdminClient()

  // Check for existing programme in application metadata
  const { data: application, error } = await supabase
    .from('applications')
    .select('id, company_name, status, application_metadata')
    .eq('id', id)
    .single()

  if (error || !application) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  const programme = application.application_metadata?.programme || null

  return NextResponse.json({
    success: true,
    programme,
    hasApproval: application.status === 'approved',
  })
}

/**
 * POST /api/applications/[id]/programme
 * Generate a new 90-day programme
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  if (!isSupabaseConfigured()) {
    const agent = getProgrammeAgent()
    const programme = await agent.generateProgramme({
      applicationId: id,
      companyName: 'Demo Startup',
      stage: 'pre-seed',
      industry: 'SaaS',
      applicationData: {
        problemDescription: 'Manual processes slow down teams',
        solutionDescription: 'AI-powered workflow automation',
        targetCustomer: 'SMB operations teams',
        userCount: 150,
        mrr: 2400,
        biggestChallenge: 'Scaling customer acquisition',
        whatTheyWant: 'Growth strategy and fundraise support',
      },
      founders: [{ name: 'Demo Founder', role: 'CEO', yearsExperience: 8, hasStartedBefore: true }],
    })

    return NextResponse.json({ success: true, programme, isMock: true })
  }

  const supabase = createAdminClient()

  // Fetch application with all data
  const { data: application, error: appError } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .single()

  if (appError || !application) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  // Fetch founders
  const { data: founders } = await supabase
    .from('founders')
    .select('*')
    .eq('application_id', id)

  // Build programme input
  const input: ProgrammeInput = {
    applicationId: id,
    companyName: application.company_name,
    stage: application.stage || 'pre-seed',
    industry: application.target_customer || 'Technology',
    applicationData: {
      problemDescription: application.problem_description || '',
      solutionDescription: application.solution_description || '',
      targetCustomer: application.target_customer || '',
      userCount: application.user_count || 0,
      mrr: application.mrr || 0,
      biggestChallenge: application.biggest_challenge || '',
      whatTheyWant: application.what_they_want || '',
    },
    founders: (founders || []).map((f: any) => ({
      name: f.name,
      role: f.role,
      yearsExperience: f.years_experience,
      hasStartedBefore: f.has_started_before,
    })),
    aiAssessment: application.ai_assessment || undefined,
  }

  // Check for DD report
  const { data: ddReport } = await supabase
    .from('dd_reports')
    .select('report_data')
    .eq('application_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (ddReport?.report_data) {
    input.ddReport = {
      overallDDScore: ddReport.report_data.overallDDScore || 0,
      redFlags: (ddReport.report_data.redFlags || []).map((rf: any) => ({
        claimText: rf.claimText,
        severity: rf.severity,
      })),
      recommendation: ddReport.report_data.recommendation || { verdict: 'unknown', conditions: [] },
    }
  }

  // Record agent run
  const { data: agentRun } = await supabase
    .from('agent_runs')
    .insert({
      application_id: id,
      agent_type: 'programme_generator',
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .select()
    .single()

  try {
    const agent = getProgrammeAgent()
    const programme = await agent.generateProgramme(input)

    // Store programme in application metadata
    const existingMetadata = application.application_metadata || {}
    await supabase
      .from('applications')
      .update({
        application_metadata: {
          ...existingMetadata,
          programme,
        },
      })
      .eq('id', id)

    // If startup exists, also store on startup record
    const { data: startup } = await supabase
      .from('startups')
      .select('id')
      .eq('application_id', id)
      .single()

    if (startup) {
      programme.startupId = startup.id
    }

    // Update agent run
    if (agentRun) {
      await supabase
        .from('agent_runs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          result: { programmeId: programme.id, milestoneCount: programme.phases.reduce((s, p) => s + p.milestones.length, 0) },
        })
        .eq('id', agentRun.id)
    }

    return NextResponse.json({ success: true, programme })
  } catch (error) {
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
      { error: 'Programme generation failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 },
    )
  }
}
