'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { useEffect, useState, useCallback, use } from 'react'
import { BalanceCard, TransactionTable, CreditCategoryBadge } from '@/components/investment'
import {
  formatInvestmentCurrency,
  CREDIT_CATEGORIES,
  type InvestmentWithBalances,
  type InvestmentTransaction,
  type CreditCategory,
} from '@/types'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useInvestmentRealtime } from '@/hooks/use-investment-realtime'
import Link from 'next/link'

export default function PartnerInvestmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [investment, setInvestment] = useState<InvestmentWithBalances | null>(null)
  const [transactions, setTransactions] = useState<InvestmentTransaction[]>([])
  const [creditsByCategory, setCreditsByCategory] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/partner/investments/${id}`)
      if (res.ok) {
        const data = await res.json()
        setInvestment(data.investment)
        setTransactions(data.transactions || [])
        setCreditsByCategory(data.creditsByCategory || {})
      }
    } catch (err) {
      console.error('Failed to fetch investment:', err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  useInvestmentRealtime({
    investmentId: id,
    isMock: false,
    onUpdate: fetchData,
    onEvent: (payload) => {
      if (payload.eventType === 'INSERT') {
        const rec = payload.new as Record<string, unknown>
        toast.info(`New request: ${rec.title} (${formatInvestmentCurrency(rec.amount_cents as number)})`)
      } else if (payload.eventType === 'UPDATE') {
        const rec = payload.new as Record<string, unknown>
        if (rec.status === 'cancelled') {
          toast.info(`Request cancelled: ${rec.title}`)
        }
      }
    },
  })

  const handleAction = async (transactionId: string, action: 'approve' | 'deny') => {
    try {
      const res = await fetch('/api/partner/investments/transactions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, action }),
      })
      if (res.ok) {
        await fetchData()
      }
    } catch (err) {
      console.error(`Failed to ${action}:`, err)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Loading investment details...</p>
      </div>
    )
  }

  if (!investment) {
    return (
      <div className="space-y-4">
        <Link href="/partner/investments">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Investments
          </Button>
        </Link>
        <p className="text-muted-foreground">Investment not found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/partner/investments">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{investment.companyName}</h1>
          <p className="text-muted-foreground mt-1">Investment Detail</p>
        </div>
        <Badge
          className={
            investment.status === 'active'
              ? 'bg-green-100 text-green-600'
              : 'bg-muted text-foreground'
          }
        >
          {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
        </Badge>
      </div>

      {/* Balance Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <BalanceCard
          label="Cash Remaining"
          totalCents={investment.cashAmountCents}
          usedCents={investment.cashUsed}
          pendingCents={investment.pendingCash}
          colorClass="text-green-600"
        />
        <BalanceCard
          label="Credits Remaining"
          totalCents={investment.creditsAmountCents}
          usedCents={investment.creditsUsed}
          pendingCents={investment.pendingCredits}
          colorClass="text-blue-600"
        />
      </div>

      {/* Credit Breakdown by Category */}
      {Object.keys(creditsByCategory).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Credit Usage by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {CREDIT_CATEGORIES.map((cat) => {
                const used = creditsByCategory[cat.value] || 0
                return (
                  <div key={cat.value} className="space-y-1">
                    <CreditCategoryBadge category={cat.value as CreditCategory} />
                    <p className="text-lg font-semibold">{formatInvestmentCurrency(used)}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Transaction Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionTable
            transactions={transactions}
            onApprove={(id) => handleAction(id, 'approve')}
            onDeny={(id) => handleAction(id, 'deny')}
          />
        </CardContent>
      </Card>

      <Toaster />
    </div>
  )
}
