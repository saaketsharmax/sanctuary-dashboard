'use client'

import {
  Users,
  Calendar,
  Trophy,
  MessageSquare,
  MapPin,
  Clock,
  ChevronRight,
  Coffee,
  Dumbbell,
  Gamepad2,
  BookOpen,
  Gift,
  GraduationCap,
  Megaphone,
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

// Mock data - will be replaced with real data
const liveOccupancy = {
  current: 47,
  capacity: 60,
  percentage: 78,
}

const todaysEvents = [
  { id: 1, time: '9:00 AM', title: 'Morning Yoga with Lisa', type: 'fitness', attendees: 12, spotsLeft: 5 },
  { id: 2, time: '11:00 AM', title: 'Workshop: Fundraising 101', type: 'workshop', attendees: 18, spotsLeft: 2 },
  { id: 3, time: '2:00 PM', title: 'Mentor Office Hours', type: 'office-hours', attendees: null, spotsLeft: null },
  { id: 4, time: '5:00 PM', title: 'Pizza Friday!', type: 'social', attendees: 34, spotsLeft: null },
  { id: 5, time: '6:30 PM', title: 'Basketball pickup game', type: 'sports', attendees: 8, spotsLeft: 2 },
]

const headlines = [
  { id: 1, title: 'TechFlow AI closes $2M seed round!', type: 'achievement', date: 'Today' },
  { id: 2, title: 'New mentor joins: Sarah Kim, ex-Stripe Growth Lead', type: 'welcome', date: 'Yesterday' },
  { id: 3, title: 'DataSync reaches 10,000 users milestone', type: 'achievement', date: '2 days ago' },
]

const visitorsToday = [
  { id: 1, name: 'John Smith', company: 'Sequoia Capital', meeting: 'TechFlow', time: '2:00 PM' },
  { id: 2, name: 'Lisa Park', role: 'Mentor', purpose: 'Office Hours', time: '2:00 - 5:00 PM' },
]

const celebrations = [
  { id: 1, type: 'birthday', name: 'Mike Chen', message: 'Happy Birthday!' },
  { id: 2, type: 'anniversary', name: 'DataSync team', message: '3 Year Anniversary!' },
]

const whosHere = [
  { id: 1, name: 'Sarah Chen', company: 'TechFlow', avatar: null },
  { id: 2, name: 'Mike Liu', company: 'DataSync', avatar: null },
  { id: 3, name: 'Alex Thompson', role: 'Partner', avatar: null },
  { id: 4, name: 'Lisa Park', role: 'Mentor', avatar: null },
  { id: 5, name: 'James Wilson', company: 'CloudAI', avatar: null },
]

const communityPosts = [
  { id: 1, author: 'james', content: 'Looking for a tennis partner for Saturday morning!', type: 'looking_for' },
  { id: 2, author: 'priya', content: 'Anyone want to join a book club? Reading "Zero to One"', type: 'looking_for' },
  { id: 3, author: 'chen', content: 'Lost: Blue water bottle in meeting room 3', type: 'lost_found' },
]

export default function CommunityHomePage() {
  const today = new Date()

  return (
    <div className="min-h-screen">
      {/* Masthead */}
      <header className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <div className="border-y-4 border-double border-foreground py-4">
            <h1 className="newspaper-masthead text-4xl md:text-5xl font-bold tracking-wider uppercase">
              The Sanctuary Times
            </h1>
            <p className="text-muted-foreground mt-2 italic">&ldquo;Where Builders Belong&rdquo;</p>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {format(today, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Live Occupancy + Headlines Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Live Occupancy */}
              <div className="bg-card rounded-lg border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                  <h2 className="font-semibold">Live at Sanctuary</h2>
                </div>
                <div className="flex items-end gap-4 mb-4">
                  <span className="text-5xl font-bold">{liveOccupancy.current}</span>
                  <span className="text-muted-foreground mb-1">/ {liveOccupancy.capacity} residents</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 mb-4">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all"
                    style={{ width: `${liveOccupancy.percentage}%` }}
                  />
                </div>
                <Link href="/checkin" className="text-sm text-primary hover:underline flex items-center gap-1">
                  See who&apos;s here <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Headlines */}
              <div className="bg-card rounded-lg border p-6">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  Headlines
                </h2>
                <div className="space-y-3">
                  {headlines.map((headline) => (
                    <div key={headline.id} className="border-b border-border last:border-0 pb-3 last:pb-0">
                      <p className="font-medium text-sm newspaper-headline">{headline.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{headline.date}</p>
                    </div>
                  ))}
                </div>
                <Link href="/announcements" className="text-sm text-primary hover:underline flex items-center gap-1 mt-4">
                  Read all news <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Today's Events */}
            <div className="bg-card rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  Today at Sanctuary
                </h2>
                <Link href="/events" className="text-sm text-primary hover:underline">
                  Full calendar
                </Link>
              </div>
              <div className="space-y-3">
                {todaysEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-accent transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-medium text-muted-foreground w-20">
                        {event.time}
                      </div>
                      <div className="flex items-center gap-2">
                        {event.type === 'fitness' && <Dumbbell className="h-4 w-4 text-purple-500" />}
                        {event.type === 'workshop' && <BookOpen className="h-4 w-4 text-blue-500" />}
                        {event.type === 'office-hours' && <Coffee className="h-4 w-4 text-amber-500" />}
                        {event.type === 'social' && <Gift className="h-4 w-4 text-pink-500" />}
                        {event.type === 'sports' && <Gamepad2 className="h-4 w-4 text-green-500" />}
                        <span className="font-medium">{event.title}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {event.attendees && (
                        <span className="text-sm text-muted-foreground">
                          {event.attendees} going
                        </span>
                      )}
                      {event.spotsLeft !== null && event.spotsLeft > 0 && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                          {event.spotsLeft} spots left
                        </span>
                      )}
                      <button className="text-sm bg-primary text-primary-foreground px-3 py-1 rounded hover:bg-primary/90">
                        {event.type === 'office-hours' ? 'Book' : 'Join'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Board */}
            <div className="bg-card rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-indigo-500" />
                  Community Board
                </h2>
                <Link href="/board" className="text-sm bg-muted px-3 py-1 rounded hover:bg-accent">
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {communityPosts.map((post) => (
                  <div key={post.id} className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">&ldquo;{post.content}&rdquo;</p>
                    <p className="text-xs text-muted-foreground mt-2">-- @{post.author}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">

            {/* Quick Actions */}
            <div className="bg-card rounded-lg border p-6">
              <h2 className="font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/checkin" className="flex flex-col items-center gap-2 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <MapPin className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Check In</span>
                </Link>
                <Link href="/events" className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Events</span>
                </Link>
                <Link href="/mentors" className="flex flex-col items-center gap-2 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium">Mentors</span>
                </Link>
                <Link href="/discussions" className="flex flex-col items-center gap-2 p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
                  <MessageSquare className="h-5 w-5 text-amber-600" />
                  <span className="text-sm font-medium">Discuss</span>
                </Link>
              </div>
            </div>

            {/* Who's Here */}
            <div className="bg-card rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-500" />
                  Who&apos;s Here
                </h2>
                <span className="text-sm text-muted-foreground">
                  {whosHere.length}+ people
                </span>
              </div>
              <div className="space-y-3">
                {whosHere.slice(0, 5).map((person) => (
                  <div key={person.id} className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {person.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{person.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {person.company || person.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/checkin" className="text-sm text-primary hover:underline flex items-center gap-1 mt-4">
                See all <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Visiting Today */}
            <div className="bg-card rounded-lg border p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                Visiting Today
              </h2>
              <div className="space-y-3">
                {visitorsToday.map((visitor) => (
                  <div key={visitor.id} className="p-3 bg-orange-50 rounded-lg">
                    <p className="font-medium text-sm">{visitor.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {visitor.company || visitor.role}
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      {visitor.meeting ? `Meeting: ${visitor.meeting}` : visitor.purpose} &middot; {visitor.time}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Celebrations */}
            <div className="bg-card rounded-lg border p-6">
              <h2 className="font-semibold mb-4">Celebrations</h2>
              <div className="space-y-3">
                {celebrations.map((celebration) => (
                  <div key={celebration.id} className="p-3 bg-pink-50 rounded-lg flex items-center gap-3">
                    <span className="text-2xl">
                      {celebration.type === 'birthday' ? '\u{1F382}' : '\u{1F38A}'}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{celebration.message}</p>
                      <p className="text-xs text-muted-foreground">{celebration.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* This Week Preview */}
            <div className="bg-card rounded-lg border p-6">
              <h2 className="font-semibold mb-4">Upcoming This Week</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground w-12">Tue</span>
                  <span>Pitch Practice Session</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground w-12">Wed</span>
                  <span>Founder Dinner</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground w-12">Thu</span>
                  <span>Legal Workshop</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground w-12">Fri</span>
                  <span>Demo Day</span>
                </div>
              </div>
              <Link href="/events" className="text-sm text-primary hover:underline flex items-center gap-1 mt-4">
                View full calendar <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              The Sanctuary Times &middot; Community Hub
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/feedback" className="hover:text-foreground">Give Feedback</Link>
              <Link href="/help" className="hover:text-foreground">Help</Link>
              <Link href="/settings" className="hover:text-foreground">Settings</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
