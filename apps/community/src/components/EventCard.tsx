'use client'

import Link from 'next/link'
import { format, parseISO, isToday, isTomorrow } from 'date-fns'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  Check,
  HelpCircle,
  X,
  BookOpen,
  Coffee,
  Mic,
  Dumbbell,
  Sparkles,
  PartyPopper,
  Globe,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CommunityEvent, EventCategory, RSVPStatus } from '@/types'

const categoryConfig: Record<
  EventCategory,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  workshop: { label: 'Workshop', icon: BookOpen, color: 'bg-blue-100 text-blue-700' },
  social: { label: 'Social', icon: Coffee, color: 'bg-pink-100 text-pink-700' },
  pitch: { label: 'Pitch', icon: Mic, color: 'bg-purple-100 text-purple-700' },
  networking: { label: 'Networking', icon: Users, color: 'bg-green-100 text-green-700' },
  wellness: { label: 'Wellness', icon: Dumbbell, color: 'bg-teal-100 text-teal-700' },
  learning: { label: 'Learning', icon: Sparkles, color: 'bg-amber-100 text-amber-700' },
  celebration: { label: 'Celebration', icon: PartyPopper, color: 'bg-orange-100 text-orange-700' },
  external: { label: 'External', icon: Globe, color: 'bg-gray-100 text-gray-700' },
}

export { categoryConfig }

interface EventCardProps {
  event: CommunityEvent
  userRSVP?: RSVPStatus
  onRSVP?: (eventId: string, status: RSVPStatus) => void
  compact?: boolean
}

export function EventCard({ event, userRSVP, onRSVP, compact = false }: EventCardProps) {
  const config = categoryConfig[event.category]
  const CategoryIcon = config.icon
  const eventDate = parseISO(event.date)

  const getDateLabel = () => {
    if (isToday(eventDate)) return 'Today'
    if (isTomorrow(eventDate)) return 'Tomorrow'
    return format(eventDate, 'EEE, MMM d')
  }

  if (compact) {
    return (
      <Link
        href={`/events/${event.id}`}
        className="flex items-center gap-4 p-3 bg-card border rounded-lg hover:shadow-sm transition-shadow"
      >
        <div className="text-sm font-medium text-muted-foreground w-16">
          {event.startTime}
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <CategoryIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <span className="font-medium truncate">{event.title}</span>
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {event.rsvpCount} going
        </span>
      </Link>
    )
  }

  return (
    <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={cn('px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1', config.color)}>
            <CategoryIcon className="h-3 w-3" />
            {config.label}
          </span>
          {event.isHighlight && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
              Featured
            </span>
          )}
        </div>
        {event.isVirtual && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Video className="h-3 w-3" />
            Virtual
          </span>
        )}
      </div>

      <Link href={`/events/${event.id}`}>
        <h3 className="font-semibold text-lg mb-2 newspaper-headline hover:text-primary transition-colors">
          {event.title}
        </h3>
      </Link>

      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{event.description}</p>

      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
        <span className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {getDateLabel()}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {event.startTime} - {event.endTime}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {event.location}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <div className="flex -space-x-2">
            {[...Array(Math.min(3, event.rsvpCount))].map((_, i) => (
              <div
                key={i}
                className="h-6 w-6 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs"
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <span className="text-muted-foreground">
            {event.rsvpCount} going
            {event.spotsRemaining !== undefined && (
              <> · {event.spotsRemaining} spots left</>
            )}
          </span>
        </div>

        {onRSVP && (
          <div className="flex gap-1">
            <button
              onClick={() => onRSVP(event.id, 'attending')}
              className={cn(
                'p-2 rounded-lg transition-colors',
                userRSVP === 'attending'
                  ? 'bg-green-100 text-green-700'
                  : 'hover:bg-muted text-muted-foreground'
              )}
              title="Going"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={() => onRSVP(event.id, 'maybe')}
              className={cn(
                'p-2 rounded-lg transition-colors',
                userRSVP === 'maybe'
                  ? 'bg-amber-100 text-amber-700'
                  : 'hover:bg-muted text-muted-foreground'
              )}
              title="Maybe"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
            <button
              onClick={() => onRSVP(event.id, 'declined')}
              className={cn(
                'p-2 rounded-lg transition-colors',
                userRSVP === 'declined'
                  ? 'bg-red-100 text-red-700'
                  : 'hover:bg-muted text-muted-foreground'
              )}
              title="Can't go"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
