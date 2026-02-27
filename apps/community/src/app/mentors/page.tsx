'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  Search,
  Filter,
  GraduationCap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockMentors } from '@/lib/mock-data'
import { MentorCard, expertiseLabels } from '@/components/MentorCard'
import type { MentorExpertise, MentorAvailability } from '@/types'

export default function MentorsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterExpertise, setFilterExpertise] = useState<MentorExpertise | 'all'>('all')
  const [filterAvailability, setFilterAvailability] = useState<MentorAvailability | 'all'>('all')

  const filteredMentors = mockMentors.filter((mentor) => {
    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        mentor.name.toLowerCase().includes(query) ||
        mentor.title.toLowerCase().includes(query) ||
        mentor.company.toLowerCase().includes(query) ||
        mentor.bio.toLowerCase().includes(query) ||
        mentor.tags.some((t) => t.toLowerCase().includes(query))
      if (!matchesSearch) return false
    }

    // Expertise filter
    if (filterExpertise !== 'all' && !mentor.expertise.includes(filterExpertise)) {
      return false
    }

    // Availability filter
    if (filterAvailability !== 'all' && mentor.availability !== filterAvailability) {
      return false
    }

    return true
  })

  const availableMentors = filteredMentors.filter((m) => m.availability === 'available')
  const otherMentors = filteredMentors.filter((m) => m.availability !== 'available')

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-muted-foreground hover:text-foreground lg:hidden">
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold newspaper-masthead tracking-wider">MENTORS</h1>
            </div>
            <span className="text-sm text-muted-foreground">
              {mockMentors.length} mentors
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Search & Filters */}
        <div className="bg-card border rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search mentors by name, expertise, company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filterExpertise}
                onChange={(e) => setFilterExpertise(e.target.value as MentorExpertise | 'all')}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-sm"
              >
                <option value="all">All Expertise</option>
                {Object.entries(expertiseLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <select
                value={filterAvailability}
                onChange={(e) => setFilterAvailability(e.target.value as MentorAvailability | 'all')}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-sm"
              >
                <option value="all">All Availability</option>
                <option value="available">Available</option>
                <option value="limited">Limited</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>
        </div>

        {/* Available Mentors */}
        {availableMentors.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Available Now ({availableMentors.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableMentors.map((mentor) => (
                <MentorCard key={mentor.id} mentor={mentor} />
              ))}
            </div>
          </section>
        )}

        {/* Other Mentors */}
        {otherMentors.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4">
              {availableMentors.length > 0 ? 'Other Mentors' : 'All Mentors'} ({otherMentors.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {otherMentors.map((mentor) => (
                <MentorCard key={mentor.id} mentor={mentor} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {filteredMentors.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No mentors found matching your search</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setFilterExpertise('all')
                setFilterAvailability('all')
              }}
              className="mt-2 text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Stats */}
        <section className="mt-8 bg-card border rounded-lg p-6">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-sanctuary-gold" />
            Mentor Network Stats
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-primary">{mockMentors.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Active Mentors</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-primary">
                {mockMentors.reduce((sum, m) => sum + m.sessionCount, 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Total Sessions</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-primary">
                {(mockMentors.reduce((sum, m) => sum + m.rating, 0) / mockMentors.length).toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Avg Rating</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-primary">
                {new Set(mockMentors.flatMap((m) => m.expertise)).size}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Expertise Areas</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
