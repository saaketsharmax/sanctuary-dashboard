'use client'

import { Badge } from '@sanctuary/ui'
import { type CreditCategory, getCreditCategoryInfo } from '@/types'

const categoryColorClasses: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
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
