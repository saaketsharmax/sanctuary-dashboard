'use client'

import { Search, Filter, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchFilterProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  placeholder?: string
  filters?: {
    key: string
    label: string
    options: { value: string; label: string }[]
    selected: string
    onChange: (value: string) => void
  }[]
  tags?: {
    key: string
    label: string
    active: boolean
    onClick: () => void
    color?: string
  }[]
}

export function SearchFilter({
  searchQuery,
  onSearchChange,
  placeholder = 'Search...',
  filters,
  tags,
}: SearchFilterProps) {
  return (
    <div className="bg-card border rounded-lg p-4 space-y-3">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        {filters && filters.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {filters.map((filter) => (
              <select
                key={filter.key}
                value={filter.selected}
                onChange={(e) => filter.onChange(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-sm"
              >
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ))}
          </div>
        )}
      </div>

      {/* Tag Filters */}
      {tags && tags.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {tags.map((tag) => (
            <button
              key={tag.key}
              onClick={tag.onClick}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                tag.active
                  ? tag.color || 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              )}
            >
              {tag.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
