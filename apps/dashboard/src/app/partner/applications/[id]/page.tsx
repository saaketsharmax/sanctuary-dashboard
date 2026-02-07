'use client'

import { use, useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, Loader2, RefreshCw } from 'lucide-react'
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
import { MemoViewer } from '@/components/memo'
import {
  getApplicationWithFounders,
  getInterviewByApplicationId,
  getInterviewMessages,
  getAssessmentByApplicationId,
  getProposedProgrammeByApplicationId,
  getProgrammeWeeks,
} from '@/lib/mock-data/onboarding'
import type { StartupMemo } from '@/types'

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

  // Memo state
  const [memo, setMemo] = useState<StartupMemo | null>(null)
  const [memoLoading, setMemoLoading] = useState(false)
  const [memoError, setMemoError] = useState<string | null>(null)

  // Fetch existing memo on load
  useEffect(() => {
    async function fetchMemo() {
      try {
        const res = await fetch(`/api/applications/${id}/memo`)
        const data = await res.json()
        if (data.memo) {
          setMemo(data.memo)
        }
      } catch (err) {
        // Memo not available yet, that's ok
      }
    }
    fetchMemo()
  }, [id])

  // Generate memo
  const handleGenerateMemo = async (force = false) => {
    setMemoLoading(true)
    setMemoError(null)
    try {
      const res = await fetch(`/api/applications/${id}/memo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force }),
      })
      const data = await res.json()
      if (data.memo) {
        setMemo(data.memo)
        toast.success('Memo generated successfully')
      } else if (data.error) {
        setMemoError(data.error)
        toast.error('Failed to generate memo')
      }
    } catch (err) {
      setMemoError('Failed to generate memo')
      toast.error('Failed to generate memo')
    } finally {
      setMemoLoading(false)
    }
  }

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
  const hasMemo = memo !== null

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
          <TabsTrigger value="memo">
            <FileText className="h-4 w-4 mr-1" />
            Memo
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

        <TabsContent value="memo">
          {memoLoading ? (
            <Card>
              <CardContent className="py-12 flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground">Generating startup memo...</p>
                <p className="text-xs text-muted-foreground">This may take a few moments</p>
              </CardContent>
            </Card>
          ) : hasMemo ? (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerateMemo(true)}
                  disabled={memoLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Regenerate
                </Button>
              </div>
              <MemoViewer memo={memo} />
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 flex flex-col items-center justify-center gap-4">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <div className="text-center">
                  <h3 className="font-semibold">No Memo Generated Yet</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Generate a comprehensive startup memo that synthesizes the application,
                    interview, assessment, and research data.
                  </p>
                </div>
                <Button onClick={() => handleGenerateMemo()} disabled={memoLoading}>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Memo
                </Button>
                {memoError && (
                  <p className="text-sm text-red-500">{memoError}</p>
                )}
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
