'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  Briefcase,
  BarChart3,
  Users,
  GitCompare,
  FileCheck,
  Share2,
  Settings,
  LogOut
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const partnerNavItems = [
  { href: '/partner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/partner/portfolio', label: 'Portfolio', icon: Briefcase },
  { href: '/partner/metrics', label: 'Metrics', icon: BarChart3 },
  { href: '/partner/mentors', label: 'Mentors', icon: Users },
  { href: '/partner/matches', label: 'Matches', icon: GitCompare },
  { href: '/partner/applications', label: 'Applications', icon: FileCheck },
  { href: '/partner/shared-views', label: 'Shared Views', icon: Share2 },
  { href: '/partner/settings', label: 'Settings', icon: Settings },
]

interface UserProfile {
  name: string
  email: string
}

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch user on mount
  useEffect(() => {
    async function fetchUser() {
      try {
        const supabase = createClient()
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (authUser) {
          // Get user profile from users table
          const { data: profile } = await supabase
            .from('users')
            .select('name, email')
            .eq('id', authUser.id)
            .single()

          if (profile) {
            setUser({
              name: profile.name || authUser.email?.split('@')[0] || 'Partner',
              email: profile.email || authUser.email || '',
            })
          } else {
            setUser({
              name: authUser.email?.split('@')[0] || 'Partner',
              email: authUser.email || '',
            })
          }
        } else {
          // Not logged in - use fallback
          setUser({
            name: 'Partner',
            email: 'Not logged in',
          })
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
        setUser({
          name: 'Partner',
          email: 'Error loading',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/')
    }
  }

  const displayName = user?.name || 'Partner'
  const displayEmail = user?.email || ''

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/30 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b">
          <Link href="/partner/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">S</span>
            </div>
            <span className="font-semibold text-lg">Sanctuary</span>
          </Link>
          <p className="text-xs text-muted-foreground mt-1">Partner Portal</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {partnerNavItems.map((item) => {
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
              <AvatarFallback>
                {loading ? '...' : displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
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
