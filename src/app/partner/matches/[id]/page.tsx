'use client'

import { use, useState } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Building2, User, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { PartnerHeader } from '@/components/partner/layout/partner-header'
import { ExpertiseBadge } from '@/components/mentors'
import { ScoreBreakdown, MatchActions } from '@/components/matching'
import { getMatchWithDetails } from '@/lib/mock-data'
import { getConfidenceInfo } from '@/types'

interface MatchDetailPageProps {
  params: Promise<{ id: string }>
}

function getScoreColor(score: number) {
  if (score >= 80) return 'text-green-600 bg-green-100 border-green-200'
  if (score >= 60) return 'text-blue-600 bg-blue-100 border-blue-200'
  if (score >= 40) return 'text-yellow-600 bg-yellow-100 border-yellow-200'
  return 'text-red-600 bg-red-100 border-red-200'
}

export default function PartnerMatchDetailPage({ params }: MatchDetailPageProps) {
  const { id } = use(params)
  const match = getMatchWithDetails(id)
  const [status, setStatus] = useState(match?.status || 'pending')

  if (!match) {
    notFound()
  }

  const confidenceInfo = getConfidenceInfo(match.confidence)
  const mentorInitials = match.mentor.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  const handleApprove = () => {
    setStatus('approved')
    toast.success('Match approved', {
      description: 'The match has been approved. You can now send an introduction.',
    })
  }

  const handleReject = () => {
    setStatus('rejected')
    toast.info('Match rejected', {
      description: 'The match has been rejected.',
    })
  }

  const handleSendIntro = () => {
    setStatus('intro_sent')
    toast.success('Introduction sent', {
      description: 'An introduction email has been sent to both parties.',
    })
  }

  const handleRecordFeedback = () => {
    setStatus('completed')
    toast.success('Feedback recorded', {
      description: 'Thank you for recording the feedback.',
    })
  }

  return (
    <div className="flex flex-col h-full">
      <PartnerHeader title="Match Details" description={`${match.mentor.name} → ${match.startup.name}`} />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Back button */}
        <Link href="/partner/mentors">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Mentor Matching
          </Button>
        </Link>

        {/* Header with Score */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Score Circle */}
          <div
            className={cn(
              'flex-shrink-0 w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center',
              getScoreColor(match.score)
            )}
          >
            <span className="text-3xl font-bold">{match.score}</span>
            <span className="text-xs">Score</span>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold">Match Analysis</h1>
              <Badge
                variant="secondary"
                className={cn(
                  confidenceInfo.color === 'green' && 'bg-green-100 text-green-700',
                  confidenceInfo.color === 'yellow' && 'bg-yellow-100 text-yellow-700',
                  confidenceInfo.color === 'red' && 'bg-red-100 text-red-700'
                )}
              >
                {confidenceInfo.label} Confidence
              </Badge>
            </div>

            <p className="text-muted-foreground mb-4">{match.explanation}</p>

            <MatchActions
              status={status}
              onApprove={handleApprove}
              onReject={handleReject}
              onSendIntro={handleSendIntro}
              onRecordFeedback={handleRecordFeedback}
            />
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Founder's Bottleneck */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                <CardTitle className="text-base">Founder&apos;s Challenge</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Link href={`/partner/portfolio/${match.startup.id}`} className="font-medium hover:underline">
                  {match.startup.name}
                </Link>
                <ExpertiseBadge archetype={match.bottleneck.problemArchetype} />
              </div>

              <div>
                <p className="text-sm font-medium mb-1">What&apos;s blocking them?</p>
                <p className="text-sm text-muted-foreground">{match.bottleneck.rawBlocker}</p>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">What have they tried?</p>
                <p className="text-sm text-muted-foreground">{match.bottleneck.rawAttempts}</p>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">What does success look like?</p>
                <p className="text-sm text-muted-foreground">{match.bottleneck.rawSuccessCriteria}</p>
              </div>
            </CardContent>
          </Card>

          {/* Right: Mentor's Experience */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <CardTitle className="text-base">Mentor&apos;s Experience</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={match.mentor.photoUrl || undefined} />
                  <AvatarFallback>{mentorInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <Link href={`/partner/mentors/${match.mentor.id}`} className="font-medium hover:underline">
                    {match.mentor.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{match.experience.yearOccurred}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Problem Solved</p>
                <p className="text-sm text-muted-foreground">{match.experience.problemStatement}</p>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Context</p>
                <p className="text-sm text-muted-foreground">{match.experience.context}</p>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Solution</p>
                <p className="text-sm text-muted-foreground">{match.experience.solution}</p>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Outcomes</p>
                <p className="text-sm text-muted-foreground">{match.experience.outcomes}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Score Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Match Reasoning</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ScoreBreakdown reasoning={match.reasoning} />

            <Separator />

            {/* Key Alignments */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <p className="text-sm font-medium">Key Alignments</p>
              </div>
              <ul className="space-y-1">
                {match.reasoning.keyAlignments.map((alignment, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-green-600">+</span>
                    {alignment}
                  </li>
                ))}
              </ul>
            </div>

            {/* Concerns */}
            {match.reasoning.concerns.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <p className="text-sm font-medium">Potential Concerns</p>
                </div>
                <ul className="space-y-1">
                  {match.reasoning.concerns.map((concern, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-yellow-600">!</span>
                      {concern}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
