'use client'

import { Card, CardContent, Progress } from '@sanctuary/ui'
import { formatInvestmentCurrency } from '@/types'

interface BalanceCardProps {
  label: string
  totalCents: number
  usedCents: number
  pendingCents: number
  colorClass?: string
}

export function BalanceCard({
  label,
  totalCents,
  usedCents,
  pendingCents,
  colorClass = 'text-primary',
}: BalanceCardProps) {
  const remaining = totalCents - usedCents
  const percentUsed = totalCents > 0 ? Math.round((usedCents / totalCents) * 100) : 0

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={`text-3xl font-bold ${colorClass}`}>
            {formatInvestmentCurrency(remaining)}
          </p>
          <Progress value={percentUsed} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatInvestmentCurrency(usedCents)} used</span>
            <span>of {formatInvestmentCurrency(totalCents)}</span>
          </div>
          {pendingCents > 0 && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              {formatInvestmentCurrency(pendingCents)} pending approval
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
