'use client'

import { PartnerHeader } from '@/components/partner/layout/partner-header'
import { PortfolioMetrics } from '@/components/metrics'

export default function PartnerMetricsPage() {
  return (
    <div className="flex flex-col h-full">
      <PartnerHeader
        title="Portfolio Metrics"
        description="Track MRR, user growth, and retention across your portfolio"
      />

      <div className="flex-1 overflow-auto p-6">
        <PortfolioMetrics />
      </div>
    </div>
  )
}
