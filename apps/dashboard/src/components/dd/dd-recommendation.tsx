'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from '@sanctuary/ui'
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react'
import type { DDRecommendation } from '@/lib/ai/types/due-diligence'

const verdictConfig: Record<string, {
  label: string
  icon: typeof CheckCircle2
  className: string
  badgeClass: string
}> = {
  invest: {
    label: 'Invest',
    icon: CheckCircle2,
    className: 'border-success/30 bg-success/10',
    badgeClass: 'bg-success/15 text-success',
  },
  conditional_invest: {
    label: 'Conditional Invest',
    icon: AlertTriangle,
    className: 'border-warning/30 bg-warning/10',
    badgeClass: 'bg-warning/15 text-warning',
  },
  needs_more_info: {
    label: 'Needs More Info',
    icon: HelpCircle,
    className: 'border-info/30 bg-info/10',
    badgeClass: 'bg-info/15 text-info',
  },
  pass: {
    label: 'Pass',
    icon: XCircle,
    className: 'border-destructive/30 bg-destructive/10',
    badgeClass: 'bg-destructive/15 text-destructive',
  },
}

interface DDRecommendationProps {
  recommendation: DDRecommendation
}

export function DDRecommendationBanner({ recommendation }: DDRecommendationProps) {
  const config = verdictConfig[recommendation.verdict] || verdictConfig.needs_more_info
  const Icon = config.icon

  return (
    <Card className={config.className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Icon className="h-5 w-5" />
          Recommendation
          <Badge className={config.badgeClass}>{config.label}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm">{recommendation.reasoning}</p>

        {recommendation.conditions.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Conditions</p>
            <ul className="space-y-1">
              {recommendation.conditions.map((condition, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span className="text-muted-foreground mt-0.5">-</span>
                  {condition}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
