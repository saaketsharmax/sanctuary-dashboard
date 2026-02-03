'use client'

import Link from 'next/link'
import { getPortfolioMetrics, getAllStartupMetrics } from '@/lib/mock-data'
import { KPIGrid } from './kpi-grid'
import { MRRChart } from './mrr-chart'
import { UserGrowthChart } from './user-growth-chart'
import { TrendIndicator } from './trend-indicator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Trophy } from 'lucide-react'
import { formatCurrency } from '@/types'

export function PortfolioMetrics() {
  const portfolioMetrics = getPortfolioMetrics()
  const allStartupMetrics = getAllStartupMetrics()

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <KPIGrid metrics={portfolioMetrics} type="portfolio" />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MRRChart
          data={portfolioMetrics.mrrHistory}
          title="Portfolio MRR"
          height={250}
        />
        <UserGrowthChart
          data={portfolioMetrics.userHistory}
          title="Portfolio Users"
          height={250}
        />
      </div>

      {/* Top Performers & At Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Performers */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {portfolioMetrics.topPerformers.map((startup, index) => (
              <Link
                key={startup.startupId}
                href={`/startup/${startup.startupId}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                  <span className="font-medium">{startup.startupName}</span>
                </div>
                <TrendIndicator direction="up" change={startup.mrrChange} size="sm" />
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* At Risk */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {portfolioMetrics.atRisk.length > 0 ? (
              portfolioMetrics.atRisk.map((startup) => (
                <Link
                  key={startup.startupId}
                  href={`/startup/${startup.startupId}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <span className="font-medium">{startup.startupName}</span>
                  <Badge variant="destructive">{startup.issue}</Badge>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No startups at risk
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All Startups Metrics Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">All Startups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium">Startup</th>
                  <th className="text-right py-3 px-2 font-medium">MRR</th>
                  <th className="text-right py-3 px-2 font-medium">Users</th>
                  <th className="text-right py-3 px-2 font-medium">Retention</th>
                  <th className="text-right py-3 px-2 font-medium">NPS</th>
                  <th className="text-right py-3 px-2 font-medium">Trend</th>
                </tr>
              </thead>
              <tbody>
                {allStartupMetrics.map((metrics) => (
                  <tr key={metrics.startupId} className="border-b last:border-0">
                    <td className="py-3 px-2">
                      <Link
                        href={`/startup/${metrics.startupId}`}
                        className="font-medium hover:underline"
                      >
                        {metrics.startupName}
                      </Link>
                    </td>
                    <td className="text-right py-3 px-2">
                      {formatCurrency(metrics.current.mrr)}
                    </td>
                    <td className="text-right py-3 px-2">
                      {metrics.current.totalUsers.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-2">{metrics.current.retentionRate}%</td>
                    <td className="text-right py-3 px-2">{metrics.current.nps ?? '—'}</td>
                    <td className="text-right py-3 px-2">
                      <TrendIndicator
                        direction={metrics.mrrTrend}
                        change={metrics.mrrChange}
                        size="sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
