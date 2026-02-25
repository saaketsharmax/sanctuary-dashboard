'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  TrendingUp,
  Target,
  Users,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Globe,
  Swords,
  ArrowUpRight,
} from 'lucide-react'
import type { DDMarketAssessment, DDCompetitor } from '@/lib/ai/types/due-diligence'

interface DDMarketAssessmentProps {
  assessment: DDMarketAssessment
}

const gradeColors: Record<string, string> = {
  A: 'bg-green-500 text-white',
  B: 'bg-blue-500 text-white',
  C: 'bg-yellow-500 text-white',
  D: 'bg-orange-500 text-white',
  F: 'bg-red-500 text-white',
}

const threatColors: Record<string, string> = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800',
}

const timingColor = (score: number) => {
  if (score >= 70) return 'text-green-600'
  if (score >= 40) return 'text-yellow-600'
  return 'text-red-600'
}

const timingLabel = (score: number) => {
  if (score >= 80) return 'Strong Tailwinds'
  if (score >= 60) return 'Good Timing'
  if (score >= 40) return 'Neutral'
  if (score >= 20) return 'Questionable'
  return 'Poor Timing'
}

function CompetitorRow({ competitor }: { competitor: DDCompetitor }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm truncate">{competitor.name}</h4>
            <Badge className={`text-[10px] shrink-0 ${threatColors[competitor.threatLevel]}`}>
              {competitor.threatLevel} threat
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{competitor.description}</p>
        </div>
        {competitor.funding && (
          <Badge variant="outline" className="text-[10px] shrink-0">
            {competitor.funding}
          </Badge>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Positioning</p>
          <p className="text-xs mt-0.5">{competitor.positioning}</p>
        </div>
        <div>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Our Differentiator</p>
          <p className="text-xs mt-0.5">{competitor.differentiator}</p>
        </div>
      </div>

      {competitor.sourceUrl && (
        <a
          href={competitor.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline mt-2"
        >
          <ExternalLink className="h-3 w-3" />
          Source
        </a>
      )}
    </div>
  )
}

export function DDMarketAssessment({ assessment }: DDMarketAssessmentProps) {
  const tam = assessment.tamValidation

  return (
    <div className="space-y-6">
      {/* Market Score Header */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center gap-8">
            {/* Grade Badge */}
            <div className="flex flex-col items-center">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold ${
                  gradeColors[assessment.marketGrade] || gradeColors['F']
                }`}
              >
                {assessment.marketGrade}
              </div>
              <p className="text-sm text-muted-foreground mt-2">Market Grade</p>
            </div>

            {/* Scores */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{assessment.overallMarketScore}</p>
                  <p className="text-sm text-muted-foreground">Overall Market Score</p>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-semibold ${timingColor(assessment.marketTimingScore)}`}>
                    {assessment.marketTimingScore}
                  </p>
                  <p className="text-sm text-muted-foreground">{timingLabel(assessment.marketTimingScore)}</p>
                </div>
              </div>
              <Progress value={assessment.overallMarketScore} className="h-2" />
            </div>

            {/* Key Metrics */}
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-semibold">{assessment.competitorMap.length}</p>
                <p className="text-xs text-muted-foreground">Competitors</p>
              </div>
              {assessment.marketRedFlags.length > 0 && (
                <div className="text-center">
                  <Badge variant="destructive" className="text-lg px-3 py-1">
                    {assessment.marketRedFlags.length}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">Red Flags</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TAM Validation + Market Timing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* TAM Validation */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4" />
              TAM Validation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tam.claimed && (
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Claimed TAM</p>
                <p className="text-sm font-semibold">{tam.claimed}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Research Estimate</p>
              <p className="text-sm font-semibold">{tam.estimated}</p>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Confidence</span>
                <span className="font-medium">{Math.round(tam.confidence * 100)}%</span>
              </div>
              <Progress value={tam.confidence * 100} className="h-1 mt-1" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Methodology</p>
              <p className="text-xs text-muted-foreground mt-0.5">{tam.methodology}</p>
            </div>
            {tam.sources.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tam.sources.slice(0, 3).map((url, i) => {
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
          </CardContent>
        </Card>

        {/* Market Timing */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Market Timing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`text-3xl font-bold ${timingColor(assessment.marketTimingScore)}`}>
                {assessment.marketTimingScore}
              </div>
              <div>
                <p className={`text-sm font-semibold ${timingColor(assessment.marketTimingScore)}`}>
                  {timingLabel(assessment.marketTimingScore)}
                </p>
                <p className="text-[10px] text-muted-foreground">/ 100</p>
              </div>
            </div>
            <Progress value={assessment.marketTimingScore} className="h-2" />
            <p className="text-xs text-muted-foreground">{assessment.marketTimingReasoning}</p>

            {/* Market Strengths */}
            {assessment.marketStrengths.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Market Strengths
                </p>
                <ul className="space-y-1">
                  {assessment.marketStrengths.map((s, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0 mt-0.5" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Competitive Landscape */}
      {assessment.competitorMap.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Swords className="h-4 w-4" />
            Competitive Landscape ({assessment.competitorMap.length} competitors)
          </h3>
          <div className="space-y-3">
            {assessment.competitorMap.map((comp, i) => (
              <CompetitorRow key={i} competitor={comp} />
            ))}
          </div>
        </div>
      )}

      {/* Adjacent Markets */}
      {assessment.adjacentMarkets.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4" />
              Adjacent Markets for Expansion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {assessment.adjacentMarkets.map((market, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  <Globe className="h-3 w-3 mr-1" />
                  {market}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Market Red Flags */}
      {assessment.marketRedFlags.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Market Red Flags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assessment.marketRedFlags.map((rf, i) => (
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
    </div>
  )
}
