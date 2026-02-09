'use client'

import { use, useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, Loader2, RefreshCw, Brain, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import {
  ReviewDecisionModal,
} from '@/components/application-review'
import { MemoViewer } from '@/components/memo'
import type { StartupMemo, InterviewMessage } from '@/types'

interface ApplicationDetailPageProps {
  params: Promise<{ id: string }>
}

interface Founder {
  name: string
  email: string
  role?: string
  isLead: boolean
  linkedin?: string
  yearsExperience?: number
  hasStartedBefore: boolean
}

interface Application {
  id: string
  status: string
  companyName: string
  companyOneLiner: string
  companyWebsite: string | null
  companyDescription: string | null
  problemDescription: string
  targetCustomer: string
  solutionDescription: string
  stage: string
  userCount: number
  mrr: number
  biggestChallenge: string
  whySanctuary: string
  whatTheyWant: string
  founders: Founder[]
  submittedAt: string | null
  createdAt: string
  interviewTranscript: InterviewMessage[]
  interviewCompletedAt: string | null
  aiAssessment: any
  aiScore: number | null
  assessmentCompletedAt: string | null
  proposedProgramme: any
  researchData: any
  researchCompletedAt: string | null
  memoData: StartupMemo | null
  memoGeneratedAt: string | null
  applicationMetadata: any
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-700',
  interview_scheduled: 'bg-purple-100 text-purple-700',
  interview_completed: 'bg-indigo-100 text-indigo-700',
  assessment_generated: 'bg-yellow-100 text-yellow-700',
  under_review: 'bg-orange-100 text-orange-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

export default function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  const { id } = use(params)

  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMock, setIsMock] = useState(false)
  const [notFoundError, setNotFoundError] = useState(false)

  // Modal states
  const [decisionModalOpen, setDecisionModalOpen] = useState(false)
  const [decisionType, setDecisionType] = useState<'approve' | 'reject'>('approve')

  // Action loading states
  const [assessmentLoading, setAssessmentLoading] = useState(false)
  const [researchLoading, setResearchLoading] = useState(false)
  const [memoLoading, setMemoLoading] = useState(false)

  // Fetch application data
  const fetchApplication = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/partner/applications/${id}`)
      if (res.status === 404) {
        setNotFoundError(true)
        return
      }
      const data = await res.json()
      if (data.success) {
        setApplication(data.application)
        setIsMock(data.isMock)
      }
    } catch (error) {
      console.error('Failed to fetch application:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplication()
  }, [id])

  // Generate assessment
  const handleGenerateAssessment = async () => {
    setAssessmentLoading(true)
    try {
      const res = await fetch(`/api/applications/${id}/assess`, {
        method: 'POST',
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Assessment generated successfully')
        fetchApplication() // Refresh data
      } else {
        toast.error(data.error || 'Failed to generate assessment')
      }
    } catch (error) {
      toast.error('Failed to generate assessment')
    } finally {
      setAssessmentLoading(false)
    }
  }

  // Run research
  const handleRunResearch = async () => {
    setResearchLoading(true)
    try {
      const res = await fetch(`/api/applications/${id}/research`, {
        method: 'POST',
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Research completed successfully')
        fetchApplication()
      } else {
        toast.error(data.error || 'Failed to run research')
      }
    } catch (error) {
      toast.error('Failed to run research')
    } finally {
      setResearchLoading(false)
    }
  }

  // Generate memo
  const handleGenerateMemo = async (force = false) => {
    setMemoLoading(true)
    try {
      const res = await fetch(`/api/applications/${id}/memo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force }),
      })
      const data = await res.json()
      if (data.memo) {
        toast.success('Memo generated successfully')
        fetchApplication()
      } else if (data.error) {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error('Failed to generate memo')
    } finally {
      setMemoLoading(false)
    }
  }

  // Handle decision
  const handleConfirmDecision = async (notes?: string) => {
    try {
      const res = await fetch(`/api/partner/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: decisionType, notes }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`${application?.companyName} has been ${decisionType === 'approve' ? 'approved' : 'declined'}`)
        fetchApplication()
      } else {
        toast.error(data.error || 'Failed to update application')
      }
    } catch (error) {
      toast.error('Failed to update application')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (notFoundError || !application) {
    notFound()
  }

  const hasInterview = application.interviewTranscript && application.interviewTranscript.length > 0
  const hasAssessment = application.aiAssessment !== null
  const hasResearch = application.researchData !== null
  const hasMemo = application.memoData !== null

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
      <Card>
        <CardContent className="py-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{application.companyName}</h1>
                <Badge className={statusColors[application.status] || 'bg-gray-100 text-gray-700'}>
                  {application.status.replace(/_/g, ' ')}
                </Badge>
                {isMock && <Badge variant="outline">Demo Mode</Badge>}
              </div>
              <p className="text-muted-foreground mt-1">{application.companyOneLiner}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span>Stage: {application.stage?.replace('_', ' ')}</span>
                <span>Users: {application.userCount}</span>
                <span>MRR: ${application.mrr}</span>
                {application.aiScore && (
                  <span className="font-medium text-primary">
                    AI Score: {Math.round(application.aiScore * 100)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {!['approved', 'rejected'].includes(application.status) && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDecisionType('reject')
                      setDecisionModalOpen(true)
                    }}
                  >
                    Decline
                  </Button>
                  <Button
                    onClick={() => {
                      setDecisionType('approve')
                      setDecisionModalOpen(true)
                    }}
                  >
                    Approve
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="interview">
            Interview {hasInterview && <Badge variant="secondary" className="ml-1">✓</Badge>}
          </TabsTrigger>
          <TabsTrigger value="assessment">
            Assessment {hasAssessment && <Badge variant="secondary" className="ml-1">✓</Badge>}
          </TabsTrigger>
          <TabsTrigger value="memo">
            <FileText className="h-4 w-4 mr-1" />
            Memo {hasMemo && <Badge variant="secondary" className="ml-1">✓</Badge>}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Application Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Problem</h4>
                    <p className="mt-1">{application.problemDescription}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Target Customer</h4>
                    <p className="mt-1">{application.targetCustomer}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Solution</h4>
                    <p className="mt-1">{application.solutionDescription}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Biggest Challenge</h4>
                    <p className="mt-1">{application.biggestChallenge}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Why Sanctuary?</h4>
                    <p className="mt-1">{application.whySanctuary}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">What They Want</h4>
                    <p className="mt-1">{application.whatTheyWant}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Founders</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {application.founders.map((founder, idx) => (
                    <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{founder.name}</span>
                        {founder.isLead && <Badge variant="secondary">Lead</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{founder.role || 'Founder'}</p>
                      {founder.yearsExperience && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {founder.yearsExperience} years experience
                        </p>
                      )}
                      {founder.hasStartedBefore && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          Repeat Founder
                        </Badge>
                      )}
                      {founder.linkedin && (
                        <a
                          href={founder.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline block mt-1"
                        >
                          LinkedIn →
                        </a>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {application.companyWebsite && (
                <Card>
                  <CardContent className="py-4">
                    <a
                      href={application.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Visit Website →
                    </a>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Interview Tab */}
        <TabsContent value="interview">
          {hasInterview ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Interview Transcript</CardTitle>
                  <Badge variant="outline">
                    {application.interviewTranscript.length} messages
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {application.interviewTranscript.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${
                        msg.role === 'assistant'
                          ? 'bg-muted/50'
                          : 'bg-primary/10 ml-8'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {msg.role === 'assistant' ? 'AI' : 'Founder'}
                        </Badge>
                        {msg.section && (
                          <span className="text-xs text-muted-foreground">
                            {msg.section.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p>No interview completed yet.</p>
                <p className="text-sm mt-2">
                  The founder will complete an AI interview after submitting their application.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Assessment Tab */}
        <TabsContent value="assessment">
          {hasAssessment ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Scores</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <p className="text-4xl font-bold text-primary">
                      {application.aiAssessment.overallScore}
                    </p>
                    <p className="text-sm text-muted-foreground">Overall Score</p>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Founder', score: application.aiAssessment.founderScore },
                      { label: 'Problem', score: application.aiAssessment.problemScore },
                      { label: 'User Value', score: application.aiAssessment.userValueScore },
                      { label: 'Execution', score: application.aiAssessment.executionScore },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{item.label}</span>
                          <span className="font-medium">{item.score}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${item.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t">
                    <Badge
                      className={
                        application.aiAssessment.recommendation === 'accept'
                          ? 'bg-green-100 text-green-700'
                          : application.aiAssessment.recommendation === 'decline'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }
                    >
                      {application.aiAssessment.recommendation}
                    </Badge>
                    <span className="text-sm text-muted-foreground ml-2">
                      {application.aiAssessment.recommendationConfidence}% confidence
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm">Summary</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {application.aiAssessment.oneLineSummary}
                    </p>
                  </div>
                  {application.aiAssessment.keyStrengths?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-green-600">Key Strengths</h4>
                      <ul className="text-sm mt-1 space-y-1">
                        {application.aiAssessment.keyStrengths.map((s: any, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-green-600">•</span>
                            <span>{s.title || s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {application.aiAssessment.keyRisks?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-red-600">Key Risks</h4>
                      <ul className="text-sm mt-1 space-y-1">
                        {application.aiAssessment.keyRisks.map((r: any, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-red-600">•</span>
                            <span>{r.title || r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {application.aiAssessment.criticalQuestions?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm">Critical Questions</h4>
                      <ul className="text-sm mt-1 space-y-1">
                        {application.aiAssessment.criticalQuestions.map((q: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span>?</span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 flex flex-col items-center justify-center gap-4">
                <Brain className="h-12 w-12 text-muted-foreground" />
                <div className="text-center">
                  <h3 className="font-semibold">No Assessment Generated Yet</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Generate an AI assessment to analyze the interview and score the startup.
                  </p>
                </div>
                <Button
                  onClick={handleGenerateAssessment}
                  disabled={assessmentLoading || !hasInterview}
                >
                  {assessmentLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Brain className="h-4 w-4 mr-2" />
                  )}
                  Generate Assessment
                </Button>
                {!hasInterview && (
                  <p className="text-xs text-muted-foreground">
                    Interview must be completed first
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Memo Tab */}
        <TabsContent value="memo">
          {memoLoading ? (
            <Card>
              <CardContent className="py-12 flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground">Generating startup memo...</p>
                <p className="text-xs text-muted-foreground">This may take a few moments</p>
              </CardContent>
            </Card>
          ) : hasMemo && application.memoData ? (
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
              <MemoViewer memo={application.memoData} />
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 flex flex-col items-center justify-center gap-4">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <div className="text-center">
                  <h3 className="font-semibold">No Memo Generated Yet</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Generate a comprehensive startup memo that synthesizes all available data.
                  </p>
                </div>
                <Button
                  onClick={() => handleGenerateMemo()}
                  disabled={memoLoading || !hasInterview}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Memo
                </Button>
                {!hasInterview && (
                  <p className="text-xs text-muted-foreground">
                    Interview must be completed first
                  </p>
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
        application={{
          companyName: application.companyName,
          companyOneLiner: application.companyOneLiner,
        }}
        decision={decisionType}
        onConfirm={handleConfirmDecision}
      />

      <Toaster />
    </div>
  )
}
