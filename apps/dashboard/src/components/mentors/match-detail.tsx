'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Check, X, Send, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react'
import type { Match } from '@/types'
import { getMentorById, getExperienceById, getBottleneckById } from '@/lib/mock-data/mentors'
import { getStartupById } from '@/lib/mock-data'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  intro_sent: 'bg-blue-100 text-blue-700',
  completed: 'bg-gray-100 text-gray-700',
}

interface MatchDetailProps {
  match: Match
}

export function MatchDetail({ match }: MatchDetailProps) {
  const mentor = getMentorById(match.mentorId)
  const experience = getExperienceById(match.experienceId)
  const bottleneck = getBottleneckById(match.bottleneckId)
  const startup = bottleneck ? getStartupById(bottleneck.startupId) : null

  if (!mentor || !bottleneck) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Match details not found
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              {/* Mentor */}
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {mentor.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{mentor.name}</p>
                  <p className="text-sm text-muted-foreground">Mentor</p>
                </div>
              </div>

              <ArrowRight className="h-5 w-5 text-muted-foreground" />

              {/* Startup */}
              <div>
                <p className="font-semibold">{startup?.name || 'Unknown Startup'}</p>
                <p className="text-sm text-muted-foreground">{bottleneck.problemArchetype.replace(/_/g, ' ')}</p>
              </div>
            </div>

            <Badge className={statusColors[match.status]}>
              {match.status.replace(/_/g, ' ')}
            </Badge>
          </div>

          {/* Score */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
            <div className="text-center">
              <p className="text-3xl font-bold">{match.score}%</p>
              <p className="text-sm text-muted-foreground">Match Score</p>
            </div>
            <div className="flex-1">
              <Progress value={match.score} className="h-3" />
            </div>
            <Badge variant="outline">{match.confidence} confidence</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {match.status === 'pending' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button>
              <Check className="h-4 w-4 mr-2" />
              Approve Match
            </Button>
            <Button variant="outline">
              <X className="h-4 w-4 mr-2" />
              Reject Match
            </Button>
          </CardContent>
        </Card>
      )}

      {match.status === 'approved' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Send Introduction
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Match Reasoning */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Match Reasoning</CardTitle>
          <CardDescription>{match.explanation}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Score Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-lg font-bold">{match.reasoning.scores.problemShape}</p>
              <p className="text-xs text-muted-foreground">Problem Shape</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-lg font-bold">{match.reasoning.scores.constraintAlignment}</p>
              <p className="text-xs text-muted-foreground">Constraints</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-lg font-bold">{match.reasoning.scores.stageRelevance}</p>
              <p className="text-xs text-muted-foreground">Stage Fit</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-lg font-bold">{match.reasoning.scores.experienceDepth}</p>
              <p className="text-xs text-muted-foreground">Experience</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-lg font-bold">{match.reasoning.scores.recency}</p>
              <p className="text-xs text-muted-foreground">Recency</p>
            </div>
          </div>

          {/* Key Alignments */}
          {match.reasoning.keyAlignments.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Key Alignments
              </h4>
              <ul className="space-y-1">
                {match.reasoning.keyAlignments.map((alignment, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-green-500">+</span>
                    {alignment}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Concerns */}
          {match.reasoning.concerns.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                Potential Concerns
              </h4>
              <ul className="space-y-1">
                {match.reasoning.concerns.map((concern, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-yellow-500">!</span>
                    {concern}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottleneck Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Startup Problem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Badge variant="secondary">{bottleneck.problemArchetype.replace(/_/g, ' ')}</Badge>
          </div>
          <p className="font-medium">{bottleneck.rawBlocker}</p>
          <div className="text-sm text-muted-foreground">
            <p><strong>What&apos;s been tried:</strong> {bottleneck.rawAttempts}</p>
            <p className="mt-2"><strong>Success criteria:</strong> {bottleneck.rawSuccessCriteria}</p>
          </div>
        </CardContent>
      </Card>

      {/* Mentor Experience */}
      {experience && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Relevant Mentor Experience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{experience.problemArchetype.replace(/_/g, ' ')}</Badge>
              <span className="text-sm text-muted-foreground">{experience.yearOccurred}</span>
            </div>
            <p className="font-medium">{experience.problemStatement}</p>
            <p className="text-sm text-muted-foreground">{experience.context}</p>
            <div className="pt-3 border-t">
              <p className="text-sm"><strong>Solution:</strong> {experience.solution}</p>
              <p className="text-sm mt-2"><strong>Outcomes:</strong> {experience.outcomes}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Operator Notes */}
      {match.operatorNotes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Operator Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{match.operatorNotes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
