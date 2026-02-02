'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign, Users, Percent, BarChart3, Lock } from 'lucide-react'

const metrics = {
  mrr: { value: 8500, change: 12, trend: 'up' },
  activeUsers: { value: 234, change: 8, trend: 'up' },
  retention: { value: 85, change: -2, trend: 'down' },
  nps: { value: 72, change: 5, trend: 'up' },
}

const benchmarks = [
  { metric: 'MRR Growth', yours: '12%', benchmark: '10%', status: 'above' },
  { metric: 'User Retention', yours: '85%', benchmark: '80%', status: 'above' },
  { metric: 'NPS Score', yours: '72', benchmark: '50', status: 'above' },
  { metric: 'CAC Payback', yours: '8 mo', benchmark: '12 mo', status: 'above' },
]

export default function FounderMetricsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Metrics</h1>
        <p className="text-muted-foreground mt-1">Track your key performance indicators</p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">MRR</span>
            </div>
            <p className="text-2xl font-bold mt-1">${metrics.mrr.value.toLocaleString()}</p>
            <div className={`text-xs flex items-center gap-1 mt-1 ${metrics.mrr.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.mrr.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {metrics.mrr.change > 0 ? '+' : ''}{metrics.mrr.change}% this month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Active Users</span>
            </div>
            <p className="text-2xl font-bold mt-1">{metrics.activeUsers.value}</p>
            <div className={`text-xs flex items-center gap-1 mt-1 ${metrics.activeUsers.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.activeUsers.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {metrics.activeUsers.change > 0 ? '+' : ''}{metrics.activeUsers.change}% this week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Retention</span>
            </div>
            <p className="text-2xl font-bold mt-1">{metrics.retention.value}%</p>
            <div className={`text-xs flex items-center gap-1 mt-1 ${metrics.retention.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.retention.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {metrics.retention.change > 0 ? '+' : ''}{metrics.retention.change}% this month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">NPS</span>
            </div>
            <p className="text-2xl font-bold mt-1">{metrics.nps.value}</p>
            <div className={`text-xs flex items-center gap-1 mt-1 ${metrics.nps.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.nps.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {metrics.nps.change > 0 ? '+' : ''}{metrics.nps.change} points
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Benchmarks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Benchmark Comparison</CardTitle>
          <CardDescription>How you compare to portfolio averages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {benchmarks.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="font-medium">{item.metric}</span>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold">{item.yours}</p>
                    <p className="text-xs text-muted-foreground">Your value</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">{item.benchmark}</p>
                    <p className="text-xs text-muted-foreground">Benchmark</p>
                  </div>
                  <Badge variant={item.status === 'above' ? 'default' : 'secondary'}>
                    {item.status === 'above' ? 'Above' : 'Below'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
    </div>
  )
}
