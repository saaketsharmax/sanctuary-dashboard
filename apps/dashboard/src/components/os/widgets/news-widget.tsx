'use client'

import { WidgetCard } from '../widget-card'

interface NewsItem {
  category: string
  title: string
  image?: string
  backgroundColor?: string
}

interface NewsWidgetProps {
  items: NewsItem[]
  title?: string
  onViewAll?: () => void
}

export function NewsWidget({ items, title = 'Latest Updates', onViewAll }: NewsWidgetProps) {
  return (
    <WidgetCard title={title} scrollable maxHeight="260px">
      <div className="flex flex-col">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-start gap-6 p-2.5 hover:bg-black/5 transition-colors cursor-pointer"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[9.5px] font-medium text-black/50 leading-[13.5px] mb-1">
                {item.category}
              </p>
              <p className="text-[11.4px] font-medium text-black leading-[16.2px] line-clamp-2">
                {item.title}
              </p>
            </div>
            {item.image && (
              <div
                className="w-[45px] h-[45px] rounded-[4px] flex-shrink-0 overflow-hidden"
                style={{ backgroundColor: item.backgroundColor || '#ccc' }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        ))}

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="mx-2.5 my-2.5 bg-black text-white rounded-full py-1.5 px-3 text-[11.1px] font-medium leading-[16.2px] hover:bg-black/90 transition-colors"
          >
            View All
          </button>
        )}
      </div>
    </WidgetCard>
  )
}
