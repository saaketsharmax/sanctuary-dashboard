'use client'
import { Badge } from '@sanctuary/ui'

const verdictConfig: Record<string, { label: string; className: string }> = {
  confirmed: { label: 'Confirmed', className: 'bg-success/15 text-success' },
  partially_confirmed: { label: 'Partial', className: 'bg-info/15 text-info' },
  unconfirmed: { label: 'Unconfirmed', className: 'bg-muted text-muted-foreground' },
  disputed: { label: 'Disputed', className: 'bg-warning/15 text-warning' },
  refuted: { label: 'Refuted', className: 'bg-destructive/15 text-destructive' },
}

const statusConfig: Record<string, { label: string; className: string }> = {
  unverified: { label: 'Unverified', className: 'bg-muted text-muted-foreground' },
  ai_verified: { label: 'AI Verified', className: 'bg-info/15 text-info' },
  mentor_verified: { label: 'Mentor Verified', className: 'bg-purple-100 text-purple-700' },
  disputed: { label: 'Disputed', className: 'bg-warning/15 text-warning' },
  confirmed: { label: 'Confirmed', className: 'bg-success/15 text-success' },
  refuted: { label: 'Refuted', className: 'bg-destructive/15 text-destructive' },
  unverifiable: { label: 'Unverifiable', className: 'bg-muted text-muted-foreground' },
}

const priorityConfig: Record<string, { label: string; className: string }> = {
  critical: { label: 'Critical', className: 'bg-destructive/15 text-destructive' },
  high: { label: 'High', className: 'bg-warning/15 text-warning' },
  medium: { label: 'Medium', className: 'bg-info/15 text-info' },
  low: { label: 'Low', className: 'bg-muted text-muted-foreground' },
}

export function VerificationVerdictBadge({ verdict }: { verdict: string }) {
  const config = verdictConfig[verdict] || { label: verdict, className: 'bg-muted text-muted-foreground' }
  return <Badge className={config.className}>{config.label}</Badge>
}

export function ClaimStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, className: 'bg-muted text-muted-foreground' }
  return <Badge className={config.className}>{config.label}</Badge>
}

export function ClaimPriorityBadge({ priority }: { priority: string }) {
  const config = priorityConfig[priority] || { label: priority, className: 'bg-muted text-muted-foreground' }
  return <Badge variant="outline" className={config.className}>{config.label}</Badge>
}
