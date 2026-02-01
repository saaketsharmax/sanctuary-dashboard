'use client'

import Link from 'next/link'
import { Building2, ExternalLink } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { StartupWithFounders } from '@/types'
import { getStageInfo, getRiskInfo } from '@/types'

interface StartupTableProps {
  startups: StartupWithFounders[]
}

export function StartupTable({ startups }: StartupTableProps) {
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
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Startup</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Founders</TableHead>
            <TableHead className="text-center">Score</TableHead>
            <TableHead>Risk</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {startups.map((startup) => {
            const stageInfo = getStageInfo(startup.stage)
            const riskInfo = getRiskInfo(startup.riskLevel)
            const leadFounder = startup.founders.find((f) => f.isLead) || startup.founders[0]

            return (
              <TableRow key={startup.id} className="group">
                <TableCell>
                  <Link
                    href={`/startup/${startup.id}`}
                    className="flex items-center gap-3 group-hover:text-primary transition-colors"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      {startup.logoUrl ? (
                        <img
                          src={startup.logoUrl}
                          alt={startup.name}
                          className="h-7 w-7 rounded object-cover"
                        />
                      ) : (
                        <Building2 className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{startup.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1 max-w-[180px]">
                        {startup.oneLiner}
                      </p>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={stageColorClass[startup.stage]}>
                    {stageInfo.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{startup.industry}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {startup.founders.slice(0, 2).map((founder) => (
                        <Avatar key={founder.id} className="h-7 w-7 border-2 border-background">
                          <AvatarImage src={founder.photoUrl || undefined} />
                          <AvatarFallback className="text-[10px]">
                            {founder.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {leadFounder?.name.split(' ')[0]}
                      {startup.founders.length > 1 && ` +${startup.founders.length - 1}`}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 justify-center">
                    <Progress value={startup.overallScore ?? 0} className="w-16 h-2" />
                    <span className="text-sm font-medium w-8">
                      {startup.overallScore ?? '-'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={riskColorClass[startup.riskLevel]}>
                    {riskInfo.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Link href={`/startup/${startup.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
