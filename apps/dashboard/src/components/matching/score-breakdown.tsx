'use client'

import { Progress, cn } from '@sanctuary/ui'
import type { MatchReasoning } from '@/types'

interface ScoreBreakdownProps {
  reasoning: MatchReasoning
  showLabels?: boolean
}

const dimensions = [
  { key: 'problemShape', label: 'Problem Shape', weight: 40, description: 'Same type of challenge?' },
  { key: 'constraintAlignment', label: 'Constraint Alignment', weight: 25, description: 'Do constraints match?' },
  { key: 'stageRelevance', label: 'Stage Relevance', weight: 20, description: 'Applicable to current stage?' },
  { key: 'experienceDepth', label: 'Experience Depth', weight: 10, description: 'How deeply engaged?' },
  { key: 'recency', label: 'Recency', weight: 5, description: 'How current is the insight?' },
] as const

function getScoreColor(score: number) {
  if (score >= 80) return 'text-success'
  if (score >= 60) return 'text-info'
  if (score >= 40) return 'text-warning'
  return 'text-destructive'
}

function getProgressColor(score: number) {
  if (score >= 80) return '[&>div]:bg-success'
  if (score >= 60) return '[&>div]:bg-info'
  if (score >= 40) return '[&>div]:bg-warning'
  return '[&>div]:bg-destructive'
}

export function ScoreBreakdown({ reasoning, showLabels = true }: ScoreBreakdownProps) {
  return (
    <div className="space-y-4">
      {dimensions.map((dim) => {
        const score = reasoning.scores[dim.key]
        return (
          <div key={dim.key} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{dim.label}</span>
                <span className="text-xs text-muted-foreground">({dim.weight}%)</span>
              </div>
              <span className={cn('text-sm font-bold', getScoreColor(score))}>
                {score}
              </span>
            </div>
            <Progress
              value={score}
              className={cn('h-2', getProgressColor(score))}
            />
            {showLabels && (
              <p className="text-xs text-muted-foreground">{dim.description}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
