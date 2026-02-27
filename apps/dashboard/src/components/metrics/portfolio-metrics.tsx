'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@sanctuary/ui'
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react'

export function PortfolioMetrics() {
  // No mock data - show empty state until real metrics are available
  return (
    <div className="space-y-6">
      {/* Empty KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Portfolio MRR</p>
                <p className="text-2xl font-bold">$0</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Retention</p>
                <p className="text-2xl font-bold">--%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Startups</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State for Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Portfolio MRR</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] flex items-center justify-center">
            <p className="text-muted-foreground">No data yet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Portfolio Users</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] flex items-center justify-center">
            <p className="text-muted-foreground">No data yet</p>
          </CardContent>
        </Card>
      </div>

      {/* Empty States for Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-4">
              No startups tracked yet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Needs Attention</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-4">
              No startups at risk
            </p>
          </CardContent>
        </Card>
      </div>

      {/* All Startups Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">All Startups</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No startups in portfolio yet. Add startups to see their metrics here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
