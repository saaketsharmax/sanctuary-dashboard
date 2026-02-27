'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Textarea,
  Label,
} from '@sanctuary/ui'
import { useState } from 'react'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'

interface ReviewDecisionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  application: {
    companyName: string
    companyOneLiner?: string | null
  }
  decision: 'approve' | 'reject'
  onConfirm: (notes?: string) => void
}

export function ReviewDecisionModal({
  open,
  onOpenChange,
  application,
  decision,
  onConfirm,
}: ReviewDecisionModalProps) {
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isApprove = decision === 'approve'

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      await onConfirm(notes.trim() || undefined)
      setNotes('')
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      if (!newOpen) {
        setNotes('')
      }
      onOpenChange(newOpen)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isApprove ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-success" />
                Approve Application
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Decline Application
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isApprove
              ? `You are about to approve ${application.companyName}'s application to Sanctuary.`
              : `You are about to decline ${application.companyName}'s application to Sanctuary.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-3 bg-muted rounded-lg">
            <div className="font-medium">{application.companyName}</div>
            {application.companyOneLiner && (
              <div className="text-sm text-muted-foreground mt-1">
                {application.companyOneLiner}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder={
                isApprove
                  ? 'Add any notes about this approval...'
                  : 'Reason for declining (will help inform feedback)...'
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {!isApprove && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive">
                This action will decline the application. The founders will be notified of the
                decision.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant={isApprove ? 'default' : 'destructive'}
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Processing...'
              : isApprove
                ? 'Confirm Approval'
                : 'Confirm Decline'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
