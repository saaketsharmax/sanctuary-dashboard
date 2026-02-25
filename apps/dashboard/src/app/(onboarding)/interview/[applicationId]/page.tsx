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
import { InterviewProgress } from '@/components/onboarding/interview'
import { INTERVIEW_SECTIONS } from '@/types'
import {
  Clock,
  MessageSquare,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react'

interface Application {
  id: string
  companyName: string
  companyOneLiner: string
  stage: string
}

export default function InterviewWaitingRoom() {
  const params = useParams()
  const router = useRouter()
  const applicationId = params.applicationId as string

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Loading application...</p>
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

  const handleStartInterview = () => {
    router.push(`/interview/${applicationId}/start`)
  }

  const totalDuration = INTERVIEW_SECTIONS.reduce((acc, section) => {
    const match = section.duration.match(/(\d+)-?(\d+)?/)
    if (match) {
      const max = match[2] ? parseInt(match[2]) : parseInt(match[1])
      return acc + max
    }
    return acc
  }, 0)

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <Badge variant="secondary" className="mb-4">
          Application #{applicationId.slice(-6).toUpperCase()}
        </Badge>
        <h1 className="text-3xl font-bold mb-2">Interview Preparation</h1>
        <p className="text-lg text-muted-foreground">
          Welcome, {application.companyName}! You&apos;re about to begin your Sanctuary interview.
        </p>
      </div>

      {/* Application Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Application</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Company:</span>
              <p className="font-medium">{application.companyName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Stage:</span>
              <p className="font-medium capitalize">{application.stage?.replace('_', ' ')}</p>
            </div>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">One-liner:</span>
            <p className="text-sm">{application.companyOneLiner}</p>
          </div>
        </CardContent>
      </Card>

      {/* Interview Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Interview Overview
          </CardTitle>
          <CardDescription>
            A conversational deep-dive into you and your startup
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Duration */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Estimated Duration</p>
              <p className="text-sm text-muted-foreground">{totalDuration - 10}-{totalDuration} minutes</p>
            </div>
          </div>

          {/* Sections */}
          <div>
            <h4 className="font-medium mb-4">Interview Sections</h4>
            <InterviewProgress currentSection="founder_dna" />
          </div>

          {/* Section Details */}
          <div className="space-y-3">
            {INTERVIEW_SECTIONS.map((section, index) => (
              <div
                key={section.value}
                className="flex items-start gap-3 p-3 rounded-lg border"
              >
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{section.label}</p>
                    <span className="text-xs text-muted-foreground">{section.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Tips for Success
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {[
              'Be specific and use concrete examples',
              'Share real numbers when discussing traction',
              'Be honest about challenges and uncertainties',
              'Take your time - you can pause anytime',
              'Speak authentically about your journey',
            ].map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Start Button */}
      <div className="flex flex-col items-center gap-4 pt-4">
        <Button size="lg" onClick={handleStartInterview} className="px-8">
          Start Interview
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
        <p className="text-sm text-muted-foreground text-center">
          Your progress will be saved automatically.
          <br />
          You can pause and resume at any time.
        </p>
      </div>
    </div>
  )
}
