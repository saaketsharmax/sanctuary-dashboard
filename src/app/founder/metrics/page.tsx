import { auth } from '@/lib/auth/auth-config'
import { redirect } from 'next/navigation'
import { FounderHeader } from '@/components/founder/layout/founder-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Lock,
} from 'lucide-react'
import { getStartupMetrics } from '@/lib/mock-data'
import { formatCurrency } from '@/types'

// Mock shared metrics from partners
const mockSharedMetrics = [
  {
    id: 'shared-1',
    title: 'MRR Growth Rate',
    value: '23%',
    description: 'Month-over-month revenue growth',
    sharedBy: 'Alex Thompson',
    sharedAt: '2026-01-18T10:00:00Z',
  },
  {
    id: 'shared-2',
    title: 'Cohort Benchmark',
    value: 'Top 20%',
    description: 'Your position among cohort startups in user growth',
    sharedBy: 'Alex Thompson',
    sharedAt: '2026-01-15T14:30:00Z',
  },
]

function getTrendIcon(trend: string) {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-4 w-4 text-green-600" />
    case 'down':
      return <TrendingDown className="h-4 w-4 text-red-600" />
    default:
      return <Minus className="h-4 w-4 text-gray-400" />
  }
}

export default async function FounderMetricsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const startupId = session.user.startupId

  if (!startupId) {
    redirect('/founder/dashboard')
  }

  const metrics = getStartupMetrics(startupId)

  return (
    <div className="flex flex-col">
      <FounderHeader
        title="Shared Metrics"
        description="Metrics and insights shared by Sanctuary partners"
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Your Metrics Overview */}
        {metrics && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <CardTitle>Your Current Metrics</CardTitle>
              </div>
              <CardDescription>
                Latest data from your startup
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">MRR</p>
                    {getTrendIcon(metrics.mrrTrend)}
                  </div>
                  <p className="text-2xl font-bold mt-1">
                    {formatCurrency(metrics.current.mrr)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metrics.mrrChange > 0 ? '+' : ''}{metrics.mrrChange}% this month
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                    {getTrendIcon(metrics.userTrend)}
                  </div>
                  <p className="text-2xl font-bold mt-1">
                    {metrics.current.activeUsers.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metrics.userChange > 0 ? '+' : ''}{metrics.userChange}% this month
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">Retention Rate</p>
                    {getTrendIcon(metrics.retentionTrend)}
                  </div>
                  <p className="text-2xl font-bold mt-1">
                    {metrics.current.retentionRate}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metrics.retentionChange > 0 ? '+' : ''}{metrics.retentionChange}% change
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  </div>
                  <p className="text-2xl font-bold mt-1">
                    {metrics.current.totalUsers.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metrics.current.newUsers} new this month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Partner Shared Insights */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-600" />
              <CardTitle>Partner Insights</CardTitle>
            </div>
            <CardDescription>
              Metrics and analysis shared with you by Sanctuary partners
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mockSharedMetrics.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {mockSharedMetrics.map((metric) => (
                  <div
                    key={metric.id}
                    className="rounded-lg border p-4 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{metric.title}</p>
                        <p className="text-3xl font-bold text-green-700 dark:text-green-400 mt-2">
                          {metric.value}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {metric.description}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        <Eye className="mr-1 h-3 w-3" />
                        Shared
                      </Badge>
                    </div>
                    <div className="mt-4 pt-3 border-t border-green-200 dark:border-green-900">
                      <p className="text-xs text-muted-foreground">
                        Shared by {metric.sharedBy} on{' '}
                        {new Date(metric.sharedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No shared metrics yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Partners will share insights with you as they become available
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900">
          <CardHeader>
            <CardTitle className="text-lg">About Shared Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>Partner Insights:</strong> Sanctuary partners may share specific metrics,
              benchmarks, or analysis with you to help track your progress.
            </p>
            <p>
              <strong>Privacy:</strong> You control what data is shared with partners. Visit
              your Settings to manage data sharing preferences.
            </p>
            <p>
              <strong>Updates:</strong> Shared metrics are read-only and updated by partners
              as new data becomes available.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
