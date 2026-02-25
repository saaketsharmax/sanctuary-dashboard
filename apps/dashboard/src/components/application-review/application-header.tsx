'use client'

import {
  Card,
  CardContent,
  Button,
  Badge,
} from '@sanctuary/ui'
import { Check, X, Users, DollarSign, Calendar } from 'lucide-react'
import type { ApplicationWithFounders, Assessment } from '@/types'
import { getApplicationStageInfo, formatCurrency } from '@/types'

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-700',
  interview_scheduled: 'bg-purple-100 text-purple-700',
  interview_completed: 'bg-indigo-100 text-indigo-700',
  assessment_generated: 'bg-yellow-100 text-yellow-700',
  under_review: 'bg-orange-100 text-orange-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-gray-100 text-gray-700',
}

interface ApplicationHeaderProps {
  application: ApplicationWithFounders
  assessment?: Assessment | null
  onApprove: () => void
  onReject: () => void
}

export function ApplicationHeader({
  application,
  assessment,
  onApprove,
  onReject,
}: ApplicationHeaderProps) {
  const stageInfo = getApplicationStageInfo(application.stage)
  const isReviewable = ['assessment_generated', 'under_review', 'interview_completed'].includes(
    application.status
  )
  const isDecided = ['approved', 'rejected'].includes(application.status)

  return (
    <Card>
      <CardContent className="py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">{application.companyName}</h1>
              <Badge className={statusColors[application.status]}>
                {application.status.replace(/_/g, ' ')}
              </Badge>
              <Badge variant="outline">{stageInfo.label}</Badge>
            </div>
            {application.companyOneLiner && (
              <p className="text-muted-foreground">{application.companyOneLiner}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              {application.userCount !== null && application.userCount > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{application.userCount} users</span>
                </div>
              )}
              {application.mrr !== null && application.mrr > 0 && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>{formatCurrency(application.mrr * 100)} MRR</span>
                </div>
              )}
              {application.submittedAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Submitted {new Date(application.submittedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {isReviewable && !isDecided && (
            <div className="flex items-center gap-2">
              <Button variant="default" onClick={onApprove}>
                <Check className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button variant="destructive" onClick={onReject}>
                <X className="h-4 w-4 mr-1" />
                Decline
              </Button>
            </div>
          )}

          {isDecided && (
            <Badge
              className={application.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
            >
              {application.status === 'approved' ? 'Approved' : 'Declined'}
            </Badge>
          )}
        </div>

        {assessment && (
          <div className="mt-4 pt-4 border-t flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Overall Score:</span>
              <span className="font-semibold">{assessment.overallScore ?? '—'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Recommendation:</span>
              <Badge variant="outline" className="capitalize">
                {assessment.recommendation.replace(/_/g, ' ')}
              </Badge>
            </div>
            {assessment.recommendationConfidence !== null && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Confidence:</span>
                <span className="font-semibold">
                  {Math.round(assessment.recommendationConfidence * 100)}%
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
