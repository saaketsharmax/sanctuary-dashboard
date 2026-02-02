'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Mail, Linkedin, Briefcase, DollarSign, Users, Calendar } from 'lucide-react'
import type { Mentor } from '@/types'
import { getExperiencesByMentorId } from '@/lib/mock-data/mentors'

interface MentorProfileProps {
  mentor: Mentor
}

export function MentorProfile({ mentor }: MentorProfileProps) {
  const experiences = getExperiencesByMentorId(mentor.id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={mentor.photoUrl || undefined} />
              <AvatarFallback className="text-2xl">
                {mentor.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{mentor.name}</h1>
                  <p className="text-muted-foreground">{mentor.title}</p>
                  <p className="text-muted-foreground">{mentor.company}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                  {mentor.linkedinUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={mentor.linkedinUrl} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="h-4 w-4 mr-2" />
                        LinkedIn
                      </a>
                    </Button>
                  )}
                </div>
              </div>
              <p className="mt-4 text-sm">{mentor.bio}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {mentor.expertise.map((exp) => (
                  <Badge key={exp} variant="secondary">
                    {exp.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Active Matches</span>
            </div>
            <p className="text-2xl font-bold mt-1">{mentor.matchCount || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Investments</span>
            </div>
            <p className="text-2xl font-bold mt-1">{mentor.investedStartupIds?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Check Size</span>
            </div>
            <p className="text-lg font-bold mt-1">{mentor.checkSize || 'N/A'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Max Matches</span>
            </div>
            <p className="text-2xl font-bold mt-1">{mentor.maxActiveMatches}</p>
          </CardContent>
        </Card>
      </div>

      {/* Preferred Stages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preferred Stages</CardTitle>
          <CardDescription>Startup stages this mentor prefers to work with</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {mentor.preferredStages.map((stage) => (
              <Badge key={stage} variant="outline">
                {stage.replace(/_/g, ' ')}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Experience & Case Studies</CardTitle>
          <CardDescription>Past problems this mentor has helped solve</CardDescription>
        </CardHeader>
        <CardContent>
          {experiences.length > 0 ? (
            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id} className="p-4 rounded-lg border">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary">{exp.problemArchetype.replace(/_/g, ' ')}</Badge>
                    <span className="text-xs text-muted-foreground">{exp.yearOccurred}</span>
                  </div>
                  <h4 className="font-medium">{exp.problemStatement}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{exp.context}</p>
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm"><strong>Solution:</strong> {exp.solution}</p>
                    <p className="text-sm mt-1"><strong>Outcomes:</strong> {exp.outcomes}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No experience records available</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
