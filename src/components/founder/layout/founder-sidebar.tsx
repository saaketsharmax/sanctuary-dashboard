'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

// Sanctuary Logo SVG
function SanctuaryLogo({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path
        clipRule="evenodd"
        d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  )
}

const navItems = [
  { href: '/founder/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { href: '/founder/company', icon: 'apartment', label: 'Company' },
  { href: '/founder/documents', icon: 'description', label: 'Documents' },
  { href: '/founder/requests', icon: 'support_agent', label: 'Requests' },
  { href: '/founder/metrics', icon: 'analytics', label: 'Metrics' },
  { href: '/founder/progress', icon: 'checklist', label: 'Progress' },
]

export function FounderSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/founder/dashboard') {
      return pathname === '/founder/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-16 border-r border-[var(--grid-line)] flex flex-col items-center py-8 z-50 bg-[var(--deep-black)]">
      {/* Logo */}
      <div className="mb-12">
        <Link href="/founder/dashboard">
          <SanctuaryLogo className="size-8 text-[var(--olive)]" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-6 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            className={`
              material-symbols-outlined cursor-pointer transition-colors
              ${isActive(item.href)
                ? 'text-[var(--olive)]'
                : 'text-[var(--cream)]/40 hover:text-[var(--olive)]'
              }
            `}
          >
            {item.icon}
          </Link>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto flex flex-col gap-6 items-center">
        <Link
          href="/founder/settings"
          title="Settings"
          className={`
            material-symbols-outlined cursor-pointer transition-colors
            ${pathname === '/founder/settings'
              ? 'text-[var(--olive)]'
              : 'text-[var(--cream)]/40 hover:text-[var(--olive)]'
            }
          `}
        >
          settings
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          title="Logout"
          className="material-symbols-outlined cursor-pointer text-[var(--cream)]/40 hover:text-[var(--warning)] transition-colors"
        >
          logout
        </button>
        <div
          className="size-8 border border-[var(--grid-line)] bg-center bg-cover"
          style={{
            backgroundImage: `url("https://api.dicebear.com/7.x/initials/svg?seed=Founder&backgroundColor=808000&textColor=050505")`,
          }}
        />
      </div>
    </aside>
  )
}
