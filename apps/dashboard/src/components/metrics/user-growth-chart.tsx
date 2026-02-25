'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MetricChart } from './metric-chart'
import { formatCompactNumber } from '@/types'
import type { MetricDataPoint } from '@/types'

interface UserGrowthChartProps {
  data: MetricDataPoint[]
  title?: string
  height?: number
}

export function UserGrowthChart({ data, title = 'User Growth', height = 200 }: UserGrowthChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <MetricChart
          data={data}
          color="#3b82f6"
          height={height}
          formatValue={(v) => formatCompactNumber(v)}
        />
      </CardContent>
    </Card>
  )
}
