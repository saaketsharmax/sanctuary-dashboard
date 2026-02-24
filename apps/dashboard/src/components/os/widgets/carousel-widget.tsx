'use client'

import { useState } from 'react'
import { WidgetCard } from '../widget-card'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CarouselItem {
  title: string
  subtitle?: string
  image: string
  backgroundColor?: string
  action?: {
    label: string
    onClick: () => void
  }
}

interface CarouselWidgetProps {
  items: CarouselItem[]
  title?: string
  height?: string
}

export function CarouselWidget({
  items,
  title = 'Featured',
  height = '300px'
}: CarouselWidgetProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1))
  }

  const currentItem = items[currentIndex]

  return (
    <WidgetCard title={title}>
      <div className="relative overflow-hidden" style={{ height }}>
        {/* Carousel Content */}
        <div
          className="absolute inset-0 w-full h-full transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            width: `${items.length * 100}%`
          }}
        >
          <div className="flex h-full">
            {items.map((item, index) => (
              <div
                key={index}
                className="relative flex-shrink-0 w-full h-full"
                style={{ width: `${100 / items.length}%` }}
              >
                {/* Background Image */}
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: item.backgroundColor || '#ccc' }}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent" />

                {/* Content */}
                {(item.title || item.subtitle || item.action) && (
                  <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/50 to-transparent">
                    <h3 className="text-[15.6px] font-medium text-white leading-[21.6px] mb-1">
                      {item.title}
                    </h3>
                    {item.subtitle && (
                      <p className="text-[15.4px] font-medium text-white/75 leading-[21.6px] mb-4">
                        {item.subtitle}
                      </p>
                    )}
                    {item.action && (
                      <button
                        onClick={item.action.onClick}
                        className="bg-white border border-transparent rounded-full px-3.5 py-1.5 text-[10.9px] font-medium text-black leading-[16.2px] hover:bg-white/90 transition-colors"
                      >
                        {item.action.label}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between pointer-events-none">
          <button
            onClick={goToPrevious}
            className="bg-white border border-transparent rounded-[16px] w-8 h-8 flex items-center justify-center hover:bg-white/90 transition-colors pointer-events-auto"
          >
            <ChevronLeft className="w-3 h-3 text-black" />
          </button>
          <button
            onClick={goToNext}
            className="bg-white border border-transparent rounded-[16px] w-8 h-8 flex items-center justify-center hover:bg-white/90 transition-colors pointer-events-auto"
          >
            <ChevronRight className="w-3 h-3 text-black" />
          </button>
        </div>

        {/* Progress Indicators */}
        <div className="absolute top-5 left-0 right-0 flex items-center justify-center gap-2.5 px-5">
          {items.map((_, index) => (
            <div
              key={index}
              className="flex-1 max-w-[74px]"
            >
              <div
                className={`h-1 rounded-[6px] transition-all ${
                  index === currentIndex ? 'bg-white' : 'bg-white/30'
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </WidgetCard>
  )
}
