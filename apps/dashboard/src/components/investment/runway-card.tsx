'use client'

import { Card, CardContent } from '@/components/ui/card'
import { formatInvestmentCurrency } from '@/types'
import { cn } from '@/lib/utils'

interface RunwayCardProps {
  cashRemaining: number
  monthlyBurnRate: number
  runwayMonths: number
}

export function RunwayCard({ cashRemaining, monthlyBurnRate, runwayMonths }: RunwayCardProps) {
  const runwayColor =
    runwayMonths > 6
      ? 'text-green-600 dark:text-green-400'
      : runwayMonths >= 3
        ? 'text-yellow-600 dark:text-yellow-400'
        : 'text-red-600 dark:text-red-400'

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Monthly Burn Rate */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Monthly Burn Rate</p>
            <p className="text-2xl font-bold">{formatInvestmentCurrency(monthlyBurnRate)}</p>
            <p className="text-xs text-muted-foreground">
              avg. over recent months
            </p>
          </div>

          {/* Runway */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Runway</p>
            <p className={cn('text-2xl font-bold', runwayColor)}>
              {runwayMonths} {runwayMonths === 1 ? 'month' : 'months'}
            </p>
            <p className="text-xs text-muted-foreground">
              at current burn rate
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
