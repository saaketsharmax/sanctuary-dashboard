'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Skeleton,
  Toaster,
} from '@sanctuary/ui'
import { TrendingUp, TrendingDown, DollarSign, Users, Percent, BarChart3, Lock } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
interface MetricData {
  value: number
  change: number
  trend: 'up' | 'down'
  history?: { date: string; value: number }[]
}

interface Metrics {
  mrr?: MetricData
  activeUsers?: MetricData
  retention?: MetricData
  nps?: MetricData
}

interface Benchmarks {
  avgMrr: number
  avgUsers: number
  avgRetention: number
  avgNps: number
}

export default function FounderMetricsPage() {
  const [metrics, setMetrics] = useState<Metrics>({})
  const [benchmarks, setBenchmarks] = useState<Benchmarks | null>(null)
  const [sharedMetrics, setSharedMetrics] = useState<string[]>([])
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMock, setIsMock] = useState(false)

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/founder/metrics')
      const data = await res.json()
      if (data.metrics) {
        setMetrics(data.metrics)
        setBenchmarks(data.benchmarks)
        setSharedMetrics(data.sharedMetrics || [])
        setLastUpdated(data.lastUpdated)
        setIsMock(data.isMock)
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
      toast.error('Failed to load metrics')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getBenchmarkStatus = (value: number, benchmark: number, higherIsBetter: boolean = true) => {
    if (higherIsBetter) {
      return value >= benchmark ? 'above' : 'below'
    }
    return value <= benchmark ? 'above' : 'below'
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-5 w-64 mt-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-20 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-16" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  const hasMetrics = Object.keys(metrics).length > 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Metrics</h1>
        <p className="text-muted-foreground mt-1">
          Track your key performance indicators
          {isMock && <Badge variant="outline" className="ml-2 text-xs">Demo Mode</Badge>}
        </p>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground mt-2">
            Last updated: {formatDate(lastUpdated)}
          </p>
        )}
      </div>

      {!hasMetrics ? (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Lock className="h-5 w-5" />
              <div>
                <p className="font-medium">No Metrics Available</p>
                <p className="text-sm">Your partners will share metrics with you once they're available</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.mrr && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">MRR</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">${metrics.mrr.value.toLocaleString()}</p>
                  <div className={`text-xs flex items-center gap-1 mt-1 ${metrics.mrr.trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                    {metrics.mrr.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {metrics.mrr.change > 0 ? '+' : ''}{metrics.mrr.change}% this month
                  </div>
                </CardContent>
              </Card>
            )}

            {metrics.activeUsers && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Active Users</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{metrics.activeUsers.value.toLocaleString()}</p>
                  <div className={`text-xs flex items-center gap-1 mt-1 ${metrics.activeUsers.trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                    {metrics.activeUsers.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {metrics.activeUsers.change > 0 ? '+' : ''}{metrics.activeUsers.change}% this week
                  </div>
                </CardContent>
              </Card>
            )}

            {metrics.retention && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Retention</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{metrics.retention.value}%</p>
                  <div className={`text-xs flex items-center gap-1 mt-1 ${metrics.retention.trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                    {metrics.retention.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {metrics.retention.change > 0 ? '+' : ''}{metrics.retention.change}% this month
                  </div>
                </CardContent>
              </Card>
            )}

            {metrics.nps && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">NPS</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{metrics.nps.value}</p>
                  <div className={`text-xs flex items-center gap-1 mt-1 ${metrics.nps.trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                    {metrics.nps.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {metrics.nps.change > 0 ? '+' : ''}{metrics.nps.change} points
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Benchmarks */}
          {benchmarks && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Benchmark Comparison</CardTitle>
                <CardDescription>How you compare to portfolio averages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.mrr && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 rounded-lg bg-muted/50">
                      <span className="font-medium">MRR</span>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold">${metrics.mrr.value.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Your value</p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground">${benchmarks.avgMrr.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Benchmark</p>
                        </div>
                        <Badge variant={getBenchmarkStatus(metrics.mrr.value, benchmarks.avgMrr) === 'above' ? 'default' : 'secondary'}>
                          {getBenchmarkStatus(metrics.mrr.value, benchmarks.avgMrr) === 'above' ? 'Above' : 'Below'}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {metrics.activeUsers && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 rounded-lg bg-muted/50">
                      <span className="font-medium">Active Users</span>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold">{metrics.activeUsers.value.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Your value</p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground">{benchmarks.avgUsers.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Benchmark</p>
                        </div>
                        <Badge variant={getBenchmarkStatus(metrics.activeUsers.value, benchmarks.avgUsers) === 'above' ? 'default' : 'secondary'}>
                          {getBenchmarkStatus(metrics.activeUsers.value, benchmarks.avgUsers) === 'above' ? 'Above' : 'Below'}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {metrics.retention && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 rounded-lg bg-muted/50">
                      <span className="font-medium">Retention</span>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold">{metrics.retention.value}%</p>
                          <p className="text-xs text-muted-foreground">Your value</p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground">{benchmarks.avgRetention}%</p>
                          <p className="text-xs text-muted-foreground">Benchmark</p>
                        </div>
                        <Badge variant={getBenchmarkStatus(metrics.retention.value, benchmarks.avgRetention) === 'above' ? 'default' : 'secondary'}>
                          {getBenchmarkStatus(metrics.retention.value, benchmarks.avgRetention) === 'above' ? 'Above' : 'Below'}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {metrics.nps && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 rounded-lg bg-muted/50">
                      <span className="font-medium">NPS Score</span>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold">{metrics.nps.value}</p>
                          <p className="text-xs text-muted-foreground">Your value</p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground">{benchmarks.avgNps}</p>
                          <p className="text-xs text-muted-foreground">Benchmark</p>
                        </div>
                        <Badge variant={getBenchmarkStatus(metrics.nps.value, benchmarks.avgNps) === 'above' ? 'default' : 'secondary'}>
                          {getBenchmarkStatus(metrics.nps.value, benchmarks.avgNps) === 'above' ? 'Above' : 'Below'}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Partner Insights */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Lock className="h-5 w-5" />
            <div>
              <p className="font-medium">Partner Insights Coming Soon</p>
              <p className="text-sm">Your partners will share additional metrics and analysis here</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Toaster />
    </div>
  )
}
