'use client'

import { PortfolioMetrics } from '@/components/metrics'

export default function MetricsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Portfolio Metrics</h1>
        <p className="text-muted-foreground">
          Track MRR, user growth, and retention across your portfolio
        </p>
      </div>

      <PortfolioMetrics />
    </div>
  )
}
