'use client'

import { useState, useMemo } from 'react'
import { LayoutGrid, List } from 'lucide-react'
import { PartnerHeader } from '@/components/partner/layout/partner-header'
import { StartupCard } from '@/components/portfolio/startup-card'
import { StartupTable } from '@/components/portfolio/startup-table'
import { AddStartupModal } from '@/components/portfolio/add-startup-modal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { getAllStartupsWithFounders, getPortfolioStats } from '@/lib/mock-data'
import { STAGES, RISK_LEVELS } from '@/types'
import type { Stage, RiskLevel } from '@/types'

type ViewMode = 'grid' | 'list'

export default function PartnerPortfolioPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [stageFilter, setStageFilter] = useState<Stage | 'all'>('all')
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all')
  const [addModalOpen, setAddModalOpen] = useState(false)

  const allStartups = getAllStartupsWithFounders()
  const stats = getPortfolioStats()

  const filteredStartups = useMemo(() => {
    return allStartups.filter((startup) => {
      if (stageFilter !== 'all' && startup.stage !== stageFilter) return false
      if (riskFilter !== 'all' && startup.riskLevel !== riskFilter) return false
      return true
    })
  }, [allStartups, stageFilter, riskFilter])

  const clearFilters = () => {
    setStageFilter('all')
    setRiskFilter('all')
  }

  const hasFilters = stageFilter !== 'all' || riskFilter !== 'all'

  const handleAddSuccess = (data: { name: string }) => {
    toast.success(`${data.name} added to portfolio`, {
      description: 'The startup has been created successfully.',
    })
  }

  return (
    <div className="flex flex-col h-full">
      <PartnerHeader
        title="Portfolio"
        description="Manage all startups in your portfolio"
        action={{
          label: 'Add Startup',
          onClick: () => setAddModalOpen(true),
        }}
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total Startups</p>
            <p className="text-2xl font-bold">{stats.totalStartups}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold">{stats.activeStartups}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Avg Score</p>
            <p className="text-2xl font-bold">{stats.avgOverallScore}/100</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">At Risk</p>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.riskCounts.elevated + stats.riskCounts.high}
            </p>
          </div>
        </div>

        {/* Filters and View Toggle */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <Select
              value={stageFilter}
              onValueChange={(value) => setStageFilter(value as Stage | 'all')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {STAGES.map((stage) => (
                  <SelectItem key={stage.value} value={stage.value}>
                    {stage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={riskFilter}
              onValueChange={(value) => setRiskFilter(value as RiskLevel | 'all')}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                {RISK_LEVELS.map((risk) => (
                  <SelectItem key={risk.value} value={risk.value}>
                    {risk.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            )}

            {hasFilters && (
              <Badge variant="secondary">
                {filteredStartups.length} of {allStartups.length}
              </Badge>
            )}
          </div>

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

        {/* Startup Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStartups.map((startup) => (
              <StartupCard key={startup.id} startup={startup} linkPrefix="/partner/portfolio" />
            ))}
          </div>
        ) : (
          <StartupTable startups={filteredStartups} linkPrefix="/partner/portfolio" />
        )}

        {filteredStartups.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No startups match your filters</p>
            <Button variant="link" onClick={clearFilters}>
              Clear all filters
            </Button>
          </div>
        )}
      </div>

      {/* Add Startup Modal */}
      <AddStartupModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSuccess={handleAddSuccess}
      />
    </div>
  )
}
