'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Calendar,
  Users,
  MessageSquare,
  GraduationCap,
  MapPin,
  ClipboardList,
  Megaphone,
  Bell,
  Search,
  User,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/residents', label: 'Residents', icon: Users },
  { href: '/mentors', label: 'Mentors', icon: GraduationCap },
  { href: '/discussions', label: 'Discussions', icon: MessageSquare },
  { href: '/board', label: 'Board', icon: ClipboardList },
  { href: '/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/checkin', label: 'Check In', icon: MapPin },
]

export function Navigation() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r bg-card min-h-screen fixed left-0 top-0 z-40">
        {/* Logo */}
        <div className="p-6 border-b">
          <Link href="/" className="block">
            <h1 className="newspaper-masthead text-xl font-bold tracking-wider uppercase">
              Sanctuary
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 italic">Community Hub</p>
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sanctuary-gold to-sanctuary-navy flex items-center justify-center text-white text-xs font-bold">
              AC
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Alex Chen</p>
              <p className="text-xs text-muted-foreground">NeuralPath AI</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 hover:bg-muted rounded-lg"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/" className="font-semibold text-lg">Sanctuary</Link>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-muted rounded-lg">
              <Search className="h-5 w-5 text-muted-foreground" />
            </button>
            <button className="p-2 hover:bg-muted rounded-lg relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-destructive rounded-full" />
            </button>
            <button className="p-2 hover:bg-muted rounded-lg">
              <User className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-card shadow-xl">
            <div className="p-4 border-b flex items-center justify-between">
              <h1 className="newspaper-masthead text-xl font-bold tracking-wider uppercase">
                Sanctuary
              </h1>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
