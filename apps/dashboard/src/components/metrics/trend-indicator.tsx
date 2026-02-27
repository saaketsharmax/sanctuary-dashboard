'use client'

import { cn } from '@sanctuary/ui'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
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
    color: 'text-success',
    bgColor: 'bg-success/15',
  },
  down: {
    icon: TrendingDown,
    color: 'text-destructive',
    bgColor: 'bg-destructive/15',
  },
  flat: {
    icon: Minus,
    color: 'text-info',
    bgColor: 'bg-info/15',
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
