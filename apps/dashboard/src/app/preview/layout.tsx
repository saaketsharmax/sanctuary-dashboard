'use client'

import { cn } from '@sanctuary/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Eye } from 'lucide-react'

const previewLinks = [
  { label: 'Investment — Cash', href: '/preview/investment/cash' },
  { label: 'Investment — Credits', href: '/preview/investment/credits' },
]

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-background">
      {/* Preview banner */}
      <div className="sticky top-0 z-50 border-b bg-warning/10 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-warning">
            <Eye className="h-4 w-4" />
            Preview Mode — Mock Data
          </div>
          <nav className="flex gap-4">
            {previewLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-xs transition-colors',
                  pathname === link.href
                    ? 'text-warning font-semibold'
                    : 'text-warning hover:text-warning'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
