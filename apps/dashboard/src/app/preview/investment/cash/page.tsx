'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@sanctuary/ui'
import { useMemo } from 'react'
import {
  BalanceCard,
  TransactionTable,
  RunwayCard,
  ExpenseBreakdown,
  MonthlySpendChart,
} from '@/components/investment'
import { generateInvestmentMockData } from '@/lib/mock-data/investment-mock'
import type { CashExpenseCategory } from '@/types'
import { DollarSign } from 'lucide-react'

export default function PreviewCashPage() {
  const { investment, transactions, cashDashboard } = useMemo(
    () => generateInvestmentMockData(),
    []
  )

  const cashTransactions = transactions.filter((t) => t.type === 'cash_disbursement')

  const filterByStatus = (status: string) =>
    cashTransactions.filter((t) => t.status === status)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cash Investment</h1>
        <p className="text-muted-foreground mt-1">{investment.companyName}</p>
      </div>

      {/* Sub-nav (static for preview) */}
      <div className="flex gap-6 border-b mb-6">
        <span className="pb-2 text-sm font-medium border-b-2 border-primary text-primary -mb-px">
          Cash Investment
        </span>
        <a
          href="/preview/investment/credits"
          className="pb-2 text-sm font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground -mb-px"
        >
          Service Credits
        </a>
      </div>

      {/* Balance Card */}
      <BalanceCard
        label="Cash Remaining"
        totalCents={investment.cashAmountCents}
        usedCents={investment.cashUsed}
        pendingCents={investment.pendingCash}
        colorClass="text-green-600 dark:text-green-400"
      />

      {/* Runway */}
      <RunwayCard
        cashRemaining={investment.cashRemaining}
        monthlyBurnRate={cashDashboard.monthlyBurnRate}
        runwayMonths={cashDashboard.runwayMonths}
      />

      {/* Expense Breakdown */}
      <ExpenseBreakdown
        expensesByCategory={cashDashboard.expensesByCategory as Partial<Record<CashExpenseCategory, number>>}
        totalCashCents={investment.cashAmountCents}
      />

      {/* Monthly Spend Chart */}
      <MonthlySpendChart data={cashDashboard.monthlySpend} />

      {/* Request Button (disabled in preview) */}
      <Button disabled>
        <DollarSign className="h-4 w-4 mr-2" />
        Request Cash Disbursement
      </Button>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({cashTransactions.length})</TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({filterByStatus('pending').length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({filterByStatus('approved').length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <TransactionTable transactions={cashTransactions} hideCategory hideType />
            </TabsContent>
            <TabsContent value="pending">
              <TransactionTable transactions={filterByStatus('pending')} hideCategory hideType />
            </TabsContent>
            <TabsContent value="approved">
              <TransactionTable transactions={filterByStatus('approved')} hideCategory hideType />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
