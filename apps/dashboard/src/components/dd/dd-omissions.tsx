'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from '@sanctuary/ui'
import { EyeOff } from 'lucide-react'
import type { DDOmission } from '@/lib/ai/types/due-diligence'
import { DD_CATEGORY_LABELS } from '@/lib/ai/types/due-diligence'

const severityColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-blue-100 text-blue-700',
  low: 'bg-gray-100 text-gray-600',
}

interface DDOmissionsProps {
  omissions: DDOmission[]
}

export function DDOmissions({ omissions }: DDOmissionsProps) {
  if (omissions.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <EyeOff className="h-4 w-4" />
          Missing Information ({omissions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {omissions.map((o, idx) => (
            <div key={idx} className="flex items-start gap-3 p-2 border rounded">
              <Badge className={`${severityColors[o.severity] || severityColors.medium} shrink-0`}>
                {o.severity}
              </Badge>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{o.expectedInfo}</p>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {DD_CATEGORY_LABELS[o.category as keyof typeof DD_CATEGORY_LABELS] || o.category}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{o.reasoning}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
