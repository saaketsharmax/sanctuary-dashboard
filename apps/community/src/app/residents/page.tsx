'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  Search,
  MapPin,
  Briefcase,
  Coffee,
  Code,
  Sparkles,
  MessageCircle,
  Linkedin,
  Globe,
  Filter,
  Sun,
  Moon,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockResidents } from '@/lib/mock-data'
import type { KYRProfile } from '@/types'

const workStyleIcons = {
  'early-bird': { icon: Sun, label: 'Early Bird' },
  'night-owl': { icon: Moon, label: 'Night Owl' },
  'flexible': { icon: Clock, label: 'Flexible' },
}

function ResidentCard({ resident }: { resident: KYRProfile }) {
  const [expanded, setExpanded] = useState(false)
  const WorkStyleIcon = workStyleIcons[resident.workStyle].icon

  return (
    <div className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-sanctuary-gold to-sanctuary-navy flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {resident.preferredName.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg truncate">{resident.preferredName}</h3>
              <span className="text-xs text-gray-500">({resident.pronouns})</span>
            </div>
            <p className="text-sm text-gray-600">{resident.role}</p>
            {resident.company && (
              <p className="text-sm text-sanctuary-navy font-medium">{resident.company}</p>
            )}
          </div>
        </div>

        {/* Bio */}
        {resident.bio && (
          <p className="text-sm text-gray-600 mt-3 line-clamp-2">{resident.bio}</p>
        )}

        {/* Working On */}
        <div className="mt-3 p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Building:</p>
          <p className="text-sm font-medium">{resident.workingOn}</p>
        </div>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1">
          {resident.expertise.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full"
            >
              {skill}
            </span>
          ))}
          {resident.expertise.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{resident.expertise.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Expandable Section */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-2 text-sm text-gray-500 border-t hover:bg-gray-50 transition-colors"
      >
        {expanded ? 'Show less' : 'Show more'}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t bg-gray-50">
          {/* Seeking */}
          <div className="pt-4">
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Looking for:
            </p>
            <div className="flex flex-wrap gap-1">
              {resident.seeking.map((item) => (
                <span
                  key={item}
                  className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Work Style */}
          <div className="mt-3 flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-gray-600">
              <WorkStyleIcon className="h-4 w-4" />
              {workStyleIcons[resident.workStyle].label}
            </span>
            {resident.hometown && (
              <span className="flex items-center gap-1 text-gray-600">
                <MapPin className="h-4 w-4" />
                {resident.hometown}
              </span>
            )}
          </div>

          {/* Personal */}
          {(resident.coffeeOrder || resident.superpower) && (
            <div className="mt-3 space-y-1 text-sm">
              {resident.coffeeOrder && (
                <p className="flex items-center gap-2 text-gray-600">
                  <Coffee className="h-4 w-4 text-amber-600" />
                  {resident.coffeeOrder}
                </p>
              )}
              {resident.superpower && (
                <p className="flex items-center gap-2 text-gray-600">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  {resident.superpower}
                </p>
              )}
            </div>
          )}

          {/* Hobbies */}
          {resident.hobbies.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-1">Hobbies:</p>
              <p className="text-sm text-gray-600">{resident.hobbies.join(' · ')}</p>
            </div>
          )}

          {/* Contact */}
          <div className="mt-4 flex items-center gap-2">
            {resident.slackHandle && (
              <button className="flex items-center gap-1 px-3 py-1.5 bg-sanctuary-navy text-white text-sm rounded-lg hover:bg-opacity-90 transition-colors">
                <MessageCircle className="h-4 w-4" />
                Message
              </button>
            )}
            {resident.linkedIn && (
              <a
                href={`https://${resident.linkedIn}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            )}
            {resident.personalSite && (
              <a
                href={`https://${resident.personalSite}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-gray-500 hover:text-sanctuary-navy transition-colors"
              >
                <Globe className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ResidentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSkill, setFilterSkill] = useState<string | null>(null)

  // Get all unique skills
  const allSkills = Array.from(
    new Set(mockResidents.flatMap((r) => r.expertise))
  ).sort()

  const filteredResidents = mockResidents.filter((resident) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        resident.preferredName.toLowerCase().includes(query) ||
        resident.fullName.toLowerCase().includes(query) ||
        resident.company?.toLowerCase().includes(query) ||
        resident.workingOn.toLowerCase().includes(query) ||
        resident.expertise.some((s) => s.toLowerCase().includes(query)) ||
        resident.seeking.some((s) => s.toLowerCase().includes(query))

      if (!matchesSearch) return false
    }

    // Skill filter
    if (filterSkill && !resident.expertise.includes(filterSkill)) {
      return false
    }

    return true
  })

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
              <h1 className="text-2xl font-bold newspaper-masthead tracking-wider">RESIDENTS</h1>
            </div>
            <span className="text-sm text-gray-500">
              {mockResidents.length} members
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Search & Filter */}
        <div className="bg-white border rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, company, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sanctuary-navy/20"
              />
            </div>

            {/* Skill Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filterSkill || ''}
                onChange={(e) => setFilterSkill(e.target.value || null)}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sanctuary-navy/20"
              >
                <option value="">All Skills</option>
                {allSkills.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Residents Grid */}
        {filteredResidents.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredResidents.map((resident) => (
              <ResidentCard key={resident.id} resident={resident} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No residents found matching your search</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setFilterSkill(null)
              }}
              className="mt-2 text-sanctuary-navy hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Looking For Section */}
        <section className="mt-8 p-6 bg-white border rounded-lg">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-sanctuary-gold" />
            Community Needs
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            What our residents are looking for:
          </p>
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(mockResidents.flatMap((r) => r.seeking)))
              .slice(0, 12)
              .map((need) => (
                <span
                  key={need}
                  className="px-3 py-1.5 bg-green-50 text-green-700 text-sm rounded-full"
                >
                  {need}
                </span>
              ))}
          </div>
        </section>
      </main>
    </div>
  )
}
