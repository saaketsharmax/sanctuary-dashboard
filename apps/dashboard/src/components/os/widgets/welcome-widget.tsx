'use client'

import { WidgetCard } from '../widget-card'

interface WelcomeWidgetProps {
  title: string
  description: string
  image?: string
  backgroundColor?: string
  link?: {
    text: string
    href: string
  }
}

export function WelcomeWidget({
  title,
  description,
  image,
  backgroundColor = '#105b90',
  link
}: WelcomeWidgetProps) {
  return (
    <WidgetCard>
      <div className="relative overflow-hidden rounded-[15px]">
        {/* Image */}
        <div
          className="w-full h-[360px] relative"
          style={{ backgroundColor }}
        >
          {image && (
            <img
              src={image}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </div>

        {/* Overlay Content */}
        <div className="absolute top-0 left-0 right-0 p-5 bg-gradient-to-b from-black/75 to-transparent">
          <h3 className="text-[15.5px] font-medium text-white leading-[21.6px] mb-2">
            {title}
          </h3>
          <div className="max-w-[264px]">
            <p className="text-[11.4px] font-bold text-white/75 leading-[16.2px] mb-3">
              {description}
            </p>
            {link && (
              <div className="flex items-end">
                <span className="text-[12px] font-bold text-white/75 leading-[16.2px]">
                  Find out more{' '}
                </span>
                <a
                  href={link.href}
                  className="text-[11.4px] font-bold text-white/75 leading-[16.2px] border-b border-white/75 hover:text-white hover:border-white transition-colors"
                >
                  {link.text}
                </a>
                <span className="text-[12px] font-bold text-white/75 leading-[16.2px]">
                  .
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </WidgetCard>
  )
}
