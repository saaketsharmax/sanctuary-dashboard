'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Linkedin, Briefcase, Award, Clock } from 'lucide-react'
import type { ApplicationFounder } from '@/types'

interface FoundersPreviewProps {
  founders: ApplicationFounder[]
}

function FounderCard({ founder }: { founder: ApplicationFounder }) {
  const initials = founder.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold">{founder.name}</h4>
              {founder.isLead && (
                <Badge variant="secondary" className="text-xs">
                  Lead
                </Badge>
              )}
            </div>

            {founder.role && (
              <p className="text-sm text-muted-foreground">{founder.role}</p>
            )}

            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
              {founder.yearsExperience !== null && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{founder.yearsExperience} years exp</span>
                </div>
              )}
              {founder.hasStartedBefore && (
                <div className="flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  <span>Previous founder</span>
                </div>
              )}
            </div>

            {founder.previousStartupOutcome && (
              <div className="flex items-start gap-1 text-xs">
                <Briefcase className="h-3 w-3 mt-0.5 text-muted-foreground" />
                <span className="text-muted-foreground">{founder.previousStartupOutcome}</span>
              </div>
            )}

            {founder.linkedin && (
              <a
                href={founder.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Linkedin className="h-3 w-3" />
                LinkedIn
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function FoundersPreview({ founders }: FoundersPreviewProps) {
  if (founders.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No founders listed
        </CardContent>
      </Card>
    )
  }

  // Sort founders so lead founder appears first
  const sortedFounders = [...founders].sort((a, b) => {
    if (a.isLead && !b.isLead) return -1
    if (!a.isLead && b.isLead) return 1
    return 0
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Founders ({founders.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedFounders.map((founder) => (
          <FounderCard key={founder.id} founder={founder} />
        ))}
      </CardContent>
    </Card>
  )
}
