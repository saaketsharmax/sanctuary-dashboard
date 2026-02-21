'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  CASH_EXPENSE_CATEGORIES,
  type CashExpenseCategory,
  formatInvestmentCurrency,
} from '@/types'

interface ExpenseBreakdownProps {
  expensesByCategory: Partial<Record<CashExpenseCategory, number>>
  totalCashCents: number
}

const CATEGORY_COLORS: Record<string, { bar: string; bg: string; text: string }> = {
  blue: { bar: 'bg-blue-500', bg: 'bg-blue-100 dark:bg-blue-950', text: 'text-blue-700 dark:text-blue-300' },
  purple: { bar: 'bg-purple-500', bg: 'bg-purple-100 dark:bg-purple-950', text: 'text-purple-700 dark:text-purple-300' },
  green: { bar: 'bg-green-500', bg: 'bg-green-100 dark:bg-green-950', text: 'text-green-700 dark:text-green-300' },
  orange: { bar: 'bg-orange-500', bg: 'bg-orange-100 dark:bg-orange-950', text: 'text-orange-700 dark:text-orange-300' },
  gray: { bar: 'bg-gray-500', bg: 'bg-gray-100 dark:bg-gray-950', text: 'text-gray-700 dark:text-gray-300' },
}

const PIE_COLORS: Record<string, string> = {
  salaries: '#3b82f6',
  software: '#a855f7',
  marketing: '#22c55e',
  legal: '#f97316',
  misc: '#6b7280',
}

export function ExpenseBreakdown({ expensesByCategory, totalCashCents }: ExpenseBreakdownProps) {
  const donutData = useMemo(() => {
    return CASH_EXPENSE_CATEGORIES
      .map((cat) => ({
        name: cat.label,
        value: expensesByCategory[cat.value] || 0,
        category: cat.value,
      }))
      .filter((d) => d.value > 0)
  }, [expensesByCategory])

  const totalSpent = Object.values(expensesByCategory).reduce((s, v) => s + (v || 0), 0)

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Expense Breakdown</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {/* Category cards */}
        <div className="grid sm:grid-cols-2 gap-3">
          {CASH_EXPENSE_CATEGORIES.map((cat) => {
            const used = expensesByCategory[cat.value] || 0
            const pct = totalCashCents > 0 ? (used / totalCashCents) * 100 : 0
            const colors = CATEGORY_COLORS[cat.color] || CATEGORY_COLORS.gray

            return (
              <Card key={cat.value}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span>{cat.label}</span>
                    <span className={`text-xs font-normal ${colors.text}`}>
                      {pct.toFixed(1)}%
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xl font-bold">{formatInvestmentCurrency(used)}</p>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${colors.bar} transition-all`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Donut chart */}
        {donutData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Spending Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {donutData.map((entry) => (
                      <Cell key={entry.category} fill={PIE_COLORS[entry.category] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value) => [formatInvestmentCurrency(value as number), 'Spent']}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {donutData.map((d) => (
                  <div key={d.category} className="flex items-center gap-1.5 text-xs">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[d.category] }}
                    />
                    {d.name}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
