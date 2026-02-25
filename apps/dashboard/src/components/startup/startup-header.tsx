'use client'

import { Button, Badge, cn } from '@sanctuary/ui'
import { Building2, Globe, Presentation, Play, Edit, MapPin, Calendar } from 'lucide-react'
import type { Startup, Cohort } from '@/types'
import { getStageInfo, getRiskInfo } from '@/types'
import { format } from 'date-fns'

interface StartupHeaderProps {
  startup: Startup
  cohort: Cohort | null
  onEdit?: () => void
}

export function StartupHeader({ startup, cohort, onEdit }: StartupHeaderProps) {
  const stageInfo = getStageInfo(startup.stage)
  const riskInfo = getRiskInfo(startup.riskLevel)

  const stageColorClass = {
    problem_discovery: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
    solution_shaping: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
    user_value: 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20',
    growth: 'bg-green-500/10 text-green-700 border-green-500/20',
    capital_ready: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
  }

  const riskColorClass = {
    low: 'bg-green-500/10 text-green-700 border-green-500/20',
    normal: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
    elevated: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
    high: 'bg-red-500/10 text-red-700 border-red-500/20',
  }

  const statusColorClass = {
    active: 'bg-green-500/10 text-green-700',
    paused: 'bg-yellow-500/10 text-yellow-700',
    graduated: 'bg-blue-500/10 text-blue-700',
    exited: 'bg-gray-500/10 text-gray-700',
  }

  return (
    <div className="px-6 py-6 border-b">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        {/* Left side - Logo and info */}
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 shrink-0">
            {startup.logoUrl ? (
              <img
                src={startup.logoUrl}
                alt={startup.name}
                className="h-12 w-12 rounded-lg object-cover"
              />
            ) : (
              <Building2 className="h-8 w-8 text-primary" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">{startup.name}</h1>
              <Badge variant="outline" className={statusColorClass[startup.status]}>
                {startup.status.charAt(0).toUpperCase() + startup.status.slice(1)}
              </Badge>
            </div>

            <p className="text-muted-foreground">{startup.oneLiner}</p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {startup.city}, {startup.country}
              </span>
              {cohort && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {cohort.name}
                </span>
              )}
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 pt-2 flex-wrap">
              <Badge variant="outline" className={stageColorClass[startup.stage]}>
                {stageInfo.label}
              </Badge>
              <Badge variant="outline" className={riskColorClass[startup.riskLevel]}>
                {riskInfo.label} Risk
              </Badge>
              <Badge variant="outline">{startup.industry}</Badge>
              <Badge variant="outline">{startup.businessModel}</Badge>
            </div>
          </div>
        </div>

        {/* Right side - Actions and links */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={onEdit}>
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </div>

          <div className="flex gap-2 flex-wrap">
            {startup.website && (
              <a href={startup.website} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Globe className="h-4 w-4" />
                  Website
                </Button>
              </a>
            )}
            {startup.demoUrl && (
              <a href={startup.demoUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Play className="h-4 w-4" />
                  Demo
                </Button>
              </a>
            )}
            {startup.pitchDeckUrl && (
              <a href={startup.pitchDeckUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Presentation className="h-4 w-4" />
                  Deck
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
