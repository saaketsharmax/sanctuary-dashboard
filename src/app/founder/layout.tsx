'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, mockFounder } from '@/lib/stores/auth-store'
import {
  LayoutDashboard,
  Building2,
  FileText,
  MessageSquare,
  BarChart3,
  CheckSquare,
  Settings,
  LogOut
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const founderNavItems = [
  { href: '/founder/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/founder/company', label: 'My Company', icon: Building2 },
  { href: '/founder/documents', label: 'Documents', icon: FileText },
  { href: '/founder/requests', label: 'Requests', icon: MessageSquare },
  { href: '/founder/metrics', label: 'Metrics', icon: BarChart3 },
  { href: '/founder/progress', label: 'Progress', icon: CheckSquare },
  { href: '/founder/settings', label: 'Settings', icon: Settings },
]

export default function FounderLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { setRole, clearRole } = useAuthStore()

  // Set role when entering founder section
  useEffect(() => {
    setRole('founder')
  }, [setRole])

  const handleExit = () => {
    clearRole()
    router.push('/')
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/30 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b">
          <Link href="/founder/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">S</span>
            </div>
            <span className="font-semibold text-lg">Sanctuary</span>
          </Link>
          <p className="text-xs text-muted-foreground mt-1">Founder Portal</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {founderNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{mockFounder.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{mockFounder.name}</p>
              <p className="text-xs text-muted-foreground truncate">{mockFounder.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleExit}>
            <LogOut className="h-4 w-4 mr-2" />
            Exit to Home
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
