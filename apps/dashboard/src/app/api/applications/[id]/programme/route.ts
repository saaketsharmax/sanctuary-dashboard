// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY API — Programme Generation Endpoint
// GET: Fetch existing programme for an application
// POST: Generate a new 90-day programme
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { isSupabaseConfigured } from '@/lib/supabase/server'
import { createDb } from '@sanctuary/database'
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

  const db = createDb({ type: 'admin' })

  // Check for existing programme in application metadata
  const { data: application, error } = await db.applications.getByIdWithFields(
    id,
    'id, company_name, status, application_metadata'
  )

  if (error || !application) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  const programme = (application as any).application_metadata?.programme || null

  return NextResponse.json({
    success: true,
    programme,
    hasApproval: (application as any).status === 'approved',
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

  const db = createDb({ type: 'admin' })

  // Fetch application with all data
  const { data: application, error: appError } = await db.applications.getById(id)

  if (appError || !application) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  // Fetch founders
  const { data: founders } = await db.applications.getFounders(id)

  // Build programme input
  const input: ProgrammeInput = {
    applicationId: id,
    companyName: (application as any).company_name,
    stage: (application as any).stage || 'pre-seed',
    industry: (application as any).target_customer || 'Technology',
    applicationData: {
      problemDescription: (application as any).problem_description || '',
      solutionDescription: (application as any).solution_description || '',
      targetCustomer: (application as any).target_customer || '',
      userCount: (application as any).user_count || 0,
      mrr: (application as any).mrr || 0,
      biggestChallenge: (application as any).biggest_challenge || '',
      whatTheyWant: (application as any).what_they_want || '',
    },
    founders: (founders || []).map((f: any) => ({
      name: f.name,
      role: f.role,
      yearsExperience: f.years_experience,
      hasStartedBefore: f.has_started_before,
    })),
    aiAssessment: (application as any).ai_assessment || undefined,
  }

  // Check for DD report
  const { data: ddReport } = await db.dd.getLatestReportData(id)

  if (ddReport?.report_data) {
    input.ddReport = {
      overallDDScore: (ddReport.report_data as any).overallDDScore || 0,
      redFlags: ((ddReport.report_data as any).redFlags || []).map((rf: any) => ({
        claimText: rf.claimText,
        severity: rf.severity,
      })),
      recommendation: (ddReport.report_data as any).recommendation || { verdict: 'unknown', conditions: [] },
    }
  }

  // Record agent run
  const { data: agentRun } = await db.dd.logAgentRun({
    application_id: id,
    agent_type: 'programme_generator',
    status: 'running',
    started_at: new Date().toISOString(),
  })

  try {
    const agent = getProgrammeAgent()
    const programme = await agent.generateProgramme(input)

    // Store programme in application metadata
    const existingMetadata = (application as any).application_metadata || {}
    await db.applications.update(id, {
      application_metadata: {
        ...existingMetadata,
        programme,
      },
    })

    // If startup exists, also store on startup record
    const { data: startup } = await db.startups.getByApplicationId(id)

    if (startup) {
      programme.startupId = (startup as any).id
    }

    // Update agent run
    if (agentRun) {
      await db.dd.updateAgentRun((agentRun as any).id, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        result: { programmeId: programme.id, milestoneCount: programme.phases.reduce((s: number, p: any) => s + p.milestones.length, 0) },
      })
    }

    return NextResponse.json({ success: true, programme })
  } catch (error) {
    if (agentRun) {
      await db.dd.updateAgentRun((agentRun as any).id, {
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: error instanceof Error ? error.message : 'Unknown error',
      })
    }

    return NextResponse.json(
      { error: 'Programme generation failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 },
    )
  }
}
