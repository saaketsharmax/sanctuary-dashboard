'use client'

import { Card, CardContent, Tabs, TabsContent, TabsList, TabsTrigger } from '@sanctuary/ui'
import { TrendingUp, DollarSign, Users, Percent, BarChart3, Shield } from 'lucide-react'
import { DDAccuracyDashboard } from '@/components/dd'

export default function PartnerMetricsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Portfolio Metrics</h1>
        <p className="text-muted-foreground mt-1">Overview of portfolio performance and AI system health</p>
      </div>

      <Tabs defaultValue="portfolio">
        <TabsList>
          <TabsTrigger value="portfolio">
            <BarChart3 className="h-4 w-4 mr-1" />
            Portfolio
          </TabsTrigger>
          <TabsTrigger value="dd-accuracy">
            <Shield className="h-4 w-4 mr-1" />
            DD System Health
          </TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="mt-6 space-y-6">
          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Total MRR</span>
                </div>
                <p className="text-2xl font-bold mt-1">$0</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Total ARR</span>
                </div>
                <p className="text-2xl font-bold mt-1">$0</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Total Users</span>
                </div>
                <p className="text-2xl font-bold mt-1">0</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Avg Retention</span>
                </div>
                <p className="text-2xl font-bold mt-1">-</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Avg Score</span>
                </div>
                <p className="text-2xl font-bold mt-1">-</p>
              </CardContent>
            </Card>
          </div>

          {/* Empty State */}
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No metrics data yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Portfolio metrics will appear here once you have active startups in your portfolio.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dd-accuracy" className="mt-6">
          <DDAccuracyDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
