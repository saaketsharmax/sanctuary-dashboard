'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  Share2,
  Check,
  HelpCircle,
  X,
  MessageCircle,
  Send,
  Repeat,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockEvents } from '@/lib/mock-data'
import { categoryConfig } from '@/components/EventCard'
import type { RSVPStatus } from '@/types'

export default function EventDetailPage() {
  const params = useParams()
  const eventId = params.id as string
  const event = mockEvents.find((e) => e.id === eventId)

  const [userRSVP, setUserRSVP] = useState<RSVPStatus | undefined>(undefined)
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState([
    {
      id: 'c1',
      userName: 'Sarah Johnson',
      content: 'Super excited for this! Should we bring anything?',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'c2',
      userName: 'Sanctuary Team',
      content: 'Just bring yourself and your questions! We will provide all materials.',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ])

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-xl font-semibold mb-2">Event not found</h2>
          <Link href="/events" className="text-primary hover:underline">
            Back to events
          </Link>
        </div>
      </div>
    )
  }

  const config = categoryConfig[event.category]
  const CategoryIcon = config.icon
  const eventDate = parseISO(event.date)

  const handleRSVP = (status: RSVPStatus) => {
    setUserRSVP(userRSVP === status ? undefined : status)
  }

  const handleComment = () => {
    if (newComment.trim()) {
      setComments([
        ...comments,
        {
          id: `c-${Date.now()}`,
          userName: 'Alex Chen',
          content: newComment.trim(),
          createdAt: new Date().toISOString(),
        },
      ])
      setNewComment('')
    }
  }

  // Mock attendees
  const attendees = [
    { id: 1, name: 'Sarah Johnson', role: 'CTO, GreenMetrics' },
    { id: 2, name: 'Marcus Williams', role: 'Founder, FinFlow' },
    { id: 3, name: 'Priya Sharma', role: 'Designer' },
    { id: 4, name: 'James O\'Connor', role: 'Engineer, DataSync' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/events" className="text-muted-foreground hover:text-foreground">
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <span className="text-sm text-muted-foreground">Event Details</span>
            </div>
            <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Header */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1', config.color)}>
                  <CategoryIcon className="h-3 w-3" />
                  {config.label}
                </span>
                {event.isHighlight && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                    Featured
                  </span>
                )}
                {event.isVirtual && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground flex items-center gap-1">
                    <Video className="h-3 w-3" />
                    Virtual
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold newspaper-headline mb-4">{event.title}</h1>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {format(eventDate, 'EEEE, MMMM d, yyyy')}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {event.startTime} - {event.endTime}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </span>
                {event.isRecurring && (
                  <span className="flex items-center gap-1.5">
                    <Repeat className="h-4 w-4" />
                    {event.recurrencePattern}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="font-semibold mb-3">About this event</h2>
              <p className="text-muted-foreground leading-relaxed">{event.description}</p>

              {event.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {event.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-muted text-muted-foreground text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Virtual Link */}
            {event.isVirtual && event.virtualLink && (
              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Video className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-sm">Virtual Event</p>
                      <p className="text-xs text-muted-foreground">Join via video call</p>
                    </div>
                  </div>
                  <a
                    href={event.virtualLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Join Call
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Discussion ({comments.length})
              </h2>

              <div className="space-y-4 mb-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sanctuary-gold to-sanctuary-navy flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {comment.userName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{comment.userName}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sanctuary-gold to-sanctuary-navy flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  AC
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                    onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                  />
                  <button
                    onClick={handleComment}
                    disabled={!newComment.trim()}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      newComment.trim()
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    )}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* RSVP Card */}
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-4">RSVP</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleRSVP('attending')}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors text-sm font-medium',
                    userRSVP === 'attending'
                      ? 'bg-green-100 border-green-300 text-green-700'
                      : 'hover:bg-muted'
                  )}
                >
                  <Check className="h-4 w-4" />
                  Going
                </button>
                <button
                  onClick={() => handleRSVP('maybe')}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors text-sm font-medium',
                    userRSVP === 'maybe'
                      ? 'bg-amber-100 border-amber-300 text-amber-700'
                      : 'hover:bg-muted'
                  )}
                >
                  <HelpCircle className="h-4 w-4" />
                  Maybe
                </button>
                <button
                  onClick={() => handleRSVP('declined')}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors text-sm font-medium',
                    userRSVP === 'declined'
                      ? 'bg-red-100 border-red-300 text-red-700'
                      : 'hover:bg-muted'
                  )}
                >
                  <X className="h-4 w-4" />
                  Can&apos;t Go
                </button>
              </div>
            </div>

            {/* Host */}
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-3">Hosted by</h3>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sanctuary-gold to-sanctuary-navy flex items-center justify-center text-white font-bold">
                  {event.hostName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-medium text-sm">{event.hostName}</p>
                  <p className="text-xs text-muted-foreground">Event Organizer</p>
                </div>
              </div>
            </div>

            {/* Capacity */}
            {event.capacity && (
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold mb-3">Capacity</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    {event.rsvpCount} / {event.capacity} spots filled
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={cn(
                      'h-2 rounded-full transition-all',
                      (event.spotsRemaining ?? 0) < 5 ? 'bg-amber-500' : 'bg-green-500'
                    )}
                    style={{ width: `${(event.rsvpCount / event.capacity) * 100}%` }}
                  />
                </div>
                {event.spotsRemaining !== undefined && event.spotsRemaining > 0 && (
                  <p className="text-xs text-amber-600 mt-2">
                    {event.spotsRemaining} spots remaining
                  </p>
                )}
                {event.hasWaitlist && event.spotsRemaining === 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Waitlist available
                  </p>
                )}
              </div>
            )}

            {/* Attendees */}
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Attendees ({event.rsvpCount})
              </h3>
              <div className="space-y-3">
                {attendees.map((attendee) => (
                  <div key={attendee.id} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                      {attendee.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{attendee.name}</p>
                      <p className="text-xs text-muted-foreground">{attendee.role}</p>
                    </div>
                  </div>
                ))}
                {event.rsvpCount > 4 && (
                  <p className="text-xs text-muted-foreground">
                    +{event.rsvpCount - 4} more
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
