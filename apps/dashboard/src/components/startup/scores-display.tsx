'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
  Button,
  cn,
} from '@sanctuary/ui'
import { TrendingUp, Users, Lightbulb, Target, Zap } from 'lucide-react'
import type { Startup } from '@/types'
import { getRiskInfo } from '@/types'

interface ScoresDisplayProps {
  startup: Startup
  onUpdateScores?: () => void
}

interface ScoreCardProps {
  label: string
  score: number | null
  icon: React.ReactNode
  description: string
}

function ScoreCard({ label, score, icon, description }: ScoreCardProps) {
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
        <span className={cn('text-lg font-bold', hasScore ? getScoreColor(scoreValue) : 'text-muted-foreground')}>
          {hasScore ? scoreValue : '—'}
        </span>
      </div>
      <Progress
        value={scoreValue}
        className={cn('h-2', hasScore ? getProgressColor(scoreValue) : '')}
      />
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}

export function ScoresDisplay({ startup, onUpdateScores }: ScoresDisplayProps) {
  const riskInfo = getRiskInfo(startup.riskLevel)
  const overallScore = startup.overallScore ?? 0
  const hasOverallScore = startup.overallScore !== null

  const getOverallColor = (value: number) => {
    if (value >= 75) return 'text-green-600 border-green-200 bg-green-50'
    if (value >= 50) return 'text-blue-600 border-blue-200 bg-blue-50'
    if (value >= 25) return 'text-yellow-600 border-yellow-200 bg-yellow-50'
    return 'text-red-600 border-red-200 bg-red-50'
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Investment Readiness</CardTitle>
        <Button variant="outline" size="sm" onClick={onUpdateScores}>
          Update Scores
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
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
          <div className={cn('text-4xl font-bold', !hasOverallScore && 'text-muted-foreground')}>
            {hasOverallScore ? overallScore : '—'}
          </div>
          <div className="text-xs mt-1">out of 100</div>
        </div>

        {/* Individual Scores */}
        <div className="space-y-4">
          <ScoreCard
            label="Founder"
            score={startup.founderScore}
            icon={<Users className="h-4 w-4" />}
            description="Team quality, skills, commitment"
          />
          <ScoreCard
            label="Problem"
            score={startup.problemScore}
            icon={<Lightbulb className="h-4 w-4" />}
            description="Problem validity, market size"
          />
          <ScoreCard
            label="User Value"
            score={startup.userValueScore}
            icon={<Target className="h-4 w-4" />}
            description="Product-market fit indicators"
          />
          <ScoreCard
            label="Execution"
            score={startup.executionScore}
            icon={<Zap className="h-4 w-4" />}
            description="Speed and quality of execution"
          />
        </div>

        {/* Score Weights Info */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Weighted: Founder 25% • Problem 25% • User Value 30% • Execution 20%
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
