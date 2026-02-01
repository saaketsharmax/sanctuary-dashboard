'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TrendDirection } from '@/types'

interface TrendIndicatorProps {
  direction: TrendDirection
  change?: number
  showPercentage?: boolean
  size?: 'sm' | 'md'
}

const trendConfig = {
  up: {
    icon: TrendingUp,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  down: {
    icon: TrendingDown,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  flat: {
    icon: Minus,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
}

export function TrendIndicator({ direction, change, showPercentage = true, size = 'md' }: TrendIndicatorProps) {
  const config = trendConfig[direction]
  const Icon = config.icon
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

  return (
    <div className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full', config.bgColor)}>
      <Icon className={cn(iconSize, config.color)} />
      {showPercentage && change !== undefined && (
        <span className={cn(textSize, 'font-medium', config.color)}>
          {direction === 'up' && '+'}
          {change}%
        </span>
      )}
    </div>
  )
}
