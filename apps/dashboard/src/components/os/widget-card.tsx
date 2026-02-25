'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface WidgetCardProps {
  children: ReactNode
  className?: string
  title?: string
  scrollable?: boolean
  maxHeight?: string
}

export function WidgetCard({
  children,
  className,
  title,
  scrollable = false,
  maxHeight = '300px'
}: WidgetCardProps) {
  return (
    <div className={cn(
      'bg-white/70 backdrop-blur-xl rounded-[15px] shadow-[0px_10px_30px_0px_rgba(0,0,0,0.1)] border border-white/20 flex flex-col overflow-hidden w-full h-full',
      className
    )}>
      {title && (
        <div className="flex items-center justify-center h-[30px] border-b border-white/30 px-4 shrink-0 bg-white/30 backdrop-blur-sm">
          <p className="text-[11.6px] font-semibold text-black/90 text-center leading-[16.2px] truncate">
            {title}
          </p>
        </div>
      )}
      <div
        className={cn(
          'flex-1 min-h-0',
          scrollable && 'overflow-auto'
        )}
        style={scrollable ? { maxHeight } : undefined}
      >
        {children}
      </div>
    </div>
  )
}
