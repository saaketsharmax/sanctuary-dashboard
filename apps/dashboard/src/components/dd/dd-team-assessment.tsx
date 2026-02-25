'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Progress,
} from '@sanctuary/ui'
import {
  User,
  Users,
  Github,
  Linkedin,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ExternalLink,
} from 'lucide-react'
import type { DDTeamAssessment, DDFounderProfile, DDInterviewSignal } from '@/lib/ai/types/due-diligence'

interface DDTeamAssessmentProps {
  assessment: DDTeamAssessment
}

const gradeColors: Record<string, string> = {
  A: 'bg-green-500 text-white',
  B: 'bg-blue-500 text-white',
  C: 'bg-yellow-500 text-white',
  D: 'bg-orange-500 text-white',
  F: 'bg-red-500 text-white',
}

const scoreColor = (score: number) => {
  if (score >= 75) return 'text-green-600'
  if (score >= 50) return 'text-yellow-600'
  return 'text-red-600'
}

const sentimentConfig = {
  positive: { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  neutral: { color: 'bg-gray-100 text-gray-800', icon: MessageSquare },
  concerning: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
}

function FounderCard({ profile }: { profile: DDFounderProfile }) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start gap-4">
          {/* Avatar / Score */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
              <User className="h-7 w-7 text-muted-foreground" />
            </div>
            <span className={`text-lg font-bold ${scoreColor(profile.founderScore)}`}>
              {profile.founderScore}
            </span>
            <span className="text-[10px] text-muted-foreground">/ 100</span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold truncate">{profile.name}</h4>
              {profile.linkedinFound && (
                <Linkedin className="h-4 w-4 text-blue-600 shrink-0" />
              )}
              {profile.githubFound && (
                <Github className="h-4 w-4 text-gray-700 shrink-0" />
              )}
            </div>
            {profile.role && (
              <p className="text-sm text-muted-foreground">{profile.role}</p>
            )}

            {/* Experience verification */}
            <div className="mt-2 flex items-center gap-1 text-sm">
              {profile.experienceVerified ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-orange-500 shrink-0" />
              )}
              <span className="text-muted-foreground">
                {profile.experienceVerified ? 'Experience verified' : 'Experience unverified'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {profile.experienceEvidence}
            </p>

            {/* GitHub score */}
            {profile.githubScore != null && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">GitHub Score</span>
                  <span className={scoreColor(profile.githubScore)}>{profile.githubScore}/100</span>
                </div>
                <Progress value={profile.githubScore} className="h-1 mt-1" />
              </div>
            )}

            {/* Previous startups */}
            {profile.previousStartups.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-muted-foreground mb-1">Previous Startups</p>
                <div className="flex flex-wrap gap-1">
                  {profile.previousStartups.map((ps, i) => (
                    <Badge key={i} variant="outline" className="text-[10px]">
                      {ps.name}: {ps.outcome}
                      {ps.verified && <CheckCircle2 className="h-3 w-3 ml-1 text-green-500" />}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths */}
            {profile.strengths.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {profile.strengths.map((s, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px] bg-green-50 text-green-700">
                    {s}
                  </Badge>
                ))}
              </div>
            )}

            {/* Red flags */}
            {profile.redFlags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {profile.redFlags.map((rf, i) => (
                  <Badge key={i} variant="destructive" className="text-[10px]">
                    {rf}
                  </Badge>
                ))}
              </div>
            )}

            {/* Evidence URLs */}
            {profile.evidenceUrls.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {profile.evidenceUrls.slice(0, 3).map((url, i) => {
                  let label: string
                  try {
                    label = new URL(url).hostname.replace('www.', '')
                  } catch {
                    label = 'Source'
                  }
                  return (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {label}
                    </a>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function InterviewSignalRow({ signal }: { signal: DDInterviewSignal }) {
  const config = sentimentConfig[signal.sentiment]
  const Icon = config.icon

  return (
    <div className="flex items-start gap-3 py-2">
      <Badge className={`shrink-0 ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {signal.sentiment}
      </Badge>
      <div className="min-w-0">
        <p className="text-sm">{signal.signal}</p>
        <p className="text-xs text-muted-foreground">Source: {signal.source.replace(/_/g, ' ')}</p>
      </div>
    </div>
  )
}

export function DDTeamAssessment({ assessment }: DDTeamAssessmentProps) {
  return (
    <div className="space-y-6">
      {/* Team Score Header */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center gap-8">
            {/* Grade Badge */}
            <div className="flex flex-col items-center">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold ${
                  gradeColors[assessment.teamGrade] || gradeColors['F']
                }`}
              >
                {assessment.teamGrade}
              </div>
              <p className="text-sm text-muted-foreground mt-2">Team Grade</p>
            </div>

            {/* Scores */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{assessment.overallTeamScore}</p>
                  <p className="text-sm text-muted-foreground">Overall Team Score</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold">{assessment.teamCompletenessScore}</p>
                  <p className="text-sm text-muted-foreground">Completeness</p>
                </div>
              </div>
              <Progress value={assessment.overallTeamScore} className="h-2" />
            </div>

            {/* Key Metrics */}
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-semibold">{assessment.founderProfiles.length}</p>
                <p className="text-xs text-muted-foreground">Founders</p>
              </div>
              {assessment.teamRedFlags.length > 0 && (
                <div className="text-center">
                  <Badge variant="destructive" className="text-lg px-3 py-1">
                    {assessment.teamRedFlags.length}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">Red Flags</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Strengths & Missing Roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assessment.teamStrengths.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Team Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {assessment.teamStrengths.map((s, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-green-500 shrink-0 mt-1">+</span>
                    {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {assessment.missingRoles.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-500" />
                Missing Roles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {assessment.missingRoles.map((r, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-orange-500 shrink-0 mt-1">-</span>
                    {r}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Founder Profiles */}
      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <User className="h-4 w-4" />
          Founder Profiles
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {assessment.founderProfiles.map((fp, i) => (
            <FounderCard key={i} profile={fp} />
          ))}
        </div>
      </div>

      {/* Team Red Flags */}
      {assessment.teamRedFlags.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Team Red Flags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assessment.teamRedFlags.map((rf, i) => (
                <div key={i} className="border-l-2 border-red-400 pl-3 py-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={rf.severity === 'critical' ? 'destructive' : 'outline'}
                      className="text-[10px]"
                    >
                      {rf.severity}
                    </Badge>
                    <p className="text-sm font-medium">{rf.claimText}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{rf.reason}</p>
                  <p className="text-xs text-muted-foreground">{rf.evidence}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interview Signals */}
      {assessment.interviewSignals.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Interview Signals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {assessment.interviewSignals.map((sig, i) => (
                <InterviewSignalRow key={i} signal={sig} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
