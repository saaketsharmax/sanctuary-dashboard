'use client'

import { PartnerHeader } from '@/components/partner/layout/partner-header'
import { PortfolioMetrics } from '@/components/metrics'

export default function PartnerMetricsPage() {
  return (
    <div className="flex flex-col h-full bg-[var(--deep-black)]">
      <PartnerHeader
        title="ANALYTICS_ENGINE"
        breadcrumb={['Metrics']}
      />

      <div className="flex-1 overflow-auto p-10">
        <PortfolioMetrics />
      </div>
    </div>
  )
}
