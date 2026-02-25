'use client'

import {
  Card,
  CardContent,
  Badge,
  Avatar,
  AvatarFallback,
  AvatarImage,
  cn,
} from '@sanctuary/ui'
import Link from 'next/link'
import { User, Building2, ArrowRight } from 'lucide-react'
import { ExpertiseBadge } from '@/components/mentors'
import type { MatchWithDetails, ConfidenceLevel } from '@/types'

interface MatchCardProps {
  match: MatchWithDetails
}

function getScoreColor(score: number) {
  if (score >= 80) return 'text-success bg-success/15 border-success/30'
  if (score >= 60) return 'text-info bg-info/15 border-info/30'
  if (score >= 40) return 'text-warning bg-warning/15 border-warning/30'
  return 'text-destructive bg-destructive/15 border-destructive/30'
}

function getConfidenceBadge(confidence: ConfidenceLevel) {
  const config = {
    high: { label: 'High', variant: 'default' as const, className: 'bg-success' },
    medium: { label: 'Medium', variant: 'secondary' as const, className: 'bg-warning text-white' },
    low: { label: 'Low', variant: 'outline' as const, className: '' },
  }
  return config[confidence]
}

function getStatusBadge(status: string) {
  const config: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-muted text-foreground' },
    approved: { label: 'Approved', className: 'bg-info/15 text-info' },
    rejected: { label: 'Rejected', className: 'bg-destructive/15 text-destructive' },
    intro_sent: { label: 'Intro Sent', className: 'bg-purple-100 text-purple-700' },
    completed: { label: 'Completed', className: 'bg-success/15 text-success' },
  }
  return config[status] || config.pending
}

export function MatchCard({ match }: MatchCardProps) {
  const mentorInitials = match.mentor.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  const confidenceConfig = getConfidenceBadge(match.confidence)
  const statusConfig = getStatusBadge(match.status)

  return (
    <Link href={`/match/${match.id}`}>
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            {/* Score Circle */}
            <div
              className={cn(
                'flex-shrink-0 w-14 h-14 rounded-full border-2 flex items-center justify-center',
                getScoreColor(match.score)
              )}
            >
              <span className="text-lg font-bold">{match.score}</span>
            </div>

            <div className="flex-1 min-w-0">
              {/* Mentor Info */}
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={match.mentor.photoUrl || undefined} />
                  <AvatarFallback className="text-xs">{mentorInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{match.mentor.name}</p>
                  <p className="text-xs text-muted-foreground">Mentor</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Badge variant={confidenceConfig.variant} className={confidenceConfig.className}>
                    {confidenceConfig.label}
                  </Badge>
                  <Badge variant="secondary" className={statusConfig.className}>
                    {statusConfig.label}
                  </Badge>
                </div>
              </div>

              {/* Match Arrow */}
              <div className="flex items-center gap-2 mb-3 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{match.startup.name}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <ExpertiseBadge archetype={match.experience.problemArchetype} size="sm" />
              </div>

              {/* Explanation */}
              <p className="text-sm text-muted-foreground line-clamp-2">
                {match.explanation}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
