'use client'

import { WidgetCard } from '../widget-card'
import { ArrowRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

interface ListItem {
  id: string
  title: string
  subtitle?: string
  status?: 'completed' | 'pending' | 'warning'
  onClick?: () => void
}

interface ListWidgetProps {
  items: ListItem[]
  title?: string
  onViewAll?: () => void
}

const statusIcons = {
  completed: CheckCircle2,
  pending: Clock,
  warning: AlertCircle,
}

const statusColors = {
  completed: 'text-green-600',
  pending: 'text-blue-600',
  warning: 'text-yellow-600',
}

export function ListWidget({ items, title = 'Items', onViewAll }: ListWidgetProps) {
  return (
    <WidgetCard title={title} scrollable maxHeight="300px">
      <div className="flex flex-col">
        {items.map((item) => {
          const StatusIcon = item.status ? statusIcons[item.status] : null

          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className="flex items-center gap-3 p-3 hover:bg-black/5 transition-colors text-left w-full"
            >
              {StatusIcon && (
                <StatusIcon className={`w-4 h-4 flex-shrink-0 ${statusColors[item.status!]}`} />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[11.4px] font-medium text-black leading-[16.2px]">
                  {item.title}
                </p>
                {item.subtitle && (
                  <p className="text-[9.5px] font-medium text-black/50 leading-[13.5px] mt-0.5">
                    {item.subtitle}
                  </p>
                )}
              </div>
              <ArrowRight className="w-4 h-4 text-black/30 flex-shrink-0" />
            </button>
          )
        })}

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="m-2.5 bg-black text-white rounded-full py-1.5 px-3 text-[11.1px] font-medium leading-[16.2px] hover:bg-black/90 transition-colors"
          >
            View All
          </button>
        )}
      </div>
    </WidgetCard>
  )
}
