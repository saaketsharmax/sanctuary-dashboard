// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY API — DD Claims Endpoint
// GET: Return all claims for an application (filterable)
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/applications/[id]/dd/claims
 * Return all claims with verifications, filterable by category/status/priority
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  try {
    const supabase = createAdminClient()
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const status = url.searchParams.get('status')
    const priority = url.searchParams.get('priority')

    // Build query
    let query = supabase
      .from('dd_claims')
      .select('*')
      .eq('application_id', id)

    if (category) query = query.eq('category', category)
    if (status) query = query.eq('status', status)
    if (priority) query = query.eq('priority', priority)

    query = query.order('priority', { ascending: true }).order('category')

    const { data: claims, error } = await query

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch claims' }, { status: 500 })
    }

    if (!claims || claims.length === 0) {
      return NextResponse.json({ success: true, claims: [], verifications: [] })
    }

    // Fetch verifications for all claims
    const claimIds = claims.map((c: any) => c.id)
    const { data: verifications } = await supabase
      .from('dd_verifications')
      .select('*')
      .in('claim_id', claimIds)

    // Map to camelCase
    const formattedClaims = claims.map((c: any) => ({
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
        })),
    }))

    return NextResponse.json({
      success: true,
      claims: formattedClaims,
      total: formattedClaims.length,
    })
  } catch (error) {
    console.error('DD claims GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
