'use client'

import { useState } from 'react'

interface PartnerHeaderProps {
  title: string
  description?: string
  breadcrumb?: string[]
  action?: {
    label: string
    onClick: () => void
  }
}

export function PartnerHeader({ title, description, breadcrumb, action }: PartnerHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="border-b border-[var(--grid-line)] px-10 py-6 flex justify-between items-center bg-[var(--deep-black)]">
      <div className="flex flex-col">
        {/* Breadcrumb */}
        {breadcrumb && breadcrumb.length > 0 && (
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--cream)]/40 mb-1">
            <span>System</span>
            {breadcrumb.map((item, index) => (
              <span key={index} className="flex items-center gap-2">
                <span className="text-[var(--cream)]/20">/</span>
                <span className={index === breadcrumb.length - 1 ? 'text-[var(--olive)]' : ''}>
                  {item}
                </span>
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-2xl font-bold tracking-tighter font-mono uppercase text-[var(--cream)]">
          {title}
        </h1>

        {/* Description */}
        {description && (
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--cream)]/40 mt-1 font-mono">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative hidden lg:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--cream)]/50">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="QUERY_DATABASE"
            className="bg-transparent border border-[var(--grid-line)] py-2 pl-10 pr-4 text-xs tracking-widest font-mono uppercase focus:ring-0 focus:outline-none focus:border-[var(--olive)] w-64 placeholder:text-[var(--cream)]/30 text-[var(--cream)]"
          />
        </div>

        {/* Action Button */}
        {action && (
          <button
            onClick={action.onClick}
            className="bg-[var(--olive)] text-[var(--deep-black)] px-6 py-2 text-xs font-bold tracking-widest font-mono uppercase hover:bg-[var(--cream)] transition-colors"
          >
            {action.label.replace(/ /g, '_')}
          </button>
        )}
      </div>
    </header>
  )
}
