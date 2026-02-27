'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@sanctuary/ui'
import {
  CREDIT_CATEGORIES,
  type CreditCategory,
  formatInvestmentCurrency,
} from '@/types'

interface CategoryBreakdownProps {
  totalCreditsCents: number
  creditsByCategory: Partial<Record<CreditCategory, number>>
  pendingByCategory: Partial<Record<CreditCategory, number>>
}

const CATEGORY_COLORS: Record<string, { bar: string; bg: string; text: string }> = {
  blue: { bar: 'bg-info', bg: 'bg-info/15', text: 'text-info' },
  purple: { bar: 'bg-purple-500', bg: 'bg-purple-100 dark:bg-purple-950', text: 'text-purple-700 dark:text-purple-300' },
  green: { bar: 'bg-success', bg: 'bg-success/15', text: 'text-success' },
  orange: { bar: 'bg-warning', bg: 'bg-warning/15', text: 'text-warning' },
}

export function CategoryBreakdown({
  totalCreditsCents,
  creditsByCategory,
  pendingByCategory,
}: CategoryBreakdownProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Credit Usage by Category</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {CREDIT_CATEGORIES.map((cat) => {
          const used = creditsByCategory[cat.value] || 0
          const pending = pendingByCategory[cat.value] || 0
          const pct = totalCreditsCents > 0 ? (used / totalCreditsCents) * 100 : 0
          const colors = CATEGORY_COLORS[cat.color] || CATEGORY_COLORS.blue

          return (
            <Card key={cat.value}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>{cat.label}</span>
                  <span className={`text-xs font-normal ${colors.text}`}>
                    {pct.toFixed(1)}% of pool
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-2xl font-bold">{formatInvestmentCurrency(used)}</p>
                {/* Progress bar */}
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${colors.bar} transition-all`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                {pending > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {formatInvestmentCurrency(pending)} pending
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
