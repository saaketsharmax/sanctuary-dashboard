'use client'

import { Home, Briefcase, FileText, Users, BarChart3, Settings, Building2, MessageSquare, CheckSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NavSection } from './os-layout'

interface BottomNavProps {
  activeSection: NavSection
  onNavigate: (section: NavSection) => void
  role?: 'founder' | 'partner'
}

const founderNavItems: Array<{ id: NavSection; icon: React.ElementType; label: string }> = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'company', icon: Building2, label: 'Company' },
  { id: 'documents', icon: FileText, label: 'Documents' },
  { id: 'requests', icon: MessageSquare, label: 'Requests' },
  { id: 'progress', icon: CheckSquare, label: 'Progress' },
  { id: 'settings', icon: Settings, label: 'Settings' },
]

const partnerNavItems: Array<{ id: NavSection; icon: React.ElementType; label: string }> = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'portfolio', icon: Briefcase, label: 'Portfolio' },
  { id: 'applications', icon: FileText, label: 'Applications' },
  { id: 'mentors', icon: Users, label: 'Mentors' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  { id: 'settings', icon: Settings, label: 'Settings' },
]

export function BottomNav({ activeSection, onNavigate, role = 'founder' }: BottomNavProps) {
  const navItems = role === 'founder' ? founderNavItems : partnerNavItems
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-white/70 backdrop-blur-2xl rounded-[24px] shadow-[0px_10px_30px_0px_rgba(0,0,0,0.15)] border border-white/30 px-3 py-2.5 transition-all duration-300 hover:shadow-[0px_15px_40px_0px_rgba(0,0,0,0.20)] hover:scale-105">
        <div className="flex items-center gap-2">
          {navItems.map((item, index) => {
            const Icon = item.icon
            const isActive = activeSection === item.id

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  'flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300',
                  'hover:bg-white/50 hover:backdrop-blur-sm hover:scale-110 active:scale-95',
                  isActive && 'bg-white/60 backdrop-blur-md shadow-lg scale-105'
                )}
                title={item.label}
                style={{
                  transitionDelay: `${index * 20}ms`
                }}
              >
                <Icon
                  className={cn(
                    "w-[28px] h-[28px] text-black transition-all duration-300",
                    isActive && "scale-110"
                  )}
                  strokeWidth={isActive ? 2 : 1.5}
                />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
