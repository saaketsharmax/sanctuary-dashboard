'use client'

import { cn } from '@/lib/utils'
import { INTERVIEW_SECTIONS } from '@/types'
import type { InterviewSection } from '@/types'
import { Check } from 'lucide-react'

interface InterviewProgressProps {
  currentSection: InterviewSection
  completedSections?: InterviewSection[]
}

export function InterviewProgress({ currentSection, completedSections = [] }: InterviewProgressProps) {
  const currentIndex = INTERVIEW_SECTIONS.findIndex((s) => s.value === currentSection)

  return (
    <div className="w-full">
      {/* Desktop view - horizontal */}
      <div className="hidden sm:flex items-center justify-between">
        {INTERVIEW_SECTIONS.map((section, index) => {
          const isCompleted = completedSections.includes(section.value as InterviewSection) || index < currentIndex
          const isCurrent = section.value === currentSection
          const isPending = index > currentIndex

          return (
            <div key={section.value} className="flex items-center flex-1">
              {/* Section indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                    isCompleted && 'bg-primary text-primary-foreground',
                    isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                    isPending && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : index + 1}
                </div>
                <span
                  className={cn(
                    'mt-2 text-xs text-center max-w-[80px]',
                    isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground'
                  )}
                >
                  {section.label}
                </span>
              </div>

              {/* Connector line */}
              {index < INTERVIEW_SECTIONS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2',
                    index < currentIndex ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile view - compact */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            {INTERVIEW_SECTIONS.find((s) => s.value === currentSection)?.label}
          </span>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} of {INTERVIEW_SECTIONS.length}
          </span>
        </div>
        <div className="flex gap-1">
          {INTERVIEW_SECTIONS.map((section, index) => (
            <div
              key={section.value}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-all',
                index < currentIndex && 'bg-primary',
                index === currentIndex && 'bg-primary',
                index > currentIndex && 'bg-muted'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function InterviewProgressCompact({ currentSection }: { currentSection: InterviewSection }) {
  const currentIndex = INTERVIEW_SECTIONS.findIndex((s) => s.value === currentSection)
  const section = INTERVIEW_SECTIONS.find((s) => s.value === currentSection)

  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1">
        {INTERVIEW_SECTIONS.map((s, index) => (
          <div
            key={s.value}
            className={cn(
              'w-2 h-2 rounded-full transition-all',
              index < currentIndex && 'bg-primary',
              index === currentIndex && 'bg-primary ring-2 ring-primary/30',
              index > currentIndex && 'bg-muted'
            )}
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        {section?.label} ({section?.duration})
      </span>
    </div>
  )
}
