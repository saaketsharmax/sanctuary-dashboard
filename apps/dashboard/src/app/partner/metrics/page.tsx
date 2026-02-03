'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getPortfolioStats, getAllStartupsWithFounders, getPortfolioMetrics } from '@/lib/mock-data'
import { TrendingUp, DollarSign, Users, Percent, BarChart3 } from 'lucide-react'
import { MRRChart, UserGrowthChart } from '@/components/metrics'

export default function PartnerMetricsPage() {
  const stats = getPortfolioStats()
  const startups = getAllStartupsWithFounders()
  const portfolioMetrics = getPortfolioMetrics()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Portfolio Metrics</h1>
        <p className="text-muted-foreground mt-1">Overview of portfolio performance</p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total MRR</span>
            </div>
            <p className="text-2xl font-bold mt-1">${stats.totalMRR.toLocaleString()}</p>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +15% this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total ARR</span>
            </div>
            <p className="text-2xl font-bold mt-1">${(stats.totalMRR * 12).toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Users</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.totalUsers.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Avg Retention</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.avgRetention}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Avg Score</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.avgOverallScore}/100</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>MRR Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <MRRChart data={portfolioMetrics.mrrHistory} title="Portfolio MRR" height={250} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <UserGrowthChart data={portfolioMetrics.userHistory} title="Total Users" height={250} />
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {startups
              .sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0))
              .slice(0, 5)
              .map((startup, index) => (
                <div key={startup.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{startup.name}</p>
                      <p className="text-xs text-muted-foreground">{startup.industry}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{startup.overallScore}/100</p>
                    <p className="text-xs text-muted-foreground">Overall Score</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
