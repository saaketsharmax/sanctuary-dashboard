// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY API — Founder Investment Endpoint
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { createDb } from '@sanctuary/database'
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
      // No DB — return mock data so the UI is still usable
      const mock = generateInvestmentMockData()
      return returnViewFiltered(mock.investment, mock.transactions, view, mock.cashDashboard, true)
    }

    const supabase = await createClient()
    const db = createDb({ type: 'supabase-client', client: supabase })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      // Not logged in — return mock data so the page isn't blank
      const mock = generateInvestmentMockData()
      return returnViewFiltered(mock.investment, mock.transactions, view, mock.cashDashboard, true)
    }

    // Find the founder's application
    const { data: applicationList } = await db.applications.getByUserId(user.id)

    const application = Array.isArray(applicationList) ? applicationList[0] : applicationList

    if (!application) {
      // No application — return mock data
      const mock = generateInvestmentMockData()
      return returnViewFiltered(mock.investment, mock.transactions, view, mock.cashDashboard, true)
    }

    // Find the investment for this application
    const { data: investment } = await db.investments.getByApplicationId(application.id)

    if (!investment) {
      // No investment — return mock data
      const mock = generateInvestmentMockData()
      return returnViewFiltered(mock.investment, mock.transactions, view, mock.cashDashboard, true)
    }

    // Get all transactions for this investment
    const { data: transactions } = await db.investments.getTransactions(investment.id)

    const txns = transactions || []

    // Compute balances from approved transactions
    const approvedTxns = txns.filter((t) => t.status === 'approved')
    const pendingTxns = txns.filter((t) => t.status === 'pending')

    const cashUsed = approvedTxns
      .filter((t) => t.type === 'cash_disbursement')
      .reduce((sum: number, t) => sum + (t.amount_cents as number), 0)

    const creditsUsed = approvedTxns
      .filter((t) => t.type === 'credit_usage')
      .reduce((sum: number, t) => sum + (t.amount_cents as number), 0)

    const pendingCash = pendingTxns
      .filter((t) => t.type === 'cash_disbursement')
      .reduce((sum: number, t) => sum + (t.amount_cents as number), 0)

    const pendingCredits = pendingTxns
      .filter((t) => t.type === 'credit_usage')
      .reduce((sum: number, t) => sum + (t.amount_cents as number), 0)

    // Compute per-category credit usage
    const creditsByCategory: Record<string, number> = {}
    const pendingByCategory: Record<string, number> = {}

    for (const t of approvedTxns.filter((t) => t.type === 'credit_usage')) {
      const cat = t.credit_category as string | null
      if (cat) {
        creditsByCategory[cat] = (creditsByCategory[cat] || 0) + (t.amount_cents as number)
      }
    }

    for (const t of pendingTxns.filter((t) => t.type === 'credit_usage')) {
      const cat = t.credit_category as string | null
      if (cat) {
        pendingByCategory[cat] = (pendingByCategory[cat] || 0) + (t.amount_cents as number)
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
      cashRemaining: (investment.cash_amount_cents as number) - cashUsed,
      creditsRemaining: (investment.credits_amount_cents as number) - creditsUsed,
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (formattedTransactions as any[]).filter((t) => t.type === 'cash_disbursement'),
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
