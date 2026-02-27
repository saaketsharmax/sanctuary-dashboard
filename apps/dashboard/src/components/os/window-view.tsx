'use client'

import { cn } from '@sanctuary/ui'
import { X, Maximize2, Minimize2 } from 'lucide-react'
import { useState } from 'react'
import type { NavSection } from './os-layout'
import { FounderCompanyContent } from './window-content/founder-company'
import { FounderDocumentsContent } from './window-content/founder-documents'
import { FounderProgressContent } from './window-content/founder-progress'
import { PartnerPortfolioContent } from './window-content/partner-portfolio'
import { PartnerApplicationsContent } from './window-content/partner-applications'

interface WindowViewProps {
  section: NavSection
  onClose: () => void
  role?: 'founder' | 'partner'
}

export function WindowView({ section, onClose, role = 'founder' }: WindowViewProps) {
  const [isMaximized, setIsMaximized] = useState(false)

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized)
  }

  const getSectionTitle = (section: NavSection): string => {
    const titles: Partial<Record<NavSection, string>> = {
      home: 'Home',
      portfolio: 'Portfolio',
      applications: 'Applications',
      mentors: 'Mentors',
      analytics: 'Analytics',
      settings: 'Settings',
      company: 'My Company',
      documents: 'Documents',
      requests: 'Requests',
      progress: 'Progress',
    }
    return titles[section] || section.charAt(0).toUpperCase() + section.slice(1)
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#2F5049]/30 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={cn(
          'bg-[#E8E4DC]/60 backdrop-blur-3xl rounded-3xl shadow-[0px_8px_32px_rgba(47,80,73,0.15),0px_1px_1px_rgba(47,80,73,0.05)] border border-[#D4C9BE]/30 flex flex-col overflow-hidden transition-all duration-300 ease-out animate-in zoom-in-95 slide-in-from-bottom-4 p-1',
          isMaximized ? 'w-full h-full rounded-3xl' : 'w-[90%] h-[85%] max-w-6xl'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Inner cream container */}
        <div className="bg-[#FEFDFB] rounded-2xl shadow-inner flex flex-col overflow-hidden h-full">
          {/* Window Header */}
          <div className="flex items-center justify-between px-5 h-[50px] border-b border-[#D4C9BE] shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#F48C7F] transition-all duration-200 hover:scale-110 cursor-pointer" />
              <div className="w-3 h-3 rounded-full bg-[#FFB5A8] transition-all duration-200 hover:scale-110 cursor-pointer" />
              <div className="w-3 h-3 rounded-full bg-[#6B9B8A] transition-all duration-200 hover:scale-110 cursor-pointer" />
            </div>

            <div className="absolute left-1/2 -translate-x-1/2">
              <p className="text-sm font-medium text-[#2F5049]">
                {getSectionTitle(section)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleMaximize}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#E8E4DC] transition-all duration-200 hover:scale-110 active:scale-95"
              >
                {isMaximized ? (
                  <Minimize2 className="w-4 h-4 text-[#3D6B5E]" />
                ) : (
                  <Maximize2 className="w-4 h-4 text-[#3D6B5E]" />
                )}
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#E8E4DC] transition-all duration-200 hover:scale-110 active:scale-95"
              >
                <X className="w-4 h-4 text-[#3D6B5E]" />
              </button>
            </div>
          </div>

          {/* Window Content */}
          <div className="flex-1 overflow-auto">
            <WindowContent section={section} role={role} />
          </div>
        </div>
      </div>
    </div>
  )
}

function WindowContent({ section, role }: { section: NavSection; role?: 'founder' | 'partner' }) {
  // Render appropriate content based on section and role
  if (role === 'founder') {
    if (section === 'company') return <FounderCompanyContent />
    if (section === 'documents') return <FounderDocumentsContent />
    if (section === 'progress') return <FounderProgressContent />
  }

  if (role === 'partner') {
    if (section === 'portfolio') return <PartnerPortfolioContent />
    if (section === 'applications') return <PartnerApplicationsContent />
  }

  // Default placeholder for sections without custom content yet
  return (
    <div className="w-full h-full p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-medium text-black mb-2">
          {section.charAt(0).toUpperCase() + section.slice(1)}
        </h2>
        <p className="text-sm text-black/50">
          {role === 'founder' ? 'Founder view' : 'Partner view'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        <div className="bg-muted/50 border border-black/[0.06] rounded-2xl p-6 text-center transition-all duration-200 hover:shadow-md hover:scale-105">
          <p className="text-black/50">Content module 1</p>
        </div>
        <div className="bg-muted/50 border border-black/[0.06] rounded-2xl p-6 text-center transition-all duration-200 hover:shadow-md hover:scale-105">
          <p className="text-black/50">Content module 2</p>
        </div>
        <div className="bg-muted/50 border border-black/[0.06] rounded-2xl p-6 text-center transition-all duration-200 hover:shadow-md hover:scale-105">
          <p className="text-black/50">Content module 3</p>
        </div>
        <div className="bg-muted/50 border border-black/[0.06] rounded-2xl p-6 text-center transition-all duration-200 hover:shadow-md hover:scale-105">
          <p className="text-black/50">Content module 4</p>
        </div>
      </div>
    </div>
  )
}
