'use client'

import { Badge, cn } from '@sanctuary/ui'
import type { ProblemArchetype } from '@/types'
import { getProblemArchetypeInfo } from '@/types'

interface ExpertiseBadgeProps {
  archetype: ProblemArchetype
  size?: 'sm' | 'md'
}

const colorMap: Record<string, string> = {
  purple: 'bg-purple-100 text-purple-700 hover:bg-purple-100',
  blue: 'bg-info/15 text-info hover:bg-info/20',
  green: 'bg-success/15 text-success hover:bg-success/20',
  orange: 'bg-warning/15 text-warning hover:bg-warning/20',
  pink: 'bg-pink-100 text-pink-700 hover:bg-pink-100',
  cyan: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-100',
  yellow: 'bg-warning/15 text-warning hover:bg-warning/20',
  red: 'bg-destructive/15 text-destructive hover:bg-destructive/20',
  indigo: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100',
  teal: 'bg-teal-100 text-teal-700 hover:bg-teal-100',
  violet: 'bg-violet-100 text-violet-700 hover:bg-violet-100',
  amber: 'bg-warning/15 text-warning hover:bg-warning/20',
  rose: 'bg-rose-100 text-rose-700 hover:bg-rose-100',
  gray: 'bg-muted text-foreground hover:bg-muted',
}

export function ExpertiseBadge({ archetype, size = 'md' }: ExpertiseBadgeProps) {
  const info = getProblemArchetypeInfo(archetype)
  const colorClass = colorMap[info.color] || colorMap.gray

  return (
    <Badge
      variant="secondary"
      className={cn(
        colorClass,
        size === 'sm' ? 'text-xs px-1.5 py-0' : 'text-xs'
      )}
    >
      {info.label}
    </Badge>
  )
}
