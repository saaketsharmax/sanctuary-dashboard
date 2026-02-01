'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  Building2,
  FileText,
  MessageSquare,
  BarChart3,
  CheckCircle2,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Rocket,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useState } from 'react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/founder/dashboard',
    icon: LayoutDashboard,
    description: 'Your startup overview',
  },
  {
    name: 'My Company',
    href: '/founder/company',
    icon: Building2,
    description: 'Company profile',
  },
  {
    name: 'Documents',
    href: '/founder/documents',
    icon: FileText,
    description: 'Upload & manage docs',
  },
  {
    name: 'Requests',
    href: '/founder/requests',
    icon: MessageSquare,
    description: 'Request help or features',
  },
  {
    name: 'Shared Metrics',
    href: '/founder/metrics',
    icon: BarChart3,
    description: 'View partner insights',
  },
  {
    name: 'Progress',
    href: '/founder/progress',
    icon: CheckCircle2,
    description: 'Track milestones',
  },
]

const secondaryNavigation = [
  {
    name: 'Settings',
    href: '/founder/settings',
    icon: Settings,
  },
]

export function FounderSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' })
  }

  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-card transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link href="/founder/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-semibold">Sanctuary</span>
              <span className="ml-1 text-xs text-muted-foreground">Founder</span>
            </div>
          </Link>
        )}
        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Rocket className="h-5 w-5 text-white" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/founder/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Secondary navigation */}
      <div className="p-2">
        <Separator className="my-2" />
        {secondaryNavigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </div>

      {/* User section */}
      <div className="border-t p-2">
        {session?.user && !collapsed && (
          <div className="mb-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 px-3 py-2">
            <p className="text-sm font-medium">{session.user.name}</p>
            <p className="text-xs text-muted-foreground">Founder</p>
          </div>
        )}
        <Button
          variant="ghost"
          size={collapsed ? 'icon' : 'default'}
          className={cn('w-full', !collapsed && 'justify-start')}
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>

      {/* Collapse toggle */}
      <div className="border-t p-2">
        <Button
          variant="ghost"
          size="icon"
          className="w-full"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  )
}
