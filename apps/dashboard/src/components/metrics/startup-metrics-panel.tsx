'use client'

import { getStartupMetrics } from '@/lib/mock-data'
import { KPIGrid } from './kpi-grid'
import { MRRChart } from './mrr-chart'
import { UserGrowthChart } from './user-growth-chart'
import { RetentionChart } from './retention-chart'
import { Card, CardContent } from '@/components/ui/card'
import { Activity } from 'lucide-react'

interface StartupMetricsPanelProps {
  startupId: string
}

export function StartupMetricsPanel({ startupId }: StartupMetricsPanelProps) {
  const metrics = getStartupMetrics(startupId)

  if (!metrics) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No metrics data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <KPIGrid metrics={metrics} type="startup" />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MRRChart data={metrics.mrrHistory} height={220} />
        <UserGrowthChart data={metrics.userHistory} height={220} />
      </div>

      <RetentionChart
        data={metrics.retentionHistory}
        height={200}
        targetLine={80}
      />

      {/* Additional Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-sm text-muted-foreground">Active Users</p>
            <p className="text-xl font-bold">{metrics.current.activeUsers.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-sm text-muted-foreground">New Users (Month)</p>
            <p className="text-xl font-bold">{metrics.current.newUsers.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-sm text-muted-foreground">Churn Rate</p>
            <p className="text-xl font-bold">{metrics.current.churnRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-sm text-muted-foreground">Activation Rate</p>
            <p className="text-xl font-bold">{metrics.current.activationRate ?? '—'}%</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
