// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY API — Partner Single Investment Detail
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/partner/investments/[id]
 * Single investment detail with transactions
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (profile?.user_type !== 'partner') {
      return NextResponse.json({ error: 'Only partners can view investments' }, { status: 403 })
    }

    // Fetch investment with application name
    const { data: investment, error: invError } = await supabase
      .from('investments')
      .select('*, applications!inner(company_name)')
      .eq('id', id)
      .single()

    if (invError || !investment) {
      return NextResponse.json({ error: 'Investment not found' }, { status: 404 })
    }

    // Fetch all transactions
    const { data: transactions } = await supabase
      .from('investment_transactions')
      .select(`
        *,
        requester:users!investment_transactions_requested_by_fkey(name),
        reviewer:users!investment_transactions_reviewed_by_fkey(name)
      `)
      .eq('investment_id', id)
      .order('created_at', { ascending: false })

    const txns = transactions || []
    const approved = txns.filter((t: { status: string }) => t.status === 'approved')
    const pending = txns.filter((t: { status: string }) => t.status === 'pending')

    const cashUsed = approved
      .filter((t: { type: string }) => t.type === 'cash_disbursement')
      .reduce((sum: number, t: { amount_cents: number }) => sum + t.amount_cents, 0)

    const creditsUsed = approved
      .filter((t: { type: string }) => t.type === 'credit_usage')
      .reduce((sum: number, t: { amount_cents: number }) => sum + t.amount_cents, 0)

    const pendingCash = pending
      .filter((t: { type: string }) => t.type === 'cash_disbursement')
      .reduce((sum: number, t: { amount_cents: number }) => sum + t.amount_cents, 0)

    const pendingCredits = pending
      .filter((t: { type: string }) => t.type === 'credit_usage')
      .reduce((sum: number, t: { amount_cents: number }) => sum + t.amount_cents, 0)

    const app = investment.applications as { company_name: string }

    // Credit breakdown by category (approved only)
    const creditsByCategory: Record<string, number> = {}
    approved
      .filter((t: { type: string }) => t.type === 'credit_usage')
      .forEach((t: { credit_category: string; amount_cents: number }) => {
        const cat = t.credit_category || 'unknown'
        creditsByCategory[cat] = (creditsByCategory[cat] || 0) + t.amount_cents
      })

    const formattedInvestment = {
      id: investment.id,
      applicationId: investment.application_id,
      startupId: investment.startup_id,
      cashAmountCents: investment.cash_amount_cents,
      creditsAmountCents: investment.credits_amount_cents,
      status: investment.status,
      approvedBy: investment.approved_by,
      approvedAt: investment.approved_at,
      createdAt: investment.created_at,
      updatedAt: investment.updated_at,
      cashRemaining: investment.cash_amount_cents - cashUsed,
      creditsRemaining: investment.credits_amount_cents - creditsUsed,
      cashUsed,
      creditsUsed,
      pendingCash,
      pendingCredits,
      companyName: app.company_name,
    }

    const formattedTransactions = txns.map((t: Record<string, unknown>) => {
      const requester = t.requester as { name: string } | null
      const reviewer = t.reviewer as { name: string } | null
      return {
        id: t.id,
        investmentId: t.investment_id,
        type: t.type,
        creditCategory: t.credit_category,
        amountCents: t.amount_cents,
        title: t.title,
        description: t.description,
        status: t.status,
        requestedBy: t.requested_by,
        reviewedBy: t.reviewed_by,
        reviewedAt: t.reviewed_at,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
        requesterName: requester?.name || null,
        reviewerName: reviewer?.name || null,
      }
    })

    return NextResponse.json({
      success: true,
      investment: formattedInvestment,
      transactions: formattedTransactions,
      creditsByCategory,
    })
  } catch (error) {
    console.error('Partner investment detail error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
