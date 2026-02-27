'use client'

import { Badge } from '@sanctuary/ui'
import { type CreditCategory, getCreditCategoryInfo } from '@/types'

const categoryColorClasses: Record<string, string> = {
  blue: 'bg-info/15 text-info',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  green: 'bg-success/15 text-success',
  orange: 'bg-warning/15 text-warning',
}

interface CreditCategoryBadgeProps {
  category: CreditCategory
}

export function CreditCategoryBadge({ category }: CreditCategoryBadgeProps) {
  const info = getCreditCategoryInfo(category)
  const colorClass = categoryColorClasses[info.color] || categoryColorClasses.blue

  return (
    <Badge className={colorClass}>
      {info.label}
    </Badge>
  )
}
