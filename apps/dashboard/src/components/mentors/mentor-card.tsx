'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { Linkedin, Mail } from 'lucide-react'
import { ExpertiseBadge } from './expertise-badge'
import type { Mentor } from '@/types'

interface MentorCardProps {
  mentor: Mentor
}

export function MentorCard({ mentor }: MentorCardProps) {
  const initials = mentor.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <Link href={`/mentors/${mentor.id}`}>
      <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={mentor.photoUrl || undefined} />
              <AvatarFallback className="text-lg bg-primary/10">{initials}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate">{mentor.name}</h3>
                {!mentor.isActive && (
                  <span className="text-xs text-muted-foreground">(Inactive)</span>
                )}
              </div>

              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {mentor.bio}
              </p>

              {/* Quick Links */}
              <div className="flex items-center gap-2 mt-3">
                {mentor.email && (
                  <a
                    href={`mailto:${mentor.email}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                )}
                {mentor.linkedinUrl && (
                  <a
                    href={mentor.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Expertise Tags */}
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2">Expertise</p>
            <div className="flex flex-wrap gap-1.5">
              {mentor.expertise.slice(0, 4).map((exp) => (
                <ExpertiseBadge key={exp} archetype={exp} size="sm" />
              ))}
              {mentor.expertise.length > 4 && (
                <span className="text-xs text-muted-foreground">
                  +{mentor.expertise.length - 4} more
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
