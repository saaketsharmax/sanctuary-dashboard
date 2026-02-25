'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Activity } from 'lucide-react'

interface StartupMetricsPanelProps {
  startupId: string
}

export function StartupMetricsPanel({ startupId }: StartupMetricsPanelProps) {
  // No mock data - show empty state until real metrics are available
  return (
    <Card>
      <CardContent className="py-8 text-center">
        <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No metrics data available</p>
        <p className="text-sm text-muted-foreground mt-2">
          Metrics will appear here once the startup starts tracking data.
        </p>
      </CardContent>
    </Card>
  )
}
