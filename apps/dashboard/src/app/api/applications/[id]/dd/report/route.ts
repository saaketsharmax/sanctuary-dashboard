// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY API — DD Report Endpoint
// GET: Return the DD report
// POST: Regenerate report from existing claims/verifications
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { isSupabaseConfigured } from '@/lib/supabase/server'
import { createDb } from '@sanctuary/database'
import { getDDReportGenerator } from '@/lib/ai/agents/dd-report-generator'
import type { DDClaim } from '@/lib/ai/types/due-diligence'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/applications/[id]/dd/report
 * Return the DD report
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  try {
    const db = createDb({ type: 'admin' })

    const { data: application } = await db.applications.getByIdWithFields(
      id,
      'dd_report_id, company_name'
    )

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    if (!(application as any).dd_report_id) {
      return NextResponse.json({
        success: true,
        report: null,
        message: 'No DD report available. Run due diligence first.',
      })
    }

    const { data: report } = await db.dd.getReport((application as any).dd_report_id)

    if (!report) {
      return NextResponse.json({ success: true, report: null })
    }

    return NextResponse.json({
      success: true,
      report: (report as any).report_data,
    })
  } catch (error) {
    console.error('DD report GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/applications/[id]/dd/report
 * Regenerate DD report from existing claims/verifications (no re-extraction)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  try {
    const db = createDb({ type: 'admin' })

    const { data: application } = await db.applications.getByIdWithFields(
      id,
      'id, company_name'
    )

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Fetch existing claims
    const { data: claims } = await db.dd.getClaims(id)

    if (!claims || claims.length === 0) {
      return NextResponse.json({
        error: 'No claims found. Run full DD pipeline first.',
      }, { status: 400 })
    }

    // Fetch verifications
    const claimIds = claims.map((c: any) => c.id)
    const { data: verifications } = await db.dd.getVerifications(claimIds)

    // Map to typed claims
    const fullClaims: DDClaim[] = claims.map((c: any) => ({
      id: c.id,
      applicationId: c.application_id,
      category: c.category,
      claimText: c.claim_text,
      sourceText: c.source_text,
      sourceType: c.source_type,
      sourceReference: c.source_reference,
      status: c.status,
      priority: c.priority,
      extractionConfidence: Number(c.extraction_confidence),
      verificationConfidence: c.verification_confidence ? Number(c.verification_confidence) : null,
      contradicts: c.contradicts || [],
      corroborates: c.corroborates || [],
      benchmarkFlag: c.benchmark_flag || null,
      verifications: (verifications || [])
        .filter((v: any) => v.claim_id === c.id)
        .map((v: any) => ({
          id: v.id,
          claimId: v.claim_id,
          sourceType: v.source_type,
          sourceName: v.source_name,
          sourceCredentials: v.source_credentials,
          verdict: v.verdict,
          confidence: Number(v.confidence),
          evidence: v.evidence,
          evidenceUrls: v.evidence_urls || [],
          notes: v.notes,
          sourceCredibilityScore: v.source_credibility_score ? Number(v.source_credibility_score) : null,
        })),
    }))

    // Try to recover omissions and team assessment from the existing report's report_data
    let existingOmissions: any[] = []
    let existingTeamAssessment: any = null
    const { data: existingReport } = await db.dd.getReportByApplicationId(id)
    if ((existingReport as any)?.report_data?.omissions) {
      existingOmissions = (existingReport as any).report_data.omissions
    }
    if ((existingReport as any)?.report_data?.teamAssessment) {
      existingTeamAssessment = (existingReport as any).report_data.teamAssessment
    }
    let existingMarketAssessment: any = null
    if ((existingReport as any)?.report_data?.marketAssessment) {
      existingMarketAssessment = (existingReport as any).report_data.marketAssessment
    }

    // Generate report
    const generator = getDDReportGenerator()
    const result = await generator.generateReport({
      applicationId: id,
      companyName: (application as any).company_name,
      claims: fullClaims,
      omissions: existingOmissions,
      teamAssessment: existingTeamAssessment,
      marketAssessment: existingMarketAssessment,
    })

    if (!result.success || !result.report) {
      return NextResponse.json({ error: 'Report generation failed', details: result.error }, { status: 500 })
    }

    // Delete old report and insert new
    await db.dd.deleteReports(id)

    const { data: insertedReport } = await db.dd.insertReport({
      application_id: id,
      report_data: result.report,
      overall_dd_score: result.report.overallDDScore,
      dd_grade: result.report.ddGrade,
      total_claims: fullClaims.length,
      verified_claims: fullClaims.filter(c => c.status === 'confirmed' || c.status === 'ai_verified').length,
      refuted_claims: fullClaims.filter(c => c.status === 'refuted').length,
      verification_coverage: result.report.verificationCoverage,
    })

    // Update application reference
    if (insertedReport) {
      await db.applications.update(id, { dd_report_id: insertedReport.id })
    }

    return NextResponse.json({
      success: true,
      report: result.report,
    })
  } catch (error) {
    console.error('DD report POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
