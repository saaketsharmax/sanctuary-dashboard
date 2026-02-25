'use client'

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
} from '@sanctuary/ui'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useInterviewStore } from '@/lib/stores/interview-store'
import {
  CheckCircle2,
  Clock,
  MessageSquare,
  ArrowRight,
  Calendar,
  Mail,
  AlertCircle,
  Loader2,
} from 'lucide-react'

interface Application {
  id: string
  companyName: string
}

export default function InterviewCompletePage() {
  const params = useParams()
  const router = useRouter()
  const applicationId = params.applicationId as string
  const { currentInterview, messages, resetInterview } = useInterviewStore()

  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch application data
  useEffect(() => {
    async function fetchApplication() {
      try {
        const response = await fetch(`/api/applications/${applicationId}`)
        if (!response.ok) {
          throw new Error('Application not found')
        }
        const data = await response.json()
        if (data.success && data.application) {
          setApplication(data.application)
        } else {
          throw new Error('Application not found')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load application')
      } finally {
        setLoading(false)
      }
    }

    fetchApplication()
  }, [applicationId])

  // Calculate interview stats
  const duration = currentInterview?.durationMinutes || 0
  const messageCount = messages.length
  const userMessageCount = messages.filter((m) => m.role === 'user').length

  // Clean up interview state on unmount
  useEffect(() => {
    return () => {
      // Optionally reset interview state when leaving the complete page
      // resetInterview()
    }
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (error || !application) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Application Not Found</h1>
        <p className="text-muted-foreground mb-4">
          We couldn&apos;t find an application with this ID.
        </p>
        <Button onClick={() => router.push('/apply')}>Submit New Application</Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Success Header */}
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        <Badge variant="secondary" className="mb-4">
          Interview Complete
        </Badge>
        <h1 className="text-3xl font-bold mb-2">Thank You!</h1>
        <p className="text-lg text-muted-foreground">
          Your interview for {application.companyName} has been completed successfully.
        </p>
      </div>

      {/* Interview Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Interview Summary</CardTitle>
          <CardDescription>Here&apos;s a quick overview of your interview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Clock className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <p className="text-2xl font-bold">{duration}</p>
              <p className="text-xs text-muted-foreground">Minutes</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <MessageSquare className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <p className="text-2xl font-bold">{messageCount}</p>
              <p className="text-xs text-muted-foreground">Messages</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <CheckCircle2 className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <p className="text-2xl font-bold">5/5</p>
              <p className="text-xs text-muted-foreground">Sections</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">What Happens Next?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary">1</span>
            </div>
            <div>
              <p className="font-medium">AI Assessment Generation</p>
              <p className="text-sm text-muted-foreground">
                Our AI will analyze your interview and generate a comprehensive assessment of your
                startup and founder profile.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary">2</span>
            </div>
            <div>
              <p className="font-medium">Human Review</p>
              <p className="text-sm text-muted-foreground">
                A Sanctuary partner will review your application and AI assessment to make a final
                decision.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary">3</span>
            </div>
            <div>
              <p className="font-medium">Decision Notification</p>
              <p className="text-sm text-muted-foreground">
                You&apos;ll receive our decision within 48 hours via email.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>Expected response by {getExpectedResponseDate()}</span>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center gap-4 pt-4">
        <Button
          variant="outline"
          onClick={() => {
            resetInterview()
            router.push('/founder/dashboard')
          }}
        >
          View Application Status
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>

        <p className="text-xs text-muted-foreground text-center flex items-center gap-1">
          <Mail className="h-3 w-3" />
          Questions? Contact us at{' '}
          <a href="mailto:apply@sanctuary.vc" className="underline">
            apply@sanctuary.vc
          </a>
        </p>
      </div>
    </div>
  )
}

function getExpectedResponseDate(): string {
  const date = new Date()
  date.setDate(date.getDate() + 2) // 48 hours
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}
