'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'
import { LayoutGrid, List, Briefcase } from 'lucide-react'
type ViewMode = 'grid' | 'list'

export default function PartnerPortfolioPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // No mock data - shows empty state
  const startups: never[] = []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground mt-1">Manage your startup portfolio</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Startups</p>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Avg Score</p>
          <p className="text-2xl font-bold">-</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">At Risk</p>
          <p className="text-2xl font-bold">0</p>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex justify-end">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
          <TabsList>
            <TabsTrigger value="grid" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Grid</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">List</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Empty State */}
      <Card>
        <CardContent className="py-16">
          <div className="text-center">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No startups yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Approved applications will appear here once founders complete the onboarding process.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
