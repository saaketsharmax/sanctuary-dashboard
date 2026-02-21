import { subMonths, format, startOfMonth } from 'date-fns'
import type {
  InvestmentWithBalances,
  InvestmentTransaction,
  CashDashboardData,
  CashExpenseCategory,
} from '@/types'

function id(prefix: string, n: number) {
  return `${prefix}-mock-${String(n).padStart(3, '0')}`
}

export function generateInvestmentMockData() {
  const now = new Date()
  const month0 = startOfMonth(now) // current month
  const month1 = subMonths(month0, 1)
  const month2 = subMonths(month0, 2)

  const fmtDate = (d: Date, day: number) => {
    const dt = new Date(d)
    dt.setDate(day)
    return dt.toISOString()
  }

  // ── Cash transactions ──────────────────────────────────
  const cashTxns: InvestmentTransaction[] = [
    // Month -2 (e.g., Dec)
    { id: id('ctxn', 1), investmentId: 'inv-mock', type: 'cash_disbursement', creditCategory: null, cashExpenseCategory: 'salaries' as CashExpenseCategory, amountCents: 450_000, title: 'Contractor payment', description: null, status: 'approved', requestedBy: 'user-mock', reviewedBy: 'partner-mock', reviewedAt: fmtDate(month2, 8), createdAt: fmtDate(month2, 5), updatedAt: fmtDate(month2, 8) },
    { id: id('ctxn', 2), investmentId: 'inv-mock', type: 'cash_disbursement', creditCategory: null, cashExpenseCategory: 'software' as CashExpenseCategory, amountCents: 85_000, title: 'Dev tools & subscriptions', description: null, status: 'approved', requestedBy: 'user-mock', reviewedBy: 'partner-mock', reviewedAt: fmtDate(month2, 12), createdAt: fmtDate(month2, 10), updatedAt: fmtDate(month2, 12) },
    { id: id('ctxn', 3), investmentId: 'inv-mock', type: 'cash_disbursement', creditCategory: null, cashExpenseCategory: 'legal' as CashExpenseCategory, amountCents: 150_000, title: 'Incorporation & compliance', description: null, status: 'approved', requestedBy: 'user-mock', reviewedBy: 'partner-mock', reviewedAt: fmtDate(month2, 20), createdAt: fmtDate(month2, 18), updatedAt: fmtDate(month2, 20) },
    // Month -1 (e.g., Jan)
    { id: id('ctxn', 4), investmentId: 'inv-mock', type: 'cash_disbursement', creditCategory: null, cashExpenseCategory: 'salaries' as CashExpenseCategory, amountCents: 450_000, title: 'Contractor payment', description: null, status: 'approved', requestedBy: 'user-mock', reviewedBy: 'partner-mock', reviewedAt: fmtDate(month1, 8), createdAt: fmtDate(month1, 5), updatedAt: fmtDate(month1, 8) },
    { id: id('ctxn', 5), investmentId: 'inv-mock', type: 'cash_disbursement', creditCategory: null, cashExpenseCategory: 'software' as CashExpenseCategory, amountCents: 85_000, title: 'Design tool license', description: null, status: 'approved', requestedBy: 'user-mock', reviewedBy: 'partner-mock', reviewedAt: fmtDate(month1, 14), createdAt: fmtDate(month1, 12), updatedAt: fmtDate(month1, 14) },
    { id: id('ctxn', 6), investmentId: 'inv-mock', type: 'cash_disbursement', creditCategory: null, cashExpenseCategory: 'marketing' as CashExpenseCategory, amountCents: 120_000, title: 'Initial ad campaign', description: null, status: 'approved', requestedBy: 'user-mock', reviewedBy: 'partner-mock', reviewedAt: fmtDate(month1, 20), createdAt: fmtDate(month1, 18), updatedAt: fmtDate(month1, 20) },
    { id: id('ctxn', 7), investmentId: 'inv-mock', type: 'cash_disbursement', creditCategory: null, cashExpenseCategory: 'misc' as CashExpenseCategory, amountCents: 45_000, title: 'Office supplies', description: null, status: 'approved', requestedBy: 'user-mock', reviewedBy: 'partner-mock', reviewedAt: fmtDate(month1, 25), createdAt: fmtDate(month1, 22), updatedAt: fmtDate(month1, 25) },
    // Current month (e.g., Feb)
    { id: id('ctxn', 8), investmentId: 'inv-mock', type: 'cash_disbursement', creditCategory: null, cashExpenseCategory: 'salaries' as CashExpenseCategory, amountCents: 450_000, title: 'Contractor payment', description: null, status: 'approved', requestedBy: 'user-mock', reviewedBy: 'partner-mock', reviewedAt: fmtDate(month0, 8), createdAt: fmtDate(month0, 5), updatedAt: fmtDate(month0, 8) },
    { id: id('ctxn', 9), investmentId: 'inv-mock', type: 'cash_disbursement', creditCategory: null, cashExpenseCategory: 'software' as CashExpenseCategory, amountCents: 125_000, title: 'New SaaS license', description: null, status: 'approved', requestedBy: 'user-mock', reviewedBy: 'partner-mock', reviewedAt: fmtDate(month0, 14), createdAt: fmtDate(month0, 12), updatedAt: fmtDate(month0, 14) },
    // Pending
    { id: id('ctxn', 10), investmentId: 'inv-mock', type: 'cash_disbursement', creditCategory: null, cashExpenseCategory: 'marketing' as CashExpenseCategory, amountCents: 250_000, title: 'Content campaign', description: null, status: 'pending', requestedBy: 'user-mock', reviewedBy: null, reviewedAt: null, createdAt: fmtDate(month0, 15), updatedAt: fmtDate(month0, 15) },
  ]

  // ── Credit transactions ────────────────────────────────
  const creditTxns: InvestmentTransaction[] = [
    { id: id('crtxn', 1), investmentId: 'inv-mock', type: 'credit_usage', creditCategory: 'space', cashExpenseCategory: null, amountCents: 150_000, title: 'Coworking Desk (3 months)', description: null, status: 'approved', requestedBy: 'user-mock', reviewedBy: 'partner-mock', reviewedAt: fmtDate(month2, 10), createdAt: fmtDate(month2, 8), updatedAt: fmtDate(month2, 10) },
    { id: id('crtxn', 2), investmentId: 'inv-mock', type: 'credit_usage', creditCategory: 'design', cashExpenseCategory: null, amountCents: 250_000, title: 'Pitch Deck Design', description: null, status: 'approved', requestedBy: 'user-mock', reviewedBy: 'partner-mock', reviewedAt: fmtDate(month1, 15), createdAt: fmtDate(month1, 12), updatedAt: fmtDate(month1, 15) },
    { id: id('crtxn', 3), investmentId: 'inv-mock', type: 'credit_usage', creditCategory: 'design', cashExpenseCategory: null, amountCents: 500_000, title: 'Brand Identity', description: null, status: 'approved', requestedBy: 'user-mock', reviewedBy: 'partner-mock', reviewedAt: fmtDate(month1, 22), createdAt: fmtDate(month1, 20), updatedAt: fmtDate(month1, 22) },
    { id: id('crtxn', 4), investmentId: 'inv-mock', type: 'credit_usage', creditCategory: 'gtm', cashExpenseCategory: null, amountCents: 200_000, title: 'Social Media Setup', description: null, status: 'approved', requestedBy: 'user-mock', reviewedBy: 'partner-mock', reviewedAt: fmtDate(month0, 5), createdAt: fmtDate(month0, 3), updatedAt: fmtDate(month0, 5) },
    // Pending
    { id: id('crtxn', 5), investmentId: 'inv-mock', type: 'credit_usage', creditCategory: 'launch_media', cashExpenseCategory: null, amountCents: 300_000, title: 'Press Kit', description: null, status: 'pending', requestedBy: 'user-mock', reviewedBy: null, reviewedAt: null, createdAt: fmtDate(month0, 16), updatedAt: fmtDate(month0, 16) },
  ]

  const allTransactions = [...cashTxns, ...creditTxns].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  // ── Compute balances ───────────────────────────────────
  const approvedCash = cashTxns.filter((t) => t.status === 'approved')
  const approvedCredits = creditTxns.filter((t) => t.status === 'approved')

  const cashUsed = approvedCash.reduce((s, t) => s + t.amountCents, 0)
  const creditsUsed = approvedCredits.reduce((s, t) => s + t.amountCents, 0)
  const pendingCash = cashTxns.filter((t) => t.status === 'pending').reduce((s, t) => s + t.amountCents, 0)
  const pendingCredits = creditTxns.filter((t) => t.status === 'pending').reduce((s, t) => s + t.amountCents, 0)

  const cashTotal = 5_000_000 // $50,000
  const creditsTotal = 5_000_000

  // Credit category breakdowns
  const creditsByCategory: Record<string, number> = {}
  const pendingByCategory: Record<string, number> = {}
  for (const t of approvedCredits) {
    if (t.creditCategory) creditsByCategory[t.creditCategory] = (creditsByCategory[t.creditCategory] || 0) + t.amountCents
  }
  for (const t of creditTxns.filter((t) => t.status === 'pending')) {
    if (t.creditCategory) pendingByCategory[t.creditCategory] = (pendingByCategory[t.creditCategory] || 0) + t.amountCents
  }

  const investment: InvestmentWithBalances = {
    id: 'inv-mock',
    applicationId: 'app-mock',
    startupId: 'startup-mock',
    cashAmountCents: cashTotal,
    creditsAmountCents: creditsTotal,
    status: 'active',
    approvedBy: 'partner-mock',
    approvedAt: fmtDate(month2, 1),
    createdAt: fmtDate(month2, 1),
    updatedAt: fmtDate(month0, 15),
    cashRemaining: cashTotal - cashUsed,
    creditsRemaining: creditsTotal - creditsUsed,
    cashUsed,
    creditsUsed,
    pendingCash,
    pendingCredits,
    companyName: 'Acme Startup',
    creditsByCategory,
    pendingByCategory,
  }

  // ── Cash dashboard data ────────────────────────────────
  const monthlySpendMap: Record<string, number> = {}
  for (const t of approvedCash) {
    const key = format(new Date(t.createdAt), 'MMM yyyy')
    monthlySpendMap[key] = (monthlySpendMap[key] || 0) + t.amountCents
  }

  const monthlySpend = [month2, month1, month0].map((m) => {
    const key = format(m, 'MMM yyyy')
    return { month: key, amount: monthlySpendMap[key] || 0 }
  })

  const totalApprovedCash = approvedCash.reduce((s, t) => s + t.amountCents, 0)
  const monthCount = monthlySpend.filter((m) => m.amount > 0).length || 1
  const monthlyBurnRate = Math.round(totalApprovedCash / monthCount)
  const runwayMonths = monthlyBurnRate > 0 ? Math.floor((cashTotal - cashUsed) / monthlyBurnRate) : 0

  const expensesByCategory: Record<string, number> = {}
  for (const t of approvedCash) {
    const cat = t.cashExpenseCategory || 'misc'
    expensesByCategory[cat] = (expensesByCategory[cat] || 0) + t.amountCents
  }

  const cashDashboard: CashDashboardData = {
    monthlyBurnRate,
    runwayMonths,
    expensesByCategory,
    monthlySpend,
  }

  return {
    investment,
    transactions: allTransactions,
    cashDashboard,
    isMock: true,
  }
}
