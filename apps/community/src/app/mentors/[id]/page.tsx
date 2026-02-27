'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ChevronLeft,
  Star,
  Calendar,
  Users,
  Clock,
  MessageCircle,
  Linkedin,
  Globe,
  Mail,
  GraduationCap,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockMentors } from '@/lib/mock-data'
import { expertiseLabels } from '@/components/MentorCard'

export default function MentorProfilePage() {
  const params = useParams()
  const mentorId = params.id as string
  const mentor = mockMentors.find((m) => m.id === mentorId)

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const [topic, setTopic] = useState('')

  if (!mentor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-xl font-semibold mb-2">Mentor not found</h2>
          <Link href="/mentors" className="text-primary hover:underline">
            Back to mentors
          </Link>
        </div>
      </div>
    )
  }

  // Mock available time slots
  const timeSlots = [
    { id: 'slot-1', date: 'Tomorrow', time: '10:00 AM - 10:30 AM', available: true },
    { id: 'slot-2', date: 'Tomorrow', time: '10:30 AM - 11:00 AM', available: true },
    { id: 'slot-3', date: 'Tomorrow', time: '11:00 AM - 11:30 AM', available: false },
    { id: 'slot-4', date: 'This Thursday', time: '2:00 PM - 2:30 PM', available: true },
    { id: 'slot-5', date: 'This Thursday', time: '2:30 PM - 3:00 PM', available: true },
    { id: 'slot-6', date: 'This Thursday', time: '3:00 PM - 3:30 PM', available: true },
  ]

  // Mock past sessions / testimonials
  const testimonials = [
    {
      id: 't1',
      name: 'Sarah Johnson',
      role: 'CTO, GreenMetrics',
      content: 'Incredibly helpful session on fundraising strategy. Clear, actionable advice.',
      rating: 5,
    },
    {
      id: 't2',
      name: 'Marcus Williams',
      role: 'Founder, FinFlow',
      content: 'Great insights on pricing models. Helped us rethink our entire approach.',
      rating: 5,
    },
  ]

  const handleBooking = () => {
    if (selectedSlot) {
      setBookingConfirmed(true)
    }
  }

  const availabilityColor = {
    available: 'text-green-700 bg-green-100',
    limited: 'text-amber-700 bg-amber-100',
    unavailable: 'text-red-700 bg-red-100',
  }

  const availabilityDot = {
    available: 'bg-green-500',
    limited: 'bg-amber-500',
    unavailable: 'bg-red-500',
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/mentors" className="text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <span className="text-sm text-muted-foreground">Mentor Profile</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-start gap-5">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-sanctuary-gold to-sanctuary-navy flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {mentor.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-bold">{mentor.name}</h1>
                    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1.5', availabilityColor[mentor.availability])}>
                      <span className={cn('h-1.5 w-1.5 rounded-full', availabilityDot[mentor.availability])} />
                      {mentor.availability === 'available' ? 'Available' : mentor.availability === 'limited' ? 'Limited' : 'Unavailable'}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{mentor.title}</p>
                  <p className="font-medium text-sanctuary-navy">{mentor.company}</p>

                  {/* Quick Stats */}
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-500" />
                      {mentor.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {mentor.sessionCount} sessions
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {mentor.menteeCount} mentees
                    </span>
                  </div>

                  {/* Links */}
                  <div className="flex items-center gap-2 mt-3">
                    {mentor.linkedIn && (
                      <a
                        href={`https://${mentor.linkedIn}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-muted-foreground hover:text-blue-600 transition-colors border rounded-lg hover:bg-muted"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                    {mentor.twitter && (
                      <a
                        href={`https://twitter.com/${mentor.twitter.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors border rounded-lg hover:bg-muted"
                      >
                        <Globe className="h-4 w-4" />
                      </a>
                    )}
                    {mentor.personalSite && (
                      <a
                        href={`https://${mentor.personalSite}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors border rounded-lg hover:bg-muted"
                      >
                        <Globe className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="font-semibold text-lg mb-3">About</h2>
              <p className="text-muted-foreground leading-relaxed">{mentor.bio}</p>
            </div>

            {/* Expertise & Tags */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="font-semibold text-lg mb-3">Expertise</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {mentor.expertise.map((exp) => (
                  <span
                    key={exp}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-full font-medium"
                  >
                    {expertiseLabels[exp]}
                  </span>
                ))}
              </div>
              <h3 className="font-medium text-sm text-muted-foreground mb-2">Topics</h3>
              <div className="flex flex-wrap gap-2">
                {mentor.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Testimonials */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="font-semibold text-lg mb-4">What mentees say</h2>
              <div className="space-y-4">
                {testimonials.map((t) => (
                  <div key={t.id} className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground italic mb-2">
                      &ldquo;{t.content}&rdquo;
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-sanctuary-gold to-sanctuary-navy flex items-center justify-center text-white text-xs font-bold">
                        {t.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {t.name} - {t.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Booking */}
          <div className="space-y-6">
            {bookingConfirmed ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-green-800 mb-1">Session Booked!</h3>
                <p className="text-sm text-green-700 mb-3">
                  Your session with {mentor.name} has been confirmed.
                </p>
                <p className="text-xs text-green-600">
                  You will receive a calendar invite shortly.
                </p>
                <button
                  onClick={() => {
                    setBookingConfirmed(false)
                    setSelectedSlot(null)
                    setTopic('')
                  }}
                  className="mt-4 text-sm text-green-700 hover:underline"
                >
                  Book another session
                </button>
              </div>
            ) : (
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold mb-1">Book a Session</h3>
                {mentor.officeHours && (
                  <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Office Hours: {mentor.officeHours}
                  </p>
                )}

                {/* Topic */}
                <div className="mb-4">
                  <label className="text-sm font-medium mb-1.5 block">
                    What would you like to discuss?
                  </label>
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Brief description of what you need help with..."
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background resize-none"
                  />
                </div>

                {/* Time Slots */}
                <div className="mb-4">
                  <label className="text-sm font-medium mb-2 block">
                    Available Slots
                  </label>
                  <div className="space-y-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.id}
                        disabled={!slot.available}
                        onClick={() => setSelectedSlot(slot.id)}
                        className={cn(
                          'w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-colors text-left',
                          !slot.available && 'opacity-50 cursor-not-allowed bg-muted',
                          selectedSlot === slot.id
                            ? 'border-primary bg-primary/5 text-primary'
                            : slot.available && 'hover:bg-muted'
                        )}
                      >
                        <div>
                          <p className="font-medium">{slot.date}</p>
                          <p className="text-xs text-muted-foreground">{slot.time}</p>
                        </div>
                        {selectedSlot === slot.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                        {!slot.available && (
                          <span className="text-xs text-muted-foreground">Booked</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Book Button */}
                <button
                  onClick={handleBooking}
                  disabled={!selectedSlot}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    selectedSlot
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  )}
                >
                  <Calendar className="h-4 w-4" />
                  Book Session
                </button>
              </div>
            )}

            {/* Contact */}
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-3">Quick Contact</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 border rounded-lg text-sm hover:bg-muted transition-colors">
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  Send a Slack message
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 border rounded-lg text-sm hover:bg-muted transition-colors">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Send an email
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
