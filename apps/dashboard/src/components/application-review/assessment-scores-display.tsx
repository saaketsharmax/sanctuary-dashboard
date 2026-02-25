'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Progress,
  cn,
} from '@sanctuary/ui'
import { TrendingUp, Users, Lightbulb, Target, Zap, CheckCircle2, AlertCircle } from 'lucide-react'
import type { Assessment } from '@/types'
import { getRecommendationInfo } from '@/types'

interface AssessmentScoresDisplayProps {
  assessment: Assessment
}

interface ScoreRowProps {
  label: string
  score: number | null
  reasoning: string | null
  icon: React.ReactNode
}

function ScoreRow({ label, score, reasoning, icon }: ScoreRowProps) {
  const scoreValue = score ?? 0
  const hasScore = score !== null

  const getScoreColor = (value: number) => {
    if (value >= 75) return 'text-green-600'
    if (value >= 50) return 'text-blue-600'
    if (value >= 25) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getProgressColor = (value: number) => {
    if (value >= 75) return '[&>div]:bg-green-500'
    if (value >= 50) return '[&>div]:bg-blue-500'
    if (value >= 25) return '[&>div]:bg-yellow-500'
    return '[&>div]:bg-red-500'
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-muted-foreground">{icon}</div>
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span
          className={cn(
            'text-lg font-bold',
            hasScore ? getScoreColor(scoreValue) : 'text-muted-foreground'
          )}
        >
          {hasScore ? scoreValue : '-'}
        </span>
      </div>
      <Progress
        value={scoreValue}
        className={cn('h-2', hasScore ? getProgressColor(scoreValue) : '')}
      />
      {reasoning && (
        <p className="text-xs text-muted-foreground leading-relaxed">{reasoning}</p>
      )}
    </div>
  )
}

export function AssessmentScoresDisplay({ assessment }: AssessmentScoresDisplayProps) {
  const recommendationInfo = getRecommendationInfo(assessment.recommendation)
  const overallScore = assessment.overallScore ?? 0
  const hasOverallScore = assessment.overallScore !== null

  const getOverallColor = (value: number) => {
    if (value >= 75) return 'text-green-600 border-green-200 bg-green-50'
    if (value >= 50) return 'text-blue-600 border-blue-200 bg-blue-50'
    if (value >= 25) return 'text-yellow-600 border-yellow-200 bg-yellow-50'
    return 'text-red-600 border-red-200 bg-red-50'
  }

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'strong_accept':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'accept':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'conditional':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'waitlist':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'decline':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>AI Assessment</span>
          <Badge className={cn('capitalize', getRecommendationColor(assessment.recommendation))}>
            {assessment.recommendation.replace(/_/g, ' ')}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {assessment.oneLineSummary && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm italic">"{assessment.oneLineSummary}"</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            className={cn(
              'rounded-lg border-2 p-4 text-center',
              hasOverallScore ? getOverallColor(overallScore) : 'border-gray-200 bg-gray-50'
            )}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm font-medium">Overall Score</span>
            </div>
            <div
              className={cn(
                'text-4xl font-bold',
                !hasOverallScore && 'text-muted-foreground'
              )}
            >
              {hasOverallScore ? overallScore : '-'}
            </div>
            <div className="text-xs mt-1">out of 100</div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Confidence:</span>
              <span className="font-semibold">
                {assessment.recommendationConfidence !== null
                  ? `${Math.round(assessment.recommendationConfidence * 100)}%`
                  : '-'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Generated:</span>
              <span>{new Date(assessment.generatedAt).toLocaleDateString()}</span>
            </div>
            {assessment.fundraisingTimeline && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Fundraising:</span>
                <span>{assessment.fundraisingTimeline}</span>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t space-y-6">
          <ScoreRow
            label="Founder"
            score={assessment.founderScore}
            reasoning={assessment.founderReasoning}
            icon={<Users className="h-4 w-4" />}
          />
          <ScoreRow
            label="Problem"
            score={assessment.problemScore}
            reasoning={assessment.problemReasoning}
            icon={<Lightbulb className="h-4 w-4" />}
          />
          <ScoreRow
            label="User Value"
            score={assessment.userValueScore}
            reasoning={assessment.userValueReasoning}
            icon={<Target className="h-4 w-4" />}
          />
          <ScoreRow
            label="Execution"
            score={assessment.executionScore}
            reasoning={assessment.executionReasoning}
            icon={<Zap className="h-4 w-4" />}
          />
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Weighted: Founder 25% | Problem 25% | User Value 30% | Execution 20%
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
