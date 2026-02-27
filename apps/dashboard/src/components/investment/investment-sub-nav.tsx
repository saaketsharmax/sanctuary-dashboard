'use client'

import { cn } from '@sanctuary/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
const tabs = [
  { label: 'Cash Investment', href: '/founder/investment/cash' },
  { label: 'Service Credits', href: '/founder/investment/credits' },
]

export function InvestmentSubNav() {
  const pathname = usePathname()

  return (
    <div className="flex gap-6 border-b mb-6">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'pb-2 text-sm font-medium transition-colors border-b-2 -mb-px',
              isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
