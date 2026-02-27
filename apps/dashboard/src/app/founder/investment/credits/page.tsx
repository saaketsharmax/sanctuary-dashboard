'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Toaster } from '@/components/ui/sonner'
import { useEffect, useState, useCallback } from 'react'
import {
  BalanceCard,
  TransactionTable,
  RequestDialog,
  CategoryBreakdown,
  CreditAnalytics,
  ServiceCatalog,
  InvestmentSubNav,
} from '@/components/investment'
import {
  type InvestmentWithBalances,
  type InvestmentTransaction,
  type TransactionType,
  type CreditService,
} from '@/types'
import { CreditCard, Loader2, Info } from 'lucide-react'
import { toast } from 'sonner'
import { useInvestmentRealtime } from '@/hooks/use-investment-realtime'

export default function CreditsInvestmentPage() {
  const [investment, setInvestment] = useState<InvestmentWithBalances | null>(null)
  const [transactions, setTransactions] = useState<InvestmentTransaction[]>([])
  const [isMock, setIsMock] = useState(false)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<CreditService | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/founder/investment?view=credits')
      if (res.ok) {
        const data = await res.json()
        setInvestment(data.investment)
        setTransactions(data.transactions || [])
        setIsMock(data.isMock || false)
      }
    } catch (err) {
      console.error('Failed to fetch investment:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  useInvestmentRealtime({
    investmentId: investment?.id ?? null,
    isMock,
    onUpdate: fetchData,
    onEvent: (payload) => {
      if (payload.eventType === 'UPDATE') {
        const rec = payload.new as Record<string, unknown>
        const status = rec.status as string
        const title = rec.title as string
        if (status === 'approved') toast.success(`Request approved: ${title}`)
        else if (status === 'denied') toast.error(`Request denied: ${title}`)
      }
    },
  })

  const handleSubmitRequest = async (data: {
    investmentId: string
    type: TransactionType
    creditCategory: string | null
    amountCents: number
    title: string
    description: string
  }) => {
    const res = await fetch('/api/founder/investment/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to submit request')
    }
    await fetchData()
  }

  const handleCancel = async (transactionId: string) => {
    try {
      const res = await fetch('/api/founder/investment/transactions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, action: 'cancel' }),
      })
      if (res.ok) {
        await fetchData()
      }
    } catch (err) {
      console.error('Failed to cancel:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Loading service credits...</p>
      </div>
    )
  }

  if (!investment) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold">Service Credits</h1>
        <InvestmentSubNav />
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-lg font-medium">No Investment Yet</p>
              <p className="text-muted-foreground mt-1">
                Your credits will appear here once your application is approved.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const filterByStatus = (status: string | null) =>
    status ? transactions.filter((t) => t.status === status) : transactions

  return (
    <div className="space-y-6">
      {/* Mock data banner */}
      {isMock && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-600">
          <Info className="h-4 w-4 shrink-0" />
          <p>Showing sample data. Real transactions will appear once your investment is active.</p>
        </div>
      )}

      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Service Credits</h1>
        <p className="text-muted-foreground mt-1">{investment.companyName}</p>
      </div>

      <InvestmentSubNav />

      {/* Balance Card — credits only */}
      <BalanceCard
        label="Credits Remaining"
        totalCents={investment.creditsAmountCents}
        usedCents={investment.creditsUsed}
        pendingCents={investment.pendingCredits}
        colorClass="text-blue-600"
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
        transactions={transactions}
      />

      {/* Request Button */}
      <Button
        variant="outline"
        onClick={() => { setSelectedService(null); setDialogOpen(true) }}
      >
        <CreditCard className="h-4 w-4 mr-2" />
        Request Credit Usage
      </Button>

      {/* Service Catalog */}
      <ServiceCatalog
        onSelectService={(service) => {
          setSelectedService(service)
          setDialogOpen(true)
        }}
      />

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Credit Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({transactions.length})</TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({filterByStatus('pending').length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({filterByStatus('approved').length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <TransactionTable transactions={transactions} onCancel={handleCancel} hideType />
            </TabsContent>
            <TabsContent value="pending">
              <TransactionTable transactions={filterByStatus('pending')} onCancel={handleCancel} hideType />
            </TabsContent>
            <TabsContent value="approved">
              <TransactionTable transactions={filterByStatus('approved')} hideType />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Request Dialog — locked to credit_usage */}
      <RequestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        investmentId={investment.id}
        defaultType="credit_usage"
        creditsByCategory={investment.creditsByCategory}
        pendingByCategory={investment.pendingByCategory}
        totalCreditsCents={investment.creditsAmountCents}
        prefilledService={selectedService}
        onSubmit={handleSubmitRequest}
      />

      <Toaster />
    </div>
  )
}
