'use client'

import {
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Toaster,
} from '@sanctuary/ui'
import { use, useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, FileText, Loader2, RefreshCw, Brain, Search, Shield,
  GraduationCap, MessageSquareText, CheckCircle2, XCircle, Clock,
  Target, Users, TrendingUp, AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  ReviewDecisionModal,
} from '@/components/application-review'
import { MemoViewer } from '@/components/memo'
import { Textarea, Label, Progress } from '@sanctuary/ui'
import type { StartupMemo, InterviewMessage } from '@/types'
import type { Programme } from '@/lib/ai/types/programme'

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
  draft: 'bg-muted text-foreground',
  submitted: 'bg-info/15 text-info',
  interview_scheduled: 'bg-purple-100 text-purple-700',
  interview_completed: 'bg-indigo-100 text-indigo-700',
  assessment_generated: 'bg-warning/15 text-warning',
  under_review: 'bg-warning/15 text-warning',
  approved: 'bg-success/15 text-success',
  rejected: 'bg-destructive/15 text-destructive',
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

  // Handle decision — uses the decision API with auto startup creation on approve
  const handleConfirmDecision = async (notes?: string) => {
    try {
      const decision = decisionType === 'approve' ? 'approved' : 'rejected'
      const res = await fetch(`/api/applications/${id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, notes }),
      })
      const data = await res.json()
      if (data.success) {
        const msg = decisionType === 'approve'
          ? `${application?.companyName} approved! Startup created with $50k cash + $50k credits.`
          : `${application?.companyName} has been declined.`
        toast.success(msg)
        fetchApplication()
      } else {
        toast.error(data.error || 'Failed to update application')
      }
    } catch (error) {
      toast.error('Failed to update application')
    }
  }

  // Programme state
  const [programme, setProgramme] = useState<Programme | null>(null)
  const [programmeLoading, setProgrammeLoading] = useState(false)

  const handleGenerateProgramme = async () => {
    setProgrammeLoading(true)
    try {
      const res = await fetch(`/api/applications/${id}/programme`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setProgramme(data.programme)
        toast.success('Programme generated successfully')
      } else {
        toast.error(data.error || 'Failed to generate programme')
      }
    } catch {
      toast.error('Failed to generate programme')
    } finally {
      setProgrammeLoading(false)
    }
  }

  // Fetch programme if application is approved
  useEffect(() => {
    if (application?.status === 'approved') {
      fetch(`/api/applications/${id}/programme`)
        .then((r) => r.json())
        .then((data) => { if (data.programme) setProgramme(data.programme) })
        .catch(() => {})
    }
  }, [application?.status, id])

  // Feedback state
  const [feedbackNotes, setFeedbackNotes] = useState('')
  const [feedbackDimensions, setFeedbackDimensions] = useState<Record<string, number>>({})
  const [feedbackAgreement, setFeedbackAgreement] = useState<'agree' | 'partially_agree' | 'disagree'>('agree')
  const [submittingFeedback, setSubmittingFeedback] = useState(false)

  const handleSubmitFeedback = async () => {
    setSubmittingFeedback(true)
    try {
      const res = await fetch(`/api/applications/${id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overall_agreement: feedbackAgreement,
          notes: feedbackNotes,
          dimension_feedback: Object.entries(feedbackDimensions).map(([dim, score]) => ({
            dimension: dim,
            aiScore: application?.aiAssessment?.[dim + 'Score'] || 0,
            partnerScore: score,
          })),
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Feedback submitted — this improves DD accuracy over time')
        setFeedbackNotes('')
        setFeedbackDimensions({})
      } else {
        toast.error(data.error || 'Failed to submit feedback')
      }
    } catch {
      toast.error('Failed to submit feedback')
    } finally {
      setSubmittingFeedback(false)
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
  const hasDDCompleted = (application as any).ddStatus === 'completed'

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
                <Badge className={statusColors[application.status] || 'bg-muted text-foreground'}>
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
          <TabsTrigger value="dd" asChild>
            <Link href={`/partner/applications/${id}/dd`} className="inline-flex items-center">
              <Shield className="h-4 w-4 mr-1" />
              Due Diligence {hasDDCompleted && <Badge variant="secondary" className="ml-1">✓</Badge>}
            </Link>
          </TabsTrigger>
          {application.status === 'approved' && (
            <TabsTrigger value="programme">
              <GraduationCap className="h-4 w-4 mr-1" />
              Programme {programme && <Badge variant="secondary" className="ml-1">✓</Badge>}
            </TabsTrigger>
          )}
          <TabsTrigger value="feedback">
            <MessageSquareText className="h-4 w-4 mr-1" />
            Feedback
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
          {hasAssessment && application.aiAssessment ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Scores</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <p className="text-4xl font-bold text-primary">
                      {application.aiAssessment?.overallScore ?? 'N/A'}
                    </p>
                    <p className="text-sm text-muted-foreground">Overall Score</p>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Founder', score: application.aiAssessment?.founderScore ?? 0 },
                      { label: 'Problem', score: application.aiAssessment?.problemScore ?? 0 },
                      { label: 'User Value', score: application.aiAssessment?.userValueScore ?? 0 },
                      { label: 'Execution', score: application.aiAssessment?.executionScore ?? 0 },
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
                  {application.aiAssessment?.recommendation && (
                    <div className="pt-4 border-t">
                      <Badge
                        className={
                          application.aiAssessment.recommendation === 'accept'
                            ? 'bg-success/15 text-success'
                            : application.aiAssessment.recommendation === 'decline'
                            ? 'bg-destructive/15 text-destructive'
                            : 'bg-warning/15 text-warning'
                        }
                      >
                        {application.aiAssessment.recommendation}
                      </Badge>
                      <span className="text-sm text-muted-foreground ml-2">
                        {application.aiAssessment?.recommendationConfidence ?? 0}% confidence
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {application.aiAssessment?.oneLineSummary && (
                    <div>
                      <h4 className="font-medium text-sm">Summary</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {application.aiAssessment.oneLineSummary}
                      </p>
                    </div>
                  )}
                  {application.aiAssessment?.keyStrengths?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-success">Key Strengths</h4>
                      <ul className="text-sm mt-1 space-y-1">
                        {application.aiAssessment.keyStrengths.map((s: any, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-success">•</span>
                            <span>{s.title || s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {application.aiAssessment?.keyRisks?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-destructive">Key Risks</h4>
                      <ul className="text-sm mt-1 space-y-1">
                        {application.aiAssessment.keyRisks.map((r: any, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-destructive">•</span>
                            <span>{r.title || r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {application.aiAssessment?.criticalQuestions?.length > 0 && (
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
        {/* Programme Tab */}
        <TabsContent value="programme">
          {programme ? (
            <div className="space-y-6">
              {/* Programme Header */}
              <Card>
                <CardContent className="py-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">90-Day Programme</h3>
                      <p className="text-sm text-muted-foreground">
                        Week {programme.currentWeek} of 12 — {programme.riskLevel === 'on_track' ? 'On Track' : programme.riskLevel === 'at_risk' ? 'At Risk' : 'Behind'}
                      </p>
                    </div>
                    <Badge className={
                      programme.riskLevel === 'on_track' ? 'bg-success/15 text-success' :
                      programme.riskLevel === 'at_risk' ? 'bg-warning/15 text-warning' :
                      'bg-destructive/15 text-destructive'
                    }>
                      {programme.riskLevel.replace('_', ' ')}
                    </Badge>
                  </div>
                  <Progress value={programme.overallProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">{programme.overallProgress}% complete</p>
                </CardContent>
              </Card>

              {/* Phases */}
              {programme.phases.map((phase, phaseIdx) => (
                <Card key={phaseIdx}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {phaseIdx + 1}
                      </div>
                      {phase.name}
                      <span className="text-sm font-normal text-muted-foreground">Weeks {phase.weeks}</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{phase.focus}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {phase.milestones.map((milestone) => (
                      <div
                        key={milestone.id}
                        className={`p-4 rounded-lg border ${
                          milestone.status === 'completed' ? 'border-success bg-success/10' :
                          milestone.status === 'active' ? 'border-info bg-info/10' :
                          milestone.status === 'overdue' ? 'border-destructive bg-destructive/10' :
                          'border-muted'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {milestone.status === 'completed' ? (
                              <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                            ) : milestone.status === 'overdue' ? (
                              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                            ) : (
                              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                            )}
                            <div>
                              <p className="font-medium">{milestone.title}</p>
                              <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                              {milestone.kpiTargets.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {milestone.kpiTargets.map((kpi, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      <Target className="h-3 w-3 mr-1" />
                                      {kpi.metric}: {kpi.target} {kpi.unit}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs whitespace-nowrap">
                            Week {milestone.weekNumber}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}

              {/* Mentor Matching Triggers */}
              {programme.mentorMatchingTriggers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Mentor Matching Triggers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {programme.mentorMatchingTriggers.map((trigger, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium">Milestone: {trigger.milestone}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {trigger.expertise.map((exp) => (
                                <Badge key={exp} variant="secondary" className="text-xs">{exp}</Badge>
                              ))}
                            </div>
                          </div>
                          <Badge className={
                            trigger.urgency === 'immediate' ? 'bg-destructive/15 text-destructive' :
                            trigger.urgency === 'this_week' ? 'bg-warning/15 text-warning' :
                            'bg-info/15 text-info'
                          }>
                            {trigger.urgency.replace('_', ' ')}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 flex flex-col items-center justify-center gap-4">
                <GraduationCap className="h-12 w-12 text-muted-foreground" />
                <div className="text-center">
                  <h3 className="font-semibold">No Programme Generated Yet</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Generate a tailored 90-day accelerator programme with milestones, KPIs, and mentor matching.
                  </p>
                </div>
                <Button onClick={handleGenerateProgramme} disabled={programmeLoading}>
                  {programmeLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <GraduationCap className="h-4 w-4 mr-2" />
                  )}
                  Generate Programme
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquareText className="h-5 w-5" />
                  Assessment Feedback
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Your feedback improves the AI&apos;s due diligence accuracy over time through the Calibration Engine.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Overall Agreement */}
                <div className="space-y-2">
                  <Label>Do you agree with the AI assessment?</Label>
                  <div className="flex gap-2">
                    {(['agree', 'partially_agree', 'disagree'] as const).map((val) => (
                      <Button
                        key={val}
                        variant={feedbackAgreement === val ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFeedbackAgreement(val)}
                      >
                        {val === 'agree' ? 'Agree' : val === 'partially_agree' ? 'Partially Agree' : 'Disagree'}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Dimension Score Adjustments */}
                {application.aiAssessment && (
                  <div className="space-y-4">
                    <Label>Score Adjustments (slide to your assessment)</Label>
                    {[
                      { key: 'founder', label: 'Founder', score: application.aiAssessment.founderScore },
                      { key: 'problem', label: 'Problem', score: application.aiAssessment.problemScore },
                      { key: 'userValue', label: 'User Value', score: application.aiAssessment.userValueScore },
                      { key: 'execution', label: 'Execution', score: application.aiAssessment.executionScore },
                    ].map((dim) => (
                      <div key={dim.key} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{dim.label}</span>
                          <span className="text-muted-foreground">
                            AI: {dim.score ?? 'N/A'} | You: {feedbackDimensions[dim.key] ?? dim.score ?? 'N/A'}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={feedbackDimensions[dim.key] ?? dim.score ?? 50}
                          onChange={(e) => setFeedbackDimensions((prev) => ({
                            ...prev,
                            [dim.key]: parseInt(e.target.value),
                          }))}
                          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="feedback-notes">Notes</Label>
                  <Textarea
                    id="feedback-notes"
                    placeholder="What did the AI get right or wrong? What signals did it miss?"
                    value={feedbackNotes}
                    onChange={(e) => setFeedbackNotes(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button
                  onClick={handleSubmitFeedback}
                  disabled={submittingFeedback}
                  className="w-full"
                >
                  {submittingFeedback ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <TrendingUp className="h-4 w-4 mr-2" />
                  )}
                  Submit Feedback
                </Button>
              </CardContent>
            </Card>
          </div>
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
