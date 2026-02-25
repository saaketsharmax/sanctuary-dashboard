'use client'

import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { MetricDataPoint } from '@/types'

interface RetentionChartProps {
  data: MetricDataPoint[]
  title?: string
  height?: number
  targetLine?: number
}

export function RetentionChart({
  data,
  title = 'Retention Rate',
  height = 200,
  targetLine = 80,
}: RetentionChartProps) {
  const gradientId = useMemo(() => `retention-gradient-${Math.random().toString(36).substr(2, 9)}`, [])

  const formattedData = useMemo(() => {
    return data.map((point) => ({
      ...point,
      formattedDate: format(parseISO(point.date), 'MMM'),
    }))
  }, [data])

  const color = '#a855f7'

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="formattedDate"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground"
            />
            <YAxis
              width={40}
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
              className="text-muted-foreground"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value) => [`${value}%`, 'Retention']}
              labelFormatter={(label) => label}
            />
            <ReferenceLine
              y={targetLine}
              stroke="#22c55e"
              strokeDasharray="5 5"
              label={{
                value: 'Target',
                position: 'right',
                fill: '#22c55e',
                fontSize: 10,
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
