'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@sanctuary/ui'
import { MetricChart } from './metric-chart'
import { formatCurrency } from '@/types'
import type { MetricDataPoint } from '@/types'

interface MRRChartProps {
  data: MetricDataPoint[]
  title?: string
  height?: number
}

export function MRRChart({ data, title = 'MRR Over Time', height = 200 }: MRRChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <MetricChart
          data={data}
          color="#22c55e"
          height={height}
          formatValue={(v) => formatCurrency(v)}
          yAxisWidth={70}
        />
      </CardContent>
    </Card>
  )
}
