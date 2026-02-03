'use client'

import { KPICard } from './kpi-card'
import { formatCurrency, formatCompactNumber } from '@/types'
import type { StartupMetrics, PortfolioMetrics } from '@/types'

interface KPIGridProps {
  metrics: StartupMetrics | PortfolioMetrics
  type: 'startup' | 'portfolio'
}

export function KPIGrid({ metrics, type }: KPIGridProps) {
  if (type === 'portfolio') {
    const portfolioMetrics = metrics as PortfolioMetrics
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Total MRR"
          value={formatCurrency(portfolioMetrics.totalMRR)}
          icon="currency"
        />
        <KPICard
          label="Total ARR"
          value={formatCurrency(portfolioMetrics.totalARR)}
          icon="currency"
        />
        <KPICard
          label="Total Users"
          value={formatCompactNumber(portfolioMetrics.totalUsers)}
          icon="users"
        />
        <KPICard
          label="Avg Retention"
          value={`${portfolioMetrics.averageRetention}%`}
          icon="percent"
        />
      </div>
    )
  }

  const startupMetrics = metrics as StartupMetrics
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KPICard
        label="MRR"
        value={formatCurrency(startupMetrics.current.mrr)}
        change={startupMetrics.mrrChange}
        trend={startupMetrics.mrrTrend}
        icon="currency"
      />
      <KPICard
        label="Total Users"
        value={formatCompactNumber(startupMetrics.current.totalUsers)}
        change={startupMetrics.userChange}
        trend={startupMetrics.userTrend}
        icon="users"
      />
      <KPICard
        label="Retention"
        value={`${startupMetrics.current.retentionRate}%`}
        change={startupMetrics.retentionChange}
        trend={startupMetrics.retentionTrend}
        icon="percent"
      />
      <KPICard
        label="NPS"
        value={startupMetrics.current.nps ?? '—'}
        icon="star"
      />
    </div>
  )
}
