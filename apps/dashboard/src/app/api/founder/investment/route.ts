// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY API — Founder Investment Endpoint
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { generateInvestmentMockData } from '@/lib/mock-data/investment-mock'
import { format } from 'date-fns'

/**
 * GET /api/founder/investment?view=cash|credits
 * Get the founder's investment with computed balances + transaction history.
 * Falls back to mock data when no investment exists.
 */
export async function GET(request: NextRequest) {
  try {
    const view = request.nextUrl.searchParams.get('view') // 'cash' | 'credits' | null

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the founder's application
    const { data: application } = await supabase
      .from('applications')
      .select('id, company_name, status')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!application) {
      // No application — return mock data
      const mock = generateInvestmentMockData()
      return returnViewFiltered(mock.investment, mock.transactions, view, mock.cashDashboard, true)
    }

    // Find the investment for this application
    const { data: investment } = await supabase
      .from('investments')
      .select('*')
      .eq('application_id', application.id)
      .single()

    if (!investment) {
      // No investment — return mock data
      const mock = generateInvestmentMockData()
      return returnViewFiltered(mock.investment, mock.transactions, view, mock.cashDashboard, true)
    }

    // Get all transactions for this investment
    const { data: transactions } = await supabase
      .from('investment_transactions')
      .select('*')
      .eq('investment_id', investment.id)
      .order('created_at', { ascending: false })

    const txns = transactions || []

    // Compute balances from approved transactions
    const approvedTxns = txns.filter((t: { status: string }) => t.status === 'approved')
    const pendingTxns = txns.filter((t: { status: string }) => t.status === 'pending')

    const cashUsed = approvedTxns
      .filter((t: { type: string }) => t.type === 'cash_disbursement')
      .reduce((sum: number, t: { amount_cents: number }) => sum + t.amount_cents, 0)

    const creditsUsed = approvedTxns
      .filter((t: { type: string }) => t.type === 'credit_usage')
      .reduce((sum: number, t: { amount_cents: number }) => sum + t.amount_cents, 0)

    const pendingCash = pendingTxns
      .filter((t: { type: string }) => t.type === 'cash_disbursement')
      .reduce((sum: number, t: { amount_cents: number }) => sum + t.amount_cents, 0)

    const pendingCredits = pendingTxns
      .filter((t: { type: string }) => t.type === 'credit_usage')
      .reduce((sum: number, t: { amount_cents: number }) => sum + t.amount_cents, 0)

    // Compute per-category credit usage
    const creditsByCategory: Record<string, number> = {}
    const pendingByCategory: Record<string, number> = {}

    for (const t of approvedTxns.filter((t: { type: string }) => t.type === 'credit_usage')) {
      const cat = (t as { credit_category: string | null }).credit_category
      if (cat) {
        creditsByCategory[cat] = (creditsByCategory[cat] || 0) + (t as { amount_cents: number }).amount_cents
      }
    }

    for (const t of pendingTxns.filter((t: { type: string }) => t.type === 'credit_usage')) {
      const cat = (t as { credit_category: string | null }).credit_category
      if (cat) {
        pendingByCategory[cat] = (pendingByCategory[cat] || 0) + (t as { amount_cents: number }).amount_cents
      }
    }

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
      companyName: application.company_name,
      creditsByCategory,
      pendingByCategory,
    }

    const formattedTransactions = txns.map((t: Record<string, unknown>) => ({
      id: t.id,
      investmentId: t.investment_id,
      type: t.type,
      creditCategory: t.credit_category,
      cashExpenseCategory: t.cash_expense_category || null,
      amountCents: t.amount_cents,
      title: t.title,
      description: t.description,
      status: t.status,
      requestedBy: t.requested_by,
      reviewedBy: t.reviewed_by,
      reviewedAt: t.reviewed_at,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    }))

    // Compute cashDashboard for cash view
    const cashDashboard = computeCashDashboard(
      formattedTransactions.filter((t: { type: string }) => t.type === 'cash_disbursement'),
      formattedInvestment.cashRemaining
    )

    return returnViewFiltered(formattedInvestment, formattedTransactions, view, cashDashboard, false)
  } catch (error) {
    console.error('Founder investment API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── Helpers ────────────────────────────────────────────

function computeCashDashboard(
  cashTxns: { status: string; amountCents: number; createdAt: string; cashExpenseCategory?: string | null }[],
  cashRemaining: number
) {
  const approved = cashTxns.filter((t) => t.status === 'approved')

  // Group by month
  const monthlyMap: Record<string, number> = {}
  for (const t of approved) {
    const key = format(new Date(t.createdAt), 'MMM yyyy')
    monthlyMap[key] = (monthlyMap[key] || 0) + t.amountCents
  }

  const monthlySpend = Object.entries(monthlyMap)
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())

  // Burn rate = average of months with spend
  const totalSpent = approved.reduce((s, t) => s + t.amountCents, 0)
  const monthCount = monthlySpend.length || 1
  const monthlyBurnRate = Math.round(totalSpent / monthCount)
  const runwayMonths = monthlyBurnRate > 0 ? Math.floor(cashRemaining / monthlyBurnRate) : 0

  // Category sums
  const expensesByCategory: Record<string, number> = {}
  for (const t of approved) {
    const cat = t.cashExpenseCategory || 'misc'
    expensesByCategory[cat] = (expensesByCategory[cat] || 0) + t.amountCents
  }

  return { monthlyBurnRate, runwayMonths, expensesByCategory, monthlySpend }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function returnViewFiltered(
  investment: any,
  transactions: any[],
  view: string | null,
  cashDashboard: any,
  isMock: boolean
) {
  if (view === 'cash') {
    return NextResponse.json({
      success: true,
      investment,
      transactions: transactions.filter((t) => t.type === 'cash_disbursement'),
      cashDashboard,
      isMock,
    })
  }

  if (view === 'credits') {
    return NextResponse.json({
      success: true,
      investment,
      transactions: transactions.filter((t) => t.type === 'credit_usage'),
      isMock,
    })
  }

  // Default: return everything (backward compat)
  return NextResponse.json({
    success: true,
    investment,
    transactions,
    cashDashboard,
    isMock,
  })
}
