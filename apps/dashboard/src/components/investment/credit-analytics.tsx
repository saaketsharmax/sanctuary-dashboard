'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import {
  CREDIT_CATEGORIES,
  type CreditCategory,
  type InvestmentTransaction,
  formatInvestmentCurrency,
} from '@/types'
import { format, parseISO } from 'date-fns'

interface CreditAnalyticsProps {
  creditsByCategory: Partial<Record<CreditCategory, number>>
  transactions: InvestmentTransaction[]
}

const PIE_COLORS: Record<string, string> = {
  space: '#3b82f6',
  design: '#a855f7',
  gtm: '#22c55e',
  launch_media: '#f97316',
}

export function CreditAnalytics({
  creditsByCategory,
  transactions,
}: CreditAnalyticsProps) {
  // Donut data
  const donutData = useMemo(() => {
    return CREDIT_CATEGORIES
      .map((cat) => ({
        name: cat.label,
        value: creditsByCategory[cat.value] || 0,
        category: cat.value,
      }))
      .filter((d) => d.value > 0)
  }, [creditsByCategory])

  // Cumulative area chart data — approved credit usage over time
  const areaData = useMemo(() => {
    const creditTxns = transactions
      .filter((t) => t.type === 'credit_usage' && t.status === 'approved')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

    if (creditTxns.length === 0) return []

    let cumulative = 0
    return creditTxns.map((t) => {
      cumulative += t.amountCents
      return {
        date: format(parseISO(t.createdAt), 'MMM d'),
        value: cumulative,
      }
    })
  }, [transactions])

  // Hide entirely when there's no credit usage
  const hasData = donutData.length > 0

  if (!hasData) return null

  const gradientId = 'credit-area-gradient'

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Usage Analytics</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {/* Donut Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Category Distribution</CardTitle>
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

        {/* Area Chart — Cumulative Credit Usage */}
        {areaData.length > 1 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cumulative Credit Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={areaData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    width={60}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => formatInvestmentCurrency(v)}
                    className="text-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value) => [formatInvestmentCurrency(value as number), 'Total Used']}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill={`url(#${gradientId})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
