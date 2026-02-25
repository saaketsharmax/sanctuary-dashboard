'use client'
import { Badge } from '@sanctuary/ui'

const verdictConfig: Record<string, { label: string; className: string }> = {
  confirmed: { label: 'Confirmed', className: 'bg-green-100 text-green-700' },
  partially_confirmed: { label: 'Partial', className: 'bg-blue-100 text-blue-700' },
  unconfirmed: { label: 'Unconfirmed', className: 'bg-gray-100 text-gray-600' },
  disputed: { label: 'Disputed', className: 'bg-yellow-100 text-yellow-700' },
  refuted: { label: 'Refuted', className: 'bg-red-100 text-red-700' },
}

const statusConfig: Record<string, { label: string; className: string }> = {
  unverified: { label: 'Unverified', className: 'bg-gray-100 text-gray-600' },
  ai_verified: { label: 'AI Verified', className: 'bg-blue-100 text-blue-700' },
  mentor_verified: { label: 'Mentor Verified', className: 'bg-purple-100 text-purple-700' },
  disputed: { label: 'Disputed', className: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Confirmed', className: 'bg-green-100 text-green-700' },
  refuted: { label: 'Refuted', className: 'bg-red-100 text-red-700' },
  unverifiable: { label: 'Unverifiable', className: 'bg-gray-100 text-gray-500' },
}

const priorityConfig: Record<string, { label: string; className: string }> = {
  critical: { label: 'Critical', className: 'bg-red-100 text-red-700' },
  high: { label: 'High', className: 'bg-orange-100 text-orange-700' },
  medium: { label: 'Medium', className: 'bg-blue-100 text-blue-700' },
  low: { label: 'Low', className: 'bg-gray-100 text-gray-600' },
}

export function VerificationVerdictBadge({ verdict }: { verdict: string }) {
  const config = verdictConfig[verdict] || { label: verdict, className: 'bg-gray-100 text-gray-600' }
  return <Badge className={config.className}>{config.label}</Badge>
}

export function ClaimStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-600' }
  return <Badge className={config.className}>{config.label}</Badge>
}

export function ClaimPriorityBadge({ priority }: { priority: string }) {
  const config = priorityConfig[priority] || { label: priority, className: 'bg-gray-100 text-gray-600' }
  return <Badge variant="outline" className={config.className}>{config.label}</Badge>
}
