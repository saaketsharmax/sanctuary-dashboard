'use client'

import { WidgetCard } from '../widget-card'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface ChartDataPoint {
  label: string
  value: number
}

interface ChartWidgetProps {
  title: string
  data: ChartDataPoint[]
  currentValue: string
  change?: number
  trend?: 'up' | 'down'
  height?: string
}

export function ChartWidget({
  title,
  data,
  currentValue,
  change,
  trend,
  height = '200px'
}: ChartWidgetProps) {
  const maxValue = Math.max(...data.map(d => d.value))
  const minValue = Math.min(...data.map(d => d.value))
  const range = maxValue - minValue || 1

  return (
    <WidgetCard title={title}>
      <div className="p-5">
        {/* Current Value */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[32px] font-medium text-black leading-none">
              {currentValue}
            </span>
            {trend && change !== undefined && (
              <div className="flex items-center gap-1">
                {trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-success" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-destructive" />
                )}
                <span className={`text-[12px] font-medium ${trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                  {change > 0 ? '+' : ''}{change}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Simple Bar Chart */}
        <div className="flex items-end gap-1" style={{ height }}>
          {data.map((point, index) => {
            const barHeight = ((point.value - minValue) / range) * 100

            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <div className="flex-1 w-full flex items-end">
                  <div
                    className="w-full bg-black rounded-t-sm transition-all duration-300 hover:opacity-80"
                    style={{ height: `${barHeight}%`, minHeight: '4px' }}
                    title={`${point.label}: ${point.value}`}
                  />
                </div>
                <span className="text-[9px] font-medium text-black/50 mt-1">
                  {point.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </WidgetCard>
  )
}
