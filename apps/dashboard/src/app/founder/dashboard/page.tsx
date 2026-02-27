'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Building2,
  FileText,
  ArrowRight,
  CheckCircle2,
  Clock,
  Search,
  Scale,
  DollarSign,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'

interface Application {
  id: string
  company_name: string
  status: string
  submitted_at: string | null
  interview_completed_at: string | null
  assessment_completed_at: string | null
  review_decision: string | null
  reviewed_at: string | null
  created_at: string
}

const STATUS_STEPS = [
  { key: 'applied', label: 'Applied', icon: FileText },
  { key: 'interviewed', label: 'Interviewed', icon: CheckCircle2 },
  { key: 'under_review', label: 'Under Review', icon: Search },
  { key: 'decision', label: 'Decision', icon: Scale },
]

function getStepIndex(app: Application): number {
  if (app.review_decision || app.status === 'approved' || app.status === 'rejected') return 3
  if (app.assessment_completed_at || app.status === 'assessment_generated') return 2
  if (app.interview_completed_at || app.status === 'interview_completed') return 1
  return 0
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'approved':
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Accepted</Badge>
    case 'rejected':
      return <Badge variant="secondary">Not Selected</Badge>
    case 'submitted':
      return <Badge variant="outline">Submitted</Badge>
    case 'interview_completed':
      return <Badge variant="outline">Interview Complete</Badge>
    case 'assessment_generated':
      return <Badge variant="outline">Under Review</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

interface InvestmentSummary {
  cashRemaining: number
  creditsRemaining: number
  cashAmountCents: number
  creditsAmountCents: number
  cashUsed: number
  creditsUsed: number
}

function formatCents(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

export default function FounderDashboard() {
  const [applications, setApplications] = useState<Application[]>([])
  const [investment, setInvestment] = useState<InvestmentSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [appRes, invRes] = await Promise.all([
          fetch('/api/applications'),
          fetch('/api/founder/investment'),
        ])
        if (appRes.ok) {
          const data = await appRes.json()
          setApplications(data.applications || [])
        }
        if (invRes.ok) {
          const data = await invRes.json()
          if (data.investment) {
            setInvestment(data.investment)
          }
        }
      } catch (err) {
        console.error('Failed to fetch data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    )
  }

  // No applications — show apply CTA
  if (applications.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome to Sanctuary</h1>
          <p className="text-muted-foreground mt-1">Your startup journey starts here</p>
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Ready to Apply?</CardTitle>
            <CardDescription>
              Tell us about your startup and go through our AI-powered interview process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/founder/apply">
              <Button>
                Apply Now
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/founder/company">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="pt-6 text-center">
                <Building2 className="h-8 w-8 mx-auto text-primary mb-2" />
                <p className="font-medium">Company Profile</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/founder/documents">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="pt-6 text-center">
                <FileText className="h-8 w-8 mx-auto text-primary mb-2" />
                <p className="font-medium">Documents</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    )
  }

  // Has applications — show status for most recent
  const app = applications[0]
  const stepIndex = getStepIndex(app)
  const isApproved = app.status === 'approved' || app.review_decision === 'approve'
  const isRejected = app.status === 'rejected' || app.review_decision === 'reject'
  const hasDecision = isApproved || isRejected

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Your Dashboard</h1>
        <p className="text-muted-foreground mt-1">Track your application progress</p>
      </div>

      {/* Application Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{app.company_name}</CardTitle>
              <CardDescription>
                Applied{' '}
                {new Date(app.submitted_at || app.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </CardDescription>
            </div>
            {getStatusBadge(app.status)}
          </div>
        </CardHeader>
        <CardContent>
          {/* 4-Step Progress Indicator */}
          <div className="flex items-center justify-between">
            {STATUS_STEPS.map((step, i) => {
              const Icon = step.icon
              const isCompleted = i <= stepIndex
              const isCurrent = i === stepIndex

              return (
                <div key={step.key} className="flex flex-col items-center flex-1">
                  <div className="flex items-center w-full">
                    {i > 0 && (
                      <div
                        className={`h-0.5 flex-1 ${i <= stepIndex ? 'bg-primary' : 'bg-muted'}`}
                      />
                    )}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCompleted
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      } ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 ${i < stepIndex ? 'bg-primary' : 'bg-muted'}`}
                      />
                    )}
                  </div>
                  <span
                    className={`text-xs mt-2 ${
                      isCompleted ? 'text-primary font-medium' : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Decision Card */}
      {hasDecision && (
        <Card
          className={
            isApproved
              ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
              : 'border-muted'
          }
        >
          <CardContent className="pt-6">
            {isApproved ? (
              <div className="text-center">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold mb-1">Congratulations!</h3>
                <p className="text-muted-foreground">
                  Your application for {app.company_name} has been accepted into the Sanctuary
                  program.
                </p>
              </div>
            ) : (
              <div className="text-center">
                <h3 className="text-xl font-bold mb-1">Thank You for Applying</h3>
                <p className="text-muted-foreground">
                  After careful review, we&apos;re unable to offer a place in this cohort. We
                  encourage you to reapply in the future.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Waiting Card (no decision yet) */}
      {!hasDecision && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="font-medium">Application Under Review</p>
                <p className="text-sm text-muted-foreground">
                  Our team is reviewing your application. You&apos;ll see updates here as your
                  application progresses.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Investment Summary (approved founders only) */}
      {isApproved && investment && (
        <Link href="/founder/investment">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Investment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Cash Remaining</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCents(investment.cashRemaining)}
                  </p>
                  <Progress
                    value={investment.cashAmountCents > 0
                      ? Math.round((investment.cashUsed / investment.cashAmountCents) * 100)
                      : 0}
                    className="h-1.5"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Credits Remaining</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatCents(investment.creditsRemaining)}
                  </p>
                  <Progress
                    value={investment.creditsAmountCents > 0
                      ? Math.round((investment.creditsUsed / investment.creditsAmountCents) * 100)
                      : 0}
                    className="h-1.5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/founder/documents">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="pt-6 text-center">
              <FileText className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="font-medium">Documents</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/founder/company">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="pt-6 text-center">
              <Building2 className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="font-medium">Company Profile</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
