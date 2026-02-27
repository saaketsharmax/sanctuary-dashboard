'use client'

import { Button } from '@/components/ui/button'
import { Check, X, Send, MessageSquare } from 'lucide-react'
import type { MatchStatus } from '@/types'

interface MatchActionsProps {
  status: MatchStatus
  onApprove?: () => void
  onReject?: () => void
  onSendIntro?: () => void
  onRecordFeedback?: () => void
}

export function MatchActions({
  status,
  onApprove,
  onReject,
  onSendIntro,
  onRecordFeedback,
}: MatchActionsProps) {
  if (status === 'pending') {
    return (
      <div className="flex items-center gap-2">
        <Button variant="default" className="gap-2" onClick={onApprove}>
          <Check className="h-4 w-4" />
          Approve
        </Button>
        <Button variant="outline" className="gap-2" onClick={onReject}>
          <X className="h-4 w-4" />
          Reject
        </Button>
      </div>
    )
  }

  if (status === 'approved') {
    return (
      <Button variant="default" className="gap-2" onClick={onSendIntro}>
        <Send className="h-4 w-4" />
        Send Introduction
      </Button>
    )
  }

  if (status === 'intro_sent') {
    return (
      <Button variant="outline" className="gap-2" onClick={onRecordFeedback}>
        <MessageSquare className="h-4 w-4" />
        Record Feedback
      </Button>
    )
  }

  if (status === 'completed') {
    return (
      <div className="text-sm text-muted-foreground">
        Feedback recorded
      </div>
    )
  }

  if (status === 'rejected') {
    return (
      <div className="text-sm text-muted-foreground">
        Match rejected
      </div>
    )
  }

  return null
}
