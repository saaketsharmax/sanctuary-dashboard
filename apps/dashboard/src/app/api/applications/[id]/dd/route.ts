// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY API — Due Diligence Pipeline Endpoint
// GET: Return DD status + summary
// POST: Kick off full DD pipeline
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { isSupabaseConfigured } from '@/lib/supabase/server'
import { createDb } from '@sanctuary/database'
import { getClaimExtractionAgent } from '@/lib/ai/agents/claim-extraction-agent'
import { getClaimVerificationAgent } from '@/lib/ai/agents/claim-verification-agent'
import { getDocumentVerificationAgent } from '@/lib/ai/agents/document-verification-agent'
import { getTeamAssessmentAgent } from '@/lib/ai/agents/team-assessment-agent'
import { getMarketAssessmentAgent } from '@/lib/ai/agents/market-assessment-agent'
import { getDDReportGenerator } from '@/lib/ai/agents/dd-report-generator'
import type { DDClaim, DDVerification, DDOmission, DDTeamAssessment, DDMarketAssessment } from '@/lib/ai/types/due-diligence'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/applications/[id]/dd
 * Return DD status + summary
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  try {
    const db = createDb({ type: 'admin' })

    const { data: application, error } = await db.applications.getByIdWithFields(
      id,
      'id, dd_status, dd_report_id, dd_started_at, dd_completed_at'
    )

    if (error || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Get claims count
    const { count: claimsCount } = await db.dd.getClaimCount(id)

    // Get report if exists
    let report = null
    if ((application as any).dd_report_id) {
      const { data } = await db.dd.getReport((application as any).dd_report_id)
      report = data
    }

    return NextResponse.json({
      success: true,
      ddStatus: (application as any).dd_status || 'not_started',
      claimsCount: claimsCount || 0,
      startedAt: (application as any).dd_started_at,
      completedAt: (application as any).dd_completed_at,
      report: report ? {
        overallScore: (report as any).overall_dd_score,
        grade: (report as any).dd_grade,
        totalClaims: (report as any).total_claims,
        verifiedClaims: (report as any).verified_claims,
        refutedClaims: (report as any).refuted_claims,
        verificationCoverage: (report as any).verification_coverage,
      } : null,
    })
  } catch (error) {
    console.error('DD GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/applications/[id]/dd
 * Run full DD pipeline
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  try {
    const db = createDb({ type: 'admin' })
    const body = await request.json().catch(() => ({}))

    // Fetch application
    const { data: application, error } = await db.applications.getById(id)

    if (error || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Check if DD already completed (unless force=true)
    if ((application as any).dd_status === 'completed' && !body.force) {
      return NextResponse.json({
        success: true,
        message: 'DD already completed. Use force=true to re-run.',
        ddStatus: (application as any).dd_status,
      })
    }

    // ─── Step 1: Mark as started ───
    await db.applications.update(id, {
      dd_status: 'claims_extracted',
      dd_started_at: new Date().toISOString(),
    })

    // ─── Step 2: Extract claims + Team + Market assessment (all parallel) ───
    const extractionAgent = getClaimExtractionAgent()
    const teamAgent = getTeamAssessmentAgent()
    const marketAgent = getMarketAssessmentAgent()
    const founders = Array.isArray((application as any).founders) ? (application as any).founders : []

    const foundersMapped = founders.map((f: any) => ({
      name: f.name || '',
      role: f.role || null,
      yearsExperience: f.yearsExperience || null,
      hasStartedBefore: f.hasStartedBefore || false,
      previousStartupOutcome: f.previousStartupOutcome || null,
      linkedin: f.linkedin || null,
    }))

    const [extractionResult, teamResult, marketResult] = await Promise.all([
      extractionAgent.extractClaims({
        applicationId: id,
        companyName: (application as any).company_name,
        applicationData: {
          companyDescription: (application as any).company_description,
          problemDescription: (application as any).problem_description,
          solutionDescription: (application as any).solution_description,
          targetCustomer: (application as any).target_customer,
          stage: (application as any).stage,
          userCount: (application as any).user_count,
          mrr: (application as any).mrr ? Number((application as any).mrr) : null,
          biggestChallenge: (application as any).biggest_challenge,
          whySanctuary: (application as any).why_sanctuary,
          whatTheyWant: (application as any).what_they_want,
          companyWebsite: (application as any).company_website,
        },
        founders: foundersMapped,
        interviewTranscript: (application as any).interview_transcript || null,
        researchData: (application as any).research_data || null,
      }),
      teamAgent.assessTeam({
        applicationId: id,
        companyName: (application as any).company_name,
        founders: foundersMapped,
        interviewTranscript: (application as any).interview_transcript || null,
        companyDescription: (application as any).company_description,
        stage: (application as any).stage,
      }),
      marketAgent.assessMarket({
        applicationId: id,
        companyName: (application as any).company_name,
        companyDescription: (application as any).company_description,
        targetCustomer: (application as any).target_customer,
        stage: (application as any).stage,
        companyWebsite: (application as any).company_website,
        interviewTranscript: (application as any).interview_transcript || null,
      }),
    ])

    if (!extractionResult.success) {
      await db.applications.update(id, { dd_status: 'failed' })
      return NextResponse.json({ error: 'Claim extraction failed', details: extractionResult.error }, { status: 500 })
    }

    // Capture omissions from extraction
    const omissions: DDOmission[] = extractionResult.omissions || []

    // Capture team assessment (non-blocking — DD continues even if team fails)
    const teamAssessment: DDTeamAssessment | null = teamResult.success ? teamResult.assessment : null
    if (!teamResult.success) {
      console.error('Team assessment failed (non-blocking):', teamResult.error)
    }

    // Capture market assessment (non-blocking)
    const marketAssessment: DDMarketAssessment | null = marketResult.success ? marketResult.assessment : null
    if (!marketResult.success) {
      console.error('Market assessment failed (non-blocking):', marketResult.error)
    }

    // Log extraction agent run
    await db.dd.logAgentRun({
      agent_type: 'dd_claim_extraction',
      agent_version: '1.1.0',
      application_id: id,
      trigger_type: 'manual',
      status: 'completed',
      completed_at: new Date().toISOString(),
      output_summary: {
        totalClaims: extractionResult.metadata.totalClaims,
        totalOmissions: omissions.length,
      },
    })

    // Log team assessment agent run
    await db.dd.logAgentRun({
      agent_type: 'dd_team_assessment',
      agent_version: '1.0.0',
      application_id: id,
      trigger_type: 'manual',
      status: teamResult.success ? 'completed' : 'failed',
      completed_at: new Date().toISOString(),
      output_summary: {
        teamScore: teamAssessment?.overallTeamScore ?? null,
        teamGrade: teamAssessment?.teamGrade ?? null,
        foundersEnriched: teamResult.metadata.foundersEnriched,
        tavilySearches: teamResult.metadata.tavilySearches,
      },
    })

    // Log market assessment agent run
    await db.dd.logAgentRun({
      agent_type: 'dd_market_assessment',
      agent_version: '1.0.0',
      application_id: id,
      trigger_type: 'manual',
      status: marketResult.success ? 'completed' : 'failed',
      completed_at: new Date().toISOString(),
      output_summary: {
        marketScore: marketAssessment?.overallMarketScore ?? null,
        marketGrade: marketAssessment?.marketGrade ?? null,
        competitorsFound: marketResult.metadata.competitorsFound,
        tavilySearches: marketResult.metadata.tavilySearches,
      },
    })

    // Delete existing claims if re-running
    await db.dd.deleteClaims(id)

    // Insert claims into DB (with benchmark_flag)
    const claimInserts = extractionResult.claims.map(c => ({
      application_id: id,
      category: c.category,
      claim_text: c.claimText,
      source_text: c.sourceText,
      source_type: c.sourceType,
      source_reference: c.sourceReference,
      status: c.status,
      priority: c.priority,
      extraction_confidence: c.extractionConfidence,
      verification_confidence: c.verificationConfidence,
      contradicts: [],
      corroborates: [],
      benchmark_flag: c.benchmarkFlag,
    }))

    const { data: insertedClaims, error: insertError } = await db.dd.insertClaims(claimInserts)

    if (insertError || !insertedClaims) {
      console.error('Failed to insert claims:', insertError)
      await db.applications.update(id, { dd_status: 'failed' })
      return NextResponse.json({ error: 'Failed to store claims' }, { status: 500 })
    }

    // ─── Step 3: Verify claims ───
    await db.applications.update(id, { dd_status: 'ai_verification' })

    const dbClaims: DDClaim[] = insertedClaims.map((c: any) => ({
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
      verifications: [],
    }))

    const verificationAgent = getClaimVerificationAgent()
    const verificationResult = await verificationAgent.verifyClaims({
      claims: dbClaims,
      companyName: (application as any).company_name,
      companyWebsite: (application as any).company_website,
    })

    // ─── Step 4: Document verification (if documents exist) ───
    let docVerifications: Omit<DDVerification, 'id'>[] = []
    if ((application as any).startup_id) {
      const { data: documents } = await db.documents.getByStartupId(
        (application as any).startup_id,
        { currentOnly: true, fields: 'id, name, type, file_url' }
      )

      if (documents && documents.length > 0) {
        const docAgent = getDocumentVerificationAgent()
        const docResult = await docAgent.verifyDocuments({
          claims: dbClaims,
          documents: documents.map((d: any) => ({
            id: d.id,
            name: d.name,
            type: d.type,
            fileUrl: d.file_url,
          })),
          companyName: (application as any).company_name,
        })
        if (docResult.success) {
          docVerifications = docResult.verifications
        }
      }
    }

    // ─── Step 5: Store verifications (with source_credibility_score) ───
    const allVerifications = [
      ...(verificationResult.success ? verificationResult.verifications : []),
      ...docVerifications,
    ]

    if (allVerifications.length > 0) {
      // Delete existing verifications for these claims
      const claimIds = dbClaims.map(c => c.id)
      await db.dd.deleteVerifications(claimIds)

      const verificationInserts = allVerifications.map(v => ({
        claim_id: v.claimId,
        source_type: v.sourceType,
        source_name: v.sourceName,
        source_credentials: v.sourceCredentials,
        verdict: v.verdict,
        confidence: v.confidence,
        evidence: v.evidence,
        evidence_urls: v.evidenceUrls,
        notes: v.notes,
        source_credibility_score: v.sourceCredibilityScore ?? null,
      }))

      await db.dd.insertVerifications(verificationInserts)
    }

    // Log verification agent run
    await db.dd.logAgentRun({
      agent_type: 'dd_claim_verification',
      agent_version: '1.1.0',
      application_id: id,
      trigger_type: 'manual',
      status: verificationResult.success ? 'completed' : 'failed',
      completed_at: new Date().toISOString(),
      output_summary: { totalVerifications: allVerifications.length },
    })

    // ─── Step 6: Update claim statuses based on verifications ───
    for (const claim of dbClaims) {
      const claimVerifications = allVerifications.filter(v => v.claimId === claim.id)
      if (claimVerifications.length === 0) continue

      // Determine overall status from verifications
      const verdicts = claimVerifications.map(v => v.verdict)
      let newStatus = 'ai_verified'
      if (verdicts.includes('refuted')) newStatus = 'refuted'
      else if (verdicts.includes('disputed')) newStatus = 'disputed'
      else if (verdicts.every(v => v === 'confirmed')) newStatus = 'confirmed'
      else if (verdicts.includes('unconfirmed') && !verdicts.includes('confirmed')) newStatus = 'unverified'

      // Calculate verification confidence as average
      const avgConfidence = claimVerifications.reduce((sum, v) => sum + v.confidence, 0) / claimVerifications.length

      await db.dd.updateClaim(claim.id, { status: newStatus, verification_confidence: avgConfidence })
    }

    // ─── Step 7: Re-fetch updated claims with verifications for report ───
    const { data: updatedClaims } = await db.dd.getClaims(id)
    const claimIds = (updatedClaims || []).map((c: any) => c.id)
    const { data: allDbVerifications } = await db.dd.getVerifications(claimIds)

    const fullClaims: DDClaim[] = (updatedClaims || []).map((c: any) => ({
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
      verifications: (allDbVerifications || [])
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

    // ─── Step 8: Generate DD report (with omissions + team + market assessment) ───
    const reportGenerator = getDDReportGenerator()
    const reportResult = await reportGenerator.generateReport({
      applicationId: id,
      companyName: (application as any).company_name,
      claims: fullClaims,
      omissions,
      teamAssessment,
      marketAssessment,
    })

    if (!reportResult.success || !reportResult.report) {
      await db.applications.update(id, { dd_status: 'failed' })
      return NextResponse.json({ error: 'Report generation failed', details: reportResult.error }, { status: 500 })
    }

    // Delete existing report if re-running
    await db.dd.deleteReports(id)

    // Store report
    const { data: insertedReport, error: reportError } = await db.dd.insertReport({
      application_id: id,
      report_data: reportResult.report,
      overall_dd_score: reportResult.report.overallDDScore,
      dd_grade: reportResult.report.ddGrade,
      total_claims: fullClaims.length,
      verified_claims: fullClaims.filter(c => c.status === 'confirmed' || c.status === 'ai_verified').length,
      refuted_claims: fullClaims.filter(c => c.status === 'refuted').length,
      verification_coverage: reportResult.report.verificationCoverage,
    })

    if (reportError || !insertedReport) {
      console.error('Failed to insert report:', reportError)
    }

    // Log report generation
    await db.dd.logAgentRun({
      agent_type: 'dd_report_generation',
      agent_version: '1.1.0',
      application_id: id,
      trigger_type: 'manual',
      status: 'completed',
      completed_at: new Date().toISOString(),
      output_summary: {
        score: reportResult.report.overallDDScore,
        grade: reportResult.report.ddGrade,
        recommendation: reportResult.report.recommendation.verdict,
      },
    })

    // ─── Step 9: Mark DD as completed ───
    await db.applications.update(id, {
      dd_status: 'completed',
      dd_completed_at: new Date().toISOString(),
      dd_report_id: insertedReport?.id || null,
    })

    return NextResponse.json({
      success: true,
      report: reportResult.report,
      metadata: {
        totalClaims: fullClaims.length,
        totalVerifications: allVerifications.length,
        totalOmissions: omissions.length,
        score: reportResult.report.overallDDScore,
        grade: reportResult.report.ddGrade,
        recommendation: reportResult.report.recommendation.verdict,
        teamScore: teamAssessment?.overallTeamScore ?? null,
        teamGrade: teamAssessment?.teamGrade ?? null,
        marketScore: marketAssessment?.overallMarketScore ?? null,
        marketGrade: marketAssessment?.marketGrade ?? null,
      },
    })
  } catch (error) {
    console.error('DD pipeline error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
