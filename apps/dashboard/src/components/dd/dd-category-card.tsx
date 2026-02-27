'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
  Badge,
} from '@sanctuary/ui'
import type { DDCategoryScore } from '@/lib/ai/types/due-diligence'
import { DD_CATEGORY_LABELS } from '@/lib/ai/types/due-diligence'

interface DDCategoryCardProps {
  score: DDCategoryScore
}

export function DDCategoryCard({ score }: DDCategoryCardProps) {
  const label = DD_CATEGORY_LABELS[score.category] || score.category
  const confidencePercent = Math.round(score.categoryConfidence * 100)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{score.totalClaims} claims</span>
          <span className="font-medium">{confidencePercent}%</span>
        </div>
        <Progress value={confidencePercent} className="h-1.5" />

        <div className="flex flex-wrap gap-1.5">
          {score.confirmedClaims > 0 && (
            <Badge variant="outline" className="bg-success/10 text-success text-xs">
              {score.confirmedClaims} confirmed
            </Badge>
          )}
          {score.disputedClaims > 0 && (
            <Badge variant="outline" className="bg-warning/10 text-warning text-xs">
              {score.disputedClaims} disputed
            </Badge>
          )}
          {score.refutedClaims > 0 && (
            <Badge variant="outline" className="bg-destructive/10 text-destructive text-xs">
              {score.refutedClaims} refuted
            </Badge>
          )}
          {score.unverifiedClaims > 0 && (
            <Badge variant="outline" className="text-xs">
              {score.unverifiedClaims} unverified
            </Badge>
          )}
        </div>

        {score.flaggedIssues.length > 0 && (
          <div className="pt-1 border-t">
            {score.flaggedIssues.map((issue, idx) => (
              <p key={idx} className="text-xs text-destructive">{issue}</p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
