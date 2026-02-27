'use client'

import { Badge } from '@/components/ui/badge'
import { type CreditCategory, getCreditCategoryInfo } from '@/types'

const categoryColorClasses: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-600',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  green: 'bg-green-100 text-green-600',
  orange: 'bg-yellow-100 text-yellow-600',
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
