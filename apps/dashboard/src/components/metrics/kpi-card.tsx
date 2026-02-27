'use client'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { DollarSign, Users, Percent, Star, TrendingUp, Activity } from 'lucide-react'
import { TrendIndicator } from './trend-indicator'
import type { TrendDirection } from '@/types'

interface KPICardProps {
  label: string
  value: string | number
  previousValue?: string | number
  change?: number
  trend?: TrendDirection
  icon?: 'currency' | 'users' | 'percent' | 'star' | 'trending' | 'activity'
  format?: 'currency' | 'percentage' | 'number' | 'compact'
  className?: string
}

const iconMap = {
  currency: DollarSign,
  users: Users,
  percent: Percent,
  star: Star,
  trending: TrendingUp,
  activity: Activity,
}

export function KPICard({
  label,
  value,
  change,
  trend,
  icon = 'trending',
  className,
}: KPICardProps) {
  const Icon = iconMap[icon]

  return (
    <Card className={cn('', className)}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && change !== undefined && (
              <TrendIndicator direction={trend} change={change} size="sm" />
            )}
          </div>
          <div className="p-2 bg-accent rounded-lg">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
