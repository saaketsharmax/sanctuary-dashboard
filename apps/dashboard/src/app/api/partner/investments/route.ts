// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY API — Partner Investments (Portfolio View)
// ═══════════════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'

/**
 * GET /api/partner/investments
 * Portfolio-wide investment summary with aggregated stats
 */
export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check partner role
    const { data: profile } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (profile?.user_type !== 'partner') {
      return NextResponse.json({ error: 'Only partners can view investments' }, { status: 403 })
    }

    // Fetch all investments with application company names
    const { data: investments, error: investError } = await supabase
      .from('investments')
      .select('*, applications!inner(company_name)')
      .order('created_at', { ascending: false })

    if (investError) {
      console.error('Investments fetch error:', investError)
      return NextResponse.json({ error: 'Failed to fetch investments' }, { status: 500 })
    }

    // Fetch all approved transactions in one go
    const investmentIds = (investments || []).map((i: { id: string }) => i.id)

    let allTransactions: Record<string, unknown>[] = []
    if (investmentIds.length > 0) {
      const { data: txns } = await supabase
        .from('investment_transactions')
        .select('*')
        .in('investment_id', investmentIds)

      allTransactions = txns || []
    }

    // Count pending requests
    const pendingRequests = allTransactions.filter(
      (t: Record<string, unknown>) => t.status === 'pending'
    ).length

    // Build per-investment balances
    let totalCashDeployed = 0
    let totalCreditsUsed = 0
    let totalCashRemaining = 0
    let totalCreditsRemaining = 0

    const formattedInvestments = (investments || []).map((inv: Record<string, unknown>) => {
      const invTxns = allTransactions.filter(
        (t: Record<string, unknown>) => t.investment_id === inv.id
      )
      const approved = invTxns.filter((t: Record<string, unknown>) => t.status === 'approved')
      const pending = invTxns.filter((t: Record<string, unknown>) => t.status === 'pending')

      const cashUsed = approved
        .filter((t: Record<string, unknown>) => t.type === 'cash_disbursement')
        .reduce((sum: number, t: Record<string, unknown>) => sum + (t.amount_cents as number), 0)

      const creditsUsed = approved
        .filter((t: Record<string, unknown>) => t.type === 'credit_usage')
        .reduce((sum: number, t: Record<string, unknown>) => sum + (t.amount_cents as number), 0)

      const pendingCash = pending
        .filter((t: Record<string, unknown>) => t.type === 'cash_disbursement')
        .reduce((sum: number, t: Record<string, unknown>) => sum + (t.amount_cents as number), 0)

      const pendingCredits = pending
        .filter((t: Record<string, unknown>) => t.type === 'credit_usage')
        .reduce((sum: number, t: Record<string, unknown>) => sum + (t.amount_cents as number), 0)

      const cashRemaining = (inv.cash_amount_cents as number) - cashUsed
      const creditsRemaining = (inv.credits_amount_cents as number) - creditsUsed

      totalCashDeployed += cashUsed
      totalCreditsUsed += creditsUsed
      totalCashRemaining += cashRemaining
      totalCreditsRemaining += creditsRemaining

      const app = inv.applications as { company_name: string }

      return {
        id: inv.id,
        applicationId: inv.application_id,
        startupId: inv.startup_id,
        cashAmountCents: inv.cash_amount_cents,
        creditsAmountCents: inv.credits_amount_cents,
        status: inv.status,
        approvedBy: inv.approved_by,
        approvedAt: inv.approved_at,
        createdAt: inv.created_at,
        updatedAt: inv.updated_at,
        cashRemaining,
        creditsRemaining,
        cashUsed,
        creditsUsed,
        pendingCash,
        pendingCredits,
        companyName: app.company_name,
      }
    })

    return NextResponse.json({
      success: true,
      summary: {
        totalInvestments: formattedInvestments.length,
        totalCashDeployed,
        totalCreditsUsed,
        totalCashRemaining,
        totalCreditsRemaining,
        pendingRequests,
        investments: formattedInvestments,
      },
    })
  } catch (error) {
    console.error('Partner investments API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
