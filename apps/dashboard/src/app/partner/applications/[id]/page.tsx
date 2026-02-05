'use client'

import { use, useState } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import {
  ApplicationHeader,
  ApplicationInfoCard,
  FoundersPreview,
  InterviewTranscriptViewer,
  AssessmentScoresDisplay,
  AssessmentAnalysis,
  ProposedProgrammePreview,
  ReviewDecisionModal,
} from '@/components/application-review'
import {
  getApplicationWithFounders,
  getInterviewByApplicationId,
  getInterviewMessages,
  getAssessmentByApplicationId,
  getProposedProgrammeByApplicationId,
  getProgrammeWeeks,
} from '@/lib/mock-data/onboarding'

interface ApplicationDetailPageProps {
  params: Promise<{ id: string }>
}

export default function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  const { id } = use(params)

  // Fetch all data
  const application = getApplicationWithFounders(id)
  const interview = getInterviewByApplicationId(id)
  const messages = interview ? getInterviewMessages(interview.id) : []
  const assessment = getAssessmentByApplicationId(id)
  const programme = getProposedProgrammeByApplicationId(id)
  const weeks = programme ? getProgrammeWeeks(programme.id) : []

  // Modal states
  const [decisionModalOpen, setDecisionModalOpen] = useState(false)
  const [decisionType, setDecisionType] = useState<'approve' | 'reject'>('approve')

  if (!application) {
    notFound()
  }

  const handleApprove = () => {
    setDecisionType('approve')
    setDecisionModalOpen(true)
  }

  const handleReject = () => {
    setDecisionType('reject')
    setDecisionModalOpen(true)
  }

  const handleConfirmDecision = (notes?: string) => {
    // In a real app, this would call an API
    if (decisionType === 'approve') {
      toast.success(`${application.companyName} has been approved`)
    } else {
      toast.success(`${application.companyName} has been declined`)
    }
    console.log('Decision:', decisionType, 'Notes:', notes)
  }

  const hasInterview = interview && messages.length > 0
  const hasAssessment = assessment !== undefined
  const hasProgramme = programme !== undefined

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link href="/partner/applications">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Applications
        </Button>
      </Link>

      {/* Application Header */}
      <ApplicationHeader
        application={application}
        assessment={assessment}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="interview" disabled={!hasInterview}>
            Interview
          </TabsTrigger>
          <TabsTrigger value="assessment" disabled={!hasAssessment}>
            Assessment
          </TabsTrigger>
          <TabsTrigger value="programme" disabled={!hasProgramme}>
            Programme
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ApplicationInfoCard application={application} />
            </div>
            <div>
              <FoundersPreview founders={application.founders} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="interview">
          {hasInterview ? (
            <InterviewTranscriptViewer
              messages={messages}
              interview={interview}
              highlights={assessment?.transcriptHighlights}
            />
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No interview data available
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="assessment">
          {hasAssessment ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AssessmentScoresDisplay assessment={assessment} />
              <AssessmentAnalysis assessment={assessment} />
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No assessment data available
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="programme">
          {hasProgramme ? (
            <ProposedProgrammePreview programme={programme} weeks={weeks} />
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No programme proposal available
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Decision Modal */}
      <ReviewDecisionModal
        open={decisionModalOpen}
        onOpenChange={setDecisionModalOpen}
        application={application}
        decision={decisionType}
        onConfirm={handleConfirmDecision}
      />

      <Toaster />
    </div>
  )
}
