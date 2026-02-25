'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Clock,
  MessageSquare,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { INTERVIEW_SECTIONS } from '@/types'

export default function FounderInterviewPage() {
  const params = useParams()
  const router = useRouter()
  const applicationId = params.applicationId as string

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
        <h1 className="text-3xl font-bold mb-2">AI Interview</h1>
        <p className="text-lg text-muted-foreground">
          Complete a brief AI-powered interview to help us understand you and your startup better.
        </p>
      </div>

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

          {/* Section Details */}
          <div className="space-y-3">
            <h4 className="font-medium">Interview Sections</h4>
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
