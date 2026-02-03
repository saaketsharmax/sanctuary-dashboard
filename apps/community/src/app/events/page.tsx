'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format, parseISO, isToday, isTomorrow, isThisWeek, addDays } from 'date-fns'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Sparkles,
  Coffee,
  Dumbbell,
  Mic,
  BookOpen,
  PartyPopper,
  Globe,
  Check,
  HelpCircle,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockEvents } from '@/lib/mock-data'
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

function EventCard({ event, userRSVP, onRSVP }: {
  event: CommunityEvent
  userRSVP?: RSVPStatus
  onRSVP: (eventId: string, status: RSVPStatus) => void
}) {
  const config = categoryConfig[event.category]
  const CategoryIcon = config.icon
  const eventDate = parseISO(event.date)

  const getDateLabel = () => {
    if (isToday(eventDate)) return 'Today'
    if (isTomorrow(eventDate)) return 'Tomorrow'
    return format(eventDate, 'EEE, MMM d')
  }

  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
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
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Video className="h-3 w-3" />
            Virtual
          </span>
        )}
      </div>

      <h3 className="font-semibold text-lg mb-2 newspaper-headline">{event.title}</h3>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>

      <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-4">
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
                className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs"
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <span className="text-gray-500">
            {event.rsvpCount} going
            {event.spotsRemaining !== undefined && (
              <> · {event.spotsRemaining} spots left</>
            )}
          </span>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => onRSVP(event.id, 'attending')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              userRSVP === 'attending'
                ? 'bg-green-100 text-green-700'
                : 'hover:bg-gray-100 text-gray-500'
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
                : 'hover:bg-gray-100 text-gray-500'
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
                : 'hover:bg-gray-100 text-gray-500'
            )}
            title="Can't go"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function WeekCalendar({ selectedDate, onSelectDate }: {
  selectedDate: Date
  onSelectDate: (date: Date) => void
}) {
  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date()
    const day = today.getDay()
    return addDays(today, -day)
  })

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <div className="bg-white border rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setWeekStart(addDays(weekStart, -7))}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="font-medium">
          {format(weekStart, 'MMMM yyyy')}
        </span>
        <button
          onClick={() => setWeekStart(addDays(weekStart, 7))}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
          const isTodayDate = isToday(day)
          const eventsOnDay = mockEvents.filter(
            (e) => e.date === format(day, 'yyyy-MM-dd')
          ).length

          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={cn(
                'flex flex-col items-center p-2 rounded-lg transition-colors',
                isSelected && 'bg-sanctuary-navy text-white',
                !isSelected && isTodayDate && 'bg-sanctuary-gold/20',
                !isSelected && !isTodayDate && 'hover:bg-gray-100'
              )}
            >
              <span className="text-xs uppercase">{format(day, 'EEE')}</span>
              <span className="text-lg font-semibold">{format(day, 'd')}</span>
              {eventsOnDay > 0 && (
                <div className="flex gap-0.5 mt-1">
                  {[...Array(Math.min(3, eventsOnDay))].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        isSelected ? 'bg-white/80' : 'bg-sanctuary-navy'
                      )}
                    />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function EventsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'all'>('all')
  const [userRSVPs, setUserRSVPs] = useState<Record<string, RSVPStatus>>({})

  const handleRSVP = (eventId: string, status: RSVPStatus) => {
    setUserRSVPs((prev) => ({
      ...prev,
      [eventId]: prev[eventId] === status ? undefined : status,
    } as Record<string, RSVPStatus>))
  }

  const filteredEvents = mockEvents.filter((event) => {
    if (selectedCategory !== 'all' && event.category !== selectedCategory) return false
    return true
  })

  const todayEvents = filteredEvents.filter((e) => isToday(parseISO(e.date)))
  const upcomingEvents = filteredEvents.filter((e) => !isToday(parseISO(e.date)))

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold newspaper-masthead tracking-wider">EVENTS</h1>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-sanctuary-navy text-white rounded-lg hover:bg-opacity-90 transition-colors">
              <Plus className="h-4 w-4" />
              <span>Host Event</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Week Calendar */}
        <WeekCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        {/* Category Filter */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <Filter className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              selectedCategory === 'all'
                ? 'bg-sanctuary-navy text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            All Events
          </button>
          {Object.entries(categoryConfig).map(([key, config]) => {
            const Icon = config.icon
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key as EventCategory)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1',
                  selectedCategory === key
                    ? config.color
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                <Icon className="h-3 w-3" />
                {config.label}
              </button>
            )
          })}
        </div>

        {/* Today's Events */}
        {todayEvents.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Today
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {todayEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  userRSVP={userRSVPs[event.id]}
                  onRSVP={handleRSVP}
                />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Events */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Upcoming</h2>
          {upcomingEvents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {upcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  userRSVP={userRSVPs[event.id]}
                  onRSVP={handleRSVP}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming events in this category</p>
            </div>
          )}
        </section>

        {/* My RSVPs Summary */}
        {Object.keys(userRSVPs).length > 0 && (
          <section className="mt-8 p-4 bg-white border rounded-lg">
            <h3 className="font-semibold mb-2">Your RSVPs</h3>
            <div className="flex gap-4 text-sm">
              <span className="text-green-600">
                {Object.values(userRSVPs).filter((s) => s === 'attending').length} attending
              </span>
              <span className="text-amber-600">
                {Object.values(userRSVPs).filter((s) => s === 'maybe').length} maybe
              </span>
              <span className="text-gray-500">
                {Object.values(userRSVPs).filter((s) => s === 'declined').length} declined
              </span>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
