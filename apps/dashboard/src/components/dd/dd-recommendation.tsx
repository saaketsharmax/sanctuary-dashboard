'use client'

import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
    className: 'border-green-200 bg-green-50',
    badgeClass: 'bg-green-100 text-green-800',
  },
  conditional_invest: {
    label: 'Conditional Invest',
    icon: AlertTriangle,
    className: 'border-yellow-200 bg-yellow-50',
    badgeClass: 'bg-yellow-100 text-yellow-800',
  },
  needs_more_info: {
    label: 'Needs More Info',
    icon: HelpCircle,
    className: 'border-blue-200 bg-blue-50',
    badgeClass: 'bg-blue-100 text-blue-800',
  },
  pass: {
    label: 'Pass',
    icon: XCircle,
    className: 'border-red-200 bg-red-50',
    badgeClass: 'bg-red-100 text-red-800',
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
