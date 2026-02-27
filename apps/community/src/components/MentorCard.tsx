'use client'

import Link from 'next/link'
import {
  Star,
  Calendar,
  Users,
  MessageCircle,
  Clock,
  Linkedin,
  Globe,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Mentor, MentorAvailability, MentorExpertise } from '@/types'

const availabilityConfig: Record<
  MentorAvailability,
  { label: string; color: string; dotColor: string }
> = {
  available: { label: 'Available', color: 'text-green-700 bg-green-100', dotColor: 'bg-green-500' },
  limited: { label: 'Limited', color: 'text-amber-700 bg-amber-100', dotColor: 'bg-amber-500' },
  unavailable: { label: 'Unavailable', color: 'text-red-700 bg-red-100', dotColor: 'bg-red-500' },
}

const expertiseLabels: Record<MentorExpertise, string> = {
  fundraising: 'Fundraising',
  product: 'Product',
  engineering: 'Engineering',
  design: 'Design',
  marketing: 'Marketing',
  sales: 'Sales',
  operations: 'Operations',
  legal: 'Legal',
  finance: 'Finance',
  hr: 'HR & Talent',
}

export { expertiseLabels }

interface MentorCardProps {
  mentor: Mentor
  compact?: boolean
}

export function MentorCard({ mentor, compact = false }: MentorCardProps) {
  const avail = availabilityConfig[mentor.availability]

  if (compact) {
    return (
      <Link
        href={`/mentors/${mentor.id}`}
        className="flex items-center gap-3 p-3 bg-card border rounded-lg hover:shadow-sm transition-shadow"
      >
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sanctuary-gold to-sanctuary-navy flex items-center justify-center text-white font-bold flex-shrink-0">
          {mentor.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{mentor.name}</p>
          <p className="text-xs text-muted-foreground truncate">{mentor.title}, {mentor.company}</p>
        </div>
        <span className={cn('h-2 w-2 rounded-full flex-shrink-0', avail.dotColor)} />
      </Link>
    )
  }

  return (
    <div className="bg-card border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-sanctuary-gold to-sanctuary-navy flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
            {mentor.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <Link href={`/mentors/${mentor.id}`}>
              <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                {mentor.name}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground">{mentor.title}</p>
            <p className="text-sm font-medium text-sanctuary-navy">{mentor.company}</p>
          </div>
        </div>

        {/* Availability */}
        <div className="flex items-center gap-2 mb-3">
          <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1.5', avail.color)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', avail.dotColor)} />
            {avail.label}
          </span>
          {mentor.officeHours && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {mentor.officeHours}
            </span>
          )}
        </div>

        {/* Bio */}
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{mentor.bio}</p>

        {/* Expertise */}
        <div className="flex flex-wrap gap-1 mb-4">
          {mentor.expertise.map((exp) => (
            <span
              key={exp}
              className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full"
            >
              {expertiseLabels[exp]}
            </span>
          ))}
          {mentor.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-amber-500" />
            {mentor.rating}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {mentor.sessionCount} sessions
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {mentor.menteeCount} mentees
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            href={`/mentors/${mentor.id}`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            Book Session
          </Link>
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
  )
}
