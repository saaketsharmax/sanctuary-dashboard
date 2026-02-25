'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ProblemArchetype } from '@/types'
import { getProblemArchetypeInfo } from '@/types'

interface ExpertiseBadgeProps {
  archetype: ProblemArchetype
  size?: 'sm' | 'md'
}

const colorMap: Record<string, string> = {
  purple: 'bg-purple-100 text-purple-700 hover:bg-purple-100',
  blue: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  green: 'bg-green-100 text-green-700 hover:bg-green-100',
  orange: 'bg-orange-100 text-orange-700 hover:bg-orange-100',
  pink: 'bg-pink-100 text-pink-700 hover:bg-pink-100',
  cyan: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-100',
  yellow: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
  red: 'bg-red-100 text-red-700 hover:bg-red-100',
  indigo: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100',
  teal: 'bg-teal-100 text-teal-700 hover:bg-teal-100',
  violet: 'bg-violet-100 text-violet-700 hover:bg-violet-100',
  amber: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
  rose: 'bg-rose-100 text-rose-700 hover:bg-rose-100',
  gray: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
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
