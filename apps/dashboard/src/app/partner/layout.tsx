'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  Briefcase,
  BarChart3,
  Users,
  GitCompare,
  FileCheck,
  DollarSign,
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
  { href: '/partner/investments', label: 'Investments', icon: DollarSign },
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
  const { setRole, clearRole } = useAuthStore()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Set role when entering partner section
  useEffect(() => {
    setRole('partner')
  }, [setRole])

  // Fetch user on mount
  useEffect(() => {
    let mounted = true

    async function fetchUser() {
      try {
        const supabase = createClient()
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

        if (!mounted) return

        // Handle auth errors gracefully
        if (authError) {
          console.warn('Auth error in layout:', authError.message)
          setUser({
            name: 'Partner',
            email: 'Session loading...',
          })
          return
        }

        if (authUser) {
          // Get user profile from users table
          try {
            const { data: profile } = await supabase
              .from('users')
              .select('name, email')
              .eq('id', authUser.id)
              .single()

            if (!mounted) return

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
          } catch {
            if (mounted) {
              setUser({
                name: authUser.email?.split('@')[0] || 'Partner',
                email: authUser.email || '',
              })
            }
          }
        } else {
          // Not logged in - use fallback
          setUser({
            name: 'Partner',
            email: 'Not logged in',
          })
        }
      } catch (error) {
        // Handle network/abort errors gracefully - don't crash the app
        const isNetworkError = error instanceof Error && (
          error.name === 'AbortError' ||
          error.message.includes('abort') ||
          error.message.includes('network') ||
          error.message.includes('fetch')
        )

        if (!isNetworkError) {
          console.error('Failed to fetch user:', error)
        } else {
          console.warn('Network issue fetching user - continuing with fallback')
        }

        if (mounted) {
          setUser({
            name: 'Partner',
            email: 'Loading...',
          })
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchUser()

    return () => {
      mounted = false
    }
  }, [])

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      clearRole()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
      clearRole()
      router.push('/')
    }
  }

  // Dashboard page uses its own full-screen OS layout — skip the sidebar
  const isDashboard = pathname === '/partner/dashboard'
  if (isDashboard) {
    return <>{children}</>
  }

  const displayName = user?.name || 'Partner'
  const displayEmail = user?.email || ''

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col transition-all duration-300">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link href="/partner/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">S</span>
            </div>
            <span className="font-semibold">Sanctuary</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {partnerNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="border-t p-2">
          <div className="mb-2 rounded-lg bg-accent/50 px-3 py-2">
            <p className="text-sm font-medium">{loading ? '...' : displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="h-5 w-5 shrink-0 mr-3" />
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
