'use client'

import { WidgetCard } from '../widget-card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface Stat {
  label: string
  value: string
  change?: number
  trend?: 'up' | 'down' | 'neutral'
}

interface StatsWidgetProps {
  stats: Stat[]
  title?: string
}

export function StatsWidget({ stats, title = 'Quick Stats' }: StatsWidgetProps) {
  return (
    <WidgetCard title={title}>
      <div className="p-5 grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="flex flex-col gap-1">
            <p className="text-[9.5px] font-medium text-black/50 leading-[13.5px] uppercase tracking-wide">
              {stat.label}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-[24px] font-medium text-black leading-none">
                {stat.value}
              </p>
              {stat.trend && stat.change !== undefined && (
                <div className="flex items-center gap-0.5">
                  {stat.trend === 'up' && (
                    <TrendingUp className="w-3 h-3 text-success" />
                  )}
                  {stat.trend === 'down' && (
                    <TrendingDown className="w-3 h-3 text-destructive" />
                  )}
                  {stat.trend === 'neutral' && (
                    <Minus className="w-3 h-3 text-black/40" />
                  )}
                  <span
                    className={`text-[10px] font-medium ${
                      stat.trend === 'up'
                        ? 'text-success'
                        : stat.trend === 'down'
                        ? 'text-destructive'
                        : 'text-black/40'
                    }`}
                  >
                    {stat.change > 0 ? '+' : ''}
                    {stat.change}%
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  )
}
