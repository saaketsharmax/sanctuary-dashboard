// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY API — Due Diligence Pipeline Endpoint
// GET: Return DD status + summary
// POST: Kick off full DD pipeline
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { getClaimExtractionAgent } from '@/lib/ai/agents/claim-extraction-agent'
import { getClaimVerificationAgent } from '@/lib/ai/agents/claim-verification-agent'
import { getDocumentVerificationAgent } from '@/lib/ai/agents/document-verification-agent'
import { getDDReportGenerator } from '@/lib/ai/agents/dd-report-generator'
import type { DDClaim, DDVerification } from '@/lib/ai/types/due-diligence'

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
    const supabase = createAdminClient()

    const { data: application, error } = await supabase
      .from('applications')
      .select('id, dd_status, dd_report_id, dd_started_at, dd_completed_at')
      .eq('id', id)
      .single()

    if (error || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Get claims count
    const { count: claimsCount } = await supabase
      .from('dd_claims')
      .select('*', { count: 'exact', head: true })
      .eq('application_id', id)

    // Get report if exists
    let report = null
    if (application.dd_report_id) {
      const { data } = await supabase
        .from('dd_reports')
        .select('*')
        .eq('id', application.dd_report_id)
        .single()
      report = data
    }

    return NextResponse.json({
      success: true,
      ddStatus: application.dd_status || 'not_started',
      claimsCount: claimsCount || 0,
      startedAt: application.dd_started_at,
      completedAt: application.dd_completed_at,
      report: report ? {
        overallScore: report.overall_dd_score,
        grade: report.dd_grade,
        totalClaims: report.total_claims,
        verifiedClaims: report.verified_claims,
        refutedClaims: report.refuted_claims,
        verificationCoverage: report.verification_coverage,
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
    const supabase = createAdminClient()
    const body = await request.json().catch(() => ({}))

    // Fetch application
    const { data: application, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Check if DD already completed (unless force=true)
    if (application.dd_status === 'completed' && !body.force) {
      return NextResponse.json({
        success: true,
        message: 'DD already completed. Use force=true to re-run.',
        ddStatus: application.dd_status,
      })
    }

    // ─── Step 1: Mark as started ───
    await supabase
      .from('applications')
      .update({ dd_status: 'claims_extracted', dd_started_at: new Date().toISOString() })
      .eq('id', id)

    // ─── Step 2: Extract claims ───
    const extractionAgent = getClaimExtractionAgent()
    const founders = Array.isArray(application.founders) ? application.founders : []
    const extractionResult = await extractionAgent.extractClaims({
      applicationId: id,
      companyName: application.company_name,
      applicationData: {
        companyDescription: application.company_description,
        problemDescription: application.problem_description,
        solutionDescription: application.solution_description,
        targetCustomer: application.target_customer,
        stage: application.stage,
        userCount: application.user_count,
        mrr: application.mrr ? Number(application.mrr) : null,
        biggestChallenge: application.biggest_challenge,
        whySanctuary: application.why_sanctuary,
        whatTheyWant: application.what_they_want,
        companyWebsite: application.company_website,
      },
      founders: founders.map((f: any) => ({
        name: f.name || '',
        role: f.role || null,
        yearsExperience: f.yearsExperience || null,
        hasStartedBefore: f.hasStartedBefore || false,
        previousStartupOutcome: f.previousStartupOutcome || null,
        linkedin: f.linkedin || null,
      })),
      interviewTranscript: application.interview_transcript || null,
      researchData: application.research_data || null,
    })

    if (!extractionResult.success) {
      await supabase.from('applications').update({ dd_status: 'failed' }).eq('id', id)
      return NextResponse.json({ error: 'Claim extraction failed', details: extractionResult.error }, { status: 500 })
    }

    // Log extraction agent run
    await supabase.from('agent_runs').insert({
      agent_type: 'dd_claim_extraction',
      agent_version: '1.0.0',
      application_id: id,
      trigger_type: 'manual',
      status: 'completed',
      completed_at: new Date().toISOString(),
      output_summary: { totalClaims: extractionResult.metadata.totalClaims },
    })

    // Delete existing claims if re-running
    await supabase.from('dd_claims').delete().eq('application_id', id)

    // Insert claims into DB
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
    }))

    const { data: insertedClaims, error: insertError } = await supabase
      .from('dd_claims')
      .insert(claimInserts)
      .select('*')

    if (insertError || !insertedClaims) {
      console.error('Failed to insert claims:', insertError)
      await supabase.from('applications').update({ dd_status: 'failed' }).eq('id', id)
      return NextResponse.json({ error: 'Failed to store claims' }, { status: 500 })
    }

    // ─── Step 3: Verify claims ───
    await supabase.from('applications').update({ dd_status: 'ai_verification' }).eq('id', id)

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
      verifications: [],
    }))

    const verificationAgent = getClaimVerificationAgent()
    const verificationResult = await verificationAgent.verifyClaims({
      claims: dbClaims,
      companyName: application.company_name,
      companyWebsite: application.company_website,
    })

    // ─── Step 4: Document verification (if documents exist) ───
    let docVerifications: Omit<DDVerification, 'id'>[] = []
    if (application.startup_id) {
      const { data: documents } = await supabase
        .from('documents')
        .select('id, name, type, file_url')
        .eq('startup_id', application.startup_id)
        .eq('is_current', true)

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
          companyName: application.company_name,
        })
        if (docResult.success) {
          docVerifications = docResult.verifications
        }
      }
    }

    // ─── Step 5: Store verifications ───
    const allVerifications = [
      ...(verificationResult.success ? verificationResult.verifications : []),
      ...docVerifications,
    ]

    if (allVerifications.length > 0) {
      // Delete existing verifications for these claims
      const claimIds = dbClaims.map(c => c.id)
      await supabase.from('dd_verifications').delete().in('claim_id', claimIds)

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
      }))

      await supabase.from('dd_verifications').insert(verificationInserts)
    }

    // Log verification agent run
    await supabase.from('agent_runs').insert({
      agent_type: 'dd_claim_verification',
      agent_version: '1.0.0',
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

      await supabase
        .from('dd_claims')
        .update({ status: newStatus, verification_confidence: avgConfidence })
        .eq('id', claim.id)
    }

    // ─── Step 7: Re-fetch updated claims with verifications for report ───
    const { data: updatedClaims } = await supabase
      .from('dd_claims')
      .select('*')
      .eq('application_id', id)

    const { data: allDbVerifications } = await supabase
      .from('dd_verifications')
      .select('*')
      .in('claim_id', (updatedClaims || []).map((c: any) => c.id))

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
        })),
    }))

    // ─── Step 8: Generate DD report ───
    const reportGenerator = getDDReportGenerator()
    const reportResult = await reportGenerator.generateReport({
      applicationId: id,
      companyName: application.company_name,
      claims: fullClaims,
    })

    if (!reportResult.success || !reportResult.report) {
      await supabase.from('applications').update({ dd_status: 'failed' }).eq('id', id)
      return NextResponse.json({ error: 'Report generation failed', details: reportResult.error }, { status: 500 })
    }

    // Delete existing report if re-running
    await supabase.from('dd_reports').delete().eq('application_id', id)

    // Store report
    const { data: insertedReport, error: reportError } = await supabase
      .from('dd_reports')
      .insert({
        application_id: id,
        report_data: reportResult.report,
        overall_dd_score: reportResult.report.overallDDScore,
        dd_grade: reportResult.report.ddGrade,
        total_claims: fullClaims.length,
        verified_claims: fullClaims.filter(c => c.status === 'confirmed' || c.status === 'ai_verified').length,
        refuted_claims: fullClaims.filter(c => c.status === 'refuted').length,
        verification_coverage: reportResult.report.verificationCoverage,
      })
      .select('id')
      .single()

    if (reportError || !insertedReport) {
      console.error('Failed to insert report:', reportError)
    }

    // Log report generation
    await supabase.from('agent_runs').insert({
      agent_type: 'dd_report_generation',
      agent_version: '1.0.0',
      application_id: id,
      trigger_type: 'manual',
      status: 'completed',
      completed_at: new Date().toISOString(),
      output_summary: { score: reportResult.report.overallDDScore, grade: reportResult.report.ddGrade },
    })

    // ─── Step 9: Mark DD as completed ───
    await supabase
      .from('applications')
      .update({
        dd_status: 'completed',
        dd_completed_at: new Date().toISOString(),
        dd_report_id: insertedReport?.id || null,
      })
      .eq('id', id)

    return NextResponse.json({
      success: true,
      report: reportResult.report,
      metadata: {
        totalClaims: fullClaims.length,
        totalVerifications: allVerifications.length,
        score: reportResult.report.overallDDScore,
        grade: reportResult.report.ddGrade,
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
