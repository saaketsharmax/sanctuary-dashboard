'use client'
import { Badge } from '@/components/ui/badge'

const verdictConfig: Record<string, { label: string; className: string }> = {
  confirmed: { label: 'Confirmed', className: 'bg-green-100 text-green-600' },
  partially_confirmed: { label: 'Partial', className: 'bg-blue-100 text-blue-600' },
  unconfirmed: { label: 'Unconfirmed', className: 'bg-muted text-muted-foreground' },
  disputed: { label: 'Disputed', className: 'bg-yellow-100 text-yellow-600' },
  refuted: { label: 'Refuted', className: 'bg-red-100 text-red-600' },
}

const statusConfig: Record<string, { label: string; className: string }> = {
  unverified: { label: 'Unverified', className: 'bg-muted text-muted-foreground' },
  ai_verified: { label: 'AI Verified', className: 'bg-blue-100 text-blue-600' },
  mentor_verified: { label: 'Mentor Verified', className: 'bg-purple-100 text-purple-700' },
  disputed: { label: 'Disputed', className: 'bg-yellow-100 text-yellow-600' },
  confirmed: { label: 'Confirmed', className: 'bg-green-100 text-green-600' },
  refuted: { label: 'Refuted', className: 'bg-red-100 text-red-600' },
  unverifiable: { label: 'Unverifiable', className: 'bg-muted text-muted-foreground' },
}

const priorityConfig: Record<string, { label: string; className: string }> = {
  critical: { label: 'Critical', className: 'bg-red-100 text-red-600' },
  high: { label: 'High', className: 'bg-yellow-100 text-yellow-600' },
  medium: { label: 'Medium', className: 'bg-blue-100 text-blue-600' },
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
