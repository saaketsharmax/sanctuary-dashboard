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
  CategoryBreakdown,
  CreditAnalytics,
  ServiceCatalog,
} from '@/components/investment'
import { generateInvestmentMockData } from '@/lib/mock-data/investment-mock'
import { CreditCard } from 'lucide-react'

export default function PreviewCreditsPage() {
  const { investment, transactions } = useMemo(
    () => generateInvestmentMockData(),
    []
  )

  const creditTransactions = transactions.filter((t) => t.type === 'credit_usage')

  const filterByStatus = (status: string) =>
    creditTransactions.filter((t) => t.status === status)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Service Credits</h1>
        <p className="text-muted-foreground mt-1">{investment.companyName}</p>
      </div>

      {/* Sub-nav (static for preview) */}
      <div className="flex gap-6 border-b mb-6">
        <a
          href="/preview/investment/cash"
          className="pb-2 text-sm font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground -mb-px"
        >
          Cash Investment
        </a>
        <span className="pb-2 text-sm font-medium border-b-2 border-primary text-primary -mb-px">
          Service Credits
        </span>
      </div>

      {/* Balance Card */}
      <BalanceCard
        label="Credits Remaining"
        totalCents={investment.creditsAmountCents}
        usedCents={investment.creditsUsed}
        pendingCents={investment.pendingCredits}
        colorClass="text-blue-600 dark:text-blue-400"
      />

      {/* Category Breakdown */}
      <CategoryBreakdown
        totalCreditsCents={investment.creditsAmountCents}
        creditsByCategory={investment.creditsByCategory || {}}
        pendingByCategory={investment.pendingByCategory || {}}
      />

      {/* Usage Analytics */}
      <CreditAnalytics
        creditsByCategory={investment.creditsByCategory || {}}
        transactions={creditTransactions}
      />

      {/* Request Button (disabled in preview) */}
      <Button variant="outline" disabled>
        <CreditCard className="h-4 w-4 mr-2" />
        Request Credit Usage
      </Button>

      {/* Service Catalog */}
      <ServiceCatalog onSelectService={() => {}} />

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Credit Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({creditTransactions.length})</TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({filterByStatus('pending').length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({filterByStatus('approved').length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <TransactionTable transactions={creditTransactions} hideType />
            </TabsContent>
            <TabsContent value="pending">
              <TransactionTable transactions={filterByStatus('pending')} hideType />
            </TabsContent>
            <TabsContent value="approved">
              <TransactionTable transactions={filterByStatus('approved')} hideType />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
