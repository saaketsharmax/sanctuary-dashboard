'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Toaster,
} from '@sanctuary/ui'
import { useEffect, useState, useCallback } from 'react'
import { BalanceCard } from '@/components/investment'
import {
  formatInvestmentCurrency,
  type PortfolioInvestmentSummary,
  type InvestmentTransaction,
} from '@/types'
import { DollarSign, CreditCard, Clock, TrendingUp, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useInvestmentRealtime } from '@/hooks/use-investment-realtime'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  active: 'bg-success/15 text-success',
  frozen: 'bg-warning/15 text-warning',
  closed: 'bg-muted text-foreground',
}

export default function PartnerInvestmentsPage() {
  const [summary, setSummary] = useState<PortfolioInvestmentSummary | null>(null)
  const [pendingTxns, setPendingTxns] = useState<(InvestmentTransaction & { companyName?: string })[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [investRes, txnRes] = await Promise.all([
        fetch('/api/partner/investments'),
        fetch('/api/partner/investments/transactions?status=pending'),
      ])

      if (investRes.ok) {
        const data = await investRes.json()
        setSummary(data.summary)
      }

      if (txnRes.ok) {
        const data = await txnRes.json()
        setPendingTxns(data.transactions || [])
      }
    } catch (err) {
      console.error('Failed to fetch investments:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  useInvestmentRealtime({
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
        <p className="text-muted-foreground">Loading investments...</p>
      </div>
    )
  }

  if (!summary || summary.totalInvestments === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold">Investments</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-lg font-medium">No Investments Yet</p>
              <p className="text-muted-foreground mt-1">
                Investments are created automatically when you approve an application.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Investments</h1>
        <p className="text-muted-foreground mt-1">Portfolio investment tracker</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Total Investments</span>
            </div>
            <p className="text-2xl font-bold">{summary.totalInvestments}</p>
          </CardContent>
        </Card>
        <BalanceCard
          label="Cash Deployed"
          totalCents={summary.totalInvestments * 5000000}
          usedCents={summary.totalCashDeployed}
          pendingCents={0}
          colorClass="text-success"
        />
        <BalanceCard
          label="Credits Used"
          totalCents={summary.totalInvestments * 5000000}
          usedCents={summary.totalCreditsUsed}
          pendingCents={0}
          colorClass="text-info"
        />
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Pending Requests</span>
            </div>
            <p className="text-2xl font-bold">{summary.pendingRequests}</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests */}
      {pendingTxns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Requests ({pendingTxns.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingTxns.map((txn) => (
                <div key={txn.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{txn.title}</p>
                      <Badge variant="outline">
                        {txn.type === 'cash_disbursement' ? 'Cash' : 'Credit'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {txn.companyName} &middot; {formatInvestmentCurrency(txn.amountCents)}
                      {txn.description && ` — ${txn.description}`}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button size="sm" onClick={() => handleAction(txn.id, 'approve')}>
                      Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleAction(txn.id, 'deny')}>
                      Deny
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Investment Portfolio Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Portfolio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead className="text-right">Cash Balance</TableHead>
                <TableHead className="text-right">Credits Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.investments.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.companyName}</TableCell>
                  <TableCell className="text-right font-mono">
                    <div>
                      <span className="text-success">
                        {formatInvestmentCurrency(inv.cashRemaining)}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">
                        / {formatInvestmentCurrency(inv.cashAmountCents)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    <div>
                      <span className="text-info">
                        {formatInvestmentCurrency(inv.creditsRemaining)}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">
                        / {formatInvestmentCurrency(inv.creditsAmountCents)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[inv.status] || ''}>
                      {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link href={`/partner/investments/${inv.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      <Toaster />
    </div>
  )
}
