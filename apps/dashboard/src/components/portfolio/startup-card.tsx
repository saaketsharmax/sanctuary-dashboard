'use client'

import {
  Card,
  CardContent,
  CardHeader,
  Badge,
  Progress,
  Avatar,
  AvatarFallback,
  AvatarImage,
  cn,
} from '@sanctuary/ui'
import Link from 'next/link'
import { Building2, Users, TrendingUp, AlertTriangle } from 'lucide-react'
import type { StartupWithFounders } from '@/types'
import { getStageInfo, getRiskInfo } from '@/types'

interface StartupCardProps {
  startup: StartupWithFounders
  linkPrefix?: string
}

export function StartupCard({ startup, linkPrefix = '/startup' }: StartupCardProps) {
  const stageInfo = getStageInfo(startup.stage)
  const riskInfo = getRiskInfo(startup.riskLevel)
  const leadFounder = startup.founders.find((f) => f.isLead) || startup.founders[0]

  const riskColorClass = {
    low: 'bg-green-500/10 text-green-700 border-green-500/20',
    normal: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
    elevated: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
    high: 'bg-red-500/10 text-red-700 border-red-500/20',
  }

  const stageColorClass = {
    problem_discovery: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
    solution_shaping: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
    user_value: 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20',
    growth: 'bg-green-500/10 text-green-700 border-green-500/20',
    capital_ready: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
  }

  return (
    <Link href={`${linkPrefix}/${startup.id}`}>
      <Card className="group hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                {startup.logoUrl ? (
                  <img
                    src={startup.logoUrl}
                    alt={startup.name}
                    className="h-8 w-8 rounded object-cover"
                  />
                ) : (
                  <Building2 className="h-5 w-5 text-primary" />
                )}
              </div>
              <div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  {startup.name}
                </h3>
                <p className="text-xs text-muted-foreground">{startup.industry}</p>
              </div>
            </div>
            {startup.riskLevel !== 'normal' && startup.riskLevel !== 'low' && (
              <AlertTriangle
                className={cn(
                  'h-4 w-4',
                  startup.riskLevel === 'elevated' && 'text-yellow-500',
                  startup.riskLevel === 'high' && 'text-red-500'
                )}
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* One-liner */}
          <p className="text-sm text-muted-foreground line-clamp-2">{startup.oneLiner}</p>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={stageColorClass[startup.stage]}>
              {stageInfo.label}
            </Badge>
            <Badge variant="outline" className={riskColorClass[startup.riskLevel]}>
              {riskInfo.label} Risk
            </Badge>
          </div>

          {/* Score */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Score</span>
              <span className="font-medium">{startup.overallScore ?? 'N/A'}/100</span>
            </div>
            <Progress value={startup.overallScore ?? 0} className="h-2" />
          </div>

          {/* Founders */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="flex -space-x-2">
                {startup.founders.slice(0, 3).map((founder) => (
                  <Avatar key={founder.id} className="h-6 w-6 border-2 border-background">
                    <AvatarImage src={founder.photoUrl || undefined} />
                    <AvatarFallback className="text-[10px]">
                      {founder.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {startup.founders.length > 3 && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px]">
                    +{startup.founders.length - 3}
                  </div>
                )}
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              {leadFounder?.name}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
