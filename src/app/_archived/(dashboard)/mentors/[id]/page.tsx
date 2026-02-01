'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Linkedin, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ExpertiseBadge, ExperienceCard } from '@/components/mentors'
import { getMentorWithExperiences, getMatchesByMentorId } from '@/lib/mock-data'

interface MentorDetailPageProps {
  params: Promise<{ id: string }>
}

export default function MentorDetailPage({ params }: MentorDetailPageProps) {
  const { id } = use(params)
  const mentor = getMentorWithExperiences(id)
  const matches = getMatchesByMentorId(id)

  if (!mentor) {
    notFound()
  }

  const initials = mentor.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  const completedMatches = matches.filter((m) => m.status === 'completed').length
  const activeMatches = matches.filter((m) => ['approved', 'intro_sent'].includes(m.status)).length

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link href="/mentors">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Mentors
        </Button>
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={mentor.photoUrl || undefined} />
          <AvatarFallback className="text-2xl bg-primary/10">{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold">{mentor.name}</h1>
            {!mentor.isActive && (
              <Badge variant="secondary">Inactive</Badge>
            )}
          </div>

          <p className="text-muted-foreground mb-4">{mentor.bio}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {mentor.email && (
              <a href={`mailto:${mentor.email}`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <Mail className="h-4 w-4" />
                  {mentor.email}
                </Button>
              </a>
            )}
            {mentor.linkedinUrl && (
              <a href={mentor.linkedinUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-2">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </Button>
              </a>
            )}
          </div>

          {/* Expertise */}
          <div>
            <p className="text-sm font-medium mb-2">Areas of Expertise</p>
            <div className="flex flex-wrap gap-2">
              {mentor.expertise.map((exp) => (
                <ExpertiseBadge key={exp} archetype={exp} />
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-row md:flex-col gap-4">
          <Card className="flex-1">
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold">{mentor.experiences.length}</p>
              <p className="text-xs text-muted-foreground">Experiences</p>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold">{completedMatches}</p>
              <p className="text-xs text-muted-foreground">Completed Matches</p>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold">{activeMatches}</p>
              <p className="text-xs text-muted-foreground">Active Matches</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Experiences */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Experiences ({mentor.experiences.length})
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {mentor.experiences.map((experience) => (
            <ExperienceCard key={experience.id} experience={experience} />
          ))}
        </div>

        {mentor.experiences.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No experiences added yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
