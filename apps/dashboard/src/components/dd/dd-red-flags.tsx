'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from '@sanctuary/ui'
import type { DDRedFlag } from '@/lib/ai/types/due-diligence'
import { DD_CATEGORY_LABELS } from '@/lib/ai/types/due-diligence'

interface DDRedFlagsProps {
  redFlags: DDRedFlag[]
}

const severityConfig: Record<string, { className: string }> = {
  critical: { className: 'bg-destructive/15 text-destructive' },
  high: { className: 'bg-warning/15 text-warning' },
  medium: { className: 'bg-warning/15 text-warning' },
}

export function DDRedFlags({ redFlags }: DDRedFlagsProps) {
  if (redFlags.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Red Flags</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No red flags identified.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Red Flags</CardTitle>
          <Badge variant="destructive">{redFlags.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {redFlags.map((flag, idx) => (
          <div
            key={idx}
            className="p-3 rounded-lg border border-destructive/30 bg-destructive/5 space-y-1"
          >
            <div className="flex items-center gap-2">
              <Badge className={severityConfig[flag.severity]?.className || ''}>
                {flag.severity}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {DD_CATEGORY_LABELS[flag.category] || flag.category}
              </Badge>
            </div>
            <p className="text-sm font-medium">{flag.claimText}</p>
            <p className="text-xs text-muted-foreground">{flag.reason}</p>
            <p className="text-xs text-destructive">{flag.evidence}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
